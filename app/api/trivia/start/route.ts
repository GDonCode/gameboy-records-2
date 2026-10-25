// app/api/trivia/start/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { startOfLocalDay } from '@/lib/day';
import { imagesFor, pickGameQuestionIds } from '@/lib/trivia-bank';
import { TOTAL_QUESTIONS, type TriviaStartResponse } from '@/lib/trivia-types';

const MAX_GAMES_PER_DAY = 20;

export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const userId = user?.id;
  if (!user || !userId || user.role !== 'user') {
    return NextResponse.json({ error: 'Sign in to play.' }, { status: 401 });
  }

  // Daily cap on games, counted from the start of the user's local day.
  const { count, error: countError } = await supabaseAdmin
    .from('trivia_games')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('started_at', startOfLocalDay().toISOString());

  if (countError) {
    console.error('Failed to count trivia games:', countError.message);
    return NextResponse.json({ error: 'Could not start a game.' }, { status: 500 });
  }
  if ((count ?? 0) >= MAX_GAMES_PER_DAY) {
    return NextResponse.json({ error: 'Daily game limit reached. Come back tomorrow.' }, { status: 429 });
  }

  let questionIds: string[];
  try {
    questionIds = pickGameQuestionIds();
  } catch (err) {
    console.error('Failed to build trivia game:', err);
    return NextResponse.json({ error: 'Not enough questions yet.' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('trivia_games')
    .insert({ user_id: userId, question_ids: questionIds })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Failed to create trivia game:', error?.message);
    return NextResponse.json({ error: 'Could not start a game.' }, { status: 500 });
  }

  const body: TriviaStartResponse = {
    gameId: data.id as string,
    total: TOTAL_QUESTIONS,
    preload: imagesFor(questionIds),
  };
  return NextResponse.json(body);
}

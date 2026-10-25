// app/api/trivia/next/route.ts
//
// Serves the current question and starts its server-side clock. The clock is stamped once:
// calling this again for the same question (e.g. after a page refresh) returns the same
// question with the time already used, so refreshing can't buy extra seconds.
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getBankQuestion, toPublicQuestion } from '@/lib/trivia-bank';
import { locateQuestion, type TriviaDoneResponse, type TriviaNextResponse } from '@/lib/trivia-types';

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const userId = user?.id;
  if (!user || !userId || user.role !== 'user') {
    return NextResponse.json({ error: 'Sign in to play.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const gameId = body?.gameId;
  if (typeof gameId !== 'string') {
    return NextResponse.json({ error: 'gameId is required.' }, { status: 400 });
  }

  const { data: game, error } = await supabaseAdmin
    .from('trivia_games')
    .select('id, question_ids, current_index, current_question_at, score, correct_count, completed_at')
    .eq('id', gameId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load trivia game:', error.message);
    return NextResponse.json({ error: 'Could not load the game.' }, { status: 500 });
  }
  if (!game) return NextResponse.json({ error: 'Game not found.' }, { status: 404 });

  const questionIds = game.question_ids as string[];

  if (game.completed_at || game.current_index >= questionIds.length) {
    const done: TriviaDoneResponse = { done: true, score: game.score, correctCount: game.correct_count };
    return NextResponse.json(done);
  }

  const bank = getBankQuestion(questionIds[game.current_index]);
  if (!bank) {
    console.error('Trivia question missing from bank:', questionIds[game.current_index]);
    return NextResponse.json({ error: 'Question unavailable.' }, { status: 500 });
  }

  let startedAt = game.current_question_at as string | null;
  if (!startedAt) {
    const { data: stamped, error: stampError } = await supabaseAdmin
      .from('trivia_games')
      .update({ current_question_at: new Date().toISOString() })
      .eq('id', gameId)
      .eq('current_index', game.current_index)
      .is('current_question_at', null)
      .select('current_question_at')
      .maybeSingle();

    if (stampError) {
      console.error('Failed to start trivia clock:', stampError.message);
      return NextResponse.json({ error: 'Could not load the question.' }, { status: 500 });
    }

    startedAt = (stamped?.current_question_at as string | undefined) ?? null;

    if (!startedAt) {
      // A concurrent call stamped it first. Use its timestamp.
      const { data: again } = await supabaseAdmin
        .from('trivia_games')
        .select('current_question_at')
        .eq('id', gameId)
        .maybeSingle();
      startedAt = (again?.current_question_at as string | undefined) ?? new Date().toISOString();
    }
  }

  const where = locateQuestion(game.current_index);
  const response: TriviaNextResponse = {
    done: false,
    index: game.current_index,
    round: where.round,
    indexInRound: where.indexInRound,
    roundSize: where.roundSize,
    elapsedMs: Math.max(0, Date.now() - new Date(startedAt).getTime()),
    question: toPublicQuestion(bank, `${gameId}:${bank.id}`),
  };
  return NextResponse.json(response);
}

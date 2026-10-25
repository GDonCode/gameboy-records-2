// app/api/trivia/answer/route.ts
//
// Grades the current question. Timing is measured here, from the moment /next stamped the
// question, so the browser can't claim extra seconds.
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getBankQuestion, gradeChoice } from '@/lib/trivia-bank';
import {
  BASE_POINTS,
  MAX_TIME_BONUS,
  QUESTION_TIME_MS,
  type TriviaAnswerResult,
} from '@/lib/trivia-types';

const NETWORK_ALLOWANCE_MS = 400; // slack for request latency before the time bonus starts shrinking
const LATE_GRACE_MS = 2000; // an answer later than the limit plus this is treated as a timeout

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
    .select('id, question_ids, current_index, current_question_at, score, correct_count, answers, completed_at')
    .eq('id', gameId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load trivia game:', error.message);
    return NextResponse.json({ error: 'Could not save your answer.' }, { status: 500 });
  }
  if (!game) return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
  if (game.completed_at) return NextResponse.json({ error: 'Game already finished.' }, { status: 409 });
  if (!game.current_question_at) return NextResponse.json({ error: 'No active question.' }, { status: 409 });

  const questionIds = game.question_ids as string[];
  const bank = getBankQuestion(questionIds[game.current_index]);
  if (!bank) {
    console.error('Trivia question missing from bank:', questionIds[game.current_index]);
    return NextResponse.json({ error: 'Question unavailable.' }, { status: 500 });
  }

  const graded = gradeChoice(bank, `${gameId}:${bank.id}`, body?.choice);
  if (!graded.valid) return NextResponse.json({ error: 'Invalid answer.' }, { status: 400 });

  const elapsedMs = Math.max(0, Date.now() - new Date(game.current_question_at as string).getTime());
  const timedOut = elapsedMs > QUESTION_TIME_MS + LATE_GRACE_MS;
  const correct = graded.correct && !timedOut;

  let points = 0;
  if (correct) {
    const usable = Math.max(0, elapsedMs - NETWORK_ALLOWANCE_MS);
    const remaining = Math.max(0, QUESTION_TIME_MS - usable);
    points = BASE_POINTS + Math.round((MAX_TIME_BONUS * remaining) / QUESTION_TIME_MS);
  }

  const nextIndex = game.current_index + 1;
  const finished = nextIndex >= questionIds.length;
  const score = game.score + points;
  const correctCount = game.correct_count + (correct ? 1 : 0);
  const answers = [
    ...((game.answers as unknown[]) ?? []),
    { q: bank.id, correct, points, ms: elapsedMs },
  ];

  // Guarded update: only applies if this question is still the active one, so a double-tap
  // or replayed request can't score the same question twice.
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('trivia_games')
    .update({
      current_index: nextIndex,
      current_question_at: null,
      score,
      correct_count: correctCount,
      answers,
      completed_at: finished ? new Date().toISOString() : null,
    })
    .eq('id', gameId)
    .eq('user_id', userId)
    .eq('current_index', game.current_index)
    .not('current_question_at', 'is', null)
    .select('id');

  if (updateError) {
    console.error('Failed to save trivia answer:', updateError.message);
    return NextResponse.json({ error: 'Could not save your answer.' }, { status: 500 });
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: 'Question already answered.' }, { status: 409 });
  }

  const result: TriviaAnswerResult = {
    correct,
    timedOut,
    correctChoice: graded.correctChoice,
    points,
    score,
    correctCount,
    finished,
  };
  return NextResponse.json(result);
}

// app/api/guitar/score/route.ts
import { NextResponse } from 'next/server';
import { awardPoints } from '@/lib/points';
import { localDayKey, startOfLocalDay } from '@/lib/day';
import { GUITAR_MILESTONES } from '@/lib/quests';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Mirrors the tile-spawn timing in components/GuitarTiles.tsx
// (SPAWN_INTERVAL_BASE 850ms, 4ms faster per point, 400ms floor). Keep in sync.
const SPAWN_INTERVAL_BASE_MS = 850;
const SPAWN_INTERVAL_STEP_MS = 4;
const SPAWN_INTERVAL_MIN_MS = 400;

const MAX_SCORE = 500;
const MAX_RUNS_PER_DAY = 50;
const RUN_TIME_TOLERANCE = 0.9; // slack for frame timing and clock skew

/** Fastest possible run time (ms) for a given score: the sum of its tile spawn intervals. */
function minRunMs(score: number): number {
  let ms = 0;
  for (let i = 0; i < score; i++) {
    ms += Math.max(SPAWN_INTERVAL_MIN_MS, SPAWN_INTERVAL_BASE_MS - i * SPAWN_INTERVAL_STEP_MS);
  }
  return ms;
}

export async function POST(request: Request) {
  const session = await auth();

  const userId = (session?.user as any)?.id as string | undefined;
  if (!session?.user || !userId || (session.user as any).role !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const score = body?.score;

  // Scores are whole tile counts: reject strings, decimals, NaN, negatives and absurd values.
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  // A run that scored nothing carries no information, so it is neither stored nor counted.
  if (score === 0) {
    return NextResponse.json({ success: true, saved: false });
  }

  // Daily cap on saved runs, counted from the start of the user's local day.
  const { count, error: countError } = await supabaseAdmin
    .from('guitar_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfLocalDay().toISOString());

  if (countError) {
    console.error('Failed to count guitar scores:', countError.message);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  if ((count ?? 0) >= MAX_RUNS_PER_DAY) {
    return NextResponse.json({ error: 'Daily score limit reached' }, { status: 429 });
  }

  // A run can't finish faster than its tiles can spawn. The client keeps START disabled
  // while a score is saving, so the gap since the last saved score is at least the length
  // of this run. A shorter gap than the fastest possible run means the score isn't real.
  const { data: last, error: lastError } = await supabaseAdmin
    .from('guitar_scores')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) {
    console.error('Failed to read last guitar score:', lastError.message);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  if (last && Date.now() - new Date(last.created_at).getTime() < minRunMs(score) * RUN_TIME_TOLERANCE) {
    return NextResponse.json({ error: 'Score rejected' }, { status: 422 });
  }

  const { error } = await supabaseAdmin.from('guitar_scores').insert({
    user_id: userId,
    score,
  });

  if (error) {
    console.error('Failed to save guitar score:', error.message);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  // Daily milestones. The ledger's unique key makes each tier pay once per local day,
  // so a run that clears several tiers pays all of them, and replays pay nothing.
  const today = localDayKey();
  for (const m of GUITAR_MILESTONES) {
    if (score >= m.score) {
      await awardPoints(userId, m.points, 'guitar_milestone', `${today}:${m.score}`);
    }
  }

  return NextResponse.json({ success: true });
}
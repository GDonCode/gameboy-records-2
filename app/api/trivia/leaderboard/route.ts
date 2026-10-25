// app/api/trivia/leaderboard/route.ts
//
// Top 10 players by best completed game. Reads the trivia_best_scores view (one row per
// user). Names are shortened to "First L." so full names are never exposed publicly.
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { LeaderboardEntry, LeaderboardResponse } from '@/lib/trivia-types';

function publicName(displayName: string | null | undefined): string {
  const parts = (displayName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Player';
  const last = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : '';
  return `${parts[0]}${last}`;
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const { data: rows, error } = await supabaseAdmin
    .from('trivia_best_scores')
    .select('user_id, score, completed_at')
    .order('score', { ascending: false })
    .order('completed_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Failed to load trivia leaderboard:', error.message);
    return NextResponse.json({ error: 'Could not load the leaderboard.' }, { status: 500 });
  }

  const top = rows ?? [];
  const names = new Map<string, string>();
  if (top.length > 0) {
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, display_name')
      .in('id', top.map((r) => r.user_id));
    if (usersError) console.error('Failed to load leaderboard names:', usersError.message);
    for (const u of users ?? []) names.set(u.id as string, publicName(u.display_name as string | null));
  }

  const entries: LeaderboardEntry[] = [];
  top.forEach((row, i) => {
    const rank = i > 0 && row.score === entries[i - 1].score ? entries[i - 1].rank : i + 1;
    entries.push({
      rank,
      name: names.get(row.user_id as string) ?? 'Player',
      score: row.score as number,
      isYou: !!userId && row.user_id === userId,
    });
  });

  let you: LeaderboardResponse['you'] = null;
  if (userId) {
    const { data: mine } = await supabaseAdmin
      .from('trivia_best_scores')
      .select('score')
      .eq('user_id', userId)
      .maybeSingle();

    if (mine) {
      const { count } = await supabaseAdmin
        .from('trivia_best_scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', mine.score);
      you = { best: mine.score as number, rank: (count ?? 0) + 1 };
    }
  }

  const body: LeaderboardResponse = { entries, you };
  return NextResponse.json(body);
}

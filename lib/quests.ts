// lib/quests.ts
// Server-only: quest point values and per-user completion status, read from the points ledger.

import { supabaseAdmin } from '@/lib/supabase-admin';
import { localDayKey } from '@/lib/day';
import { SONG_OF_THE_DAY_POINTS, getSongOfTheDay } from '@/lib/song-of-the-day';
import type { QuestStatus } from '@/components/account/types';

export const PROFILE_PHOTO_POINTS = 10;
export const FIRST_SAVE_POINTS = 10;
export const NEWSLETTER_POINTS = 15;

// Each tier pays once per local day. Keep the scores within what the guitar route accepts.
export const GUITAR_MILESTONES = [
  { score: 10, points: 5 },
  { score: 25, points: 10 },
  { score: 50, points: 15 },
] as const;

export async function getQuestStatus(userId: string): Promise<QuestStatus[]> {
  const today = localDayKey();

  const [onceResult, dailyResult] = await Promise.all([
    supabaseAdmin
      .from('points_transactions')
      .select('reason')
      .eq('user_id', userId)
      .in('reason', ['profile_photo', 'first_save', 'newsletter_signup']),
    supabaseAdmin
      .from('points_transactions')
      .select('reason, ref_id')
      .eq('user_id', userId)
      .in('reason', ['guitar_milestone', 'song_of_the_day'])
      .like('ref_id', `${today}:%`),
  ]);

  if (onceResult.error) console.error('Failed to load quest status:', onceResult.error.message);
  if (dailyResult.error) console.error('Failed to load daily quest status:', dailyResult.error.message);

  const onceDone = new Set((onceResult.data ?? []).map((r) => r.reason));
  const dailyRows = dailyResult.data ?? [];
  const guitarDone = new Set(dailyRows.filter((r) => r.reason === 'guitar_milestone').map((r) => r.ref_id));
  const songDone = dailyRows.some((r) => r.reason === 'song_of_the_day');
  const song = getSongOfTheDay(today);

  return [
    {
      id: 'profile_photo',
      title: 'Add a profile photo',
      description: 'Upload a photo in Personal info.',
      points: PROFILE_PHOTO_POINTS,
      cadence: 'once',
      done: onceDone.has('profile_photo'),
      action: { kind: 'tab', tab: 'personal' },
      actionLabel: 'Add photo',
    },
    {
      id: 'first_save',
      title: 'Save your first item',
      description: 'Save any merch item for later.',
      points: FIRST_SAVE_POINTS,
      cadence: 'once',
      done: onceDone.has('first_save'),
      action: { kind: 'href', href: '/shop' },
      actionLabel: 'Browse shop',
    },
    {
      id: 'newsletter_signup',
      title: 'Join the newsletter',
      description: 'Get drop and show news. We use your account email.',
      points: NEWSLETTER_POINTS,
      cadence: 'once',
      done: onceDone.has('newsletter_signup'),
      action: { kind: 'subscribe' },
      actionLabel: 'Subscribe',
    },
    {
      id: 'song_of_the_day',
      title: "Stream A-Game's song of the day",
      description: `Listen to "${song.title}" on Spotify, YouTube or Apple Music. Resets daily.`,
      points: SONG_OF_THE_DAY_POINTS,
      cadence: 'daily',
      done: songDone,
      action: { kind: 'stream' },
      actionLabel: 'Listen',
    },
    ...GUITAR_MILESTONES.map(
      (m): QuestStatus => ({
        id: `guitar_${m.score}`,
        title: `Guitar Tiles: score ${m.score}`,
        description: 'Reach this score in a single run today. Resets daily.',
        points: m.points,
        cadence: 'daily',
        done: guitarDone.has(`${today}:${m.score}`),
        action: { kind: 'href', href: '/guitar' },
        actionLabel: 'Play',
      })
    ),
  ];
}
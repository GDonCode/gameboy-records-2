// lib/quests.ts
// Server-only: quest point values and per-user completion status, read from the points ledger.

import { supabaseAdmin } from '@/lib/supabase-admin';
import { localDayKey } from '@/lib/day';
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
      .select('ref_id')
      .eq('user_id', userId)
      .eq('reason', 'guitar_milestone')
      .like('ref_id', `${today}:%`),
  ]);

  if (onceResult.error) console.error('Failed to load quest status:', onceResult.error.message);
  if (dailyResult.error) console.error('Failed to load daily quest status:', dailyResult.error.message);

  const onceDone = new Set((onceResult.data ?? []).map((r) => r.reason));
  const dailyDone = new Set((dailyResult.data ?? []).map((r) => r.ref_id));

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
    ...GUITAR_MILESTONES.map(
      (m): QuestStatus => ({
        id: `guitar_${m.score}`,
        title: `Guitar Tiles: score ${m.score}`,
        description: 'Reach this score in a single run today. Resets daily.',
        points: m.points,
        cadence: 'daily',
        done: dailyDone.has(`${today}:${m.score}`),
        action: { kind: 'href', href: '/guitar' },
        actionLabel: 'Play',
      })
    ),
  ];
}
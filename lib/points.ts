// lib/points.ts
// Server-only. Points are only ever awarded through the award_points() SQL function,
// which writes a ledger row and updates users.points_balance atomically and idempotently.

import { supabaseAdmin } from '@/lib/supabase-admin';

export const SIGNUP_BONUS = 40;

/**
 * Awards points once per (userId, reason, refId). Calling it again with the same
 * arguments is a no-op. Returns the new balance, or null if the award failed.
 */
export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
  refId: string = ''
): Promise<number | null> {
  const { data, error } = await supabaseAdmin.rpc('award_points', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_ref_id: refId,
  });

  if (error) {
    console.error(`Failed to award points (${reason}):`, error.message);
    return null;
  }

  return data as number;
}
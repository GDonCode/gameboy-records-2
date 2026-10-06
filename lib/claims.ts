// lib/claims.ts
// Server-only reward claim logic. Points are lifetime progress and are never spent:
// reaching a tier unlocks it, and claiming records it once per tier.

import { supabaseAdmin } from '@/lib/supabase-admin';
import { REWARD_TIERS } from '@/lib/rewards';
import type { RewardClaim } from '@/components/account/types';

export async function getRewardClaims(userId: string): Promise<RewardClaim[]> {
  const { data, error } = await supabaseAdmin
    .from('reward_claims')
    .select('level, status')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to load reward claims:', error.message);
    return [];
  }

  return (data ?? []) as RewardClaim[];
}

export type ClaimResult =
  | { ok: true; alreadyClaimed: boolean }
  | { ok: false; status: number; error: string };

export async function claimReward(userId: string, level: number): Promise<ClaimResult> {
  const tier = REWARD_TIERS.find((t) => t.level === level);
  if (!tier) return { ok: false, status: 400, error: 'Unknown reward.' };

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('points_balance')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('Failed to read points for claim:', userError?.message);
    return { ok: false, status: 500, error: 'Could not check your points.' };
  }

  if ((user.points_balance ?? 0) < tier.points) {
    return { ok: false, status: 403, error: 'That reward is still locked.' };
  }

  const { error } = await supabaseAdmin
    .from('reward_claims')
    .insert({ user_id: userId, level: tier.level, reward_name: tier.name });

  if (error) {
    // 23505 = already claimed (the unique key also makes double-clicks safe).
    if (error.code === '23505') return { ok: true, alreadyClaimed: true };
    console.error('Failed to save reward claim:', error.message);
    return { ok: false, status: 500, error: 'Could not claim that reward.' };
  }

  return { ok: true, alreadyClaimed: false };
}
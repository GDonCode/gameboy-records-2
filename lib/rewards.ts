// lib/rewards.ts
// PLACEHOLDER reward tiers for the account "Reward Pass".
// Points are displayed from users.points_balance, but no earning or redemption
// logic exists yet — swap these tiers for the real ones once that's decided.

export interface RewardTier {
  level: number;
  points: number;
  name: string;
  description: string;
  icon: 'sticker' | 'shipping' | 'discount' | 'track' | 'tee' | 'ticket';
}

export const REWARD_TIERS: RewardTier[] = [
  { level: 1, points: 100, name: 'Sticker Pack', description: 'Gameboy Records sticker sheet', icon: 'sticker' },
  { level: 2, points: 250, name: 'Free Shipping', description: 'On your next merch order', icon: 'shipping' },
  { level: 3, points: 500, name: '$5 Off Merch', description: 'One-time discount code', icon: 'discount' },
  { level: 4, points: 1000, name: 'Exclusive Track', description: 'Unreleased song download', icon: 'track' },
  { level: 5, points: 2000, name: 'Limited Tee', description: 'Members-only drop', icon: 'tee' },
  { level: 6, points: 3500, name: 'VIP Show Pass', description: 'Priority entry at a live show', icon: 'ticket' },
];

export interface RewardProgress {
  points: number;
  unlockedCount: number;
  nextTier: RewardTier | null;
  pointsToNext: number;
  /** 0–100: how far the pass bar is filled, with tiers evenly spaced like a battle pass. */
  fillPercent: number;
}

export function getRewardProgress(rawPoints: number | null | undefined, tiers: RewardTier[] = REWARD_TIERS): RewardProgress {
  const points = Math.max(0, Math.floor(rawPoints ?? 0));
  const count = tiers.length;
  const unlockedCount = tiers.filter((t) => points >= t.points).length;
  const nextTier = tiers[unlockedCount] ?? null;
  const pointsToNext = nextTier ? nextTier.points - points : 0;

  // Each tier node sits at the centre of an equal-width column.
  // Tier k (0-based) is at (k + 0.5) / count along the bar.
  let position: number;
  if (count === 0) {
    position = 0;
  } else if (unlockedCount === 0) {
    position = (points / tiers[0].points) * 0.5;
  } else if (unlockedCount >= count) {
    position = count;
  } else {
    const prev = tiers[unlockedCount - 1].points;
    const next = tiers[unlockedCount].points;
    position = unlockedCount - 0.5 + (points - prev) / (next - prev);
  }

  const fillPercent = count === 0 ? 0 : Math.min(100, Math.max(0, (position / count) * 100));

  return { points, unlockedCount, nextTier, pointsToNext, fillPercent };
}

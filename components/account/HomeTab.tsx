// components/account/HomeTab.tsx
import { Check, Disc3, Gift, Lock, Shirt, Sticker, Tag, Ticket, Truck, type LucideIcon } from 'lucide-react';
import { REWARD_TIERS, getRewardProgress, type RewardTier } from '@/lib/rewards';
import { Panel, TabHeading } from './Panel';
import ClaimButton from './ClaimButton';
import QuestsPanel from './QuestsPanel';
import type { AccountTab, AccountUser, QuestStatus, RewardClaim } from './types';

const TIER_ICONS: Record<RewardTier['icon'], LucideIcon> = {
  sticker: Sticker,
  shipping: Truck,
  discount: Tag,
  track: Disc3,
  tee: Shirt,
  ticket: Ticket,
};

const MONO = { fontFamily: "'Poppins_semibold', sans-serif" };
const BODY = { fontFamily: "'Poppins', sans-serif" };

type TierState = 'unlocked' | 'next' | 'locked';

function RewardPass({ points, claims }: { points: number; claims: RewardClaim[] }) {
  const progress = getRewardProgress(points);

  return (
    <div className="overflow-x-auto -mx-2 px-2 pb-3">
      <div className="relative flex min-w-[780px] pt-1">
        {/* Track */}
        <div className="absolute left-0 right-0 top-[23px] h-2 rounded-full bg-[#0B0A07]/5" aria-hidden="true" />
        <div
          className="absolute left-0 top-[23px] h-2 rounded-full bg-gradient-to-r from-[#067F3A] to-[#067F3A] shadow-[0_0_12px_rgba(56,178,106,0.55)] transition-[width] duration-700"
          style={{ width: `${progress.fillPercent}%` }}
          aria-hidden="true"
        />

        {REWARD_TIERS.map((tier, i) => {
          const state: TierState =
            i < progress.unlockedCount ? 'unlocked' : i === progress.unlockedCount ? 'next' : 'locked';
          const Icon = TIER_ICONS[tier.icon];
          const claim = claims.find((c) => c.level === tier.level);

          const nodeClass =
            state === 'unlocked'
              ? 'bg-[#067F3A] border-[#067F3A] text-white'
              : state === 'next'
                ? 'bg-[#F5F5F5] border-[#067F3A] text-[#05652E] shadow-[0_0_14px_rgba(56,178,106,0.6)]'
                : 'bg-[#F5F5F5] border-[#0B0A07]/15 text-[#0B0A07]/50';

          const cardClass =
            state === 'unlocked'
              ? 'border-[#067F3A]/60 bg-[#067F3A]/10'
              : state === 'next'
                ? 'border-[#067F3A] bg-[#067F3A]/5'
                : 'border-[#0B0A07]/15 bg-white/[0.02] opacity-60';

          return (
            <div key={tier.level} className="relative z-10 flex-1 flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 text-[0.85em] ${nodeClass}`}
                style={MONO}
                aria-hidden="true"
              >
                {state === 'unlocked' ? <Check className="w-5 h-5" strokeWidth={3} /> : `LV${tier.level}`}
              </div>

              <div
                className={`relative mt-4 w-[118px] flex flex-col items-center gap-2 rounded-none border px-2 pt-4 pb-3 text-center ${cardClass}`}
              >
                {state === 'next' && (
                  <span
                    className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#067F3A] text-white text-[0.65em] tracking-[0.15em]"
                    style={MONO}
                  >
                    NEXT
                  </span>
                )}
                <span className="relative flex items-center justify-center w-11 h-11 rounded-none bg-[#F5F5F5] border border-[#0B0A07]/15">
                  <Icon
                    className={`w-5 h-5 ${state === 'locked' ? 'text-[#0B0A07]/50' : 'text-[#05652E]'}`}
                    strokeWidth={2}
                  />
                  {state === 'locked' && (
                    <Lock className="absolute -bottom-1.5 -right-1.5 w-4 h-4 p-0.5 rounded-full bg-[#F5F5F5] text-[#0B0A07]/70" />
                  )}
                </span>
                <span className="text-[0.8em] leading-tight text-[#0B0A07]" style={BODY}>
                  {tier.name}
                </span>
                <span className="text-[0.75em] text-[#0B0A07]/60" style={MONO}>
                  {tier.points.toLocaleString('en-US')} PTS
                </span>
                {state === 'unlocked' &&
                  (claim ? (
                    <span
                      className="px-2 py-0.5 rounded-full border border-[#067F3A]/60 text-[#05652E] text-[0.65em] tracking-[0.15em]"
                      style={MONO}
                    >
                      {claim.status === 'fulfilled' ? 'DELIVERED' : 'CLAIMED'}
                    </span>
                  ) : (
                    <ClaimButton level={tier.level} />
                  ))}
                <span className="sr-only">
                  {state === 'unlocked' ? 'Unlocked' : state === 'next' ? 'Next reward' : 'Locked'}. {tier.description}.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeTab({
  user,
  memberSince,
  quests,
  claims,
  onSelectTab,
}: {
  user: AccountUser;
  memberSince: string;
  quests: QuestStatus[];
  claims: RewardClaim[];
  onSelectTab: (tab: AccountTab) => void;
}) {
  const progress = getRewardProgress(user.points_balance);
  const firstName = user.display_name.split(' ')[0] || user.display_name;
  const totalTiers = REWARD_TIERS.length;
  const unclaimedCount = REWARD_TIERS.filter(
    (t) => progress.points >= t.points && !claims.some((c) => c.level === t.level)
  ).length;

  const stats = [
    { label: 'Club Points', value: progress.points.toLocaleString('en-US') },
    { label: 'Rewards unlocked', value: `${progress.unlockedCount} / ${totalTiers}` },
    { label: 'Next reward', value: progress.nextTier ? progress.nextTier.name : 'All unlocked' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <Panel className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex-1">
          <TabHeading
            tone="light"
            eyebrow="GAMEBOY REWARDS"
            title={`Welcome back, ${firstName}`}
            subtitle={`Member since ${memberSince}`}
          />
        </div>
        <dl className="lg:w-[300px] flex flex-col gap-4 rounded-none bg-[#F5F5F5] p-5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4" style={BODY}>
              <dt className="text-[0.85em] text-[#0B0A07]/70">{s.label}</dt>
              <dd className="text-[#0B0A07] text-right" style={MONO}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* Reward pass */}
      <Panel className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[1.3em] text-[#0B0A07]" style={{ fontFamily: "'Poppins_semibold', sans-serif" }}>
              Reward Pass
            </h2>
            <p className="text-[0.9em] text-[#0B0A07]/70" style={BODY}>
              Earn points on merch and level up to unlock rewards.
            </p>
          </div>
          <div className="flex flex-col md:items-end">
            <span className="text-[2.2em] leading-none text-[#05652E] drop-shadow-[0_0_12px_rgba(56,178,106,0.35)]" style={MONO}>
              {progress.points.toLocaleString('en-US')} PTS
            </span>
            <span className="text-[0.85em] text-[#0B0A07]/70 mt-1" style={BODY}>
              {progress.nextTier
                ? `${progress.pointsToNext.toLocaleString('en-US')} pts to LV${progress.nextTier.level}: ${progress.nextTier.name}`
                : 'Max level reached'}
            </span>
          </div>
        </div>

        {unclaimedCount > 0 && (
          <div
            className="flex items-center gap-3 rounded-none border border-[#067F3A] bg-[#067F3A]/10 px-4 py-3"
            role="status"
          >
            <Gift className="w-5 h-5 text-[#05652E]" />
            <span className="text-[0.9em] text-[#0B0A07]" style={BODY}>
              You have {unclaimedCount} {unclaimedCount === 1 ? 'reward' : 'rewards'} ready to claim.
            </span>
          </div>
        )}

        <RewardPass points={progress.points} claims={claims} />
      </Panel>
      
      {/* Quests */}
      <QuestsPanel quests={quests} email={user.email} onSelectTab={onSelectTab} />
      {/* How it works — PLACEHOLDER copy until the earning rules are decided */}
      <Panel className="flex flex-col gap-5">
        <h2 className="text-[1.3em] text-[#0B0A07]" style={{ fontFamily: "'Poppins_semibold', sans-serif" }}>
          How you earn points
        </h2>
        <ul className="flex flex-col gap-3 text-[#0B0A07]/80" style={BODY}>
          <li>
            <span className="text-[#05652E]">40 point welcome bonus</span> just for joining. You&apos;re already on your way.
          </li>
          <li>
            <span className="text-[#05652E]">1 point</span> for every $1 spent on Gameboy Records merch.
          </li>
          <li>
            <span className="text-[#05652E]">Bonus Club Points</span> on new drops and live show nights. Watch for them.
          </li>
          <li>
            <span className="text-[#05652E]">Claim your rewards</span> as you level up. Tap CLAIM on an unlocked reward and we&apos;ll be in touch about delivery.
          </li>
        </ul>
      </Panel>
    </div>
  );
}

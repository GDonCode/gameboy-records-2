// components/shop/ClubPointsInfo.tsx
// How Club Points work, shown on the shop page.
import Icon, { type IconName } from '@/components/icons';
import Button from '@/components/ui/Button';
import { POINTS_PER_DOLLAR, SIGNUP_BONUS_POINTS } from '@/lib/club';
import { REWARD_TIERS } from '@/lib/rewards';
import { CLUB_NAME, POINTS_NAME } from '@/lib/site';

const WAYS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'bag-shopping', title: 'Shop', text: `${POINTS_PER_DOLLAR} points for every dollar spent on apparel.` },
  { icon: 'ticket', title: 'Show up', text: 'Points with every show ticket.' },
  { icon: 'music', title: 'Listen and play', text: 'Daily quests: song of the day, trivia and more.' },
];

export default function ClubPointsInfo({ signedIn, balance }: { signedIn: boolean; balance?: number | null }) {
  const highlights = REWARD_TIERS.slice(0, 4);
  return (
    <section aria-labelledby="club-points-title" className="paper-ink text-paper border-t-4 border-paper section-y">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-gold-light m-0 mb-5">{CLUB_NAME}</p>
          <h2 id="club-points-title" className="display m-0 text-[2.25rem] sm:text-[3rem]">
            Every order earns {POINTS_NAME}.
          </h2>
          <p className="mt-6 mb-0 text-mist leading-relaxed max-w-[44ch]">
            Members collect {POINTS_NAME} on purchases, tickets and time spent with the music, then trade them for
            rewards that aren’t sold anywhere. New members start with {SIGNUP_BONUS_POINTS}.
          </p>
          <div className="mt-10">
            {signedIn ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {typeof balance === 'number' && (
                  <p className="m-0">
                    <span className="block eyebrow text-mist">Your balance</span>
                    <span className="text-[2rem] font-semibold text-gold-light">{balance.toLocaleString('en-US')}</span>
                  </p>
                )}
                <Button href="/account" variant="outline" size="lg">
                  View your rewards
                </Button>
              </div>
            ) : (
              <Button href="/account/login?mode=register" variant="light" size="lg">
                Join the {CLUB_NAME}
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 grid gap-10">
          <ul className="list-none p-0 m-0 grid gap-6 sm:grid-cols-3">
            {WAYS.map((w) => (
              <li key={w.title} className="border-t border-line-inv pt-5">
                <Icon name={w.icon} className="w-5 h-5 text-gold" />
                <h3 className="m-0 mt-4 text-[0.95rem] font-semibold uppercase tracking-[0.12em]">{w.title}</h3>
                <p className="m-0 mt-2 text-[0.9rem] text-mist leading-relaxed">{w.text}</p>
              </li>
            ))}
          </ul>
          <div>
            <h3 className="eyebrow text-mist m-0 mb-4">Rewards</h3>
            <ul className="list-none p-0 m-0 divide-y divide-line-inv border-y border-line-inv">
              {highlights.map((t) => (
                <li key={t.level} className="flex items-center justify-between gap-4 py-4">
                  <span>
                    <span className="block text-[0.95rem]">{t.name}</span>
                    <span className="block text-[0.8rem] text-mist">{t.description}</span>
                  </span>
                  <span className="text-[0.85rem] font-semibold text-gold-light whitespace-nowrap">
                    {t.points.toLocaleString('en-US')} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

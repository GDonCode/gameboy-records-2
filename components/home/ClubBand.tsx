// components/home/ClubBand.tsx
// Membership call to action: a full-width band in the brand green.
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { CLUB_NAME } from '@/lib/site';

const PERKS = [
  { icon: 'ticket' as const, text: 'First access to tickets' },
  { icon: 'star' as const, text: 'Club Points on every order' },
  { icon: 'envelope' as const, text: 'Date alerts in your inbox' },
];

export default function ClubBand() {
  return (
    <section aria-labelledby="club-title" className="bg-green bg-[image:var(--grain-dark)] bg-[length:320px_320px] text-paper border-y-4 border-ink py-16 md:py-24">
      <div className="container-site flex flex-col items-center text-center gap-6">
        <h2 id="club-title" className="m-0 display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem]">
          Join the {CLUB_NAME}
        </h2>
        <ul className="list-none p-0 m-0 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[0.95rem] font-medium">
          {PERKS.map((p) => (
            <li key={p.text} className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-paper text-green-deep shrink-0">
                <Icon name={p.icon} className="w-4 h-4" />
              </span>
              {p.text}
            </li>
          ))}
        </ul>
        <Button href="/account/login?mode=register" variant="light" size="lg" className="mt-2">
          Create account
          <Icon name="arrow-right" className="w-3.5 h-3.5" />
        </Button>
      </div>
    </section>
  );
}

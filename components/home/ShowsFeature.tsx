// components/home/ShowsFeature.tsx
// Home page live-shows call to action.
import Image from 'next/image';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { CLUB_NAME } from '@/lib/site';

export default function ShowsFeature() {
  return (
    <section aria-labelledby="shows-title" className="relative isolate overflow-hidden bg-ink">
      {/* This is a placeholder image */}
      <Image src="/assets/placeholder.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-70" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/20" aria-hidden="true" />

      <div className="container-site section-y grid lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow text-gold-light m-0 mb-5">Live</p>
          <h2 id="shows-title" className="display m-0 text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] max-w-[13ch]">
            Hear it in the room.
          </h2>
          <p className="mt-6 mb-0 max-w-[44ch] text-paper/80 leading-relaxed">
            Rooms are kept small on purpose. Dates are announced to the {CLUB_NAME} and the newsletter first, and tickets
            tend not to last the week.
          </p>
          <ul className="list-none p-0 m-0 mt-10 grid gap-4 text-[0.95rem]">
            {[
              { icon: 'ticket' as const, text: 'Members get first access to tickets' },
              { icon: 'star' as const, text: 'Club Points with every ticket' },
              { icon: 'envelope' as const, text: 'Date alerts straight to your inbox' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-deep text-paper shrink-0">
                  <Icon name={item.icon} className="w-4 h-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button href="/shows" variant="light" size="lg">
              Get tickets
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </Button>
            <Button href="/account/login?mode=register" variant="outline" size="lg">
              Join the {CLUB_NAME}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

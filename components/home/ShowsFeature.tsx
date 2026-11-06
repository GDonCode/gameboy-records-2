// components/home/ShowsFeature.tsx
// Home page live-shows section, driven by lib/shows.ts. With no dates yet it says so and offers the alert sign-up.
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/home/SectionTitle';
import { upcomingShows } from '@/lib/shows';
import { CLUB_NAME } from '@/lib/site';

const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

export default function ShowsFeature() {
  const shows = upcomingShows().slice(0, 5);
  return (
    <section aria-labelledby="shows-title" className="on-ink paper-ink text-paper section-y">
      <div className="container-site max-w-[1000px]">
        <SectionTitle ghost="Shows" id="shows-title" tone="dark">
          Shows
        </SectionTitle>

        {shows.length === 0 ? (
          <div className="border-y-2 border-paper/50 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="m-0 text-gold text-[1.4rem] md:text-[1.8rem] font-bold uppercase tracking-[0.06em]">Date — TBA</p>
              <p className="m-0 mt-2 max-w-[52ch] text-paper/80 leading-relaxed">
                Tour dates are being booked. Rooms are kept small on purpose, so the {CLUB_NAME} and the newsletter hear first.
              </p>
            </div>
            <Button href="/shows" variant="primary" size="lg" className="btn-hard btn-hard-inv self-start md:self-auto">
              Get notified
            </Button>
          </div>
        ) : (
          <ul className="list-none p-0 m-0 border-t-2 border-paper/50">
            {shows.map((s) => (
              <li key={s.date} className="border-b-2 border-paper/50 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="m-0 text-gold text-[1.2rem] font-bold uppercase tracking-[0.06em]">{dateFmt.format(new Date(s.date))}</p>
                  <p className="m-0 mt-1 uppercase tracking-[0.1em] text-[0.9rem]">
                    {s.venue} · {s.city}, {s.country}
                  </p>
                </div>
                {s.ticketUrl && s.status !== 'sold-out' ? (
                  <Button href={s.ticketUrl} variant="primary" size="md" className="btn-hard btn-hard-inv self-start md:self-auto">
                    Tickets
                    <Icon name="arrow-right" className="w-3 h-3" />
                  </Button>
                ) : (
                  <span className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-mist">{s.status === 'sold-out' ? 'Sold out' : 'Announced'}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

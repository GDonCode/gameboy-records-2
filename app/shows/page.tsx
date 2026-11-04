// app/shows/page.tsx — Shows
import type { Metadata } from 'next';
import Image from 'next/image';
import PageShell from '@/components/PageShell';
import NeonHeading from '@/components/NeonHeading';
import NotifyForm from '@/components/NotifyForm';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { upcomingShows, type Show } from '@/lib/shows';
import { ARTIST, CLUB_NAME, OG_IMAGE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shows',
  description: `Live dates for ${ARTIST}. Tickets, venues and first access for Playaz Club members.`,
  alternates: { canonical: '/shows' },
  openGraph: { url: '/shows', title: `Shows | ${ARTIST}`, images: [OG_IMAGE] },
};

// Past shows drop off on their own.
export const revalidate = 3600;

const STATUS_LABEL: Record<Show['status'], string> = {
  'on-sale': 'Tickets',
  'members-presale': 'Members presale',
  'sold-out': 'Sold out',
  announced: 'On sale soon',
};

function ShowRow({ show }: { show: Show }) {
  const d = new Date(show.date);
  const day = d.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' });
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue}, ${show.address}`)}`;
  return (
    <li className="grid grid-cols-[64px_1fr] md:grid-cols-[96px_1fr_auto] gap-x-6 gap-y-4 items-center py-8 border-b border-line-inv">
      <p className="m-0 text-center">
        <span className="block text-[2rem] md:text-[2.5rem] font-semibold leading-none">{day}</span>
        <span className="block eyebrow text-gold-light mt-2">{month}</span>
      </p>
      <div>
        <h3 className="m-0 text-[1.15rem] md:text-[1.35rem] font-semibold uppercase tracking-[0.06em]">
          {show.city}, {show.country}
        </h3>
        <p className="m-0 mt-1 text-mist">
          {show.venue} · {weekday}
        </p>
        <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-[0.8rem] text-paper/80 underline underline-offset-4 hover:text-paper">
          <Icon name="location-dot" className="w-3 h-3" /> Directions
        </a>
      </div>
      <div className="col-span-2 md:col-span-1">
        {show.ticketUrl && show.status !== 'sold-out' && show.status !== 'announced' ? (
          <Button href={show.ticketUrl} variant={show.status === 'members-presale' ? 'light' : 'primary'} aria-label={`${STATUS_LABEL[show.status]}: ${show.city}, ${month} ${day} (opens in a new tab)`}>
            <Icon name="ticket" className="w-4 h-4" />
            {STATUS_LABEL[show.status]}
          </Button>
        ) : (
          <span className="inline-flex items-center h-12 px-6 border border-line-inv text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-mist">{STATUS_LABEL[show.status]}</span>
        )}
      </div>
    </li>
  );
}

export default function ShowsPage() {
  const shows = upcomingShows();

  const events = shows.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: `${ARTIST} live in ${s.city}`,
    startDate: s.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: s.venue, address: s.address },
    performer: { '@id': `${SITE_URL}/#artist` },
    organizer: { '@id': `${SITE_URL}/#label` },
    ...(s.ticketUrl ? { offers: { '@type': 'Offer', url: s.ticketUrl, availability: s.status === 'sold-out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } } : {}),
  }));

  return (
    <PageShell>
      {events.length > 0 && <JsonLd data={events} />}

      <section className="relative isolate overflow-hidden bg-ink">
        {/* This is a placeholder image */}
        <Image src="/assets/placeholder.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" aria-hidden="true" />
        <div className="container-site pt-20 pb-16 md:pt-32 md:pb-24">
          <NeonHeading kicker="Live" subtitle={ARTIST}>
            Shows
          </NeonHeading>
          <p className="mx-auto mt-8 mb-0 max-w-[50ch] text-center text-paper/80 leading-relaxed">
            Small rooms, full sets, no filler. Dates go to the {CLUB_NAME} first, then to everyone else.
          </p>
        </div>
      </section>

      <section aria-labelledby="dates-title" className="bg-ink pb-20 md:pb-28">
        <div className="container-site max-w-[960px]">
          <h2 id="dates-title" className="eyebrow text-gold-light m-0 pb-6 border-b border-line-inv">
            Upcoming dates
          </h2>
          {shows.length > 0 ? (
            <ul className="list-none p-0 m-0">
              {shows.map((s) => (
                <ShowRow key={`${s.date}-${s.city}`} show={s} />
              ))}
            </ul>
          ) : (
            <div className="py-14 md:py-20 grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <p className="display m-0 text-[1.75rem] md:text-[2.25rem]">The next run is being booked.</p>
                <p className="m-0 mt-4 text-mist leading-relaxed">
                  Leave your email and you’ll get the dates the moment they’re confirmed, before tickets go on general sale.
                </p>
              </div>
              <NotifyForm cta="Get show alerts" success="You’re on the list. Dates come to you first." />
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="presale-title" className="on-light bg-bone text-ink section-y">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="eyebrow text-green-deep m-0 mb-5">{CLUB_NAME}</p>
            <h2 id="presale-title" className="display m-0 text-[2.25rem] sm:text-[3rem]">
              First access, every time.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ul className="list-none p-0 m-0 grid gap-4 text-[0.95rem]">
              {['Members presale on every date', 'Club Points with every ticket', 'Priority entry with the VIP Show Pass reward'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Icon name="star" className="w-4 h-4 text-gold" /> {t}
                </li>
              ))}
            </ul>
            <Button href="/account/login?mode=register" variant="dark" size="lg" className="mt-8">
              Join the {CLUB_NAME}
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

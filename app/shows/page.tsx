// app/shows/page.tsx — Shows (original Shows design, inside the new site frame)
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import ShowsBoard from '@/components/shows/ShowsBoard';
import JsonLd from '@/components/JsonLd';
import { upcomingShows } from '@/lib/shows';
import { ARTIST, OG_IMAGE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shows',
  description: `Live dates for ${ARTIST}. Tickets, venues and first access for Playaz Club members.`,
  alternates: { canonical: '/shows' },
  openGraph: { url: '/shows', title: `Shows | ${ARTIST}`, images: [OG_IMAGE] },
};

// Past shows drop off on their own.
export const revalidate = 3600;

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
      <ShowsBoard shows={shows} />
    </PageShell>
  );
}

// lib/shows.ts
// Live dates. Add a show by appending an entry; past shows drop off the page automatically.
//
//   { date: '2027-03-14T20:00:00-05:00', city: 'Kingston', country: 'Jamaica', venue: 'Venue name',
//     address: 'Street, City', ticketUrl: 'https://…', status: 'on-sale' }

export interface Show {
  /** ISO date-time with the venue's UTC offset. */
  date: string;
  city: string;
  country: string;
  venue: string;
  /** Street address, used for directions and search engines. */
  address: string;
  /** Where tickets are sold. */
  ticketUrl: string | null;
  status: 'on-sale' | 'members-presale' | 'sold-out' | 'announced';
}

export const SHOWS: Show[] = [];

export function upcomingShows(now = new Date()): Show[] {
  const cutoff = now.getTime() - 12 * 3_600_000; // keep tonight's show up until the morning after
  return SHOWS.filter((s) => Date.parse(s.date) >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
}

import type { Metadata } from 'next';
import { ARTIST, OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Karaoke',
  description: `Sing along to ${ARTIST} with synced lyrics. Pick a song, press play, take the mic.`,
  alternates: { canonical: '/karaoke' },
  openGraph: { url: '/karaoke', title: 'Karaoke | Gameboy Records', images: [OG_IMAGE] },
};

export default function KaraokeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

// app/music/page.tsx — Music
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import RecordCrate from '@/components/music/RecordCrate';
import JsonLd from '@/components/JsonLd';
import { getDiscography } from '@/lib/discography';
import { ARTIST, OG_IMAGE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Music',
  description: `The complete discography of ${ARTIST}, from A-Game Everyday to Still A Rise, including his collaborations. Flip through the crate and play any record.`,
  alternates: { canonical: '/music' },
  openGraph: { url: '/music', title: `Music | ${ARTIST}`, images: [OG_IMAGE] },
};

// Refresh from YouTube at most once an hour.
export const revalidate = 3600;

export default async function MusicPage() {
  const releases = await getDiscography();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${ARTIST} discography`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: releases.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicRecording',
        name: r.title,
        byArtist: { '@id': `${SITE_URL}/#artist` },
        datePublished: r.publishedAt.slice(0, 10),
        ...(r.duration ? { duration: `PT${Math.floor(r.duration / 60)}M${r.duration % 60}S` } : {}),
        url: r.videoId ? `https://www.youtube.com/watch?v=${r.videoId}` : `https://open.spotify.com/track/${r.spotifyTrackId}`,
        image: r.cover,
      },
    })),
  };

  return (
    <PageShell footer={false}>
      <JsonLd data={jsonLd} />
      <RecordCrate releases={releases} />
    </PageShell>
  );
}

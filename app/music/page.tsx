// app/music/page.tsx — Music
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import MusicFeed from '@/components/music/MusicFeed';
import JsonLd from '@/components/JsonLd';
import { getDiscography } from '@/lib/discography';
import { ARTIST, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Music',
  description: `The complete discography of ${ARTIST}, from A-Game Everyday to Still A Rise. Watch every release in order.`,
  alternates: { canonical: '/music' },
  openGraph: { url: '/music', title: `Music | ${ARTIST}` },
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
        url: `https://www.youtube.com/watch?v=${r.videoId}`,
        image: r.thumbnail,
      },
    })),
  };

  return (
    <PageShell footer={false}>
      <JsonLd data={jsonLd} />
      <MusicFeed releases={releases} />
    </PageShell>
  );
}

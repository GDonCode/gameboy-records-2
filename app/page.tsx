// app/page.tsx — Home
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Hero from '@/components/home/Hero';
import MerchFeature from '@/components/home/MerchFeature';
import FeaturedRelease from '@/components/home/FeaturedRelease';
import ShowsFeature from '@/components/home/ShowsFeature';
import JsonLd from '@/components/JsonLd';
import { FEATURED_RELEASES } from '@/lib/releases';
import { ARTIST, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Independent label of ${ARTIST}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { url: '/', title: SITE_NAME, description: SITE_DESCRIPTION },
};

const releasesJsonLd = FEATURED_RELEASES.map((r) => ({
  '@context': 'https://schema.org',
  '@type': 'MusicRecording',
  name: r.title,
  byArtist: { '@id': `${SITE_URL}/#artist` },
  url: `https://www.youtube.com/watch?v=${r.youtubeId}`,
  sameAs: r.links.filter((l) => l.href).map((l) => l.href),
}));

export default function Home() {
  return (
    <PageShell>
      <JsonLd data={releasesJsonLd} />
      <Hero />
      <MerchFeature />
      <FeaturedRelease release={FEATURED_RELEASES[0]} index={0} />
      <ShowsFeature />
      <FeaturedRelease release={FEATURED_RELEASES[1]} index={1} />
    </PageShell>
  );
}

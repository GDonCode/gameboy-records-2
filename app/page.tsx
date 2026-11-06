// app/page.tsx — Home
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Hero from '@/components/home/Hero';
import MerchFeature from '@/components/home/MerchFeature';
import Ribbon from '@/components/home/Ribbon';
import ReleaseCards from '@/components/home/ReleaseCards';
import SectionTitle from '@/components/home/SectionTitle';
import ClubBand from '@/components/home/ClubBand';
import ShowsFeature from '@/components/home/ShowsFeature';
import JsonLd from '@/components/JsonLd';
import { FEATURED_RELEASES } from '@/lib/releases';
import { ARTIST, SITE_DESCRIPTION, SITE_NAME, SITE_URL, OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Independent label of ${ARTIST}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { url: '/', title: SITE_NAME, description: SITE_DESCRIPTION, images: [OG_IMAGE] },
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
      <Ribbon />
      <section aria-labelledby="music-title" className="on-light paper text-ink section-y">
        <div className="container-site max-w-[1100px]">
          <SectionTitle ghost="Music" id="music-title">
            Music
          </SectionTitle>
          <ReleaseCards releases={FEATURED_RELEASES} />
        </div>
      </section>
      <MerchFeature />
      <ShowsFeature />
      <ClubBand />
    </PageShell>
  );
}

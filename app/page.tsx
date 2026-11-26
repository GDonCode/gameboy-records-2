// app/page.tsx — Home
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Hero from '@/components/home/Hero';
import MerchFeature from '@/components/home/MerchFeature';
import Ribbon from '@/components/home/Ribbon';
import ReleaseCards from '@/components/home/ReleaseCards';
import SectionTitle from '@/components/home/SectionTitle';
import ClubBand from '@/components/home/ClubBand';
import ShowsBoard from '@/components/shows/ShowsBoard';
import JsonLd from '@/components/JsonLd';
import { FEATURED_RELEASES } from '@/lib/releases';
import { upcomingShows } from '@/lib/shows';
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

// Past shows drop off the Shows section on their own.
export const revalidate = 3600;

export default function Home() {
  return (
    <PageShell>
      <JsonLd data={releasesJsonLd} />
      <Hero />
      <Ribbon />
      <MerchFeature />
      <section aria-labelledby="music-title" className="on-light paper text-ink section-y">
        <div className="container-site max-w-[1100px]">
          <SectionTitle ghost="Releases" id="music-title">
            New Music
          </SectionTitle>
          <ReleaseCards releases={FEATURED_RELEASES} />
        </div>
      </section>
      {/* The header's Shows link scrolls here. The section is a full screen and its own top padding clears the
          floating header, so the jump lands flush at the top. */}
      <section id="shows" aria-labelledby="shows-title" className="scroll-mt-[calc(var(--header-h)*-1)]">
        <ShowsBoard shows={upcomingShows()} layout="rail" />
      </section>
      <ClubBand />
    </PageShell>
  );
}

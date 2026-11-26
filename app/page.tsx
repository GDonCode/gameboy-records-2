// app/page.tsx — Home
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Hero from '@/components/home/Hero';
import MerchFeature from '@/components/home/MerchFeature';
import Ribbon from '@/components/home/Ribbon';
import ClubBand from '@/components/home/ClubBand';
import ShowsBoard from '@/components/shows/ShowsBoard';
import VibesLaunch from '@/components/home/VibesLaunch';
import LazyMount from '@/components/LazyMount';
import JsonLd from '@/components/JsonLd';
import { FEATURED_RELEASES } from '@/lib/releases';
import RecordCrate from '@/components/music/RecordCrate';
import { getDiscography, type Release } from '@/lib/discography';
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

export default async function Home() {
  // The Music section is the same record crate as /music. If the discography can't be fetched it is simply left out.
  const releases: Release[] = await getDiscography().catch(() => []);
  return (
    <PageShell>
      <JsonLd data={releasesJsonLd} />
      <Hero />
      <Ribbon />
      <MerchFeature />
      {releases.length > 0 && (
        <section id="music" aria-labelledby="crate-title" tabIndex={-1} className="scroll-mt-[calc(var(--header-h)*-1)] outline-none">
          {/* The crate only mounts when it is about a screen away; until then a same-height placeholder holds its place. */}
          <LazyMount className="paper-ink min-h-[100svh]">
            <RecordCrate releases={releases} embedded />
          </LazyMount>
        </section>
      )}
      {/* The header's Shows link scrolls here. The section is a full screen and its own top padding clears the
          floating header, so the jump lands flush at the top. */}
      <section id="shows" aria-labelledby="shows-title" tabIndex={-1} className="scroll-mt-[calc(var(--header-h)*-1)] outline-none">
        <ShowsBoard shows={upcomingShows()} layout="rail" />
      </section>
      <VibesLaunch />
      <ClubBand />
    </PageShell>
  );
}

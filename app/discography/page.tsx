// app/discography/page.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import DiscographyFeed from '@/components/discography/DiscographyFeed';
import { getDiscographyPage } from '@/lib/discography';

export const metadata: Metadata = {
  title: 'Discography',
  description: 'Music videos from Alexx A-Game and Gameboy Records. Watch, share and listen on your favourite platform.',
};

// Refresh the first page of videos from YouTube at most once an hour.
export const revalidate = 3600;

export default async function DiscographyPage() {
  const initial = await getDiscographyPage();

  // Search engines: the videos on this page.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: initial.releases.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: r.title,
        description: r.description || `${r.title} by ${r.artist}`,
        thumbnailUrl: r.thumbnail,
        embedUrl: `https://www.youtube-nocookie.com/embed/${r.videoId}`,
        ...(r.publishedAt ? { uploadDate: r.publishedAt } : {}),
      },
    })),
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[#0b120d]">
      <style>{`.no-scrollbar { scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header />
      <MobileBottomNav />
      <main className="relative flex-1 min-h-0">
        <h1 className="sr-only">Discography</h1>
        <DiscographyFeed initial={initial} />
      </main>
    </div>
  );
}

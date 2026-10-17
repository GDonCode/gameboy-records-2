'use client';

import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import Footer from '@/components/Footer';

// ── RELEASES ─────────────────────────────────────────────────────────────────
// Placeholder items for now. To add a real release, replace the generated entries below with
// { id, title, year, cover } where `cover` is an image URL or a path under /public.
interface Release {
  id: number;
  title: string;
  year: string;
  cover?: string;
}

const RELEASES: Release[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  title: `Release Title ${i + 1}`,
  year: 'YYYY',
}));

export default function DiscographyPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <Header />
      <MobileBottomNav />

      {/* Same dark olive background as the Shop page */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #1a2420 100%)' }}
      >
        <GameIconsBackground opacity={1.5} />

        <div className="absolute inset-0 z-[1] flex flex-col overflow-y-auto pt-[60px] md:pt-0">
          <main className="flex-1 px-4 py-10 md:py-14">
            <h1
              style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
              className="text-center text-4xl md:text-5xl uppercase leading-none text-[#FEFEFA]"
            >
              Discography
            </h1>

            <ul className="mx-auto mt-10 grid w-full max-w-[1000px] grid-cols-2 gap-4 md:mt-14 md:grid-cols-3 md:gap-8 list-none p-0">
              {RELEASES.map((release) => (
                <li key={release.id}>
                  <div className="group relative aspect-square w-full overflow-hidden border border-[#1a9e4a]/30 bg-[#0c1510]/70 transition-all duration-300 ease-out hover:border-[#4dff91] hover:shadow-[0_0_24px_rgba(77,255,145,0.25)]">
                    {release.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={release.cover}
                        alt={release.title}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #12201a 0%, #0c1510 100%)' }}
                      >
                        <span
                          style={{ fontFamily: "'Poppins', monospace" }}
                          className="text-xs tracking-[0.3em] text-[#4dff91]/40"
                        >
                          COVER ART
                        </span>
                      </div>
                    )}

                    {/* Caption — revealed on hover so the grid reads as clean cover art */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span
                        style={{ fontFamily: "'Poppins_semibold', monospace" }}
                        className="block text-sm text-[#FEFEFA]"
                      >
                        {release.title}
                      </span>
                      <span
                        style={{ fontFamily: "'Poppins', monospace" }}
                        className="block text-xs tracking-[0.2em] text-[#3dc97e]"
                      >
                        {release.year}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </main>

          <Footer />
        </div>
      </div>

    </div>
  );
}

// app/trivia/page.tsx — Trivia
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import NeonHeading from '@/components/NeonHeading';
import TriviaGame from '@/components/TriviaGame';
import GameIconsBackground from '@/components/GameIconsBackground';
import { ARTIST, CLUB_NAME, OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tricky Tempo Trivia',
  description: `How well do you know ${ARTIST}? Three rounds, fifteen questions, ten seconds each. Top the leaderboard and earn Club Points.`,
  alternates: { canonical: '/trivia' },
  openGraph: { url: '/trivia', title: 'Tricky Tempo Trivia | Gameboy Records', images: [OG_IMAGE] },
};

export default function TriviaPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-ink flex-1 pt-16 pb-24 md:pt-24">
        <GameIconsBackground opacity={1.5} />
        <div className="relative z-[1] container-site flex flex-col items-center">
          <NeonHeading kicker="Vibes" subtitle={`For the ${CLUB_NAME}`} className="mb-12">
            Tricky Tempo Trivia
          </NeonHeading>
          <TriviaGame />
        </div>
      </section>
    </PageShell>
  );
}

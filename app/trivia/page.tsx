// app/trivia/page.tsx — Trivia
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import PageTitle from '@/components/PageTitle';
import TriviaGame from '@/components/TriviaGame';
import GameIconsBackground from '@/components/GameIconsBackground';
import { ARTIST, OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tricky Tempo Trivia',
  description: `How well do you know ${ARTIST}? Three rounds, fifteen questions, ten seconds each. Top the leaderboard and earn Club Points.`,
  alternates: { canonical: '/trivia' },
  openGraph: { url: '/trivia', title: 'Tricky Tempo Trivia | Gameboy Records', images: [OG_IMAGE] },
};

export default function TriviaPage() {
  return (
    <PageShell>
      <section className="paper-ink relative overflow-hidden flex-1 pt-12 pb-24 md:pt-20">
        <GameIconsBackground opacity={1.5} />
        <div className="relative z-[1] container-site flex flex-col items-center">
          <PageTitle tone="dark" ghost="Play" className="mb-10 w-full">
            Tricky Tempo Trivia
          </PageTitle>
          <TriviaGame />
        </div>
      </section>
    </PageShell>
  );
}

// app/trivia/page.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import TriviaGame from '@/components/TriviaGame';

export const metadata: Metadata = {
  title: 'Tricky Tempo Trivia',
};

export default function TriviaPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <MobileBottomNav />
      <div
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
      >
        <GameIconsBackground opacity={1.5} />
        <div className="mobile-home-pad absolute inset-0 z-[1] flex flex-col items-center overflow-y-auto pt-[60px] md:pt-0 py-8">
          <div className="my-auto flex w-full flex-col items-center py-8">
            <h1
              className="mb-6 text-center"
              style={{
                fontFamily: "'Poppins', monospace",
                fontSize: '1.4em',
                letterSpacing: '0.2em',
                color: '#4dff91',
              }}
            >
              TRICKY TEMPO TRIVIA
            </h1>
            <TriviaGame />
          </div>
        </div>
      </div>
    </div>
  );
}

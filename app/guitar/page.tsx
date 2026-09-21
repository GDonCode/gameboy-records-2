// app/guitar/page.tsx
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GuitarTiles from '@/components/GuitarTiles';

export default function GuitarPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <MobileBottomNav />
      <div
        className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-8"
        style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
      >
        <h1
          style={{
            fontFamily: "'Poppins', monospace",
            fontSize: '1.4em',
            letterSpacing: '0.2em',
            color: '#4dff91',
            marginBottom: '20px',
          }}
        >
          GUITAR TILES
        </h1>
        <GuitarTiles />
      </div>
    </div>
  );
}
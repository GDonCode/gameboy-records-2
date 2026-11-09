// components/karaoke/SongCarousel.tsx
// The Karaoke song picker: a flip-through carousel of song sleeves, in the spirit of the Music page's crate.
// Arrows, the arrow keys, a swipe or a click on a side sleeve bring a song to the front; Sing starts it.
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Mic } from 'lucide-react';

export interface PickerSong {
  id: string;
  title: string;
  artist: string;
  photoSrc: string | null;
}

export default function SongCarousel({ songs, initial = 0, onPick }: { songs: PickerSong[]; initial?: number; onPick: (index: number) => void }) {
  const [active, setActive] = useState(initial);
  const n = songs.length;
  const swipeStart = useRef<number | null>(null);

  const move = (dir: 1 | -1) => setActive((a) => (a + dir + n) % n);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') move(1);
      else if (e.key === 'ArrowLeft') move(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const song = songs[active];

  return (
    <div className="flex w-full flex-col items-center gap-6" style={{ ['--sleeve' as string]: 'min(62vw, 46vh, 360px)' }}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Pick a song"
        className="relative w-full select-none touch-pan-y"
        style={{ height: 'calc(var(--sleeve) * 1.12)', perspective: '1300px' }}
        onPointerDown={(e) => {
          swipeStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(dx) > 45) move(dx < 0 ? 1 : -1);
        }}
      >
        {songs.map((s, i) => {
          let d = i - active;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const ad = Math.abs(d);
          const front = d === 0;
          return (
            <button
              key={s.id}
              type="button"
              tabIndex={front ? 0 : -1}
              aria-label={front ? `${s.title}, selected` : `Show ${s.title}`}
              aria-hidden={ad > 1 ? true : undefined}
              onClick={() => (front ? onPick(i) : setActive(i))}
              className="absolute left-1/2 top-1/2 m-0 cursor-pointer border-[3px] border-paper bg-ink p-0 transition-[transform,opacity,box-shadow] duration-[450ms] ease-out"
              style={{
                width: 'var(--sleeve)',
                height: 'var(--sleeve)',
                transform: `translate(-50%, -50%) translateX(calc(var(--sleeve) * ${(d * 0.62).toFixed(3)})) translateZ(${front ? 60 : -40 * ad}px) rotateY(${(-d * 55).toFixed(0)}deg)`,
                opacity: ad > 1 ? 0 : front ? 1 : 0.55,
                pointerEvents: ad > 1 ? 'none' : 'auto',
                zIndex: 10 - ad,
                boxShadow: front ? '8px 8px 0 var(--color-green-deep)' : 'none',
              }}
            >
              {s.photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photoSrc} alt="" className="block h-full w-full object-cover" draggable={false} />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-green-deep text-paper">
                  <Mic className="h-1/3 w-1/3" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 text-center" aria-live="polite">
        <h2 className="display m-0 max-w-[22ch] text-[1.5rem] sm:text-[2.1rem]">{song.title}</h2>
        <p className="m-0 text-[0.8rem] uppercase tracking-[0.22em]" style={{ color: '#4dff91', textShadow: '0 0 16px rgba(77,255,145,0.45)' }}>
          {song.artist}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => move(-1)} aria-label="Previous song" className="flex h-12 w-12 cursor-pointer items-center justify-center border-2 border-paper/40 bg-transparent text-paper hover:border-gold hover:text-gold">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onPick(active)}
          className="zoom-content inline-flex h-12 cursor-pointer items-center rounded-xs border-0 bg-gold px-7 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-[#F0C928]"
        >
          <span className="inline-flex items-center gap-2.5">
            <Mic className="h-4 w-4" aria-hidden="true" />
            Sing this song
          </span>
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Next song" className="flex h-12 w-12 cursor-pointer items-center justify-center border-2 border-paper/40 bg-transparent text-paper hover:border-gold hover:text-gold">
          <ChevronRight className="h-6 w-6" strokeWidth={2.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

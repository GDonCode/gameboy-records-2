// components/home/Hero.tsx
// Home page hero: the studio film fills the screen (on phones it runs up behind the header; on desktop it starts below it),
// with the label's intro and the two calls to action set straight on it at the left.
'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { MEDIA_BASE } from '@/lib/site';

// A soft shadow under the text so it stays readable over bright frames of the film.
const TEXT_SHADOW = { textShadow: '0 2px 12px rgba(11,10,7,0.75), 0 1px 3px rgba(11,10,7,0.6)' };

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Start the film unless the visitor prefers reduced motion; they can always play or pause it.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink flex items-center min-h-[100svh] mt-[calc(var(--header-h)*-1)] pt-(--header-h) lg:mt-0 lg:pt-0 lg:min-h-[calc(100svh-var(--header-h))]">
      {/* The film fills the whole hero */}
      <video
        ref={videoRef}
        src={`${MEDIA_BASE}/web-hero.mp4`}
        poster={`${MEDIA_BASE}/IMG_7478-Retouched.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 -z-10 w-full h-full object-cover object-top -scale-x-100"
      />
      {/* Darkens the film under the header, behind the text on the left and along the bottom edge */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, rgba(11,10,7,0.6) 0%, rgba(11,10,7,0.1) 22%, rgba(11,10,7,0.15) 60%, rgba(11,10,7,0.75) 100%), linear-gradient(to right, rgba(11,10,7,0.7) 0%, rgba(11,10,7,0.35) 45%, rgba(11,10,7,0) 75%)' }}
      />

      <div className="container-site py-12 md:py-20">
        <div className="max-w-[620px] text-left animate-fade-up">
          <h1 id="hero-title" className="m-0 text-paper font-bold uppercase leading-[0.95] tracking-[-0.01em] text-[2.6rem] sm:text-[3.4rem] lg:text-[4.4rem]" style={TEXT_SHADOW}>
            Realest sound<span className="text-green">.</span>
            <br />
            Truest vision<span className="text-gold">.</span>
          </h1>
          <p className="mt-6 mb-0 max-w-[48ch] text-[1rem] md:text-[1.125rem] leading-relaxed text-paper/90" style={TEXT_SHADOW}>
            Reggae and dancehall out of Jamaica, from A-Game Everyday to Still A Rise. The music, the merch and the shows come
            straight from him, through his own label, Gameboy Records.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <Button href="/shop" variant="green" size="lg">
              Shop the collection
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </Button>
            <Button href="/shows" variant="light" size="lg">
              Get tickets
            </Button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        className="zoom-content absolute right-4 bottom-4 md:right-8 md:bottom-8 inline-flex items-center justify-center w-11 h-11 rounded-full bg-ink/70 border border-paper/40 text-paper hover:border-paper cursor-pointer"
      >
        <span>
          {playing ? (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
              <rect x="5" y="4" width="5" height="16" />
              <rect x="14" y="4" width="5" height="16" />
            </svg>
          ) : (
            <Icon name="play" className="w-3.5 h-3.5" />
          )}
        </span>
      </button>
    </section>
  );
}

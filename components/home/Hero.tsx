// components/home/Hero.tsx
// Home page hero: the studio film behind a neon title, with the two calls to action.
'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/icons';
import NeonHeading from '@/components/NeonHeading';
import Button from '@/components/ui/Button';
import { ARTIST, MEDIA_BASE } from '@/lib/site';

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
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink min-h-[calc(100svh-var(--header-h))] flex">
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
        className="absolute inset-0 -z-10 w-full h-full object-cover object-top"
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, rgba(11,10,7,0.55) 0%, rgba(11,10,7,0.1) 30%, rgba(11,10,7,0.35) 60%, rgba(11,10,7,0.96) 100%)' }}
      />

      <div className="container-site flex flex-col justify-end pb-16 md:pb-24 pt-32">
        <p className="eyebrow text-gold-light m-0 mb-6 animate-fade-up">Singer · Songwriter · Guitarist</p>
        <NeonHeading as="h1" id="hero-title" size="xl" align="left" className="max-w-[16ch]">
          {ARTIST}
        </NeonHeading>
        <p className="mt-5 mb-0 text-[1.1rem] md:text-[1.35rem] font-semibold uppercase tracking-[0.18em] text-paper animate-fade-up">
          Realest sound. Truest vision.
        </p>
        <p className="mt-5 mb-0 max-w-[48ch] text-[1rem] md:text-[1.125rem] leading-relaxed text-paper/85 animate-fade-up">
          Reggae and dancehall out of Jamaica, from A-Game Everyday to Still A Rise. The music, the merch and the shows
          come straight from him, through his own label, Gameboy Records.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Button href="/shop" variant="primary" size="lg">
            Shop the collection
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
          <Button href="/shows" variant="outline" size="lg">
            Get tickets
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        className="zoom-content absolute right-4 bottom-4 md:right-8 md:bottom-8 inline-flex items-center justify-center w-11 h-11 rounded-full border border-paper/30 text-paper/80 hover:text-paper hover:border-paper/60 cursor-pointer"
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

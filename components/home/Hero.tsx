// components/home/Hero.tsx
// Home page hero: the logo on printed paper, the tagline, the two calls to action, and the
// studio film in a framed, offset-shadow card.
'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { ARTIST, MEDIA_BASE, SITE_NAME } from '@/lib/site';

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
    <section aria-labelledby="hero-title" className="on-light paper text-ink relative overflow-hidden">
      <div className="container-site flex flex-col items-center text-center pt-10 pb-14 md:pt-16 md:pb-24">
        <h1 id="hero-title" className="m-0 w-full max-w-[1000px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/gameboy-records-logo.jpg" alt={SITE_NAME} width={1600} height={325} className="w-full h-auto mix-blend-multiply animate-fade-up" />
        </h1>
        <p className="mt-4 mb-0 text-[0.66rem] sm:text-[0.9rem] font-semibold uppercase tracking-[0.26em] sm:tracking-[0.42em] pl-[0.26em] sm:pl-[0.42em] animate-fade-up">
          Independent label of {ARTIST}
        </p>
        <p className="mt-6 mb-0 max-w-[48ch] text-[1.05rem] leading-relaxed text-stone animate-fade-up">
          Reggae and dancehall out of Jamaica. The music, the merch and the shows come straight from him, through his own label.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row gap-4">
          <Button href="/shop" variant="green" size="lg" className="btn-hard">
            Shop the collection
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
          <Button href="/shows" variant="light" size="lg" className="btn-hard">
            Get tickets
          </Button>
        </div>

        {/* The film, framed */}
        <div className="relative mt-14 md:mt-20 w-full max-w-[1040px]">
          <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden bg-ink border-[3px] border-ink hard">
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
              className="absolute inset-0 w-full h-full object-cover object-top -scale-x-100"
            />
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause background video' : 'Play background video'}
              className="zoom-content absolute right-3 bottom-3 inline-flex items-center justify-center w-11 h-11 rounded-full bg-ink/70 border border-paper/40 text-paper hover:border-paper cursor-pointer"
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
          </div>
          <span
            aria-hidden="true"
            className="hidden md:grid place-items-center absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-gold border-[3px] border-ink text-ink text-center text-[0.8rem] font-bold uppercase leading-tight tracking-[0.14em] rotate-12 shadow-[4px_4px_0_var(--color-ink)]"
          >
            Press
            <br />
            start
          </span>
        </div>
      </div>
    </section>
  );
}

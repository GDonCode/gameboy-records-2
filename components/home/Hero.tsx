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
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink flex items-center min-h-[calc(100svh-var(--header-h))]">
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
      {/* Darkens the film behind the panel and along the bottom edge */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, rgba(11,10,7,0.35) 0%, rgba(11,10,7,0.15) 40%, rgba(11,10,7,0.7) 100%), linear-gradient(to right, rgba(11,10,7,0.55) 0%, rgba(11,10,7,0) 65%)' }}
      />

      <div className="container-site py-10 md:py-16">
        {/* The logo is on white, so it sits on a paper panel where it blends into the grain */}
        <div className="on-light paper text-ink w-full max-w-[600px] mx-auto md:mx-0 border-[3px] border-ink p-6 sm:p-8 md:p-10 text-center md:text-left shadow-[8px_8px_0_var(--color-gold)] animate-fade-up">
          <h1 id="hero-title" className="m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gameboy-records-logo.jpg" alt={SITE_NAME} width={1600} height={325} className="w-full h-auto mix-blend-multiply" />
          </h1>
          <p className="mt-4 mb-0 text-[0.66rem] sm:text-[0.8rem] font-semibold uppercase tracking-[0.26em] sm:tracking-[0.34em]">
            Independent label of {ARTIST}
          </p>
          <p className="mt-5 mb-0 text-[1rem] leading-relaxed text-stone">
            Reggae and dancehall out of Jamaica. The music, the merch and the shows come straight from him, through his own label.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-4 sm:justify-center md:justify-start">
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

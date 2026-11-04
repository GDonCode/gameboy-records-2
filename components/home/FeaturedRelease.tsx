// components/home/FeaturedRelease.tsx
// A full-screen release feature: the music video loops (blurred to fill the frame, sharp in the centre),
// with the title, artist and listen-on buttons over it. Videos only load and play while on screen.
'use client';

import { useEffect, useRef } from 'react';
import ListenOn from '@/components/ListenOn';
import { usePlayer } from '@/components/player/PlayerProvider';
import type { FeaturedRelease as Release } from '@/lib/releases';

/** Plays the given videos while the section is on screen and pauses them when it isn't. */
function useOnScreenVideos() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const videos = Array.from(section.querySelectorAll('video'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        videos.forEach((v) => {
          if (entry.isIntersecting) {
            if (v.preload !== 'auto') v.preload = 'auto';
            if (!reduced) v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);
  return sectionRef;
}

export default function FeaturedRelease({ release, index }: { release: Release; index: number }) {
  const { play } = usePlayer();
  const ref = useOnScreenVideos();
  const headingId = `release-${index}`;

  return (
    <section ref={ref} aria-labelledby={headingId} className="relative overflow-hidden bg-ink min-h-[calc(100svh-var(--header-h))]">
      {/* Background: the same video, blurred and stretched to fill */}
      <video
        src={release.video}
        poster={release.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{ filter: 'blur(5px) brightness(0.55)' }}
      />
      {/* Foreground: the true vertical frame, centred, uncropped */}
      <video
        src={release.video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-contain"
      />
      <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, rgba(11,10,7,0.45) 0%, transparent 24%, transparent 55%, rgba(11,10,7,0.85) 100%)' }}
      />

      <div className="relative z-[3] container-site flex flex-col items-center justify-center gap-8 text-center py-24 min-h-[calc(100svh-var(--header-h))]">
        <p className="eyebrow text-gold-light m-0">Featured release {index === 0 ? 'I' : 'II'}</p>
        <div className="flex flex-col items-center gap-3">
          <h2
            id={headingId}
            className="m-0 text-paper uppercase"
            style={{
              fontFamily: "'Poppins_semibold', sans-serif",
              fontSize: 'clamp(1.9rem, 6vw, 3.25rem)',
              letterSpacing: '0.12em',
              lineHeight: 1.05,
              textShadow: '0 2px 28px rgba(0,0,0,0.9), 0 0 40px rgba(77,255,145,0.12)',
            }}
          >
            {release.title}
          </h2>
          <p
            className="m-0 uppercase"
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.6rem)',
              color: '#4dff91',
              letterSpacing: '0.28em',
              textShadow: '0 0 24px rgba(77,255,145,0.55)',
            }}
          >
            {release.artist}
          </p>
          <p className="m-0 mt-2 max-w-[44ch] text-[0.95rem] text-paper/80" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.8)' }}>
            {release.note}
          </p>
        </div>
        <ListenOn title={release.title} links={release.links} onPlay={() => play(release.youtubeId, release.title)} />
      </div>
    </section>
  );
}

// components/music/MusicFeed.tsx
// The discography as an endless reel, oldest release first. Phones scroll vertically, one release per screen;
// desktops scroll horizontally (mouse wheel, trackpad, arrow keys or the arrow buttons). When the end is reached
// the reel carries straight on into the first release again.
//
// How the loop works: the list is rendered three times in a row. The visitor starts in the middle copy, and
// whenever they drift into the first or last copy the scroll position jumps by exactly one copy's length,
// which looks identical, so the reel never runs out. Only the middle copy is exposed to assistive technology.
'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/icons';
import NeonHeading from '@/components/NeonHeading';
import { usePlayer } from '@/components/player/PlayerProvider';
import type { Release } from '@/lib/discography';

const COPIES = 3;

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return desktop;
}

function ReleaseCard({
  release,
  index,
  total,
  active,
  clone,
  priority,
}: {
  release: Release;
  index: number;
  total: number;
  active: boolean;
  clone: boolean;
  priority: boolean;
}) {
  const { play } = usePlayer();
  const name = release.featuring ? `${release.title} (feat. ${release.featuring})` : release.title;

  return (
    <article
      aria-hidden={clone || undefined}
      inert={clone || undefined}
      aria-roledescription="release"
      aria-label={clone ? undefined : `${index + 1} of ${total}: ${name}, ${release.year}`}
      data-index={index}
      className="music-slide relative shrink-0 snap-center w-full h-full md:w-[min(72vw,1040px)] md:h-full md:px-3 md:py-6 flex"
    >
      <div className="relative flex-1 overflow-hidden bg-ink-2 md:border md:border-line-inv">
        <Image
          src={release.thumbnail}
          alt=""
          fill
          priority={priority}
          unoptimized
          sizes="(min-width: 768px) 72vw, 100vw"
          className={`object-cover transition-[transform,opacity] duration-[1600ms] ease-[var(--ease-quiet)] ${active ? 'scale-105 opacity-90' : 'scale-100 opacity-45'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" aria-hidden="true" />

        <div className="absolute inset-x-0 bottom-0 p-6 pb-10 md:p-10 flex flex-col gap-5">
          <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 eyebrow text-gold-light">
            <span>{release.year}</span>
            {release.format && <span className="text-mist">· {release.format}</span>}
            {release.project && <span className="text-mist">· {release.project}</span>}
            {release.duration && <span className="text-mist">· {formatDuration(release.duration)}</span>}
          </p>
          <div>
            <h2 className="display m-0 text-[2.25rem] sm:text-[3rem] lg:text-[4rem] max-w-[16ch]">{release.title}</h2>
            <p className="m-0 mt-2 text-[0.95rem] md:text-[1.05rem] uppercase tracking-[0.28em]" style={{ color: '#4dff91', textShadow: '0 0 18px rgba(77,255,145,0.45)' }}>
              {release.artist}
              {release.featuring && <span className="text-paper/80 normal-case tracking-[0.06em]"> feat. {release.featuring}</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => play(release.videoId, name)}
              className="zoom-content inline-flex items-center h-12 px-6 rounded-xs bg-paper text-ink text-[0.75rem] font-semibold uppercase tracking-[0.16em] cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon name="play" className="w-3 h-3" />
                Play
              </span>
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${release.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="zoom-content inline-flex items-center h-12 px-6 rounded-xs text-paper text-[0.75rem] font-semibold uppercase tracking-[0.16em]"
              style={{ backgroundColor: '#FF0000' }}
              aria-label={`Watch ${name} on YouTube (opens in a new tab)`}
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon name="brand-youtube" className="w-4 h-4" />
                YouTube
              </span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MusicFeed({ releases }: { releases: Release[] }) {
  const desktop = useIsDesktop();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = releases.length;

  const axis = useCallback(
    (el: HTMLElement) =>
      desktop
        ? { pos: el.scrollLeft, size: el.scrollWidth, view: el.clientWidth, set: (v: number) => (el.scrollLeft = v) }
        : { pos: el.scrollTop, size: el.scrollHeight, view: el.clientHeight, set: (v: number) => (el.scrollTop = v) },
    [desktop]
  );

  /** Jump without animation (the jump is invisible because the copies are identical). */
  const jump = useCallback(
    (el: HTMLElement, to: number) => {
      const prev = el.style.scrollBehavior;
      const prevSnap = el.style.scrollSnapType;
      el.style.scrollBehavior = 'auto';
      el.style.scrollSnapType = 'none';
      axis(el).set(to);
      requestAnimationFrame(() => {
        el.style.scrollSnapType = prevSnap;
        el.style.scrollBehavior = prev;
      });
    },
    [axis]
  );

  // Start on the first release of the middle copy (and again when switching between phone and desktop layouts).
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    // Centre the first slide of the middle copy.
    const first = el.querySelectorAll<HTMLElement>('.music-slide')[n];
    if (!first) return;
    const target = desktop ? first.offsetLeft - (el.clientWidth - first.offsetWidth) / 2 : first.offsetTop;
    jump(el, target);
    setActive(0);
  }, [desktop, jump, n]);

  // Keep the visitor inside the middle copy, and track which release is centred.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { pos, size, view } = axis(el);
        const copy = size / COPIES;
        if (pos < copy * 0.5) jump(el, pos + copy);
        else if (pos > copy * 1.5) jump(el, pos - copy);
        // Centred slide
        const center = (desktop ? el.scrollLeft : el.scrollTop) + view / 2;
        const slides = el.querySelectorAll<HTMLElement>('.music-slide');
        let best = 0;
        let bestDist = Infinity;
        slides.forEach((s) => {
          const mid = desktop ? s.offsetLeft + s.offsetWidth / 2 : s.offsetTop + s.offsetHeight / 2;
          const d = Math.abs(mid - center);
          if (d < bestDist) {
            bestDist = d;
            best = Number(s.dataset.index);
          }
        });
        setActive(best);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
    };
  }, [axis, jump, desktop, n]);

  // Desktop: a vertical mouse wheel moves the reel sideways.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !desktop) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 1.4, behavior: 'auto' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [desktop]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current;
      const slide = el?.querySelector<HTMLElement>('.music-slide');
      if (!el || !slide) return;
      const amount = desktop ? slide.offsetWidth : slide.offsetHeight;
      el.scrollBy({ [desktop ? 'left' : 'top']: dir * amount, behavior: 'smooth' });
    },
    [desktop]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      step(1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      step(-1);
    }
  };

  const current = releases[active];

  return (
    <div className="relative h-[calc(100svh-var(--header-h))] bg-ink overflow-hidden">
      {/* Title and position: fixed over the reel */}
      <div className="pointer-events-none absolute z-10 inset-x-0 top-0 p-5 md:p-8 flex items-start justify-between gap-4 bg-gradient-to-b from-ink/80 to-transparent">
        <NeonHeading as="h1" size="sm" align="left" kicker="Alexx A-Game">
          Discography
        </NeonHeading>
        {current && (
          <p className="m-0 text-right" aria-live="polite">
            <span className="neon-heading neon-heading--sm block" aria-hidden="true" style={{ fontSize: '1.75rem', letterSpacing: '0.12em' }}>
              {current.year}
            </span>
            <span className="eyebrow text-mist tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </p>
        )}
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Discography, ${n} releases, oldest first. Use the arrow keys to move through it; it loops.`}
        className="no-scrollbar h-full flex flex-col md:flex-row overflow-y-auto md:overflow-y-hidden md:overflow-x-auto snap-y md:snap-x snap-mandatory overscroll-contain focus-visible:outline-none"
      >
        {Array.from({ length: COPIES }, (_, copy) =>
          releases.map((release, i) => (
            <ReleaseCard
              key={`${copy}-${release.videoId}`}
              release={release}
              index={i}
              total={n}
              active={copy === 1 && i === active}
              clone={copy !== 1}
              priority={copy === 1 && i < 2}
            />
          ))
        )}
      </div>

      {/* Desktop arrows */}
      <div className="hidden md:flex absolute z-10 bottom-8 right-8 gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => step(dir)}
            aria-label={dir === 1 ? 'Next release' : 'Previous release'}
            className="zoom-content inline-flex items-center justify-center w-12 h-12 rounded-full border border-paper/30 bg-ink/60 text-paper backdrop-blur hover:border-paper/70 cursor-pointer"
          >
            <span>
              <Icon name={dir === 1 ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
            </span>
          </button>
        ))}
      </div>

      {/* Phone hint */}
      <p className="md:hidden pointer-events-none absolute z-10 right-5 bottom-4 m-0 eyebrow text-mist/80" aria-hidden="true">
        Swipe up
      </p>
    </div>
  );
}

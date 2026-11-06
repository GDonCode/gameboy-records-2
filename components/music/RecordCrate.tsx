// components/music/RecordCrate.tsx
// The discography as a crate of records, oldest release first. Sleeves stand edge-on in the crate; the one in the
// middle is pulled forward to face you (on desktop its vinyl slides out of the sleeve) and its details show below.
// Desktop flips sideways (wheel, trackpad, arrow keys, the arrow buttons, or click a sleeve); phones flip
// vertically with a swipe. The crate never ends: past the last record it carries on from the first.
//
// How the loop works: the records are rendered three times in a row. The visitor starts in the middle copy, and
// whenever they drift into the first or last copy the scroll position jumps by exactly one copy's length, which
// looks identical. Only the middle copy is exposed to assistive technology and the Tab key; the copies stay
// clickable, since the records either side of the first and last ones are copies.
'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/icons';
import NeonHeading from '@/components/NeonHeading';
import { usePlayer } from '@/components/player/PlayerProvider';
import type { Release } from '@/lib/discography';
import { spotifyTrackUrl } from '@/lib/spotify-catalog';

const COPIES = 3;

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

const nameOf = (r: Release) => r.title;

function Details({ release, index, total }: { release: Release; index: number; total: number }) {
  const { play } = usePlayer();
  const playId = release.videoId ?? (release.spotifyTrackId ? `spotify:${release.spotifyTrackId}` : null);
  const meta = [release.year, release.project ?? release.format, release.label].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col items-center text-center gap-4" aria-live="polite">
      <p className="m-0 eyebrow text-gold-light">
        <span className="sr-only">
          Record {index + 1} of {total}:{' '}
        </span>
        {meta}
      </p>
      <h2 className="display m-0 text-[1.6rem] sm:text-[2.25rem] lg:text-[2.75rem] max-w-[22ch]">{release.title}</h2>
      <p className="m-0 text-[0.8rem] md:text-[0.95rem] uppercase tracking-[0.22em]" style={{ color: '#4dff91', textShadow: '0 0 16px rgba(77,255,145,0.45)' }}>
        {release.credit}
      </p>
      <ul className="list-none p-0 m-0 mt-1 flex flex-wrap items-center justify-center gap-2.5">
        {playId && (
          <li>
            <button
              type="button"
              onClick={() => play(playId, nameOf(release))}
              className="zoom-content inline-flex items-center h-12 px-6 rounded-xs bg-gold text-ink text-[0.75rem] font-semibold uppercase tracking-[0.16em] cursor-pointer hover:bg-[#F0C928]"
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon name="play" className="w-3 h-3" />
                Play
              </span>
            </button>
          </li>
        )}
        {release.videoId && (
          <li>
            <a href={`https://www.youtube.com/watch?v=${release.videoId}`} target="_blank" rel="noopener noreferrer" className="dsp-btn zoom-content" style={{ backgroundColor: '#FF0000' }} aria-label={`Watch ${release.title} on YouTube (opens in a new tab)`}>
              <span>
                <Icon name="brand-youtube" className="w-5 h-5" />
                YouTube
              </span>
            </a>
          </li>
        )}
        {release.spotifyTrackId && (
          <li>
            <a href={spotifyTrackUrl(release.spotifyTrackId)} target="_blank" rel="noopener noreferrer" className="dsp-btn zoom-content" style={{ backgroundColor: '#1DB954' }} aria-label={`Listen to ${release.title} on Spotify (opens in a new tab)`}>
              <span>
                <Icon name="brand-spotify" className="w-5 h-5" />
                Spotify
              </span>
            </a>
          </li>
        )}
        {release.appleUrl && (
          <li>
            <a href={release.appleUrl} target="_blank" rel="noopener noreferrer" className="dsp-btn zoom-content" style={{ backgroundColor: '#FA243C' }} aria-label={`Listen to ${release.title} on Apple Music (opens in a new tab)`}>
              <span>
                <Icon name="brand-applemusic" className="w-5 h-5" />
                Apple Music
              </span>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function RecordCrate({ releases }: { releases: Release[] }) {
  const desktop = useIsDesktop();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  // The record an arrow-key step is heading to (see step()).
  const targetRef = useRef<HTMLElement | null>(null);
  const targetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = releases.length;

  /** Lay out every sleeve from its distance to the centre of the crate. */
  const paint = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slots = el.querySelectorAll<HTMLElement>('.crate-slot');
    if (!slots.length) return;
    const view = desktop ? el.clientWidth : el.clientHeight;
    const pos = desktop ? el.scrollLeft : el.scrollTop;
    const slotSize = desktop ? slots[0].offsetWidth : slots[0].offsetHeight;
    const sleeve = slots[0].querySelector<HTMLElement>('.crate-sleeve')?.offsetWidth ?? 300;
    const center = pos + view / 2;
    let best = 0;
    let bestDist = Infinity;
    slots.forEach((slot) => {
      const mid = (desktop ? slot.offsetLeft : slot.offsetTop) + slotSize / 2;
      const d = (mid - center) / slotSize;
      const ad = Math.abs(d);
      if (ad < bestDist) {
        bestDist = ad;
        best = Number(slot.dataset.index);
      }
      if (ad > 16) return; // far off screen
      const c = Math.max(-1, Math.min(1, d));
      const a = 1 - Math.min(ad, 1);
      const s = slot.querySelector<HTMLElement>('.crate-sleeve');
      if (!s) return;
      let transform: string;
      if (desktop) {
        const tx = c > 0 ? c * sleeve * 0.8 : c * sleeve * 0.56;
        transform = `translate(-50%, -50%) translateX(${tx.toFixed(1)}px) translateY(${(-a * sleeve * 0.04).toFixed(1)}px) translateZ(${(a * 90).toFixed(1)}px) rotateY(${(-c * 70).toFixed(2)}deg)`;
      } else {
        transform = `translate(-50%, -50%) translateY(${(c * sleeve * 0.56).toFixed(1)}px) translateZ(${(a * 50).toFixed(1)}px) rotateX(${(-c * 52).toFixed(2)}deg)`;
      }
      s.style.transform = transform;
      s.style.zIndex = String(1000 - Math.round(ad * 10));
      s.style.setProperty('--a', a.toFixed(3));
      s.style.setProperty('--shade', Math.min(ad * 0.14, 0.7).toFixed(3));
      s.dataset.front = ad < 0.5 ? 'true' : 'false';
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, [desktop]);

  /** Jump without animation (invisible, because the copies are identical). */
  const jump = useCallback(
    (el: HTMLElement, to: number) => {
      const prevSnap = el.style.scrollSnapType;
      el.style.scrollBehavior = 'auto';
      el.style.scrollSnapType = 'none';
      if (desktop) el.scrollLeft = to;
      else el.scrollTop = to;
      requestAnimationFrame(() => {
        el.style.scrollSnapType = prevSnap;
        el.style.scrollBehavior = '';
      });
    },
    [desktop]
  );

  // Start on the first record of the middle copy.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    const first = el.querySelectorAll<HTMLElement>('.crate-slot')[n];
    if (!first) return;
    const target = desktop ? first.offsetLeft - (el.clientWidth - first.offsetWidth) / 2 : first.offsetTop - (el.clientHeight - first.offsetHeight) / 2;
    jump(el, target);
    paint();
  }, [desktop, jump, n, paint]);

  // Scroll: keep inside the middle copy and repaint.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pos = desktop ? el.scrollLeft : el.scrollTop;
        const size = desktop ? el.scrollWidth : el.scrollHeight;
        const copy = size / COPIES;
        // Wrap only when the visitor scrolls by hand; arrow-key steps handle their own wrapping.
        if (!targetRef.current) {
          if (pos < copy * 0.5) jump(el, pos + copy);
          else if (pos > copy * 1.5) jump(el, pos - copy);
        }
        paint();
      });
    };
    const onResize = () => paint();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [desktop, jump, n, paint]);

  // Desktop: a vertical mouse wheel flips sideways.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !desktop) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'auto' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [desktop]);

  /** Bring a slot to the centre. */
  const centerSlot = useCallback(
    (slot: HTMLElement) => {
      const el = scrollerRef.current;
      if (!el) return;
      const target = desktop ? slot.offsetLeft - (el.clientWidth - slot.offsetWidth) / 2 : slot.offsetTop - (el.clientHeight - slot.offsetHeight) / 2;
      el.scrollTo({ [desktop ? 'left' : 'top']: target, behavior: 'smooth' });
    },
    [desktop]
  );

  // Arrow keys and buttons move exactly one record, even when pressed quickly: each press steps from the
  // record the previous press was heading to, not from wherever the scroll animation has got to.
  const step = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      const slots = Array.from(el.querySelectorAll<HTMLElement>('.crate-slot'));
      let from = targetRef.current && el.contains(targetRef.current) ? targetRef.current : null;
      if (!from) {
        const center = desktop ? el.scrollLeft + el.clientWidth / 2 : el.scrollTop + el.clientHeight / 2;
        from = slots.reduce((best, s) => {
          const mid = (x: HTMLElement) => (desktop ? x.offsetLeft + x.offsetWidth / 2 : x.offsetTop + x.offsetHeight / 2);
          return Math.abs(mid(s) - center) < Math.abs(mid(best) - center) ? s : best;
        }, slots[0]);
      }
      // Keep the move inside the middle copy: if we've drifted into a clone, hop to the same record in the
      // middle copy first (an invisible jump), then step from there.
      let idx = slots.indexOf(from);
      const shift = idx < n ? n : idx >= 2 * n ? -n : 0;
      if (shift) {
        const slotSize = desktop ? from.offsetWidth : from.offsetHeight;
        jump(el, (desktop ? el.scrollLeft : el.scrollTop) + shift * slotSize);
        idx += shift;
      }
      const next = slots[idx + dir];
      if (!next) return;
      targetRef.current = next;
      if (targetTimer.current) clearTimeout(targetTimer.current);
      targetTimer.current = setTimeout(() => (targetRef.current = null), 700);
      centerSlot(next);
    },
    [desktop, centerSlot, jump, n]
  );

  const { play } = usePlayer();
  const onSleeveClick = (e: React.MouseEvent<HTMLButtonElement>, r: Release) => {
    const slot = e.currentTarget.closest<HTMLElement>('.crate-slot');
    if (!slot) return;
    const el = scrollerRef.current!;
    const slotSize = desktop ? slot.offsetWidth : slot.offsetHeight;
    const mid = (desktop ? slot.offsetLeft : slot.offsetTop) + slotSize / 2;
    const center = (desktop ? el.scrollLeft + el.clientWidth / 2 : el.scrollTop + el.clientHeight / 2);
    if (Math.abs(mid - center) < slotSize / 2) {
      const id = r.videoId ?? (r.spotifyTrackId ? `spotify:${r.spotifyTrackId}` : null);
      if (id) play(id, r.title);
    } else {
      centerSlot(slot);
    }
  };

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
    <div className="crate relative h-[calc(100svh-var(--header-h))] min-h-[560px] bg-ink overflow-hidden flex flex-col">
      <style>{`
        .crate { --sleeve: clamp(170px, 30svh, 240px); --slot: calc(var(--sleeve) * 0.26); }
        @media (min-width: 768px) { .crate { --sleeve: clamp(220px, 36vh, 340px); --slot: calc(var(--sleeve) * 0.3); } }
        .crate-scroller { perspective: 1200px; perspective-origin: 50% 45%; }
        .crate-scroller:focus-visible { outline: none; }
        .crate-scroller:focus-visible .crate-sleeve[data-front='true'] .crate-cover { outline: 2px solid var(--color-gold); outline-offset: 4px; }
        .crate-slot { position: relative; pointer-events: none; transform-style: preserve-3d; flex: 0 0 var(--slot); width: var(--slot); height: var(--slot); scroll-snap-align: center; }
        @media (min-width: 768px) { .crate-slot { height: 100%; } }
        @media (max-width: 767px) { .crate-slot { width: 100%; } }
        .crate-sleeve {
          position: absolute; left: 50%; top: 50%;
          width: var(--sleeve); height: var(--sleeve);
          transform-style: preserve-3d; will-change: transform;
          padding: 0; border: 0; background: none; cursor: pointer; pointer-events: auto;
        }
        .crate-cover {
          position: absolute; inset: 0; overflow: hidden; border-radius: 2px; background: #15130F;
          box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 50px -20px rgba(0,0,0,0.9);
          outline: 1px solid rgba(245,245,245,0.08); outline-offset: -1px;
        }
        .crate-cover::after { content: ''; position: absolute; inset: 0; background: #0B0A07; opacity: var(--shade, 0); pointer-events: none; }
        .crate-disc {
          position: absolute; top: 3%; left: 3%; width: 94%; height: 94%; border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, #1b1a17 0 15%, transparent 15.5%),
            repeating-radial-gradient(circle at 50% 50%, #0d0c0a 0 2px, #17160f 2px 3px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 18px 40px -16px rgba(0,0,0,0.9);
          transform: translateX(calc(var(--a, 0) * 46%)) rotate(calc(var(--a, 0) * 120deg));
          transition: transform 500ms var(--ease-quiet);
        }
        .crate-disc-label { position: absolute; inset: 34%; border-radius: 50%; overflow: hidden; border: 2px solid #0B0A07; }
        .crate-disc-label::after { content: ''; position: absolute; left: 50%; top: 50%; width: 8%; height: 8%; transform: translate(-50%,-50%); border-radius: 50%; background: #0B0A07; }
        @media (max-width: 767px) { .crate-disc { display: none; } }
        .crate-sleeve:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 6px; }
        @media (prefers-reduced-motion: reduce) { .crate-disc { transition: none; } }
      `}</style>

      {/* Title and position */}
      <div className="pointer-events-none relative z-20 flex items-start justify-between gap-4 px-5 pt-5 md:px-8 md:pt-7">
        <NeonHeading as="h1" size="sm" align="left" kicker="Alexx A-Game">
          Discography
        </NeonHeading>
        {current && (
          <p className="m-0 text-right">
            <span className="neon-heading neon-heading--sm block" aria-hidden="true" style={{ fontSize: '1.75rem', letterSpacing: '0.12em' }}>
              {current.year}
            </span>
            <span className="eyebrow text-mist tabular-nums" aria-hidden="true">
              {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </p>
        )}
      </div>

      {/* The crate */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollerRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Record crate: ${n} releases, oldest first. Use the arrow keys to flip through; it loops.`}
          className="crate-scroller no-scrollbar absolute inset-0 flex flex-col md:flex-row overflow-y-auto md:overflow-y-hidden md:overflow-x-auto snap-y md:snap-x snap-mandatory overscroll-contain focus-visible:outline-none"
        >
          {Array.from({ length: COPIES }, (_, copy) =>
            releases.map((r, i) => {
              const clone = copy !== 1;
              return (
                <div key={`${copy}-${r.id}`} className="crate-slot" data-index={i} aria-hidden={clone || undefined}>
                  <button
                    type="button"
                    className="crate-sleeve"
                    onClick={(e) => onSleeveClick(e, r)}
                    aria-label={`${r.title}, ${r.year}${r.credit !== 'Alexx A-Game' ? `, ${r.credit}` : ''}`}
                    tabIndex={clone ? -1 : 0}
                  >
                    <span className="crate-disc" aria-hidden="true">
                      <span className="crate-disc-label">
                        <Image src={r.cover} alt="" fill sizes="120px" unoptimized className="object-cover" />
                      </span>
                    </span>
                    <span className="crate-cover">
                      <Image src={r.cover} alt="" fill sizes="(min-width: 768px) 360px, 250px" unoptimized loading={copy === 1 && i < 4 ? 'eager' : 'lazy'} className="object-cover" />
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Crate front: the records stand inside it (desktop) */}
        <div className="pointer-events-none hidden md:flex absolute z-[1500] inset-x-0 bottom-0 h-[22%] items-end justify-center pb-4" aria-hidden="true" style={{ background: 'linear-gradient(to bottom, rgba(11,10,7,0) 0%, rgba(11,10,7,0.92) 38%, #0B0A07 100%)' }}>
          <span className="eyebrow text-mist/50">Gameboy Records · Crate 01 · 2014 — {releases[releases.length - 1]?.year}</span>
        </div>

        {/* Desktop arrows */}
        <div className="hidden md:flex absolute z-[1600] inset-y-0 left-0 right-0 items-center justify-between px-6 pointer-events-none">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => step(dir)}
              aria-label={dir === 1 ? 'Next record' : 'Previous record'}
              className="pointer-events-auto zoom-content inline-flex items-center justify-center w-12 h-12 rounded-full border border-paper/30 bg-ink/70 text-paper backdrop-blur hover:border-paper/70 cursor-pointer"
            >
              <span>
                <Icon name={dir === 1 ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The record in front */}
      <div className="relative z-20 shrink-0 px-5 pt-3 pb-6 md:pb-10">
        {current && <Details release={current} index={active} total={n} />}
        <p className="md:hidden m-0 mt-4 text-center eyebrow text-mist/70" aria-hidden="true">
          Swipe to flip · Tap the record to play
        </p>
      </div>
    </div>
  );
}

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
import { usePlayer } from '@/components/player/PlayerProvider';
import type { Release } from '@/lib/discography';
import { spotifyTrackUrl } from '@/lib/spotify-catalog';

const COPIES = 3;

// Releases flagged with a NEW tag on their sleeve (and in the details below the crate).
const NEW_TITLES = new Set(['still a rise', 'rise up now (guitar version)']);
const isNew = (r: Release) => NEW_TITLES.has(r.title.trim().toLowerCase());

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

const TIMELINE_START = 2014;
const TIMELINE_END = 2026;
const TIMELINE_YEARS = Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }, (_, i) => TIMELINE_START + i);
/** A simple year line for the discography: one circle per year, filled up to the year of the record in front. Tap a year to jump there. */
function Timeline({ year, onSelect }: { year: number; onSelect: (year: number) => void }) {
  const span = TIMELINE_END - TIMELINE_START;
  const current = Math.max(TIMELINE_START, Math.min(TIMELINE_END, year));
  const pctOf = (y: number) => ((y - TIMELINE_START) / span) * 100;
  const ease = 'duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';
  return (
    <nav aria-label="Jump to a year" className="relative z-10 mx-auto w-full max-w-[920px] shrink-0 px-[clamp(22px,4vw,44px)]">
      <div className="relative mb-[clamp(16px,3vh,26px)] h-6">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/20" />
        <div
          className={`absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-green transition-[width] ${ease}`}
          style={{ width: `${pctOf(current)}%` }}
        />
        {TIMELINE_YEARS.map((y) => {
          const isCurrent = y === current;
          const reached = y < current;
          return (
            <button
              key={y}
              type="button"
              onClick={() => onSelect(y)}
              aria-label={`Jump to ${y}`}
              aria-current={isCurrent || undefined}
              className="group absolute top-0 flex h-6 w-6 -translate-x-1/2 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-light"
              style={{ left: `${pctOf(y)}%` }}
            >
              <span
                className={`block rounded-full transition-[width,height,background-color,box-shadow] ${ease} ${
                  isCurrent
                    ? 'h-4 w-4 bg-green shadow-[0_0_0_4px_rgba(6,127,58,0.4)]'
                    : reached
                      ? 'h-2 w-2 bg-green group-hover:scale-125'
                      : 'h-2 w-2 bg-green/30 group-hover:bg-green'
                }`}
              />
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap text-[clamp(0.55rem,1.3vh,0.7rem)] font-semibold tracking-[0.06em] transition-colors duration-500 ${
                  isCurrent ? 'text-green-light' : 'text-paper/45 group-hover:text-paper'
                }`}
              >
                <span className="hidden md:inline">{y}</span>
                <span className="md:hidden">&rsquo;{String(y).slice(2)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Details({ release, index, total }: { release: Release; index: number; total: number }) {
  const { play } = usePlayer();
  const playId = release.videoId ?? (release.spotifyTrackId ? `spotify:${release.spotifyTrackId}` : null);

  return (
    <div className="flex flex-col items-center text-center gap-[clamp(6px,1.4vh,14px)]" aria-live="polite">
      {isNew(release) && <span className="crate-new crate-new--inline">NEW</span>}
      <p className="sr-only">
        Record {index + 1} of {total}, released {release.year}
      </p>
      <h2 className="display m-0 max-w-full truncate whitespace-nowrap text-[clamp(1.1rem,min(4.4vh,4.6vw),2.75rem)]">{release.title}</h2>
      <p className="m-0 text-[clamp(0.68rem,1.7vh,0.95rem)] uppercase tracking-[0.22em] line-clamp-2" style={{ color: '#4dff91', textShadow: '0 0 16px rgba(77,255,145,0.45)' }}>
        {release.credit}
      </p>
      <ul className="list-none p-0 m-0 mt-[clamp(0px,0.6vh,6px)] flex flex-wrap items-center justify-center gap-2.5">
        {playId && (
          <li className="basis-full flex justify-center md:basis-auto">
            <button
              type="button"
              onClick={() => play(playId, nameOf(release))}
              className="zoom-content inline-flex items-center h-[var(--crate-btn)] px-6 rounded-xs bg-gold text-ink text-[0.75rem] font-semibold uppercase tracking-[0.16em] cursor-pointer hover:bg-[#F0C928]"
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
            <a href={`https://www.youtube.com/watch?v=${release.videoId}`} target="_blank" rel="noopener noreferrer" className="dsp-btn dsp-compact zoom-content" style={{ backgroundColor: '#FF0000' }} aria-label={`Watch ${release.title} on YouTube (opens in a new tab)`}>
              <span>
                <Icon name="brand-youtube" className="w-5 h-5" />
                <span className="dsp-label">YouTube</span>
              </span>
            </a>
          </li>
        )}
        {release.spotifyTrackId && (
          <li>
            <a href={spotifyTrackUrl(release.spotifyTrackId)} target="_blank" rel="noopener noreferrer" className="dsp-btn dsp-compact zoom-content" style={{ backgroundColor: '#1DB954' }} aria-label={`Listen to ${release.title} on Spotify (opens in a new tab)`}>
              <span>
                <Icon name="brand-spotify" className="w-5 h-5" />
                <span className="dsp-label">Spotify</span>
              </span>
            </a>
          </li>
        )}
        {release.appleUrl && (
          <li>
            <a href={release.appleUrl} target="_blank" rel="noopener noreferrer" className="dsp-btn dsp-compact zoom-content" style={{ backgroundColor: '#FA243C' }} aria-label={`Listen to ${release.title} on Apple Music (opens in a new tab)`}>
              <span>
                <Icon name="brand-applemusic" className="w-5 h-5" />
                <span className="dsp-label">Apple Music</span>
              </span>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * `embedded` is the Home section. It is one screen tall (the fixed header floats over its top edge) and flips sideways
 * at every screen size, so a vertical swipe or wheel turn scrolls the page past it instead of getting stuck in the
 * crate. Only sideways gestures, the arrow keys/buttons and a tap on a sleeve move the records there.
 */
export default function RecordCrate({ releases, embedded = false }: { releases: Release[]; embedded?: boolean }) {
  const isDesktop = useIsDesktop();
  const desktop = embedded || isDesktop; // "desktop" below means "the crate runs sideways"
  const scrollerRef = useRef<HTMLDivElement>(null);
  const crateRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(Math.max(0, releases.length - 1)); // the crate opens on the latest release
  const activeRef = useRef(Math.max(0, releases.length - 1));
  // The record an arrow-key step is heading to (see step()).
  // Where the crate is heading (an index into all the slots, three copies of the list), and when it last
  // was told to move. The loop's invisible jumps only ever happen once everything has come to rest.
  const headingRef = useRef<number | null>(null);
  const lastMoveRef = useRef(0);
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
      if (ad > 16) {
        // Far off screen: no need to lay it out, just make sure it isn't marked as the front record.
        const far = slot.querySelector<HTMLElement>('.crate-sleeve');
        if (far && far.dataset.front === 'true') far.dataset.front = 'false';
        return;
      }
            const a = 1 - Math.min(ad, 1);
      const s = slot.querySelector<HTMLElement>('.crate-sleeve');
      if (!s) return;
      let transform: string;
      if (desktop) {
        // A curved gallery: every cover faces forward in an evenly spaced row, and the ones further out
        // swing round to face the middle and recede, like the inside of a drum.
        const turn = Math.max(-38, Math.min(38, -d * 17));
        const back = Math.min(ad, 3) * sleeve * 0.16;
        transform = `translate(-50%, -50%) translateY(${(-a * sleeve * 0.03).toFixed(1)}px) translateZ(${(a * 60 - back).toFixed(1)}px) rotateY(${turn.toFixed(2)}deg)`;
      } else {
        // Phones: flat covers one slot apart (a slot is almost a full cover tall), the ones beside the front
        // a little smaller and dimmer. Nothing tilts or overlaps, so covers never clip into each other.
        const k = Math.min(ad, 1);
        transform = `translate(-50%, -50%) scale(${(1 - 0.14 * k).toFixed(3)})`;
        s.style.opacity = (1 - 0.5 * k).toFixed(3);
      }
      if (desktop) s.style.opacity = '';
      s.style.transform = transform;
      s.style.zIndex = String(1000 - Math.round(ad * 10));
      s.style.setProperty('--a', a.toFixed(3));
      s.style.setProperty('--shade', Math.min(ad * 0.2, 0.7).toFixed(3));
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
      el.style.scrollBehavior = 'auto';
      el.style.scrollSnapType = 'none';
      if (desktop) el.scrollLeft = to;
      else el.scrollTop = to;
      requestAnimationFrame(() => {
        // Back to what the classes say. (Remembering the previous inline value could keep snapping off for good
        // if two jumps landed in the same frame.)
        el.style.scrollSnapType = '';
        el.style.scrollBehavior = '';
      });
    },
    [desktop]
  );

  /** The slot whose centre is nearest the middle of the crate. */
  const nearestSlot = useCallback(
    (el: HTMLElement) => {
      const slots = Array.from(el.querySelectorAll<HTMLElement>('.crate-slot'));
      const center = desktop ? el.scrollLeft + el.clientWidth / 2 : el.scrollTop + el.clientHeight / 2;
      const mid = (x: HTMLElement) => (desktop ? x.offsetLeft + x.offsetWidth / 2 : x.offsetTop + x.offsetHeight / 2);
      return slots.reduce((best, s) => (Math.abs(mid(s) - center) < Math.abs(mid(best) - center) ? s : best), slots[0]);
    },
    [desktop]
  );

  /** Scroll position that puts a slot in the middle of the crate. */
  const slotCenterTarget = useCallback(
    (el: HTMLElement, slot: HTMLElement) =>
      desktop ? slot.offsetLeft - (el.clientWidth - slot.offsetWidth) / 2 : slot.offsetTop - (el.clientHeight - slot.offsetHeight) / 2,
    [desktop]
  );

  // Size the records to the space left once the details have taken theirs, so everything fits on one screen
  // at any window size (short laptop screens and zoomed-in browsers included).
  useLayoutEffect(() => {
    const crate = crateRef.current;
    const stage = stageRef.current;
    if (!crate || !stage) return;
    let last = '';
    const fit = () => {
      const h = stage.clientHeight;
      const w = stage.clientWidth;
      // The front record is lifted and brought forward, so it needs a little headroom.
      const size = desktop ? Math.min(h * 0.84, w * 0.215, 480) : Math.min(h * 0.74, w * 0.82, 340);
      const value = `${Math.max(120, Math.floor(size))}px`;
      if (value === last) return;
      last = value;
      // Changing the record size moves every slot, so remember which record is in front and put it back.
      const el = scrollerRef.current;
      const front = el ? nearestSlot(el) : null;
      crate.style.setProperty('--sleeve', value);
      if (el && front) jump(el, slotCenterTarget(el, front));
      paint();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [desktop, jump, nearestSlot, paint, slotCenterTarget]);

  // Start on the latest record (the last one, as the list is oldest first) of the middle copy.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    const first = el.querySelectorAll<HTMLElement>('.crate-slot')[2 * n - 1];
    if (!first) return;
    const target = desktop ? first.offsetLeft - (el.clientWidth - first.offsetWidth) / 2 : first.offsetTop - (el.clientHeight - first.offsetHeight) / 2;
    jump(el, target);
    headingRef.current = 2 * n - 1;
    paint();
  }, [desktop, jump, n, paint]);

  // Scroll: repaint, and keep the crate inside the middle copy of the list. The invisible jump back to the
  // middle copy only happens when nothing is moving (no scrolling for a moment, and no step requested for a
  // moment), never while a record is still travelling to the front: jumping then cancels the animation and the
  // crate lands on the wrong record.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | null = null;
    const settle = () => {
      if (performance.now() - lastMoveRef.current < 450) {
        idle = setTimeout(settle, 120);
        return;
      }
      const slots = Array.from(el.querySelectorAll<HTMLElement>('.crate-slot'));
      if (slots.length < 3 * n) return;
      const center = desktop ? el.scrollLeft + el.clientWidth / 2 : el.scrollTop + el.clientHeight / 2;
      const mid = (x: HTMLElement) => (desktop ? x.offsetLeft + x.offsetWidth / 2 : x.offsetTop + x.offsetHeight / 2);
      let near = 0;
      for (let i = 1; i < slots.length; i++) if (Math.abs(mid(slots[i]) - center) < Math.abs(mid(slots[near]) - center)) near = i;
      headingRef.current = near;
      const copy = desktop
        ? slots[n].getBoundingClientRect().left - slots[0].getBoundingClientRect().left
        : slots[n].getBoundingClientRect().top - slots[0].getBoundingClientRect().top;
      const pos = desktop ? el.scrollLeft : el.scrollTop;
      if (near < n) {
        jump(el, pos + copy);
        headingRef.current = near + n;
      } else if (near >= 2 * n) {
        jump(el, pos - copy);
        headingRef.current = near - n;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
      if (idle) clearTimeout(idle);
      idle = setTimeout(settle, 200);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      if (idle) clearTimeout(idle);
      el.removeEventListener('scroll', onScroll);
    };
  }, [desktop, jump, n, paint]);

  /** Bring a slot to the centre. */
  const centerSlot = useCallback(
    (slot: HTMLElement) => {
      const el = scrollerRef.current;
      if (!el) return;
      const target = desktop ? slot.offsetLeft - (el.clientWidth - slot.offsetWidth) / 2 : slot.offsetTop - (el.clientHeight - slot.offsetHeight) / 2;
      headingRef.current = Array.from(el.querySelectorAll<HTMLElement>('.crate-slot')).indexOf(slot);
      lastMoveRef.current = performance.now();
      el.scrollTo({ [desktop ? 'left' : 'top']: target, behavior: 'smooth' });
    },
    [desktop]
  );

  /** Year timeline: go to the first release of that year (or the nearest year that has one), by the shortest way round. */
  const jumpToYear = useCallback(
    (year: number) => {
      const el = scrollerRef.current;
      if (!el || n === 0) return;
      let target = 0;
      let bestGap = Infinity;
      releases.forEach((r, i) => {
        const gap = Math.abs(r.year - year);
        if (gap < bestGap) {
          bestGap = gap;
          target = i;
        }
      });
      const copies = Array.from(el.querySelectorAll<HTMLElement>('.crate-slot')).filter((sl) => Number(sl.dataset.index) === target);
      if (copies.length === 0) return;
      const center = desktop ? el.scrollLeft + el.clientWidth / 2 : el.scrollTop + el.clientHeight / 2;
      const mid = (x: HTMLElement) => (desktop ? x.offsetLeft + x.offsetWidth / 2 : x.offsetTop + x.offsetHeight / 2);
      centerSlot(copies.reduce((best, sl) => (Math.abs(mid(sl) - center) < Math.abs(mid(best) - center) ? sl : best), copies[0]));
    },
    [centerSlot, desktop, n, releases]
  );

  // Arrow keys, buttons and the wheel move exactly one record, even when pressed quickly: each press steps from
  // the record the previous press was heading to, not from wherever the scroll animation has got to.
  const step = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      const slots = Array.from(el.querySelectorAll<HTMLElement>('.crate-slot'));
      if (slots.length === 0) return;
      let from = headingRef.current;
      if (from === null || from < 0 || from >= slots.length) from = slots.indexOf(nearestSlot(el));
      const to = Math.max(0, Math.min(slots.length - 1, from + dir));
      headingRef.current = to;
      lastMoveRef.current = performance.now();
      centerSlot(slots[to]);
    },
    [centerSlot, nearestSlot]
  );

  // Desktop: the mouse wheel and trackpad flip one record at a time. Free scrolling fought the snapping
  // (the crate would settle on one record, then the next), so movement is gathered up and turned into
  // clean steps: a gentle scroll moves one record, a long flick moves several in a row.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !desktop || embedded) return; // Home: buttons (and arrow keys) only; the wheel always scrolls the page
    let acc = 0;
    let lastEvent = 0;
    let lockedUntil = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
      if (now - lastEvent > 220) acc = 0; // a new gesture
      lastEvent = now;
      if (now < lockedUntil) return;
      acc += delta;
      if (Math.abs(acc) >= 40) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        lockedUntil = now + 260;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [desktop, embedded, step]);

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
    <div
      ref={crateRef}
      data-axis={desktop ? 'x' : 'y'}
      data-embedded={embedded || undefined}
      className={`crate relative paper-ink overflow-hidden flex flex-col ${embedded ? 'h-[100svh] pt-(--header-h)' : 'h-[calc(100svh-var(--header-h))]'}`}
    >
      <style>{`
        .crate { --crate-btn: clamp(36px, 5.4vh, 48px); --sleeve: clamp(220px, 44svh, 320px); --slot: calc(var(--sleeve) * 1); }
        @media (min-width: 768px) { .crate { --sleeve: clamp(280px, 52vh, 480px); --slot: calc(var(--sleeve) * 1.16); } }
        /* "NEW" sticker: gold, hard ink edge, green offset shadow, a little off-kilter like the other brand tags. */
        .crate-new {
          position: absolute; top: -12px; right: -14px; z-index: 3; transform: rotate(8deg);
          padding: 5px 11px; background: #E2BA0A; color: #0B0A07; border: 2px solid #0B0A07; box-shadow: 3px 3px 0 #067F3A;
          font-family: 'Poppins_semibold', 'Poppins', sans-serif; font-size: 0.78rem; line-height: 1; letter-spacing: 0.18em; pointer-events: none;
        }
        .crate-new--inline { position: static; transform: rotate(-3deg); }
        .crate-scroller { perspective: 1400px; perspective-origin: 50% 45%; }
        @media (min-width: 768px) { .crate-scroller { -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%); } }
        .crate[data-axis='x'] .crate-scroller { -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%); }
        .crate-scroller:focus-visible { outline: none; }
        .crate-scroller:focus-visible .crate-sleeve[data-front='true'] .crate-cover { outline: 2px solid var(--color-gold); outline-offset: 4px; }
        .crate-slot { position: relative; pointer-events: none; transform-style: preserve-3d; flex: 0 0 var(--slot); width: var(--slot); height: var(--slot); scroll-snap-align: center; scroll-snap-stop: always; }
        @media (min-width: 768px) { .crate-slot { height: 100%; } }
        @media (max-width: 767px) { .crate-slot { width: 100%; } }
        .crate[data-axis='x'] .crate-slot { width: var(--slot); height: 100%; }
        .crate-sleeve {
          position: absolute; left: 50%; top: 50%;
          width: var(--sleeve); height: var(--sleeve);
          transform: translate(-50%, -50%); /* until the script lays the crate out */
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
          transform: translateX(calc(var(--a, 0) * 30%)) rotate(calc(var(--a, 0) * 120deg));
          transition: transform 500ms var(--ease-quiet);
        }
        .crate-disc-label { position: absolute; inset: 34%; border-radius: 50%; overflow: hidden; border: 2px solid #0B0A07; }
        .crate-disc-label::after { content: ''; position: absolute; left: 50%; top: 50%; width: 8%; height: 8%; transform: translate(-50%,-50%); border-radius: 50%; background: #0B0A07; }
        @media (max-width: 767px) { .crate-disc { display: none; } }
        .crate .dsp-btn { height: var(--crate-btn); padding: 0 18px; }
        /* The details keep one fixed height whatever the song, so the records never resize as you flip. */
        .crate-details { height: clamp(150px, 27vh, 250px); }
        @media (max-width: 767px) { .crate-details { height: clamp(214px, 35svh, 272px); padding-top: 30px; } .crate .dsp-btn { padding: 0 14px; } }
        .crate-sleeve:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 6px; }
        @media (prefers-reduced-motion: reduce) { .crate-disc { transition: none; } }
      `}</style>

      {/* Page title for screen readers and search engines; the records speak for themselves on screen. */}
      {embedded ? (
        <h2 id="crate-title" className="sr-only">
          Music
        </h2>
      ) : (
        <h1 className="sr-only">Alexx A-Game discography</h1>
      )}

      {/* The records and the details form one group, centred in the space below the header. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center">
      {current && <Timeline year={current.year} onSelect={jumpToYear} />}
      {/* The crate */}
      <div ref={stageRef} className="relative min-h-0 flex-1 max-h-[calc(var(--sleeve)*1.3)] mt-[clamp(12px,3.5vh,44px)] md:mt-[clamp(20px,5vh,56px)]">
        <div
          ref={scrollerRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Record crate: ${n} releases, oldest first. Use the arrow keys to flip through; it loops.`}
          className={`crate-scroller no-scrollbar absolute inset-0 flex snap-mandatory focus-visible:outline-none ${
            embedded ? 'flex-row overflow-hidden snap-x' : 'flex-col md:flex-row overflow-y-auto md:overflow-y-hidden md:overflow-x-auto snap-y md:snap-x overscroll-contain'
          }`}
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
                    aria-label={`${r.title}, ${r.year}${r.credit !== 'Alexx A-Game' ? `, ${r.credit}` : ''}${isNew(r) ? ', new' : ''}`}
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
                    {isNew(r) && (
                      <span className="crate-new" aria-hidden="true">
                        NEW
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop arrows */}
        <div className={`${embedded ? 'flex' : 'hidden md:flex'} absolute z-[1600] inset-y-0 left-0 right-0 items-center justify-between px-3 md:px-6 pointer-events-none`}>
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => step(dir)}
              aria-label={dir === 1 ? 'Next record' : 'Previous record'}
              className="pointer-events-auto zoom-content inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-ink bg-white bg-[url('/brand/paper-texture.webp')] bg-cover bg-center text-ink shadow-[3px_3px_0_rgba(0,0,0,0.6)] hover:border-green cursor-pointer"
            >
              <span>
                <Icon name={dir === 1 ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The record in front */}
      <div className="crate-details relative z-20 shrink-0 px-5 pb-[clamp(10px,2.4vh,32px)] flex flex-col justify-center overflow-hidden">
        {current && <Details release={current} index={active} total={n} />}
      </div>
      </div>
    </div>
  );
}

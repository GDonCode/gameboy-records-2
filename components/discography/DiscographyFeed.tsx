// components/discography/DiscographyFeed.tsx
'use client';

// Horizontally scrolling reel of every music video, newest first. A year timeline runs along the top, with a
// neon marker that tracks the scroll position exactly and names the year you're in. The video in the middle
// plays a muted preview; clicking (or tapping) any video opens it full screen with sound.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Release } from '@/lib/discography';

const SEMI = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;
const BODY = { fontFamily: "'Poppins', sans-serif" } as const;
const NEON = '#4dff91';
const CHANNEL_URL = 'https://www.youtube.com/@LifeOfGameBoy';

const yearOf = (iso: string | null) => (iso ? new Date(iso).getUTCFullYear() : null);

function timeAgo(iso: string) {
  const days = (Date.now() - Date.parse(iso)) / 86_400_000;
  if (days < 1) return 'today';
  if (days < 30) return `${Math.floor(days)} day${days < 2 ? '' : 's'} ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
}

const formatDuration = (s: number) =>
  s >= 3600
    ? `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const formatViews = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

function embedUrl(videoId: string, muted: boolean) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    playsinline: '1',
    loop: '1',
    playlist: videoId, // required for loop to work on a single video
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: window.location.origin,
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

/** Sends a command to an embedded YouTube player (works with enablejsapi=1). */
function command(frame: HTMLIFrameElement | null | undefined, func: 'mute' | 'unMute' | 'playVideo' | 'seekTo', args: unknown[] = []) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
}

// ── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  share: <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  note: <path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
  eye: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  mic: <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />,
};
function Svg({ children, className = 'h-5 w-5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

const iconBtn =
  'pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4dff91] cursor-pointer md:h-9 md:w-9';

// ── TIMELINE ─────────────────────────────────────────────────────────────────
interface YearTick { year: number; index: number; pos: number }

function Timeline({
  ticks,
  year,
  onJump,
}: {
  ticks: YearTick[];
  year: number | null;
  onJump: (index: number) => void;
}) {
  return (
    <div className="relative mx-auto h-[64px] w-full max-w-[1400px] flex-shrink-0 px-10 md:h-[76px] md:px-16" aria-label="Release years">
      <div className="relative h-full">
        {/* The rail, lit up to the marker. */}
        <div className="absolute inset-x-0 bottom-[14px] h-px bg-white/15" />
        <div
          className="absolute left-0 bottom-[14px] h-px origin-left"
          style={{ width: 'calc(var(--p, 0) * 100%)', background: NEON, boxShadow: `0 0 6px ${NEON}` }}
        />

        {ticks.map((t) => (
          <button
            key={t.year}
            type="button"
            onClick={() => onJump(t.index)}
            aria-label={`Jump to ${t.year}`}
            className="group absolute bottom-[6px] flex -translate-x-1/2 flex-col items-center gap-1.5 cursor-pointer"
            style={{ left: `${t.pos * 100}%` }}
          >
            <span style={BODY} className="hidden text-[10px] tracking-[0.12em] text-white/35 transition-colors group-hover:text-white md:block">
              {t.year}
            </span>
            <span className="h-[9px] w-px bg-white/40 group-hover:bg-white" />
            <span className="h-[7px]" />
          </button>
        ))}

        {/* The marker: positioned straight from the scroll position (see onScroll), not by React. */}
        {year !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[6px] flex -translate-x-1/2 flex-col items-center"
            style={{ left: 'calc(var(--p, 0) * 100%)' }}
          >
            <span
              style={{ ...SEMI, color: '#d9ffe8', borderColor: NEON, textShadow: `0 0 4px ${NEON}, 0 0 12px ${NEON}`, boxShadow: `0 0 10px rgba(77,255,145,0.55), inset 0 0 8px rgba(77,255,145,0.3)` }}
              className="border bg-black/60 px-2.5 py-0.5 text-[13px] tracking-[0.2em] md:text-[15px]"
            >
              {year}
            </span>
            <span className="h-[10px] w-[2px]" style={{ background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
            <span className="h-[8px] w-[8px] rounded-full" style={{ background: NEON, boxShadow: `0 0 8px ${NEON}, 0 0 16px ${NEON}` }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── VIDEO CARD ───────────────────────────────────────────────────────────────
function VideoCard({
  release,
  active,
  preview,
  fullscreen,
  muted,
  cardRef,
  frameRef,
  onOpen,
  onClose,
  onShare,
}: {
  release: Release;
  active: boolean;
  /** Play the muted preview. */
  preview: boolean;
  fullscreen: boolean;
  muted: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  frameRef: (el: HTMLIFrameElement | null) => void;
  onOpen: (el: HTMLDivElement) => void;
  onClose: () => void;
  onShare: () => void;
}) {
  const playing = preview || fullscreen;
  // The player's address is fixed when it mounts; later sound changes go through commands, so it never reloads.
  // (Never on the server: nothing plays until effects have run in the browser.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const src = useMemo(() => (playing ? embedUrl(release.videoId, muted) : null), [playing, release.videoId]);
  const mutedRef = useRef(muted);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const viewport = useRef<HTMLDivElement | null>(null);
  const year = yearOf(release.publishedAt);

  return (
    // The slot keeps its place in the reel while the viewport inside it goes full screen.
    <div ref={cardRef} className="relative aspect-video w-[var(--card-w)] flex-shrink-0 snap-center snap-always">
      <div
        ref={viewport}
        className={
          fullscreen
            ? 'fixed inset-0 z-[100] bg-black' // also the fallback where the Fullscreen API is missing (iPhone)
            : `absolute inset-0 overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-300 md:rounded-[6px] ${
                active ? 'opacity-100' : 'scale-[0.94] opacity-45'
              }`
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={release.thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        {playing && src && (
          <iframe
            ref={frameRef}
            src={src}
            title={`${release.title} — music video`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 h-full w-full"
            tabIndex={fullscreen ? 0 : -1}
            // Apply the current sound setting once the player is ready (it may have changed since it mounted).
            onLoad={(e) => {
              const frame = e.currentTarget;
              setTimeout(() => command(frame, mutedRef.current ? 'mute' : 'unMute'), 600);
            }}
          />
        )}

        {fullscreen ? (
          <button type="button" onClick={onClose} aria-label="Exit full screen" className={`${iconBtn} absolute right-4 top-4 z-10 !h-11 !w-11`}>
            <Svg>{Icon.close}</Svg>
          </button>
        ) : (
          <>
            {/* The whole viewport is the button: a click opens the video full screen. */}
            <button
              type="button"
              onClick={() => viewport.current && onOpen(viewport.current)}
              aria-label={`Play ${release.title} full screen`}
              className="group absolute inset-0 z-[1] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4dff91]"
            >
              {!playing && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a9e4a] text-white shadow-lg transition-transform group-hover:scale-110 md:h-16 md:w-16">
                    <Svg className="ml-1 h-7 w-7">{Icon.play}</Svg>
                  </span>
                </span>
              )}
            </button>

            {/* Info, laid over the bottom corners. Only the small buttons take clicks; the rest falls through to the viewport. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-2.5 pt-14 md:px-5 md:pb-4 md:pt-24">
              <div className="min-w-0">
                <h2 style={SEMI} className="line-clamp-2 text-[13px] leading-tight text-white md:text-[20px]">{release.title}</h2>
                <p style={BODY} className="mt-0.5 truncate text-[11px] text-white/70 md:mt-1 md:text-[13px]">
                  {release.artist}
                  {release.publishedAt && (
                    <> · <time dateTime={release.publishedAt} title={String(year)}>{timeAgo(release.publishedAt)}</time></>
                  )}
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col items-end gap-1.5 md:gap-2.5">
                <div style={BODY} className="flex items-center gap-2.5 text-[11px] text-white/85 md:text-[13px]">
                  {release.views !== null && (
                    <span className="flex items-center gap-1" aria-label={`${release.views.toLocaleString('en-US')} views`}>
                      <Svg className="h-3.5 w-3.5">{Icon.eye}</Svg>{formatViews(release.views)}
                    </span>
                  )}
                  {release.duration !== null && (
                    <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5" aria-label={`Length ${formatDuration(release.duration)}`}>
                      <Svg className="h-3 w-3">{Icon.note}</Svg>{formatDuration(release.duration)}
                    </span>
                  )}
                </div>
                {active && (
                  <div className="flex items-center gap-1.5">
                    {release.links.map((l) => (
                      <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Listen on ${l.label}`} title={l.label} className={iconBtn}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.icon} alt="" className="h-4 w-4 object-contain" />
                      </a>
                    ))}
                    {release.karaoke && (
                      <a href="/karaoke" aria-label="Sing it in Karaoke" title="Karaoke" className={iconBtn}><Svg className="h-4 w-4">{Icon.mic}</Svg></a>
                    )}
                    <a href={`https://www.youtube.com/watch?v=${release.videoId}`} target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube" title="YouTube" className={iconBtn}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/youtube.png" alt="" className="h-4 w-4 object-contain" />
                    </a>
                    <button type="button" onClick={onShare} aria-label="Share" title="Share" className={iconBtn}><Svg className="h-4 w-4">{Icon.share}</Svg></button>
                    <span className="hidden h-9 w-9 items-center justify-center text-white/70 md:flex" aria-hidden="true"><Svg className="h-4 w-4">{Icon.expand}</Svg></span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── FEED ─────────────────────────────────────────────────────────────────────
export default function DiscographyFeed({ releases }: { releases: Release[] }) {
  const [active, setActive] = useState(0);
  const [year, setYear] = useState<number | null>(yearOf(releases[0]?.publishedAt ?? null));
  const [ticks, setTicks] = useState<YearTick[]>([]);
  // Autoplay starts off so the server never renders a player; once in the browser it turns on,
  // except for people who ask for reduced motion, who get still frames until they click.
  const [autoplay, setAutoplay] = useState(false);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const frames = useRef<Map<string, HTMLIFrameElement>>(new Map());
  const activeRef = useRef(0);
  const ticksRef = useRef<YearTick[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAutoplay(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /** Scroll position of the card at `index` when it sits in the middle of the scroller. */
  const centreOf = useCallback((index: number) => {
    const el = cards.current[index] ?? scrollerRef.current?.lastElementChild;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return 0;
    const card = el as HTMLElement;
    return card.offsetLeft + card.offsetWidth / 2 - scroller.clientWidth / 2;
  }, []);

  const jump = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const max = cards.current.length; // the end card sits at index === releases.length
    scrollerRef.current?.scrollTo({ left: centreOf(Math.max(0, Math.min(index, max))), behavior });
  }, [centreOf]);

  // Tracks the scroll: moves the marker (straight through a CSS variable, no re-render), names its year,
  // and works out which video is in the middle.
  const onScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const p = max > 0 ? Math.min(1, Math.max(0, scroller.scrollLeft / max)) : 0;
    wrapRef.current?.style.setProperty('--p', String(p));

    // The year of the last tick the marker has reached.
    let y: number | null = ticksRef.current[0]?.year ?? null;
    for (const t of ticksRef.current) if (t.pos <= p + 0.001) y = t.year;
    setYear(y);

    const middle = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - middle);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    activeRef.current = best;
    setActive(best);
  }, []);

  // Where each year starts along the timeline: the scroll position that centres its newest video.
  // Measured from the real layout, so the marker lands on a year's tick exactly when that video is centred.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const next: YearTick[] = [];
      releases.forEach((r, i) => {
        const y = yearOf(r.publishedAt);
        if (y === null || next.some((t) => t.year === y)) return;
        next.push({ year: y, index: i, pos: max > 0 ? Math.min(1, Math.max(0, centreOf(i) / max)) : 0 });
      });
      ticksRef.current = next;
      setTicks(next);
      onScroll();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, [releases, centreOf, onScroll]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let frame = 0;
    const handler = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(onScroll);
    };
    scroller.addEventListener('scroll', handler, { passive: true });
    return () => { scroller.removeEventListener('scroll', handler); cancelAnimationFrame(frame); };
  }, [onScroll]);

  // A mouse wheel scrolls up and down; here, one notch (or one trackpad swipe) moves one video along.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let lastWheel = 0;
    let lastJump = 0;
    const onWheel = (e: WheelEvent) => {
      if (fullscreen || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // sideways swipes scroll natively
      e.preventDefault();
      const now = performance.now();
      const newGesture = now - lastWheel > 160;
      lastWheel = now;
      if (Math.abs(e.deltaY) < 4 || (!newGesture && now - lastJump < 650)) return;
      lastJump = now;
      jump(activeRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    scroller.addEventListener('wheel', onWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', onWheel);
  }, [jump, fullscreen]);

  // Open on a shared video (?v=…), then keep the address in step so the current video can be shared.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('v');
    const i = v ? releases.findIndex((r) => r.videoId === v) : -1;
    if (i > 0) jump(i, 'instant');
  }, [releases, jump]);
  useEffect(() => {
    const r = releases[active];
    if (!r) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('v') === r.videoId || (active === 0 && !url.searchParams.has('v'))) return;
    url.searchParams.set('v', r.videoId);
    window.history.replaceState(window.history.state, '', url);
  }, [active, releases]);

  // ── Full screen ──
  const open = useCallback((index: number, el: HTMLDivElement) => {
    const release = releases[index];
    if (index !== activeRef.current) jump(index);
    setFullscreen(release.videoId);
    // Must be called straight from the click. Where it's missing (iPhone), the card simply covers the screen.
    el.requestFullscreen?.().catch(() => {});
    const frame = frames.current.get(release.videoId);
    command(frame, 'unMute');
    command(frame, 'seekTo', [0, true]);
    command(frame, 'playVideo');
  }, [releases, jump]);

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setFullscreen(null);
  }, []);

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFullscreen(null); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Back to a muted preview when full screen closes.
  useEffect(() => {
    if (fullscreen) return;
    frames.current.forEach((f) => command(f, 'mute'));
  }, [fullscreen]);

  // Keyboard: ←/→ (or J/L) move between videos, Enter or F opens full screen, Esc closes it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (fullscreen) {
        if (e.key === 'Escape') close();
        return;
      }
      if (['ArrowRight', 'PageDown', 'l'].includes(e.key)) { e.preventDefault(); jump(activeRef.current + 1); }
      else if (['ArrowLeft', 'PageUp', 'j'].includes(e.key)) { e.preventDefault(); jump(activeRef.current - 1); }
      else if (e.key === 'Home') { e.preventDefault(); jump(0); }
      else if (e.key === 'End') { e.preventDefault(); jump(releases.length); }
      else if (e.key === 'f' || (e.key === 'Enter' && t === document.body)) {
        const el = cards.current[activeRef.current];
        if (el) open(activeRef.current, el);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, jump, open, close, releases.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function share(release: Release) {
    const url = new URL(window.location.href);
    url.searchParams.set('v', release.videoId);
    const data = { title: `${release.title} — ${release.artist}`, url: url.toString() };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      setToast('Link copied');
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') setToast('Couldn’t share. Copy the address bar instead.');
    }
  }

  if (releases.length === 0) {
    return (
      <div style={BODY} className="flex h-full items-center justify-center px-6 text-center text-white/70">
        <p>
          No videos to show right now.{' '}
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-[#4dff91] underline underline-offset-4">Watch on YouTube</a>
        </p>
      </div>
    );
  }

  const atEnd = active >= releases.length;

  return (
    <div ref={wrapRef} className="relative flex h-full flex-col" style={{ '--p': 0 } as CSSProperties}>
      {ticks.length > 0 && <Timeline ticks={ticks} year={year} onJump={jump} />}

      {/* Card size comes from the space available: as wide as fits, but never taller than the room left. */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollerRef}
          role="region"
          aria-label="Music videos, newest first"
          className="no-scrollbar relative flex h-full snap-x snap-mandatory items-center gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain [--card-w:min(100vw_-_48px,(100dvh_-_var(--home-btn-space,24px)_-_160px)_*_16/9)] [padding-inline:calc((100%_-_var(--card-w))/2)] md:gap-8 md:[--card-w:min(100vw_-_176px,1180px,(100dvh_-_230px)_*_16/9)]"
        >
          {releases.map((release, i) => (
            <VideoCard
              key={release.videoId}
              release={release}
              active={i === active}
              preview={i === active && autoplay}
              fullscreen={fullscreen === release.videoId}
              muted={fullscreen !== release.videoId}
              cardRef={(el) => { cards.current[i] = el; }}
              frameRef={(el) => { if (el) frames.current.set(release.videoId, el); else frames.current.delete(release.videoId); }}
              onOpen={(el) => open(i, el)}
              onClose={close}
              onShare={() => share(release)}
            />
          ))}

          {/* End of the reel. */}
          <div
            ref={(el) => { cards.current[releases.length] = el; }}
            style={BODY}
            className="flex aspect-video w-[var(--card-w)] flex-shrink-0 snap-center flex-col items-center justify-center gap-3 border border-white/10 px-6 text-center md:rounded-[6px]"
          >
            <p style={SEMI} className="text-[18px] text-white md:text-[22px]">You’re all caught up</p>
            <p className="max-w-[340px] text-[13px] text-white/65 md:text-[14px]">That’s every video for now. New releases land here as soon as they drop.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => jump(0)} style={SEMI} className="bg-[#1a9e4a] px-5 py-2.5 text-[12px] tracking-[0.08em] text-white hover:bg-[#149262] cursor-pointer md:text-[13px]">BACK TO THE LATEST</button>
              <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" style={SEMI} className="border border-white/30 px-5 py-2.5 text-[12px] tracking-[0.08em] text-white hover:border-[#4dff91] md:text-[13px]">MORE ON YOUTUBE</a>
            </div>
          </div>
        </div>

        {/* Previous / next, for mouse users. */}
        <button
          type="button"
          onClick={() => jump(active - 1)}
          disabled={active === 0}
          aria-label="Newer video"
          className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur hover:border-[#4dff91] disabled:opacity-0 cursor-pointer md:flex"
        >
          <Svg>{Icon.left}</Svg>
        </button>
        <button
          type="button"
          onClick={() => jump(active + 1)}
          disabled={atEnd}
          aria-label="Older video"
          className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur hover:border-[#4dff91] disabled:opacity-0 cursor-pointer md:flex"
        >
          <Svg>{Icon.right}</Svg>
        </button>
      </div>

      <p style={BODY} className="sr-only" aria-live="polite">
        {atEnd ? 'End of videos' : `Video ${active + 1} of ${releases.length}: ${releases[active]?.title}`}
      </p>

      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
        {toast && <span style={BODY} className="bg-black/80 px-4 py-2 text-[13px] text-white">{toast}</span>}
      </div>
    </div>
  );
}

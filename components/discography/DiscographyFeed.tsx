// components/discography/DiscographyFeed.tsx
'use client';

// Full-screen, snap-scrolling feed of music videos. Phones: one video per screen with the info laid over it.
// Desktop: the same feed, but each screen splits into a large player and an info panel with the full
// description, listening links and what's up next. Only the video on screen loads and plays (muted until
// the visitor turns sound on); more videos load as you near the end.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DiscographyPage, Release } from '@/lib/discography';

const SEMI = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;
const BODY = { fontFamily: "'Poppins', sans-serif" } as const;
const CHANNEL_URL = 'https://www.youtube.com/@LifeOfGameBoy';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
function command(frame: HTMLIFrameElement | null, func: 'mute' | 'unMute' | 'playVideo' | 'pauseVideo') {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
}

// ── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  soundOff: <path d="M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />,
  soundOn: <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />,
  share: <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  up: <path d="m18 15-6-6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  mic: <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />,
};
function Svg({ children, className = 'h-5 w-5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

// ── VIDEO ────────────────────────────────────────────────────────────────────
function VideoFrame({
  release,
  playing,
  muted,
  frameRef,
  onPlay,
}: {
  release: Release;
  playing: boolean;
  muted: boolean;
  frameRef: (el: HTMLIFrameElement | null) => void;
  onPlay: () => void;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.6)] lg:rounded-[6px]">
      {playing ? (
        <iframe
          ref={frameRef}
          src={embedUrl(release.videoId, muted)}
          title={`${release.title} — music video`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          className="absolute inset-0 h-full w-full"
          // Apply the current sound setting once the player is ready (it may have changed since the src was set).
          onLoad={(e) => {
            const frame = e.currentTarget;
            setTimeout(() => command(frame, muted ? 'mute' : 'unMute'), 600);
          }}
        />
      ) : (
        <button type="button" onClick={onPlay} aria-label={`Play ${release.title}`} className="group absolute inset-0 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={release.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/10">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a9e4a] text-white shadow-lg transition-transform group-hover:scale-110">
              <Svg className="ml-1 h-7 w-7">{Icon.play}</Svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

// ── INFO (shared by the phone overlay and the desktop panel) ─────────────────
function ActionButton({ label, onClick, href, children }: { label: string; onClick?: () => void; href?: string; children: React.ReactNode }) {
  const cls =
    'flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4dff91] cursor-pointer';
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={cls}>{children}</a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>{children}</button>
  );
}

function Actions({ release, muted, onToggleSound, onShare }: { release: Release; muted: boolean; onToggleSound: () => void; onShare: () => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <ActionButton label={muted ? 'Turn sound on' : 'Mute'} onClick={onToggleSound}>
        <Svg>{muted ? Icon.soundOff : Icon.soundOn}</Svg>
      </ActionButton>
      <ActionButton label="Share" onClick={onShare}><Svg>{Icon.share}</Svg></ActionButton>
      <ActionButton label="Watch on YouTube" href={`https://www.youtube.com/watch?v=${release.videoId}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/youtube.png" alt="" className="h-5 w-5 object-contain" />
      </ActionButton>
      {release.karaoke && (
        <ActionButton label="Sing it in Karaoke" href="/karaoke"><Svg>{Icon.mic}</Svg></ActionButton>
      )}
    </div>
  );
}

function ListenLinks({ release, size }: { release: Release; size: 'sm' | 'lg' }) {
  if (release.links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2" style={SEMI}>
      {release.links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 border border-[#4dff91]/35 bg-black/30 text-white backdrop-blur transition-colors hover:border-[#4dff91] hover:bg-[#1a9e4a]/30 ${
            size === 'lg' ? 'h-10 px-3.5 text-[12px] tracking-[0.08em]' : 'h-8 px-2.5 text-[11px] tracking-[0.06em]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.icon} alt="" className="h-4 w-4 object-contain" />
          {l.label.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

function Meta({ release }: { release: Release }) {
  return (
    <p style={BODY} className="text-[13px] text-white/70">
      {release.artist}
      {release.publishedAt && <> · <time dateTime={release.publishedAt}>{formatDate(release.publishedAt)}</time></>}
    </p>
  );
}

function PhoneOverlay(props: { release: Release; muted: boolean; onToggleSound: () => void; onShare: () => void }) {
  const { release } = props;
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pt-16 lg:hidden"
      style={{ paddingBottom: 'calc(var(--home-btn-space, 24px) + 4px)' }}
    >
      <div>
        <h2 style={SEMI} className="text-[21px] leading-tight text-white">{release.title}</h2>
        <Meta release={release} />
      </div>
      {release.description && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          style={BODY}
          className={`text-left text-[13px] leading-relaxed text-white/80 whitespace-pre-line cursor-pointer ${expanded ? 'max-h-[30vh] overflow-y-auto' : 'line-clamp-2'}`}
        >
          {release.description}
        </button>
      )}
      <ListenLinks release={release} size="sm" />
      <Actions {...props} />
    </div>
  );
}

function DesktopPanel(props: {
  release: Release;
  index: number;
  total: number;
  hasMore: boolean;
  upNext: Release[];
  muted: boolean;
  onToggleSound: () => void;
  onShare: () => void;
  onJump: (index: number) => void;
}) {
  const { release, index, total, hasMore, upNext, onJump } = props;
  return (
    <aside className="hidden min-h-0 flex-col gap-6 lg:flex" aria-label={`About ${release.title}`}>
      <div className="flex items-center justify-between" style={BODY}>
        <span className="text-[12px] uppercase tracking-[0.2em] text-[#4dff91]">
          {index + 1} / {total}{hasMore ? '+' : ''}
        </span>
        <span className="flex gap-1.5">
          <button type="button" onClick={() => onJump(index - 1)} disabled={index === 0} aria-label="Previous video" className="flex h-9 w-9 items-center justify-center border border-white/20 text-white hover:border-[#4dff91] disabled:opacity-30 cursor-pointer disabled:cursor-default">
            <Svg className="h-4 w-4">{Icon.up}</Svg>
          </button>
          <button type="button" onClick={() => onJump(index + 1)} aria-label="Next video" className="flex h-9 w-9 items-center justify-center border border-white/20 text-white hover:border-[#4dff91] cursor-pointer">
            <Svg className="h-4 w-4">{Icon.down}</Svg>
          </button>
        </span>
      </div>

      <div>
        <h2 style={SEMI} className="text-[30px] leading-[1.15] text-white">{release.title}</h2>
        <div className="mt-1.5"><Meta release={release} /></div>
      </div>

      <Actions {...props} />
      <ListenLinks release={release} size="lg" />

      {release.description && (
        <p style={BODY} className="min-h-0 flex-shrink overflow-y-auto pr-2 text-[14px] leading-relaxed text-white/75 whitespace-pre-line">
          {release.description}
        </p>
      )}

      {upNext.length > 0 && (
        <div className="mt-auto">
          <p style={SEMI} className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/50">Up next</p>
          <ul className="flex flex-col gap-2.5">
            {upNext.map((r, i) => (
              <li key={r.videoId}>
                <button type="button" onClick={() => onJump(index + 1 + i)} className="group flex w-full items-center gap-3 text-left cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.thumbnail} alt="" loading="lazy" className="aspect-video w-24 flex-shrink-0 object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                  <span style={SEMI} className="line-clamp-2 text-[13px] leading-snug text-white/85 group-hover:text-[#4dff91]">{r.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

// ── FEED ─────────────────────────────────────────────────────────────────────
export default function DiscographyFeed({ initial }: { initial: DiscographyPage }) {
  const [releases, setReleases] = useState(initial.releases);
  const [nextToken, setNextToken] = useState(initial.nextPageToken);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  // Autoplay starts off so the server never renders a player; once in the browser it turns on,
  // except for people who ask for reduced motion, who press play instead.
  const [autoplay, setAutoplay] = useState(false);
  const [started, setStarted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const endRef = useRef<HTMLElement>(null);
  const frames = useRef<Map<string, HTMLIFrameElement>>(new Map());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAutoplay(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);


  const jump = useCallback((index: number) => {
    const el = slideRefs.current[index] ?? (index >= slideRefs.current.length ? scrollerRef.current?.lastElementChild : null);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Open on a shared video (?v=…), then keep the address in step so the current video can be shared.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('v');
    const i = v ? initial.releases.findIndex((r) => r.videoId === v) : -1;
    if (i > 0) slideRefs.current[i]?.scrollIntoView({ block: 'start' });
  }, [initial.releases]);
  useEffect(() => {
    const r = releases[active];
    if (!r) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('v') === r.videoId || (active === 0 && !url.searchParams.has('v'))) return;
    url.searchParams.set('v', r.videoId);
    window.history.replaceState(window.history.state, '', url);
  }, [active, releases]);

  // Infinite scroll: fetch the next page when two videos from the end.
  const loadMore = useCallback(async () => {
    if (!nextToken || loadingMore) return;
    setLoadingMore(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/discography?pageToken=${encodeURIComponent(nextToken)}`);
      if (!res.ok) throw new Error();
      const page: DiscographyPage = await res.json();
      setReleases((prev) => {
        const known = new Set(prev.map((r) => r.videoId));
        return [...prev, ...page.releases.filter((r) => !known.has(r.videoId))];
      });
      setNextToken(page.nextPageToken);
    } catch {
      setLoadError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [nextToken, loadingMore]);

  // The observer below calls this as slides come into view; a ref keeps it pointing at the latest state.
  const onSlideShown = useRef<(index: number) => void>(() => {});
  useEffect(() => {
    onSlideShown.current = (index) => {
      if (index >= releases.length - 2 && nextToken && !loadingMore && !loadError) loadMore();
    };
  });

  // Which slide is on screen.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const index = Number((e.target as HTMLElement).dataset.index);
          if (index < slideRefs.current.length) setActive(index);
          onSlideShown.current(index);
        }
      },
      { root, threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    if (endRef.current) io.observe(endRef.current);
    return () => io.disconnect();
  }, [releases.length]);

  // Keyboard: ↑/↓ (or K/J, Page Up/Down) move between videos, M toggles sound.
  const toggleSound = useCallback(() => {
    const frame = frames.current.get(releases[active]?.videoId ?? '') ?? null;
    command(frame, muted ? 'unMute' : 'mute');
    setMuted(!muted);
  }, [active, releases, muted]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) { e.preventDefault(); jump(active + 1); }
      else if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) { e.preventDefault(); jump(Math.max(0, active - 1)); }
      else if (e.key === 'm') toggleSound();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, jump, toggleSound]);

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

  return (
    <div className="relative h-full">
      <div
        ref={scrollerRef}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
        aria-label="Music videos"
        role="feed"
        aria-busy={loadingMore}
      >
        {releases.map((release, i) => {
          const near = Math.abs(i - active) <= 1; // only nearby slides render their images
          const playing = i === active && (autoplay || started.has(release.videoId));
          return (
            <article
              key={release.videoId}
              ref={(el) => { slideRefs.current[i] = el; }}
              data-index={i}
              aria-posinset={i + 1}
              aria-setsize={nextToken ? -1 : releases.length}
              aria-label={`${release.title} by ${release.artist}`}
              className="relative h-full snap-start snap-always overflow-hidden"
            >
              {/* Blurred still behind everything, so the wide video sits in its own colours on a tall screen. */}
              {near && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={release.thumbnail} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
              )}
              <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

              <div className="relative mx-auto grid h-full max-w-[1500px] grid-cols-1 items-center lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:px-12 lg:pt-20 lg:pb-10">
                <div className="-mt-[22vh] lg:mt-0">
                  {near && (
                    <VideoFrame
                      release={release}
                      playing={playing}
                      muted={muted}
                      frameRef={(el) => { if (el) frames.current.set(release.videoId, el); else frames.current.delete(release.videoId); }}
                      onPlay={() => {
                        setStarted((s) => new Set(s).add(release.videoId));
                        setMuted(false); // a tap to play is a clear request for sound
                        if (i !== active) jump(i);
                      }}
                    />
                  )}
                </div>
                <DesktopPanel
                  release={release}
                  index={i}
                  total={releases.length}
                  hasMore={!!nextToken}
                  upNext={releases.slice(i + 1, i + 4)}
                  muted={muted}
                  onToggleSound={toggleSound}
                  onShare={() => share(release)}
                  onJump={jump}
                />
              </div>

              <PhoneOverlay release={release} muted={muted} onToggleSound={toggleSound} onShare={() => share(release)} />
              <span style={BODY} className="absolute right-4 top-[72px] z-10 text-[11px] tracking-[0.2em] text-white/60 lg:hidden">
                {i + 1} / {releases.length}{nextToken ? '+' : ''}
              </span>
            </article>
          );
        })}

        {/* End of the feed: loading, a retry, or the end card. */}
        <section ref={endRef} data-index={releases.length} className="relative flex h-full snap-start flex-col items-center justify-center gap-4 px-6 text-center" style={BODY}>
          {loadingMore || nextToken ? (
            loadError ? (
              <>
                <p className="text-white/80">Couldn’t load more videos.</p>
                <button type="button" onClick={loadMore} style={SEMI} className="bg-[#1a9e4a] px-5 py-2.5 text-[13px] tracking-[0.08em] text-white hover:bg-[#149262] cursor-pointer">TRY AGAIN</button>
              </>
            ) : (
              <p className="text-white/60" role="status">Loading more videos…</p>
            )
          ) : (
            <>
              <p style={SEMI} className="text-[22px] text-white">You’re all caught up</p>
              <p className="max-w-[320px] text-[14px] text-white/65">That’s every video for now. New releases land here as soon as they drop.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => jump(0)} style={SEMI} className="bg-[#1a9e4a] px-5 py-2.5 text-[13px] tracking-[0.08em] text-white hover:bg-[#149262] cursor-pointer">BACK TO THE TOP</button>
                <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" style={SEMI} className="border border-white/30 px-5 py-2.5 text-[13px] tracking-[0.08em] text-white hover:border-[#4dff91]">MORE ON YOUTUBE</a>
              </div>
            </>
          )}
        </section>
      </div>

      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
        {toast && <span style={BODY} className="bg-black/80 px-4 py-2 text-[13px] text-white">{toast}</span>}
      </div>
    </div>
  );
}

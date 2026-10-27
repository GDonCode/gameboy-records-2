'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import Footer from '@/components/Footer';
import { getSongOfTheDay, PLATFORMS, recordSongStream } from '@/lib/song-of-the-day';


const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

// ── CORNER BRACKETS ──────────────────────────────────────────────────────────
function Corners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
    </>
  );
}

// ── HERO PANELS ──────────────────────────────────────────────────────────────
const RADIO_EMBED = 'https://www.youtube.com/embed/videoseries?list=PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo&autoplay=1&controls=1';
const RELEASE_EMBED = 'https://www.youtube.com/embed/etLGFz3dtsM?si=tzBYcOWR4rJUbu9J&autoplay=1&controls=1';
const SPOTIFY_URL = 'https://open.spotify.com/track/3tcAFyDjx0YBBJ2Y6TvVVh?si=a50460c499134546';

// Social profiles shown in the "FOLLOW ALEXX" panel. A link with an empty href is not rendered.
// TODO: paste the real Instagram and TikTok profile URLs here (e.g. 'https://www.instagram.com/<handle>/').
const INSTAGRAM_URL = 'https://www.instagram.com/alexxagame/';
const TIKTOK_URL = 'https://www.tiktok.com/@alexxagame';

const SOCIAL_LINKS: { label: string; href: string; icon?: string; svg?: React.ReactNode }[] = [
  {
    label: 'Instagram',
    href: INSTAGRAM_URL,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: TIKTOK_URL,
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
      </svg>
    ),
  },
  { label: 'YouTube', href: 'https://www.youtube.com/playlist?list=PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo', icon: '/youtube.png' },
];

// ── HERO HOTSPOT — the person in web-hero.mp4 ────────────────────────────────
// The spotlight is a cone of light: narrow at the top (as if a lamp hangs above the frame) and widening toward the bottom.
// Its hover area is the same cone. Points are [x, y] as fractions of the VIDEO frame (0–1), not of the screen,
// listed top-left, bottom-left, bottom-right, top-right. It runs just past the top and bottom of the frame on purpose.
// To reshape it, move the points. To calibrate, open the home page with ?hotspot=debug,
// hover the spot you want, and read the x / y values in the black readout.
const HERO_SHAPE: [number, number][] = [
  [0.320, -0.100],
  [0.110, 1.100],
  [0.630, 1.100],
  [0.420, -0.100],
];
// Half-width of the pool of light where the beam lands on the bottom edge of the hero, as a fraction of the video width.
const HERO_POOL_RX = 0.26;
// Where the tooltip points (the top of the head), as a fraction of the video frame.
const HERO_TIP = { x: 0.37, y: 0.10 };
// Horizontal centre of the person (0–1). On narrow screens the video is shifted sideways to keep it in view.
const HERO_FOCUS_X = 0.37;

function RadioPanel({ onTuneIn }: { onTuneIn: () => void }) {
  return (
    <div className="hero-panel">
      <div className="hero-panel-title">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4dff91] animate-pulse" />
        REALnTRUE RADIO
      </div>
      <p className="hero-panel-text" style={{ marginBottom: '14px' }}>
        Non-stop Gameboy Records. Realest sound, truest vision, on air whenever you are.
      </p>
      <button className="listen-btn" onClick={onTuneIn}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 block" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        TUNE IN
      </button>
    </div>
  );
}

function FeaturedPanel({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="hero-panel">
      <div className="hero-panel-title">FEATURED RELEASE</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://img.youtube.com/vi/etLGFz3dtsM/mqdefault.jpg"
        alt="Rise Up Now (Guitar Version)"
        className="hero-release-art"
      />
      <div className="hero-panel-text" style={{ margin: '10px 0 12px' }}>
        <strong style={{ color: '#fff' }}>Rise Up Now (Guitar Version)</strong>
        <br />
        Alexx A-Game
      </div>
      <div className="flex items-center gap-3">
        <button className="listen-btn" onClick={onPlay}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 block" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          PLAY
        </button>
        <a
          href={SPOTIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hero-social-icon"
          aria-label="Listen on Spotify"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spotify.png" alt="" />
        </a>
      </div>
    </div>
  );
}

function StoryPanel() {
  return (
    <div className="hero-panel">
      <div className="hero-panel-title">THE STORY BEHIND THE SOUND</div>
      <p className="hero-panel-text">
        Born Alex Gallimore in Discovery Bay, St. Ann, Jamaica, Alexx A-Game took his stage name from his constant use of the slang “a-game.” A musician first, he pushed for a fresher, more visual approach to Jamaican music and was cast as Peter Tosh in Paramount’s <em>Bob Marley: One Love</em>.
      </p>
    </div>
  );
}

function SocialsPanel() {
  return (
    <div className="hero-panel">
      <div className="hero-panel-title">FOLLOW ALEXX</div>
      <div className="flex flex-wrap gap-[10px]">
        {SOCIAL_LINKS.filter((s) => s.href).map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            aria-label={s.label}
            title={s.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.icon ? <img src={s.icon} alt="" /> : s.svg}
          </a>
        ))}
      </div>
    </div>
  );
}
  
// "A-Game's song of the day" — rotates daily (see lib/song-of-the-day.ts). Opening any link counts toward
// the signed-in user's daily streaming quest. YouTube plays in the mini-player like the other releases.
function SongOfTheDayPanel({ onPlay }: { onPlay: (embedSrc: string) => void }) {
  const song = getSongOfTheDay();
  return (
    <div className="hero-panel">
      <div className="hero-panel-title">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4dff91] animate-pulse" />
        A-GAME&apos;S SONG OF THE DAY
      </div>
      <div className="hero-sotd">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={song.art} alt={`${song.title} cover art`} className="hero-sotd-art" />
        <div className="hero-panel-text min-w-0">
          <strong style={{ color: '#fff' }}>{song.title}</strong>
          <br />
          {song.artist}
          <dl className="hero-sotd-meta">
            {song.meta.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="hero-sotd-links">
        {PLATFORMS.map((p) =>
          p.id === 'youtube' ? (
            <button
              key={p.id}
              type="button"
              className="hero-dispo-link"
              onClick={() => {
                recordSongStream(p.id);
                onPlay(`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&controls=1`);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.icon} alt="" />
              {p.label.toUpperCase()}
            </button>
          ) : (
            <a
              key={p.id}
              href={song.links[p.id]}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-dispo-link"
              onClick={() => recordSongStream(p.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.icon} alt="" />
              {p.label.toUpperCase()}
            </a>
          )
        )}
      </div>
    </div>
  );
}

// ── SPOTLIGHT PANELS (appear beside the beam while the spotlight is active) ───
// Streaming / distribution links for the featured release (YouTube plays in the mini-player).
const RELEASE_LINKS = [
  { label: 'Apple Music', href: 'https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519', icon: '/apple-music.png' },
  { label: 'Spotify',     href: SPOTIFY_URL,                                                                 icon: '/spotify.png' },
  { label: 'Audiomack',   href: 'https://audiomack.com/alexxagame',                                          icon: '/audiomack.png' },
  { label: 'SoundCloud',  href: 'https://soundcloud.com/alexxagame',                                         icon: '/soundcloud.png' },
];

function ReleaseLinksPanel({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="hero-panel">
      <div className="hero-panel-title">FEATURED RELEASE</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://img.youtube.com/vi/etLGFz3dtsM/mqdefault.jpg"
        alt="Rise Up Now (Guitar Version)"
        className="hero-release-art"
        style={{ height: '84px' }}
      />
      <div className="hero-panel-text" style={{ margin: '8px 0 10px' }}>
        <strong style={{ color: '#fff' }}>Rise Up Now (Guitar Version)</strong>
        <br />
        Alexx A-Game
      </div>
      <div className="hero-dispo-grid">
        <button type="button" className="hero-dispo-link" onClick={onPlay}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/youtube.png" alt="" />
          YOUTUBE
        </button>
        {RELEASE_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-dispo-link"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.icon} alt="" />
            {l.label.toUpperCase()}
          </a>
        ))}
      </div>
      <a
        href="/discography"
        className="listen-btn hero-drawer-cta"
        style={{ marginTop: '12px', padding: '0 12px', fontSize: '0.8em', letterSpacing: '0.12em' }}
      >
        VIEW DISCOGRAPHY →
      </a>
    </div>
  );
}

export default function Home() {
  const [playerMounted,  setPlayerMounted]  = useState(false);
  const [playerVisible,  setPlayerVisible]  = useState(false);
    const [playerSrc, setPlayerSrc] = useState(
    'https://www.youtube.com/embed/videoseries?list=PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo&autoplay=1&controls=1'
  );
  const [playerCollapsed, setPlayerCollapsed] = useState(false);

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const playerRef = useRef<HTMLDivElement>(null);

  // Hero hotspot + drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Spotlight panels — visible while the spotlight or a panel is hovered/focused.
  // The short hide delay lets the cursor cross the gap between the beam and a panel.
  const [spotOn, setSpotOn] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const spotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSpot = () => {
    if (spotTimerRef.current) {
      clearTimeout(spotTimerRef.current);
      spotTimerRef.current = null;
    }
    setSpotOn(true);
  };
  const hideSpot = () => {
    if (spotTimerRef.current) clearTimeout(spotTimerRef.current);
    spotTimerRef.current = setTimeout(() => {
      setSpotOn(false);
      spotTimerRef.current = null;
    }, 300);
  };
  useEffect(() => () => {
    if (spotTimerRef.current) clearTimeout(spotTimerRef.current);
  }, []);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const hotspotRef = useRef<SVGPathElement>(null);
  const dimRef = useRef<SVGPathElement>(null);
  const poolRef = useRef<SVGEllipseElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);

  // Mobile: collapse the expanded mini-player to its pull tab on any tap outside it
  useEffect(() => {
    if (!playerVisible || playerCollapsed) return;
    const mq = window.matchMedia('(max-width: 767px)');
    function handlePointerDown(e: PointerEvent) {
      if (!mq.matches) return;
      if (playerRef.current && !playerRef.current.contains(e.target as Node)) {
        setPlayerCollapsed(true);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [playerVisible, playerCollapsed]);
 
  // iOS Safari: React omits the `muted` attribute in server HTML, so Safari blocks autoplay.
  // Force muted + play() on mount for every autoplay video on this page.
  useEffect(() => {
    document.querySelectorAll<HTMLVideoElement>('video[autoplay]').forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  // Hero hotspot — keeps the highlight shape and tooltip on the person in web-hero.mp4.
  // The video is top-aligned (its top edge is never cropped) and nudged sideways so the person stays in view.
  useEffect(() => {
    const hero = heroRef.current;
    const video = heroVideoRef.current;
    const hot = hotspotRef.current;
    const dim = dimRef.current;
    const pool = poolRef.current;
    const tip = tipRef.current;
    const hud = debugRef.current;
    if (!hero || !video || !hot || !tip) return;

    const debug = new URLSearchParams(window.location.search).get('hotspot') === 'debug';
    if (debug) hot.dataset.debug = '1';

    // Where the video is drawn inside the hero (object-fit: cover, top-aligned)
    const geo = { ox: 0, dw: 1, dh: 1 };
    let visible = true;
    let raf = 0;
    let lastD = '';

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(hero);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const cw = hero.clientWidth;
      const ch = hero.clientHeight;
      if (!cw || !ch) return;

      const vw = video.videoWidth || 16;
      const vh = video.videoHeight || 9;
      const scale = Math.max(cw / vw, ch / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const ox = Math.min(0, Math.max(cw - dw, cw / 2 - HERO_FOCUS_X * dw));
      geo.ox = ox;
      geo.dw = dw;
      geo.dh = dh;
      video.style.objectPosition = dw > cw ? `${(ox / (cw - dw)) * 100}% 0%` : '50% 0%';

      // Hover shape: the polygon in screen pixels. On narrow screens it is pulled in toward the person
      // so it doesn't cover the whole width (a tap anywhere would open the drawer).
      const squeeze = cw < 640 ? 0.7 : 1;
      const pts = HERO_SHAPE.map(([fx, fy]) => {
        const x = ox + (HERO_TIP.x + (fx - HERO_TIP.x) * squeeze) * dw;
        return `${x.toFixed(1)} ${(fy * dh).toFixed(1)}`;
      });
      const d = `M${pts.join('L')}Z`;
      const key = `${d}|${cw}|${ch}`;
      if (key !== lastD) {
        lastD = key;
        hot.setAttribute('d', d);
        // Dim layer = the whole hero (plus a margin, so its blurred edge stays offscreen) with the shape cut out (even-odd fill)
        dim?.setAttribute('d', `M-120 -120H${cw + 120}V${ch + 120}H-120Z${d}`);
        // Pool of light: a half-ellipse sitting on the bottom edge of the hero, under the beam
        const rx = HERO_POOL_RX * dw * squeeze;
        pool?.setAttribute('cx', (ox + HERO_TIP.x * dw).toFixed(1));
        pool?.setAttribute('cy', String(ch));
        pool?.setAttribute('rx', rx.toFixed(1));
        pool?.setAttribute('ry', (rx * 0.25).toFixed(1));
      }

      const tx = ox + HERO_TIP.x * dw;
      const ty = HERO_TIP.y * dh;
      const half = tip.offsetWidth / 2 + 8;
      tip.style.left = `${Math.min(Math.max(tx, half), cw - half)}px`;
      tip.style.top = `${Math.max(ty, 56)}px`;

      // Spotlight panels: Bio sits left of the beam, release + links sit right of it.
      // Measured on the beam's edges at mid-height of the frame, so they follow the video on every screen size.
      const lp = leftPanelRef.current;
      const rp = rightPanelRef.current;
      if (lp && rp) {
        const yc = 0.5;
        const xAt = (a: [number, number], b: [number, number]) => a[0] + (b[0] - a[0]) * ((yc - a[1]) / (b[1] - a[1]));
        const beamL = ox + (HERO_TIP.x + (xAt(HERO_SHAPE[0], HERO_SHAPE[1]) - HERO_TIP.x) * squeeze) * dw;
        const beamR = ox + (HERO_TIP.x + (xAt(HERO_SHAPE[3], HERO_SHAPE[2]) - HERO_TIP.x) * squeeze) * dw;
        lp.style.left = `${Math.max(12, beamL - 28 - lp.offsetWidth)}px`;
        rp.style.left = `${Math.max(12, Math.min(beamR + 28, cw - rp.offsetWidth - 12))}px`;
      }
    };
    raf = requestAnimationFrame(frame);

    // ?hotspot=debug — readout of the cursor position as a fraction of the video frame
    const onMove = (e: PointerEvent) => {
      if (!hud) return;
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left - geo.ox) / geo.dw;
      const y = (e.clientY - r.top) / geo.dh;
      hud.textContent = `t=${video.currentTime.toFixed(2)}s  x=${x.toFixed(3)}  y=${y.toFixed(3)}`;
    };
    if (debug && hud) {
      hud.dataset.on = '1';
      hero.addEventListener('pointermove', onMove);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      hero.removeEventListener('pointermove', onMove);
    };
  }, []);

  // Hero drawer — Esc or a click outside closes it; focus moves into it on open.
  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const hot = hotspotRef.current;
    drawer?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        hot?.focus({ preventScroll: true });
      }
    }
    function onDown(e: PointerEvent) {
      const t = e.target as Node;
      if (drawer?.contains(t) || hot?.contains(t)) return;
      setDrawerOpen(false);
    }
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [drawerOpen]);

  function openPlayer(embedSrc?: string) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
        if (embedSrc) setPlayerSrc(embedSrc);
    setPlayerCollapsed(false);
    setPlayerMounted(true);
    setPlayerVisible(true);
  }

  function closePlayer() {
    setPlayerVisible(false);
    // Unmount after the .mini-player slide-out (0.38s) so the iframe stops playing
    closeTimerRef.current = setTimeout(() => {
      setPlayerMounted(false);
      closeTimerRef.current = null;
    }, 400);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setSubmitStatus({ type: 'success', message: 'Message sent! We’ll get back to you soon.' });
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        /* ── HERO ARTIST NAME ── */
        .hero-artist-name {
          position: absolute;
          top: 6%;
          left: 0;
          right: 0;
          text-align: center;
          white-space: nowrap;
          font-family: 'Press Start 2P', 'Poppins_semibold', monospace;
          font-size: clamp(1.1rem, 3.6vw, 3.2rem);
          line-height: 1;
          letter-spacing: 0.06em;
          color: #eafff1;
          text-shadow: 0 2px 0 #1a9e4a, 0 4px 0 #178f42, 0 6px 0 #0d5c29, 0 8px 0 #0a4220, 0 12px 24px rgba(0,0,0,0.7), 0 0 36px rgba(77,255,145,0.55);
          pointer-events: none;
        }

        /* ── HERO SIDE PANELS (lg + landscape) / STACK (everything else) ── */
        .hero-side {
          display: none;
          position: absolute;
          top: 17%;
          bottom: 5%;
          width: clamp(230px, 24vw, 340px);
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          pointer-events: auto;
        }
        .hero-side-left  { left: clamp(16px, 2.5vw, 40px); }
        .hero-side-right { right: clamp(16px, 2.5vw, 40px); }
        .hero-stack { display: block; }
        @media (min-width: 1024px) and (min-aspect-ratio: 4/3) {
          .hero-side { display: flex; }
          .hero-stack { display: none; }
        }

        .hero-panel {
          position: relative;
          padding: 16px 18px;
          background: rgba(5,15,8,0.72);
          border: 1px solid rgba(26,158,74,0.5);
          box-shadow: 0 10px 36px rgba(0,0,0,0.6), 0 0 24px rgba(26,158,74,0.12);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
        }
        .hero-panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.72em;
          letter-spacing: 0.28em;
          color: #4dff91;
        }
        .hero-panel-text {
          font-family: 'Poppins', monospace;
          font-size: 0.82em;
          line-height: 1.55;
          color: #e8f5ec;
        }
        .hero-panel .listen-btn { height: 44px; padding: 0 22px; font-size: 0.95em; }
        .hero-release-art {
          display: block;
          width: 100%;
          height: 104px;
          object-fit: cover;
          border: 1px solid rgba(26,158,74,0.35);
        }
        .hero-social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(10,20,14,0.55);
          border: 1px solid rgba(77,255,145,0.35);
          border-radius: 2px;
          transition: transform 0.07s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hero-social-icon img { width: 24px; height: 24px; object-fit: contain; border-radius: 4px; }
        .hero-social-icon:hover {
          transform: translateY(-2px);
          background: rgba(26,158,74,0.25);
          border-color: #4dff91;
          box-shadow: 0 4px 14px rgba(13,92,41,0.5), 0 0 14px rgba(77,255,145,0.35);
        }

        /* ── HERO FIGURE (3D, white keyed out via SVG filter) ── */

        .hero-figure-glow {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: min(80vw, 760px);
          aspect-ratio: 1;
          transform: translateX(-50%) translateY(25%);
          background: radial-gradient(circle, rgba(77,255,145,0.28) 0%, rgba(26,158,74,0.12) 40%, transparent 70%);
        }
        .hero-figure-3d {
          position: relative;
          width: min(92vw, 520px);
          transform-origin: 50% 80%;
          animation: heroFigureSway 8s ease-in-out infinite;
          will-change: transform;
        }
        .hero-figure-img {
          display: block;
          width: 100%;
          height: auto;
          filter: url(#key-out-white) drop-shadow(0 30px 40px rgba(0,0,0,0.7)) drop-shadow(0 0 28px rgba(77,255,145,0.35));
        }
        @media (min-width: 768px) {
          .hero-figure-3d { width: auto; height: 94%; }
          .hero-figure-img { width: auto; height: 100%; }
        }
        @keyframes heroFigureSway {
          0%, 100% { transform: perspective(1100px) rotateY(-7deg) rotateX(2deg) translateY(0); }
          50%      { transform: perspective(1100px) rotateY(7deg) rotateX(-1deg) translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-figure-3d { animation: none; }
        }
        /* ── HERO HOTSPOT / TOOLTIP / DRAWER (person in web-hero.mp4) ── */
        .hero-hot-svg {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }
        /* Green spotlight. The hotspot path is the invisible hit area AND the beam of light: its fill is a green
           gradient and it is blurred, so the edges are soft. Blur and opacity never change what the cursor hits,
           so the hover area stays exactly the cone in HERO_SHAPE. Layer order matters (the ~ selectors below):
           hotspot, then dim, then pool. */
        .hero-hotspot {
          fill: url(#hero-beam);
          stroke: none;
          opacity: 0;
          filter: blur(14px);
          pointer-events: all;
          cursor: pointer;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.35s ease;
        }
        .hero-hotspot:hover,
        .hero-hotspot:focus-visible,
        .hero-hotspot.active { opacity: 1; }
        .hero-hotspot[data-debug] {
          fill: transparent;
          stroke: rgba(255,230,0,0.9);
          stroke-width: 2;
          stroke-dasharray: 8 6;
          opacity: 1;
          filter: none;
        }
        .hero-hot-dim {
          fill: rgba(2,10,5,0.70);
          fill-rule: evenodd;
          opacity: 0;
          filter: blur(26px);
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .hero-hot-pool {
          fill: url(#hero-pool);
          opacity: 0;
          filter: blur(10px);
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .hero-hotspot:hover ~ .hero-hot-dim,
        .hero-hotspot:focus-visible ~ .hero-hot-dim,
        .hero-hotspot.active ~ .hero-hot-dim,
        .hero-hotspot:hover ~ .hero-hot-pool,
        .hero-hotspot:focus-visible ~ .hero-hot-pool,
        .hero-hotspot.active ~ .hero-hot-pool { opacity: 1; }

        .hero-tip {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 4;
          pointer-events: none;
          white-space: nowrap;
          padding: 7px 12px;
          background: #fef8f3;
          color: #16432a;
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: 1px solid rgba(26,158,74,0.35);
          border-radius: 3px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
          transform: translate(-50%, calc(-100% - 12px));
          transition: opacity 0.2s ease;
        }
        .hero-tip::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -5px;
          width: 9px;
          height: 9px;
          background: #fef8f3;
          border-right: 1px solid rgba(26,158,74,0.35);
          border-bottom: 1px solid rgba(26,158,74,0.35);
          transform: translateX(-50%) rotate(45deg);
        }
        .hero-tip--off { opacity: 0; }
        .hero-tip .tip-touch { display: none; }
        @media (hover: none) {
          .hero-tip .tip-hover { display: none; }
          .hero-tip .tip-touch { display: inline; }
        }

        .hero-debug {
          display: none;
          position: absolute;
          left: 8px;
          bottom: 8px;
          z-index: 7;
          padding: 6px 10px;
          background: rgba(0,0,0,0.85);
          color: #4dff91;
          font: 12px monospace;
          pointer-events: none;
        }
        .hero-debug[data-on] { display: block; }

        .hero-drawer {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 6;
          display: flex;
          flex-direction: column;
          width: min(400px, 100%);
          background: rgba(5,15,8,0.94);
          border-left: 1px solid rgba(26,158,74,0.5);
          box-shadow: -12px 0 48px rgba(0,0,0,0.7);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          outline: none;
          transform: translateX(100%);
          visibility: hidden;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0.35s;
        }
        .hero-drawer.open {
          transform: none;
          visibility: visible;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), visibility 0s;
        }
        .hero-drawer-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          padding: 0 8px 0 18px;
          height: 52px;
          border-bottom: 1px solid rgba(26,158,74,0.25);
        }
        .hero-drawer-title {
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.28em;
          color: #4dff91;
        }
        .hero-drawer-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          color: #4dff91;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s ease;
        }
        .hero-drawer-close:hover { color: #fff; }
        .hero-drawer-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 14px;
          min-height: 0;
          overflow-y: auto;
          padding: 16px 18px 20px;
        }
        .hero-drawer-cta {
          justify-content: center;
          width: 100%;
          text-decoration: none;
        }
        @media (max-width: 767px) {
          .hero-drawer {
            top: auto;
            left: 0;
            width: auto;
            max-height: 78%;
            padding-bottom: calc(var(--home-btn-size, 0px) + (var(--home-btn-gap, 0px) * 2) + env(safe-area-inset-bottom));
            border-left: none;
            border-top: 1px solid rgba(26,158,74,0.5);
            box-shadow: 0 -12px 48px rgba(0,0,0,0.7);
            transform: translateY(100%);
          }
        }

        /* ── HERO SPOTLIGHT PANELS (Bio left / release + links right of the beam; desktop hover only) ── */
        .hero-spot-panel {
          display: none;
          position: absolute;
          left: 0;
          top: 54%;
          z-index: 5;
          flex-direction: column;
          gap: 12px;
          width: clamp(230px, 22vw, 320px);
          max-height: 88%;
          overflow-y: auto;
          scrollbar-width: none;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-50%) translateX(var(--spot-shift, 0px));
          transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0.35s;
        }
        .hero-spot-panel::-webkit-scrollbar { display: none; }
        .hero-spot-left  { --spot-shift: 18px; }
        .hero-spot-right {
          --spot-shift: -18px;
          flex-direction: row;
          align-items: flex-start;
          width: auto;
        }
        .hero-spot-right > * { width: clamp(250px, 19vw, 300px); flex-shrink: 0; }
        .hero-spot-panel.on {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%);
          transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1), visibility 0s;
        }
        @media (hover: hover) and (min-width: 960px) {
          .hero-spot-panel { display: flex; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-spot-panel,
          .hero-spot-panel.on { transition: none; transform: translateY(-50%); }
        }
        .hero-dispo-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }
        .hero-dispo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          height: 34px;
          padding: 0 8px;
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-align: left;
          text-decoration: none;
          color: #fff;
          background: rgba(10,20,14,0.55);
          border: 1px solid rgba(77,255,145,0.35);
          border-radius: 2px;
          cursor: pointer;
          transition: transform 0.07s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hero-sotd { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
        .hero-sotd-art {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          object-fit: cover;
          border: 1px solid rgba(77,255,145,0.35);
          border-radius: 2px;
        }
        .hero-sotd-meta { margin: 6px 0 0; font-size: 0.85em; }
        .hero-sotd-meta div { display: flex; gap: 6px; }
        .hero-sotd-meta dt { color: rgba(255,255,255,0.5); }
        .hero-sotd-meta dd { margin: 0; color: #4dff91; }
        .hero-sotd-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .hero-sotd-links .hero-dispo-link { flex-direction: column; justify-content: center; gap: 4px; height: 52px; text-align: center; font-size: 0.56rem; }
        .hero-dispo-link img { width: 18px; height: 18px; object-fit: contain; border-radius: 3px; flex-shrink: 0; }
        .hero-dispo-link:hover {
          transform: translateY(-1px);
          background: rgba(26,158,74,0.25);
          border-color: #4dff91;
          box-shadow: 0 4px 14px rgba(13,92,41,0.5), 0 0 14px rgba(77,255,145,0.35);
        }

        /* ── SOCIAL ICONS (inline SVG) + MOBILE CAROUSEL ── */
        .hero-social-icon { color: #fff; }
        .hero-social-icon svg { display: block; width: 24px; height: 24px; }
        .hero-carousel { display: none; }
        @media (max-width: 767px) {
          /* No spotlight on phones: hide the hotspot, tooltip, debug readout and drawer */
          .hero-hot-svg,
          .hero-tip,
          .hero-debug,
          .hero-drawer { display: none !important; }

          .hero-carousel {
            display: flex;
            position: absolute;
            left: 0;
            right: 0;
            top: 48%;
            bottom: calc(var(--home-btn-size, 0px) + (var(--home-btn-gap, 0px) * 2) + env(safe-area-inset-bottom));
            z-index: 5;
            align-items: flex-start;
            gap: 12px;
            padding: 0 16px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-padding: 0 16px;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
          }
          .hero-carousel::after { content: ''; flex: 0 0 4px; }
          .hero-carousel-item {
            flex: 0 0 min(82vw, 340px);
            max-height: 100%;
            overflow-y: auto;
            scroll-snap-align: start;
            scrollbar-width: none;
          }
          .hero-carousel-item::-webkit-scrollbar { display: none; }
        }

        /* ── HERO TAGLINE — responsive size/spacing ── */
        .hero-tagline {
          font-size: 1.75em;
          letter-spacing: 0.1em;
        }
        @media (min-width: 768px) {
          .hero-tagline {
            font-size: 1.75em;
            letter-spacing: 0.28em;
          }
        }
                  /* ── MAIN HERO — desktop unchanged; mobile fills visible viewport below fixed 60px header ── */
        .hero-main { min-height: calc(100vh - 90px); }
        .hero-main-content { min-height: 100vh; }
        @media (max-width: 767px) {
          .hero-main,
          .hero-main-content {
            min-height: calc(100vh - 60px);
            min-height: calc(100svh - 60px);
          }
        }

        /* ── SIDEBAR GRADIENT RULE LINE (pseudo-element) ── */
        .news-sidebar::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(26,158,74,0.35) 20%, rgba(26,158,74,0.18) 60%, rgba(26,158,74,0.35) 80%, transparent);
          pointer-events: none;
        }

        /* ── SCANLINE OVERLAY (pseudo-element) ── */
        .scanline::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.09) 3px, rgba(0,0,0,0.09) 4px);
          pointer-events: none;
          z-index: 2;
        }

        /* ── PARTNER CTA HOVER (box-shadow glow) ── */
        .partner-cta:hover {
          background: rgba(26,158,74,0.12);
          border-color: rgba(77,255,145,0.7) !important;
          box-shadow: 0 0 16px rgba(26,158,74,0.2);
        }

        /* ── SCROLLBAR HIDE ── */
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* ── HERO LISTEN NOW BUTTON ── */
        .listen-btn {
          font-family: 'Poppins_semibold', monospace;
          font-size: 1.1em;
          letter-spacing: 0.18em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 32px;
          height: 52px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .listen-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
          border-bottom-color: #0d5c29;
          box-shadow: 0 6px 0 #0d5c29, 0 8px 20px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 22px rgba(77,255,145,0.55);
        }
                .listen-btn:active {
          transform: translateY(4px);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.3), inset 0 0 16px rgba(77,255,145,0.2);
        }

        /* ── LISTEN ON (PLATFORM) BUTTONS ── */
        .listen-on-wrap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .listen-on-btn {
          font-family: 'Poppins_semibold', monospace;
          font-size: 0.85em;
          letter-spacing: 0.1em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px;
          height: 48px;
          background: rgba(10,20,14,0.55);
          border: 1px solid rgba(77,255,145,0.35);
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.15s ease, border-color 0.15s ease;
          user-select: none;
        }
        .listen-on-btn img {
          width: 22px;
          height: 22px;
          object-fit: contain;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .listen-on-btn:hover {
          transform: translateY(-2px);
          background: rgba(26,158,74,0.25);
          border-color: #4dff91;
          box-shadow: 0 4px 14px rgba(13,92,41,0.5), 0 0 14px rgba(77,255,145,0.35);
        }
        .listen-on-btn:active {
          transform: translateY(1px);
        }

        /* ── FLOATING MINI-PLAYER ── */
        .mini-player {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 200;
          width: 340px;
          background: #050f08;
          border: 1px solid rgba(26,158,74,0.5);
          box-shadow: 0 0 0 1px rgba(26,158,74,0.08), 0 12px 48px rgba(0,0,0,0.85), 0 0 32px rgba(26,158,74,0.08);
          transform: translateY(calc(100% + 40px));
          opacity: 0;
          transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease;
          pointer-events: none;
        }
        .mini-player.visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
                .mini-player-close:hover { color: #fff; }

        /* Collapse chevron (desktop) */
        .mini-player-collapse {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          color: #4dff91;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s ease;
        }
        .mini-player-collapse:hover { color: #fff; }
        .mini-player-collapse svg { transition: transform 0.25s ease; }
        .mini-player.collapsed .mini-player-collapse svg { transform: rotate(180deg); }

        /* Iframe wrapper — height animates on desktop collapse (iframe stays mounted, keeps playing) */
        .mini-player-body {
          height: 191px;
          overflow: hidden;
          transition: height 0.3s cubic-bezier(0.22,1,0.36,1);
        }

        /* Pull tab (mobile only) */
        .mini-player-tab { display: none; }

        @media (min-width: 768px) {
          .mini-player.collapsed .mini-player-body { height: 0; }
        }

        @media (max-width: 767px) {
          .mini-player {
            left: 40px;
            right: 12px;
            width: auto;
            bottom: calc(var(--home-btn-size) + (var(--home-btn-gap) * 2) + env(safe-area-inset-bottom));
          }
          /* Slide fully off the right edge; the tab (attached to the left edge) stays on screen */
          .mini-player.visible.collapsed {
            transform: translateX(calc(100% + 12px));
          }
          .mini-player-collapse { display: none; }
          .mini-player-tab {
            position: absolute;
            top: 50%;
            right: 100%;
            width: 28px;
            height: 72px;
            margin-top: -36px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4dff91;
            background: #050f08;
            border: 1px solid rgba(26,158,74,0.5);
            border-right: none;
            border-radius: 6px 0 0 6px;
            box-shadow: -6px 0 18px rgba(0,0,0,0.6);
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
          .mini-player-tab svg { transition: transform 0.25s ease; }
          .mini-player.collapsed .mini-player-tab svg { transform: rotate(180deg); }
        }

        /* ── CONTACT FORM STYLES ── */
        .contact-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(26,158,74,0.25);
          color: #fff;
          font-family: 'Poppins', monospace;
          font-size: 0.9em;
          padding: 10px 14px;
          border-radius: 2px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
        }
        .contact-input:focus {
          border-color: #4dff91;
          box-shadow: 0 0 0 1px #4dff91, 0 0 12px rgba(77,255,145,0.15);
        }
        .contact-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .contact-submit {
          font-family: 'Poppins', monospace;
          font-size: 1em;
          letter-spacing: 0.18em;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 32px;
          height: 52px;
          background: linear-gradient(175deg, #22b85a 0%, #178f42 100%);
          border: 1px solid #1a9e4a;
          border-bottom-color: #0d5c29;
          border-right-color: #126e32;
          box-shadow: 0 4px 0 #0d5c29, 0 6px 16px rgba(13,92,41,0.5), inset 0 1px 0 rgba(255,255,255,0.35);
          cursor: pointer;
          transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.08s ease;
          user-select: none;
        }
        .contact-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(175deg, #2bd06a 0%, #1aa64c 100%);
          border-color: #4dff91;
          border-bottom-color: #0d5c29;
          box-shadow: 0 6px 0 #0d5c29, 0 8px 14px rgba(13,92,41,0.4), 0 0 14px rgba(77,255,145,0.45);
        }
        .contact-submit:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.25);
        }
        .contact-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .status-message {
          font-family: 'Poppins', monospace;
          font-size: 0.85em;
          padding: 8px 14px;
          border-radius: 2px;
          margin-top: 8px;
        }
        .status-message.success {
          color: #4dff91;
          border: 1px solid rgba(77,255,145,0.3);
          background: rgba(77,255,145,0.08);
        }
        .status-message.error {
          color: #ff6b6b;
          border: 1px solid rgba(255,107,107,0.3);
          background: rgba(255,107,107,0.08);
        }
      `}</style>

      <div className="flex flex-col h-screen overflow-hidden">

        <Header />
        <MobileBottomNav />

        {/* ── BODY ROW ───────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 overflow-hidden bg-[#1a2b1e]">

            {/* Active section — releases / home */}
            {/* CRT scanline effect DISABLED — to restore, add the `scanline` class back to the div below. */}
            <div
              className="absolute inset-0 flex overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #1a2420 100%)' }}
            >

              {/* ── NEWS SIDEBAR ──────────────────────────────────────── 
              <aside className="hidden md:flex news-sidebar relative flex-col w-80 flex-shrink-0 bg-[#fef8f3] z-[25] overflow-hidden">
                <Corners />

                <div className="no-scrollbar flex-1 overflow-y-auto">
                  {newsItems.length === 0 && (
                    <div className="p-5" style={{ fontFamily: "'Poppins', monospace", fontSize: '0.85em', color: '#3c5e4c', opacity: 0.7 }}>
                      No news yet.
                    </div>
                  )}
                  {newsItems.map((item) => (
                    <a
                      key={item.id}
                      href={`/feed/${item.slug}`}
                      className="block p-5 border-b border-[rgba(26,158,74,0.12)] transition-colors duration-150 hover:bg-[rgba(26,158,74,0.05)] no-underline"
                    >
                      {item.coverImageUrl && /\.(mp4|webm|mov|m4v)$/i.test(item.coverImageUrl) ? (
                        <video
                          src={item.coverImageUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-[180px] mb-3 rounded-[3px] object-cover"
                          style={{ border: '1px solid rgba(26,158,74,0.15)' }}
                        />
                      ) : item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="w-full h-[180px] mb-3 rounded-[3px] object-cover"
                          style={{ border: '1px solid rgba(26,158,74,0.15)' }}
                        />
                      ) : (
                        <div
                          className="w-full h-[180px] mb-3 rounded-[3px] flex items-center justify-center opacity-55"
                          style={{
                            background: 'linear-gradient(135deg, #e3f6e9, #cfeede)',
                            border: '1px solid rgba(26,158,74,0.15)',
                            fontFamily: "'Poppins', monospace",
                            fontSize: '0.85em',
                            letterSpacing: '0.3em',
                            color: '#1a9e4a',
                          }}
                        >
                          IMAGE
                        </div>
                      )}
                      <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.78em', letterSpacing: '0.22em', color: '#1a9e4a', opacity: 0.8, marginBottom: '6px' }}>
                        {item.date}
                      </div>
                      <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.9em', color: '#16432a', lineHeight: 1.45 }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: "'Poppins', monospace", fontSize: '0.78em', color: '#3c5e4c', opacity: 0.7, lineHeight: 1.6, marginTop: '8px' }}>
                        {item.teaser}
                      </div>
                      <span style={{ display: 'inline-block', marginTop: '10px', fontFamily: "'Poppins', monospace", fontSize: '0.74em', letterSpacing: '0.3em', color: '#ffffff', opacity: 0.75, border: '1px solid rgba(26,158,74,0.25)', padding: '4px 12px', background: 'rgba(26,158,74)' }}>
                        {item.tag}
                      </span>
                    </a>
                  ))}
                </div>
              </aside> */}

              {/* ── MAIN SCROLL COLUMN ────────────────────────────────── */}
              <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto flex flex-col pt-[60px] md:pt-0">

                {/* ═══ NEW LABEL HERO — "REALEST. TRUEST." ═══ */}
                  <div ref={heroRef} className="hero-main relative flex-shrink-0 overflow-hidden">

                  {/* Hero background video — top-aligned so the top of the frame is never cropped */}
                  <video
                    ref={heroVideoRef}
                    src={`${MEDIA_BASE}/web-hero.mp4`}
                    autoPlay muted loop playsInline
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />

                  {/* Hero figure (cutout) — DISABLED. To restore, delete the `false &&` wrapper and its closing `)}` below. */}
                  {false && (
                  <div className="absolute inset-0 flex items-end justify-center pointer-events-none" aria-hidden="true">
                    <div className="hero-figure-glow" />
                    <div className="hero-figure-3d">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${MEDIA_BASE}/IMG_7478-Retouched.jpg`}
                        alt=""
                        className="hero-figure-img"
                      />
                    </div>
                    <svg width="0" height="0" style={{ position: 'absolute' }} focusable="false">
                      <filter id="key-out-white" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                        <feColorMatrix
                          type="matrix"
                          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -2.55 -8.58 -0.87 0 9.6"
                        />
                        <feComposite in2="SourceAlpha" operator="in" />
                      </filter>
                    </svg>
                  </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,16,12,0.7) 0%, transparent 25%, transparent 60%, rgba(10,16,12,0.95) 100%)' }} />
                  {/* Hero hotspot — an SVG shape over the person; hover highlights, click opens the drawer.
                      The dim and pool layers must stay AFTER the hotspot path (the CSS uses the ~ sibling selector). */}
                  <svg className="hero-hot-svg">
                    <defs>
                      {/* Beam of light: brightest at the top centre, fading outward and downward */}
                      <radialGradient id="hero-beam" cx="0.5" cy="0" r="1" fx="0.5" fy="0">
                        <stop offset="0" stopColor="#8dffb8" stopOpacity="0.45" />
                        <stop offset="0.45" stopColor="#4dff91" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#1a9e4a" stopOpacity="0.06" />
                      </radialGradient>
                      {/* Pool of light where the beam lands */}
                      <radialGradient id="hero-pool" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stopColor="#8dffb8" stopOpacity="0.55" />
                        <stop offset="0.6" stopColor="#4dff91" stopOpacity="0.22" />
                        <stop offset="1" stopColor="#4dff91" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <path
                      ref={hotspotRef}
                      role="button"
                      tabIndex={0}
                      className={`hero-hotspot${drawerOpen || spotOn ? ' active' : ''}`}
                      aria-label="Learn about Alexx A-Game"
                      onPointerEnter={showSpot}
                      onPointerLeave={hideSpot}
                      onFocus={showSpot}
                      onBlur={hideSpot}
                      aria-haspopup="dialog"
                      aria-expanded={drawerOpen}
                      onClick={() => setDrawerOpen((o) => !o)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDrawerOpen((o) => !o);
                        }
                      }}
                    />
                    <path ref={dimRef} className="hero-hot-dim" />
                    <ellipse ref={poolRef} className="hero-hot-pool" />
                  </svg>
                  <div ref={tipRef} className={`hero-tip${drawerOpen || spotOn ? ' hero-tip--off' : ''}`} aria-hidden="true">
                    <span className="tip-hover">Hover to learn about A-Game</span>
                    <span className="tip-touch">Tap to learn about A-Game</span>
                  </div>
                  <div ref={debugRef} className="hero-debug" />

                  {/* Hero overlay — name above cutout; panels left/right (desktop) */}
                  <div className="absolute inset-0 z-[3] pointer-events-none">
                    {/* Artist name heading — DISABLED. To restore, delete the `false &&` wrapper and its closing `)}`. */}
                    {false && (
                    <h1 className="hero-artist-name">ALEXX A-GAME</h1>
                    )}

                    {/* Side panels DISABLED — their content now lives in the hero drawer. To restore, delete the `false &&` wrappers. */}
                    {false && (
                    <div className="hero-side hero-side-left">
                      <RadioPanel onTuneIn={() => openPlayer(RADIO_EMBED)} />
                      <FeaturedPanel onPlay={() => openPlayer(RELEASE_EMBED)} />
                    </div>
                    )}

                    {false && (
                    <div className="hero-side hero-side-right">
                      <StoryPanel />
                      <SocialsPanel />
                    </div>
                    )}
                  </div>

                  {/* Spotlight panels — fade in beside the beam while the spotlight is active (desktop hover only).
                      Bio + socials on the left; featured release and song of the day side by side on the right.
                      Positioned by the hero frame loop (left style); hidden while the drawer is open. */}
                  <div
                    ref={leftPanelRef}
                    className={`hero-spot-panel hero-spot-left${spotOn && !drawerOpen ? ' on' : ''}`}
                    aria-hidden={!(spotOn && !drawerOpen)}
                    onPointerEnter={showSpot}
                    onPointerLeave={hideSpot}
                    onFocus={showSpot}
                    onBlur={hideSpot}
                  >
                    <StoryPanel />
                    <SocialsPanel />
                  </div>
                  <div
                    ref={rightPanelRef}
                    className={`hero-spot-panel hero-spot-right${spotOn && !drawerOpen ? ' on' : ''}`}
                    aria-hidden={!(spotOn && !drawerOpen)}
                    onPointerEnter={showSpot}
                    onPointerLeave={hideSpot}
                    onFocus={showSpot}
                    onBlur={hideSpot}
                  >
                    <ReleaseLinksPanel onPlay={() => openPlayer(RELEASE_EMBED)} />
                    <SongOfTheDayPanel onPlay={openPlayer} />
                  </div>

                  {/* Mobile carousel — phones get no hover/spotlight; the same sections sit in a horizontal swipe row
                      over the lower half of the hero (shown by CSS at max-width 767px only). */}
                  <div className="hero-carousel no-scrollbar" role="region" aria-label="About Alexx A-Game">
                    <div className="hero-carousel-item">
                      <StoryPanel />
                    </div>
                    <div className="hero-carousel-item">
                      <ReleaseLinksPanel onPlay={() => openPlayer(RELEASE_EMBED)} />
                    </div>
                    <div className="hero-carousel-item">
                      <SongOfTheDayPanel onPlay={openPlayer} />
                    </div>
                    <div className="hero-carousel-item">
                      <SocialsPanel />
                    </div>
                  </div>

                  {/* Hero drawer — stays open until closed (button, Esc, or click outside) */}
                  <div
                    ref={drawerRef}
                    role="dialog"
                    aria-label="About Alexx A-Game"
                    tabIndex={-1}
                    className={`hero-drawer${drawerOpen ? ' open' : ''}`}
                  >
                    <div className="hero-drawer-head">
                      <span className="hero-drawer-title">MEET ALEXX A-GAME</span>
                      <button
                        type="button"
                        className="hero-drawer-close"
                        aria-label="Close"
                        onClick={() => {
                          setDrawerOpen(false);
                          hotspotRef.current?.focus({ preventScroll: true });
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                    <div className="hero-drawer-body">
                      <StoryPanel />
                      <FeaturedPanel onPlay={() => openPlayer(RELEASE_EMBED)} />
                      <SongOfTheDayPanel onPlay={openPlayer} />
                      <SocialsPanel />
                      <RadioPanel onTuneIn={() => openPlayer(RADIO_EMBED)} />
                      <a href="/discography" className="listen-btn hero-drawer-cta">
                        VIEW DISCOGRAPHY →
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  {/* Content */}
                  <div
                    className="hidden hero-main-content relative z-[3] flex flex-col items-center justify-center gap-6 px-10 text-center"
                  >
                    <div className="flex flex-col items-center gap-1">
                       <h1
                        className="hidden md:block"
                        style={{
                          fontFamily: "'Poppins_semibold', monospace",
                          fontSize: '3em',
                          color: '#fff',
                          letterSpacing: '0.12em',
                          textShadow: '0 2px 28px rgba(0,0,0,0.9), 0 0 50px rgba(77,255,145,0.10)',
                          lineHeight: 1.0,
                        }}
                      >
                        GAMEBOY RECORDS
                      </h1>
                      <p
                        className="hero-tagline"
                        style={{
                          fontFamily: "'Poppins', monospace",
                          color: '#4dff91',
                          textShadow: '0 0 30px rgba(77,255,145,0.40)',
                          lineHeight: 1.2,
                          marginTop: '4px',
                        }}
                      >
                        REALEST SOUND.
                        <br className="md:hidden" />
                        {' '}TRUEST VISION.
                      </p>
                    </div>
                    <button
                      className="listen-btn"
                      onClick={() => openPlayer('https://www.youtube.com/embed/videoseries?list=PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo&autoplay=1&controls=1')}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 block" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      TUNE IN
                    </button>
                  </div>
                </div>
                {/* Stacked hero panels DISABLED — their content now lives in the hero drawer. To restore, delete the `false &&` wrapper and its closing `)}`. */}
                {false && (
                <div
                  className="hero-stack flex-shrink-0 relative z-[2] px-6 py-10"
                  style={{ background: 'linear-gradient(180deg, #0c1510 0%, #0f1a12 100%)' }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[760px] mx-auto">
                    <RadioPanel onTuneIn={() => openPlayer(RADIO_EMBED)} />
                    <FeaturedPanel onPlay={() => openPlayer(RELEASE_EMBED)} />
                    <StoryPanel />
                    <SocialsPanel />
                  </div>
                </div>
                )}

                
                <div
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{ minHeight: 'calc(100vh - 84px)' }}
                >
                  {/* Background video — blurred, stretched fill */}
                  <video
                    src={`${MEDIA_BASE}/Rise Up Now (Guitar Cover).mp4`}
                    autoPlay muted loop playsInline
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(5px) brightness(0.55)' }}
                  />

                  {/* Foreground video — true vertical aspect, centered, no crop */}
                  <video
                    src={`${MEDIA_BASE}/Rise Up Now (Guitar Cover).mp4`}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Overlay layer 1 — uniform dark tint for readability */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
                  {/* Overlay layer 2 — top + bottom gradient fade */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,16,12,0.32) 0%, transparent 22%, transparent 62%, rgba(10,16,12,0.5) 100%)' }} />
                  {/* Hero content */}
                  <div
                    className="relative z-[3] flex flex-col items-center justify-center gap-10 px-10 text-center"
                    style={{ minHeight: 'calc(100vh - 84px)' }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <h1 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '3em', color: '#fff', letterSpacing: '0.12em', textShadow: '0 2px 28px rgba(0,0,0,0.9), 0 0 40px rgba(77,255,145,0.12)', lineHeight: 1 }}>
                        RISE UP NOW (GUITAR VERSION)
                      </h1>
                      <h2 style={{ fontFamily: "'Poppins', monospace", fontSize: '1.75em', color: '#4dff91', letterSpacing: '0.28em', textShadow: '0 0 24px rgba(77,255,145,0.55)', lineHeight: 1, marginTop: '12px' }}>
                        ALEXX A-GAME
                      </h2>
                    </div>
                    <div className="listen-on-wrap">
                      <button
                        className="listen-on-btn"
                        onClick={() => openPlayer('https://www.youtube.com/embed/etLGFz3dtsM?si=tzBYcOWR4rJUbu9J&autoplay=1&controls=1')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/youtube.png" alt="YouTube" />
                        YOUTUBE
                      </button>
                      <a
                        href="https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/apple-music.png" alt="Apple Music" />
                        APPLE MUSIC
                      </a>
                      <a
                        href="https://open.spotify.com/track/3tcAFyDjx0YBBJ2Y6TvVVh?si=a50460c499134546"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/spotify.png" alt="Spotify" />
                        SPOTIFY
                      </a>
                      <a
                        href="https://audiomack.com/alexxagame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/audiomack.png" alt="Audiomack" />
                        AUDIOMACK
                      </a>
                      <a
                        href="https://soundcloud.com/alexxagame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/soundcloud.png" alt="Soundcloud" />
                        SOUNDCLOUD
                      </a>
                    </div>
                  </div>
                </div>

                {/* ═══ STILL A RISE — release section ═══ */}
                <div
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{ minHeight: 'calc(100vh - 84px)' }}
                >
                  {/* Background video — blurred, stretched fill */}
                  <video
                    src={`${MEDIA_BASE}/Standing.mp4`}
                    autoPlay muted loop playsInline
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(5px) brightness(0.55)' }}
                  />

                  {/* Foreground video — true vertical aspect, centered, no crop */}
                  <video
                    src={`${MEDIA_BASE}/Standing.mp4`}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Overlay layer 1 — uniform dark tint for readability */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
                  {/* Overlay layer 2 — top + bottom gradient fade */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,16,12,0.32) 0%, transparent 22%, transparent 62%, rgba(10,16,12,0.5) 100%)' }} />
                  {/* Hero content */}
                  <div
                    className="relative z-[3] flex flex-col items-center justify-center gap-10 px-10 text-center"
                    style={{ minHeight: 'calc(100vh - 84px)' }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <h1 style={{ fontFamily: "'Poppins_semibold', monospace", fontSize: '3em', color: '#fff', letterSpacing: '0.12em', textShadow: '0 2px 28px rgba(0,0,0,0.9), 0 0 40px rgba(77,255,145,0.12)', lineHeight: 1 }}>
                        STILL A RISE
                      </h1>
                      <h2 style={{ fontFamily: "'Poppins', monospace", fontSize: '1.75em', color: '#4dff91', letterSpacing: '0.28em', textShadow: '0 0 24px rgba(77,255,145,0.55)', lineHeight: 1, marginTop: '12px' }}>
                        ALEXX A-GAME
                      </h2>
                    </div>
                    <div className="listen-on-wrap">
                      <button
                        className="listen-on-btn"
                        onClick={() => openPlayer('https://www.youtube.com/embed/BhKt3DVRRkw?si=YgpNpIqT8BEMDctg&autoplay=1&controls=1')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/youtube.png" alt="YouTube" />
                        YOUTUBE
                      </button>
                      <a
                        href="https://music.apple.com/us/album/still-a-rise-single/6808531561"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/apple-music.png" alt="Apple Music" />
                        APPLE MUSIC
                      </a>
                      <a
                        href="https://open.spotify.com/track/6x4zWKWNHfCzWDDMPJaG7N?si=098d7034338040bb"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/spotify.png" alt="Spotify" />
                        SPOTIFY
                      </a>
                      <a
                        href="https://audiomack.com/alexxagame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/audiomack.png" alt="Audiomack" />
                        AUDIOMACK
                      </a>
                      <a
                        href="https://soundcloud.com/alexxagame"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="listen-on-btn"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/soundcloud.png" alt="Soundcloud" />
                        SOUNDCLOUD
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-shrink-0 relative z-[2]"
                  style={{ background: 'linear-gradient(180deg, #0f1a12 0%, #0c1510 100%)' }}
                >
                  <GameIconsBackground />


                  {/* TEMP DISABLED: Partners + Contact sub-sections (remove `{false && (<>` and matching `</>)}` to restore) */}
                  {false && (
                  <>
                  {/* Partners sub-section */}
                  <div className="px-12 py-10">
                    {/* Section header */}
                    <div className="flex flex-col items-center mb-12 text-center">
                      <h2 style={{ fontFamily: "'Poppins', monospace", fontSize: '3em', color: '#4dff91', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(77,255,145,0.25)' }}>
                        Teammates
                      </h2>
                      <p style={{ fontFamily: "'Poppins', monospace", fontSize: '1.25em', color: '#4dff91', opacity: 0.4 }}>
                        Brands and organisations we work alongside.
                      </p>
                    </div>

                    {/* Vault showcase card */}
                    <div
                      className="relative grid grid-cols-2 max-w-[1080px] mx-auto bg-[#fef8f3] border-[4px] border-[#3dc97e] rounded"
                      style={{ minHeight: '420px', alignItems: 'stretch' }}
                    >

                      {/* Left — video */}
                      <div className="w-full h-[440px] overflow-hidden">
                        <video
                          src={`${MEDIA_BASE}/vault.mp4`}
                          poster={`${MEDIA_BASE}/the-vault-1.jpg`}
                          autoPlay muted loop playsInline
                          className="w-full h-full object-cover block"
                        />
                      </div>

                      {/* Right — content */}
                      <div className="flex flex-col items-start justify-center gap-8 px-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${MEDIA_BASE}/the-vault-logo.jpg`} alt="The Vault" className="max-w-[260px] h-auto block" />
                        <p  className="font-bold" style={{ fontFamily: "'Poppins', monospace", fontSize: '1em', color: '#16432a', lineHeight: 1.6 }}>
                          When we're in Negril, we voice at The Vault. <br></br> A partnering recording studio built for late-night sessions and serious sound. Located in the heart of the city's nightlife, it serves as the premium creative hub for bringing records to life.
                        </p>
                        <a
                          href="#"
                          className="listen-btn inline-flex items-center gap-2 no-underline transition-all duration-150"
                          style={{ letterSpacing: '0.2em', padding: '8px 20px' }}
                        >
                          BOOK A SESSION →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Contact sub-section */}
                  <div className="px-12 py-20">
                    <div className="flex flex-col items-center mb-12 text-center">
                    <h2
                      style={{ fontFamily: "'Poppins', monospace", fontSize: '3em', color: '#4dff91', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(77,255,145,0.25)' }}
                    >
                      SEND A MESSAGE
                    </h2>
                    <p
                      style={{ fontFamily: "'Poppins', monospace", fontSize: '1.25em', color: '#4dff91', opacity: 0.4 }}
                    >
                      We’ll get back to you within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto flex flex-col gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="contact-input"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="contact-input"
                    />
                    <textarea
                      name="message"
                      placeholder="Your message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="contact-input"
                      style={{ resize: 'vertical' }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="contact-submit self-start"
                    >
                      {isSubmitting ? 'SENDING…' : 'SEND MESSAGE'}
                    </button>
                    {submitStatus.type && (
                      <div className={`status-message ${submitStatus.type}`}>
                        {submitStatus.message}
                      </div>
                    )}
                  </form>
                  </div>{/* /contact sub-section */}
                  </>
                  )}
                </div>{/* /partners+contact shared wrapper */}

                <Footer />

              </div>{/* /main-scroll */}
            </div>{/* /section */}
          </div>
        </div>

      </div>
      {/* ── FLOATING MINI-PLAYER ───────────────────────────────────────
                     Mounted on open. Close button slides the panel out, then
           unmounts the iframe after the transition so playback stops.
      ─────────────────────────────────────────────────────────────── */}
      {playerMounted && (
                          <div ref={playerRef} className={`mini-player${playerVisible ? ' visible' : ''}${playerCollapsed ? ' collapsed' : ''}`}>

          {/* Pull tab (mobile only) */}
          <button
            type="button"
            className="mini-player-tab"
            onClick={() => setPlayerCollapsed((c) => !c)}
            aria-label={playerCollapsed ? 'Show player' : 'Hide player'}
            aria-expanded={!playerCollapsed}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-3 border-b border-[rgba(26,158,74,0.25)]"
            style={{ height: '36px' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4dff91] animate-pulse" />
              <span style={{ fontFamily: "'Poppins', monospace", fontSize: '0.7em', letterSpacing: '0.28em', color: '#4dff91' }}>
                NOW PLAYING
              </span>
            </div>
                        <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlayerCollapsed((c) => !c)}
                className="mini-player-collapse"
                aria-label={playerCollapsed ? 'Expand player' : 'Collapse player'}
                aria-expanded={!playerCollapsed}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>

                     <div className="mini-player-body">
            <iframe
              src={playerSrc}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Gameboy Records Player"
              className="w-full border-0 block"
              style={{ height: '191px' }}
            />
          </div>

        </div>
      )}
    </>
  );
}
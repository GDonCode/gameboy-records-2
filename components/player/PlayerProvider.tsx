// components/player/PlayerProvider.tsx
// A floating YouTube player shared by the whole site. Any component can call usePlayer().play(videoId, title)
// and the video plays in the corner while the visitor keeps browsing. Closing it unmounts the iframe, so
// playback stops.
'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/components/icons';

interface PlayerApi {
  /** Play a YouTube video (11-character id), a YouTube playlist (`list:<id>`) or a Spotify track (`spotify:<track id>`). */
  play: (id: string, title: string) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerApi | null>(null);

export function usePlayer(): PlayerApi {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>.');
  return ctx;
}

function embedUrl(id: string) {
  if (id.startsWith('spotify:')) return `https://open.spotify.com/embed/track/${encodeURIComponent(id.slice(8))}?utm_source=generator&theme=0`;
  const params = 'autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1';
  return id.startsWith('list:')
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(id.slice(5))}&${params}`
    : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}`;
}

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{ id: string; title: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback((id: string, title: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCurrent({ id, title });
    setCollapsed(false);
    // Mount first, then slide in on the next frame.
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    closeTimer.current = setTimeout(() => setCurrent(null), 400);
  }, []);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, close]);

  return (
    <PlayerContext.Provider value={{ play, close }}>
      {children}
      {current && (
        <section
          aria-label="Now playing"
          className={`fixed z-[200] right-3 left-3 bottom-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px] bg-ink border-2 border-paper/40 shadow-[6px_6px_0_var(--color-gold)] transition-[transform,opacity] duration-[400ms] ease-[var(--ease-quiet)] ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%+40px)] opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-3 h-11 pl-4 pr-1 border-b border-line-inv">
            <p className="flex items-center gap-2 min-w-0 m-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-light animate-pulse shrink-0" aria-hidden="true" />
              <span className="eyebrow text-gold-light shrink-0">Now playing</span>
              <span className="text-[0.8rem] text-mist truncate">{current.title}</span>
            </p>
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Show player' : 'Minimise player'}
                className="zoom-content inline-flex items-center justify-center w-9 h-9 text-mist hover:text-paper cursor-pointer"
              >
                <span>
                  <Icon name="chevron-right" className={`w-3.5 h-3.5 transition-transform ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
                </span>
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close player"
                className="zoom-content inline-flex items-center justify-center w-9 h-9 text-mist hover:text-paper cursor-pointer"
              >
                <span>
                  <Icon name="xmark" className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
          <div className={`overflow-hidden transition-[height] duration-300 ${collapsed ? 'h-0' : current.id.startsWith('spotify:') ? 'h-[152px]' : 'h-[200px]'}`}>
            <iframe
              key={current.id}
              src={embedUrl(current.id)}
              title={`${current.title} — ${current.id.startsWith('spotify:') ? 'Spotify' : 'YouTube'} player`}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              className={`w-full border-0 block ${current.id.startsWith('spotify:') ? 'h-[152px]' : 'h-[200px]'}`}
            />
          </div>
        </section>
      )}
    </PlayerContext.Provider>
  );
}

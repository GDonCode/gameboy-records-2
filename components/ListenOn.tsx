// components/ListenOn.tsx
// "Listen on" buttons for a release: each service in its own brand colour with a white logo and white label.
// The box holds still on hover; the logo and label zoom inside it.
'use client';

import Icon, { type IconName } from '@/components/icons';

export type Service = 'youtube' | 'apple' | 'spotify' | 'audiomack' | 'soundcloud';

const SERVICES: Record<Service, { label: string; color: string; icon: IconName }> = {
  youtube: { label: 'YouTube', color: '#FF0000', icon: 'brand-youtube' },
  apple: { label: 'Apple Music', color: '#FA243C', icon: 'brand-applemusic' },
  spotify: { label: 'Spotify', color: '#1DB954', icon: 'brand-spotify' },
  audiomack: { label: 'Audiomack', color: '#FFA200', icon: 'brand-audiomack' },
  soundcloud: { label: 'SoundCloud', color: '#FF5500', icon: 'brand-soundcloud' },
};

export interface ListenLink {
  service: Service;
  /** Opens in a new tab. Leave out for YouTube when `onPlay` plays it on the page instead. */
  href?: string;
}

export default function ListenOn({
  title,
  links,
  onPlay,
  className = '',
}: {
  /** Release title, used in each button's accessible name. */
  title: string;
  links: ListenLink[];
  /** When set, the YouTube button plays the video in the on-page player. */
  onPlay?: () => void;
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap items-center justify-center gap-3 list-none p-0 m-0 ${className}`}>
      {links.map(({ service, href }) => {
        const s = SERVICES[service];
        const inner = (
          <span>
            <Icon name={s.icon} className="w-5 h-5" />
            {s.label}
          </span>
        );
        const style = { backgroundColor: s.color };
        return (
          <li key={service}>
            {service === 'youtube' && onPlay ? (
              <button type="button" onClick={onPlay} className="dsp-btn zoom-content" style={style} aria-label={`Play ${title} on YouTube`}>
                {inner}
              </button>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="dsp-btn zoom-content"
                style={style}
                aria-label={`Listen to ${title} on ${s.label} (opens in a new tab)`}
              >
                {inner}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

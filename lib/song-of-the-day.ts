// lib/song-of-the-day.ts
// "A-Game's song of the day": shown in the home page hero and used by the daily streaming quest.
// Safe to import from client and server code.

import { localDayKey } from '@/lib/day';

export const SONG_OF_THE_DAY_POINTS = 5;

export type StreamPlatform = 'spotify' | 'youtube' | 'apple';

export interface Song {
  id: string;
  title: string;
  artist: string;
  /** Cover art: an image URL or a path under /public. */
  art: string;
  /** Extra metadata rows shown under the title. Leave out anything you don't know. */
  meta: { label: string; value: string }[];
  youtubeId: string;
  links: Record<StreamPlatform, string>;
}

// The song of the day rotates through this list, one per local day (Jamaica time).
// To add a song, append an entry with a unique `id`.
export const SONGS: Song[] = [
  {
    id: 'rise-up-now-guitar',
    title: 'Rise Up Now (Guitar Version)',
    artist: 'Alexx A-Game',
    art: 'https://img.youtube.com/vi/etLGFz3dtsM/hqdefault.jpg',
    meta: [
      { label: 'Version', value: 'Guitar' },
      { label: 'Label', value: 'Gameboy Records' },
    ],
    youtubeId: 'etLGFz3dtsM',
    links: {
      spotify: 'https://open.spotify.com/track/3tcAFyDjx0YBBJ2Y6TvVVh',
      youtube: 'https://www.youtube.com/watch?v=etLGFz3dtsM',
      apple: 'https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519',
    },
  },
];

export const PLATFORMS: { id: StreamPlatform; label: string; icon: string }[] = [
  { id: 'spotify', label: 'Spotify', icon: '/spotify.png' },
  { id: 'youtube', label: 'YouTube', icon: '/youtube.png' },
  { id: 'apple', label: 'Apple Music', icon: '/apple-music.png' },
];

/** The song for a local day key ('YYYY-MM-DD'); defaults to today. */
export function getSongOfTheDay(dayKey: string = localDayKey()): Song {
  const dayNumber = Math.floor(Date.parse(`${dayKey}T00:00:00Z`) / 86_400_000);
  return SONGS[((dayNumber % SONGS.length) + SONGS.length) % SONGS.length];
}

export function isStreamPlatform(value: unknown): value is StreamPlatform {
  return value === 'spotify' || value === 'youtube' || value === 'apple';
}

/**
 * Records that the signed-in user opened today's song (the daily streaming quest).
 * Fire-and-forget: signed-out visitors get a 401, which is ignored.
 */
export function recordSongStream(platform: StreamPlatform): Promise<boolean> {
  return fetch('/api/quests/song-of-the-day', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform }),
    keepalive: true,
  })
    .then((res) => res.ok)
    .catch(() => false);
}

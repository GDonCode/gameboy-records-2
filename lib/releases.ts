// lib/releases.ts
// The two releases featured on the home page, with their videos and streaming links.

import type { ListenLink } from '@/components/ListenOn';
import { ARTIST, MEDIA_BASE, SOCIAL } from '@/lib/site';

export interface FeaturedRelease {
  title: string;
  artist: string;
  /** YouTube video id, played in the site's floating player. */
  youtubeId: string;
  /** Muted looping video shown behind the title. */
  video: string;
  /** Still image for the video while it loads. */
  poster: string;
  links: ListenLink[];
}

export const FEATURED_RELEASES: [FeaturedRelease, FeaturedRelease] = [
  {
    title: 'Rise Up Now (Guitar Version)',
    artist: ARTIST,
    youtubeId: 'etLGFz3dtsM',
    video: `${MEDIA_BASE}/Rise Up Now (Guitar Cover).mp4`,
    poster: `${MEDIA_BASE}/RISE.JPEG`,
    links: [
      { service: 'youtube' },
      { service: 'audiomack', href: SOCIAL.audiomack },
      { service: 'spotify', href: 'https://open.spotify.com/track/3tcAFyDjx0YBBJ2Y6TvVVh' },
      { service: 'apple', href: 'https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519' },
      { service: 'soundcloud', href: SOCIAL.soundcloud },
    ],
  },
  {
    title: 'Still A Rise',
    artist: ARTIST,
    youtubeId: 'BhKt3DVRRkw',
    video: `${MEDIA_BASE}/Standing.mp4`,
    poster: `${MEDIA_BASE}/IMG_8566.JPG`,
    links: [
      { service: 'youtube' },
      { service: 'audiomack', href: SOCIAL.audiomack },
      { service: 'spotify', href: 'https://open.spotify.com/track/6x4zWKWNHfCzWDDMPJaG7N' },
      { service: 'apple', href: 'https://music.apple.com/us/album/still-a-rise-single/6808531561' },
      { service: 'soundcloud', href: SOCIAL.soundcloud },
    ],
  },
];

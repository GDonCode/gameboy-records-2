// lib/site.ts
// Facts about the label used across the site: names, contact details, social and streaming links.
// Change a link here and it changes everywhere.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gameboyrecords.com').replace(/\/$/, '');

export const SITE_NAME = 'Gameboy Records';
export const ARTIST = 'Alexx A-Game';
export const FOUNDER = 'Alexx A-Game';
export const CLUB_NAME = 'Playaz Club';
export const POINTS_NAME = 'Club Points';

export const CONTACT_EMAIL = 'info@gbrecords.org';
export const INSTAGRAM_HANDLE = '@gameboyrecordsofficial';

export const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;
export const LOGO_URL = `${MEDIA_BASE}/gameboy-logo-removebg-preview.png`;

/** Default share card (app/opengraph-image.tsx), for pages that set their own Open Graph details. */
export const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'Gameboy Records — independent label of Alexx A-Game' };

export const SITE_DESCRIPTION =
  'Gameboy Records is the independent label founded by Alexx A-Game. Music, limited merchandise and live shows, released on our own terms.';

export const SOCIAL = {
  instagram: 'https://www.instagram.com/gameboyrecordsofficial/',
  tiktok: 'https://www.tiktok.com/@alexxagame',
  youtube: 'https://www.youtube.com/@LifeOfGameBoy',
  spotify: 'https://open.spotify.com/artist/3BemerMhrSFpqDcAsqkdvh',
  appleMusic: 'https://music.apple.com/us/artist/alexx-a-game/1093080428',
  audiomack: 'https://audiomack.com/alexxagame',
  soundcloud: 'https://soundcloud.com/alexxagame',
} as const;

/** Main navigation, in order. Karaoke and Trivia sit under "Vibes" on desktop. */
export const NAV = [
  { href: '/about', label: 'About' },
  { href: '/shows', label: 'Shows' },
  { href: '/shop', label: 'Shop' },
  { href: '/music', label: 'Music' },
] as const;

export const VIBES_NAV = [
  { href: '/karaoke', label: 'Karaoke' },
  { href: '/trivia', label: 'Trivia' },
] as const;

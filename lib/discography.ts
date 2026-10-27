// lib/discography.ts
// Server-only. The Discography feed: music videos from a YouTube playlist, newest first as ordered on YouTube.
//
// With YOUTUBE_API_KEY set, videos come from the playlist in DISCOGRAPHY_PLAYLIST_ID (YouTube Data API v3,
// cached for an hour), so adding a video on YouTube adds it here. Without a key, the CURATED list below is used.
// Either way, CURATED adds what YouTube doesn't know: streaming links and a karaoke link, matched by video id.

export interface Release {
  videoId: string;
  title: string;
  artist: string;
  /** ISO date the video was published, when known. */
  publishedAt: string | null;
  description: string;
  thumbnail: string;
  links: { label: 'Spotify' | 'Apple Music' | 'Audiomack' | 'SoundCloud'; href: string; icon: string }[];
  /** Set when the song is on the karaoke page. */
  karaoke: boolean;
}

export interface DiscographyPage {
  releases: Release[];
  /** Pass to the next request to keep loading; null when there's nothing more. */
  nextPageToken: string | null;
}

// The REALnTRUE playlist used by the home page's radio player. Override with DISCOGRAPHY_PLAYLIST_ID.
const DEFAULT_PLAYLIST_ID = 'PL5jjb3J99wR7DQiFdlhXnit_1bZt2a4Bo';
const PAGE_SIZE = 12;
const ARTIST = 'Alexx A-Game';

type Curated = Partial<Omit<Release, 'videoId' | 'thumbnail'>> & { videoId: string; title: string };

// Only facts already in this codebase: video ids and titles from the trivia bank, links from the home page,
// karaoke songs from app/karaoke. Add a release by appending an entry; fill in more fields as you have them.
const CURATED: Curated[] = [
  {
    videoId: 'etLGFz3dtsM',
    title: 'Rise Up Now (Guitar Version)',
    karaoke: true,
    links: [
      { label: 'Spotify', href: 'https://open.spotify.com/track/3tcAFyDjx0YBBJ2Y6TvVVh', icon: '/spotify.png' },
      { label: 'Apple Music', href: 'https://music.apple.com/us/song/rise-up-now-guitar-version/6809729519', icon: '/apple-music.png' },
    ],
  },
  { videoId: 'BhKt3DVRRkw', title: 'Still A Rise', karaoke: true },
];

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const PAGE_TOKEN_RE = /^[A-Za-z0-9_-]{1,64}$/;

export function isVideoId(value: unknown): value is string {
  return typeof value === 'string' && VIDEO_ID_RE.test(value);
}

export function isPageToken(value: unknown): value is string {
  return typeof value === 'string' && PAGE_TOKEN_RE.test(value);
}

function thumbnailFor(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function fromCurated(c: Curated): Release {
  return {
    videoId: c.videoId,
    title: c.title,
    artist: c.artist ?? ARTIST,
    publishedAt: c.publishedAt ?? null,
    description: c.description ?? '',
    thumbnail: thumbnailFor(c.videoId),
    links: c.links ?? [],
    karaoke: c.karaoke ?? false,
  };
}

interface YouTubeItem {
  snippet?: {
    title?: string;
    description?: string;
    videoOwnerChannelTitle?: string;
    thumbnails?: Record<string, { url: string; width?: number }>;
    resourceId?: { videoId?: string };
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
  status?: { privacyStatus?: string };
}

/** Maps YouTube playlist items to releases, dropping private / deleted videos and merging curated extras. */
export function toReleases(items: YouTubeItem[]): Release[] {
  const curated = new Map(CURATED.map((c) => [c.videoId, c]));
  const seen = new Set<string>();
  const out: Release[] = [];
  for (const item of items) {
    const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title?.trim();
    if (!isVideoId(videoId) || !title || seen.has(videoId)) continue;
    if (item.status?.privacyStatus === 'private' || title === 'Private video' || title === 'Deleted video') continue;
    seen.add(videoId);
    const extra = curated.get(videoId);
    const thumbs = item.snippet?.thumbnails ?? {};
    out.push({
      videoId,
      title: extra?.title ?? title,
      artist: extra?.artist ?? ARTIST,
      publishedAt: item.contentDetails?.videoPublishedAt ?? extra?.publishedAt ?? null,
      description: (item.snippet?.description ?? extra?.description ?? '').trim(),
      thumbnail: (thumbs.maxres ?? thumbs.standard ?? thumbs.high ?? thumbs.medium)?.url ?? thumbnailFor(videoId),
      links: extra?.links ?? [],
      karaoke: extra?.karaoke ?? false,
    });
  }
  return out;
}

const curatedPage = (): DiscographyPage => ({ releases: CURATED.map(fromCurated), nextPageToken: null });

export async function getDiscographyPage(pageToken?: string | null): Promise<DiscographyPage> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return pageToken ? { releases: [], nextPageToken: null } : curatedPage();

  const params = new URLSearchParams({
    part: 'snippet,contentDetails,status',
    playlistId: process.env.DISCOGRAPHY_PLAYLIST_ID || DEFAULT_PLAYLIST_ID,
    maxResults: String(PAGE_SIZE),
    key,
  });
  if (pageToken) params.set('pageToken', pageToken);

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { items?: YouTubeItem[]; nextPageToken?: string };
    return { releases: toReleases(data.items ?? []), nextPageToken: data.nextPageToken ?? null };
  } catch (err) {
    console.error('Failed to load discography from YouTube:', err);
    // The first page falls back to the built-in list so the page never shows up empty.
    return pageToken ? { releases: [], nextPageToken: null } : curatedPage();
  }
}

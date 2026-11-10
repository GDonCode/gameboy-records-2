// lib/discography.ts
// Server-only. The Discography feed: every video on the YouTube channel, newest first.
//
// With YOUTUBE_API_KEY set, videos come from the channel's uploads (YouTube Data API v3, cached for an hour),
// so uploading a video on YouTube adds it here. The channel is YOUTUBE_CHANNEL_ID when set, otherwise the
// @LifeOfGameBoy handle; set DISCOGRAPHY_PLAYLIST_ID to show a single playlist instead. Without a key, the
// CURATED list below is used. Either way, CURATED adds what YouTube doesn't know: streaming links and a
// karaoke link, matched by video id.

export interface Release {
  videoId: string;
  title: string;
  artist: string;
  /** ISO date the video was published, when known. */
  publishedAt: string | null;
  description: string;
  thumbnail: string;
  /** Length in seconds, when known. */
  duration: number | null;
  /** View count on YouTube, when known. */
  views: number | null;
  links: { label: 'Spotify' | 'Apple Music' | 'Audiomack' | 'SoundCloud'; href: string; icon: string }[];
  /** Set when the song is on the karaoke page. */
  karaoke: boolean;
}

const CHANNEL_HANDLE = 'LifeOfGameBoy';
const API = 'https://www.googleapis.com/youtube/v3';
const PAGE_SIZE = 50; // the API maximum
const MAX_PAGES = 20; // up to 1,000 videos
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

export function isVideoId(value: unknown): value is string {
  return typeof value === 'string' && VIDEO_ID_RE.test(value);
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
    duration: c.duration ?? null,
    views: c.views ?? null,
    links: c.links ?? [],
    karaoke: c.karaoke ?? false,
  };
}

interface YouTubeItem {
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: Record<string, { url: string; width?: number }>;
    resourceId?: { videoId?: string };
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
  status?: { privacyStatus?: string };
}

interface YouTubeVideo {
  id?: string;
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
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
      duration: extra?.duration ?? null,
      views: extra?.views ?? null,
      links: extra?.links ?? [],
      karaoke: extra?.karaoke ?? false,
    });
  }
  return out;
}

/** ISO 8601 duration ("PT3M57S") to seconds. */
function parseDuration(iso: string | undefined): number | null {
  const m = iso?.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const [, d, h, min, s] = m.map((v) => Number(v ?? 0));
  return ((d * 24 + h) * 60 + min) * 60 + s;
}

async function youtube<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY! });
  const res = await fetch(`${API}/${path}?${query}`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    const err = new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

async function channelId(): Promise<string> {
  if (process.env.YOUTUBE_CHANNEL_ID) return process.env.YOUTUBE_CHANNEL_ID;
  const data = await youtube<{ items?: { id?: string }[] }>('channels', { part: 'id', forHandle: CHANNEL_HANDLE });
  const id = data.items?.[0]?.id;
  if (!id) throw new Error(`No YouTube channel found for @${CHANNEL_HANDLE}`);
  return id;
}

async function playlistItems(playlistId: string): Promise<YouTubeItem[]> {
  const items: YouTubeItem[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await youtube<{ items?: YouTubeItem[]; nextPageToken?: string }>('playlistItems', {
      part: 'snippet,contentDetails,status',
      playlistId,
      maxResults: String(PAGE_SIZE),
      ...(pageToken ? { pageToken } : {}),
    });
    items.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return items;
}

/** The channel's uploads. "UULF…" is the uploads list without Shorts; fall back to every upload ("UU…"). */
async function channelUploads(): Promise<YouTubeItem[]> {
  const suffix = (await channelId()).replace(/^UC/, '');
  try {
    return await playlistItems(`UULF${suffix}`);
  } catch (err) {
    if ((err as { status?: number }).status !== 404) throw err;
    return playlistItems(`UU${suffix}`);
  }
}

/** Adds length and view counts (one request per 50 videos). */
async function withStats(releases: Release[]): Promise<Release[]> {
  const stats = new Map<string, YouTubeVideo>();
  for (let i = 0; i < releases.length; i += PAGE_SIZE) {
    const ids = releases.slice(i, i + PAGE_SIZE).map((r) => r.videoId);
    const data = await youtube<{ items?: YouTubeVideo[] }>('videos', { part: 'contentDetails,statistics', id: ids.join(','), maxResults: String(PAGE_SIZE) });
    for (const v of data.items ?? []) if (v.id) stats.set(v.id, v);
  }
  return releases.map((r) => {
    const s = stats.get(r.videoId);
    const views = s?.statistics?.viewCount;
    return {
      ...r,
      duration: parseDuration(s?.contentDetails?.duration) ?? r.duration,
      views: views !== undefined ? Number(views) : r.views,
    };
  });
}

/** Newest first; videos without a date go last. */
function newestFirst(releases: Release[]): Release[] {
  return [...releases].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export async function getDiscography(): Promise<Release[]> {
  if (!process.env.YOUTUBE_API_KEY) return CURATED.map(fromCurated);
  try {
    const playlist = process.env.DISCOGRAPHY_PLAYLIST_ID;
    const items = playlist ? await playlistItems(playlist) : await channelUploads();
    const releases = toReleases(items);
    if (releases.length === 0) return CURATED.map(fromCurated);
    try {
      return newestFirst(await withStats(releases));
    } catch (err) {
      console.error('Failed to load video stats from YouTube:', err);
      return newestFirst(releases);
    }
  } catch (err) {
    console.error('Failed to load discography from YouTube:', err);
    // Fall back to the built-in list so the page never shows up empty.
    return CURATED.map(fromCurated);
  }
}

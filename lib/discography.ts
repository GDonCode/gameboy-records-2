// lib/discography.ts
// Server-only. Alexx A-Game's discography for the Music page, oldest release first.
// Two sources are merged: official videos from his YouTube channel, and his Spotify releases
// (lib/spotify-catalog.ts), which add cover art, Spotify links and the songs that have no video.
//
// With YOUTUBE_API_KEY set, releases come from the official artist channel's uploads (cached for an hour), so a
// new release on YouTube appears here on its own. Only official releases are kept: uploads titled
// "Alexx A-Game - Song (…)" or "Alexx A-Game ft Guest - Song (…)". Shorts, vlogs and interviews are left out,
// and when a song has several uploads (audio, lyric video, official video) the best one is used.
// EXTRA adds releases that live on other channels; FALLBACK is used when YouTube can't be reached.

export interface Release {
  /** Stable key: the YouTube video id, or `spotify:<track id>` for songs only on Spotify. */
  id: string;
  /** YouTube video id, when the song has an official video. */
  videoId: string | null;
  /** Spotify track id, when the song is on Spotify. */
  spotifyTrackId: string | null;
  appleUrl: string | null;
  /** Square artwork: the Spotify cover when there is one, otherwise the video thumbnail. */
  cover: string;
  /** Credit line under the title, e.g. "Alexx A-Game feat. Tory Lanez". */
  credit: string;
  label: string | null;
  /** Song title, without the artist name or upload format. */
  title: string;
  /** Featured artists, e.g. "Tory Lanez". */
  featuring: string | null;
  /** What the video is: Official Video, Lyric Video, Audio, Visualizer… */
  format: string | null;
  /** Riddim or project the song belongs to, when the upload names one. */
  project: string | null;
  artist: string;
  /** ISO date the video was published. */
  publishedAt: string;
  year: number;
  thumbnail: string;
  /** Length in seconds, when known. */
  duration: number | null;
}

import { SPOTIFY_RELEASES } from '@/lib/spotify-catalog';

const ARTIST = 'Alexx A-Game';
const ARTIST_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UC2M7qSo99KTIq-WgnCNq50Q';
const API = 'https://www.googleapis.com/youtube/v3';

// Better formats win when one song has several uploads.
const FORMAT_RANK = ['official music video', 'official video', 'visualizer', 'lyric video', 'lyrics', 'official audio', 'audio'];

const RELEASE_RE = /^alexx a-game\s*(?:(?:ft\.?|feat\.?)\s+(.+?))?\s+[-–]\s+(.+)$/i;

type Raw = { videoId: string; title: string; publishedAt: string; thumbnail?: string; duration?: number | null };

const EXTRA: Raw[] = [
  // Released through the auto-generated "Alexx A-Game - Topic" channel.
  { videoId: 'etLGFz3dtsM', title: 'Alexx A-Game - Rise Up Now (Guitar Version)', publishedAt: '2026-09-10T00:00:00Z' },
];

// Used only when YouTube can't be reached: the artist channel's releases as of November 2026.
const FALLBACK: Raw[] = [
  { videoId: '9hOgCiLvQ2I', title: 'ALEXX A-GAME - A-Game Everyday (Official Music Video)', publishedAt: '2014-06-18T00:00:00Z' },
  { videoId: '79zSJcavUJc', title: 'ALEXX A-GAME - "ElectroLive"', publishedAt: '2015-11-18T00:00:00Z' },
  { videoId: 'cpUcw_pa-d0', title: 'ALEXX A-GAME - RISE UP NOW (Official Audio)', publishedAt: '2016-01-28T00:00:00Z' },
  { videoId: 'eKVQXwb4ZZw', title: 'Alexx A-Game - Only Time Will Tell - Cloud 10 Riddim (Audio)', publishedAt: '2016-07-18T00:00:00Z' },
  { videoId: 'hCt8r3rPXts', title: 'Alexx A-Game - Go Harda (Official Video)', publishedAt: '2018-09-24T00:00:00Z' },
  { videoId: '0QaJ2_EjAhc', title: 'Alexx A-Game ft Tory Lanez - Double (Official Video)', publishedAt: '2018-09-15T00:00:00Z' },
  { videoId: 'V5lJ2sYxNNk', title: 'Alexx A-Game ft Ding Dong - CHUCK IT (Lyric Video)', publishedAt: '2019-01-29T00:00:00Z' },
  { videoId: 'c862P6qjweM', title: 'Alexx A-Game - Real To Di Link (Audio) - [Lonely Road Riddim 2019]', publishedAt: '2019-02-14T00:00:00Z' },
  { videoId: 'i1VYBPdMuRY', title: 'Alexx A-Game - Life Of a G (Lyric Video)', publishedAt: '2020-09-11T00:00:00Z' },
  { videoId: 'qXCmOB-98ao', title: 'Alexx A-Game - My Typa Badness (Official Audio)', publishedAt: '2020-12-11T00:00:00Z' },
  { videoId: 'HgpiViCedv0', title: 'Alexx A-Game - Hurt Inside (Official Music Video)', publishedAt: '2023-02-10T00:00:00Z' },
  { videoId: 'FU_EvhVGcfI', title: 'Alexx A-Game - More Life (Visualizer)', publishedAt: '2024-01-19T00:00:00Z' },
  { videoId: 'BhKt3DVRRkw', title: 'Alexx A-Game - Still A Rise (Lyrics)', publishedAt: '2026-09-25T00:00:00Z' },
];

const SMALL_WORDS = new Set(['a', 'an', 'and', 'of', 'the', 'to', 'in', 'on', 'di']);

/** "RISE UP NOW" → "Rise Up Now"; leaves mixed-case titles as written. */
function tidyCase(text: string): string {
  if (text !== text.toUpperCase()) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.replace(/^(["“(]?)(\p{L})/u, (_, p, c) => p + c.toUpperCase())))
    .join(' ')
    .replace(/A-game/g, 'A-Game');
}

/** Splits an upload title into song, featured artists, format and project. Returns null for non-releases. */
export function parseReleaseTitle(raw: string): Pick<Release, 'title' | 'featuring' | 'format' | 'project'> | null {
  const m = raw.trim().match(RELEASE_RE);
  if (!m) return null;
  const featuring = m[1] ? tidyCase(m[1].trim()) : null;
  let rest = m[2].trim();

  // "[Lonely Road Riddim 2019]" or " - Cloud 10 Riddim"
  let project: string | null = null;
  const bracket = rest.match(/\s*\[([^\]]+)\]\s*$/);
  if (bracket) {
    project = bracket[1].trim();
    rest = rest.slice(0, bracket.index).trim().replace(/\s*[-–]\s*$/, '');
  }
  // Formats in parentheses: "(Official Video)", "(Guitar Version)" stays part of the title.
  let format: string | null = null;
  rest = rest.replace(/\s*\(([^)]+)\)/g, (whole, inner: string) => {
    const lower = inner.toLowerCase();
    if (FORMAT_RANK.includes(lower) || /^(official|lyric|audio|visuali[sz]er)/.test(lower)) {
      format = format ?? tidyCase(inner.trim()).replace(/^Lyrics$/, 'Lyric Video');
      return '';
    }
    return whole;
  });
  const dash = rest.match(/^(.+?)\s+[-–]\s+(.+)$/);
  if (dash && /riddim|mixtape|ep\b|album/i.test(dash[2])) {
    project = project ?? dash[2].trim();
    rest = dash[1];
  }
  const title = tidyCase(rest.replace(/^["“]|["”]$/g, '').trim());
  if (!title) return null;
  return { title, featuring, format, project };
}

function rank(format: string | null) {
  const i = FORMAT_RANK.indexOf((format ?? '').toLowerCase());
  return i === -1 ? FORMAT_RANK.length : i;
}

function toReleases(raws: Raw[]): Release[] {
  const bySong = new Map<string, Release>();
  for (const r of raws) {
    const parsed = parseReleaseTitle(r.title);
    if (!parsed) continue;
    const release: Release = {
      id: r.videoId,
      videoId: r.videoId,
      spotifyTrackId: null,
      appleUrl: null,
      cover: r.thumbnail ?? `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`,
      credit: parsed.featuring ? `${ARTIST} feat. ${parsed.featuring}` : ARTIST,
      label: null,
      ...parsed,
      artist: ARTIST,
      publishedAt: r.publishedAt,
      year: new Date(r.publishedAt).getUTCFullYear(),
      thumbnail: r.thumbnail ?? `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`,
      duration: r.duration ?? null,
    };
    const key = parsed.title.toLowerCase();
    const existing = bySong.get(key);
    if (!existing) {
      bySong.set(key, release);
    } else if (rank(release.format) < rank(existing.format)) {
      // Keep the earliest date (the song's release), with the best video.
      bySong.set(key, { ...release, publishedAt: existing.publishedAt < release.publishedAt ? existing.publishedAt : release.publishedAt, year: Math.min(existing.year, release.year) });
    } else if (release.publishedAt < existing.publishedAt) {
      bySong.set(key, { ...existing, publishedAt: release.publishedAt, year: release.year });
    }
  }
  return [...bySong.values()].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
}

async function youtube<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY! });
  const res = await fetch(`${API}/${path}?${query}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}

interface PlaylistItem {
  snippet?: { title?: string; thumbnails?: Record<string, { url: string }> };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
}

async function channelUploads(): Promise<Raw[]> {
  const out: Raw[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 10; page++) {
    const data = await youtube<{ items?: PlaylistItem[]; nextPageToken?: string }>('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: `UU${ARTIST_CHANNEL_ID.replace(/^UC/, '')}`,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of data.items ?? []) {
      const videoId = item.contentDetails?.videoId;
      const title = item.snippet?.title;
      const publishedAt = item.contentDetails?.videoPublishedAt;
      if (!videoId || !title || !publishedAt) continue;
      const t = item.snippet?.thumbnails ?? {};
      out.push({ videoId, title, publishedAt, thumbnail: (t.maxres ?? t.standard ?? t.high)?.url });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
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

async function withDurations(releases: Release[]): Promise<Release[]> {
  const ids = releases.map((r) => r.videoId).slice(0, 50).join(',');
  const data = await youtube<{ items?: { id: string; contentDetails?: { duration?: string } }[] }>('videos', { part: 'contentDetails', id: ids });
  const map = new Map((data.items ?? []).map((v) => [v.id, parseDuration(v.contentDetails?.duration)]));
  return releases.map((r) => ({ ...r, duration: (r.videoId ? map.get(r.videoId) : null) ?? r.duration }));
}

const titleKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Adds Spotify artwork and links to the video releases, and the songs that are only on Spotify. */
function withSpotify(releases: Release[]): Release[] {
  const byTitle = new Map(SPOTIFY_RELEASES.map((s) => [titleKey(s.title), s]));
  const matched = new Set<string>();
  const merged = releases.map((r) => {
    const s = byTitle.get(titleKey(r.title));
    if (!s) return r;
    matched.add(s.trackId);
    // The song came out on whichever platform had it first.
    const publishedAt = `${s.releasedAt}T00:00:00Z` < r.publishedAt ? `${s.releasedAt}T00:00:00Z` : r.publishedAt;
    return {
      ...r,
      spotifyTrackId: s.trackId,
      appleUrl: s.appleUrl ?? null,
      cover: s.cover,
      credit: s.credit ?? r.credit,
      project: r.project ?? s.project,
      label: s.label,
      publishedAt,
      year: new Date(publishedAt).getUTCFullYear(),
    };
  });
  const spotifyOnly: Release[] = SPOTIFY_RELEASES.filter((s) => !matched.has(s.trackId)).map((s) => ({
    id: `spotify:${s.trackId}`,
    videoId: null,
    spotifyTrackId: s.trackId,
    appleUrl: s.appleUrl ?? null,
    cover: s.cover,
    credit: s.credit ?? ARTIST,
    label: s.label,
    title: s.title,
    featuring: null,
    format: null,
    project: s.project,
    artist: ARTIST,
    publishedAt: `${s.releasedAt}T00:00:00Z`,
    year: Number(s.releasedAt.slice(0, 4)),
    thumbnail: s.cover,
    duration: null,
  }));
  return [...merged, ...spotifyOnly].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
}

async function videoReleases(): Promise<Release[]> {
  if (!process.env.YOUTUBE_API_KEY) return toReleases([...FALLBACK, ...EXTRA]);
  try {
    const releases = toReleases([...(await channelUploads()), ...EXTRA]);
    if (releases.length === 0) return toReleases([...FALLBACK, ...EXTRA]);
    return await withDurations(releases).catch(() => releases);
  } catch (err) {
    console.error('Failed to load the discography from YouTube:', err);
    return toReleases([...FALLBACK, ...EXTRA]);
  }
}

/** Every release, oldest first: official videos plus Spotify-only songs. Never empty. */
export async function getDiscography(): Promise<Release[]> {
  return withSpotify(await videoReleases());
}

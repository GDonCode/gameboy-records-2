'use client';


import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import styles from './artists.module.css';
import GameIconsBackground from '@/components/GameIconsBackground';
import { supabasePublic } from '@/lib/supabase-public';


const YT_KEY = 'AIzaSyDR2m0XOZEhBIYmPb_38BP-rcnSf9mIuFQ';
const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

interface NewsItem {
  date: string;
  title: string;
  teaser: string;
  tag: string;
}

interface ArtistRecord {
  id: string;
  name: string;
  role: string;
  portraitSrc: string | null;
  channelId: string | null;
  news: NewsItem[];
}

interface Video {
  videoId: string;
  title: string;
  thumb: string;
}

const ARTISTS: ArtistRecord[] = [
  {
    id: 'a-game',
    name: 'Alexx A-Game',
    role: 'GAMEBOY RECORDS · ARTIST',
    portraitSrc: `${MEDIA_BASE}/agame-portrait.jpg`,
    channelId: 'UC2M7qSo99KTIq-WgnCNq50Q',
    news: [
      {
        date: '03 JUN 2025',
        title: 'New single "Frequency" out now on all platforms',
        teaser: 'A slow-burn anthem built on a two-step groove and layered vocal chops — biggest debut week yet.',
        tag: 'RELEASE',
      },
      {
        date: '22 MAY 2025',
        title: 'Sold-out headline set at Dub Club Kingston',
        teaser: 'Packed room, an extended set, and an unplanned collab with label mate NOVA mid-show.',
        tag: 'LIVE',
      },
      {
        date: '08 MAY 2025',
        title: 'Featured on Gameboy Records Spring Compilation',
        teaser: "Two tracks on the label's latest 12-track release — streaming everywhere now.",
        tag: 'LABEL',
      },
      {
        date: '14 APR 2025',
        title: 'Studio diary: recording "Frequency" in one take',
        teaser: 'Behind-the-scenes on the session — from scratch to final mix in under six hours.',
        tag: 'STUDIO',
      },
      {
        date: '01 APR 2025',
        title: 'Summer tour dates announced — Kingston · London · Toronto',
        teaser: 'Four headline shows across three cities this July. Tickets on sale now.',
        tag: 'TOUR',
      },
    ],
  },
  {
    id: 'placeholder-2',
    name: 'ARTIST TWO',
    role: 'GAMEBOY RECORDS · ARTIST',
    portraitSrc: null,
    channelId: null,
    news: [
      {
        date: '— — —',
        title: 'News coming soon',
        teaser: 'This is a placeholder profile — swap in real news and release data when ready.',
        tag: 'PLACEHOLDER',
      },
    ],
  },
  {
    id: 'placeholder-3',
    name: 'ARTIST THREE',
    role: 'GAMEBOY RECORDS · ARTIST',
    portraitSrc: null,
    channelId: null,
    news: [
      {
        date: '— — —',
        title: 'News coming soon',
        teaser: 'This is a placeholder profile — swap in real news and release data when ready.',
        tag: 'PLACEHOLDER',
      },
    ],
  },
];

function parseDuration(iso: string) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0');
}

type Direction = 'next' | 'prev';

function PortraitCardContent({ artist }: { artist: ArtistRecord }) {
  return (
    <>
      {artist.portraitSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artist.portraitSrc} alt={artist.name} />
      ) : (
        <div className={styles.portraitPlaceholder}>NO PHOTO</div>
      )}

      <div className={styles['portrait-footer']}>
        <p className={styles['artist-name']}>{artist.name}</p>
        <span className={styles['artist-role']}>{artist.role}</span>
        <div className={styles['social-divider']} />
        <div className={styles['social-row']}>

          <a href="#" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
            </svg>
            <span className={styles.tt}>Twitter</span>
          </a>

          <a href="#" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
            </svg>
            <span className={styles.tt}>Instagram</span>
          </a>

          <a href="#" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
            </svg>
            <span className={styles.tt}>Facebook</span>
          </a>

          <a href="#" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
            </svg>
            <span className={styles.tt}>LinkedIn</span>
          </a>

        </div>
      </div>
    </>
  );
}

interface OutgoingContentSnapshot {
  artist: ArtistRecord;
  news: NewsItem[];
  videos: Video[];
  activeVideoId: string | null;
  videoError: string | null;
}

interface ContentPanelsProps {
  artist: ArtistRecord;
  news: NewsItem[];
  videos: Video[];
  activeVideoId: string | null;
  videoError: string | null;
  onSelectVideo: (id: string) => void;
}

function ContentPanels({ artist, news, videos, activeVideoId, videoError, onSelectVideo }: ContentPanelsProps) {
  return (
    <>
      <section className={`${styles.panel} ${styles['panel-news']}`}>
        <div className={styles['sec-lbl']}>FEED</div>
        <div className={styles['news-feed']}>
          {news.map((item) => (
            <div className={styles['news-item']} key={item.title}>
              <span className={styles['news-date']}>{item.date}</span>
              <div>
                <div className={styles['news-title']}>{item.title}</div>
                <div className={styles['news-teaser']}>{item.teaser}</div>
                <span className={styles['news-tag']}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles['panel-vids']}`}>
        <div className={styles['sec-lbl']}>RECENT RELEASES</div>

        {videoError ? (
          <div className={styles['vid-msg']}>⚠ {videoError}</div>
        ) : (
          <div className={styles['vid-strip']}>
            {videos.slice(0, 3).map((v) => (
              <div
                key={v.videoId}
                className={`${styles['vid-thumb']} ${v.videoId === activeVideoId ? styles.active : ''}`}
                onClick={() => onSelectVideo(v.videoId)}
              >
                {v.videoId === activeVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumb} alt="" loading="lazy" />
                )}
                <div className={styles['vid-thumb-ttl']}>{v.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function ArtistsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>('next');
  const [outgoingArtist, setOutgoingArtist] = useState<ArtistRecord | null>(null);
  const [outgoingContent, setOutgoingContent] = useState<OutgoingContentSnapshot | null>(null);

  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  const isAnimatingRef = useRef(false);
  const wheelCooldownRef = useRef(false);
  const activeIndexRef = useRef(0);
  const videosRef = useRef<Video[]>([]);
  const activeVideoIdRef = useRef<string | null>(null);
  const videoErrorRef = useRef<string | null>(null);
  const newsRef = useRef<NewsItem[]>([]);

  const activeArtist = ARTISTS[activeIndex];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    newsRef.current = news;
  }, [news]);

  useEffect(() => {
    activeVideoIdRef.current = activeVideoId;
  }, [activeVideoId]);

  useEffect(() => {
    videoErrorRef.current = videoError;
  }, [videoError]);

  const goTo = useCallback((dir: Direction) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const prevArtist = ARTISTS[activeIndexRef.current];
    setOutgoingArtist(prevArtist);
    setOutgoingContent({
      artist: prevArtist,
      news: newsRef.current,
      videos: videosRef.current,
      activeVideoId: activeVideoIdRef.current,
      videoError: videoErrorRef.current,
    });
    setDirection(dir);
    setActiveIndex((prev) => {
      const len = ARTISTS.length;
      return dir === 'next' ? (prev + 1) % len : (prev - 1 + len) % len;
    });
    window.setTimeout(() => {
      setOutgoingArtist(null);
      setOutgoingContent(null);
      isAnimatingRef.current = false;
    }, 420);
  }, []);

  function handleWheel(e: React.WheelEvent) {
    if (wheelCooldownRef.current) return;
    if (Math.abs(e.deltaY) < 24) return;
    wheelCooldownRef.current = true;
    goTo(e.deltaY > 0 ? 'next' : 'prev');
    window.setTimeout(() => { wheelCooldownRef.current = false; }, 500);
  }

  useEffect(() => {
    let cancelled = false;
    setVideos([]);
    setActiveVideoId(null);
    setVideoError(null);

    const channelId = activeArtist.channelId;
    if (!channelId) {
      setVideoError('NO SIGNAL');
      return;
    }

    async function initVideos() {
      try {
        const plId = 'UU' + channelId!.slice(2);

        const plRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?key=${YT_KEY}&playlistId=${plId}&part=snippet&maxResults=20`
        );
        const plData = await plRes.json();
        if (plData.error) throw new Error(plData.error.message);

        const candidates = (plData.items || [])
          .map((it: any) => ({
            videoId: it.snippet?.resourceId?.videoId,
            title: it.snippet?.title || '',
          }))
          .filter((v: any) => v.videoId && v.title !== 'Deleted video' && v.title !== 'Private video');

        if (!candidates.length) throw new Error('NO SIGNAL');

        const ids = candidates.map((v: any) => v.videoId).join(',');
        const vRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?key=${YT_KEY}&id=${ids}&part=contentDetails,status,snippet`
        );
        const vData = await vRes.json();
        if (vData.error) throw new Error(vData.error.message);

        const map: Record<string, any> = {};
        (vData.items || []).forEach((it: any) => { map[it.id] = it; });

        const filtered: Video[] = candidates
          .filter((v: any) => {
            const item = map[v.videoId];
            return item
              && item.status?.privacyStatus === 'public'
              && item.status?.embeddable
              && parseDuration(item.contentDetails?.duration || 'PT0S') > 60;
          })
          .map((v: any) => ({
            ...v,
            thumb: map[v.videoId]?.snippet?.thumbnails?.medium?.url
              || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
          }));

        if (!filtered.length) throw new Error('NO SIGNAL');
        if (cancelled) return;

        setVideos(filtered);
        setActiveVideoId(filtered[0].videoId);
      } catch (e: any) {
        if (!cancelled) setVideoError(e.message);
      }
    }

    initVideos();
    return () => { cancelled = true; };
  }, [activeArtist.channelId]);

  useEffect(() => {
    let cancelled = false;
    setNews(activeArtist.news); // fallback for placeholder artists with no published posts

    async function loadNews() {
      const { data, error } = await supabasePublic
        .from('posts')
        .select('title, teaser, tag, published_at, artists ( name )')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error || cancelled) return;

      const matched = (data || [])
        .filter((p: any) => p.artists?.name === activeArtist.name)
        .map((p: any) => ({
          date: new Date(p.published_at)
            .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            .toUpperCase(),
          title: p.title,
          teaser: p.teaser,
          tag: p.tag,
        }));

      if (!cancelled && matched.length > 0) {
        setNews(matched);
      }
    }

    loadNews();
    return () => { cancelled = true; };
  }, [activeArtist.name]);

  return (
    <div className={styles.page}>
      <Header />
      <MobileBottomNav />
      <main className={styles.main}>
        <GameIconsBackground />
        <div className={styles.artistStage}>
        {/* LEFT · PORTRAIT + ARROWS */}
          <div className={styles.portraitCol} onWheel={handleWheel}>
            <div className={styles.portraitSlider}>
              {outgoingArtist && (
                <div
                  className={`${styles.portraitPanel} ${direction === 'next' ? styles.slideOutUp : styles.slideOutDown}`}
                >
                  <PortraitCardContent artist={outgoingArtist} />
                </div>
              )}

              <div
                className={`${styles.portraitPanel} ${direction === 'next' ? styles.slideInFromBelow : styles.slideInFromAbove}`}
              >
                <PortraitCardContent artist={activeArtist} />
              </div>
            </div>
          </div>

          {/* RIGHT · NEWS + RECENT RELEASES */}
          <div className={styles.contentCol}>
            <div className={styles.contentSlider}>
              {outgoingContent && (
                <div
                  className={`${styles.contentPanelWrap} ${direction === 'next' ? styles.slideOutUp : styles.slideOutDown}`}
                >
                  <ContentPanels
                    artist={outgoingContent.artist}
                    news={outgoingContent.news}
                    videos={outgoingContent.videos}
                    activeVideoId={outgoingContent.activeVideoId}
                    videoError={outgoingContent.videoError}
                    onSelectVideo={() => {}}
                  />
                </div>
              )}

              <div
                className={`${styles.contentPanelWrap} ${direction === 'next' ? styles.slideInFromBelow : styles.slideInFromAbove}`}
              >
                <ContentPanels
                  artist={activeArtist}
                  news={news}
                  videos={videos}
                  activeVideoId={activeVideoId}
                  videoError={videoError}
                  onSelectVideo={setActiveVideoId}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
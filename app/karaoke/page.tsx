'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import GameIconsBackground from '@/components/GameIconsBackground';
import MobileBottomNav from '@/components/MobileBottomNav';
import styles from './karaoke.module.css';

interface LyricLine {
  time: number; // seconds — when this line becomes active
  text: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  photoSrc: string | null; // null → generic note icon
  lyrics: LyricLine[];
}

const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

// ── SONGS ── artist fills in real lyrics/timestamps per track ─────
const SONGS: Song[] = [
  {
    id: 'more-life',
    title: 'More Life',
    artist: 'Alexx A-Game',
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('Alexx-A-Game-More Life-(Instrumental).mp3')}`,
    photoSrc: `${MEDIA_BASE}/agame-portrait.jpg`,
    lyrics: [
      { time: 0, text: '♪ Instrumental intro ♪' },
      { time: 9.5, text: 'Cyah link no more' },
      { time: 12, text: 'Cyah drink no more' },
      { time: 14.75, text: 'Cyah link no more' },
      { time: 17, text: 'Woahh' },
      { time: 19, text: 'Champagne fi mi real friends' },
      { time: 21.5, text: 'Real pain fi mi sham friends' },
      {time: 24, text: 'Mek a toast to di one dem'},
      {time: 26.5, text: 'Weh a roll like a tandem'},
      {time: 28.5, text: 'One time fi di Goddess and e God dem'},
      {time: 31.75, text: 'Mi nuh wah see nuh problem'},
      {time: 34, text: 'Stay close to mi fam dem'},
      {time: 36.5, text: 'Cah tomorrow nuh promised, Noo'},
      {time: 40, text: 'Tek a shot fi di one dem weh gaan and nuh de yah no more'},
      {time: 45, text: 'Another shot fi di one dem weh deh yah weh real to di core'},
      {time: 50, text: 'Celebrate wid yuh friends and yuh family cause you neva know'},
      {time: 55, text: 'When we cyah link no more'},
      {time: 57.5, text: 'And we cyah drink no more'},
      {time: 60.5, text: 'We goin up!'},
      {time: 61.75, text: 'We goin in!'},
      {time: 63.25, text: 'Fi di one dem weh real to di link'},
      {time: 65.5, text: 'We ago dance!'},
      {time: 67, text: 'We ago drink!'},
      {time: 68.25, text: 'Nuh regrets, celebrate everyting!'},
      {time: 71, text: 'Every choice, every loss, every win!'},
      {time: 73.25, text: 'We nuh give up, no we nah go give in!'},
      {time: 75.75, text: 'To be alive doesn\'t mean you living!'},
      {time: 78, text: 'So everyday we get up, we a live'},
      {time: 80.25, text: 'We a live, We a live'},
      {time: 81.5, text: 'More Life'},
      {time: 82.75, text: 'More Life'},
      {time: 84, text: 'Moreee Lifeee'},
      {time: 87.5, text: 'More Life'},
      {time: 88, text: 'More Life'},
      {time: 89, text: 'Moreee Lifeee'},
      {time: 92, text: 'More Life'},
      {time: 93, text: 'More Life'},
      {time: 94.5, text: 'Moreee Lifeee'},
      {time: 96, text: 'To be alive doesn\'t mean you living!'},
      {time: 98.75, text: 'So everyday we get up, we a live'},
      {time: 100.75, text: 'We a live, We a live'},
      {time: 102, text: 'More Life'},
      {time: 103.25, text: 'More While '},
      {time: 104.5, text: 'Nutn don\'t right, but we haffi hold tight'},
      {time: 107, text: 'No lies, No pride'},
      {time: 109, text: 'When we down an a struggle cause we know we gon\' rise'},
      {time: 112, text: 'Couple real ones stand up wid me both sides'},
      {time: 114.5, text: 'Fake ones, we cut off those ties'},
      {time: 117, text: 'Grab a glass, pour sumn, no ice'},
      {time: 119.5, text: 'Now put it up inna e sky'},
      {time: 121.5, text: 'Tek a shot fi di one dem weh gaan and nuh de yah no more'},
      {time: 126.5, text: 'Another shot fi di one dem weh deh yah weh real to di core'},
      {time: 132, text: 'Celebrate wid yuh friends and yuh family cause you neva know'},
      {time: 136.5, text: 'When we cyah link no more'},
      {time: 139.5, text: 'And we cyah drink no more'},
      {time: 142, text: 'We goin up!'},
      {time: 143, text: 'We goin in!'},
      {time: 145, text: 'Fi di one dem weh real to di link'},
      {time: 147, text: 'We ago dance!'},
      {time: 148.5, text: 'We ago drink!'},
      {time: 150, text: 'Nuh regrets, celebrate everyting!'},
      {time: 152.5, text: 'Every choice, every loss, every win!'},
      {time: 154.75, text: 'We nuh give up, no we nah go give in!'},
      {time: 157.5, text: 'To be alive doesn\'t mean you living!'},
      {time: 160, text: 'So everyday we get up, we a live'},
      {time: 162.5, text: 'We goin up!'},
      {time: 164, text: 'We goin in!'},
      {time: 165.25, text: 'Fi di one dem weh real to di link'},
      {time: 168, text: 'We ago dance!'},
      {time: 169.25, text: 'We ago drink!'},
      {time: 170.5, text: 'Nuh regrets, celebrate everyting!'},
      {time: 173, text: 'Every choice, every loss, every win!'},
      {time: 175.25, text: 'We nuh give up, no we nah go give in!'},
      {time: 178, text: 'To be alive doesn\'t mean you living!'},
      {time: 180.5, text: 'So everyday we get up, we a live'},
      {time: 182.25, text: 'We a live, We a live'},
      {time: 183.75, text: 'More Life'},
      {time: 184.75, text: 'More Life'},
      {time: 186, text: 'Moreee Lifeee'},
      {time: 189, text: 'More Life'},
      {time: 190, text: 'More Life'},
      {time: 191.25, text: 'Moreee Lifeee'},
      {time: 193.5, text: 'More Life'},
      {time: 194.75, text: 'More Life'},
      {time: 196.25, text: 'Moreee Lifeee'},
      {time: 198.5, text: 'To be alive doesn\'t mean you living!'},
      {time: 200.75, text: 'So everyday we get up, we a live'},
      {time: 203.25, text: 'Champagne fi mi real friends' },
      {time: 205.5, text: 'Real pain fi mi sham friends' },
      {time: 208, text: 'Mek a toast to di one dem'},
      {time: 210.5, text: 'Weh a roll like a tandem'},
      {time: 212.25, text: 'One time fi di Goddess and e God dem'},
      {time: 215.25, text: 'Mi nuh wah see nuh problem'},
      {time: 218, text: 'Stay close to mi fam dem'},
      {time: 220.5, text: 'Cah tomorrow nuh promised, Noo'},
    ],
  },
  {
    id: 'placeholder-2',
    title: 'TRACK TWO',
    artist: 'ARTIST TWO',
    audioSrc: '/placeholder-track-2.mp3',
    photoSrc: null,
    lyrics: [
      { time: 0, text: '♪ Instrumental intro ♪' },
      { time: 8, text: 'Placeholder lyric line one' },
      { time: 14, text: 'Placeholder lyric line two' },
    ],
  },
  {
    id: 'placeholder-3',
    title: 'TRACK THREE',
    artist: 'ARTIST THREE',
    audioSrc: '/placeholder-track-3.mp3',
    photoSrc: null,
    lyrics: [
      { time: 0, text: '♪ Instrumental intro ♪' },
      { time: 8, text: 'Placeholder lyric line one' },
      { time: 14, text: 'Placeholder lyric line two' },
    ],
  },
];

type Direction = 'next' | 'prev';

export default function KaraokePage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  const activeSong = SONGS[activeSongIndex];

  // Reset playback state whenever the song changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveIndex(-1);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.load();
    }
  }, [activeSongIndex]);

  // Determine which lyric line is active based on currentTime
  useEffect(() => {
    let idx = -1;
    for (let i = 0; i < activeSong.lyrics.length; i++) {
      if (currentTime >= activeSong.lyrics[i].time) idx = i;
      else break;
    }
    setActiveIndex(idx);
  }, [currentTime, activeSong]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeIndex >= 0) {
      lineRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  }

  function goToSong(dir: Direction) {
    setActiveSongIndex((prev) => {
      const len = SONGS.length;
      return dir === 'next' ? (prev + 1) % len : (prev - 1 + len) % len;
    });
  }

  function formatTime(t: number) {
    if (!Number.isFinite(t)) return '0.0s';
    // TEMP: raw seconds display for lyric-sync work.
    // Revert to mm:ss once timestamps are finalized:
    // const m = Math.floor(t / 60);
    // const s = Math.floor(t % 60).toString().padStart(2, '0');
    // return `${m}:${s}`;
    return `${t.toFixed(1)}s`;
  }

  return (
    <div className={styles.page}>
      <Header />
      <MobileBottomNav />

      <main className={styles.main}>
        <GameIconsBackground />

        {/* ── SONG PICKER BAR ───────────────────────────────────── */}
        <div className={styles.pickerBar}>
          <button
            type="button"
            className={styles.navArrowSm}
            aria-label="Previous song"
            onClick={() => goToSong('prev')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path fill="#3dc97e" d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM441 335C450.4 344.4 450.4 359.6 441 368.9C431.6 378.2 416.4 378.3 407.1 368.9L320.1 281.9L233.1 368.9C223.7 378.3 208.5 378.3 199.2 368.9C189.9 359.5 189.8 344.3 199.2 335L303 231C312.4 221.6 327.6 221.6 336.9 231L441 335z"/>
            </svg>
          </button>

          <div className={styles.pickerPhoto}>
            {activeSong.photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeSong.photoSrc} alt={activeSong.artist} />
            ) : (
              <div className={styles.notePlaceholder}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="22" height="22" fill="currentColor">
                  <path d="M73 39c-14.8-7.4-32.5-6.6-46.5 2.1S4 65.2 4 82V430c0 26.5 21.5 48 48 48s48-21.5 48-48V82c0-16.8-8.7-32.4-23-41zM256 0c-44.2 0-80 35.8-80 80V432c0 44.2 35.8 80 80 80s80-35.8 80-80V80c0-44.2-35.8-80-80-80z" opacity=".25" />
                  <path d="M384 168c0-22.1-17.9-40-40-40h-48c-22.1 0-40 17.9-40 40v176c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V168z" />
                </svg>
              </div>
            )}
          </div>

          <div className={styles.pickerMeta}>
            <span className={styles.pickerEyebrow}>KARAOKE MODE</span>
            <p className={styles.pickerTitle}>{activeSong.title}</p>
            <p className={styles.pickerArtist}>{activeSong.artist}</p>
          </div>

          <div className={styles.pickerPlayback}>
            <button
              className={styles.playBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              type="range"
              className={styles.seekBar}
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
            />
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>

          <button
            type="button"
            className={styles.navArrowSm}
            aria-label="Next song"
            onClick={() => goToSong('next')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path fill="#3dc97e" d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM199 305C189.6 295.6 189.6 280.4 199 271.1C208.4 261.8 223.6 261.7 232.9 271.1L319.9 358.1L406.9 271.1C416.3 261.7 431.5 261.7 440.8 271.1C450.1 280.5 450.2 295.7 440.8 305L337 409C327.6 418.4 312.4 418.4 303.1 409L199 305z"/>
            </svg>
          </button>
        </div>

        {/* ── LYRICS ── directly on page background, no container ── */}
        <div className={styles.lyricsArea}>
          {activeSong.lyrics.map((line, i) => (
            <div
              key={i}
              ref={(el) => { lineRefs.current[i] = el; }}
              className={`${styles.lyricLine} ${i === activeIndex ? styles.activeLine : ''}`}
            >
              {line.text}
            </div>
          ))}
        </div>

        <audio
          ref={audioRef}
          src={activeSong.audioSrc}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />
      </main>
    </div>
  );
}
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
    id: 'still-a-rise',
    title: 'Still A Rise',
    artist: 'Alexx A-Game',
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('Alexx A-Game - Still A Rise (tv).mp3')}`,
    photoSrc: `${MEDIA_BASE}/IMG_8566.JPG`,
    lyrics: [
      { time: 0, text: 'Hmmmmmm' },
      { time: 2.5, text: 'Neva switch up' },
      { time: 4, text: 'Through worse or better' },
      { time: 7.5, text: 'Game' },
      { time: 10.5, text: 'Eva since man get a raise a income' },
      { time: 13, text: 'In come some' },
      { time: 14.5, text: 'Fake friends pon e ends, Dem a pretend like seh dem real' },
      { time: 17, text: 'Is like dem have a faker, syndrome' },
      { time: 20, text: 'When dem come wid dem chaser and dem rum, we nuh drink none' },
      { time: 23.75, text: 'Mi nuh nyam weh dem cook, mi nuh bun' },
      {time: 25.9, text: 'None a the herbs, weh dem' },
      {time: 28, text: 'Bring come' },
      {time: 29.5, text: 'Hmmmm' },
      {time: 30.75, text: 'Move like dem genuine' },
      {time: 32.5, text: 'But dem nuh really real' },
      {time: 34, text: 'Yuh think a joke, alright dawg watchya pree di deal' },
      {time: 36.5, text: 'When me a face my hungry day, Dem nuh know how mi did feel' },
      {time: 39.25, text: 'Now the table turn, mi mek a food dem wah fi eat mi meal' },
      {time: 42, text: 'But a hard mi work fi mine' },
      {time: 44, text: 'Nuh man mi nuh work fi mind' },
      {time: 46.5, text: 'Dem wah dish mi dirt fi mine' },
      {time: 49, text: 'Mi bun dem and dem dirty mind' },
      {time: 52, text: 'Dem wah mi fi hurt fi mine' },
      {time: 54.25, text: 'Wah put mi under the earth fi mine' },
      {time: 56.5, text: 'After dem party fi dem 40' },
      {time: 59.5, text: 'Dem wah kill mi fi my 39' },
      {time: 62, text: 'Hmmmm' },
      {time: 63.85, text: 'Wi still a rise' },
      {time: 65, text: 'Dem fight under disguise but' },
      {time: 67.5, text: 'Wi still a rise' },
      {time: 69, text: 'Wi still a rise' },
      {time: 70.5, text: 'Ketch dem by surprise seh' },
      {time: 72.5, text: 'Wi still a rise' },
      {time: 74.5, text: 'Through the rain and fire' },
      {time: 76.5, text: 'By Mama answered prayer' },
      {time: 79.5, text: 'Through di pain and struggle' },
      {time: 82.5, text: 'Everyday man a juggle cause mi haffi rise' },
      {time: 87, text: 'A suh mi haffi dweet, cah mi wah mi yutes fi seet by the sweat of my eyebrows'},
      {time: 93.5, text: 'A suh mi rise' },
      {time: 95.5, text: 'Seh mi nuh, Trust how some people mind think' },
      {time: 98.5, text: 'Before mi sign the contract, mi haffi read the fine prints dem' },
      {time: 101.5, text: 'Fight di ting now dem a try link' },
      {time: 103.5, text: 'Mi jump inna di beast' },
      {time: 105, text: 'And block dem out wid di blind tint' },
      {time: 106.65, text: 'Nuff empty plate days mek mi hungry fi rich' },
      {time: 109.5, text: 'When mi taste di success mi stay humble wid it' },
      {time: 112, text: 'Woods Town mi love mi village mi rep Real N True, never switch' },
      {time: 117, text: 'Mi know mi haffi win, cah mi refuse fi lose' },
      {time: 119.5, text: 'A Jah Jah guide mi steps pan di route mi choose' },
      {time: 122.25, text: 'Nuh weapon dat rise, all bomb get defuse'},
      {time: 124.65, text: 'Nuh matta wah dem a try, dem cyaa defeat the yute'},
      {time: 127, text: 'Wi still a rise'},
      {time: 128.5, text: 'Dem fight under disguise but'},
      {time: 131, text: 'Wi still a rise'},
      {time: 132.5, text: 'Wi still a rise'},
      {time: 133.75, text: 'Ketch dem by surprise seh'},
      {time: 136, text: 'Wi still a rise'},
      {time: 137.5, text: 'Through the rain and fire'},
      {time: 140.5, text: 'By Mama answered prayer'},
      {time: 143, text: 'Through di pain and di struggle'},
      {time: 146, text: 'Everyday man a juggle cause'},
      {time: 150.15, text: 'A suh mi haffi dweet, cah mi wah mi yutes fi seet by the sweat of my eyebrows'},
      {time: 157, text: 'A suh mi rise'},
      {time: 159, text: 'Hmmmm'},
      {time: 169, text: 'Wi still a rise'},
      {time: 171, text: 'Dem fight under disguise but'},
      {time: 173, text: 'Wi still a rise'},
      {time: 174.5, text: 'Wi still a rise'},
      {time: 176, text: 'Ketch dem by surprise seh'},
      {time: 178, text: 'Wi still a rise'},
      {time: 180, text: 'Through the rain and fire'},
      {time: 182.5, text: 'By Mama answered prayer'},
      {time: 185, text: 'Through di pain and struggle'},
      {time: 188.5, text: 'Everyday man a juggle cause mi haffi rise'},
      {time: 192.5, text: 'A suh mi haffi dweet, cah mi wah mi yutes fi seet by the sweat of my eyebrows'},
      {time: 199, text: 'A suh mi rise'},
      {time: 201.5, text: 'Hmmmm'},
      {time: 208, text: 'Real N True'},
      {time: 212, text: 'Neva switch up'},
      {time: 214.5, text: 'Through worse or better'},
      {time: 220, text: 'A suh mi rise'},
    ], 
  },
  {
    id: 'rise-up-now-guitar',
    title: 'Rise Up Now (Guitar Version)',
    artist: 'Alexx A-Game',
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('Rise Up Now (Guitar Version) - Tv.mp3')}`,
    photoSrc: `${MEDIA_BASE}/RISE.JPEG`,
    lyrics: [
      { time: 0, text: '♪ Instrumental intro ♪' },
      {time: 1.5, text: 'Check'}, 
      {time: 3, text: 'Yuh guh, Game'},
      { time: 4.25, text: 'Seh a my time now' },
      { time: 7.5, text: 'A-Game a tell every ghetto yute addi right time now' },
      { time: 16, text: 'Ready?' },
      { time: 17.5, text: 'Buckle up' },
      { time: 18.75, text: 'Flight time now' },
      { time: 20.5, text: 'Cause when di pressure pile up' },
      { time: 22.5, text: 'Pressure pipe buss' },
      { time: 23.5, text: 'Tuff gets goin when the goin gets tuff, ahh' },
      { time: 26.5, text: 'Time fi every go getta rise up' },
      { time: 29, text: 'Mi wah see every go getta rise up' },
      { time: 31.75, text: 'Pressure pile up, aye when di pressure pipe buss' },
      { time: 34.5, text: 'Tuff gets goin when the goin gets tuff, ahh' },
      { time: 37.5, text: 'Time fi every go getta rise up' },
      { time: 40, text: 'Mi wah see every go getta rise' },
      { time: 42.5, text: 'Check it' },
      { time: 43.25, text: 'Well clever, ready fi whatever' },
      { time: 45.75, text: 'Family haffi eat and so wi a work together' },
      { time: 48, text: 'Big up mi madda, mi fadda, mi sista dem and mi likkle bredda' },
      { time: 51, text: 'Birds of a feather, wi flock through any weatha' },
      { time: 53.5, text: 'Suh mi born, suh mi grow' },
      { time: 55, text: 'Mi will neva eva' },
      { time: 56.5, text: 'Neva bow dung, neva switch fi nuh chedda' },
      { time: 58.75, text: 'Nuh care how the time get' },
      { time: 60.25, text: 'Redda and Dreadda' },
      { time: 62, text: 'Tuff like a 10 pound a leatha' },
      { time: 63.75, text: 'Mi nuh light like nuh featha' },
      { time: 65, text: 'Granny did tell wi seh wheneva' },
      { time: 67.4, text: 'Time get tuff, stick out fi one a netha' },
      { time: 70, text: 'Help yuh bredda fi climb up di ladda, Nuh figet weh yuh come from' },
      { time: 74, text: 'Desso you fi preffa' },
      { time: 75.5, text: 'Woods Town, Saint Ann' },
      { time: 76.75, text: 'Big up mi linki dem' },
      { time: 78, text: 'Real fren dem and mi will do anyting fi dem, oohh yeah' },
      { time: 81.65, text: 'Mi will do anyting fi dem' },
      { time: 83.5, text: 'Listen da part yah weh mi sing fi dem' },
      { time: 85.25, text: 'Lawd, when di pressure pile up' },
      { time: 87.5, text: 'Pressure pipe buss' },
      { time: 89, text: 'Tuff gets goin when the goin gets tuff, ahh' },
      { time: 91.5, text: 'Time fi every go getta rise up' },
      { time: 94, text: 'Mi wah see every go getta rise up' },
      { time: 97, text: 'Pressure pile up, aye when di pressure pipe buss' },
      { time: 100.25, text: 'Tuff gets goin when the goin gets tuff, ahh' },
      { time: 102.75, text: 'Time fi every go getta rise up' },
      { time: 105.4, text: 'Mi wah see every go getta rise up' },
      { time: 111, text: 'Yuh guh' },
      { time: 113, text: 'Seh a my time now' },
      { time: 115.5, text: 'Alexx A-Game a tell every ghetto yute addi right time now' },
      { time: 122, text: '♪ Uhhhh ♪'},
      { time: 129, text: 'HUH!' },
      { time: 130, text: 'Rise up now' },
      { time: 131.5, text: 'Rise up now' },
      { time: 133, text: 'Warn every yute, keep yuh eyes open now' },
      { time: 135.15, text: 'Rise up now' },
      { time: 136.5, text: 'Rise up now '},
      { time: 138, text: 'Young girl get up and try sumn now '},
      { time: 140.5, text: 'Rise up now' }, 
      { time: 142, text: 'Rise up now' }, 
      { time: 143.5, text: 'Full time Mamma tears dry up now '},
      { time: 146, text: 'Full time everybody wise up now '},
      { time: 148.5, text: 'Huh! Mek wi rise up now'},
      { time: 150.5, text: 'Cause when di pressure pile up' },
      { time: 153, text: 'Pressure pipe buss' },
      { time: 154.25, text: 'Tuff gets goin when the goin gets tuff, ahh' },
      { time: 157.5, text: 'Time fi every go getta rise up' },
      { time: 159.5, text: 'Mi wah see every go getta rise up' },
      { time: 162.25, text: 'Pressure pile up'}, 
      { time: 163.5, text: 'Di pressure pipe buss'},
      { time: 165, text: 'Tuff gets goin when the goin gets tuff, yeah'},
      { time: 170, text: '♪ Wo wo wo woaa, yea ♪'},
      { time: 172.5, text: 'Cause when di pressure pile up' },
      { time: 174.5, text: 'Pressure pipe buss' },
      { time: 176, text: 'Tuff gets goin when the goin gets tuff, ahh' },
      { time: 179, text: 'Time fi every go getta rise up' },
      { time: 181.5, text: 'Mi wah see every go getta rise up' },
      { time: 184.25, text: 'Pressure pile up' },
      { time: 186, text: '♪ Woaa wo wooaa, yeaa ♪'},
      { time: 189.5, text: 'Hey mi nuh inna no fuss'}, 
      {time: 192, text: 'Mi nah sit dung and tun cruff'}, 
      {time: 195, text: 'Game'},
    ]
  },
  {
    id: 'go-harda',
    title: 'Go Harda',
    artist: 'Alexx A-Game',
    audioSrc: '/placeholder-track-3.mp3',
    photoSrc: null,
    lyrics: [
      { time: 0, text: '♪ Instrumental intro ♪' },
      { time: 8, text: 'Placeholder lyric line one' },
      { time: 14, text: 'Placeholder lyric line two' },
    ],
  }
];

type Direction = 'next' | 'prev';

const SEEK_STEP = 10; // seconds skipped by the mobile «/» buttons

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

  function skip(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const end = duration || audio.duration || 0;
    const t = Math.min(Math.max(audio.currentTime + delta, 0), end);
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
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
            <p className={styles.pickerTitle}>{activeSong.title}</p>
            <p className={styles.pickerArtist}>{activeSong.artist}</p>
          </div>

          <div className={styles.pickerPlayback}>
            <button
              type="button"
              className={styles.seekBtn}
              aria-label={`Back ${SEEK_STEP} seconds`}
              onClick={() => skip(-SEEK_STEP)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5l-7 7 7 7M19 5l-7 7 7 7" />
              </svg>
            </button>

            <button
              className={styles.playBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className={styles.seekBtn}
              aria-label={`Forward ${SEEK_STEP} seconds`}
              onClick={() => skip(SEEK_STEP)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 5l7 7-7 7M12 5l7 7-7 7" />
              </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
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
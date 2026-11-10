'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import GameIconsBackground from '@/components/GameIconsBackground';
import MobileBottomNav from '@/components/MobileBottomNav';
import styles from './karaoke.module.css';

interface LyricLine {
  time: number; // seconds — when this line becomes active
  text: string;
  words?: number[]; // optional: start time (seconds) of each word, for exact sync
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
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('More Life.mp3')}`,
    photoSrc: `${MEDIA_BASE}/agame-portrait.jpg`,
    lyrics: [
            { time: 0, text: '♪ Instrumental intro ♪', words: [0, 2.21, 4.77, 7.35] },
      { time: 9.54, text: 'Cyah link no more', words: [9.54, 9.87, 10.19, 10.48] },
      { time: 12.07, text: 'Cyah drink no more', words: [12.07, 12.4, 12.72, 12.98] },
      { time: 14.65, text: 'Cyah link no more', words: [14.65, 14.97, 15.3, 15.63] },
      { time: 17.21, text: 'Woahh', words: [17.21] },
      { time: 19.13, text: 'Champagne fi mi real friends', words: [19.13, 19.74, 19.94, 20.07, 20.39] },
      { time: 21.7, text: 'Real pain fi mi sham friends', words: [21.7, 22.03, 22.31, 22.52, 22.68, 22.97] },
      { time: 24.27, text: 'Mek a toast to di one dem', words: [24.27, 24.43, 24.55, 24.88, 25.04, 25.21, 25.49] },
      { time: 26.79, text: 'Weh a roll like a tandem', words: [26.79, 26.96, 27.12, 27.41, 27.57, 27.73] },
      { time: 28.75, text: 'One time fi di Goddess and e God dem', words: [28.75, 29.04, 29.29, 29.46, 29.63, 30, 30.17, 30.33, 30.61] },
      { time: 31.92, text: 'Mi nuh wah see nuh problem', words: [31.92, 32.08, 32.2, 32.49, 32.69, 32.81] },
      { time: 34.45, text: 'Stay close to mi fam dem', words: [34.45, 34.74, 35.06, 35.22, 35.43, 35.71] },
      { time: 37.02, text: 'Cah tomorrow nuh promised, Noo', words: [37.02, 37.18, 37.71, 37.86, 38.84] },
      { time: 40.23, text: 'Tek a shot fi di one dem weh gaan and nuh de yah no more', words: [40.23, 40.4, 40.65, 40.93, 41.09, 41.22, 41.5, 41.65, 41.81, 42.1, 42.31, 42.47, 42.75, 42.92, 43.08] },
      { time: 45.12, text: 'Another shot fi di one dem weh deh yah weh real to di core', words: [45.12, 45.61, 46.02, 46.18, 46.34, 46.55, 46.71, 46.91, 47.2, 47.36, 47.52, 47.85, 48.01, 48.17] },
      { time: 50.42, text: 'Celebrate wid yuh friends and yuh family cause you neva know', words: [50.42, 51.03, 51.19, 51.36, 51.68, 51.85, 52.05, 52.5, 52.66, 53.03, 53.28] },
      { time: 55.23, text: 'When we cyah link no more', words: [55.23, 55.39, 55.55, 55.88, 56.2, 56.53] },
      { time: 57.8, text: 'And we cyah drink no more', words: [57.8, 57.96, 58.12, 58.41, 58.73, 59.14] },
      { time: 60.53, text: 'We goin up!', words: [60.53, 60.69, 60.94] },
      { time: 61.75, text: 'We goin in!', words: [61.75, 61.91, 62.2] },
      { time: 63.22, text: 'Fi di one dem weh real to di link', words: [63.22, 63.38, 63.55, 63.79, 63.99, 64.15, 64.44, 64.61, 64.77] },
      { time: 65.58, text: 'We ago dance!', words: [65.58, 65.74, 66.03] },
      { time: 66.84, text: 'We ago drink!', words: [66.84, 67.01, 67.29] },
      { time: 68.28, text: 'Nuh regrets, celebrate everyting!', words: [68.28, 68.44, 68.89, 69.46] },
      { time: 70.8, text: 'Every choice, every loss, every win!', words: [70.8, 71.13, 71.46, 71.74, 72.11, 72.4] },
      { time: 73.21, text: 'We nuh give up, no we nah go give in!', words: [73.21, 73.37, 73.53, 73.7, 74.02, 74.19, 74.35, 74.63, 74.79, 74.96] },
      { time: 75.83, text: 'To be alive doesn\'t mean you living!', words: [75.83, 76, 76.24, 76.56, 76.89, 77.22, 77.38] },
      { time: 78.35, text: 'So everyday we get up, we a live', words: [78.35, 78.48, 79.13, 79.29, 79.45, 79.78, 79.94, 80.1] },
      { time: 80.43, text: 'We a live, We a live', words: [80.43, 80.59, 80.75, 81.04, 81.2, 81.37] },
      { time: 81.73, text: 'More Life', words: [81.73, 82.01] },
      { time: 82.96, text: 'More Life', words: [82.96, 83.24] },
      { time: 84.17, text: 'Moreee Lifeee', words: [84.17, 84.87] },
      { time: 86.78, text: 'More Life', words: [86.78, 87.06] },
      { time: 88.08, text: 'More Life', words: [88.08, 88.36] },
      { time: 89.34, text: 'Moreee Lifeee', words: [89.34, 89.95] },
      { time: 91.91, text: 'More Life', words: [91.91, 92.2] },
      { time: 93.14, text: 'More Life', words: [93.14, 93.46] },
      { time: 94.4, text: 'Moreee Lifeee', words: [94.4, 95.05] },
      { time: 96.19, text: 'To be alive doesn\'t mean you living!', words: [96.19, 96.36, 96.64, 97.01, 97.33, 97.66, 97.68] },
      { time: 98.7, text: 'So everyday we get up, we a live', words: [98.7, 98.8, 99.56, 99.68, 99.84, 100.17, 100.33, 100.49] },
      { time: 100.82, text: 'We a live, We a live', words: [100.82, 101.02, 101.15, 101.47, 101.59, 101.8] },
      { time: 102.08, text: 'More Life', words: [102.08, 102.41] },
      { time: 103.35, text: 'More While ', words: [103.35, 103.64] },
      { time: 104.33, text: 'Nutn don\'t right, but we haffi hold tight', words: [104.33, 104.69, 104.98, 105.34, 105.5, 105.67, 105.95, 106.28] },
      { time: 107.17, text: 'No lies, No pride', words: [107.17, 107.46, 108.43, 108.76] },
      { time: 109.12, text: 'When we down an a struggle cause we know we gon\' rise', words: [109.12, 109.29, 109.45, 109.73, 109.9, 110.06, 110.42, 110.55, 110.71, 110.87, 111.07, 111.36] },
      { time: 112.01, text: 'Couple real ones stand up wid me both sides', words: [112.01, 112.22, 112.52, 112.68, 112.97, 113.09, 113.25, 113.58, 113.87] },
      { time: 114.73, text: 'Fake ones, we cut off those ties', words: [114.73, 115.13, 115.46, 115.67, 115.83, 116.16, 116.44] },
      { time: 117.42, text: 'Grab a glass, pour sumn, no ice', words: [117.42, 117.58, 117.74, 118.07, 118.39, 118.72, 119.01] },
      { time: 119.86, text: 'Now put it up inna e sky', words: [119.86, 119.98, 120.15, 120.31, 120.51, 120.63, 120.79] },
      { time: 121.9, text: 'Tek a shot fi di one dem weh gaan and nuh de yah no more', words: [121.9, 122.06, 122.35, 122.63, 122.75, 122.87, 123.12, 123.32, 123.48, 123.81, 123.93, 124.13, 124.46, 124.62, 124.78] },
      { time: 126.81, text: 'Another shot fi di one dem weh deh yah weh real to di core', words: [126.81, 127.26, 127.72, 127.88, 128, 128.29, 128.45, 128.61, 128.94, 129.1, 129.27, 129.59, 129.76, 129.92] },
      { time: 132.09, text: 'Celebrate wid yuh friends and yuh family cause you neva know', words: [132.09, 132.74, 132.9, 133.06, 133.35, 133.51, 133.68, 133.96, 134.12, 134.58, 134.87] },
      { time: 136.91, text: 'When we cyah link no more', words: [136.91, 137.07, 137.24, 137.56, 137.89, 138.17] },
      { time: 139.45, text: 'And we cyah drink no more', words: [139.45, 139.65, 139.78, 140.1, 140.42, 140.75] },
      { time: 142.22, text: 'We goin up!', words: [142.22, 142.38, 142.67] },
      { time: 143.48, text: 'We goin in!', words: [143.48, 143.61, 143.93] },
      { time: 144.92, text: 'Fi di one dem weh real to di link', words: [144.92, 145.08, 145.2, 145.52, 145.69, 145.85, 146.17, 146.34, 146.46] },
      { time: 147.28, text: 'We ago dance!', words: [147.28, 147.44, 147.73] },
      { time: 148.59, text: 'We ago drink!', words: [148.59, 148.71, 148.99] },
      { time: 150.01, text: 'Nuh regrets, celebrate everyting!', words: [150.01, 150.13, 150.66, 151.23] },
      { time: 152.53, text: 'Every choice, every loss, every win!', words: [152.53, 152.86, 153.19, 153.51, 153.84, 154.12] },
      { time: 154.94, text: 'We nuh give up, no we nah go give in!', words: [154.94, 155.14, 155.26, 155.47, 155.75, 155.92, 156.08, 156.37, 156.53, 156.7] },
      { time: 157.54, text: 'To be alive doesn\'t mean you living!', words: [157.54, 157.7, 157.98, 158.35, 158.62, 158.95, 159.24] },
      { time: 160.06, text: 'So everyday we get up, we a live', words: [160.06, 160.22, 160.83, 160.99, 161.15, 161.48, 161.64, 161.8] },
      { time: 162.64, text: 'We goin up!', words: [162.64, 162.76, 163.09] },
      { time: 163.95, text: 'We goin in!', words: [163.95, 164.07, 164.36] },
      { time: 165.38, text: 'Fi di one dem weh real to di link', words: [165.38, 165.5, 165.7, 165.98, 166.15, 166.31, 166.59, 166.76, 166.92] },
      { time: 167.74, text: 'We ago dance!', words: [167.74, 167.86, 168.15] },
      { time: 169, text: 'We ago drink!', words: [169, 169.12, 169.45] },
      { time: 170.42, text: 'Nuh regrets, celebrate everyting!', words: [170.42, 170.71, 171.08, 171.69] },
      { time: 172.95, text: 'Every choice, every loss, every win!', words: [172.95, 173.28, 173.6, 173.97, 174.33, 174.62] },
      { time: 175.4, text: 'We nuh give up, no we nah go give in!', words: [175.4, 175.56, 175.68, 175.89, 176.17, 176.37, 176.5, 176.82, 176.94, 177.1] },
      { time: 177.96, text: 'To be alive doesn\'t mean you living!', words: [177.96, 178.13, 178.41, 178.74, 179.01, 179.33, 179.62] },
      { time: 180.51, text: 'So everyday we get up, we a live', words: [180.51, 180.63, 181.3, 181.47, 181.63, 181.92, 182.08, 182.24] },
      { time: 182.57, text: 'We a live, We a live', words: [182.57, 182.77, 182.89, 183.22, 183.34, 183.51] },
      { time: 183.87, text: 'More Life', words: [183.87, 184.16] },
      { time: 185.09, text: 'More Life', words: [185.09, 185.38] },
      { time: 186.36, text: 'Moreee Lifeee', words: [186.36, 187.01] },
      { time: 188.92, text: 'More Life', words: [188.92, 189.21] },
      { time: 190.18, text: 'More Life', words: [190.18, 190.47] },
      { time: 191.45, text: 'Moreee Lifeee', words: [191.45, 192.1] },
      { time: 194.01, text: 'More Life', words: [194.01, 194.26] },
      { time: 195.27, text: 'More Life', words: [195.27, 195.52] },
      { time: 196.53, text: 'Moreee Lifeee', words: [196.53, 197.19] },
      { time: 198.34, text: 'To be alive doesn\'t mean you living!', words: [198.34, 198.5, 198.79, 199.11, 199.48, 199.77, 199.97] },
      { time: 200.9, text: 'So everyday we get up, we a live', words: [200.9, 201.07, 201.68, 201.84, 202.01, 202.33, 202.49, 202.66] },
      { time: 202.92, text: 'Champagne fi mi real friends', words: [202.92, 203.62, 203.78, 203.94, 204.27] },
      { time: 205.54, text: 'Real pain fi mi sham friends', words: [205.54, 205.87, 206.19, 206.39, 206.52, 206.8] },
      { time: 208.03, text: 'Mek a toast to di one dem', words: [208.03, 208.23, 208.4, 208.72, 208.92, 209.05, 209.33] },
      { time: 210.64, text: 'Weh a roll like a tandem', words: [210.64, 210.8, 210.96, 211.29, 211.45, 211.62] },
      { time: 212.59, text: 'One time fi di Goddess and e God dem', words: [212.59, 212.88, 213.16, 213.37, 213.53, 213.86, 214.02, 214.18, 214.51] },
      { time: 215.77, text: 'Mi nuh wah see nuh problem', words: [215.77, 215.94, 216.1, 216.43, 216.59, 216.75] },
      { time: 218.3, text: 'Stay close to mi fam dem', words: [218.3, 218.59, 218.92, 219.08, 219.24, 219.57] },
      { time: 220.87, text: 'Cah tomorrow nuh promised, Noo', words: [220.87, 221.03, 221.65, 221.81, 222.71] },
    ],
  },
  {
    id: 'still-a-rise',
    title: 'Still A Rise',
    artist: 'Alexx A-Game',
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('Alexx A-Game - Still A Rise (tv).mp3')}`,
    photoSrc: `${MEDIA_BASE}/IMG_8566.JPG`,
    lyrics: [
            { time: 0, text: 'Hmmmmmm', words: [0] },
      { time: 3.05, text: 'Neva switch up', words: [3.05, 3.41, 3.58] },
      { time: 4.92, text: 'Through worse or better', words: [4.92, 5.12, 5.54, 6.07] },
      { time: 7.86, text: 'Game', words: [7.86] },
      { time: 11, text: 'Eva since man get a raise a income', words: [11, 11.33, 11.65, 12.02, 12.22, 12.34, 12.6, 12.72] },
      { time: 13.53, text: 'In come some', words: [13.53, 13.77, 14.1] },
      { time: 14.92, text: 'Fake friends pon e ends, Dem a pretend like seh dem real', words: [14.92, 15.16, 15.45, 15.61, 15.91, 15.91, 16.07, 16.23, 16.52, 16.68, 16.84, 16.97] },
      { time: 17.22, text: 'Is like dem have a faker, syndrome', words: [17.22, 17.39, 17.55, 17.71, 17.87, 18.04, 18.69] },
      { time: 20.73, text: 'When dem come wid dem chaser and dem rum, we nuh drink none', words: [20.73, 20.93, 21.1, 21.34, 21.5, 21.66, 21.91, 22.11, 22.28, 22.68, 22.85, 22.97, 23.25] },
      { time: 24.11, text: 'Mi nuh nyam weh dem cook, mi nuh bun', words: [24.11, 24.27, 24.4, 24.68, 24.84, 24.97, 25.42, 25.58, 25.7] },
      { time: 26.4, text: 'None a the herbs, weh dem', words: [26.4, 26.56, 26.72, 26.93, 27.54, 27.7] },
      { time: 28.23, text: 'Bring come', words: [28.23, 28.56] },
      { time: 29.87, text: 'Hmmmm', words: [29.87] },
      { time: 31.21, text: 'Move like dem genuine', words: [31.21, 31.54, 31.87, 32.2] },
      { time: 33.06, text: 'But dem nuh really real', words: [33.06, 33.22, 33.38, 33.54, 33.79] },
      { time: 34.32, text: 'Yuh think a joke, alright dawg watchya pree di deal', words: [34.32, 34.48, 34.69, 34.85, 35.05, 35.5, 35.82, 36.03, 36.15, 36.35] },
      { time: 37.05, text: 'When me a face my hungry day, Dem nuh know how mi did feel', words: [37.05, 37.21, 37.33, 37.54, 37.74, 37.86, 38.03, 38.63, 38.79, 38.95, 39.19, 39.14, 39.3, 39.47] },
      { time: 39.83, text: 'Now the table turn, mi mek a food dem wah fi eat mi meal', words: [39.83, 40, 40.16, 40.37, 40.53, 40.69, 40.85, 41.02, 41.18, 41.3, 41.46, 41.63, 41.8, 41.95] },
      { time: 42.44, text: 'But a hard mi work fi mine', words: [42.44, 42.6, 42.77, 43.06, 43.26, 43.55, 43.71] },
      { time: 44.57, text: 'Nuh man mi nuh work fi mind', words: [44.57, 44.77, 45.1, 45.26, 45.43, 45.91, 46.08] },
      { time: 47.26, text: 'Dem wah dish mi dirt fi mine', words: [47.26, 47.46, 47.79, 47.95, 48.2, 48.61, 48.77] },
      { time: 49.62, text: 'Mi bun dem and dem dirty mind', words: [49.62, 49.83, 50.15, 50.36, 50.6, 50.8, 51.46] },
      { time: 52.52, text: 'Dem wah mi fi hurt fi mine', words: [52.52, 52.72, 53, 53.21, 53.37, 53.82, 53.98] },
      { time: 54.72, text: 'Wah put mi under the earth fi mine', words: [54.72, 55.04, 55.21, 55.37, 55.74, 55.95, 56.43, 56.6] },
      { time: 57.05, text: 'After dem party fi dem 40', words: [57.05, 57.41, 57.74, 58.96, 59.12, 59.37] },
      { time: 60.15, text: 'Dem wah kill mi fi my 39', words: [60.15, 60.35, 60.67, 60.84, 61.04, 61.2, 61.53] },
      { time: 62.59, text: 'Hmmmm', words: [62.59] },
      { time: 64.11, text: 'Wi still a rise', words: [64.11, 64.24, 64.4, 64.56] },
      { time: 65.46, text: 'Dem fight under disguise but', words: [65.46, 65.62, 65.91, 66.27, 66.97] },
      { time: 67.74, text: 'Wi still a rise', words: [67.74, 67.99, 68.23, 68.47] },
      { time: 69.3, text: 'Wi still a rise', words: [69.3, 69.5, 69.62, 69.9] },
      { time: 70.68, text: 'Ketch dem by surprise seh', words: [70.68, 71.01, 71.33, 71.62, 72.43] },
      { time: 73, text: 'Wi still a rise', words: [73, 73.25, 73.53, 73.82] },
      { time: 74.8, text: 'Through the rain and fire', words: [74.8, 74.96, 75.13, 75.45, 75.78] },
      { time: 77.33, text: 'By Mama answered prayer', words: [77.33, 77.57, 77.82, 78.39] },
      { time: 80.1, text: 'Through di pain and struggle', words: [80.1, 80.26, 80.51, 80.75, 81.08] },
      { time: 83.36, text: 'Everyday man a juggle cause mi haffi rise', words: [83.36, 84.02, 84.18, 84.46, 84.99, 85.28, 85.48, 85.72] },
      { time: 87.63, text: 'A suh mi haffi dweet, cah mi wah mi yutes fi seet by', words: [87.63, 87.79, 87.96, 88.12, 88.45, 88.69, 88.9, 89.02, 89.35, 89.51, 89.88, 90.04, 90.36] },
      { time: 90.81, text: ' The sweat of my eyebrow', words: [90.81, 90.98, 91.22, 91.5, 91.96] },
      { time: 94.11, text: 'A suh mi rise', words: [94.11, 94.4, 94.69, 95.01] },
      { time: 95.83, text: 'Seh mi nuh, Trust how some people mind think', words: [95.83, 95.95, 96.07, 96.6, 96.85, 97.21, 97.5, 97.99, 98.28] },
      { time: 98.89, text: 'Before mi sign the contract, mi haffi read the fine prints dem', words: [98.89, 99.05, 99.21, 99.38, 99.62, 99.82, 100.15, 100.27, 100.39, 100.59, 100.95, 101.27] },
      { time: 101.84, text: 'Fight di ting now dem a try link', words: [101.84, 102.13, 102.29, 102.61, 102.94, 103.11, 103.27, 103.59] },
      { time: 103.92, text: 'Mi jump inna di beast', words: [103.92, 104.12, 104.45, 104.61, 104.78] },
      { time: 104.94, text: 'And block dem out wid di blind tint', words: [104.94, 105.26, 105.55, 105.75, 105.87, 106.24, 106.4, 106.61] },
      { time: 107.2, text: 'Nuff empty plate days mek mi hungry fi rich', words: [107.2, 107.36, 107.82, 108.18, 108.51, 108.71, 108.88, 109.2, 109.4] },
      { time: 109.85, text: 'When mi taste di success mi stay humble wid it', words: [109.85, 110.06, 110.23, 110.47, 110.68, 111.04, 111.21, 111.57, 111.91, 112.08] },
      { time: 112.57, text: 'Woods Town mi love mi village mi rep Real N True, never switch', words: [112.57, 112.81, 113.14, 113.34, 113.63, 113.79, 114.28, 114.44, 114.81, 115.18, 115.59, 116.36, 116.69] },
      { time: 117.34, text: 'Mi know mi haffi win, cah mi refuse fi lose', words: [117.34, 117.5, 117.7, 117.87, 118.03, 118.24, 118.44, 118.6, 119.22, 119.38] },
      { time: 119.99, text: 'A Jah Jah guide mi steps pan di route mi choose', words: [119.99, 120.15, 120.31, 120.48, 120.64, 120.8, 121.13, 121.29, 121.41, 121.86, 122.02] },
      { time: 122.58, text: 'Nuh weapon dat rise, all bomb get defuse', words: [122.58, 122.74, 123.11, 123.35, 123.68, 124.01, 124.17, 124.45] },
      { time: 125.27, text: 'Nuh matta wah dem a try, dem cyaa defeat the yute', words: [125.27, 125.44, 125.6, 125.72, 125.88, 126.05, 126.29, 126.46, 126.78, 127.11, 127.27] },
      { time: 127.55, text: 'Wi still a rise', words: [127.55, 127.72, 127.84, 128] },
      { time: 128.82, text: 'Dem fight under disguise but', words: [128.82, 129.07, 129.31, 129.6, 130.13] },
      { time: 131.07, text: 'Wi still a rise', words: [131.07, 131.35, 131.64, 131.88] },
      { time: 132.69, text: 'Wi still a rise', words: [132.69, 132.9, 133.06, 133.22] },
      { time: 134.04, text: 'Ketch dem by surprise seh', words: [134.04, 134.36, 134.69, 135.01, 135.75] },
      { time: 136.36, text: 'Wi still a rise', words: [136.36, 136.65, 136.85, 137.14] },
      { time: 138.16, text: 'Through the rain and fire', words: [138.16, 138.32, 138.48, 138.81, 139.13] },
      { time: 140.61, text: 'By Mama answered prayer', words: [140.61, 140.81, 141.14, 141.75] },
      { time: 143.47, text: 'Through di pain and di struggle', words: [143.47, 143.63, 143.79, 144.08, 144.33, 144.45] },
      { time: 146.65, text: 'Everyday man a juggle cause', words: [146.65, 147.42, 147.59, 147.79, 148.37] },
      { time: 150.96, text: 'A suh mi haffi dweet, cah mi wah mi yutes fi seet by', words: [150.96, 151.12, 151.37, 151.53, 151.78, 152.1, 152.3, 152.43, 152.79, 152.96, 153.28, 153.45, 153.81] },
      { time: 154.3, text: 'The sweat of my eyebrows', words: [154.3, 154.23, 154.47, 154.52, 154.86] },
      { time: 157.42, text: 'A suh mi rise', words: [157.42, 157.79, 158.08, 158.33] },
      { time: 159.57, text: 'Hmmmm', words: [159.57] },
      { time: 169.62, text: 'Wi still a rise', words: [169.62, 169.83, 169.95, 170] },
      { time: 170.9, text: 'Dem fight under disguise but', words: [170.9, 171.1, 171.39, 171.79, 172.41] },
      { time: 173.3, text: 'Wi still a rise', words: [173.3, 173.59, 173.83, 174.07] },
      { time: 174.89, text: 'Wi still a rise', words: [174.89, 175.1, 175.26, 175.42] },
      { time: 176.2, text: 'Ketch dem by surprise seh', words: [176.2, 176.49, 176.85, 177.1, 177.96] },
      { time: 178.53, text: 'Wi still a rise', words: [178.53, 178.81, 179.02, 179.34] },
      { time: 180.28, text: 'Through the rain and fire', words: [180.28, 180.44, 180.65, 180.93, 181.3] },
      { time: 182.85, text: 'By Mama answered prayer', words: [182.85, 183.05, 183.3, 183.79] },
      { time: 185.58, text: 'Through di pain and struggle', words: [185.58, 185.74, 185.91, 186.24, 186.52] },
      { time: 188.81, text: 'Everyday man a juggle cause mi haffi rise', words: [188.81, 189.58, 189.74, 189.95, 190.52, 190.81, 191.01, 191.16] },
      { time: 193.16, text: 'A suh mi haffi dweet, cah mi wah mi yutes fi seet by', words: [193.16, 193.36, 193.52, 193.68, 193.85, 194.21, 194.38, 194.54, 194.86, 195.03, 195.36, 195.52, 195.8] },
      { time: 196.41, text: 'The sweat of my eyebrows', words: [196.41, 196.62, 196.78, 197.06, 197.11] },
      { time: 199.56, text: 'A suh mi rise', words: [199.56, 199.88, 200.17, 200.33] },
      { time: 201.68, text: 'Hmmmm', words: [201.68] },
      { time: 208.32, text: 'Real N True', words: [208.32, 208.61, 209.22] },
      { time: 213.06, text: 'Neva switch up', words: [213.06, 213.38, 213.58] },
      { time: 214.79, text: 'Through worse or better', words: [214.79, 215.08, 215.45, 215.98] },
      { time: 220.74, text: 'A suh mi rise', words: [220.74, 220.99, 221.35, 221.6] },
    ], 
  },
  {
    id: 'rise-up-now-guitar',
    title: 'Rise Up Now (Guitar Version)',
    artist: 'Alexx A-Game',
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('Rise Up Now (Guitar Version) - Tv.mp3')}`,
    photoSrc: `${MEDIA_BASE}/RISE.JPEG`,
    lyrics: [
            { time: 0, text: '♪ Instrumental intro ♪', words: [0, 0, 0.43, 0.8] },
      { time: 1.86, text: 'Check', words: [1.86] },
      { time: 3.33, text: 'Yuh guh, Game', words: [3.33, 3.49, 4.02] },
      { time: 4.75, text: 'Seh a my time now', words: [4.75, 4.92, 5.09, 5.74, 6.39] },
      { time: 8.14, text: 'A-Game a tell every ghetto yute addi right time now', words: [8.14, 8.84, 9, 9.17, 9.49, 9.66, 10.11, 10.53, 11.22, 11.84] },
      { time: 16.2, text: 'Ready?', words: [16.2] },
      { time: 17.87, text: 'Buckle up', words: [17.87, 18.16] },
      { time: 19.14, text: 'Flight time now', words: [19.14, 19.34, 19.59] },
      { time: 20.49, text: 'Cause when di pressure pile up', words: [20.49, 20.82, 21.19, 21.35, 21.71, 22.08] },
      { time: 22.82, text: 'Pressure pipe buss', words: [22.82, 23.1, 23.39] },
      { time: 24.24, text: 'Tuff gets goin when the goin gets tuff, ahh', words: [24.24, 24.49, 24.81, 25.1, 25.26, 25.43, 25.75, 26.07, 26.26] },
      { time: 27.03, text: 'Time fi every go getta rise up', words: [27.03, 27.32, 27.48, 27.76, 28.13, 28.53, 28.82] },
      { time: 29.59, text: 'Mi wah see every go getta rise up', words: [29.59, 29.8, 30.04, 30.24, 30.57, 30.94, 31.26, 31.59] },
      { time: 32.32, text: 'Pressure pile up, aye when di pressure pipe buss', words: [32.32, 32.65, 32.93, 33.09, 33.29, 33.42, 33.62, 33.9, 34.27] },
      { time: 35.13, text: 'Tuff gets goin when the goin gets tuff, ahh', words: [35.13, 35.38, 35.66, 35.83, 35.99, 36.2, 36.36, 36.69, 37.15] },
      { time: 37.89, text: 'Time fi every go getta rise up', words: [37.89, 38.25, 38.38, 38.54, 38.75, 39.36, 39.66] },
      { time: 40.48, text: 'Mi wah see every go getta rise', words: [40.48, 40.64, 40.96, 41.13, 41.42, 41.74, 42.15] },
      { time: 42.78, text: 'Check it', words: [42.78, 42.94] },
      { time: 43.51, text: 'Well clever, ready fi whatever', words: [43.51, 44, 44.62, 44.9, 45.06] },
      { time: 45.87, text: 'Family haffi eat and so wi a work together', words: [45.87, 46.04, 46.36, 46.71, 46.91, 47.16, 47.32, 47.49, 47.7] },
      { time: 48.69, text: 'Big up mi madda, mi fadda, mi sista dem and mi likkle bredda', words: [48.69, 48.85, 48.97, 49.13, 49.25, 49.38, 49.55, 49.67, 49.83, 50, 50.2, 50.32, 50.61] },
      { time: 51.47, text: 'Birds of a feather, wi flock through any weatha', words: [51.47, 51.71, 51.87, 52.03, 52.32, 52.48, 52.81, 53.02, 53.18] },
      { time: 53.99, text: 'Suh mi born, suh mi grow', words: [53.99, 54.15, 54.27, 54.64, 54.8, 54.93] },
      { time: 55.48, text: 'Mi will neva eva', words: [55.48, 55.65, 55.77, 56.05] },
      { time: 56.91, text: 'Neva bow dung, neva switch fi nuh chedda', words: [56.91, 57.15, 57.44, 57.81, 57.97, 58.13, 58.46, 58.62] },
      { time: 59.36, text: 'Nuh care how the time get', words: [59.36, 59.56, 59.73, 59.97, 60.17, 60.5] },
      { time: 60.91, text: 'Redda and Dreadda', words: [60.91, 61.24, 61.44] },
      { time: 62.38, text: 'Tuff like a 10 pound a leatha', words: [62.38, 62.58, 62.79, 62.95, 63.15, 63.44, 63.6] },
      { time: 64.1, text: 'Mi nuh light like nuh featha', words: [64.1, 64.26, 64.43, 64.63, 64.84, 65.08] },
      { time: 65.61, text: 'Granny did tell wi seh wheneva', words: [65.61, 65.82, 65.98, 66.43, 66.59, 66.75] },
      { time: 67.73, text: 'Time get tuff, stick out fi one a netha', words: [67.73, 68.06, 68.3, 68.63, 68.79, 69.16, 69.32, 69.48, 69.65] },
      { time: 70.67, text: 'Help yuh bredda fi climb up di ladda, Nuh figet weh yuh come from', words: [70.67, 71.03, 71.24, 71.4, 71.56, 71.81, 72.03, 72.19, 72.44, 72.81, 72.93, 73.14, 73.58, 73.95] },
      { time: 74.44, text: 'Desso you fi preffa', words: [74.44, 74.64, 74.76, 75.05] },
      { time: 75.82, text: 'Woods Town, Saint Ann', words: [75.82, 76.07, 76.47, 76.72] },
      { time: 77.22, text: 'Big up mi linki dem', words: [77.22, 77.38, 77.46, 77.62, 77.91] },
      { time: 78.69, text: 'Real fren dem and mi will do anyting fi dem, oohh yeah', words: [78.69, 78.98, 79.22, 79.39, 79.55, 79.75, 79.91, 80.08, 80.25, 80.37, 80.83, 81.48] },
      { time: 82.25, text: 'Mi will do anyting fi dem', words: [82.25, 82.46, 82.62, 82.87, 83.03, 83.02] },
      { time: 83.96, text: 'Listen da part yah weh mi sing fi dem', words: [83.96, 84.12, 84.25, 84.61, 84.78, 84.9, 85.06, 85.22, 85.39] },
      { time: 85.83, text: 'Lawd, when di pressure pile up', words: [85.83, 86.16, 86.49, 86.62, 87.02, 87.35] },
      { time: 88.08, text: 'Pressure pipe buss', words: [88.08, 88.41, 88.74] },
      { time: 89.64, text: 'Tuff gets goin when the goin gets tuff, ahh', words: [89.64, 89.84, 90.16, 90.45, 90.62, 90.78, 91.06, 91.43, 91.75] },
      { time: 92.32, text: 'Time fi every go getta rise up', words: [92.32, 92.65, 92.81, 93.14, 93.43, 93.84, 94.16] },
      { time: 94.9, text: 'Mi wah see every go getta rise up', words: [94.9, 95.06, 95.39, 95.55, 95.84, 96.21, 96.57, 96.85] },
      { time: 97.55, text: 'Pressure pile up, aye when di pressure pipe buss', words: [97.55, 97.92, 98.24, 98.4, 98.57, 98.69, 98.89, 99.18, 99.5] },
      { time: 100.34, text: 'Tuff gets goin when the goin gets tuff, ahh', words: [100.34, 100.71, 100.95, 101.28, 101.44, 101.6, 101.89, 102.26, 102.59] },
      { time: 103.2, text: 'Time fi every go getta rise up', words: [103.2, 103.53, 103.69, 104.01, 104.38, 104.71, 105.03] },
      { time: 105.8, text: 'Mi wah see every go getta rise up', words: [105.8, 105.97, 106.22, 106.42, 106.71, 107.07, 107.4, 108.01] },
      { time: 111.5, text: 'Yuh guh', words: [111.5, 111.66] },
      { time: 113.53, text: 'Seh a my time now', words: [113.53, 113.7, 113.86, 114.55, 115.24] },
      { time: 116.47, text: 'Alexx A-Game a tell every ghetto yute addi right time now', words: [116.47, 116.96, 117.65, 117.85, 117.91, 118.07, 118.36, 118.52, 119.19, 119.89, 120.54] },
      { time: 122.63, text: '♪ Uhhhh ♪', words: [122.63, 124.06, 126.72] },
      { time: 129.42, text: 'HUH!', words: [129.42] },
      { time: 130.4, text: 'Rise up now', words: [130.4, 130.65, 130.89] },
      { time: 131.75, text: 'Rise up now', words: [131.75, 131.99, 132.24] },
      { time: 133.1, text: 'Warn every yute, keep yuh eyes open now', words: [133.1, 133.34, 133.63, 133.99, 134.15, 134.32, 134.64, 134.93] },
      { time: 135.79, text: 'Rise up now', words: [135.79, 136.03, 136.28] },
      { time: 137.05, text: 'Rise up now ', words: [137.05, 137.34, 137.62] },
      { time: 138.47, text: 'Young girl get up and try sumn now ', words: [138.47, 138.8, 139.13, 139.33, 139.5, 139.78, 140.07, 140.36] },
      { time: 141.09, text: 'Rise up now', words: [141.09, 141.38, 141.67] },
      { time: 142.4, text: 'Rise up now', words: [142.4, 142.73, 143.05] },
      { time: 143.79, text: 'Full time Mamma tears dry up now ', words: [143.79, 144.11, 144.44, 144.77, 145.14, 145.47, 145.79] },
      { time: 146.48, text: 'Full time everybody wise up now ', words: [146.48, 146.81, 147.14, 147.83, 148.16, 148.48] },
      { time: 149.21, text: 'Huh! Mek wi rise up now', words: [149.21, 149.58, 149.74, 149.95, 150.24, 150.56] },
      { time: 151.13, text: 'Cause when di pressure pile up', words: [151.13, 151.46, 151.78, 151.95, 152.27, 152.64] },
      { time: 153.34, text: 'Pressure pipe buss', words: [153.34, 153.62, 153.9] },
      { time: 154.77, text: 'Tuff gets goin when the goin gets tuff, ahh', words: [154.77, 155.05, 155.42, 155.75, 155.91, 156.07, 156.36, 156.68, 157.01] },
      { time: 157.59, text: 'Time fi every go getta rise up', words: [157.59, 157.91, 158.11, 158.44, 158.77, 159.17, 159.46] },
      { time: 160.19, text: 'Mi wah see every go getta rise up', words: [160.19, 160.39, 160.68, 160.84, 161.13, 161.49, 161.82, 162.14] },
      { time: 162.84, text: 'Pressure pile up', words: [162.84, 163.16, 163.49] },
      { time: 164.06, text: 'Di pressure pipe buss', words: [164.06, 164.22, 164.5, 164.83] },
      { time: 165.57, text: 'Tuff gets goin when the goin gets tuff, yeah', words: [165.57, 165.89, 166.22, 166.58, 166.75, 166.95, 167.23, 167.56, 169.16] },
      { time: 170.33, text: '♪ Wo wo wo woaa, yea ♪', words: [170.33, 170.53, 170.69, 170.9, 171.18, 171.96, 172.08] },
      { time: 172.86, text: 'Cause when di pressure pile up', words: [172.86, 173.22, 173.55, 173.71, 174.04, 174.4] },
      { time: 175.1, text: 'Pressure pipe buss', words: [175.1, 175.42, 175.75] },
      { time: 176.56, text: 'Tuff gets goin when the goin gets tuff, ahh', words: [176.56, 176.88, 177.17, 177.54, 177.7, 177.86, 178.14, 178.47, 178.84] },
      { time: 179.37, text: 'Time fi every go getta rise up', words: [179.37, 179.69, 179.9, 180.23, 180.55, 180.88, 181.24] },
      { time: 182.02, text: 'Mi wah see every go getta rise up', words: [182.02, 182.18, 182.43, 182.63, 182.92, 183.24, 183.61, 183.89] },
      { time: 184.59, text: 'Pressure pile up', words: [184.59, 184.91, 185.28] },
      { time: 186.26, text: '♪ Woaa wo wooaa, yeaa ♪', words: [186.26, 186.59, 187.28, 187.61, 188.54, 188.97] },
      { time: 189.5, text: 'Hey mi nuh inna no fuss', words: [189.5, 189.7, 189.91, 190.08, 190.4, 190.65] },
      { time: 192.11, text: 'Mi nah sit dung and tun cruff', words: [192.11, 192.32, 192.6, 192.81, 192.97, 193.22, 193.46] },
      { time: 195.05, text: 'Game', words: [195.05] },
    ]
  },
  {
    id: 'go-harda',
    title: 'Go Harda',
    artist: 'Alexx A-Game',
    audioSrc: `${MEDIA_BASE}/${encodeURIComponent('Go Harda.mp3')}`,
    photoSrc: `${MEDIA_BASE}/IMG_2591.jpg`,
    lyrics: [
            { time: 0, text: '♪ Instrumental intro ♪', words: [0, 0.16, 0.53, 0.9] },
      { time: 1.65, text: 'Mmmmm, yeah', words: [1.65, 3.14] },
      { time: 4.87, text: 'HUH!', words: [4.87] },
      { time: 7.3, text: 'Alexx A-Game', words: [7.3, 7.84] },
      { time: 9.89, text: 'Hey mi seh Real & True', words: [9.89, 10.09, 10.26, 10.51, 10.84, 11.13] },
      { time: 15.69, text: 'Mmmmmm', words: [15.69] },
      { time: 17.84, text: 'Yeah', words: [17.84] },
      { time: 19.34, text: 'Mmmmm, yeah', words: [19.34, 20.1] },
      { time: 22.58, text: 'Ouuuu,  yeah (x7),  HUH!', words: [22.58, 24.09, 24.91, 26.55] },
      { time: 28.01, text: 'Some time mi feel like', words: [28.01, 28.22, 28.38, 28.59, 28.87] },
      { time: 29.87, text: 'Seh mi nah do enough', words: [29.87, 30.04, 30.2, 30.49, 30.51] },
      { time: 30.74, text: 'And even though mi done been through enough', words: [30.74, 30.95, 31.27, 31.43, 31.55, 31.92, 32.24, 32.45] },
      { time: 32.92, text: 'I know I got to go harda', words: [32.92, 33.08, 33.29, 33.45, 33.61, 33.82, 34.09] },
      { time: 34.84, text: 'Mmhhm', words: [34.84] },
      { time: 35.99, text: 'Yes I got to go harda', words: [35.99, 36.19, 36.35, 36.6, 36.76, 37.05] },
      { time: 38.39, text: 'Oh lawd, some days mi feel like', words: [38.39, 38.76, 39.09, 39.29, 39.54, 39.7, 39.99] },
      { time: 41.11, text: 'Cyah badda fi get up', words: [41.11, 41.43, 41.84, 42.02, 42.18] },
      { time: 42.47, text: 'Oh God mi feel like give it up', words: [42.47, 42.79, 43.17, 43.33, 43.67, 44.06, 44.22, 44.38] },
      { time: 44.83, text: 'But I got to go harda', words: [44.83, 45, 45.16, 45.4, 45.57, 45.85] },
      { time: 47.69, text: 'Yes I got to go harda', words: [47.69, 47.89, 48.05, 48.3, 48.42, 48.74] },
      { time: 50.95, text: 'When the pressure is on', words: [50.95, 51.15, 51.36, 51.97, 52.34] },
      { time: 53.76, text: 'When the challenges come', words: [53.76, 54.01, 54.21, 55.23] },
      { time: 56.54, text: 'You\'ve got to keep moving on', words: [56.54, 56.74, 56.98, 57.19, 57.51, 58.12] },
      { time: 58.86, text: 'Hold strong', words: [58.86, 59.55] },
      { time: 61.72, text: 'Yeah, yeah, yeah', words: [61.72, 62.58, 63.11] },
      { time: 64.09, text: 'Oi deh bredda man, you got to go harda', words: [64.09, 64.49, 64.65, 64.98, 65.4, 65.56, 65.77, 65.97, 66.3] },
      { time: 67.14, text: 'Hey likkle sister, you fi go harda', words: [67.14, 67.3, 67.63, 68, 68.2, 68.37, 68.7] },
      { time: 69.96, text: 'Listen mumma, you got to go harda', words: [69.96, 70.32, 70.69, 70.86, 71.06, 71.22, 71.55] },
      { time: 72.89, text: 'Oi deh puppa, you got to go harda', words: [72.89, 73.06, 73.22, 73.6, 73.77, 73.97, 74.13, 74.5] },
      { time: 75.85, text: 'And when it ruff, you got to go harda', words: [75.85, 76.01, 76.17, 76.34, 76.58, 76.7, 76.95, 77.07, 77.4] },
      { time: 78.39, text: 'Even when it tuff, you got to go harda', words: [78.39, 78.84, 79.04, 79.2, 79.41, 79.57, 79.78, 79.94, 80.26] },
      { time: 81.61, text: 'Nuh give it up, you got to go harda', words: [81.61, 81.77, 81.97, 82.14, 82.3, 82.46, 82.66, 82.83, 83.24] },
      { time: 84.5, text: 'Jus pick it up, you got to go harda', words: [84.5, 84.66, 84.82, 85.02, 85.23, 85.35, 85.55, 85.72, 86.08] },
      { time: 88.08, text: 'Hey from yuh living', words: [88.08, 88.25, 88.45, 88.65] },
      { time: 89.55, text: 'Yuh know seh pressure muss rise', words: [89.55, 89.75, 89.91, 90.07, 90.44, 90.77] },
      { time: 91.63, text: 'Done tell unuh already pressure buss pipe', words: [91.63, 91.91, 92.08, 92.48, 93.09, 93.45, 93.78] },
      { time: 94.57, text: 'Wata a run yah now it a build up tide', words: [94.57, 95.1, 95.3, 95.49, 95.66, 95.95, 95.86, 96.12, 96.33, 96.69] },
      { time: 97.46, text: 'Nah go guh dung yuh know we a live upright', words: [97.46, 97.78, 97.94, 98.11, 98.44, 98.6, 98.8, 98.97, 99.17, 99.38] },
      { time: 99.98, text: 'When the pressure is on', words: [99.98, 100.31, 100.55, 101.17, 101.49] },
      { time: 102.8, text: 'Hey when the challenges come, yeah', words: [102.8, 103, 103.2, 103.41, 104.39, 104.92] },
      { time: 105.73, text: 'We\'ve go to keep moving on', words: [105.73, 105.89, 106.09, 106.3, 106.63, 107.28] },
      { time: 107.97, text: 'Hold strong', words: [107.97, 108.45] },
      { time: 111.14, text: 'Yeah yeah yeah', words: [111.14, 111.63, 112.12] },
      { time: 113.22, text: 'Oi deh bredda man, you got to go harda', words: [113.22, 113.55, 113.75, 113.94, 114.18, 114.35, 114.51, 114.67, 115] },
      { time: 116.26, text: 'Hey likkle sister, you fi go harda', words: [116.26, 116.47, 116.8, 117.16, 117.37, 117.53, 117.86] },
      { time: 119.13, text: 'And when it ruff, you got to go harda', words: [119.13, 119.33, 119.49, 119.69, 119.86, 120.06, 120.27, 120.43, 120.76] },
      { time: 121.7, text: 'Even when it tuff, you got to go harda', words: [121.7, 122.07, 122.27, 122.44, 122.96, 123.13, 123.33, 123.46, 123.78] },
      { time: 125.04, text: 'Oi juvenile, you got to go harda', words: [125.04, 125.21, 125.81, 125.97, 126.14, 126.3, 126.54] },
      { time: 127.89, text: 'Dweet wid a smile, you got to go harda', words: [127.89, 128.22, 128.38, 128.54, 128.75, 128.91, 129.11, 129.23, 129.6] },
      { time: 130.86, text: 'Oi deh mumma, you got to go harda', words: [130.86, 131.02, 131.27, 131.64, 131.8, 131.96, 132.12, 132.45] },
      { time: 133.76, text: 'Oi deh puppa, you betta go harda', words: [133.76, 133.92, 134.12, 134.45, 134.54, 134.93, 135.29] },
      { time: 136.35, text: 'Go harda', words: [136.35, 136.76] },
      { time: 137.82, text: 'Ain\'t no giving up', words: [137.82, 138.11, 138.36, 138.6] },
      { time: 139.25, text: 'Ain\'t no giving in', words: [139.25, 139.54, 139.82, 140.03] },
      { time: 140.76, text: 'Satan pan me back', words: [140.76, 141.25, 141.37, 141.49] },
      { time: 142.19, text: 'Him can neva win, cah dedication a mi ting', words: [142.19, 142.47, 142.71, 142.92, 143.18, 143.63, 144.41, 144.57, 144.69] },
      { time: 145.42, text: 'Hard work a put in', words: [145.42, 145.67, 145.87, 145.99, 146.11] },
      { time: 146.81, text: 'Daddy seh nutn nuh come easy son, give it your everyting', words: [146.81, 146.93, 147.06, 147.22, 147.38, 147.58, 147.75, 147.95, 148.19, 148.48, 148.68] },
      { time: 149.31, text: 'Suh mi start write songs from within', words: [149.31, 149.47, 149.59, 149.9, 149.97, 150.15, 150.41] },
      { time: 151.32, text: 'Write songs pon riddim', words: [151.32, 151.52, 151.83, 151.96] },
      { time: 152.37, text: 'Sing wah mi live, live wah mi sing', words: [152.37, 152.65, 152.82, 152.78, 153.05, 153.16, 153.32, 153.52] },
      { time: 154.32, text: 'Right vibes man a bring, goin in, goin in, goin in', words: [154.32, 154.59, 154.75, 154.84, 155.01, 155.27, 155.45, 155.7, 155.99, 156.25, 156.47] },
      { time: 157.14, text: 'Nah stop goin in', words: [157.14, 157.39, 157.6, 157.85] },
      { time: 158.71, text: 'Cyah stop goin in, goin in', words: [158.71, 158.91, 159.06, 159.38, 159.6, 159.74] },
      { time: 160.13, text: 'Nah stop till mi win', words: [160.13, 160.34, 160.41, 160.5, 160.72] },
      { time: 160.99, text: 'And when the pressure is on', words: [160.99, 161.18, 161.33, 161.51, 162.26, 162.63] },
      { time: 163.91, text: 'Hey when the challenges come', words: [163.91, 164.11, 164.18, 164.53, 165.47] },
      { time: 167.38, text: 'Keep moving on', words: [167.38, 167.75, 168.49] },
      { time: 169.14, text: 'Hold strong, yeah, yeah, yeah HUH!', words: [169.14, 169.91, 171.26, 172.07, 172.39, 173.37] },
      { time: 173.8, text: 'Oh lawd hear me nuh man, you got to go harda', words: [173.8, 174.09, 174.59, 174.71, 174.72, 175.05, 175.22, 175.47, 175.58, 175.81, 176.16] },
      { time: 177.35, text: 'Hey likkle sister, you fi go harda', words: [177.35, 177.56, 177.83, 178.23, 178.48, 178.65, 179.02] },
      { time: 180.31, text: 'Oi deh mumma, yuh got to go harda', words: [180.31, 180.4, 180.64, 180.97, 181.17, 181.29, 181.41, 181.87] },
      { time: 183.13, text: 'Watch ya pappa, yuh got to go harda', words: [183.13, 183.22, 183.42, 183.99, 184.2, 184.38, 184.57, 184.91] },
      { time: 186.28, text: 'hear me nuh man, yuh got to go harda', words: [186.28, 186.52, 186.65, 186.81, 187.02, 187.13, 187.22, 187.5, 187.91] },
      { time: 189.17, text: 'Got to be strong, yuh got to go harda', words: [189.17, 189.28, 189.51, 189.67, 189.88, 190.03, 190.2, 190.48, 190.76] },
      { time: 192.02, text: 'Yuh cyah go wrong, yuh got to go harda', words: [192.02, 192.19, 192.22, 192.44, 192.64, 192.8, 192.8, 193.16, 193.57] },
      { time: 194.85, text: 'Jus mek a plan, yuh got to go harda', words: [194.85, 194.99, 195.2, 195.37, 195.54, 195.73, 195.9, 196.16, 196.43] },
      { time: 197.35, text: 'Oi A-Game, yuh got to go harda', words: [197.35, 197.76, 198.52, 198.74, 198.92, 199.16, 199.53] },
      { time: 200.79, text: 'Yuh cyah be lame, yuh got to go harda', words: [200.79, 200.95, 201.11, 201.11, 201.44, 201.61, 201.85, 202.02, 202.38] },
      { time: 203.7, text: 'No one to blame, yuh got to go harda', words: [203.7, 203.84, 203.98, 204.18, 204.34, 204.51, 204.71, 204.92, 205.31] },
      { time: 206.65, text: 'Memba yuh aim, yuh got to go harda', words: [206.65, 206.93, 207.17, 207.33, 207.46, 207.65, 207.86, 208.19] },
      { time: 209.46, text: 'Sumn fi gain, yuh got to go harda', words: [209.46, 210.08, 210.13, 210.29, 210.49, 210.59, 210.82, 211.22] },
      { time: 212.42, text: 'All when it rain, yuh got to go harda', words: [212.42, 212.58, 212.66, 212.92, 213.04, 213.26, 213.36, 213.65, 214.01] },
      { time: 215.31, text: 'And through the pain, yuh got to go harda', words: [215.31, 215.46, 215.51, 215.76, 216.02, 216.07, 216.2, 216.54, 216.88] },
      { time: 218.16, text: 'Well all the same, yuh got to go harda', words: [218.16, 218.54, 218.64, 218.76, 218.97, 219.25, 219.33, 219.61, 219.99] },
      { time: 222.52, text: 'Go Harda', words: [222.52, 222.89] },
      { time: 225.45, text: 'Go Harda', words: [225.45, 225.78] },
      { time: 228.3, text: 'Go Harda', words: [228.3, 228.68] },
      { time: 231.2, text: 'Go Harda', words: [231.2, 231.57] },
      { time: 234.06, text: 'Go Harda', words: [234.06, 234.47] },
      { time: 236.98, text: 'Go Harda', words: [236.98, 237.35] },
      { time: 239.87, text: 'Go Harda', words: [239.87, 240.24] },
      { time: 242.8, text: 'Go Harda', words: [242.8, 243.13] },
    ],
  }
];

type Direction = 'next' | 'prev';

const SEEK_STEP = 10; // seconds skipped by the mobile «/» buttons
const TAP_LATENCY = 0.45; // seconds subtracted from each sync tap to offset reaction lag
const LINE_MAX_SECONDS = 6; // longest a single line's fill sweep may take (skip this line if already present)

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

// [start, end] in seconds for each word. Uses line.words when it matches the
// word count; otherwise spreads the line's span across words by character length.
function getWordTimings(line: LyricLine, lineEnd: number): [number, number][] {
  const words = splitWords(line.text);
  let starts: number[];
  if (line.words && line.words.length === words.length) {
    starts = line.words;
  } else {
    const weights = words.map((w) => w.length + 1);
    const total = weights.reduce((a, b) => a + b, 0);
    const span = Math.max(lineEnd - line.time, 0.1);
    let acc = line.time;
    starts = weights.map((wt) => {
      const s = acc;
      acc += (wt / total) * span;
      return s;
    });
  }
  return starts.map((s, i) => [s, starts[i + 1] ?? lineEnd]);
}
// A line starts at its first word tap; `time` is only a fallback for untapped lines
function lineStart(line: LyricLine): number {
  return line.words?.[0] ?? line.time;
}

export default function KaraokePage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [syncEnabled, setSyncEnabled] = useState(false); // true only when URL has ?sync
  const [syncOn, setSyncOn] = useState(false);
  const [syncLine, setSyncLine] = useState(0);
  const [syncTaps, setSyncTaps] = useState<Record<number, number[]>>({});
  const [syncCopied, setSyncCopied] = useState(false);

  const activeSong = SONGS[activeSongIndex];

  // Reset playback state whenever the song changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveIndex(-1);
    setSyncLine(0);
    setSyncTaps({});
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.load();
    }
  }, [activeSongIndex]);

  // Determine which lyric line is active based on currentTime
  useEffect(() => {
    if (syncOn) {
      setActiveIndex(syncLine);
      return;
    }
    let idx = -1;
    for (let i = 0; i < activeSong.lyrics.length; i++) {
      const start = syncTaps[i]?.[0] ?? lineStart(activeSong.lyrics[i]);
      if (currentTime >= start) idx = i;
      else break;
    }
    setActiveIndex(idx);
  }, [currentTime, activeSong, syncOn, syncLine, syncTaps]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeIndex >= 0) {
      lineRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  // Word-by-word fill: sets --p (0–100%) on each word of the active line
  useEffect(() => {
    const audio = audioRef.current;
    const el = activeIndex >= 0 ? lineRefs.current[activeIndex] : null;
    if (!audio || !el) return;

    const base = activeSong.lyrics[activeIndex];
    const words = syncTaps[activeIndex] ?? base.words;
    const line: LyricLine = { ...base, words, time: words?.[0] ?? base.time };
    const nextLine = activeSong.lyrics[activeIndex + 1];
    const next = nextLine ? (syncTaps[activeIndex + 1]?.[0] ?? lineStart(nextLine)) : undefined;
    const rawEnd = next ?? (duration || line.time + LINE_MAX_SECONDS);
    const lineEnd = line.time + Math.min(rawEnd - line.time, LINE_MAX_SECONDS);

    const wordEls = el.querySelectorAll<HTMLElement>('[data-word]');
    const timings = getWordTimings(line, lineEnd);

    let raf = 0;
    const paint = () => {
      const t = audio.currentTime;
      if (syncOn) {
        const taps = syncTaps[activeIndex] ?? [];
        wordEls.forEach((w, i) => {
          const s = taps[i];
          const e = taps[i + 1] ?? (s ?? 0) + 0.5;
          const p = s === undefined ? 0 : Math.min(Math.max((t - s) / Math.max(e - s, 0.05), 0), 1);
          w.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
        });
        if (!audio.paused && !audio.ended) raf = requestAnimationFrame(paint);
        return;
      }
      wordEls.forEach((w, i) => {
        const timing = timings[i];
        if (!timing) return;
        const [s, e] = timing;
        const p = Math.min(Math.max((t - s) / Math.max(e - s, 0.05), 0), 1);
        w.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
      });
      if (!audio.paused && !audio.ended) raf = requestAnimationFrame(paint);
    };
    paint();
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, activeSong, duration, isPlaying, currentTime, syncTaps, syncOn]);

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

  // ── Word-sync recorder (dev tool: open the page with ?sync in the URL) ──
  useEffect(() => {
    setSyncEnabled(new URLSearchParams(window.location.search).has('sync'));
  }, []);

  const syncLineData = activeSong.lyrics[syncLine];
  const syncWords = syncLineData ? splitWords(syncLineData.text) : [];
  const syncDone = syncTaps[syncLine]?.length ?? 0;
  const syncNextWord = syncWords[syncDone] ?? '—';

  function tapWord() {
    const audio = audioRef.current;
    if (!syncOn || !audio || !syncLineData) return;
    const cur = syncTaps[syncLine] ?? [];
    if (cur.length >= syncWords.length) return;
    const t = Number(Math.max(audio.currentTime - TAP_LATENCY, 0).toFixed(2));
    const next = [...cur, t];
    setSyncTaps({ ...syncTaps, [syncLine]: next });
    if (next.length >= syncWords.length && syncLine < activeSong.lyrics.length - 1) {
      setSyncLine(syncLine + 1);
    }
  }

  function undoTap() {
    const cur = syncTaps[syncLine] ?? [];
    if (cur.length > 0) {
      setSyncTaps({ ...syncTaps, [syncLine]: cur.slice(0, -1) });
    } else if (syncLine > 0) {
      const prevCur = syncTaps[syncLine - 1] ?? [];
      setSyncLine(syncLine - 1);
      setSyncTaps({ ...syncTaps, [syncLine - 1]: prevCur.slice(0, -1) });
    }
  }

  function skipLine() {
    setSyncLine(Math.min(syncLine + 1, activeSong.lyrics.length - 1));
  }

  function startLineAt(i: number) {
    const audio = audioRef.current;
    setSyncLine(i);
    setSyncTaps((prev) => ({ ...prev, [i]: [] }));
    if (!audio) return;
    audio.currentTime = Math.max(lineStart(activeSong.lyrics[i]) - 1.5, 0);
    setCurrentTime(audio.currentTime);
    audio.play().catch(() => {});
  }

  function copySync() {
    const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    const rows = activeSong.lyrics.map((l, i) => {
      const tapped = syncTaps[i];
      const w = tapped && tapped.length === splitWords(l.text).length ? tapped : l.words;
      return `      { time: ${w ? w[0] : l.time}, text: ${q(l.text)}${w ? `, words: [${w.join(', ')}]` : ''} },`;
    });
    const out = rows.join('\n');
    navigator.clipboard?.writeText(out).catch(() => {});
    console.log(out);
    setSyncCopied(true);
    setTimeout(() => setSyncCopied(false), 1500);
  }

  // Keyboard: Space = tap word, Backspace = undo, Enter = skip line
  useEffect(() => {
    if (!syncOn) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.blur();
        tapWord();
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        undoTap();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        skipLine();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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
              className={`${styles.lyricLine} ${i === activeIndex ? styles.activeLine : ''} ${syncOn && i === syncLine ? styles.syncTarget : ''}`}
              onClick={() => { if (syncOn) startLineAt(i); }}
            >
              {splitWords(line.text).map((w, wi) => (
                <Fragment key={wi}>
                  {wi > 0 && ' '}
                  <span className={styles.word} data-word>{w}</span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        {syncEnabled && (
          <div className={styles.syncPanel}>
            <button type="button" className={styles.syncBtn} onClick={() => setSyncOn((v) => !v)}>
              SYNC: {syncOn ? 'ON' : 'OFF'}
            </button>
            {syncOn && (
              <>
                <div className={styles.syncInfo}>
                  Line {syncLine + 1}/{activeSong.lyrics.length} · word {syncDone}/{syncWords.length}
                  <br />
                  Next: <strong>{syncNextWord}</strong>
                </div>
                <button
                  type="button"
                  className={styles.syncTap}
                  onPointerDown={(e) => { e.preventDefault(); tapWord(); }}
                >
                  TAP (Space)
                </button>
                <div className={styles.syncRow}>
                  <button type="button" className={styles.syncBtn} onClick={undoTap}>Undo</button>
                  <button type="button" className={styles.syncBtn} onClick={skipLine}>Skip</button>
                  <button type="button" className={styles.syncBtn} onClick={copySync}>
                    {syncCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
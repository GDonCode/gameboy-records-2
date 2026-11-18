// components/shop-scene/spots.ts
// The seven nav containers in the shop. Positions are percentages of the 16:9 stage:
// x = centre (% of width), y = baseline (% of height), w = width (% of width).
// `rise` is how high the items pop, in container-width units (cqw) of the stage.

export type BoxKind = 'crate' | 'case' | 'board' | 'basket';
export type ItemKind = 'shirt' | 'record' | 'ticket' | 'mic' | 'block' | 'photo' | 'bag';

export type Spot = {
  id: string;
  href: string;
  label: string;
  blurb: string;
  kind: BoxKind;
  item: ItemKind;
  x: number;
  y: number;
  w: number;
  aspect: number; // width / height of the art
  rise: number;
  plate: string;
  base: string;
  dark: string;
  accent: string;
  palette: [string, string, string, string, string];
};

export const SPOTS: Spot[] = [
  {
    id: 'merch', href: '/shop', label: 'Merch', blurb: 'Tees · Hoodies · Drops',
    kind: 'crate', item: 'shirt', x: 17, y: 86, w: 14, aspect: 1.05, rise: 9, plate: 'MERCH',
    base: '#b98a52', dark: '#8a6232', accent: '#E2BA0A',
    palette: ['#F5F5F5', '#067F3A', '#E2BA0A', '#1c1b17', '#38B26A'],
  },
  {
    id: 'music', href: '/music', label: 'Music', blurb: 'Releases · Press play',
    kind: 'crate', item: 'record', x: 83, y: 86, w: 14, aspect: 1.2, rise: 9, plate: 'VINYL',
    base: '#2d2d36', dark: '#17171c', accent: '#38B26A',
    palette: ['#E2BA0A', '#38B26A', '#F5F5F5', '#d9503f', '#E2BA0A'],
  },
  {
    id: 'shows', href: '/shows', label: 'Shows', blurb: 'Tour dates · Tickets',
    kind: 'crate', item: 'ticket', x: 19, y: 53, w: 9.5, aspect: 1.15, rise: 6, plate: 'TIX',
    base: '#05652E', dark: '#033d1c', accent: '#E2BA0A',
    palette: ['#E2BA0A', '#F5F5F5', '#E2BA0A', '#F5F5F5', '#E2BA0A'],
  },
  {
    id: 'karaoke', href: '/karaoke', label: 'Karaoke', blurb: 'Grab the mic',
    kind: 'case', item: 'mic', x: 31.5, y: 53, w: 10.5, aspect: 1.1, rise: 6, plate: 'SING',
    base: '#26262e', dark: '#121217', accent: '#E2BA0A',
    palette: ['#E2BA0A', '#38B26A', '#F5F5F5', '#38B26A', '#E2BA0A'],
  },
  {
    id: 'trivia', href: '/trivia', label: 'Trivia', blurb: 'Tricky Tempo · Win points',
    kind: 'crate', item: 'block', x: 68, y: 53, w: 10, aspect: 1.1, rise: 6, plate: '?',
    base: '#c79a05', dark: '#8c6b00', accent: '#0B0A07',
    palette: ['#E2BA0A', '#38B26A', '#E2BA0A', '#38B26A', '#E2BA0A'],
  },
  {
    id: 'about', href: '/about', label: 'About', blurb: 'The label · The founder',
    kind: 'board', item: 'photo', x: 83, y: 44, w: 11.5, aspect: 1.25, rise: 1, plate: '',
    base: '#6b4a2b', dark: '#3f2a16', accent: '#d9503f',
    palette: ['#38B26A', '#E2BA0A', '#d9503f', '#5aa0d9', '#38B26A'],
  },
  {
    id: 'cart', href: '/cart', label: 'Cart', blurb: 'Your bag',
    kind: 'basket', item: 'bag', x: 66, y: 68, w: 8, aspect: 1.15, rise: 6, plate: '',
    base: '#b9874a', dark: '#7d5628', accent: '#E2BA0A',
    palette: ['#067F3A', '#E2BA0A', '#F5F5F5', '#067F3A', '#E2BA0A'],
  },
];

/** Where the spotlight and Alexx's gaze go for a spot (percent of the stage). */
export function focusOf(s: Spot) {
  const h = (s.w / s.aspect) * (16 / 9); // box height as % of stage height
  return { hx: s.x, hy: Math.max(18, s.y - h * 0.9 - s.rise * 0.6), look: Math.max(-1, Math.min(1, (s.x - 50) / 40)) };
}

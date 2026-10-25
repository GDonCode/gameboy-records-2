// lib/trivia-bank.ts
//
// Server-only: holds the question bank AND its answers.
// NEVER import this file into a Client Component, or every answer ships to the browser.
//
// Every fact below was checked against the site's own copy (app/page.tsx, app/karaoke/page.tsx)
// or a published source (Reggaeville, Mixmag, Dancehallmag). Add more questions to the
// arrays at the bottom of each section; the game builds itself from whatever is here.

import type { PublicQuestion, TriviaKind, TriviaOption } from '@/lib/trivia-types';
import { ROUND_SIZES } from '@/lib/trivia-types';

export interface BankQuestion extends PublicQuestion {
  /** Original option ids (not display positions). One id for 'single', the full sequence for 'order'. */
  answer: string[];
}

const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;
void MEDIA_BASE; // used by the cover questions once you add them (see COVER_QUESTIONS)

// ── Builders ──────────────────────────────────────────────────────────────────

/** Four-option text question. The first label is the correct one; display order is shuffled per game. */
function textQ(
  id: string,
  kind: TriviaKind,
  prompt: string,
  correct: string,
  wrong: [string, string, string],
  speak?: string
): BankQuestion {
  const options: TriviaOption[] = [correct, ...wrong].map((label, i) => ({ id: 'abcd'[i], label }));
  return { id, kind, mode: 'single', prompt, speak, options, answer: ['a'] };
}

const VIDEO_TITLES = ['Rise Up Now (Guitar Version)', 'Still A Rise', 'More Life', 'Go Harda'];

/** "Which music video is this screenshot from?" using a YouTube auto-captured frame (1, 2 or 3). */
function videoQ(id: string, youtubeId: string, frame: 1 | 2 | 3, correctTitle: string): BankQuestion {
  const options: TriviaOption[] = VIDEO_TITLES.map((label, i) => ({ id: `o${i}`, label }));
  return {
    id,
    kind: 'video',
    mode: 'single',
    prompt: 'Which music video is this screenshot from?',
    image: `https://img.youtube.com/vi/${youtubeId}/${frame}.jpg`,
    options,
    answer: [`o${VIDEO_TITLES.indexOf(correctTitle)}`],
  };
}

// ── Finish the lyric (lines verified against app/karaoke/page.tsx) ───────────

const LYRIC_QUESTIONS: BankQuestion[] = [
  textQ('ly-1', 'lyric', 'Finish the lyric: “Champagne fi mi real friends”',
    'Real pain fi mi sham friends',
    ['Mek a toast to di one dem', 'Weh a roll like a tandem', 'Stay close to mi fam dem']),
  textQ('ly-2', 'lyric', 'Finish the lyric: “Through the rain and fire”',
    'By Mama answered prayer',
    ['Wi still a rise', 'Ketch dem by surprise seh', 'Through di pain and struggle']),
  textQ('ly-3', 'lyric', 'Finish the lyric: “When the pressure is on”',
    'When the challenges come',
    ['You\'ve got to keep moving on', 'Hold strong', 'Yeah, yeah, yeah']),
  textQ('ly-4', 'lyric', 'Finish the lyric: “Cause when di pressure pile up”',
    'Pressure pipe buss',
    ['Time fi every go getta rise up', 'Mi wah see every go getta rise up', 'Tuff gets goin when the goin gets tuff']),
];

// ── Biography ────────────────────────────────────────────────────────────────

const BIO_QUESTIONS: BankQuestion[] = [
  textQ('bio-1', 'bio', 'Where did Alexx A-Game grow up?',
    'Discovery Bay, St. Ann',
    ['Negril, Westmoreland', 'Montego Bay, St. James', 'Portmore, St. Catherine']),
  textQ('bio-2', 'bio', 'What is Alexx A-Game’s birth name?',
    'Alex Gallimore',
    ['Alexander Gayle', 'Alex Campbell', 'Alexis Gordon']),
  textQ('bio-3', 'bio', 'Where does the stage name “A-Game” come from?',
    'His constant use of the slang “a-game”',
    ['A football team he played for', 'A nickname from his teachers', 'A video game he loved']),
  textQ('bio-4', 'bio', 'Which band was he lead singer of before going solo?',
    'Di Blueprint',
    ['Raging Fyah', 'Morgan Heritage', 'Third World']),
  textQ('bio-5', 'bio', 'Which performing arts school did he attend?',
    'Edna Manley School of Performing Arts',
    ['Alpha Institute', 'Vere Technical High School', 'Campion College']),
];

// ── Discography details ──────────────────────────────────────────────────────

const DISCOGRAPHY_QUESTIONS: BankQuestion[] = [
  textQ('di-1', 'discography', 'Who produced his 2014 single “A-Game Everyday”?',
    'Vern Hill',
    ['Dave Kelly', 'Stephen McGregor', 'Sly & Robbie']),
  textQ('di-2', 'discography', 'Which Manchester label released the “Braver” 7-inch in 2017?',
    'Swing Ting',
    ['Greensleeves', 'VP Records', 'Hyperdub']),
  textQ('di-3', 'discography', 'Which single was produced by Vern Hill and Elly B?',
    'No Time Fi Badmind',
    ['A-Game Everyday', 'Braver', 'We Goin Hard']),
  textQ('di-4', 'discography', '“We Goin Hard” appeared on which riddim?',
    'Kingston 8 Riddim',
    ['Drop Leaf Riddim', 'Stalag Riddim', 'Real Rock Riddim']),
  textQ('di-5', 'discography', 'Who is featured with him on “Chuck It”?',
    'Ding Dong',
    ['Popcaan', 'Masicka', 'Skillibeng']),
];

// ── Third-party media appearances ────────────────────────────────────────────

const MEDIA_QUESTIONS: BankQuestion[] = [
  textQ('me-1', 'media', 'Which music legend did he play in Bob Marley: One Love?',
    'Peter Tosh',
    ['Bunny Wailer', 'Jacob Miller', 'Lee “Scratch” Perry']),
  textQ('me-2', 'media', 'Which studio made Bob Marley: One Love?',
    'Paramount Pictures',
    ['Universal Pictures', 'Warner Bros.', 'Sony Pictures']),
  textQ('me-3', 'media', 'In what year did Bob Marley: One Love reach theaters?',
    '2024',
    ['2022', '2023', '2025']),
  textQ('me-4', 'media', 'Which artist invited him on the Capture Land Jamaica Tour?',
    'Chronixx',
    ['Protoje', 'Koffee', 'Kabaka Pyramid']),
  textQ('me-5', 'media', 'Which BBC Radio 1 presenter interviewed him?',
    'Huw Stephens',
    ['Greg James', 'Annie Mac', 'Nick Grimshaw']),
  textQ('me-6', 'media', 'Who joined him for his BBC 1Xtra freestyle in Jamaica?',
    'Seani B',
    ['Tim Westwood', 'DJ Target', 'Charlie Sloth']),
];

// ── Release order ────────────────────────────────────────────────────────────

const ORDER_QUESTIONS: BankQuestion[] = [
  {
    id: 'or-1',
    kind: 'order',
    mode: 'order',
    prompt: 'Tap these releases in the order they came out, earliest first.',
    options: [
      { id: 'a', label: 'A-Game Everyday' },
      { id: 'b', label: 'No Time Fi Badmind' },
      { id: 'c', label: 'Braver (Swing Ting Edits)' },
    ],
    answer: ['a', 'b', 'c'], // 2014, 2015, 2017
  },
];

// ── Music-video screenshots ──────────────────────────────────────────────────
// Frames come from YouTube's auto-captured thumbnails (120×90, blurry when enlarged).
// For sharper questions, upload real screenshots to the Supabase `media` bucket under
// trivia/ and point `image` at `${MEDIA_BASE}/trivia/<file>.jpg`.

const VIDEO_QUESTIONS: BankQuestion[] = [
  videoQ('vi-1', 'etLGFz3dtsM', 1, 'Rise Up Now (Guitar Version)'),
  videoQ('vi-2', 'BhKt3DVRRkw', 2, 'Still A Rise'),
  videoQ('vi-3', 'etLGFz3dtsM', 3, 'Rise Up Now (Guitar Version)'),
  videoQ('vi-4', 'BhKt3DVRRkw', 1, 'Still A Rise'),
];

// ── Match the song to its cover ──────────────────────────────────────────────
// Empty until real cover art is uploaded. Example entry (options are image-only):
//
//   {
//     id: 'cv-1', kind: 'cover', mode: 'single',
//     prompt: 'Which cover belongs to “Still A Rise”?',
//     options: [
//       { id: 'a', image: `${MEDIA_BASE}/trivia/covers/still-a-rise.jpg` },   // correct
//       { id: 'b', image: `${MEDIA_BASE}/trivia/covers/more-life.jpg` },
//       { id: 'c', image: `${MEDIA_BASE}/trivia/covers/go-harda.jpg` },
//       { id: 'd', image: `${MEDIA_BASE}/trivia/covers/rise-up-now.jpg` },
//     ],
//     answer: ['a'],
//   },
//
// Until this has entries, round 3's "cover" slot is filled with a video question instead.

const COVER_QUESTIONS: BankQuestion[] = [];

// ── Bank + game plan ─────────────────────────────────────────────────────────

const BANK: BankQuestion[] = [
  ...LYRIC_QUESTIONS,
  ...BIO_QUESTIONS,
  ...DISCOGRAPHY_QUESTIONS,
  ...MEDIA_QUESTIONS,
  ...ORDER_QUESTIONS,
  ...VIDEO_QUESTIONS,
  ...COVER_QUESTIONS,
];

const BANK_BY_ID = new Map(BANK.map((q) => [q.id, q] as const));
if (BANK_BY_ID.size !== BANK.length) throw new Error('Trivia bank has duplicate question ids.');

const TEXT_KINDS: TriviaKind[] = ['lyric', 'bio', 'discography', 'media', 'order'];
const VISUAL_KINDS: TriviaKind[] = ['video', 'cover'];

// One entry per question slot. Each plan's length must equal the matching ROUND_SIZES entry.
const ROUND_PLANS: TriviaKind[][] = [
  ['lyric', 'bio', 'discography', 'media', 'order', 'lyric'],
  ['lyric', 'bio', 'discography', 'media', 'discography', 'media'],
  ['video', 'cover', 'video'],
];
ROUND_PLANS.forEach((plan, i) => {
  if (plan.length !== ROUND_SIZES[i]) throw new Error(`Trivia round ${i + 1} plan does not match ROUND_SIZES.`);
});

/** Picks the question ids for one game, in play order. Throws if the bank is too small. */
export function pickGameQuestionIds(): string[] {
  const used = new Set<string>();
  const ids: string[] = [];

  ROUND_PLANS.forEach((plan, round) => {
    const fallbackKinds = round === ROUND_PLANS.length - 1 ? VISUAL_KINDS : TEXT_KINDS;
    for (const kind of plan) {
      let candidates = BANK.filter((q) => q.kind === kind && !used.has(q.id));
      if (candidates.length === 0) {
        candidates = BANK.filter((q) => fallbackKinds.includes(q.kind) && !used.has(q.id));
      }
      if (candidates.length === 0) throw new Error(`Trivia bank is too small for round ${round + 1}.`);
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      used.add(pick.id);
      ids.push(pick.id);
    }
  });

  return ids;
}

export function getBankQuestion(id: string): BankQuestion | undefined {
  return BANK_BY_ID.get(id);
}

/** Every image URL used by the given questions, for client-side preloading. */
export function imagesFor(ids: string[]): string[] {
  const urls = new Set<string>();
  for (const id of ids) {
    const q = BANK_BY_ID.get(id);
    if (!q) continue;
    if (q.image) urls.add(q.image);
    for (const o of q.options) if (o.image) urls.add(o.image);
  }
  return [...urls];
}

// ── Per-game option shuffle ──────────────────────────────────────────────────
// Options are shuffled with a seed (game id + question id) so the order is stable across
// page refreshes. The client only ever sees positions ('0', '1', ...), never the original
// ids, so the correct option can't be guessed from its id.

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const rand = mulberry32(hashSeed(seed));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The question as the browser sees it: no answer, options shuffled and re-labelled by position. */
export function toPublicQuestion(q: BankQuestion, seed: string): PublicQuestion {
  const shown = seededShuffle(q.options, seed);
  return {
    id: q.id,
    kind: q.kind,
    mode: q.mode,
    prompt: q.prompt,
    speak: q.speak,
    image: q.image,
    options: shown.map((o, i) => ({ id: String(i), label: o.label, image: o.image })),
  };
}

export interface GradeResult {
  valid: boolean;
  correct: boolean;
  /** Display positions of the right answer, in order. */
  correctChoice: string[];
}

/**
 * Grades a submitted choice (display positions). An empty choice is a valid "no answer"
 * (the client sends it when the clock runs out) and always counts as wrong.
 */
export function gradeChoice(q: BankQuestion, seed: string, choice: unknown): GradeResult {
  const shown = seededShuffle(q.options, seed);
  const correctChoice = q.answer.map((id) => String(shown.findIndex((o) => o.id === id)));

  if (!Array.isArray(choice) || !choice.every((c) => typeof c === 'string')) {
    return { valid: false, correct: false, correctChoice };
  }
  if (choice.length === 0) return { valid: true, correct: false, correctChoice };

  const positions = choice as string[];
  const inRange = positions.every((p) => /^\d+$/.test(p) && Number(p) < shown.length);
  const unique = new Set(positions).size === positions.length;
  const expectedLength = q.mode === 'order' ? shown.length : 1;
  if (!inRange || !unique || positions.length !== expectedLength) {
    return { valid: false, correct: false, correctChoice };
  }

  const pickedIds = positions.map((p) => shown[Number(p)].id);
  const correct = pickedIds.length === q.answer.length && pickedIds.every((id, i) => id === q.answer[i]);
  return { valid: true, correct, correctChoice };
}

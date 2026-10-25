// lib/trivia-types.ts
// Shared (client + server) types and constants for Tricky Tempo Trivia.
// Nothing in here reveals an answer, so it is safe to import from Client Components.

export type TriviaKind = 'lyric' | 'video' | 'bio' | 'discography' | 'media' | 'order' | 'cover';

/** 'single' = tap one option. 'order' = tap every option in sequence, earliest first. */
export type TriviaMode = 'single' | 'order';

export interface TriviaOption {
  id: string;
  label?: string;
  image?: string;
}

export interface PublicQuestion {
  id: string;
  kind: TriviaKind;
  mode: TriviaMode;
  prompt: string;
  /** Optional spoken version of the prompt, when the written one reads badly aloud. */
  speak?: string;
  image?: string;
  options: TriviaOption[];
}

export const QUESTION_TIME_MS = 10_000;
export const ROUND_SIZES = [6, 6, 3] as const;
export const ROUND_TITLES = ['ROUND 1', 'ROUND 2', 'ROUND 3 · VISUAL'] as const;
export const TOTAL_QUESTIONS = ROUND_SIZES.reduce((a, b) => a + b, 0);

export const BASE_POINTS = 100;
export const MAX_TIME_BONUS = 50;
export const MAX_GAME_SCORE = TOTAL_QUESTIONS * (BASE_POINTS + MAX_TIME_BONUS);

/** Maps a 0-based question index to its round. */
export function locateQuestion(index: number): { round: number; indexInRound: number; roundSize: number } {
  let start = 0;
  for (let round = 0; round < ROUND_SIZES.length; round++) {
    const size = ROUND_SIZES[round];
    if (index < start + size) return { round, indexInRound: index - start, roundSize: size };
    start += size;
  }
  const last = ROUND_SIZES.length - 1;
  return { round: last, indexInRound: ROUND_SIZES[last] - 1, roundSize: ROUND_SIZES[last] };
}

export interface TriviaStartResponse {
  gameId: string;
  total: number;
  /** Image URLs for the visual questions, so the browser can cache them before the clock runs. */
  preload: string[];
}

export interface TriviaNextResponse {
  done: false;
  index: number;
  round: number;
  indexInRound: number;
  roundSize: number;
  /** Time already spent on this question (non-zero only if the page was refreshed mid-question). */
  elapsedMs: number;
  question: PublicQuestion;
}

export interface TriviaDoneResponse {
  done: true;
  score: number;
  correctCount: number;
}

export interface TriviaAnswerResult {
  correct: boolean;
  timedOut: boolean;
  /** Option ids (positions) of the right answer, in order. */
  correctChoice: string[];
  points: number;
  score: number;
  correctCount: number;
  finished: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isYou: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  you: { best: number; rank: number } | null;
}

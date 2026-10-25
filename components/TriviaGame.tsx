'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  MAX_GAME_SCORE,
  QUESTION_TIME_MS,
  ROUND_SIZES,
  ROUND_TITLES,
  TOTAL_QUESTIONS,
  type LeaderboardResponse,
  type PublicQuestion,
  type TriviaAnswerResult,
  type TriviaDoneResponse,
  type TriviaNextResponse,
  type TriviaStartResponse,
} from '@/lib/trivia-types';
import {
  playCorrect,
  playTick,
  playTimeUp,
  playWrong,
  setMuted,
  speak,
  stopSpeaking,
  unlockAudio,
} from '@/lib/trivia-audio';

const FONT = "'Poppins', monospace";
const FONT_BOLD = "'Poppins_semibold', monospace";
const LETTERS = ['A', 'B', 'C', 'D'];

const TICK_FROM_SECONDS = 5; // audible tick each second once this many seconds remain
const FEEDBACK_MS = 2200; // how long the right answer stays on screen
const ROUND_STARTS = ROUND_SIZES.reduce<number[]>((acc, size, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + ROUND_SIZES[i - 1]);
  void size;
  return acc;
}, []);

type Phase = 'intro' | 'starting' | 'roundIntro' | 'question' | 'feedback' | 'final' | 'error';

interface QuestionInfo {
  index: number;
  round: number;
  indexInRound: number;
  roundSize: number;
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'Something went wrong.');
  return data as T;
}

function buildSpeech(q: PublicQuestion): string {
  const base = q.speak ?? q.prompt;
  const labelled = q.options.every((o) => o.label);
  if (!labelled) return base;
  return `${base}. ${q.options.map((o, i) => `${LETTERS[i]}. ${o.label}`).join('. ')}`;
}

function CountdownRing({ msLeft }: { msLeft: number }) {
  const seconds = Math.ceil(msLeft / 1000);
  const fraction = Math.max(0, Math.min(1, msLeft / QUESTION_TIME_MS));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const urgent = seconds <= 3;
  return (
    <div className="relative h-[84px] w-[84px] flex-shrink-0" role="timer" aria-label={`${seconds} seconds left`}>
      <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(77,255,145,0.15)" strokeWidth="6" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke={urgent ? '#ff5a5a' : '#4dff91'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-3xl ${urgent ? 'animate-pulse' : ''}`}
        style={{ fontFamily: FONT_BOLD, color: urgent ? '#ff5a5a' : '#4dff91' }}
      >
        {seconds}
      </span>
    </div>
  );
}

function Leaderboard({ reloadKey }: { reloadKey: number }) {
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/trivia/leaderboard')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('bad response'))))
      .then((data: LeaderboardResponse) => {
        if (!cancelled) {
          setBoard(data);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="w-full border border-[#1a9e4a]/30 bg-[#0c1510]/70 p-4">
      <h2
        className="mb-3 text-center text-sm tracking-[0.25em] text-[#4dff91]"
        style={{ fontFamily: FONT_BOLD }}
      >
        LEADERBOARD
      </h2>
      {failed && <p className="text-center text-xs text-white/60">Couldn’t load the leaderboard.</p>}
      {!failed && !board && <p className="text-center text-xs text-white/60">Loading…</p>}
      {board && board.entries.length === 0 && (
        <p className="text-center text-xs text-white/60">No scores yet. Be the first.</p>
      )}
      {board && board.entries.length > 0 && (
        <ol className="m-0 flex list-none flex-col gap-1 p-0">
          {board.entries.map((e, i) => (
            <li
              key={`${e.rank}-${e.name}-${i}`}
              className="flex items-center gap-3 px-3 py-1.5 text-sm"
              style={{
                fontFamily: FONT,
                color: e.isYou ? '#0c1510' : '#FEFEFA',
                background: e.isYou ? '#4dff91' : 'transparent',
              }}
            >
              <span className="w-6 text-right opacity-70">{e.rank}</span>
              <span className="flex-1 truncate">{e.name}</span>
              <span style={{ fontFamily: FONT_BOLD }}>{e.score}</span>
            </li>
          ))}
        </ol>
      )}
      {board?.you && !board.entries.some((e) => e.isYou) && (
        <p className="mt-3 text-center text-xs text-white/70" style={{ fontFamily: FONT }}>
          Your best: {board.you.best} (rank {board.you.rank})
        </p>
      )}
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '0.9em',
  letterSpacing: '0.12em',
  color: '#fff',
  padding: '12px 32px',
  borderRadius: '999px',
  border: '1px solid #1a9e4a',
  background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)',
  cursor: 'pointer',
};

export default function TriviaGame() {
  const { status } = useSession();

  const [phase, setPhase] = useState<Phase>('intro');
  const [errorMsg, setErrorMsg] = useState('');
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [info, setInfo] = useState<QuestionInfo>({ index: 0, round: 0, indexInRound: 0, roundSize: ROUND_SIZES[0] });
  const [upcomingRound, setUpcomingRound] = useState(0);
  const [msLeft, setMsLeft] = useState(QUESTION_TIME_MS);
  const [picked, setPicked] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TriviaAnswerResult | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [boardKey, setBoardKey] = useState(0);

  const gameIdRef = useRef<string | null>(null);
  const questionRef = useRef<PublicQuestion | null>(null);
  const infoRef = useRef<QuestionInfo>(info);
  const lockedRef = useRef(true);
  const pickedRef = useRef<string[]>([]);
  const deadlineRef = useRef(0);
  const lastTickSecRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const submitRef = useRef<(choice: string[]) => void>(() => {});
  const advanceRef = useRef<(finished: boolean) => void>(() => {});

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fail = useCallback((message: string) => {
    clearTimer();
    stopSpeaking();
    setErrorMsg(message);
    setPhase('error');
  }, [clearTimer]);

  const startTimer = useCallback((elapsedMs: number) => {
    clearTimer();
    deadlineRef.current = performance.now() + (QUESTION_TIME_MS - elapsedMs);
    lastTickSecRef.current = Math.ceil((QUESTION_TIME_MS - elapsedMs) / 1000);
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, deadlineRef.current - performance.now());
      setMsLeft(left);
      const sec = Math.ceil(left / 1000);
      if (sec !== lastTickSecRef.current) {
        lastTickSecRef.current = sec;
        if (sec > 0 && sec <= TICK_FROM_SECONDS) playTick(sec);
      }
      if (left <= 0) {
        clearTimer();
        submitRef.current([]);
      }
    }, 100);
  }, [clearTimer]);

  const loadNext = useCallback(async () => {
    const gameId = gameIdRef.current;
    if (!gameId) return;
    try {
      const data = await postJson<TriviaNextResponse | TriviaDoneResponse>('/api/trivia/next', { gameId });
      if (data.done) {
        setScore(data.score);
        setCorrectCount(data.correctCount);
        setBoardKey((k) => k + 1);
        setPhase('final');
        return;
      }
      const nextInfo: QuestionInfo = {
        index: data.index,
        round: data.round,
        indexInRound: data.indexInRound,
        roundSize: data.roundSize,
      };
      questionRef.current = data.question;
      infoRef.current = nextInfo;
      pickedRef.current = [];
      lockedRef.current = false;
      setQuestion(data.question);
      setInfo(nextInfo);
      setPicked([]);
      setChosen([]);
      setResult(null);
      setMsLeft(Math.max(0, QUESTION_TIME_MS - data.elapsedMs));
      setPhase('question');
      // The clock and the reading begin together.
      startTimer(data.elapsedMs);
      speak(buildSpeech(data.question));
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not load the next question.');
    }
  }, [fail, startTimer]);

  const advance = useCallback((finished: boolean) => {
    if (finished) {
      setBoardKey((k) => k + 1);
      setPhase('final');
      return;
    }
    const nextIndex = infoRef.current.index + 1;
    const roundIdx = ROUND_STARTS.indexOf(nextIndex);
    if (roundIdx !== -1) {
      setUpcomingRound(roundIdx);
      setPhase('roundIntro');
      return;
    }
    void loadNext();
  }, [loadNext]);

  const submit = useCallback(async (choice: string[]) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    clearTimer();
    stopSpeaking();
    setChosen(choice);
    setSubmitting(true);
    if (choice.length === 0) playTimeUp();
    try {
      const data = await postJson<TriviaAnswerResult>('/api/trivia/answer', {
        gameId: gameIdRef.current,
        choice,
      });
      setResult(data);
      setScore(data.score);
      setCorrectCount(data.correctCount);
      if (data.correct) playCorrect();
      else if (choice.length > 0) playWrong();
      setPhase('feedback');
      feedbackTimerRef.current = window.setTimeout(() => advanceRef.current(data.finished), FEEDBACK_MS);
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not save your answer.');
    } finally {
      setSubmitting(false);
    }
  }, [clearTimer, fail]);

  useEffect(() => {
    submitRef.current = (choice) => void submit(choice);
    advanceRef.current = advance;
  }, [submit, advance]);

  const choose = useCallback((optionId: string) => {
    const q = questionRef.current;
    if (!q || lockedRef.current) return;
    if (q.mode === 'single') {
      void submit([optionId]);
      return;
    }
    if (pickedRef.current.includes(optionId)) return;
    pickedRef.current = [...pickedRef.current, optionId];
    setPicked(pickedRef.current);
    if (pickedRef.current.length === q.options.length) void submit(pickedRef.current);
  }, [submit]);

  const undoPick = useCallback(() => {
    if (lockedRef.current) return;
    pickedRef.current = pickedRef.current.slice(0, -1);
    setPicked(pickedRef.current);
  }, []);

  const startGame = useCallback(async () => {
    unlockAudio();
    setPhase('starting');
    try {
      const data = await postJson<TriviaStartResponse>('/api/trivia/start');
      gameIdRef.current = data.gameId;
      data.preload.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
      setScore(0);
      setCorrectCount(0);
      setUpcomingRound(0);
      setPhase('roundIntro');
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not start a game.');
    }
  }, [fail]);

  const startRound = useCallback(() => {
    unlockAudio();
    void loadNext();
  }, [loadNext]);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
  }, []);

  // Keyboard: 1-4 or A-D picks the matching option.
  useEffect(() => {
    if (phase !== 'question') return;
    function onKeyDown(e: KeyboardEvent) {
      const q = questionRef.current;
      if (!q) return;
      const key = e.key.toUpperCase();
      const idx = /^[1-4]$/.test(key) ? Number(key) - 1 : LETTERS.indexOf(key);
      if (idx >= 0 && idx < q.options.length) choose(q.options[idx].id);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, choose]);

  // Stop everything if the player leaves mid-question.
  useEffect(() => {
    return () => {
      clearTimer();
      stopSpeaking();
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    };
  }, [clearTimer]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const wrap = 'flex w-full max-w-[560px] flex-col items-center gap-5 px-4';

  if (phase === 'intro' || phase === 'starting') {
    const signedIn = status === 'authenticated';
    return (
      <div className={wrap}>
        <div className="w-full border border-[#1a9e4a]/30 bg-[#0c1510]/70 p-5 text-center">
          <p className="text-sm leading-relaxed text-white/80" style={{ fontFamily: FONT }}>
            {ROUND_SIZES.length} rounds, {TOTAL_QUESTIONS} questions, 10 seconds each. Every question is read aloud,
            and the clock starts the moment the reading does. Turn your sound on.
          </p>
          <ul className="mx-auto mt-3 max-w-[360px] list-none p-0 text-left text-xs leading-6 text-white/60" style={{ fontFamily: FONT }}>
            <li>Rounds 1 &amp; 2: six questions each</li>
            <li>Round 3: three visual questions</li>
            <li>Faster correct answers score more (up to {MAX_GAME_SCORE} total)</li>
          </ul>
          <div className="mt-5">
            {status === 'loading' && <span className="text-xs text-white/60">Loading…</span>}
            {status === 'unauthenticated' && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-white/70" style={{ fontFamily: FONT }}>Sign in to play and join the leaderboard.</p>
                <Link href="/account/login" style={{ ...primaryButton, textDecoration: 'none' }}>SIGN IN</Link>
              </div>
            )}
            {signedIn && (
              <button
                type="button"
                onClick={startGame}
                disabled={phase === 'starting'}
                style={{ ...primaryButton, opacity: phase === 'starting' ? 0.6 : 1, cursor: phase === 'starting' ? 'not-allowed' : 'pointer' }}
              >
                {phase === 'starting' ? 'LOADING…' : 'START GAME'}
              </button>
            )}
          </div>
        </div>
        <Leaderboard reloadKey={boardKey} />
      </div>
    );
  }

  if (phase === 'roundIntro') {
    return (
      <div className={wrap}>
        <div className="w-full border border-[#1a9e4a]/30 bg-[#0c1510]/70 p-8 text-center">
          <h2 className="text-2xl tracking-[0.2em] text-[#4dff91]" style={{ fontFamily: FONT_BOLD }}>
            {ROUND_TITLES[upcomingRound]}
          </h2>
          <p className="mt-2 text-sm text-white/70" style={{ fontFamily: FONT }}>
            {ROUND_SIZES[upcomingRound]} questions · 10 seconds each
          </p>
          {upcomingRound > 0 && (
            <p className="mt-2 text-sm text-white/70" style={{ fontFamily: FONT }}>Score so far: {score}</p>
          )}
          <button type="button" onClick={startRound} className="mt-6" style={primaryButton}>
            {upcomingRound === 0 ? 'GO' : 'START ROUND'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className={wrap}>
        <div className="w-full border border-red-500/40 bg-[#0c1510]/70 p-6 text-center">
          <p className="text-sm text-white/80" style={{ fontFamily: FONT }}>{errorMsg}</p>
          <button
            type="button"
            className="mt-4"
            style={primaryButton}
            onClick={() => {
              stopSpeaking();
              setPhase('intro');
            }}
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'final') {
    return (
      <div className={wrap}>
        <div className="w-full border border-[#1a9e4a]/30 bg-[#0c1510]/70 p-6 text-center">
          <h2 className="text-sm tracking-[0.25em] text-[#4dff91]" style={{ fontFamily: FONT_BOLD }}>FINAL SCORE</h2>
          <p className="mt-2 text-5xl text-[#FEFEFA]" style={{ fontFamily: FONT_BOLD }}>{score}</p>
          <p className="mt-1 text-sm text-white/70" style={{ fontFamily: FONT }}>
            {correctCount} of {TOTAL_QUESTIONS} correct
          </p>
          <button type="button" onClick={startGame} className="mt-5" style={primaryButton}>PLAY AGAIN</button>
        </div>
        <Leaderboard reloadKey={boardKey} />
      </div>
    );
  }

  // phase === 'question' | 'feedback'
  if (!question) return null;
  const inFeedback = phase === 'feedback' && result !== null;
  const isOrder = question.mode === 'order';
  const imageOptions = question.options.every((o) => o.image && !o.label);

  return (
    <div className={wrap}>
      <div className="flex w-full items-center justify-between gap-3">
        <div style={{ fontFamily: FONT }}>
          <div className="text-xs tracking-[0.2em] text-[#4dff91]">{ROUND_TITLES[info.round]}</div>
          <div className="text-xs text-white/60">
            Question {info.indexInRound + 1} of {info.roundSize}
          </div>
        </div>
        <CountdownRing msLeft={inFeedback ? 0 : msLeft} />
        <div className="text-right" style={{ fontFamily: FONT }}>
          <div className="text-xs tracking-[0.2em] text-[#4dff91]">SCORE</div>
          <div className="text-xl text-[#FEFEFA]" style={{ fontFamily: FONT_BOLD }}>{score}</div>
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            className="text-xs text-white/60 underline"
          >
            {muted ? 'Sound off' : 'Sound on'}
          </button>
        </div>
      </div>

      <div className="w-full border border-[#1a9e4a]/30 bg-[#0c1510]/70 p-5">
        {question.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.image}
            alt="Music video screenshot"
            className="mx-auto mb-4 w-full max-w-[420px] border border-[#1a9e4a]/40 object-cover"
            style={{ aspectRatio: '4 / 3' }}
          />
        )}
        <p className="text-center text-base leading-snug text-[#FEFEFA]" style={{ fontFamily: FONT_BOLD }}>
          {question.prompt}
        </p>
        {inFeedback && (
          <p
            className="mt-3 text-center text-sm"
            style={{ fontFamily: FONT_BOLD, color: result.correct ? '#4dff91' : '#ff5a5a' }}
          >
            {result.timedOut || chosen.length === 0
              ? 'TIME’S UP'
              : result.correct
                ? `CORRECT +${result.points}`
                : 'NOT QUITE'}
          </p>
        )}
      </div>

      <div className={`grid w-full gap-3 ${imageOptions ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {question.options.map((option, i) => {
          const orderPos = isOrder ? picked.indexOf(option.id) : -1;
          const correctPos = result ? result.correctChoice.indexOf(option.id) : -1;
          const chosenPos = chosen.indexOf(option.id);

          let border = 'rgba(26,158,74,0.4)';
          let background = 'rgba(12,21,16,0.8)';
          if (inFeedback) {
            if (isOrder) {
              const right = chosenPos !== -1 && chosenPos === correctPos;
              border = right ? '#4dff91' : '#ff5a5a';
              background = right ? 'rgba(77,255,145,0.15)' : 'rgba(255,90,90,0.12)';
            } else if (correctPos !== -1) {
              border = '#4dff91';
              background = 'rgba(77,255,145,0.18)';
            } else if (chosenPos !== -1) {
              border = '#ff5a5a';
              background = 'rgba(255,90,90,0.12)';
            }
          } else if (orderPos !== -1) {
            border = '#4dff91';
            background = 'rgba(77,255,145,0.1)';
          }

          const badge = inFeedback && isOrder ? correctPos : orderPos;

          return (
            <button
              key={option.id}
              type="button"
              disabled={submitting || phase !== 'question' || orderPos !== -1}
              onClick={() => choose(option.id)}
              className="relative flex items-center gap-3 p-3 text-left transition-colors"
              style={{
                fontFamily: FONT,
                color: '#FEFEFA',
                border: `2px solid ${border}`,
                background,
                cursor: phase === 'question' ? 'pointer' : 'default',
              }}
            >
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-xs text-[#0c1510]"
                style={{ background: '#4dff91', fontFamily: FONT_BOLD }}
              >
                {badge >= 0 ? badge + 1 : LETTERS[i]}
              </span>
              {option.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={option.image} alt={`Option ${LETTERS[i]}`} className="aspect-square w-full flex-1 object-cover" />
              )}
              {option.label && <span className="flex-1 text-sm">{option.label}</span>}
            </button>
          );
        })}
      </div>

      {isOrder && phase === 'question' && (
        <button
          type="button"
          onClick={undoPick}
          disabled={picked.length === 0 || submitting}
          className="text-xs text-white/70 underline disabled:opacity-40"
          style={{ fontFamily: FONT }}
        >
          Undo last pick
        </button>
      )}
    </div>
  );
}

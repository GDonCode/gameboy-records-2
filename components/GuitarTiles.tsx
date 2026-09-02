'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGuitarNotes, playNote } from '@/lib/guitar-audio';

const LANE_COUNT = 6;
const LANE_KEYS = ['a', 's', 'd', 'f', 'j', 'k']; // low E -> high E, left to right
const TILE_SPEED = 320; // px/sec, increases with score
const HIT_ZONE_Y_RATIO = 0.85; // hit line as fraction of canvas height
const HIT_TOLERANCE = 36; // px window around hit line counted as a hit
const SPAWN_INTERVAL_BASE = 850; // ms between tile spawns, decreases with score
const TARGET_FPS = 30;
const FRAME_BUDGET = 1000 / TARGET_FPS;

interface Tile {
  lane: number;
  y: number;
  hit: boolean;
  missed: boolean;
}

type GameState = 'idle' | 'playing' | 'over';

export default function GuitarTiles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const activeLaneFlashRef = useRef<number[]>(new Array(LANE_COUNT).fill(0));

  const [state, setState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const canvasWidth = 480;
  const canvasHeight = 640;
  const laneWidth = canvasWidth / LANE_COUNT;

  const submitScore = useCallback(async (finalScore: number) => {
    setSaving(true);
    try {
      await fetch('/api/guitar/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore }),
      });
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setSaving(false);
    }
  }, []);

  const endGame = useCallback(() => {
    setState('over');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    submitScore(scoreRef.current);
  }, [submitScore]);

  const hitLane = useCallback((lane: number) => {
    if (state !== 'playing') return;
    const hitLineY = canvasHeight * HIT_ZONE_Y_RATIO;

    const candidate = tilesRef.current.find(
      (t) => t.lane === lane && !t.hit && !t.missed && Math.abs(t.y - hitLineY) <= HIT_TOLERANCE
    );

    activeLaneFlashRef.current[lane] = 6; // frames to render tap flash

    if (candidate) {
      candidate.hit = true;
      playNote(lane);
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      // Tapped with nothing in the hit zone — miss.
      endGame();
    }
  }, [state, endGame]);

  // Keyboard input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const lane = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (lane !== -1) hitLane(lane);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hitLane]);

  // Game loop — capped at TARGET_FPS via accumulator
  useEffect(() => {
    if (state !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastFrameRef.current = performance.now();
    lastSpawnRef.current = performance.now();

    function loop(timestamp: number) {
      if (!ctx) return;
      const elapsed = timestamp - lastFrameRef.current;

      if (elapsed >= FRAME_BUDGET) {
        lastFrameRef.current = timestamp - (elapsed % FRAME_BUDGET);
        const dt = elapsed / 1000;

        // Spawn
        const spawnInterval = Math.max(400, SPAWN_INTERVAL_BASE - scoreRef.current * 4);
        if (timestamp - lastSpawnRef.current > spawnInterval) {
          lastSpawnRef.current = timestamp;
          tilesRef.current.push({
            lane: Math.floor(Math.random() * LANE_COUNT),
            y: -40,
            hit: false,
            missed: false,
          });
        }

        // Update
        const speed = TILE_SPEED + scoreRef.current * 3;
        const hitLineY = canvasHeight * HIT_ZONE_Y_RATIO;
        for (const t of tilesRef.current) {
          if (t.hit) continue;
          t.y += speed * dt;
          if (!t.missed && t.y - hitLineY > HIT_TOLERANCE) {
            t.missed = true;
          }
        }

        if (tilesRef.current.some((t) => t.missed)) {
          endGame();
          return;
        }

        tilesRef.current = tilesRef.current.filter((t) => t.y < canvasHeight + 40 && !t.hit);

        // Render
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#0c1510';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Lane dividers
        ctx.strokeStyle = 'rgba(26,158,74,0.25)';
        for (let i = 1; i < LANE_COUNT; i++) {
          ctx.beginPath();
          ctx.moveTo(i * laneWidth, 0);
          ctx.lineTo(i * laneWidth, canvasHeight);
          ctx.stroke();
        }

        // Hit line
        ctx.strokeStyle = '#4dff91';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, hitLineY);
        ctx.lineTo(canvasWidth, hitLineY);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Lane tap flashes
        for (let i = 0; i < LANE_COUNT; i++) {
          if (activeLaneFlashRef.current[i] > 0) {
            ctx.fillStyle = 'rgba(77,255,145,0.15)';
            ctx.fillRect(i * laneWidth, 0, laneWidth, canvasHeight);
            activeLaneFlashRef.current[i] -= 1;
          }
        }

        // Tiles
        ctx.fillStyle = '#3dc97e';
        for (const t of tilesRef.current) {
          ctx.fillRect(t.lane * laneWidth + 6, t.y, laneWidth - 12, 28);
        }

        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, endGame, laneWidth]);

  const startGame = useCallback(async () => {
    if (!audioReady) {
      await loadGuitarNotes();
      setAudioReady(true);
    }
    tilesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setState('playing');
  }, [audioReady]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '4px solid #3dc97e', borderRadius: '4px', background: '#0c1510', touchAction: 'none' }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const lane = Math.floor((x / rect.width) * LANE_COUNT);
          hitLane(Math.min(LANE_COUNT - 1, Math.max(0, lane)));
        }}
      />

      <div
        style={{
          fontFamily: "'Hemisphers Bold Sans', monospace",
          fontSize: '1.2em',
          letterSpacing: '0.15em',
          color: '#4dff91',
        }}
      >
        SCORE: {score}
      </div>

      {state !== 'playing' && (
        <button
          type="button"
          onClick={startGame}
          disabled={saving}
          style={{
            fontFamily: "'Hemisphers Bold Sans', monospace",
            fontSize: '0.85em',
            letterSpacing: '0.12em',
            color: '#fff',
            padding: '10px 28px',
            borderRadius: '999px',
            border: '1px solid #1a9e4a',
            background: 'linear-gradient(175deg, #22b85a 0%, #178f42 100%)',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {state === 'over' ? (saving ? 'SAVING...' : 'PLAY AGAIN') : 'START'}
        </button>
      )}

      {state === 'idle' && (
        <p style={{ fontFamily: "'Arvo', monospace", fontSize: '0.8em', color: 'rgba(255,255,255,0.6)' }}>
          Keys: A S D F J K (low E → high E), or tap the lanes.
        </p>
      )}
    </div>
  );
}
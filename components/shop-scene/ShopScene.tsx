// components/shop-scene/ShopScene.tsx
// The shop as a game screen: Alexx behind a glass counter, every nav link a container in the room.
// Hover, focus or (on touch) first tap opens a container; the rest of the shop dims behind a vignette.
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import styles from './shop-scene.module.css';
import { SPOTS, focusOf, type Spot } from './spots';
import { AlexxArt, ContainerBack, ContainerFront, CounterArt, ItemArt, LampArt, ShelfArt, WallArt, dustMotes } from './art';

const css = (v: Record<string, string | number>) => v as CSSProperties;

export default function ShopScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const pointerType = useRef<string>('mouse');
  const [active, setActive] = useState<string | null>(null);
  const [sound, setSound] = useState(false);
  const motes = useMemo(() => dustMotes(), []);

  const activeSpot = SPOTS.find((s) => s.id === active) ?? null;
  const focus = activeSpot ? focusOf(activeSpot) : { hx: 50, hy: 42, look: 0 };

  // Parallax: ease the pointer position into --px/--py (no React re-renders).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty('--px', cx.toFixed(3));
      el.style.setProperty('--py', cy.toFixed(3));
      raf = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    el.addEventListener('pointermove', move);
    return () => {
      el.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  // A tiny synthesized "tick" when a container opens (off until the visitor turns sound on).
  const tick = useCallback(
    (i: number) => {
      const ctx = audioRef.current;
      if (!sound || !ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(520 + i * 70, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(980 + i * 70, ctx.currentTime + 0.06);
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.1);
    },
    [sound],
  );

  function toggleSound() {
    if (!audioRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    void audioRef.current?.resume();
    setSound((s) => !s);
  }

  function open(spot: Spot) {
    setActive((cur) => {
      if (cur !== spot.id) tick(SPOTS.indexOf(spot));
      return spot.id;
    });
  }

  // Touch has no hover: the first tap opens the container, the second tap follows the link.
  function onClick(e: React.MouseEvent, spot: Spot) {
    if (pointerType.current === 'touch' && active !== spot.id) {
      e.preventDefault();
      open(spot);
    }
  }

  function onStagePointerDown(e: RPointerEvent) {
    pointerType.current = e.pointerType;
    if (!(e.target as HTMLElement).closest('a')) setActive(null);
  }

  return (
    <>
      {/* Phones and small tablets: a crop of the room would hide the shelves, so show the same links as a game menu. */}
      <nav aria-label="Shop sections" className="md:hidden min-h-svh bg-ink px-4 py-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-mist">
          <ArrowLeft size={16} aria-hidden /> Gameboy Records
        </Link>
        <h1 className="mb-1 text-3xl font-bold uppercase tracking-wide text-gold">The Shop</h1>
        <p className="mb-6 text-sm text-mist">Pick an aisle. (The full shop floor opens on a bigger screen.)</p>
        <ul className="flex flex-col gap-3">
          {SPOTS.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className="flex items-center justify-between rounded-sm border border-line-inv bg-ink-2 px-4 py-4 active:bg-ink-3"
              >
                <span>
                  <span className="block text-lg font-bold uppercase tracking-wide text-paper">{s.label}</span>
                  <span className="block text-xs uppercase tracking-widest text-mist">{s.blurb}</span>
                </span>
                <span aria-hidden className="text-gold">▶</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div ref={rootRef} className={`${styles.root} hidden md:block`} data-engaged={active ? 'true' : 'false'}>
        <div
          className={styles.stage}
          data-active={active ?? undefined}
          style={css({ '--hx': `${focus.hx}%`, '--hy': `${focus.hy}%`, '--look': focus.look })}
          onPointerDownCapture={onStagePointerDown}
        >
          <div className={`${styles.layer} ${styles.wall}`}><WallArt /></div>
          <div className={`${styles.layer} ${styles.shelves}`}><ShelfArt /></div>
          <div className={`${styles.layer} ${styles.lamps}`}><LampArt /></div>
          <div className={`${styles.layer} ${styles.alexx}`}><AlexxArt /></div>
          <div className={`${styles.layer} ${styles.counter}`}><CounterArt /></div>

          <nav aria-label="Shop sections" className={`${styles.layer} ${styles.slots}`}>
            <div className={styles.blur} />
            <div className={styles.dim} />
            <ul>
              {SPOTS.map((s) => {
                const isOpen = active === s.id;
                return (
                  <li
                    key={s.id}
                    className={styles.slot}
                    data-open={isOpen}
                    style={css({ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, '--aspect': s.aspect, '--rise': s.rise, '--itop': s.kind === 'board' ? '55%' : '22%' })}
                  >
                    <Link
                      href={s.href}
                      className={styles.hot}
                      aria-label={`${s.label}: ${s.blurb}`}
                      onPointerEnter={(e) => {
                        pointerType.current = e.pointerType;
                        if (e.pointerType !== 'touch') open(s);
                      }}
                      onPointerLeave={(e) => {
                        if (e.pointerType !== 'touch') setActive((c) => (c === s.id ? null : c));
                      }}
                      onFocus={() => open(s)}
                      onBlur={() => setActive((c) => (c === s.id ? null : c))}
                      onClick={(e) => onClick(e, s)}
                    >
                      <ContainerBack spot={s} />
                      {s.kind !== 'board' && <Items spot={s} />}
                      <ContainerFront spot={s} />
                      {s.kind === 'board' && <Items spot={s} />}
                      <span className={styles.tag} aria-hidden>
                        <b>{s.label}</b>
                        <i>{s.blurb}</i>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.fx} aria-hidden>
            <div className={styles.dust}>{motes.map((m, i) => <span key={i} style={m} />)}</div>
            <div className={styles.scan} />
            <div className={styles.frame} />
          </div>
        </div>

        <Link href="/" className={`${styles.hud} left-5 top-5 inline-flex items-center gap-2 rounded-full border border-line-inv bg-ink/70 px-4 py-2 text-xs uppercase tracking-widest text-paper backdrop-blur`}>
          <ArrowLeft size={14} aria-hidden /> Gameboy Records
        </Link>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={sound}
          className={`${styles.hud} right-5 top-5 inline-flex items-center gap-2 rounded-full border border-line-inv bg-ink/70 px-4 py-2 text-xs uppercase tracking-widest text-paper backdrop-blur`}
        >
          {sound ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />} Sound {sound ? 'on' : 'off'}
        </button>
        <p className={styles.hint}>Hover a shelf to look inside · Tab to browse</p>
      </div>
    </>
  );
}

function Items({ spot }: { spot: Spot }) {
  return (
    <span className={styles.items} aria-hidden>
      {spot.palette.map((c, i) => (
        <span key={i} className={styles.item} style={css({ '--i': i })}>
          <ItemArt kind={spot.item} color={c} />
        </span>
      ))}
    </span>
  );
}

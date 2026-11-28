// components/home/MerchChains.tsx
// Chains and a padlock laid over the whole Merch section: four chains run from the section's corners to a gold padlock
// centred on whatever carries `data-chain-center`. Each chain is a small rope simulation (verlet integration), so the
// pointer pushes the links aside as it passes and they swing back; flicking past the padlock rattles it.
// The canvas takes the pointer itself, so it also blocks clicks on what lies underneath.
//
// Performance: links and the padlock are drawn once into small offscreen sprites and stamped with drawImage (no
// per-frame path or shadow work); the loop only runs while the section is on screen AND something is still moving,
// so a resting lock costs nothing; it wakes when the pointer moves over it.
'use client';

import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; px: number; py: number };
type Arm = { pts: Point[]; seg: number; ax: number; ay: number };
type Sprite = { c: HTMLCanvasElement; w: number; h: number };

const LINK = 30; // distance between link centres, px
const REACH = 110; // how far from the pointer the links feel it
const ITERATIONS = 8; // rope constraint passes per frame
const IRON = '#2B2A26';
const IRON_LIGHT = '#8D897D';
const INK = '#0B0A07';
const GOLD = '#E2BA0A';
const GOLD_LIGHT = '#F4D84A';

export default function MerchChains() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let arms: Arm[] = [];
    let freePoints = 1;
    let faceSprite: Sprite;
    let edgeSprite: Sprite;
    let lockSprite: Sprite;
    const lock = { x: 0, y: 0, s: 80, ang: 0, vel: 0 };
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, seen: false };
    let raf = 0;
    let visible = false;
    let quiet = 0; // consecutive frames with (almost) nothing moving
    let resizeFrame = 0;

    /** Draw something once into an offscreen canvas, centred, with a soft drop shadow. */
    const sprite = (sw: number, sh: number, draw: (g: CanvasRenderingContext2D) => void): Sprite => {
      const c = document.createElement('canvas');
      c.width = Math.ceil(sw * dpr);
      c.height = Math.ceil(sh * dpr);
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);
      g.translate(sw / 2, sh / 2);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.shadowColor = 'rgba(11, 10, 7, 0.32)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 3;
      draw(g);
      return { c, w: sw, h: sh };
    };

    const makeSprites = () => {
      // A link seen side-on to its hole: a long rounded ring.
      faceSprite = sprite(LINK * 1.24 + 16, LINK * 0.6 + 16, (g) => {
        g.beginPath();
        g.roundRect(-LINK * 0.62, -LINK * 0.3, LINK * 1.24, LINK * 0.6, LINK * 0.3);
        g.strokeStyle = IRON;
        g.lineWidth = 6;
        g.stroke();
        g.strokeStyle = IRON_LIGHT;
        g.lineWidth = 2;
        g.stroke();
      });
      // The next link is turned a quarter, so it shows only as a thick bar.
      edgeSprite = sprite(LINK * 0.8 + 16, 8 + 16, (g) => {
        g.beginPath();
        g.moveTo(-LINK * 0.4, 0);
        g.lineTo(LINK * 0.4, 0);
        g.strokeStyle = IRON;
        g.lineWidth = 8;
        g.stroke();
        g.strokeStyle = IRON_LIGHT;
        g.lineWidth = 3;
        g.stroke();
      });
      const s = lock.s;
      lockSprite = sprite(s * 1.7, s * 1.7, (g) => {
        g.translate(0, s * 0.04);
        // Shackle
        const r = s * 0.28;
        const top = -s * 0.28;
        g.beginPath();
        g.moveTo(-r, top + s * 0.1);
        g.lineTo(-r, top);
        g.arc(0, top, r, Math.PI, 0);
        g.lineTo(r, top + s * 0.1);
        g.strokeStyle = INK;
        g.lineWidth = s * 0.17;
        g.stroke();
        g.strokeStyle = IRON_LIGHT;
        g.lineWidth = s * 0.09;
        g.stroke();
        // Body
        g.beginPath();
        g.roundRect(-s / 2, top, s, s * 0.78, s * 0.12);
        g.fillStyle = GOLD;
        g.fill();
        g.lineWidth = 4;
        g.strokeStyle = INK;
        g.stroke();
        // Sheen
        g.beginPath();
        g.moveTo(-s * 0.36, top + s * 0.14);
        g.lineTo(-s * 0.36, top + s * 0.6);
        g.strokeStyle = GOLD_LIGHT;
        g.lineWidth = s * 0.07;
        g.stroke();
        // Keyhole
        g.shadowColor = 'transparent';
        const ky = top + s * 0.3;
        g.fillStyle = INK;
        g.beginPath();
        g.arc(0, ky, s * 0.09, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.moveTo(-s * 0.05, ky + s * 0.04);
        g.lineTo(s * 0.05, ky + s * 0.04);
        g.lineTo(s * 0.075, ky + s * 0.24);
        g.lineTo(-s * 0.075, ky + s * 0.24);
        g.closePath();
        g.fill();
      });
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w < 2 || h < 2) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // The padlock sits at the centre of the element marked data-chain-center (the product grid), else the middle.
      const target = canvas.parentElement?.querySelector<HTMLElement>('[data-chain-center]');
      if (target) {
        const t = target.getBoundingClientRect();
        lock.x = t.left + t.width / 2 - rect.left;
        lock.y = t.top + t.height / 2 - rect.top;
      } else {
        lock.x = w / 2;
        lock.y = h / 2;
      }
      lock.s = Math.max(64, Math.min(108, w * 0.09));
      makeSprites();
      arms = [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
      ].map(([ax, ay]) => {
        const dx = lock.x - ax;
        const dy = lock.y - ay;
        const dist = Math.hypot(dx, dy);
        const len = dist * 1.06; // a little slack, so the chains hang rather than sit ruler-straight
        const n = Math.max(6, Math.round(len / LINK));
        const pts: Point[] = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = ax + dx * t;
          const y = ay + dy * t + Math.sin(Math.PI * t) * dist * 0.04;
          pts.push({ x, y, px: x, py: y });
        }
        return { pts, seg: len / n, ax, ay };
      });
      freePoints = arms.reduce((sum, a) => sum + a.pts.length - 2, 0);
      return true;
    };

    /** One physics step. Returns how much is still moving (average px per free point, plus the padlock). */
    const step = () => {
      const near = Math.hypot(mouse.x - lock.x, mouse.y - lock.y) < lock.s * 1.5;
      let moved = 0;
      for (const arm of arms) {
        const { pts } = arm;
        const last = pts.length - 1;
        for (let i = 1; i < last; i++) {
          const p = pts[i];
          const vx = (p.x - p.px) * 0.985;
          const vy = (p.y - p.py) * 0.985;
          p.px = p.x;
          p.py = p.y;
          p.x += vx;
          p.y += vy + 0.35; // gravity
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          if (Math.abs(dx) < REACH && Math.abs(dy) < REACH) {
            const d = Math.hypot(dx, dy);
            if (d < REACH && d > 0.001) {
              const f = 1 - d / REACH;
              p.x += (dx / d) * f * 3 + mouse.vx * f * 0.3;
              p.y += (dy / d) * f * 3 + mouse.vy * f * 0.3;
            }
          }
        }
        for (let it = 0; it < ITERATIONS; it++) {
          pts[0].x = arm.ax;
          pts[0].y = arm.ay;
          pts[last].x = lock.x;
          pts[last].y = lock.y;
          for (let i = 0; i < last; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy) || 0.0001;
            const diff = (d - arm.seg) / d / 2;
            const ox = dx * diff;
            const oy = dy * diff;
            if (i > 0) {
              a.x += ox;
              a.y += oy;
            }
            if (i + 1 < last) {
              b.x -= ox;
              b.y -= oy;
            }
          }
        }
        for (let i = 1; i < last; i++) moved += Math.abs(pts[i].x - pts[i].px) + Math.abs(pts[i].y - pts[i].py);
      }
      // The padlock: a spring that a passing pointer flicks sideways.
      if (near) lock.vel += mouse.vx * 0.0016;
      lock.vel += -lock.ang * 0.06;
      lock.vel *= 0.93;
      lock.ang = Math.max(-0.5, Math.min(0.5, lock.ang + lock.vel));
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;
      return moved / freePoints + (Math.abs(lock.vel) + Math.abs(lock.ang)) * 20;
    };

    /** Stamp a sprite centred on (x, y), turned by `angle`. */
    const stamp = (sp: Sprite, x: number, y: number, angle: number) => {
      const cos = Math.cos(angle) * dpr;
      const sin = Math.sin(angle) * dpr;
      ctx.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr);
      ctx.drawImage(sp.c, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
    };

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const arm of arms) {
        const { pts } = arm;
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          stamp(i % 2 === 0 ? faceSprite : edgeSprite, (a.x + b.x) / 2, (a.y + b.y) / 2, Math.atan2(b.y - a.y, b.x - a.x));
        }
        // Bolted-down end plate
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.beginPath();
        ctx.arc(arm.ax, arm.ay, 11, 0, Math.PI * 2);
        ctx.fillStyle = IRON;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(arm.ax, arm.ay, 4, 0, Math.PI * 2);
        ctx.fillStyle = IRON_LIGHT;
        ctx.fill();
      }
      stamp(lockSprite, lock.x, lock.y, lock.ang);
    };

    /** Let the chains hang for a moment before the first frame, so they never visibly drop into place. */
    const settle = () => {
      for (let i = 0; i < 120; i++) step();
      draw();
    };

    const frame = () => {
      const energy = step();
      draw();
      quiet = energy < 0.012 ? quiet + 1 : 0;
      // Everything has come to rest: stop until the pointer disturbs it again.
      raf = quiet > 30 ? 0 : requestAnimationFrame(frame);
    };
    const wake = () => {
      quiet = 0;
      if (!raf && visible && !reduceMotion) raf = requestAnimationFrame(frame);
    };
    const sleep = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // The canvas is the pointer's target, so offsetX/Y are already relative to it (no layout reads per move).
    const onMove = (e: PointerEvent) => {
      if (mouse.seen) {
        mouse.vx = Math.max(-40, Math.min(40, e.offsetX - mouse.x));
        mouse.vy = Math.max(-40, Math.min(40, e.offsetY - mouse.y));
      }
      mouse.x = e.offsetX;
      mouse.y = e.offsetY;
      mouse.seen = true;
      wake();
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.seen = false;
      wake(); // let the links swing back
    };

    if (build()) settle();

    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (build()) {
          settle();
          wake();
        }
      });
    });
    resize.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) sleep();
    });
    io.observe(canvas);

    if (!reduceMotion) {
      canvas.addEventListener('pointermove', onMove, { passive: true });
      canvas.addEventListener('pointerleave', onLeave);
    }

    return () => {
      sleep();
      cancelAnimationFrame(resizeFrame);
      resize.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 z-10 h-full w-full" />;
}

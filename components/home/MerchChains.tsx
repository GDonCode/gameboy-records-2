// components/home/MerchChains.tsx
// Chains and a padlock laid over the Merch section: four chains run from the corners to a gold padlock in the middle.
// Each chain is a small rope simulation (verlet integration), so the pointer pushes the links aside as it passes
// and the chains swing back; flicking past the padlock rattles it. The canvas never takes the pointer itself
// (pointer-events: none), it only watches it, so everything underneath stays clickable.
'use client';

import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; px: number; py: number };
type Arm = { pts: Point[]; seg: number; ax: number; ay: number };

const LINK = 30; // distance between link centres, px
const REACH = 110; // how far from the pointer the links feel it
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
    const lock = { x: 0, y: 0, s: 80, ang: 0, vel: 0 };
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, seen: false };
    let raf = 0;
    let visible = false;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w < 2 || h < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lock.x = w / 2;
      lock.y = h / 2;
      lock.s = Math.max(64, Math.min(108, w * 0.09));
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
    };

    const step = () => {
      const near = Math.hypot(mouse.x - lock.x, mouse.y - lock.y) < lock.s * 1.5;
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
          const d = Math.hypot(dx, dy);
          if (d < REACH && d > 0.001) {
            const f = 1 - d / REACH;
            p.x += (dx / d) * f * 3 + mouse.vx * f * 0.3;
            p.y += (dy / d) * f * 3 + mouse.vy * f * 0.3;
          }
        }
        for (let it = 0; it < 10; it++) {
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
      }
      // The padlock: a spring that a passing pointer flicks sideways.
      if (near) lock.vel += mouse.vx * 0.0016;
      lock.vel += -lock.ang * 0.06;
      lock.vel *= 0.93;
      lock.ang = Math.max(-0.5, Math.min(0.5, lock.ang + lock.vel));
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;
    };

    const drawLink = (x: number, y: number, angle: number, face: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.lineCap = 'round';
      if (face) {
        // A link seen side-on to its hole: a long rounded ring.
        ctx.beginPath();
        ctx.roundRect(-LINK * 0.62, -LINK * 0.3, LINK * 1.24, LINK * 0.6, LINK * 0.3);
        ctx.strokeStyle = IRON;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.strokeStyle = IRON_LIGHT;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // The next link is turned a quarter, so it shows only as a thick bar.
        ctx.beginPath();
        ctx.moveTo(-LINK * 0.4, 0);
        ctx.lineTo(LINK * 0.4, 0);
        ctx.strokeStyle = IRON;
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = IRON_LIGHT;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawLock = () => {
      const { x, y, s } = lock;
      ctx.save();
      ctx.translate(x, y + s * 0.04);
      ctx.rotate(lock.ang);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      // Shackle
      const r = s * 0.28;
      const top = -s * 0.28;
      ctx.beginPath();
      ctx.moveTo(-r, top + s * 0.1);
      ctx.lineTo(-r, top);
      ctx.arc(0, top, r, Math.PI, 0);
      ctx.lineTo(r, top + s * 0.1);
      ctx.strokeStyle = INK;
      ctx.lineWidth = s * 0.17;
      ctx.stroke();
      ctx.strokeStyle = IRON_LIGHT;
      ctx.lineWidth = s * 0.09;
      ctx.stroke();
      // Body
      ctx.beginPath();
      ctx.roundRect(-s / 2, top, s, s * 0.78, s * 0.12);
      ctx.fillStyle = GOLD;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = INK;
      ctx.stroke();
      // Sheen
      ctx.beginPath();
      ctx.moveTo(-s * 0.36, top + s * 0.14);
      ctx.lineTo(-s * 0.36, top + s * 0.6);
      ctx.strokeStyle = GOLD_LIGHT;
      ctx.lineWidth = s * 0.07;
      ctx.stroke();
      // Keyhole
      const ky = top + s * 0.3;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(0, ky, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, ky + s * 0.04);
      ctx.lineTo(s * 0.05, ky + s * 0.04);
      ctx.lineTo(s * 0.075, ky + s * 0.24);
      ctx.lineTo(-s * 0.075, ky + s * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.shadowColor = 'rgba(11, 10, 7, 0.35)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
      for (const arm of arms) {
        const { pts } = arm;
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          drawLink((a.x + b.x) / 2, (a.y + b.y) / 2, Math.atan2(b.y - a.y, b.x - a.x), i % 2 === 0);
        }
        // Bolted-down end plate
        ctx.beginPath();
        ctx.arc(arm.ax, arm.ay, 11, 0, Math.PI * 2);
        ctx.fillStyle = IRON;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(arm.ax, arm.ay, 4, 0, Math.PI * 2);
        ctx.fillStyle = IRON_LIGHT;
        ctx.fill();
      }
      drawLock();
    };

    /** Let the chains hang for a moment before the first frame, so they never visibly drop into place. */
    const settle = () => {
      for (let i = 0; i < 120; i++) step();
      draw();
    };

    const frame = () => {
      step();
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && !reduceMotion) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (mouse.seen) {
        mouse.vx = Math.max(-40, Math.min(40, x - mouse.x));
        mouse.vy = Math.max(-40, Math.min(40, y - mouse.y));
      }
      mouse.x = x;
      mouse.y = y;
      mouse.seen = true;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.seen = false;
    };

    build();
    settle();

    const resize = new ResizeObserver(() => {
      build();
      settle();
    });
    resize.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    if (!reduceMotion) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}

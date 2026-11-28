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
    let faceShadow: Sprite;
    let edgeShadow: Sprite;
    let lockShadow: Sprite;
    let plateSprite: Sprite;
    const lock = { x: 0, y: 0, s: 80, ang: 0, vel: 0 };
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, seen: false };
    let raf = 0;
    let visible = false;
    let quiet = 0; // consecutive frames with (almost) nothing moving
    let resizeFrame = 0;

    /** Draw something once into an offscreen canvas, centred. */
    const sprite = (sw: number, sh: number, draw: (g: CanvasRenderingContext2D) => void): Sprite => {
      const c = document.createElement('canvas');
      c.width = Math.ceil(sw * dpr);
      c.height = Math.ceil(sh * dpr);
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);
      g.translate(sw / 2, sh / 2);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      draw(g);
      return { c, w: sw, h: sh };
    };

    /** A round tube of polished steel along the current path: stacked strokes, dark rim to bright centre line. */
    const steelTube = (g: CanvasRenderingContext2D, width: number) => {
      const layers: [number, string][] = [
        [1.0, '#101215'],
        [0.84, '#3a3f45'],
        [0.68, '#69717a'],
        [0.5, '#98a1aa'],
        [0.3, '#cdd4da'],
        [0.12, '#f7fafc'],
      ];
      for (const [k, color] of layers) {
        g.strokeStyle = color;
        g.lineWidth = width * k;
        g.stroke();
      }
    };

    /** Soft contact shadow for a shape: the same silhouette in black, blurred. */
    const blurred = (g: CanvasRenderingContext2D, px: number) => {
      if ('filter' in g) g.filter = `blur(${px}px)`;
    };

    const facePath = (g: CanvasRenderingContext2D) => {
      g.beginPath();
      g.roundRect(-LINK * 0.62, -LINK * 0.3, LINK * 1.24, LINK * 0.6, LINK * 0.3);
    };
    const edgePath = (g: CanvasRenderingContext2D) => {
      g.beginPath();
      g.moveTo(-LINK * 0.4, 0);
      g.lineTo(LINK * 0.4, 0);
    };

    /** The padlock's outline (shackle and body), for its shadow. */
    const lockSilhouette = (g: CanvasRenderingContext2D, s: number) => {
      const r = s * 0.28;
      const top = -s * 0.28;
      g.beginPath();
      g.moveTo(-r, top + s * 0.1);
      g.lineTo(-r, top);
      g.arc(0, top, r, Math.PI, 0);
      g.lineTo(r, top + s * 0.1);
      g.strokeStyle = '#000';
      g.lineWidth = s * 0.19;
      g.stroke();
      g.beginPath();
      g.roundRect(-s / 2, top, s, s * 0.78, s * 0.1);
      g.fillStyle = '#000';
      g.fill();
    };

    const screw = (g: CanvasRenderingContext2D, x: number, y: number, r: number, light: string, dark: string) => {
      const grad = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, light);
      grad.addColorStop(1, dark);
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fillStyle = grad;
      g.fill();
      g.lineWidth = 0.8;
      g.strokeStyle = 'rgba(0,0,0,0.55)';
      g.stroke();
      g.beginPath();
      g.moveTo(x - r * 0.6, y + r * 0.15);
      g.lineTo(x + r * 0.6, y - r * 0.15);
      g.lineWidth = Math.max(1, r * 0.28);
      g.strokeStyle = 'rgba(0,0,0,0.6)';
      g.stroke();
    };

    const makeSprites = () => {
      // A link seen side-on to its hole: a long ring of steel rod.
      faceSprite = sprite(LINK * 1.24 + 16, LINK * 0.6 + 16, (g) => {
        facePath(g);
        steelTube(g, 8.5);
      });
      // The next link is turned a quarter, so it shows only as a rod end-on: a shaded cylinder.
      edgeSprite = sprite(LINK * 0.8 + 16, 8.5 + 16, (g) => {
        const grad = g.createLinearGradient(0, -4.5, 0, 4.5);
        grad.addColorStop(0, '#101215');
        grad.addColorStop(0.18, '#69717a');
        grad.addColorStop(0.4, '#e4e9ed');
        grad.addColorStop(0.62, '#8f98a1');
        grad.addColorStop(1, '#14171a');
        g.beginPath();
        g.roundRect(-LINK * 0.4 - 3, -4.5, LINK * 0.8 + 6, 9, 4.5);
        g.fillStyle = grad;
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.45)';
        g.lineWidth = 0.8;
        g.stroke();
      });
      faceShadow = sprite(LINK * 1.24 + 24, LINK * 0.6 + 24, (g) => {
        blurred(g, 3);
        facePath(g);
        g.strokeStyle = '#000';
        g.lineWidth = 8;
        g.stroke();
      });
      edgeShadow = sprite(LINK * 0.8 + 24, 8.5 + 24, (g) => {
        blurred(g, 3);
        edgePath(g);
        g.strokeStyle = '#000';
        g.lineWidth = 8;
        g.stroke();
      });
      plateSprite = sprite(44, 44, (g) => {
        g.shadowColor = 'rgba(0,0,0,0.4)';
        g.shadowBlur = 5;
        g.shadowOffsetY = 3;
        const ring = g.createRadialGradient(-4, -5, 2, 0, 0, 13);
        ring.addColorStop(0, '#d9dfe4');
        ring.addColorStop(0.7, '#8b949d');
        ring.addColorStop(1, '#3d434a');
        g.beginPath();
        g.arc(0, 0, 13, 0, Math.PI * 2);
        g.fillStyle = ring;
        g.fill();
        g.shadowColor = 'transparent';
        g.lineWidth = 1;
        g.strokeStyle = 'rgba(0,0,0,0.6)';
        g.stroke();
        g.beginPath();
        g.arc(0, 0, 9.5, 0, Math.PI * 2);
        g.strokeStyle = 'rgba(255,255,255,0.35)';
        g.stroke();
        screw(g, 0, 0, 5.5, '#eef2f5', '#6f7880');
      });

      const s = lock.s;
      lockShadow = sprite(s * 1.7, s * 1.7, (g) => {
        blurred(g, s * 0.07);
        g.translate(0, s * 0.04);
        lockSilhouette(g, s);
      });
      lockSprite = sprite(s * 1.7, s * 1.7, (g) => {
        g.translate(0, s * 0.04);
        const r = s * 0.28;
        const top = -s * 0.28;
        const bodyH = s * 0.78;
        const rad = s * 0.1;

        // Shackle: a heavy polished-steel loop
        g.beginPath();
        g.moveTo(-r, top + s * 0.1);
        g.lineTo(-r, top);
        g.arc(0, top, r, Math.PI, 0);
        g.lineTo(r, top + s * 0.1);
        steelTube(g, s * 0.16);

        // Body: cast brass with a bevelled edge
        g.beginPath();
        g.roundRect(-s / 2 - 1.5, top - 1.5, s + 3, bodyH + 3, rad + 1.5);
        g.fillStyle = '#3a2905';
        g.fill();
        const brass = g.createLinearGradient(0, top, 0, top + bodyH);
        brass.addColorStop(0, '#f7de82');
        brass.addColorStop(0.14, '#e9c04a');
        brass.addColorStop(0.5, '#c9981c');
        brass.addColorStop(0.86, '#a77810');
        brass.addColorStop(1, '#7a560b');
        g.beginPath();
        g.roundRect(-s / 2, top, s, bodyH, rad);
        g.fillStyle = brass;
        g.fill();
        // Light from the left: a bright band fading to shade on the right
        const side = g.createLinearGradient(-s / 2, 0, s / 2, 0);
        side.addColorStop(0, 'rgba(255,255,255,0.32)');
        side.addColorStop(0.3, 'rgba(255,255,255,0)');
        side.addColorStop(0.75, 'rgba(0,0,0,0.04)');
        side.addColorStop(1, 'rgba(0,0,0,0.26)');
        g.fillStyle = side;
        g.fill();
        // Bevel: bright top edge, dark bottom edge
        g.lineWidth = 1.6;
        g.strokeStyle = 'rgba(255,248,210,0.75)';
        g.beginPath();
        g.moveTo(-s / 2 + rad, top + 2);
        g.lineTo(s / 2 - rad, top + 2);
        g.stroke();
        g.strokeStyle = 'rgba(60,40,0,0.55)';
        g.beginPath();
        g.moveTo(-s / 2 + rad, top + bodyH - 2);
        g.lineTo(s / 2 - rad, top + bodyH - 2);
        g.stroke();

        // Recessed face plate
        const pw = s * 0.64;
        const ph = s * 0.5;
        const py = top + s * 0.14;
        g.beginPath();
        g.roundRect(-pw / 2, py, pw, ph, s * 0.06);
        const recess = g.createLinearGradient(0, py, 0, py + ph);
        recess.addColorStop(0, '#9a6f10');
        recess.addColorStop(1, '#d1a22a');
        g.fillStyle = recess;
        g.fill();
        g.lineWidth = 1.4;
        g.strokeStyle = 'rgba(50,32,0,0.6)';
        g.stroke();
        g.beginPath();
        g.moveTo(-pw / 2 + s * 0.05, py + ph);
        g.lineTo(pw / 2 - s * 0.05, py + ph);
        g.strokeStyle = 'rgba(255,240,180,0.55)';
        g.stroke();

        // Keyhole in a brass escutcheon
        const ky = py + ph * 0.42;
        const esc = g.createRadialGradient(-s * 0.03, ky - s * 0.03, s * 0.01, 0, ky, s * 0.13);
        esc.addColorStop(0, '#f6dc7c');
        esc.addColorStop(1, '#a9790f');
        g.beginPath();
        g.arc(0, ky, s * 0.125, 0, Math.PI * 2);
        g.fillStyle = esc;
        g.fill();
        g.lineWidth = 1.2;
        g.strokeStyle = 'rgba(50,32,0,0.7)';
        g.stroke();
        g.fillStyle = '#080604';
        g.beginPath();
        g.arc(0, ky, s * 0.06, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.moveTo(-s * 0.04, ky + s * 0.03);
        g.lineTo(s * 0.04, ky + s * 0.03);
        g.lineTo(s * 0.06, ky + s * 0.2);
        g.lineTo(-s * 0.06, ky + s * 0.2);
        g.closePath();
        g.fill();

        // Four little screws
        const sx = s * 0.4;
        const sr = s * 0.032;
        screw(g, -sx, top + s * 0.1, sr, '#f3e3a2', '#8a620b');
        screw(g, sx, top + s * 0.1, sr, '#f3e3a2', '#8a620b');
        screw(g, -sx, top + bodyH - s * 0.1, sr, '#f3e3a2', '#8a620b');
        screw(g, sx, top + bodyH - s * 0.1, sr, '#f3e3a2', '#8a620b');
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
      // Shadows first (the light is up and to the left), then the metal on top of them.
      ctx.globalAlpha = 0.38;
      for (const { pts } of arms) {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          stamp(i % 2 === 0 ? faceShadow : edgeShadow, (a.x + b.x) / 2 + 3, (a.y + b.y) / 2 + 6, Math.atan2(b.y - a.y, b.x - a.x));
        }
      }
      stamp(lockShadow, lock.x + 5, lock.y + 10, lock.ang);
      ctx.globalAlpha = 1;
      for (const { pts } of arms) {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          stamp(i % 2 === 0 ? faceSprite : edgeSprite, (a.x + b.x) / 2, (a.y + b.y) / 2, Math.atan2(b.y - a.y, b.x - a.x));
        }
      }
      for (const arm of arms) stamp(plateSprite, arm.ax, arm.ay, 0);
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

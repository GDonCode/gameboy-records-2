'use client';

import { useEffect, useRef } from 'react';

export type GameIconName =
  | 'controller'
  | 'dpad'
  | 'joystick'
  | 'dice'
  | 'trophy'
  | 'console';

interface GameIconsBackgroundProps {
  /** Extra classes on the wrapping div (e.g. z-index overrides). */
  className?: string;
  /** true = position:fixed (covers viewport). false = position:absolute (fills nearest position:relative ancestor). Default: false. */
  fixed?: boolean;
  /** Icon stroke color. Default: brand green. */
  color?: string;
  /** Multiplier for icon count per layer. Default: 1. */
  density?: number;
  /** Number of parallax depth layers, 1–3. Default: 3. */
  layerCount?: 1 | 2 | 3;
  /** Overall opacity multiplier on top of each layer's base opacity. Default: 1. */
  opacity?: number;
  /** Restrict which icon shapes appear. Default: all six. */
  icons?: GameIconName[];
}

const ALL_ICONS: GameIconName[] = ['controller', 'dpad', 'joystick', 'dice', 'trophy', 'console'];

const LAYER_CONFIG = [
  { sizeRange: [12, 18] as [number, number], speed: 6, baseOpacity: 0.1, countPerArea: 1 / 26000 },
  { sizeRange: [18, 26] as [number, number], speed: 12, baseOpacity: 0.18, countPerArea: 1 / 34000 },
  { sizeRange: [26, 38] as [number, number], speed: 20, baseOpacity: 0.28, countPerArea: 1 / 48000 },
];

interface IconInstance {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  type: GameIconName;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawController(ctx: CanvasRenderingContext2D, s: number) {
  const w = s, h = s * 0.55;
  roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.4);
  ctx.stroke();

  const dx = -w * 0.22, armLen = h * 0.5, armW = h * 0.2;
  ctx.beginPath();
  ctx.moveTo(dx - armW / 2, -armLen / 2);
  ctx.lineTo(dx + armW / 2, -armLen / 2);
  ctx.lineTo(dx + armW / 2, -armW / 2);
  ctx.lineTo(dx + armLen / 2, -armW / 2);
  ctx.lineTo(dx + armLen / 2, armW / 2);
  ctx.lineTo(dx + armW / 2, armW / 2);
  ctx.lineTo(dx + armW / 2, armLen / 2);
  ctx.lineTo(dx - armW / 2, armLen / 2);
  ctx.lineTo(dx - armW / 2, armW / 2);
  ctx.lineTo(dx - armLen / 2, armW / 2);
  ctx.lineTo(dx - armLen / 2, -armW / 2);
  ctx.lineTo(dx - armW / 2, -armW / 2);
  ctx.closePath();
  ctx.stroke();

  const bx = w * 0.2, by = -h * 0.08, r = h * 0.13;
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(bx + r * 1.7, by + h * 0.18, r, 0, Math.PI * 2); ctx.stroke();
}

function drawDpad(ctx: CanvasRenderingContext2D, s: number) {
  const armLen = s * 0.9, armW = s * 0.32;
  ctx.beginPath();
  ctx.moveTo(-armW / 2, -armLen / 2);
  ctx.lineTo(armW / 2, -armLen / 2);
  ctx.lineTo(armW / 2, -armW / 2);
  ctx.lineTo(armLen / 2, -armW / 2);
  ctx.lineTo(armLen / 2, armW / 2);
  ctx.lineTo(armW / 2, armW / 2);
  ctx.lineTo(armW / 2, armLen / 2);
  ctx.lineTo(-armW / 2, armLen / 2);
  ctx.lineTo(-armW / 2, armW / 2);
  ctx.lineTo(-armLen / 2, armW / 2);
  ctx.lineTo(-armLen / 2, -armW / 2);
  ctx.lineTo(-armW / 2, -armW / 2);
  ctx.closePath();
  ctx.stroke();
}

function drawJoystick(ctx: CanvasRenderingContext2D, s: number) {
  const baseW = s * 0.7, baseH = s * 0.22;
  roundRect(ctx, -baseW / 2, s * 0.28, baseW, baseH, baseH * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, s * 0.28);
  ctx.lineTo(0, -s * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -s * 0.32, s * 0.16, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDice(ctx: CanvasRenderingContext2D, s: number) {
  const size = s * 0.8;
  roundRect(ctx, -size / 2, -size / 2, size, size, size * 0.18);
  ctx.stroke();
  const r = size * 0.08, off = size * 0.25;
  ([[-off, -off], [off, -off], [0, 0], [-off, off], [off, off]] as [number, number][]).forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawTrophy(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.6;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -s * 0.35);
  ctx.quadraticCurveTo(-w / 2, s * 0.05, 0, s * 0.08);
  ctx.quadraticCurveTo(w / 2, s * 0.05, w / 2, -s * 0.35);
  ctx.lineTo(-w / 2, -s * 0.35);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(-w * 0.62, -s * 0.2, w * 0.22, -Math.PI * 0.2, Math.PI * 0.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(w * 0.62, -s * 0.2, w * 0.22, Math.PI * 0.1, Math.PI * 1.2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, s * 0.08);
  ctx.lineTo(0, s * 0.25);
  ctx.stroke();
  roundRect(ctx, -w * 0.35, s * 0.25, w * 0.7, s * 0.12, s * 0.04);
  ctx.stroke();
}

function drawConsole(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.9, h = s * 0.6;
  roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.15);
  ctx.stroke();
  const pad = h * 0.18;
  roundRect(ctx, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2.4, h * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, -h / 2);
  ctx.lineTo(-w * 0.25, -h / 2 - h * 0.4);
  ctx.moveTo(w * 0.1, -h / 2);
  ctx.lineTo(w * 0.25, -h / 2 - h * 0.4);
  ctx.stroke();
}

const DRAW_FNS: Record<GameIconName, (ctx: CanvasRenderingContext2D, s: number) => void> = {
  controller: drawController,
  dpad: drawDpad,
  joystick: drawJoystick,
  dice: drawDice,
  trophy: drawTrophy,
  console: drawConsole,
};

function buildIcons(width: number, height: number, layerCount: number, density: number, iconNames: GameIconName[]): IconInstance[] {
  const icons: IconInstance[] = [];
  LAYER_CONFIG.slice(0, layerCount).forEach((layer) => {
    const count = Math.max(2, Math.round(width * height * layer.countPerArea * density));
    for (let i = 0; i < count; i++) {
      icons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
        speed: layer.speed * (0.8 + Math.random() * 0.4),
        opacity: layer.baseOpacity,
        rotation: Math.random() * Math.PI * 2,
        type: iconNames[Math.floor(Math.random() * iconNames.length)],
      });
    }
  });
  return icons;
}

export default function GameIconsBackground({
  className,
  fixed = false,
  color = '#1a9e4a',
  density = 1,
  layerCount = 3,
  opacity = 1,
  icons = ALL_ICONS,
}: GameIconsBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconsRef = useRef<IconInstance[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, frameId = 0, lastTime = 0, visible = true;

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      iconsRef.current = buildIcons(width, height, layerCount, density, icons);
      if (reduceMotion) draw();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineJoin = 'round';
      for (const icon of iconsRef.current) {
        ctx!.save();
        ctx!.translate(icon.x, icon.y);
        ctx!.rotate(icon.rotation);
        ctx!.globalAlpha = icon.opacity * opacity;
        ctx!.lineWidth = Math.max(1.2, icon.size / 14);
        DRAW_FNS[icon.type](ctx!, icon.size);
        ctx!.restore();
      }
    }

    function tick(time: number) {
      if (!visible) { frameId = requestAnimationFrame(tick); return; }
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      for (const icon of iconsRef.current) {
        icon.y -= (icon.speed * dt) / 1000;
        if (icon.y < -icon.size) {
          icon.y = height + icon.size;
          icon.x = Math.random() * width;
        }
      }
      draw();
      frameId = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    resize();

    function handleVisibility() { visible = !document.hidden; }
    document.addEventListener('visibilitychange', handleVisibility);

    if (!reduceMotion) frameId = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(frameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, density, layerCount, opacity, icons]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: fixed ? 'fixed' : 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
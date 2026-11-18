// components/shop-scene/art.tsx
// Placeholder art for the shop scene, drawn as SVG so the whole room works with zero image files.
// Every layer shares one 1600×900 coordinate space (the 16:9 stage). To go to final art, replace a
// layer's component with an <img>/<Image> of the same size, cut from the illustration.
import type { CSSProperties } from 'react';
import styles from './shop-scene.module.css';
import type { ItemKind, Spot } from './spots';

const SVG_BASE = { viewBox: '0 0 1600 900', preserveAspectRatio: 'none', 'aria-hidden': true, focusable: false } as const;
const CART_COLORS = ['#067F3A', '#E2BA0A', '#F5F5F5', '#d9503f', '#38B26A', '#5aa0d9', '#E2BA0A', '#1c1b17'];

function Cartridge({ x, y, c, s = 1 }: { x: number; y: number; c: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect width="34" height="46" rx="3" fill={c} />
      <rect x="5" y="6" width="24" height="20" rx="2" fill="#0B0A07" opacity=".28" />
      <rect x="9" y="30" width="16" height="3" fill="#0B0A07" opacity=".35" />
      <rect x="8" y="42" width="18" height="4" fill="#0B0A07" opacity=".5" />
    </g>
  );
}

/* ── Layer 1: back wall, neon, back shelves, floor ──────────────────────────────────────────── */
export function WallArt() {
  const seams = Array.from({ length: 21 }, (_, i) => -1200 + i * 200);
  return (
    <svg {...SVG_BASE} className={styles.art}>
      <defs>
        <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#17332c" />
          <stop offset="1" stopColor="#0b1814" />
        </linearGradient>
        <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e2014" />
          <stop offset="1" stopColor="#120c07" />
        </linearGradient>
        <radialGradient id="signGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#E2BA0A" stopOpacity=".35" />
          <stop offset="1" stopColor="#E2BA0A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="560" fill="url(#wallG)" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={i * 40} y="0" width="2" height="560" fill="#000" opacity=".2" />
      ))}
      <rect y="0" width="1600" height="34" fill="#060807" opacity=".6" />
      <rect y="500" width="1600" height="60" fill="#0e211c" />
      <rect y="498" width="1600" height="4" fill="#E2BA0A" opacity=".25" />

      {/* floor, in perspective */}
      <rect y="560" width="1600" height="340" fill="url(#floorG)" />
      {seams.map((x) => (
        <line key={x} x1={800 + (x - 800) * 0.45} y1="560" x2={x} y2="900" stroke="#000" strokeOpacity=".35" strokeWidth="2" />
      ))}
      {[600, 655, 725, 815].map((y) => (
        <line key={y} x1="0" y1={y} x2="1600" y2={y} stroke="#000" strokeOpacity=".22" strokeWidth="2" />
      ))}
      <rect y="556" width="1600" height="8" fill="#060807" opacity=".7" />

      {/* back shelf wall behind Alexx */}
      <g opacity=".85">
        <rect x="520" y="250" width="560" height="10" fill="#2a1d12" />
        <rect x="520" y="400" width="560" height="10" fill="#2a1d12" />
        {Array.from({ length: 15 }, (_, i) => (
          <Cartridge key={`a${i}`} x={536 + i * 36} y={204} c={CART_COLORS[i % CART_COLORS.length]} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <Cartridge key={`b${i}`} x={536 + i * 36} y={354} c={CART_COLORS[(i * 3 + 2) % CART_COLORS.length]} />
        ))}
      </g>

      {/* posters (left wall) */}
      <g>
        <g transform="translate(150 96) rotate(-3)">
          <rect width="150" height="200" fill="#0B0A07" stroke="#E2BA0A" strokeWidth="4" />
          <rect x="14" y="14" width="122" height="120" fill="#067F3A" />
          <circle cx="75" cy="74" r="34" fill="#E2BA0A" />
          <rect x="52" y="60" width="46" height="28" rx="4" fill="#0B0A07" />
          <text x="75" y="170" textAnchor="middle" fill="#E2BA0A" fontSize="20" fontWeight="700" letterSpacing="3">WORLD TOUR</text>
        </g>
        <g transform="translate(330 112) rotate(2)">
          <rect width="120" height="160" fill="#F5F5F5" stroke="#0B0A07" strokeWidth="4" />
          <path d="M60 24 L72 58 L108 58 L79 80 L90 114 L60 94 L30 114 L41 80 L12 58 L48 58 Z" fill="#d9503f" />
          <text x="60" y="144" textAnchor="middle" fill="#0B0A07" fontSize="16" fontWeight="700" letterSpacing="2">HIGH SCORE</text>
        </g>
      </g>

      {/* neon sign */}
      <ellipse cx="800" cy="112" rx="420" ry="90" fill="url(#signGlow)" />
      <g className={styles.neon}>
        <text x="800" y="132" textAnchor="middle" fontSize="70" fontWeight="700" letterSpacing="12" fill="none" stroke="#E2BA0A" strokeWidth="3">
          GAMEBOY
        </text>
        <text x="800" y="182" textAnchor="middle" fontSize="34" fontWeight="700" letterSpacing="26" fill="none" stroke="#38B26A" strokeWidth="2" className={styles.neonFlicker}>
          RECORDS
        </text>
      </g>
    </svg>
  );
}

/* ── Layer 2: wall shelves with props ───────────────────────────────────────────────────────── */
export function ShelfArt() {
  return (
    <svg {...SVG_BASE} className={styles.art}>
      <g transform="translate(0 27)">
      {[{ x: 48, w: 592 }, { x: 928, w: 624 }].map((p) => (
        <g key={p.x}>
          <rect x={p.x} y="450" width={p.w} height="16" fill="#3b2816" />
          <rect x={p.x} y="450" width={p.w} height="4" fill="#6b4a2b" />
          <rect x={p.x} y="466" width={p.w} height="8" fill="#000" opacity=".35" />
          {[0.12, 0.5, 0.88].map((t) => (
            <path key={t} d={`M${p.x + p.w * t} 466 l0 40 l-26 -40 Z`} fill="#2a1d12" />
          ))}
        </g>
      ))}
      {/* left plank: cartridge stack between the crates */}
      {[0, 1, 2].map((i) => (
        <Cartridge key={i} x={384} y={404 - i * 14} c={CART_COLORS[i + 1]} s={1.1} />
      ))}
      {/* right plank: console, lamp, plant */}
      <g>
        <rect x="932" y="398" width="64" height="52" rx="6" fill="#d8d6cf" />
        <rect x="940" y="406" width="48" height="26" rx="2" fill="#13271f" />
        <circle cx="990" cy="440" r="4" fill="#d9503f" />
        <rect x="1230" y="424" width="14" height="26" fill="#2a1d12" />
        <path d="M1204 424 L1270 424 L1254 372 L1220 372 Z" fill="#E2BA0A" opacity=".85" />
        <ellipse cx="1237" cy="400" rx="60" ry="46" fill="#E2BA0A" opacity=".12" />
        <path d="M1412 450 l-8 -48 h48 l-8 48 Z" fill="#a8523a" />
        {[-34, -12, 10, 30].map((dx, i) => (
          <path key={dx} d={`M${1428} 402 Q${1428 + dx} ${360 - i * 6} ${1428 + dx * 1.4} ${344 - i * 8}`} stroke="#2c8a50" strokeWidth="10" strokeLinecap="round" fill="none" />
        ))}
      </g>
      </g>
    </svg>
  );
}

/* ── Layer 3: Alexx (placeholder figure; swap for a sprite sheet or alpha WebM) ─────────────── */
export function AlexxArt() {
  return (
    <svg {...SVG_BASE} className={styles.art}>
      <g className={styles.breathe}>
        {/* hoodie */}
        <path d="M672 620 L684 450 Q690 404 756 394 L844 394 Q910 404 916 450 L928 620 Z" fill="#0f3d27" />
        <path d="M756 394 Q800 430 844 394 L844 410 Q800 450 756 410 Z" fill="#0a2a1b" />
        <rect x="788" y="430" width="5" height="46" rx="2" fill="#E2BA0A" />
        <rect x="808" y="430" width="5" height="46" rx="2" fill="#E2BA0A" />
        <rect x="770" y="500" width="60" height="46" rx="8" fill="#067F3A" />
        <rect x="780" y="508" width="40" height="22" rx="2" fill="#0B0A07" opacity=".6" />
        <circle cx="806" cy="538" r="3" fill="#E2BA0A" />
        {/* neck */}
        <rect x="780" y="372" width="40" height="28" fill="#a96f4c" />
        {/* head: turns toward whatever you hover */}
        <g className={styles.head}>
          <rect x="746" y="286" width="108" height="96" rx="30" fill="#c18460" />
          {/* headphones */}
          <path d="M744 330 Q744 262 800 262 Q856 262 856 330" fill="none" stroke="#E2BA0A" strokeWidth="9" strokeLinecap="round" />
          <rect x="734" y="318" width="20" height="40" rx="9" fill="#0B0A07" />
          <rect x="846" y="318" width="20" height="40" rx="9" fill="#0B0A07" />
          {/* cap */}
          <path d="M752 300 Q752 248 800 248 Q848 248 848 300 Z" fill="#067F3A" />
          <path d="M748 300 L852 300 Q880 300 888 312 Q840 308 748 312 Z" fill="#05652E" />
          <rect x="787" y="266" width="26" height="18" rx="3" fill="#E2BA0A" />
          {/* eyes */}
          <ellipse cx="779" cy="340" rx="10" ry="8" fill="#F5F5F5" />
          <ellipse cx="821" cy="340" rx="10" ry="8" fill="#F5F5F5" />
          <g className={styles.pupils}>
            <circle cx="779" cy="341" r="4.5" fill="#0B0A07" />
            <circle cx="821" cy="341" r="4.5" fill="#0B0A07" />
          </g>
          <rect className={styles.lid} x="768" y="331" width="22" height="18" fill="#c18460" />
          <rect className={styles.lid} x="810" y="331" width="22" height="18" fill="#c18460" />
          <path d="M766 322 Q779 316 792 322" stroke="#2a1a10" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M808 322 Q821 316 834 322" stroke="#2a1a10" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M786 362 Q800 374 814 362" stroke="#2a1a10" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/* ── Layer 4: the wrap-around glass counter, with locked stock inside ───────────────────────── */
export function CounterArt() {
  return (
    <svg {...SVG_BASE} className={styles.art}>
      <defs>
        <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe9ff" stopOpacity=".22" />
          <stop offset=".45" stopColor="#bfe9ff" stopOpacity=".05" />
          <stop offset="1" stopColor="#bfe9ff" stopOpacity=".14" />
        </linearGradient>
        <linearGradient id="innerG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2c18" />
          <stop offset="1" stopColor="#1a120a" />
        </linearGradient>
        <linearGradient id="topG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b4a33" />
          <stop offset="1" stopColor="#3c2e1d" />
        </linearGradient>
      </defs>

      {/* side panels (the wrap) */}
      <polygon points="310,644 350,596 350,790 310,840" fill="url(#innerG)" />
      <polygon points="1290,644 1250,596 1250,790 1290,840" fill="url(#innerG)" />

      {/* inside of the front case */}
      <rect x="310" y="644" width="980" height="196" fill="url(#innerG)" />
      <rect x="310" y="644" width="980" height="196" fill="#E2BA0A" opacity=".05" />
      <rect x="318" y="742" width="964" height="6" fill="#bfe9ff" opacity=".25" />

      {/* stock: top shelf cartridges + trophy, bottom shelf handhelds */}
      {Array.from({ length: 19 }, (_, i) => (
        <Cartridge key={i} x={330 + i * 50} y={694} c={CART_COLORS[(i * 5) % CART_COLORS.length]} s={1.05} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} transform={`translate(${344 + i * 104} 770)`}>
          <rect width="74" height="54" rx="9" fill={['#d8d6cf', '#5b3fa0', '#067F3A'][i % 3]} />
          <rect x="9" y="7" width="40" height="30" rx="3" fill="#13271f" />
          <circle cx="60" cy="22" r="5" fill="#0B0A07" opacity=".5" />
          <rect x="12" y="42" width="14" height="4" rx="2" fill="#0B0A07" opacity=".4" />
        </g>
      ))}
      {/* padlocks and tags: everything in here is locked */}
      {[430, 800, 1170].map((x) => (
        <g key={x} transform={`translate(${x} 724)`}>
          <path d="M6 14 V8 a11 11 0 0 1 22 0 V14" fill="none" stroke="#E2BA0A" strokeWidth="5" />
          <rect y="14" width="34" height="26" rx="4" fill="#E2BA0A" />
          <circle cx="17" cy="26" r="4" fill="#0B0A07" />
        </g>
      ))}
      {[380, 640, 960, 1220].map((x) => (
        <g key={x} transform={`translate(${x} 750) rotate(-6)`}>
          <rect width="34" height="18" rx="2" fill="#F5F5F5" />
          <text x="17" y="13" textAnchor="middle" fill="#0B0A07" fontSize="11" fontWeight="700">RARE</text>
        </g>
      ))}

      {/* glass sheen + brass trim */}
      <rect x="310" y="644" width="980" height="196" fill="url(#glassG)" />
      <polygon points="360,644 440,644 380,840 300,840" fill="#fff" opacity=".05" />
      <polygon points="700,644 740,644 680,840 640,840" fill="#fff" opacity=".04" />
      <rect x="306" y="640" width="988" height="8" fill="#E2BA0A" opacity=".8" />
      <rect x="306" y="836" width="988" height="10" fill="#0B0A07" />
      <rect x="306" y="836" width="988" height="2" fill="#E2BA0A" opacity=".5" />
      <polygon points="310,644 350,596 350,790 310,840" fill="url(#glassG)" />
      <polygon points="1290,644 1250,596 1250,790 1290,840" fill="url(#glassG)" />

      {/* counter top */}
      <polygon points="350,596 1250,596 1290,644 310,644" fill="url(#topG)" />
      <polygon points="350,596 1250,596 1252,602 348,602" fill="#E2BA0A" opacity=".35" />
      {/* till */}
      <g transform="translate(1000 560)">
        <rect width="84" height="40" rx="4" fill="#d8d6cf" />
        <rect x="8" y="6" width="48" height="16" rx="2" fill="#13271f" />
        <rect x="8" y="26" width="68" height="8" rx="2" fill="#9a9890" />
      </g>

      {/* Alexx's forearms and the cartridge he is flipping */}
      <g>
        <path d="M690 600 Q712 626 760 622 L800 614 L840 622 Q888 626 910 600 L918 624 Q880 650 800 640 Q720 650 682 624 Z" fill="#0f3d27" />
        <ellipse cx="760" cy="620" rx="16" ry="11" fill="#c18460" />
        <ellipse cx="840" cy="620" rx="16" ry="11" fill="#c18460" />
        <g className={styles.flip}>
          <rect x="783" y="590" width="34" height="46" rx="3" fill="#E2BA0A" />
          <rect x="788" y="596" width="24" height="18" rx="2" fill="#0B0A07" opacity=".35" />
        </g>
      </g>
    </svg>
  );
}

/* ── Hanging lamps with warm light cones ────────────────────────────────────────────────────── */
export function LampArt() {
  return (
    <svg {...SVG_BASE} className={styles.art}>
      <defs>
        <linearGradient id="coneG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd96a" stopOpacity=".28" />
          <stop offset="1" stopColor="#ffd96a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[330, 800, 1270].map((x) => (
        <g key={x} className={styles.sway} style={{ transformOrigin: `${x}px 0px` }}>
          <line x1={x} y1="0" x2={x} y2="70" stroke="#0B0A07" strokeWidth="3" />
          <polygon points={`${x - 50},112 ${x + 50},112 ${x + 22},72 ${x - 22},72`} fill="#0B0A07" />
          <ellipse cx={x} cy="112" rx="50" ry="6" fill="#ffe9a0" />
          <polygon points={`${x - 48},114 ${x + 48},114 ${x + 280},620 ${x - 280},620`} fill="url(#coneG)" />
        </g>
      ))}
    </svg>
  );
}

/* ── Containers ─────────────────────────────────────────────────────────────────────────────── */
// Each container is two SVGs sharing a viewBox: the back (inner walls, basket handle) sits behind the
// popped items, the front (body, lid) sits over them so items appear to rise out of it.
export function ContainerBack({ spot }: { spot: Spot }) {
  const H = Math.round(200 / spot.aspect);
  const T = Math.round(H * 0.22);
  return (
    <svg viewBox={`0 0 200 ${H}`} className={styles.boxSvg} aria-hidden focusable={false}>
      {(spot.kind === 'crate' || spot.kind === 'case') && (
        <g>
          <path d={`M22 6 L178 6 L196 ${T} L4 ${T} Z`} fill={spot.dark} />
          <path d={`M22 6 L178 6 L178 12 L22 12 Z`} fill="#000" opacity=".35" />
        </g>
      )}
      {spot.kind === 'basket' && (
        <path d={`M30 ${T} Q100 -${Math.round(H * 0.2)} 170 ${T}`} fill="none" stroke={spot.dark} strokeWidth="9" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function ContainerFront({ spot }: { spot: Spot }) {
  const H = Math.round(200 / spot.aspect);
  const T = Math.round(H * 0.22);
  const bodyH = H - T;
  if (spot.kind === 'board') {
    return (
      <svg viewBox={`0 0 200 ${H}`} className={styles.boxSvg} aria-hidden focusable={false}>
        <rect x="2" y="2" width="196" height={H - 4} rx="8" fill={spot.base} stroke={spot.dark} strokeWidth="3" />
        <rect x="14" y="14" width="172" height={H - 28} rx="3" fill="#b88650" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={20 + ((i * 53) % 160)} cy={20 + ((i * 37) % (H - 40))} r="1.6" fill="#8a6030" opacity=".6" />
        ))}
        {[
          { x: 28, y: 26, r: -6, c: '#F5F5F5' },
          { x: 108, y: 30, r: 5, c: '#E2BA0A' },
          { x: 62, y: Math.round(H * 0.52), r: -3, c: '#38B26A' },
          { x: 128, y: Math.round(H * 0.56), r: 7, c: '#F5F5F5' },
        ].map((n, i) => (
          <g key={i} transform={`translate(${n.x} ${n.y}) rotate(${n.r})`}>
            <rect width="52" height="38" fill={n.c} />
            <rect x="6" y="12" width="40" height="3" fill="#0B0A07" opacity=".3" />
            <rect x="6" y="20" width="30" height="3" fill="#0B0A07" opacity=".3" />
            <circle cx="26" cy="5" r="3.5" fill={spot.accent} />
          </g>
        ))}
      </svg>
    );
  }
  if (spot.kind === 'basket') {
    return (
      <svg viewBox={`0 0 200 ${H}`} className={styles.boxSvg} aria-hidden focusable={false}>
        <path d={`M6 ${T} L194 ${T} L166 ${H} L34 ${H} Z`} fill={spot.base} />
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={6 + 28 * t} y1={T + bodyH * t} x2={194 - 28 * t} y2={T + bodyH * t} stroke={spot.dark} strokeWidth="3" opacity=".7" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={14 + i * 22} y1={T} x2={36 + i * 16} y2={H} stroke={spot.dark} strokeWidth="2" opacity=".45" />
        ))}
        <rect x="0" y={T - 7} width="200" height="14" rx="7" fill={spot.dark} />
        <rect x="68" y={T + bodyH * 0.36} width="64" height="26" rx="4" fill={spot.accent} />
        <text x="100" y={T + bodyH * 0.36 + 18} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0B0A07">CART</text>
      </svg>
    );
  }
  const isCase = spot.kind === 'case';
  return (
    <svg viewBox={`0 0 200 ${H}`} className={styles.boxSvg} aria-hidden focusable={false}>
      {/* body */}
      <rect x="4" y={T} width="192" height={bodyH} rx="5" fill={spot.base} />
      {[0.33, 0.66].map((t) => (
        <rect key={t} x="4" y={T + bodyH * t - 1.5} width="192" height="3" fill={spot.dark} opacity=".8" />
      ))}
      <rect x="4" y={T} width="192" height="10" fill="#000" opacity=".22" />
      {/* corner brackets */}
      {[8, 176].map((x) => (
        <g key={x}>
          <rect x={x} y={T + 4} width="16" height="16" rx="2" fill={spot.accent} opacity=".9" />
          <rect x={x} y={H - 20} width="16" height="16" rx="2" fill={spot.accent} opacity=".9" />
        </g>
      ))}
      {isCase ? (
        <g>
          <circle cx="100" cy={T + bodyH * 0.52} r={bodyH * 0.3} fill="#0B0A07" />
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx="100" cy={T + bodyH * 0.52} r={bodyH * (0.27 - i * 0.05)} fill="none" stroke="#3b3b45" strokeWidth="2" />
          ))}
          <circle cx="100" cy={T + bodyH * 0.52} r="5" fill={spot.accent} />
          <rect x="30" y={T + 14} width="14" height="8" rx="2" fill={spot.accent} />
          <rect x="156" y={T + 14} width="14" height="8" rx="2" fill={spot.accent} />
        </g>
      ) : (
        <g>
          <rect x="44" y={T + bodyH * 0.3} width="112" height={bodyH * 0.38} rx="4" fill={spot.accent} />
          <text x="100" y={T + bodyH * 0.3 + bodyH * 0.27} textAnchor="middle" fontSize={spot.plate.length > 3 ? 24 : 34} fontWeight="700" fill={spot.id === 'trivia' ? '#F5F5F5' : '#0B0A07'} letterSpacing="2">
            {spot.plate}
          </text>
        </g>
      )}
      {/* lid: swings up over its back edge when open */}
      <g className={styles.lid3d} style={{ transformOrigin: '100px 6px' }}>
        <path d={`M22 6 L178 6 L196 ${T} L4 ${T} Z`} fill={spot.base} stroke={spot.dark} strokeWidth="2" />
        <path d={`M22 6 L178 6 L184 12 L16 12 Z`} fill="#fff" opacity=".14" />
        <path d={`M70 6 L76 6 L80 ${T} L66 ${T} Z`} fill={spot.accent} opacity=".85" />
        <path d={`M124 6 L130 6 L134 ${T} L120 ${T} Z`} fill={spot.accent} opacity=".85" />
      </g>
    </svg>
  );
}

/* ── Items that pop out ─────────────────────────────────────────────────────────────────────── */
export function ItemArt({ kind, color }: { kind: ItemKind; color: string }) {
  const p = { viewBox: '0 0 100 100', className: styles.itemSvg, 'aria-hidden': true, focusable: false } as const;
  switch (kind) {
    case 'shirt':
      return (
        <svg {...p}>
          <path d="M30 10 L42 6 Q50 16 58 6 L70 10 L94 30 L80 44 L70 36 L70 94 L30 94 L30 36 L20 44 L6 30 Z" fill={color} stroke="#0B0A07" strokeWidth="3" strokeLinejoin="round" />
          <rect x="38" y="44" width="24" height="18" rx="2" fill={color === '#F5F5F5' || color === '#E2BA0A' ? '#0B0A07' : '#E2BA0A'} opacity=".9" />
        </svg>
      );
    case 'record':
      return (
        <svg {...p}>
          <circle cx="50" cy="50" r="46" fill="#111" stroke="#000" strokeWidth="2" />
          {[38, 30, 22].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#2c2c2c" strokeWidth="2" />
          ))}
          <circle cx="50" cy="50" r="15" fill={color} />
          <circle cx="50" cy="50" r="3" fill="#0B0A07" />
          <path d="M20 26 A36 36 0 0 1 40 16" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...p}>
          <path d="M8 24 H92 V42 a8 8 0 0 0 0 16 V76 H8 V58 a8 8 0 0 0 0 -16 Z" fill={color} stroke="#0B0A07" strokeWidth="3" />
          <line x1="68" y1="26" x2="68" y2="74" stroke="#0B0A07" strokeWidth="2" strokeDasharray="4 4" />
          <text x="36" y="56" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0B0A07">ADMIT</text>
          <text x="82" y="56" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0B0A07">1</text>
        </svg>
      );
    case 'mic':
      return (
        <svg {...p}>
          <rect x="43" y="46" width="14" height="48" rx="6" fill="#26262e" stroke="#0B0A07" strokeWidth="2.5" />
          <rect x="43" y="60" width="14" height="8" fill={color} />
          <circle cx="50" cy="28" r="22" fill="#9a9aa6" stroke="#0B0A07" strokeWidth="3" />
          {[-9, 0, 9].map((d) => (
            <line key={d} x1={50 + d} y1="10" x2={50 + d} y2="46" stroke="#0B0A07" strokeOpacity=".35" strokeWidth="2" />
          ))}
          <path d="M36 18 A18 18 0 0 1 48 10" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'block':
      return (
        <svg {...p}>
          <rect x="8" y="8" width="84" height="84" rx="8" fill={color} stroke="#0B0A07" strokeWidth="4" />
          {[18, 82].flatMap((x) => [18, 82].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill="#0B0A07" opacity=".5" />))}
          <text x="50" y="70" textAnchor="middle" fontSize="58" fontWeight="700" fill="#0B0A07">?</text>
        </svg>
      );
    case 'photo':
      return (
        <svg {...p}>
          <rect x="12" y="6" width="76" height="88" fill="#F5F5F5" stroke="#0B0A07" strokeWidth="3" />
          <rect x="20" y="14" width="60" height="56" fill={color} />
          <circle cx="40" cy="38" r="9" fill="#F5F5F5" opacity=".7" />
          <path d="M20 70 L42 48 L56 62 L66 52 L80 66 V70 Z" fill="#0B0A07" opacity=".3" />
          <circle cx="50" cy="8" r="5" fill="#d9503f" stroke="#7a1f16" strokeWidth="1.5" />
        </svg>
      );
    case 'bag':
      return (
        <svg {...p}>
          <path d="M34 28 V20 a16 16 0 0 1 32 0 V28" fill="none" stroke="#0B0A07" strokeWidth="5" />
          <path d="M16 28 H84 L90 94 H10 Z" fill={color} stroke="#0B0A07" strokeWidth="3" strokeLinejoin="round" />
          <rect x="34" y="50" width="32" height="22" rx="3" fill={color === '#F5F5F5' || color === '#E2BA0A' ? '#0B0A07' : '#E2BA0A'} />
        </svg>
      );
  }
}

/* ── Dust motes (deterministic, so server and client markup match) ──────────────────────────── */
export function dustMotes(n = 26): CSSProperties[] {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => ({
    left: `${(r() * 100).toFixed(1)}%`,
    top: `${(r() * 100).toFixed(1)}%`,
    width: `${(0.25 + r() * 0.35).toFixed(2)}cqw`,
    height: `${(0.25 + r() * 0.35).toFixed(2)}cqw`,
    animationDuration: `${(14 + r() * 18).toFixed(1)}s`,
    animationDelay: `-${(r() * 20).toFixed(1)}s`,
    opacity: 0.25 + r() * 0.5,
  }));
}

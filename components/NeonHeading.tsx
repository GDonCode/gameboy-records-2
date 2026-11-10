// components/NeonHeading.tsx
// The neon page title first used on the Shows page, shared by Shows, Shop and Discography.
// Styles live in app/globals.css under "NEON HEADING".

import type { CSSProperties, ReactNode } from 'react';

// Small deterministic hash, so the same title always gets the same "faulty" letters and timings
// (no Math.random: the server and browser must render identical markup).
function hash(text: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < text.length; k++) h = Math.imul(h ^ text.charCodeAt(k), 16777619);
  h = Math.imul(h ^ (i * 374761393), 2246822519);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967295; // 0..1
}

/**
 * Splits a title into letters. Like a real sign, most tubes stay steady and a few (about a quarter of the
 * letters, 1-4 per title) are a little tired: each stutters briefly every 6-12 seconds on its own rhythm.
 * Words stay together so lines still wrap between words. Screen readers get the plain title.
 */
function Letters({ text }: { text: string }) {
  const letters = text.replace(/\s+/g, ' ').trim();
  const chars = [...letters];

  // Pick the faulty tubes: the letters (not spaces or punctuation) with the lowest hash.
  const candidates = chars.map((ch, i) => ({ i, r: hash(letters, i) })).filter(({ i }) => /\p{L}|\p{N}/u.test(chars[i]));
  const count = Math.min(4, Math.max(1, Math.round(candidates.length / 4)));
  const faulty = new Set(candidates.sort((a, b) => a.r - b.r).slice(0, count).map((c) => c.i));

  let index = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {letters.split(' ').map((word, w) => {
          if (w > 0) index++; // the space
          return (
            <span key={w}>
              {w > 0 && ' '}
              <span className="whitespace-nowrap">
                {[...word].map((ch) => {
                  const i = index++;
                  const style = faulty.has(i)
                    ? ({
                        '--flutter-duration': `${(6 + hash(letters, i + 101) * 6).toFixed(2)}s`,
                        '--flutter-delay': `${(-hash(letters, i + 211) * 12).toFixed(2)}s`,
                      } as CSSProperties)
                    : undefined;
                  return (
                    <span key={i} className={faulty.has(i) ? 'neon-letter neon-letter--flutter' : 'neon-letter'} style={style}>
                      {ch}
                    </span>
                  );
                })}
              </span>
            </span>
          );
        })}
      </span>
    </>
  );
}

export default function NeonHeading({
  children,
  kicker,
  subtitle,
  align = 'center',
  size = 'lg',
  as: Tag = 'h1',
  className = '',
}: {
  /** Plain text gets the per-letter flutter; anything else is shown as is. */
  children: ReactNode;
  /** Small line above the title. */
  kicker?: ReactNode;
  /** Small line below the title, e.g. "by ALEXX A-GAME". */
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  size?: 'lg' | 'sm';
  as?: 'h1' | 'h2' | 'p';
  className?: string;
}) {
  const centered = align === 'center';
  const text = typeof children === 'string' ? children : Array.isArray(children) && children.every((c) => typeof c === 'string') ? children.join('') : null;
  return (
    <div className={`flex flex-col ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {kicker && <p className="neon-kicker mb-3 text-[11px] md:text-[12px]">{kicker}</p>}
      <Tag className={`neon-heading neon-heading--${size}`}>{text !== null ? <Letters text={text} /> : children}</Tag>
      {subtitle && <p className={`neon-kicker ${size === 'lg' ? 'mt-3 text-[11px] md:text-[13px]' : 'mt-1.5 text-[9px]'}`}>{subtitle}</p>}
    </div>
  );
}

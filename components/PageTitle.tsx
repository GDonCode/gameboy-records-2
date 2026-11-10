// components/PageTitle.tsx
// The page title used across the site: heavy type over a huge outlined copy of one word, with an optional
// small line above and below. `tone` matches the surface it sits on.
import type { ReactNode } from 'react';

export default function PageTitle({
  children,
  ghost,
  kicker,
  subtitle,
  tone = 'light',
  as: Tag = 'h1',
  id,
  className = '',
}: {
  children: ReactNode;
  /** The outlined word behind the title. Leave out for titles with no good single word. */
  ghost?: string;
  kicker?: ReactNode;
  subtitle?: ReactNode;
  /** `light` sits on paper; `dark` on ink or green. */
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {kicker && <p className={`eyebrow m-0 mb-3 ${dark ? 'text-gold' : 'text-green-deep'}`}>{kicker}</p>}
      <div className={`ghost-title w-full ${dark ? 'ghost-title--dark' : ''}`} style={{ minHeight: ghost ? undefined : '4.5rem' }}>
        {ghost && (
          <span className="ghost-title__ghost" aria-hidden="true">
            {ghost}
          </span>
        )}
        <Tag
          id={id}
          className={`relative m-0 display max-w-[18ch] text-[2.2rem] sm:text-[3rem] lg:text-[3.75rem] ${
            dark ? 'text-gold [text-shadow:3px_3px_0_var(--color-green-deep)]' : 'text-green-deep [text-shadow:3px_3px_0_var(--color-gold)]'
          }`}
        >
          {children}
        </Tag>
      </div>
      {subtitle && <p className={`eyebrow m-0 mt-3 ${dark ? 'text-mist' : 'text-stone'}`}>{subtitle}</p>}
    </div>
  );
}

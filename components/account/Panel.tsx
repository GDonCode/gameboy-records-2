// components/account/Panel.tsx
import type { ReactNode } from 'react';

/** `tone="light"` is for a heading that sits inside a white Panel; the default sits on the black page. */
export function TabHeading({ eyebrow, title, subtitle, tone = 'dark' }: { eyebrow?: string; title: string; subtitle?: string; tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <span
          className={`text-[0.75em] tracking-[0.25em] ${light ? 'text-[#05652E]' : 'text-[#E2BA0A]'}`}
          style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
        >
          {eyebrow}
        </span>
      )}
      <h1
        className={`text-[1.8em] leading-tight uppercase tracking-[0.04em] ${light ? 'text-[#0B0A07] [text-shadow:3px_3px_0_#E2BA0A]' : 'text-white [text-shadow:3px_3px_0_#05652E]'}`}
        style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className={`text-[0.95em] ${light ? 'text-[#0B0A07]/70' : 'text-white/60'}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bg-white text-[#0B0A07] border-2 border-white shadow-[6px_6px_0_#05652E] p-6 md:p-8 ${className}`}>
      {children}
    </section>
  );
}

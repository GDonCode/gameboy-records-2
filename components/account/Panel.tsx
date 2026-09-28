// components/account/Panel.tsx
import type { ReactNode } from 'react';

export function TabHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <span
          className="text-[0.75em] tracking-[0.25em] text-[#4dff91]"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          {eyebrow}
        </span>
      )}
      <h1
        className="text-[1.8em] leading-tight text-white"
        style={{ fontFamily: "'Hemisphers_Bold_Sans', 'Poppins', sans-serif" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[0.95em] text-white/60" style={{ fontFamily: "'Poppins', monospace" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bg-[#0f1a12] border border-[rgba(26,158,74,0.3)] rounded-[12px] p-6 md:p-8 ${className}`}>
      {children}
    </section>
  );
}

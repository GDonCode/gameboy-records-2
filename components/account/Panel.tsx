// components/account/Panel.tsx
import type { ReactNode } from 'react';

export function TabHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <span
          className="text-[0.75em] tracking-[0.25em] text-[#E2BA0A]"
          style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
        >
          {eyebrow}
        </span>
      )}
      <h1
        className="text-[1.8em] leading-tight uppercase tracking-[0.04em] text-white [text-shadow:3px_3px_0_#05652E]"
        style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[0.95em] text-white/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`panel-ink p-6 md:p-8 ${className}`}>
      {children}
    </section>
  );
}

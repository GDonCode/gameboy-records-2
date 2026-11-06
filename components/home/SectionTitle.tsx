// components/home/SectionTitle.tsx
// Section heading: the title in bold type over a huge outlined copy of the same word.
import type { ReactNode } from 'react';

export default function SectionTitle({
  ghost,
  id,
  children,
  tone = 'light',
}: {
  /** The big outlined word behind the title. Decorative, so hidden from screen readers. */
  ghost: string;
  id: string;
  children: ReactNode;
  /** `light` sits on paper; `dark` on ink or green. */
  tone?: 'light' | 'dark';
}) {
  return (
    <div className="ghost-title mb-10 md:mb-14">
      <span className="ghost-title__ghost" aria-hidden="true">
        {ghost}
      </span>
      <h2
        id={id}
        className={`relative m-0 display text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] ${
          tone === 'dark' ? 'text-gold [text-shadow:3px_3px_0_var(--color-green-deep)]' : 'text-green-deep [text-shadow:3px_3px_0_var(--color-gold)]'
        }`}
      >
        {children}
      </h2>
    </div>
  );
}

// components/NeonHeading.tsx
// The neon page title first used on the Shows page, shared by Shows, Shop and Discography.
// Styles live in app/globals.css under "NEON HEADING".

import type { ReactNode } from 'react';

export default function NeonHeading({
  children,
  kicker,
  subtitle,
  align = 'center',
  size = 'lg',
  as: Tag = 'h1',
  className = '',
}: {
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
  return (
    <div className={`flex flex-col ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {kicker && <p className="neon-kicker mb-3 text-[11px] md:text-[12px]">{kicker}</p>}
      <Tag className={`neon-heading neon-heading--${size}`}>{children}</Tag>
      {subtitle && <p className={`neon-kicker ${size === 'lg' ? 'mt-3 text-[11px] md:text-[13px]' : 'mt-1.5 text-[9px]'}`}>{subtitle}</p>}
    </div>
  );
}

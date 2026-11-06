// components/ui/Button.tsx
// The one button/link style for the site. The box never moves; the label inside zooms on hover and focus.
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** The site is dark-first: `primary`, `light`, `outline` and `text` sit on ink; `dark`, `outline-dark` and `text-dark` on paper/bone. */
export type ButtonVariant = 'primary' | 'green' | 'light' | 'dark' | 'outline' | 'outline-dark' | 'text' | 'text-dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'zoom-content relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap font-semibold uppercase tracking-[0.16em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

const VARIANTS: Record<ButtonVariant, string> = {
  // Primary call to action: gold with ink text (white on this gold would be unreadable).
  primary: 'rounded-xs bg-gold text-ink hover:bg-[#F0C928]',
  // Deep green with paper text (7:1), for the main action on paper.
  green: 'rounded-xs bg-green-deep text-paper hover:bg-green',
  light: 'rounded-xs bg-paper text-ink hover:bg-[#E6E6E6]',
  dark: 'rounded-xs bg-ink text-paper hover:bg-ink-3',
  outline: 'rounded-xs border border-paper/50 text-paper hover:border-paper hover:bg-paper/[0.06]',
  'outline-dark': 'rounded-xs border border-ink/60 text-ink hover:border-ink hover:bg-ink/[0.04]',
  text: 'text-paper underline decoration-paper/40 underline-offset-[6px] hover:decoration-paper',
  'text-dark': 'text-ink underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-10 px-5 text-[0.7rem]',
  md: 'h-12 px-7 text-[0.75rem]',
  lg: 'h-14 px-9 text-[0.8rem]',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  const isText = variant === 'text' || variant === 'text-dark';
  return `${BASE} ${VARIANTS[variant]} ${isText ? 'h-auto px-0 text-[0.75rem]' : SIZES[size]} ${extra}`.trim();
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type AsLink = CommonProps & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>;
type AsButton = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

/** Renders a Next link for internal paths, an anchor for external ones, or a button. */
export default function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', className = '', children } = props;
  const cls = buttonClass(variant, size, className);
  const inner = <span className="inline-flex items-center gap-2.5">{children}</span>;

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as AsLink;
    const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
    if (isExternal) {
      return (
        <a href={href} className={cls} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, className: _c, children: _ch, type = 'button', ...rest } = props as AsButton;
  return (
    <button type={type} className={cls} {...rest}>
      {inner}
    </button>
  );
}

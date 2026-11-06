'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Disc3,
  Info,
  Menu,
  Mic,
  Shirt,
  ShoppingCart,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useCartCount } from '@/lib/cart-sync';
import { NAV, SITE_NAME, VIBES_NAV } from '@/lib/site';

// ── Tokens ────────────────────────────────────────────────────────────────────
// Ink #0B0A07 on cream is ~9:1; the active/hover green #05652E is ~5:1, so both pass WCAG AA.
const SEMIBOLD = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;
const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#067F3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F5]';

type NavItem = { href: string; label: string; icon: LucideIcon; blurb?: string };

const PRIMARY_ICONS: Record<string, LucideIcon> = { '/shows': CalendarDays, '/shop': Shirt, '/music': Disc3, '/about': Info };
const PRIMARY: NavItem[] = NAV.map((n) => ({ href: n.href, label: n.label, icon: PRIMARY_ICONS[n.href] ?? Info }));

const VIBE_META: Record<string, { icon: LucideIcon; blurb: string }> = {
  '/karaoke': { icon: Mic, blurb: 'Sing along to the catalogue' },
  '/trivia': { icon: CircleHelp, blurb: 'How well do you know the label?' },
};
const VIBES: NavItem[] = VIBES_NAV.map((n) => ({ href: n.href, label: n.label, icon: VIBE_META[n.href].icon, blurb: VIBE_META[n.href].blurb }));

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Brand ─────────────────────────────────────────────────────────────────────
// The logo is on a white ground, so it is multiplied into the paper and the grain shows through.
function Brand() {
  return (
    <Link href="/" aria-label={`${SITE_NAME} — home`} className={`flex shrink-0 items-center rounded-xs ${FOCUS}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/gameboy-records-logo.jpg" alt="" width={1600} height={325} className="h-[30px] w-auto mix-blend-multiply lg:h-[38px]" />
    </Link>
  );
}

// Four-tone strip along the bottom edge: the logo's black, green, yellow and white.
function LcdStrip() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[3px]" aria-hidden="true">
      <span className="flex-1 bg-[#0B0A07]" />
      <span className="flex-1 bg-[#067F3A]" />
      <span className="flex-1 bg-[#E2BA0A]" />
      <span className="flex-1 bg-[#F5F5F5] shadow-[inset_0_-1px_0_#0B0A07]" />
    </div>
  );
}

function CartBadge({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#A3322A] px-1 text-[0.7rem] font-bold leading-none text-white ring-2 ring-[#F5F5F5] ${className}`}
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Live cart total: updates instantly from the shop/cart pages, no refresh needed.
  const liveCartCount = useCartCount(session?.user?.id);
  const cartCount = session ? liveCartCount : 0;
  const cartLabel = cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Cart';
  const accountHref = session ? '/account' : '/account/login';
  const initial = session?.user?.name?.trim().charAt(0).toUpperCase() || null;

  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [vibesOpen, setVibesOpen] = useState(false);
  const lastScrollY = useRef(0);
  const vibesRef = useRef<HTMLLIElement>(null);
  const vibesButtonRef = useRef<HTMLButtonElement>(null);
  const vibesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vibesOpenedByHover = useRef(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Phones: slide the header away while scrolling down, bring it back on scroll up.
  useEffect(() => {
    lastScrollY.current = 0;
    function handleScroll(e: Event) {
      const target = e.target as HTMLElement | Document;
      const currentY = target instanceof Document ? window.scrollY : (target as HTMLElement).scrollTop;
      setHidden(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
    }
    // capture: true — scroll events on nested overflow-auto containers don't bubble,
    // but capturing listeners still see them.
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  // Escape closes whichever menu is open and hands focus back to its trigger.
  useEffect(() => {
    if (!menuOpen && !vibesOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (vibesOpen) {
        setVibesOpen(false);
        vibesButtonRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen, vibesOpen]);

  // Click outside the VIBES menu closes it.
  useEffect(() => {
    if (!vibesOpen) return;
    function handlePointer(e: PointerEvent) {
      if (!vibesRef.current?.contains(e.target as Node)) setVibesOpen(false);
    }
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [vibesOpen]);

  // Opening the phone menu moves focus into it.
  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>('a')?.focus();
  }, [menuOpen]);

  // Hover opens VIBES on pointer devices; a short delay lets the cursor cross the gap.
  function openVibesOnHover(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    if (vibesCloseTimer.current) clearTimeout(vibesCloseTimer.current);
    if (!vibesOpen) vibesOpenedByHover.current = true;
    setVibesOpen(true);
  }
  function closeVibesOnLeave(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    vibesCloseTimer.current = setTimeout(() => {
      vibesOpenedByHover.current = false;
      setVibesOpen(false);
    }, 150);
  }
  // A click right after hover-open would otherwise toggle the menu shut; keep it open instead.
  function toggleVibes() {
    if (vibesOpenedByHover.current) {
      vibesOpenedByHover.current = false;
      setVibesOpen(true);
      return;
    }
    setVibesOpen((v) => !v);
  }

  const vibesActive = VIBES.some((v) => isActive(pathname, v.href));

  const linkBase = `relative inline-flex h-11 items-center rounded-md px-3 text-[0.9rem] tracking-[0.12em] transition-colors duration-200 lg:px-4 lg:text-[0.98rem]
    after:absolute after:inset-x-3 after:bottom-1 after:h-[3px] after:origin-center after:rounded-full after:bg-[#067F3A] after:transition-transform after:duration-200 lg:after:inset-x-4
    ${FOCUS}`;
  const linkState = (active: boolean) =>
    active ? 'text-[#05652E] after:scale-x-100' : 'text-[#0B0A07] after:scale-x-0 hover:text-[#05652E] hover:after:scale-x-100';

  return (
    <>
      {/* Phone menu scrim */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[35] bg-[#0B0A07]/55 backdrop-blur-[2px] lg:hidden motion-safe:animate-[gbr-fade_200ms_ease-out]"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header
        className={`on-light sticky top-0 z-40 flex-shrink-0 paper text-[#0B0A07] transition-transform duration-300 ease-in-out lg:translate-y-0 ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="relative flex h-[60px] items-center gap-3 pb-[3px] pl-4 pr-3 md:h-[72px] lg:gap-2 lg:px-8">
          <Brand />

          {/* ── Desktop nav ── */}
          <nav aria-label="Main" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-0.5 lg:gap-1">
              {PRIMARY.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`${linkBase} ${linkState(active)}`}
                      style={SEMIBOLD}
                    >
                      {item.label.toUpperCase()}
                    </Link>
                  </li>
                );
              })}

              <li ref={vibesRef} className="relative" onPointerEnter={openVibesOnHover} onPointerLeave={closeVibesOnLeave}>
                <button
                  ref={vibesButtonRef}
                  type="button"
                  aria-expanded={vibesOpen}
                  aria-controls="vibes-menu"
                  onClick={toggleVibes}
                  className={`${linkBase} ${linkState(vibesActive)} gap-1.5 ${vibesOpen ? 'text-[#05652E]' : ''}`}
                  style={SEMIBOLD}
                >
                  VIBES
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${vibesOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.75}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id="vibes-menu"
                  hidden={!vibesOpen}
                  className="absolute right-0 top-full z-50 pt-2 lg:left-1/2 lg:right-auto lg:-translate-x-1/2"
                >
                  <ul className="w-[300px] overflow-hidden rounded-xl border border-[#0B0A07]/10 bg-[#FFFFFF] p-1.5 shadow-[0_18px_40px_-12px_rgba(15,61,34,0.35)] motion-safe:animate-[gbr-drop_160ms_ease-out]">
                    {VIBES.map((item) => {
                      const active = isActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => setVibesOpen(false)}
                            className={`group flex items-center gap-3 rounded-lg p-2.5 transition-colors duration-150 ${FOCUS} ${
                              active ? 'bg-[#067F3A]/12' : 'hover:bg-[#067F3A]/8'
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                active ? 'bg-[#067F3A] text-white' : 'bg-[#067F3A]/12 text-[#05652E] group-hover:bg-[#067F3A] group-hover:text-white'
                              }`}
                            >
                              <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[0.9rem] tracking-[0.12em] text-[#0B0A07]" style={SEMIBOLD}>
                                {item.label.toUpperCase()}
                              </span>
                              <span className="block text-[0.8rem] text-[#0B0A07]/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                {item.blurb}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* ── Desktop utilities ── */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="mx-2 h-7 w-px bg-[#0B0A07]/15 lg:mx-3" aria-hidden="true" />

            {session ? (
              <Link
                href={accountHref}
                aria-label="Your account"
                aria-current={isActive(pathname, '/account') ? 'page' : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0B0A07]/20 text-[#0B0A07] transition-colors duration-200 hover:border-[#067F3A] hover:bg-[#067F3A]/10 ${FOCUS}`}
              >
                {initial ? (
                  <span className="text-[1rem] leading-none" style={SEMIBOLD}>{initial}</span>
                ) : (
                  <User className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                )}
              </Link>
            ) : (
              <Link
                href={accountHref}
                aria-label="Sign in"
                className={`flex h-11 items-center gap-2 rounded-full border-2 border-[#0B0A07]/20 px-3 text-[#0B0A07] transition-colors duration-200 hover:border-[#067F3A] hover:bg-[#067F3A]/10 lg:px-4 ${FOCUS}`}
              >
                <User className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                <span className="hidden text-[0.85rem] tracking-[0.12em] lg:inline" style={SEMIBOLD}>
                  SIGN IN
                </span>
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={cartLabel}
              aria-current={isActive(pathname, '/cart') ? 'page' : undefined}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-[#067F3A] text-white shadow-[0_3px_0_#044F24] transition-[transform,box-shadow,background-color] duration-100 hover:bg-[#05652E] active:translate-y-[3px] active:shadow-none ${FOCUS}`}
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
              <CartBadge count={cartCount} className="absolute -right-1.5 -top-1.5" />
            </Link>
          </div>

          {/* ── Phone actions ── */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <Link
              href="/cart"
              aria-label={cartLabel}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full text-[#0B0A07] transition-colors hover:bg-[#067F3A]/10 ${FOCUS}`}
            >
              <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={2.25} aria-hidden="true" />
              <CartBadge count={cartCount} className="absolute right-0 top-0" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${FOCUS} ${
                menuOpen ? 'bg-[#0B0A07] text-white' : 'bg-[#067F3A] text-white'
              }`}
            >
              {menuOpen ? (
                <X className="h-[22px] w-[22px]" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Menu className="h-[22px] w-[22px]" strokeWidth={2.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <LcdStrip />

        {/* ── Phone menu sheet ── */}
        {menuOpen && (
          <div
            ref={menuRef}
            id="mobile-menu"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto rounded-b-xl paper shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)] lg:hidden motion-safe:animate-[gbr-drop_200ms_ease-out]"
          >
            <nav aria-label="Mobile" className="px-3 pb-4 pt-2">
              <MobileGroup items={PRIMARY} pathname={pathname} onNavigate={() => setMenuOpen(false)} />

              <p className="px-3 pb-1 pt-4 text-[0.7rem] tracking-[0.3em] text-[#05652E]" style={SEMIBOLD}>
                VIBES
              </p>
              <MobileGroup items={VIBES} pathname={pathname} onNavigate={() => setMenuOpen(false)} />

              <div className="mt-4 border-t border-[#0B0A07]/15 px-1 pt-4">
                {session ? (
                  <Link
                    href={accountHref}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl bg-white/60 p-3 text-[#0B0A07] ${FOCUS}`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#067F3A] text-white" aria-hidden="true">
                      {initial ? <span style={SEMIBOLD}>{initial}</span> : <User className="h-5 w-5" strokeWidth={2.25} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.95rem] tracking-[0.1em]" style={SEMIBOLD}>YOUR ACCOUNT</span>
                      {session.user?.name && (
                        <span className="block truncate text-[0.8rem] text-[#0B0A07]/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {session.user.name}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#0B0A07]/50" aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account/login"
                      onClick={() => setMenuOpen(false)}
                      className={`flex h-12 items-center justify-center rounded-full bg-[#067F3A] text-[0.95rem] tracking-[0.14em] text-white shadow-[0_3px_0_#044F24] active:translate-y-[3px] active:shadow-none ${FOCUS}`}
                      style={SEMIBOLD}
                    >
                      SIGN IN
                    </Link>
                    <Link
                      href="/account/login?mode=register"
                      onClick={() => setMenuOpen(false)}
                      className={`flex h-11 items-center justify-center rounded-full text-[0.9rem] text-[#0B0A07] underline-offset-4 hover:underline ${FOCUS}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      New here? Create an account
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <style>{`
        @keyframes gbr-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gbr-drop { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
      `}</style>
    </>
  );
}

function MobileGroup({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate: () => void }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[52px] items-center gap-3.5 rounded-xl px-3 text-[1rem] tracking-[0.12em] transition-colors ${FOCUS} ${
                active ? 'bg-[#067F3A] text-white' : 'text-[#0B0A07] active:bg-[#067F3A]/12'
              }`}
              style={SEMIBOLD}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? '' : 'text-[#05652E]'}`} strokeWidth={2.25} aria-hidden="true" />
              <span className="flex-1">{item.label.toUpperCase()}</span>
              {active && <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

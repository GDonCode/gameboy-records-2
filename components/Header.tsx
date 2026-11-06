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
  House,
  Menu,
  Mic,
  Shirt,
  ShoppingCart,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useCartCount } from '@/lib/cart-sync';

const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

// ── Tokens ────────────────────────────────────────────────────────────────────
// Ink #16432a on cream is ~9:1; the active/hover green #12733a is ~5:1, so both pass WCAG AA.
const SEMIBOLD = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;
const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#1a9e4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDEAE0]';

type NavItem = { href: string; label: string; icon: LucideIcon; blurb?: string };

const PRIMARY: NavItem[] = [
  { href: '/shows', label: 'Shows', icon: CalendarDays },
  { href: '/shop', label: 'Shop', icon: Shirt },
  { href: '/discography', label: 'Discography', icon: Disc3 },
];

const VIBES: NavItem[] = [
  { href: '/karaoke', label: 'Karaoke', icon: Mic, blurb: 'Sing along to the catalogue' },
  { href: '/trivia', label: 'Trivia', icon: CircleHelp, blurb: 'How well do you know the label?' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Brand lockup ──────────────────────────────────────────────────────────────
// The source logo is a controller with a hand-drawn word underneath that turns to noise at
// header size, so we crop to the controller and set the name in type beside it.
function Brand() {
  return (
    <Link href="/" aria-label="Gameboy Records home" className={`flex shrink-0 items-center gap-2.5 rounded-md ${FOCUS}`}>
      <span className="relative block aspect-[149/97] w-[46px] overflow-hidden md:w-[54px]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${MEDIA_BASE}/gameboy-logo-removebg-preview.png`}
          alt=""
          className="absolute left-0 top-[-21%] block h-auto w-full max-w-none"
        />
      </span>
      <span className="flex flex-col leading-none md:hidden lg:flex" aria-hidden="true">
        <span className="text-[1.02rem] tracking-[0.1em] text-[#16432a] lg:text-[1.15rem]" style={SEMIBOLD}>
          GAMEBOY
        </span>
        <span className="mt-[3px] text-[0.6rem] tracking-[0.5em] text-[#12733a] lg:text-[0.66rem]" style={SEMIBOLD}>
          RECORDS
        </span>
      </span>
    </Link>
  );
}

// Four-tone strip along the bottom edge, a nod to a handheld LCD's four shades of green.
// All four tones stay visible against both the cream bar and the dark pages below it.
function LcdStrip() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[3px]" aria-hidden="true">
      <span className="flex-1 bg-[#1a9e4a]" />
      <span className="flex-1 bg-[#3fb86a]" />
      <span className="flex-1 bg-[#7fd197]" />
      <span className="flex-1 bg-[#b9e6c4]" />
    </div>
  );
}

function CartBadge({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d62d20] px-1 text-[0.7rem] font-bold leading-none text-white ring-2 ring-[#EDEAE0] ${className}`}
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
    after:absolute after:inset-x-3 after:bottom-1 after:h-[3px] after:origin-center after:rounded-full after:bg-[#1a9e4a] after:transition-transform after:duration-200 lg:after:inset-x-4
    ${FOCUS}`;
  const linkState = (active: boolean) =>
    active ? 'text-[#12733a] after:scale-x-100' : 'text-[#16432a] after:scale-x-0 hover:text-[#12733a] hover:after:scale-x-100';

  return (
    <>
      {/* Phone menu scrim */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[35] bg-[#0b120d]/55 backdrop-blur-[2px] md:hidden motion-safe:animate-[gbr-fade_200ms_ease-out]"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header
        className={`fixed left-0 right-0 top-0 z-40 flex-shrink-0 bg-[#EDEAE0] transition-transform duration-300 ease-in-out md:sticky md:translate-y-0 ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="relative z-[1] flex h-[60px] items-center gap-3 pb-[3px] pl-4 pr-3 md:h-[72px] md:gap-2 md:px-6 lg:px-8">
          <Brand />

          {/* ── Desktop nav ── */}
          <nav aria-label="Main" className="ml-auto hidden md:block">
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
                  className={`${linkBase} ${linkState(vibesActive)} gap-1.5 ${vibesOpen ? 'text-[#12733a]' : ''}`}
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
                  <ul className="w-[300px] overflow-hidden rounded-xl border border-[#16432a]/10 bg-[#FBF9F3] p-1.5 shadow-[0_18px_40px_-12px_rgba(15,61,34,0.35)] motion-safe:animate-[gbr-drop_160ms_ease-out]">
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
                              active ? 'bg-[#1a9e4a]/12' : 'hover:bg-[#1a9e4a]/8'
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                active ? 'bg-[#1a9e4a] text-white' : 'bg-[#1a9e4a]/12 text-[#12733a] group-hover:bg-[#1a9e4a] group-hover:text-white'
                              }`}
                            >
                              <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[0.9rem] tracking-[0.12em] text-[#16432a]" style={SEMIBOLD}>
                                {item.label.toUpperCase()}
                              </span>
                              <span className="block text-[0.8rem] text-[#16432a]/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
          <div className="hidden items-center gap-2 md:flex">
            <span className="mx-2 h-7 w-px bg-[#16432a]/15 lg:mx-3" aria-hidden="true" />

            {session ? (
              <Link
                href={accountHref}
                aria-label="Your account"
                aria-current={isActive(pathname, '/account') ? 'page' : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#16432a]/20 text-[#16432a] transition-colors duration-200 hover:border-[#1a9e4a] hover:bg-[#1a9e4a]/10 ${FOCUS}`}
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
                className={`flex h-11 items-center gap-2 rounded-full border-2 border-[#16432a]/20 px-3 text-[#16432a] transition-colors duration-200 hover:border-[#1a9e4a] hover:bg-[#1a9e4a]/10 lg:px-4 ${FOCUS}`}
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
              className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1a9e4a] text-white shadow-[0_3px_0_#0f5c2c] transition-[transform,box-shadow,background-color] duration-100 hover:bg-[#178f42] active:translate-y-[3px] active:shadow-none ${FOCUS}`}
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
              <CartBadge count={cartCount} className="absolute -right-1.5 -top-1.5" />
            </Link>
          </div>

          {/* ── Phone actions ── */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <Link
              href="/cart"
              aria-label={cartLabel}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full text-[#16432a] transition-colors hover:bg-[#1a9e4a]/10 ${FOCUS}`}
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
                menuOpen ? 'bg-[#16432a] text-white' : 'bg-[#1a9e4a] text-white'
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
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-60px)] overflow-y-auto rounded-b-2xl bg-[#EDEAE0] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)] md:hidden motion-safe:animate-[gbr-drop_200ms_ease-out]"
          >
            <nav aria-label="Mobile" className="px-3 pb-4 pt-2">
              <MobileGroup items={[{ href: '/', label: 'Home', icon: House }, ...PRIMARY]} pathname={pathname} onNavigate={() => setMenuOpen(false)} />

              <p className="px-3 pb-1 pt-4 text-[0.7rem] tracking-[0.3em] text-[#12733a]" style={SEMIBOLD}>
                VIBES
              </p>
              <MobileGroup items={VIBES} pathname={pathname} onNavigate={() => setMenuOpen(false)} />

              <div className="mt-4 border-t border-[#16432a]/15 px-1 pt-4">
                {session ? (
                  <Link
                    href={accountHref}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl bg-white/60 p-3 text-[#16432a] ${FOCUS}`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a9e4a] text-white" aria-hidden="true">
                      {initial ? <span style={SEMIBOLD}>{initial}</span> : <User className="h-5 w-5" strokeWidth={2.25} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.95rem] tracking-[0.1em]" style={SEMIBOLD}>YOUR ACCOUNT</span>
                      {session.user?.name && (
                        <span className="block truncate text-[0.8rem] text-[#16432a]/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {session.user.name}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#16432a]/50" aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account/login"
                      onClick={() => setMenuOpen(false)}
                      className={`flex h-12 items-center justify-center rounded-full bg-[#1a9e4a] text-[0.95rem] tracking-[0.14em] text-white shadow-[0_3px_0_#0f5c2c] active:translate-y-[3px] active:shadow-none ${FOCUS}`}
                      style={SEMIBOLD}
                    >
                      SIGN IN
                    </Link>
                    <Link
                      href="/account/login?mode=register"
                      onClick={() => setMenuOpen(false)}
                      className={`flex h-11 items-center justify-center rounded-full text-[0.9rem] text-[#16432a] underline-offset-4 hover:underline ${FOCUS}`}
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
                active ? 'bg-[#1a9e4a] text-white' : 'text-[#16432a] active:bg-[#1a9e4a]/12'
              }`}
              style={SEMIBOLD}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? '' : 'text-[#12733a]'}`} strokeWidth={2.25} aria-hidden="true" />
              <span className="flex-1">{item.label.toUpperCase()}</span>
              {active && <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

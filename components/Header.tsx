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
import { LOGO_URL, NAV, PAPER_LOGO_URL, SITE_NAME, VIBES_NAV } from '@/lib/site';

// ── Tokens ────────────────────────────────────────────────────────────────────
// On Home the header floats over the hero film: the nav links and cart/account each sit on their own
// frosted-white panel with black content so they stay readable over every scene (the logo carries its own paper
// frame); Sign in keeps its solid green.
// The same style is used on every page; only Home floats it over the page.
const NEON_TEXT = { color: '#0B0A07' } as const;
const GLASS = 'bg-white/80 backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]';
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

// ── Scrapbook lettering ───────────────────────────────────────────────────────
// Each letter is cut from the crumpled-paper stock (the texture is the letter's fill) and set a little off-kilter,
// with a dark cut edge and soft shadow so it reads over any frame of the film. No backing panel.
const TILT = [-4, 3, -2, 4, -3, 2, -5, 3, -2, 4];
const LIFT = [0, 1, -1, 1, 0, -1, 1, 0, -1, 1];
const CUTOUT_SHADOW =
  'drop-shadow(0 0 0.5px rgba(11,10,7,0.95)) drop-shadow(1px 1px 0 rgba(11,10,7,0.8)) drop-shadow(0 3px 5px rgba(0,0,0,0.5))';

function PaperWord({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ filter: CUTOUT_SHADOW }}>
      <span aria-hidden="true">
        {Array.from(text).map((ch, i) =>
          ch === ' ' ? (
            <span key={i} className="inline-block w-[0.5em]" />
          ) : (
            <span
              key={i}
              className="inline-block font-bold"
              style={{
                color: 'transparent',
                backgroundImage: "url('/brand/paper-texture.webp')",
                backgroundSize: '260px auto',
                backgroundPosition: `${(i * 53) % 200}px ${(i * 31) % 120}px`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                transform: `translateY(${LIFT[i % LIFT.length]}px) rotate(${TILT[i % TILT.length]}deg)`,
                padding: '0 0.04em',
              }}
            >
              {ch}
            </span>
          ),
        )}
      </span>
      <span className="sr-only">{text}</span>
      {children}
    </span>
  );
}

// ── Brand ─────────────────────────────────────────────────────────────────────
function Brand({ glass }: { glass: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — home`}
      className={`flex shrink-0 ${glass ? 'self-start items-start' : 'items-center'} ${glass ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]' : 'rounded-xs'} ${FOCUS}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={glass ? PAPER_LOGO_URL : LOGO_URL}
        alt=""
        className={glass ? 'h-[46px] w-auto lg:h-[58px]' : 'h-[30px] w-auto lg:h-[38px]'}
        {...(glass ? {} : { width: 1022, height: 168 })}
      />
    </Link>
  );
}

function CartBadge({ count, className = '' }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#A3322A] px-1 text-[0.7rem] font-bold leading-none text-white ring-2 ring-white ${className}`}
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  // One header style site-wide. Only Home floats it over the hero film; elsewhere it stays in the page flow.
  const overlay = true;
  const onHome = pathname === '/';
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

  // Phones: slide the header away while the page scrolls down, bring it back on scroll up. It always shows
  // on load, and scrolling inside a panel (the Music crate, say) never hides it.
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    function handleScroll() {
      const currentY = window.scrollY;
      setHidden(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100';

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
        className={`${
          onHome ? 'fixed inset-x-0 top-0 z-40 text-[#0B0A07]' : 'sticky top-0 z-40 flex-shrink-0 text-[#0B0A07]'
        } transition-transform duration-300 ease-in-out lg:translate-y-0 ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className={`relative flex h-[60px] gap-3 md:h-[72px] ${overlay ? 'items-start lg:gap-0' : 'items-center pl-4 pr-3 lg:gap-2 lg:px-8'}`}>
          <Brand glass={overlay} />

          {/* ── Desktop nav ── */}
          <nav aria-label="Main" className={`ml-auto hidden lg:block ${overlay ? 'h-12' : ''}`}>
            <ul className={`flex items-center gap-0.5 lg:gap-1 ${overlay ? 'h-12 px-2' : ''}`}>
              {PRIMARY.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`${linkBase} ${linkState(active)}`}
                      style={{ ...SEMIBOLD, ...NEON_TEXT }}
                    >
                      <PaperWord text={item.label.toUpperCase()} />
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
                  className={`${linkBase} ${linkState(vibesActive || vibesOpen)} gap-1.5`}
                  style={{ ...SEMIBOLD, ...NEON_TEXT }}
                >
                  <PaperWord text="VIBES">
                    <ChevronDown
                      className={`h-4 w-4 text-[#F5F5F5] transition-transform duration-200 ${vibesOpen ? 'rotate-180' : ''}`}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </PaperWord>
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
          <div className={`hidden lg:flex ${overlay ? `h-12 items-stretch bg-[#067F3A] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]` : 'items-center gap-2'}`}>
            {!overlay && <span className="mx-2 h-7 w-px bg-[#0B0A07]/20 lg:mx-3" aria-hidden="true" />}

            {session ? (
              <Link
                href={accountHref}
                aria-label="Your account"
                aria-current={isActive(pathname, '/account') ? 'page' : undefined}
                className={`flex items-center justify-center transition-colors duration-200 ${
                  overlay ? 'w-16 text-white hover:bg-white/10' : 'h-11 w-11'} ${overlay ? '' : 'rounded-full border-2 border-[#0B0A07]/25 text-[#0B0A07] hover:border-[#067F3A] hover:bg-[#067F3A]/10'
                } ${FOCUS}`}
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
                className={`flex items-center gap-2 px-3 text-white transition-[transform,box-shadow,background-color] duration-100 lg:px-5 ${
                  overlay ? 'hover:bg-white/10' : 'h-11 rounded-full bg-[#067F3A] shadow-[0_3px_0_#044F24] hover:bg-[#05652E] active:translate-y-[3px] active:shadow-none'
                } ${FOCUS}`}
              >
                <User className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                <span className="hidden text-[0.9rem] tracking-[0.12em] lg:inline" style={SEMIBOLD}>
                  <PaperWord text="SIGN IN" />
                </span>
              </Link>
            )}

            {overlay && <span className="my-auto h-6 w-px bg-white" aria-hidden="true" />}

            <Link
              href="/cart"
              aria-label={cartLabel}
              aria-current={isActive(pathname, '/cart') ? 'page' : undefined}
              className={`relative flex items-center justify-center transition-colors duration-200 ${
                overlay ? 'w-16 text-white hover:bg-white/10' : 'h-12 w-12 rounded-full text-[#0B0A07] hover:bg-[#067F3A]/10 hover:text-[#067F3A]'
              } ${FOCUS}`}
            >
              <ShoppingCart className="h-[26px] w-[26px]" strokeWidth={2.25} aria-hidden="true" />
              <CartBadge count={cartCount} className="absolute -right-1.5 -top-1.5" />
            </Link>
          </div>

          {/* ── Phone actions: the menu button holds the cart and account too ── */}
          <div className={`ml-auto flex lg:hidden ${overlay ? 'h-12 items-stretch' : 'items-center'}`}>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : cartCount > 0 ? `Open menu, ${cartCount} item${cartCount === 1 ? '' : 's'} in cart` : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`relative flex items-center justify-center transition-colors ${
                overlay ? `w-14 ${GLASS} text-[#067F3A] hover:text-[#05652E]` : 'h-11 w-11 rounded-full bg-transparent text-[#067F3A] hover:text-[#05652E] -mr-1'
              } ${FOCUS}`}
            >
              {menuOpen ? (
                <X className="h-[32px] w-[32px]" strokeWidth={2.75} aria-hidden="true" />
              ) : (
                <Menu className="h-[32px] w-[32px]" strokeWidth={2.75} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* ── Phone menu sheet ── */}
        {menuOpen && (
          <div
            ref={menuRef}
            id="mobile-menu"
            className="on-light absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto rounded-b-xl bg-white bg-[url('/brand/paper-texture.webp')] bg-cover bg-center text-[#0B0A07] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)] lg:hidden motion-safe:animate-[gbr-drop_200ms_ease-out]"
          >
            <nav aria-label="Mobile" className="px-3 pb-4 pt-2">
              <MobileGroup items={PRIMARY} pathname={pathname} onNavigate={() => setMenuOpen(false)} />

              <p className="px-3 pb-1 pt-4 text-[0.7rem] tracking-[0.3em] text-[#05652E]" style={SEMIBOLD}>
                VIBES
              </p>
              <MobileGroup items={VIBES} pathname={pathname} onNavigate={() => setMenuOpen(false)} />

              <div className="mt-4 border-t-2 border-[#0B0A07]/15 pt-3">
                <ul className="mb-3 flex flex-col gap-0.5">
                  <li>
                    <Link
                      href="/cart"
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(pathname, '/cart') ? 'page' : undefined}
                      className={`flex min-h-[52px] items-center gap-3.5 rounded-xl px-3 text-[1rem] tracking-[0.12em] transition-colors ${FOCUS} ${
                        isActive(pathname, '/cart') ? 'bg-[#067F3A] text-white' : 'text-[#0B0A07] active:bg-[#067F3A]/12'
                      }`}
                      style={SEMIBOLD}
                    >
                      <ShoppingCart className={`h-5 w-5 shrink-0 ${isActive(pathname, '/cart') ? '' : 'text-[#05652E]'}`} strokeWidth={2.25} aria-hidden="true" />
                      <span className="flex-1">{cartLabel.toUpperCase()}</span>
                      <CartBadge count={cartCount} />
                    </Link>
                  </li>
                </ul>
                <div className="px-1">
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

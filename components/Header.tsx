'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
function Corners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
    </>
  );
}

const MEDIA_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hidden, setHidden] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = 0;

    function handleScroll(e: Event) {
      const target = e.target as HTMLElement | Document;
      const currentY =
        target instanceof Document
          ? window.scrollY
          : (target as HTMLElement).scrollTop;

      const goingDown = currentY > lastScrollY.current;
      const pastThreshold = currentY > 80;

      setHidden(goingDown && pastThreshold);
      lastScrollY.current = currentY;
    }

    // capture: true — required because scroll events on nested
    // overflow-auto containers (the sidebar/main-scroll divs in page.tsx)
    // do not bubble, but capturing listeners still see them.
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => {
    if (!session) {
      setCartCount(0);
      return;
    }

    fetch('/api/cart')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const total = (data.items || []).reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
                setCartCount(total);
      })
      .catch(() => setCartCount(0));
  }, [session]);

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

    return (
    <>
    {/* Tap-outside backdrop for the mobile menu */}
    {menuOpen && (
      <div
        className="fixed inset-0 z-[35] md:hidden"
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    )}
    <header
      className={`fixed top-0 left-0 right-0 md:relative md:sticky md:top-0 flex-shrink-0 bg-[#EDEAE0] z-40 transition-transform duration-300 ease-in-out md:translate-y-0 ${
        hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <Corners />
      <div className="flex items-end justify-between h-[60px] md:h-[90px] pl-3 pr-7 relative z-[1]">
        {/* Logo */}
        <Link href="/" className="flex items-center self-center">
          <div className="flex items-center self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${MEDIA_BASE}/gameboy-logo-removebg-preview.png`} alt="Gameboy Records" className="h-[36px] md:h-[48px] w-auto block" />
          </div>
        </Link>

                {/* Nav — desktop only; mobile uses the hamburger menu below */}
        {/* Unified pill nav container, styled after the Aurelia Dental header nav pattern */}
        <nav className="hidden md:flex items-center self-center md:ml-auto md:mr-8">
          <ul
            className="flex items-center gap-1 bg-[#1a9e4a]/[0.1] border border-[#1a9e4a]/20 px-3 py-2"
          >
            {[
              { href: '/shows', label: 'SHOWS' },
              { href: '/shop', label: 'SHOP' },
            ].map((item) => (
              <li key={item.href}>
                <a 
                  href={item.href}
                  className={`inline-block px-5 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-[#1a9e4a] text-white font-bold'
                      : 'text-[#16432a] hover:scale-110'
                  }`}
                  style={{
                    fontFamily: "'Poppins_semibold', monospace",
                    fontSize: '1.1em',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}

            {/* Games dropdown — hover-triggered via CSS group, no JS state needed */}
            <li className="relative group">
              <button
                type="button"
                className={`inline-block px-5 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                  pathname === '/karaoke' || pathname === '/guitar'
                    ? 'bg-[#1a9e4a] text-white font-bold'
                    : 'text-[#16432a] hover:scale-110'
                }`}
                style={{
                  fontFamily: "'Poppins_semibold', monospace",
                  fontSize: '1.1em',
                  letterSpacing: '0.05em',
                }}
              >
                <span className="inline-flex items-center gap-1">
                  VIBES
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-3 h-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              <ul
                className="absolute left-0 top-full hidden group-hover:flex flex-col min-w-[160px] bg-[#fef8f3] border border-[#1a9e4a]/20 shadow-lg z-50"
              >
                {[
                  { href: '/karaoke', label: 'KARAOKE' },
                  { href: '/guitar', label: 'GUITAR' },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`block px-5 py-2 whitespace-nowrap transition-all duration-200 ${
                        pathname === item.href
                          ? 'bg-[#1a9e4a] text-white font-bold'
                          : 'text-[#16432a] hover:bg-[#1a9e4a]/10'
                      }`}
                      style={{
                        fontFamily: "'Poppins_semibold', monospace",
                        fontSize: '1em',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Account / Cart — desktop only placeholders, sized for future profile photo avatar */}
        <div className="hidden md:flex items-center self-center gap-3 flex-shrink-0">
                    <Link
            href={session ? '/account' : '/account/login'}
            aria-label="Account"
            className="group cursor-pointer inline-flex items-center h-11 px-5 gap-2 rounded-[6px] flex-shrink-0 bg-[#1a9e4a] text-white font-bold transition"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-200 group-hover:scale-120">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 flex-shrink-0 block" fill="currentColor">
                {session ? (
                  <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                ) : (
                  <path d="M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312z" />
                )}
              </svg>
            </span>
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="group relative cursor-pointer inline-flex items-center h-11 px-5 gap-2 rounded-[6px] flex-shrink-0 bg-[#1a9e4a] text-white font-bold transition"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-200 group-hover:scale-120">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 flex-shrink-0 block" fill="currentColor">
                <path d="M24 80C10.7 80 0 90.7 0 104C0 117.3 10.7 128 24 128L69.5 128C79.6 128 88.4 134.8 91 144.6L143.9 344.9C154.6 385.4 191.3 413.7 233.2 413.7L465.8 413.7C507 413.7 543.2 386.4 554.5 346.8L601 184.6C609.6 154.7 587.2 124.8 556.1 124.8L142.9 124.8L137.6 105C127.5 66.7 92.8 40 53.2 40L24 40L24 80zM192 528C218.5 528 240 506.5 240 480C240 453.5 218.5 432 192 432C165.5 432 144 453.5 144 480C144 506.5 165.5 528 192 528zM496 528C522.5 528 544 506.5 544 480C544 453.5 522.5 432 496 432C469.5 432 448 453.5 448 480C448 506.5 469.5 528 496 528z" />
              </svg>
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="md:hidden relative inline-flex items-center justify-center self-center w-11 h-11 rounded-[6px] flex-shrink-0 bg-[#1a9e4a] text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 block" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
          {!menuOpen && cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-600" />
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
                    className="md:hidden absolute top-full right-0 w-max min-w-[220px] bg-[#EDEAE0] border-t border-l border-b border-[#1a9e4a]/20 rounded-bl-[6px] shadow-lg"
        >
          <ul className="flex flex-col py-2">
            {[
              { href: '/', label: 'HOME', viewBox: '0 0 640 640', d: 'M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z' },
              { href: '/shows', label: 'SHOWS', viewBox: '0 0 640 640', d: 'M224 64C241.7 64 256 78.3 256 96L256 128L384 128L384 96C384 78.3 398.3 64 416 64C433.7 64 448 78.3 448 96L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 96C192 78.3 206.3 64 224 64zM160 304L160 336C160 344.8 167.2 352 176 352L208 352C216.8 352 224 344.8 224 336L224 304C224 295.2 216.8 288 208 288L176 288C167.2 288 160 295.2 160 304zM288 304L288 336C288 344.8 295.2 352 304 352L336 352C344.8 352 352 344.8 352 336L352 304C352 295.2 344.8 288 336 288L304 288C295.2 288 288 295.2 288 304zM432 288C423.2 288 416 295.2 416 304L416 336C416 344.8 423.2 352 432 352L464 352C472.8 352 480 344.8 480 336L480 304C480 295.2 472.8 288 464 288L432 288zM160 432L160 464C160 472.8 167.2 480 176 480L208 480C216.8 480 224 472.8 224 464L224 432C224 423.2 216.8 416 208 416L176 416C167.2 416 160 423.2 160 432zM304 416C295.2 416 288 423.2 288 432L288 464C288 472.8 295.2 480 304 480L336 480C344.8 480 352 472.8 352 464L352 432C352 423.2 344.8 416 336 416L304 416zM416 432L416 464C416 472.8 423.2 480 432 480L464 480C472.8 480 480 472.8 480 464L480 432C480 423.2 472.8 416 464 416L432 416C423.2 416 416 423.2 416 432z' },
              { href: '/shop', label: 'SHOP', viewBox: '0 0 640 512', d: 'M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z' },
              { href: '/karaoke', label: 'KARAOKE', heading: 'VIBES', viewBox: '0 0 640 640', d: 'M320 64C267 64 224 107 224 160L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 160C416 107 373 64 320 64zM176 248C176 234.7 165.3 224 152 224C138.7 224 128 234.7 128 248L128 288C128 385.9 201.3 466.7 296 478.5L296 528L248 528C234.7 528 224 538.7 224 552C224 565.3 234.7 576 248 576L392 576C405.3 576 416 565.3 416 552C416 538.7 405.3 528 392 528L344 528L344 478.5C438.7 466.7 512 385.9 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 367.5 399.5 432 320 432C240.5 432 176 367.5 176 288L176 248z' },
              { href: '/guitar', label: 'GUITAR', viewBox: '0 0 512 512', d: 'M465 7c-9.4-9.4-24.6-9.4-33.9 0L383 55c-2.4 2.4-4.3 5.3-5.5 8.5l-15.4 41-77.5 77.6c-45.1-29.4-99.3-30.2-131 1.6c-11 11-18 24.6-21.4 39.6c-3.7 16.6-19.1 30.7-36.1 31.6c-25.6 1.3-49.3 10.7-66.3 27.7c-43.7 43.7-35.1 123 19.1 177.1s133.5 62.8 177.1 19.1c17-17 26.4-40.7 27.7-66.3c.9-17 15-32.3 31.6-36.1c15-3.4 28.6-10.5 39.6-21.4c31.8-31.8 31-85.9 1.6-131l77.6-77.6 41-15.4c3.2-1.2 6.1-3.1 8.5-5.5l48-48c9.4-9.4 9.4-24.6 0-33.9L465 7zM208 256a48 48 0 1 1 0 96 48 48 0 1 1 0-96z' },
            ].map((item) => (
              <li key={item.href}>
                {item.heading && (
                  <div
                    className="mt-2 pt-3 pb-1 px-6 border-t border-[#1a9e4a]/20 text-[#1a9e4a]"
                    style={{
                      fontFamily: "'Poppins_semibold', monospace",
                      fontSize: '0.75em',
                      letterSpacing: '0.2em',
                    }}
                  >
                    {item.heading}
                  </div>
                )}
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                                    className={`flex items-center gap-3 px-6 py-3 transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-[#1a9e4a] text-white font-bold'
                      : 'text-[#16432a] hover:bg-[#1a9e4a]/10'
                  }`}
                  style={{
                    fontFamily: "'Poppins_semibold', monospace",
                    fontSize: '1em',
                    letterSpacing: '0.1em',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox={item.viewBox} className="w-5 h-5 flex-shrink-0 block" fill="currentColor" aria-hidden="true">
                    <path d={item.d} />
                  </svg>
                <span>{item.label}</span>
                </a>
              </li>
            ))}
            <li className="mt-2 pt-2 border-t border-[#1a9e4a]/20">
              <Link
                href={session ? '/account' : '/account/login'}
                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-6 py-3 text-[#16432a] hover:bg-[#1a9e4a]/10 transition-colors duration-200"
                style={{
                  fontFamily: "'Poppins_semibold', monospace",
                  fontSize: '1em',
                  letterSpacing: '0.1em',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 flex-shrink-0 block" fill="currentColor" aria-hidden="true">
                  {session ? (
                    <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                  ) : (
                    <path d="M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312z" />
                  )}
                </svg>
              <span>{session ? 'ACCOUNT' : 'SIGN IN'}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-6 py-3 text-[#16432a] hover:bg-[#1a9e4a]/10 transition-colors duration-200"
                style={{
                  fontFamily: "'Poppins_semibold', monospace",
                  fontSize: '1em',
                  letterSpacing: '0.1em',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 flex-shrink-0 block" fill="currentColor" aria-hidden="true">
                  <path d="M24 80C10.7 80 0 90.7 0 104C0 117.3 10.7 128 24 128L69.5 128C79.6 128 88.4 134.8 91 144.6L143.9 344.9C154.6 385.4 191.3 413.7 233.2 413.7L465.8 413.7C507 413.7 543.2 386.4 554.5 346.8L601 184.6C609.6 154.7 587.2 124.8 556.1 124.8L142.9 124.8L137.6 105C127.5 66.7 92.8 40 53.2 40L24 40L24 80zM192 528C218.5 528 240 506.5 240 480C240 453.5 218.5 432 192 432C165.5 432 144 453.5 144 480C144 506.5 165.5 528 192 528zM496 528C522.5 528 544 506.5 544 480C544 453.5 522.5 432 496 432C469.5 432 448 453.5 448 480C448 506.5 469.5 528 496 528z" />
                </svg>
              <span className="flex items-center gap-2">
                  CART
                  {cartCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold leading-none">
                      {cartCount}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
    </>
  );
}

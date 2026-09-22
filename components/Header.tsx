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

  return (
    <header
      className={`fixed top-0 left-0 right-0 md:relative md:sticky md:top-0 flex-shrink-0 bg-[#EDEAE0] z-40 transition-transform duration-300 ease-in-out md:translate-y-0 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <Corners />
      <div className="flex items-end justify-center md:justify-between h-[60px] md:h-[90px] pl-3 pr-7 relative z-[1]">
        {/* Logo */}
        <Link href="/" className="flex items-center self-center">
          <div className="flex items-center self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${MEDIA_BASE}/gameboy-logo-removebg-preview.png`} alt="Gameboy Records" className="h-[36px] md:h-[48px] w-auto block" />
          </div>
        </Link>

        {/* Nav — desktop only; mobile uses MobileBottomNav */}
        {/* Unified pill nav container, styled after the Aurelia Dental header nav pattern */}
        <nav className="hidden md:flex items-center self-center md:ml-auto md:mr-8">
          <ul
            className="flex items-center gap-1 bg-[#1a9e4a]/[0.1] border border-[#1a9e4a]/20 px-3 py-2"
          >
            {[
              { href: '/feed', label: 'FEED' },
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
                <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
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
      </div>
    </header>
  );
}

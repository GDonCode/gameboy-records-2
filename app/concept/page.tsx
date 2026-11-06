import type { Metadata } from 'next';
import Link from 'next/link';
import { Archivo } from 'next/font/google';
import { formatPrice, listedProducts } from '@/lib/products';
import './concept.css';

// Wide, heavy grotesk: the closest free match to the chunky extended letters in the logo.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--gb-font',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gameboy Records — concept',
  description: 'Gameboy Records, home of Alexx A-Game. New music, merch, karaoke and trivia.',
};

const NAV = [
  { href: '/discography', label: 'Music' },
  { href: '/shop', label: 'Shop' },
  { href: '/shows', label: 'Shows' },
  { href: '/karaoke', label: 'Karaoke' },
  { href: '/trivia', label: 'Trivia' },
];

const TICKER = ['New music', 'Merch', 'Karaoke', 'Trivia', 'Live shows'];

/** Controller-button glyphs from the logo (triangle and square) plus circle and cross. */
function Glyph({ kind, className = '' }: { kind: 'triangle' | 'square' | 'circle' | 'cross'; className?: string }) {
  const paths = {
    triangle: <path d="M12 3.5 21 19.5H3Z" />,
    square: <rect x="4" y="4" width="16" height="16" />,
    circle: <circle cx="12" cy="12" r="8.5" />,
    cross: <path d="M5 5l14 14M19 5 5 19" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

function SectionTitle({ ghost, children, id }: { ghost: string; children: React.ReactNode; id: string }) {
  return (
    <div className="gb-title">
      <span className="gb-ghost" aria-hidden="true">{ghost}</span>
      <h2 id={id}>{children}</h2>
    </div>
  );
}

export default function ConceptPage() {
  const featured = listedProducts.slice(0, 4);

  return (
    <div className={`gb-root ${archivo.variable}`}>
      <a href="#main" className="gb-skip">Skip to content</a>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="gb-header">
        <div className="gb-header-inner">
          <Link href="/concept" className="gb-brand" aria-label="Gameboy Records home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gameboy-records-logo.jpg" alt="Gameboy Records" width={1600} height={325} />
          </Link>

          <nav aria-label="Main" className="gb-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
          </nav>

          <div className="gb-actions">
            <Link href="/cart" className="gb-btn gb-btn--solid">Cart</Link>
            <details className="gb-menu">
              <summary aria-label="Menu">
                <span className="gb-burger" aria-hidden="true" />
              </summary>
              <nav aria-label="Mobile" className="gb-menu-panel">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href}>{n.label}</Link>
                ))}
                <Link href="/account/login" className="gb-menu-cta">Sign in</Link>
              </nav>
            </details>
          </div>
        </div>
        <div className="gb-lcd" aria-hidden="true"><i /><i /><i /><i /></div>
      </header>

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="gb-hero" aria-labelledby="hero-h">
          <Glyph kind="triangle" className="gb-float gb-float--a" />
          <Glyph kind="square" className="gb-float gb-float--b" />
          <Glyph kind="circle" className="gb-float gb-float--c" />
          <Glyph kind="cross" className="gb-float gb-float--d" />

          <h1 id="hero-h" className="gb-hero-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gameboy-records-logo.jpg" alt="Gameboy Records" width={1600} height={325} />
          </h1>
          <p className="gb-hero-sub">Home of Alexx A-Game</p>
          <div className="gb-hero-cta">
            <Link href="/discography" className="gb-btn gb-btn--solid gb-btn--lg">Listen now</Link>
            <Link href="/shop" className="gb-btn gb-btn--line gb-btn--lg">Shop merch</Link>
          </div>
          <span className="gb-sticker" aria-hidden="true">Press<br />start</span>
        </section>

        <div className="gb-ticker" aria-hidden="true">
          <div className="gb-ticker-track">
            {[0, 1].map((i) => (
              <ul key={i}>
                {TICKER.map((t) => (
                  <li key={t}>{t}<Glyph kind="square" className="gb-tick-glyph" /></li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* ── Music ──────────────────────────────────────────── */}
        <section className="gb-section" aria-labelledby="music-h">
          <SectionTitle ghost="MUSIC" id="music-h">Music</SectionTitle>
          <div className="gb-feature">
            <div className="gb-cover" aria-hidden="true">
              <Glyph kind="triangle" className="gb-cover-a" />
              <Glyph kind="square" className="gb-cover-b" />
            </div>
            <div className="gb-feature-copy">
              <p className="gb-kicker">The catalogue</p>
              <h3>Every release, one place.</h3>
              <p>
                New music, artists and releases from the label. Press play on the latest, or dig through
                everything that came before.
              </p>
              <Link href="/discography" className="gb-btn gb-btn--solid">Browse discography</Link>
            </div>
          </div>
        </section>

        {/* ── Shop ───────────────────────────────────────────── */}
        <section className="gb-section gb-section--tint" aria-labelledby="shop-h">
          <SectionTitle ghost="MERCH" id="shop-h">Merch</SectionTitle>
          <ul className="gb-grid">
            {featured.map((p) => (
              <li key={p.id}>
                <Link href={`/shop/${p.slug}`} className="gb-card">
                  <span className="gb-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt={p.name} loading="lazy" />
                  </span>
                  <span className="gb-card-name">{p.name}</span>
                  <span className="gb-card-price">{formatPrice(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="gb-center">
            <Link href="/shop" className="gb-btn gb-btn--line">View all</Link>
          </div>
        </section>

        {/* ── Shows ──────────────────────────────────────────── */}
        <section className="gb-section gb-section--ink" aria-labelledby="shows-h">
          <SectionTitle ghost="SHOWS" id="shows-h">Shows</SectionTitle>
          <ul className="gb-dates">
            <li>
              <div>
                <p className="gb-date">Date — TBA</p>
                <p className="gb-date-sub">Tour dates are being booked. Be the first to know when we announce a show near you.</p>
              </div>
              <Link href="/shows" className="gb-btn gb-btn--yellow">Get notified</Link>
            </li>
          </ul>
        </section>

        {/* ── Vibes ──────────────────────────────────────────── */}
        <section className="gb-section" aria-labelledby="vibes-h">
          <SectionTitle ghost="VIBES" id="vibes-h">Vibes</SectionTitle>
          <div className="gb-vibes">
            <Link href="/karaoke" className="gb-vibe gb-vibe--green">
              <Glyph kind="circle" className="gb-vibe-glyph" />
              <span className="gb-kicker">Sing it loud</span>
              <span className="gb-vibe-title">Karaoke</span>
            </Link>
            <Link href="/trivia" className="gb-vibe gb-vibe--yellow">
              <Glyph kind="triangle" className="gb-vibe-glyph" />
              <span className="gb-kicker">Think you know the label?</span>
              <span className="gb-vibe-title">Trivia</span>
            </Link>
          </div>
        </section>

        {/* ── Club ───────────────────────────────────────────── */}
        <section className="gb-club" aria-labelledby="club-h">
          <h2 id="club-h">Join the club</h2>
          <p>Make an account for quests, order history and first word on new drops.</p>
          <Link href="/account/login?mode=register" className="gb-btn gb-btn--ink gb-btn--lg">Create account</Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="gb-footer">
        <nav aria-label="Footer">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
          <Link href="/account">Account</Link>
        </nav>
        <p>© {new Date().getFullYear()} Gameboy Records</p>
      </footer>
    </div>
  );
}

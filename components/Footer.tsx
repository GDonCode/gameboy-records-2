// components/Footer.tsx
// Site footer: the label line, contact details, navigation, socials and the newsletter sign-up.
'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon, { type IconName } from '@/components/icons';
import Button from '@/components/ui/Button';
import { CLUB_NAME, CONTACT_EMAIL, INSTAGRAM_HANDLE, LOGO_URL, SITE_NAME, SOCIAL } from '@/lib/site';

const SOCIALS: { href: string; label: string; icon: IconName }[] = [
  { href: SOCIAL.instagram, label: 'Instagram', icon: 'brand-instagram' },
  { href: SOCIAL.tiktok, label: 'TikTok', icon: 'brand-tiktok' },
  { href: SOCIAL.youtube, label: 'YouTube', icon: 'brand-youtube' },
  { href: SOCIAL.spotify, label: 'Spotify', icon: 'brand-spotify' },
  { href: SOCIAL.appleMusic, label: 'Apple Music', icon: 'brand-applemusic' },
];

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shows', label: 'Shows' },
  { href: '/music', label: 'Music' },
  { href: '/karaoke', label: 'Karaoke' },
  { href: '/trivia', label: 'Trivia' },
  { href: '/account', label: CLUB_NAME },
];

function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'That didn’t go through. Please try again.');
      setStatus({ ok: true, message: data.message === 'You’re already subscribed!' ? 'You’re already on the list.' : 'You’re on the list.' });
      setEmail('');
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : 'That didn’t go through. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="eyebrow text-gold-light m-0">Join the newsletter</h2>
      <p className="mt-4 mb-6 text-[0.95rem] leading-relaxed text-mist max-w-[40ch]">
        Releases, drops and show dates, sent sparingly. First word goes to the list.
      </p>
      <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2" noValidate={false}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="field flex-1 min-w-0"
        />
        <Button type="submit" variant="light" disabled={busy}>
          {busy ? 'Sending' : 'Subscribe'}
        </Button>
      </form>
      <p role="status" aria-live="polite" className={`mt-3 text-[0.85rem] min-h-[1.4em] ${status?.ok ? 'text-green-light' : 'text-danger-light'}`}>
        {status?.message ?? ''}
      </p>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper border-t border-line-inv">
      <div className="container-site pt-16 pb-10 md:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Label */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" aria-label={`${SITE_NAME} — home`} className="inline-block self-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_URL} alt={SITE_NAME} width={1022} height={168} loading="lazy" className="h-9 w-auto brightness-0 invert" />
            </Link>
            <p className="m-0 text-[0.95rem] leading-relaxed text-mist max-w-[36ch]">
              An independent label. Founded by Alexx A-Game. Owned outright.
            </p>
            <dl className="m-0 grid gap-3 text-[0.9rem]">
              <div>
                <dt className="eyebrow text-mist/70 mb-1">Enquiries</dt>
                <dd className="m-0">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-paper underline decoration-paper/30 underline-offset-4 hover:decoration-paper">
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-mist/70 mb-1">Instagram</dt>
                <dd className="m-0">
                  <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="text-paper underline decoration-paper/30 underline-offset-4 hover:decoration-paper">
                    {INSTAGRAM_HANDLE}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-6">
            <h2 className="eyebrow text-gold-light m-0 mb-5">Explore</h2>
            <ul className="list-none p-0 m-0 grid grid-cols-2 lg:grid-cols-1 gap-y-3 gap-x-8">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="zoom-content inline-block text-[0.95rem] text-paper/85 hover:text-paper">
                    <span className="inline-block origin-left">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="lg:col-span-4 lg:col-start-9">
            <Newsletter />
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-line-inv flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
          <p className="m-0 text-[0.8rem] text-mist">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <ul className="list-none p-0 m-0 flex items-center gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} (opens in a new tab)`}
                  className="zoom-content inline-flex items-center justify-center w-11 h-11 rounded-xs border border-line-inv text-paper hover:border-paper/40"
                >
                  <span>
                    <Icon name={s.icon} className="w-[18px] h-[18px]" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

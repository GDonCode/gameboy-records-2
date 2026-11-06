// components/PlayazClubPopup.tsx
// "Join the Playaz Club": a one-time invitation for signed-out visitors to create an account.
// It opens after the visitor has spent a little time on the site (20 seconds, or half a page of scrolling),
// never on account, cart or unlock pages, and not again for 30 days once dismissed or completed.
// Creating an account uses the same API as the account page and signs the new member straight in.
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { validateDisplayName, validateEmail, validateNewPassword } from '@/lib/account-validation';
import { CLUB_NAME, POINTS_NAME } from '@/lib/site';
import { SIGNUP_BONUS_POINTS } from '@/lib/club';

const STORAGE_KEY = 'gbr_playaz_invite';
const SNOOZE_DAYS = 30;
const DELAY_MS = 20_000;
const EXCLUDED = /^\/(account|cart|unlock|karaoke)(\/|$)/;

function snoozed(): boolean {
  try {
    const until = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

function snooze() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
  } catch {
    /* storage blocked: the popup may show again next visit, which is acceptable */
  }
}

export default function PlayazClubPopup() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Decide when to invite.
  useEffect(() => {
    if (status !== 'unauthenticated' || EXCLUDED.test(pathname) || snoozed()) return;
    let fired = false;
    const show = () => {
      if (fired || snoozed()) return;
      fired = true;
      setOpen(true);
    };
    const timer = setTimeout(show, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [status, pathname]);

  // Native <dialog>: focus trap, Escape and the backdrop come for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function dismiss() {
    snooze();
    setOpen(false);
  }

  if (status !== 'unauthenticated') return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={dismiss}
      onClick={(e) => {
        if (e.target === dialogRef.current) dismiss(); // click on the backdrop
      }}
      aria-labelledby="playaz-title"
      className="m-auto w-[calc(100%-32px)] max-w-[880px] p-0 bg-transparent text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-sm open:animate-fade-up"
    >
      <div className="grid md:grid-cols-[1fr_1.1fr] paper-ink border-[3px] border-paper shadow-[8px_8px_0_var(--color-gold)]">
        <div className="relative hidden md:block min-h-[520px] bg-ink-2">
          {/* This is a placeholder image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/placeholder.jpg" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" aria-hidden="true" />
          <p className="absolute left-8 bottom-8 right-8 m-0 eyebrow text-gold-light">Members only</p>
        </div>
        <div className="relative p-6 sm:p-10">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="zoom-content absolute top-3 right-3 inline-flex items-center justify-center w-11 h-11 text-mist hover:text-paper cursor-pointer"
          >
            <span>
              <Icon name="xmark" className="w-5 h-5" />
            </span>
          </button>
          <p className="eyebrow text-gold-light m-0">By invitation</p>
          <h2 id="playaz-title" className="display text-[2rem] sm:text-[2.5rem] mt-4 mb-4">
            Join the {CLUB_NAME}
          </h2>
          <p className="m-0 text-mist leading-relaxed">
            Early access to every drop, first call on show tickets, and {POINTS_NAME} on everything you do here.
            Start with {SIGNUP_BONUS_POINTS} on us.
          </p>
          <JoinForm
            onJoined={() => {
              snooze();
              setOpen(false);
              router.push('/account');
              router.refresh();
            }}
          />
          <p className="mt-5 mb-0 text-[0.85rem] text-mist">
            Already a member?{' '}
            <a href="/account/login" onClick={snooze} className="text-paper underline underline-offset-4">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </dialog>
  );
}

function JoinForm({ onJoined }: { onJoined: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = validateDisplayName(name);
    const m = validateEmail(email);
    const problem =
      ('error' in n && n.error) || ('error' in m && m.error) || validateNewPassword(password, 'value' in m ? m.value : undefined);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password, displayName: name.trim() }),
    }).catch(() => null);
    if (!res) {
      setBusy(false);
      setError('Check your connection and try again.');
      return;
    }
    const data: { error?: string } = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error || 'We couldn’t create your account. Please try again.');
      return;
    }
    const signed = await signIn('user-credentials', { email: email.trim(), password, redirect: false }).catch(() => null);
    setBusy(false);
    if (!signed || signed.error) {
      window.location.href = '/account/login';
      return;
    }
    onJoined();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-3" noValidate>
      <label className="grid gap-1.5">
        <span className="eyebrow text-mist">Name</span>
        <input className="field" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
      </label>
      <label className="grid gap-1.5">
        <span className="eyebrow text-mist">Email</span>
        <input className="field" type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="grid gap-1.5">
        <span className="eyebrow text-mist">Password</span>
        <input
          className="field"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          aria-describedby="playaz-password-hint"
        />
        <span id="playaz-password-hint" className="text-[0.75rem] text-mist">
          At least 8 characters.
        </span>
      </label>
      <p role="alert" className="m-0 min-h-[1.25em] text-[0.85rem] text-danger-light">
        {error ?? ''}
      </p>
      <Button type="submit" variant="primary" size="lg" disabled={busy} className="w-full">
        {busy ? 'Creating your membership' : 'Become a member'}
      </Button>
    </form>
  );
}

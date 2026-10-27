// components/account/SecurityTab.tsx
'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { PASSWORD_MIN, validateNewPassword } from '@/lib/account-validation';
import { describeDevice } from '@/lib/user-agent';
import { Panel, TabHeading } from './Panel';
import {
  BODY,
  ERROR_TEXT,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SEMI,
  SUCCESS_TEXT,
  TEXT_BUTTON,
  readError,
} from './formStyles';
import type { SecurityEventKind, SecurityInfo } from './types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// After a password change or "sign out of other devices", every session (this one included) is ended
// on the server. Signing straight back in with the password gives this device a fresh session.
async function signBackIn(email: string, password: string): Promise<boolean> {
  const res = await signIn('user-credentials', { email, password, redirect: false }).catch(() => null);
  return !!res && !res.error;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
  invalid,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  disabled: boolean;
  invalid?: boolean;
  hint?: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          className={`${INPUT_CLASS} pr-11`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white cursor-pointer"
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-[0.75em] text-white/45">{hint}</p>}
    </div>
  );
}

// ── SIGN-IN METHODS ──────────────────────────────────────────────────────────
function MethodRow({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4 py-4">
      <span className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
        <Icon className="w-[18px] h-[18px] text-[#4dff91]" />
      </span>
      <div className="min-w-0">
        <p className="text-white" style={SEMI}>{title}</p>
        <div className="text-[0.85em] text-white/60">{children}</div>
      </div>
    </li>
  );
}

function SignInMethods({ email, security }: { email: string; security: SecurityInfo }) {
  return (
    <Panel className="flex flex-col gap-2">
      <h2 className="text-[1.15em] text-white" style={SEMI}>Ways to sign in</h2>
      <ul className="flex flex-col divide-y divide-white/10" style={BODY}>
        <MethodRow icon={KeyRound} title="Email and password">
          {security.hasPassword ? (
            <>
              <span className="break-all">{email}</span> ·{' '}
              {security.passwordChangedAt ? `password last changed ${formatDate(security.passwordChangedAt)}` : 'password set'}
            </>
          ) : (
            'Not set up. Add a password below to sign in without Google.'
          )}
        </MethodRow>
        <MethodRow icon={Mail} title="Google">
          Works when <span className="break-all">{email}</span> is a Google account.
        </MethodRow>
      </ul>
    </Panel>
  );
}

// ── CHANGE / SET PASSWORD ────────────────────────────────────────────────────
function PasswordPanel({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState<'code' | 'save' | null>(null);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setCurrent('');
    setNext('');
    setConfirm('');
    setCode('');
    setError(null);
  }

  async function sendCode() {
    setBusy('code');
    setError(null);
    try {
      const res = await fetch('/api/account/password/code', { method: 'POST' });
      if (!res.ok) {
        setError({ message: await readError(res, 'Could not send a code. Please try again.') });
        return;
      }
      const data = await res.json();
      setCodeSentTo(data.sentTo);
    } catch {
      setError({ message: 'Could not send a code. Check your connection and try again.' });
    } finally {
      setBusy(null);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (hasPassword && !current) return setError({ message: 'Enter your current password.', field: 'current' });
    if (!hasPassword && !/^\d{6}$/.test(code)) return setError({ message: 'Enter the 6-digit code from the email.', field: 'code' });
    const problem = validateNewPassword(next, email);
    if (problem) return setError({ message: problem, field: 'newPassword' });
    if (next !== confirm) return setError({ message: 'The new passwords don’t match.', field: 'confirm' });

    setBusy('save');
    setError(null);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasPassword ? { currentPassword: current, newPassword: next } : { code, newPassword: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError({ message: data?.error ?? 'Could not save your password. Please try again.', field: data?.field });
        return;
      }
      const data = await res.json();
      if (!(await signBackIn(data.email, next))) {
        window.location.href = '/account/login';
        return;
      }
      close();
      setDone(hasPassword ? 'Password changed. You’ve been signed out on your other devices.' : 'Password added. You can now sign in with your email and password.');
      router.refresh();
    } catch {
      setError({ message: 'Could not save your password. Check your connection and try again.' });
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null;
  const fieldError = (field: string) => error?.field === field;

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.15em] text-white" style={SEMI}>{hasPassword ? 'Password' : 'Add a password'}</h2>
          <p className="text-[0.85em] text-white/55" style={BODY}>
            {hasPassword
              ? 'Changing your password signs you out on your other devices.'
              : 'You sign in with Google. Add a password to also sign in with your email.'}
          </p>
        </div>
        {!open && (
          <button type="button" className={SECONDARY_BUTTON} onClick={() => { setDone(null); setOpen(true); }}>
            {hasPassword ? 'CHANGE PASSWORD' : 'ADD PASSWORD'}
          </button>
        )}
      </div>

      {done && <p role="status" className={SUCCESS_TEXT} style={BODY}>{done}</p>}

      {open && (
        <form onSubmit={save} noValidate className="flex flex-col gap-4 max-w-[420px]" style={BODY}>
          {hasPassword ? (
            <PasswordInput id="current-password" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" disabled={disabled} invalid={fieldError('currentPassword') || fieldError('current')} />
          ) : (
            <div className="flex flex-col gap-2">
              {codeSentTo ? (
                <>
                  <p className="text-[0.85em] text-white/70">We sent a 6-digit code to <span className="text-white break-all">{codeSentTo}</span>. It expires in 15 minutes.</p>
                  <label htmlFor="set-password-code" className={LABEL_CLASS}>Verification code</label>
                  <input
                    id="set-password-code"
                    className={`${INPUT_CLASS} tracking-[0.4em] text-[1.1em] max-w-[200px]`}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={disabled}
                    aria-invalid={fieldError('code')}
                  />
                  <button type="button" className={`${TEXT_BUTTON} self-start`} onClick={sendCode} disabled={disabled}>
                    {busy === 'code' ? 'Sending…' : 'Send a new code'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[0.85em] text-white/70">First, we’ll email a code to <span className="text-white break-all">{email}</span> to confirm it’s you.</p>
                  <button type="button" className={`${PRIMARY_BUTTON} self-start`} onClick={sendCode} disabled={disabled}>
                    {busy === 'code' ? 'SENDING…' : 'SEND CODE'}
                  </button>
                </>
              )}
            </div>
          )}

          {(hasPassword || codeSentTo) && (
            <>
              <PasswordInput id="new-password" label="New password" value={next} onChange={setNext} autoComplete="new-password" disabled={disabled} invalid={fieldError('newPassword')} hint={`At least ${PASSWORD_MIN} characters. Longer is stronger.`} />
              <PasswordInput id="confirm-password" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={disabled} invalid={fieldError('confirm')} />
            </>
          )}

          {error && <p role="alert" className={ERROR_TEXT}>{error.message}</p>}

          <div className="flex gap-3">
            {(hasPassword || codeSentTo) && (
              <button type="submit" className={PRIMARY_BUTTON} disabled={disabled}>
                {busy === 'save' ? 'SAVING…' : hasPassword ? 'CHANGE PASSWORD' : 'ADD PASSWORD'}
              </button>
            )}
            <button type="button" className={SECONDARY_BUTTON} disabled={disabled} onClick={close}>CANCEL</button>
          </div>
        </form>
      )}
    </Panel>
  );
}

// ── SIGN OUT EVERYWHERE ──────────────────────────────────────────────────────
function DevicesPanel({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function revoke(e?: FormEvent) {
    e?.preventDefault();
    if (hasPassword && !password) return setError('Enter your current password.');
    if (!hasPassword && !window.confirm('Sign out on every device, including this one? You’ll sign in again with Google.')) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasPassword ? { currentPassword: password } : {}),
      });
      if (!res.ok) {
        setError(await readError(res, 'Could not sign out your devices. Please try again.'));
        return;
      }
      const data = await res.json();
      if (!data.keepThisDevice) {
        await signOut({ redirectTo: '/account/login' });
        return;
      }
      if (!(await signBackIn(data.email, password))) {
        window.location.href = '/account/login';
        return;
      }
      setOpen(false);
      setPassword('');
      setDone(true);
      router.refresh();
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.15em] text-white" style={SEMI}>{hasPassword ? 'Sign out of other devices' : 'Sign out everywhere'}</h2>
          <p className="text-[0.85em] text-white/55" style={BODY}>
            {hasPassword
              ? 'Use this if you signed in on a shared or lost device. You’ll stay signed in here.'
              : 'Use this if you signed in on a shared or lost device. This signs out every device, this one included.'}
          </p>
        </div>
        {!open && (
          <button
            type="button"
            className={SECONDARY_BUTTON}
            disabled={busy}
            onClick={() => { setDone(false); if (hasPassword) setOpen(true); else revoke(); }}
          >
            <LogOut className="w-4 h-4" /> {hasPassword ? 'SIGN OUT OTHERS' : 'SIGN OUT EVERYWHERE'}
          </button>
        )}
      </div>

      {done && <p role="status" className={SUCCESS_TEXT} style={BODY}>Your other devices have been signed out. It can take up to a minute to apply.</p>}
      {error && !open && <p role="alert" className={ERROR_TEXT} style={BODY}>{error}</p>}

      {open && (
        <form onSubmit={revoke} noValidate className="flex flex-col gap-4 max-w-[420px]" style={BODY}>
          <PasswordInput id="revoke-password" label="Current password" value={password} onChange={setPassword} autoComplete="current-password" disabled={busy} invalid={!!error} />
          {error && <p role="alert" className={ERROR_TEXT}>{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className={PRIMARY_BUTTON} disabled={busy}>{busy ? 'SIGNING OUT…' : 'SIGN OUT OTHER DEVICES'}</button>
            <button type="button" className={SECONDARY_BUTTON} disabled={busy} onClick={() => { setOpen(false); setPassword(''); setError(null); }}>CANCEL</button>
          </div>
        </form>
      )}
    </Panel>
  );
}

// ── RECENT ACTIVITY ──────────────────────────────────────────────────────────
const EVENT_LABELS: Record<SecurityEventKind, { label: string; icon: LucideIcon; warn?: boolean }> = {
  sign_in: { label: 'Signed in', icon: LogIn },
  password_changed: { label: 'Password changed', icon: KeyRound },
  password_set: { label: 'Password added', icon: KeyRound },
  password_check_failed: { label: 'Wrong password entered', icon: AlertTriangle, warn: true },
  signed_out_everywhere: { label: 'Signed out of other devices', icon: LogOut },
  email_changed: { label: 'Email changed', icon: Mail },
};

function ActivityPanel({ security }: { security: SecurityInfo }) {
  return (
    <Panel className="flex flex-col gap-2">
      <h2 className="text-[1.15em] text-white" style={SEMI}>Recent security activity</h2>
      <p className="text-[0.85em] text-white/55" style={BODY}>
        If something here wasn’t you, change your password and sign out of other devices.
      </p>
      {security.events.length === 0 ? (
        <p className="py-6 text-center text-[0.9em] text-white/50" style={BODY}>No activity yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10 mt-2" style={BODY}>
          {security.events.map((ev) => {
            const meta = EVENT_LABELS[ev.kind] ?? { label: ev.kind, icon: ShieldCheck };
            const Icon = meta.icon;
            const device = describeDevice(ev.user_agent);
            return (
              <li key={ev.id} className="flex items-center gap-4 py-3">
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${meta.warn ? 'text-[#ff6b6b]' : 'text-[#4dff91]'}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className={meta.warn ? 'text-[#ff9b9b]' : 'text-white'}>{meta.label}</p>
                  {device && <p className="text-[0.8em] text-white/50">{device}</p>}
                </div>
                <time dateTime={ev.created_at} className="text-[0.8em] text-white/50 text-right">{formatDate(ev.created_at)}</time>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export default function SecurityTab({ email, security }: { email: string; security: SecurityInfo }) {
  return (
    <div className="flex flex-col gap-8">
      <TabHeading title="Login & security" subtitle="Your password, sign-in methods and recent account activity." />
      <SignInMethods email={email} security={security} />
      <PasswordPanel email={email} hasPassword={security.hasPassword} />
      <DevicesPanel hasPassword={security.hasPassword} />
      <ActivityPanel security={security} />
    </div>
  );
}

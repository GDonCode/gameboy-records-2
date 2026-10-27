// components/account/ProfileDetails.tsx
'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DISPLAY_NAME_MAX, validateDisplayName, validateEmail } from '@/lib/account-validation';
import {
  BODY,
  ERROR_TEXT,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  SUCCESS_TEXT,
  TEXT_BUTTON,
  readError,
} from './formStyles';
import type { AccountUser } from './types';

function Row({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 py-4">
      <dt className="sm:w-[160px] sm:pt-0.5 flex-shrink-0 text-[0.85em] text-white/50">{label}</dt>
      <dd className="flex-1 min-w-0 text-white">{children}</dd>
      {action && <div className="sm:pt-0.5">{action}</div>}
    </div>
  );
}

// ── NAME ─────────────────────────────────────────────────────────────────────
function NameRow({ initialName, onSaved }: { initialName: string; onSaved: () => void }) {
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    const result = validateDisplayName(draft);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    if (result.value === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: result.value }),
      });
      if (!res.ok) {
        setError(await readError(res, 'Could not save your name. Please try again.'));
        return;
      }
      const data = await res.json();
      setName(data.displayName);
      setEditing(false);
      setSaved(true);
      onSaved();
    } catch {
      setError('Could not save your name. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <Row
        label="Name"
        action={
          <button type="button" className={TEXT_BUTTON} onClick={() => { setDraft(name); setError(null); setSaved(false); setEditing(true); }}>
            Edit
          </button>
        }
      >
        <span className="break-words">{name}</span>
        {saved && <p role="status" className={`${SUCCESS_TEXT} mt-1`}>Name updated.</p>}
      </Row>
    );
  }

  return (
    <Row label="Name">
      <form onSubmit={save} className="flex flex-col gap-3 max-w-[420px]" noValidate>
        <label htmlFor="display-name" className="sr-only">Name</label>
        <input
          id="display-name"
          className={INPUT_CLASS}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={DISPLAY_NAME_MAX}
          autoComplete="name"
          autoFocus
          disabled={saving}
          aria-invalid={!!error}
          aria-describedby={error ? 'display-name-error' : undefined}
        />
        {error && <p id="display-name-error" role="alert" className={ERROR_TEXT}>{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className={PRIMARY_BUTTON} disabled={saving}>{saving ? 'SAVING…' : 'SAVE'}</button>
          <button type="button" className={SECONDARY_BUTTON} disabled={saving} onClick={() => setEditing(false)}>CANCEL</button>
        </div>
      </form>
    </Row>
  );
}

// ── EMAIL ────────────────────────────────────────────────────────────────────
type EmailStep = 'view' | 'request' | 'verify';

function EmailRow({ initialEmail, hasPassword, onSaved }: { initialEmail: string; hasPassword: boolean; onSaved: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState<EmailStep>('view');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function reset() {
    setStep('view');
    setNewEmail('');
    setPassword('');
    setCode('');
    setError(null);
  }

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    const result = validateEmail(newEmail);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    if (!password) {
      setError('Enter your current password.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/account/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: result.value, password }),
      });
      if (!res.ok) {
        setError(await readError(res, 'Could not send a code. Please try again.'));
        return;
      }
      setNewEmail(result.value);
      setCode('');
      setStep('verify');
      setNotice(`We sent a 6-digit code to ${result.value}.`);
    } catch {
      setError('Could not send a code. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code from the email.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        setError(await readError(res, 'Could not check the code. Please try again.'));
        return;
      }
      const data = await res.json();
      setEmail(data.email);
      reset();
      setNotice('Email updated. Use it the next time you sign in.');
      onSaved();
    } catch {
      setError('Could not check the code. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'view') {
    return (
      <Row
        label="Email"
        action={
          hasPassword ? (
            <button type="button" className={TEXT_BUTTON} onClick={() => { setNotice(null); setStep('request'); }}>
              Change
            </button>
          ) : undefined
        }
      >
        <span className="break-all">{email}</span>
        {!hasPassword && <p className="mt-1 text-[0.8em] text-white/50">Managed by your Google sign-in.</p>}
        {notice && <p role="status" className={`${SUCCESS_TEXT} mt-1`}>{notice}</p>}
      </Row>
    );
  }

  if (step === 'request') {
    return (
      <Row label="Email">
        <form onSubmit={requestCode} className="flex flex-col gap-3 max-w-[420px]" noValidate>
          <p className="text-[0.85em] text-white/60">
            Current: <span className="text-white break-all">{email}</span>
          </p>
          <div>
            <label htmlFor="new-email" className={LABEL_CLASS}>New email</label>
            <input
              id="new-email"
              type="email"
              className={INPUT_CLASS}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={busy}
            />
          </div>
          <div>
            <label htmlFor="current-password" className={LABEL_CLASS}>Current password</label>
            <input
              id="current-password"
              type="password"
              className={INPUT_CLASS}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={busy}
            />
          </div>
          {error && <p role="alert" className={ERROR_TEXT}>{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className={PRIMARY_BUTTON} disabled={busy}>{busy ? 'SENDING…' : 'SEND CODE'}</button>
            <button type="button" className={SECONDARY_BUTTON} disabled={busy} onClick={reset}>CANCEL</button>
          </div>
        </form>
      </Row>
    );
  }

  return (
    <Row label="Email">
      <form onSubmit={verify} className="flex flex-col gap-3 max-w-[420px]" noValidate>
        {notice && <p role="status" className="text-[0.85em] text-white/70">{notice} It expires in 15 minutes.</p>}
        <div>
          <label htmlFor="email-code" className={LABEL_CLASS}>Verification code</label>
          <input
            id="email-code"
            className={`${INPUT_CLASS} tracking-[0.4em] text-[1.1em] max-w-[200px]`}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            disabled={busy}
            aria-invalid={!!error}
          />
        </div>
        {error && <p role="alert" className={ERROR_TEXT}>{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={PRIMARY_BUTTON} disabled={busy}>{busy ? 'CHECKING…' : 'CONFIRM'}</button>
          <button type="button" className={SECONDARY_BUTTON} disabled={busy} onClick={reset}>CANCEL</button>
          <button type="button" className={TEXT_BUTTON} disabled={busy} onClick={() => requestCode()}>
            Send a new code
          </button>
        </div>
      </form>
    </Row>
  );
}

// ── DETAILS LIST ─────────────────────────────────────────────────────────────
export default function ProfileDetails({ user, memberSince }: { user: AccountUser; memberSince: string }) {
  const router = useRouter();
  const { update } = useSession();

  // Keep the sign-in session (header, other tabs) and the server-rendered page in step with the edit.
  function refreshAfterSave() {
    update().catch(() => {});
    router.refresh();
  }

  return (
    <dl className="flex flex-col divide-y divide-white/10" style={BODY}>
      <NameRow initialName={user.display_name} onSaved={refreshAfterSave} />
      <EmailRow initialEmail={user.email} hasPassword={user.has_password} onSaved={refreshAfterSave} />
      <Row label="Member since">{memberSince}</Row>
      <Row label="Points">{(user.points_balance ?? 0).toLocaleString('en-US')}</Row>
    </dl>
  );
}

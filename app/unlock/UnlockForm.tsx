// app/unlock/UnlockForm.tsx
'use client';

import { useState, type FormEvent } from 'react';

const BODY = { fontFamily: "'Poppins', sans-serif" } as const;

export default function UnlockForm({ next }: { next: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password) return setError('Enter the password.');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.');
        setBusy(false);
        return;
      }
      // Full navigation, so the proxy sees the new cookie.
      window.location.assign(data?.next ?? '/');
    } catch {
      setError('Something went wrong. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 flex w-full max-w-[340px] flex-col gap-3" style={BODY}>
      <label htmlFor="site-password" className="sr-only">Password</label>
      <input
        id="site-password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={busy}
        placeholder="Password"
        aria-invalid={!!error}
        aria-describedby={error ? 'site-password-error' : undefined}
        className="h-12 w-full border border-[#1a9e4a]/40 bg-white/5 px-4 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#4dff91] focus:bg-white/[0.08] aria-[invalid=true]:border-[#ff6b6b]"
      />
      {error && <p id="site-password-error" role="alert" className="text-left text-[13px] text-[#ff8a8a]">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
        className="h-12 w-full bg-[#1a9e4a] text-[13px] tracking-[0.18em] text-white transition-colors hover:bg-[#149262] disabled:opacity-60 cursor-pointer"
      >
        {busy ? 'CHECKING…' : 'ENTER'}
      </button>
    </form>
  );
}

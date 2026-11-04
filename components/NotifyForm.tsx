// components/NotifyForm.tsx
// One-field email sign-up (uses the newsletter list). Used for show alerts.
'use client';

import { useId, useState } from 'react';
import Button from '@/components/ui/Button';

export default function NotifyForm({ cta = 'Notify me', success = 'You’re on the list. You’ll hear first.' }: { cta?: string; success?: string }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
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
      setStatus({ ok: true, text: success });
      setEmail('');
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'That didn’t go through. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input id={id} type="email" autoComplete="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="field sm:flex-1 min-w-0" />
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Sending' : cta}
        </Button>
      </div>
      <p role="status" aria-live="polite" className={`mt-3 mb-0 min-h-[1.4em] text-[0.85rem] ${status?.ok ? 'text-green-light' : 'text-danger-light'}`}>
        {status?.text ?? ''}
      </p>
    </form>
  );
}

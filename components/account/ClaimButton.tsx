// components/account/ClaimButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimButton({ level }: { level: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Could not claim. Try again.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not claim. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={claim}
        disabled={busy}
        className="px-3 py-1 rounded-full bg-[#4dff91] text-[#0c1510] text-[0.7em] tracking-[0.15em] shadow-[0_0_12px_rgba(77,255,145,0.6)] animate-pulse disabled:animate-none disabled:opacity-60 cursor-pointer"
        style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
      >
        {busy ? 'CLAIMING…' : 'CLAIM'}
      </button>
      {error && (
        <span className="text-[#ff6b6b] text-[0.65em]" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
}
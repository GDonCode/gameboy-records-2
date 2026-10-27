// app/unlock/page.tsx
// The development-phase password page (see lib/site-gate.ts).
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import NeonHeading from '@/components/NeonHeading';
import { gatePassword, safeNext } from '@/lib/site-gate';
import UnlockForm from './UnlockForm';

export const metadata: Metadata = {
  title: 'Coming soon',
  robots: { index: false, follow: false },
};

export default async function UnlockPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (!gatePassword()) redirect(next);

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
    >
      <NeonHeading kicker="Gameboy Records">Coming soon</NeonHeading>
      <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-[#e8f5ec]/75" style={{ fontFamily: "'Poppins', sans-serif" }}>
        The new site is in development. Enter the preview password to continue.
      </p>
      <UnlockForm next={next} />
    </main>
  );
}

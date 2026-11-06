// app/unlock/page.tsx
// The development-phase password page (see lib/site-gate.ts).
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
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
    <main className="paper-ink flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/gameboy-records-logo.jpg" alt="Gameboy Records" width={1600} height={325} className="mb-8 w-full max-w-[420px] h-auto rounded-xs bg-paper p-5 border-[3px] border-paper shadow-[6px_6px_0_var(--color-gold)]" />
      <PageTitle tone="dark" as="h1" ghost="Soon">Coming soon</PageTitle>
      <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-[#F5F5F5]/75" style={{ fontFamily: "'Poppins', sans-serif" }}>
        The new site is in development. Enter the preview password to continue.
      </p>
      <UnlockForm next={next} />
    </main>
  );
}

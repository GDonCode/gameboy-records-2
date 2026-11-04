// app/account/login/page.tsx — Sign in / Join the Playaz Club
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import NeonHeading from '@/components/NeonHeading';
import AuthForm from '@/components/AuthForm';
import { CLUB_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `Sign in or join the ${CLUB_NAME}`,
  description: `Sign in to your ${CLUB_NAME} membership, or join to collect Club Points on orders, tickets and quests.`,
  alternates: { canonical: '/account/login' },
  robots: { index: false, follow: true },
};

export default async function AccountLoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return (
    <PageShell>
      <div className="bg-ink pt-14 md:pt-20">
        <NeonHeading kicker="Members" subtitle="Club Points · Early access · Rewards">
          {CLUB_NAME}
        </NeonHeading>
      </div>
      <AuthForm initialMode={mode === 'register' ? 'register' : 'signin'} />
    </PageShell>
  );
}

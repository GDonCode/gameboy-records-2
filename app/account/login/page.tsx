// app/account/login/page.tsx — Sign in / Join the Playaz Club
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import PageTitle from '@/components/PageTitle';
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
      <div className="paper-ink pt-12 md:pt-16">
        <PageTitle tone="dark" ghost="Join" kicker="Members" subtitle="Club Points · Early access · Rewards">
          {CLUB_NAME}
        </PageTitle>
      </div>
      <AuthForm initialMode={mode === 'register' ? 'register' : 'signin'} />
    </PageShell>
  );
}

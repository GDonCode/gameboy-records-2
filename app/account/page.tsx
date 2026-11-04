// app/account/page.tsx
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getQuestStatus } from '@/lib/quests';
import { getRewardClaims } from '@/lib/claims';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import { getAddresses } from '@/lib/addresses';
import { getSecurityInfo } from '@/lib/account-security';
import { getOrders } from '@/lib/orders';
import { getSupportRequests } from '@/lib/support-requests';
import { isAccountTab, type AccountUser } from '@/components/account/types';
import AccountClient from './AccountClient';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Your Playaz Club',
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== 'user') {
    redirect('/account/login');
  }

  const { data: row, error } = await supabaseAdmin
    .from('users')
    .select('id, email, display_name, points_balance, created_at, avatar_url, password_hash')
    .eq('id', session.user.id)
    .single();

  if (error || !row) redirect('/account/login');

  // Never send the password hash to the browser; the client only needs to know whether one exists.
  const { password_hash, ...rest } = row;
  const user: AccountUser = { ...rest, has_password: !!password_hash };

  const [orders, quests, claims, addresses, security, supportRequests] = await Promise.all([
    getOrders(session.user.id),
    getQuestStatus(session.user.id),
    getRewardClaims(session.user.id),
    getAddresses(session.user.id),
    getSecurityInfo(session.user.id, user.has_password),
    getSupportRequests(session.user.id),
  ]);
  const { tab } = await searchParams;
  const initialTab = isAccountTab(tab) ? tab : null;

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/account/login' });
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <AccountClient
        user={user}
        orders={orders}
        addresses={addresses}
        security={security}
        supportRequests={supportRequests}
        quests={quests}
        claims={claims}
        initialTab={initialTab}
        signOutAction={handleSignOut}
      />
    </div>
  );
}

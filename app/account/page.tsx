// app/account/page.tsx
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Header from '@/components/Header';
import AccountAvatar from '@/components/AccountAvatar';

export const revalidate = 0;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== 'user') {
    redirect('/account/login');
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, display_name, points_balance, created_at, avatar_url')
    .eq('id', session.user.id)
    .single();

  if (error || !user) redirect('/account/login');

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/account/login' });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main
        className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-16"
        style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #10160f 100%)' }}
      >
        <div className="max-w-[480px] w-full flex flex-col gap-8">
          <h1
            className="text-[1.8em] tracking-[0.1em] text-[#4dff91]"
            style={{ fontFamily: "'Poppins', monospace", textShadow: '0 0 20px rgba(77,255,145,0.25)' }}
          >
            MY ACCOUNT
          </h1>

          <AccountAvatar displayName={user.display_name} initialAvatarUrl={user.avatar_url} />

          <div className="flex flex-col gap-3" style={{ fontFamily: "'Poppins', monospace", color: '#fff' }}>
            <div><span style={{ opacity: 0.6 }}>Name:</span> {user.display_name}</div>
            <div><span style={{ opacity: 0.6 }}>Email:</span> {user.email}</div>
            <div><span style={{ opacity: 0.6 }}>Points:</span> {user.points_balance}</div>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-[0.85em] tracking-[0.1em] text-[#ff6b6b]"
              style={{ fontFamily: "'Poppins', monospace" }}
            >
              LOG OUT
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
// app/account/page.tsx
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { products } from '@/lib/products';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import { isAccountTab, type SavedItem } from '@/components/account/types';
import AccountClient from './AccountClient';

export const revalidate = 0;

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

  const { data: wishlistRows, error: wishlistError } = await supabaseAdmin
    .from('wishlist_items')
    .select('id, product_id, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (wishlistError) {
    console.error('Failed to fetch saved items:', wishlistError.message);
  }

  const savedItems: SavedItem[] = (wishlistRows ?? []).map((row) => {
    const product = products.find((p) => p.id === row.product_id);
    return {
      id: row.id,
      product_id: row.product_id,
      name: product?.name ?? 'Unknown product',
      price: product?.price ?? 0,
      image: product?.images?.[0] ?? null,
      slug: product?.slug ?? row.product_id,
    };
  });

  const { tab } = await searchParams;
  const initialTab = isAccountTab(tab) ? tab : null;

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/account/login' });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <MobileBottomNav />
      <AccountClient user={user} savedItems={savedItems} initialTab={initialTab} signOutAction={handleSignOut} />
    </div>
  );
}

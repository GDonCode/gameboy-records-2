// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardClient from './DashboardClient';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/account/login');

  const { data: artist, error: artistError } = await supabaseAdmin
    .from('artists')
    .select('id, name, email, portrait_url, is_admin, created_at')
    .eq('id', session.user.id)
    .single();

  if (artistError || !artist) redirect('/account/login');

  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id, title, slug, teaser, body, tag, status, created_at, cover_image_url, cover_media_type')
    .eq('author_id', session.user.id)
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('Failed to fetch own posts:', postsError.message);
  }

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/account/login' });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardHeader />
      <DashboardClient initialArtist={artist} initialPosts={posts || []} signOutAction={handleSignOut} />
    </div>
  );
}
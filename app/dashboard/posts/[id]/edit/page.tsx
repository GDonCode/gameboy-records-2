// app/dashboard/posts/[id]/edit/page.tsx
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import EditPostForm from '@/components/EditPostForm';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/account/login');

  const { id } = await params;

  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .select('id, title, teaser, body, tag, status, author_id, cover_image_url')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  if (post.author_id !== session.user.id && !session.user.isAdmin) {
    redirect('/dashboard/posts');
  }

  return <EditPostForm post={post} />;
}
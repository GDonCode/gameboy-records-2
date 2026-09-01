// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { id } = await params;
  const { title, teaser, body, tag, status, cover_image_url, cover_media_type } = await request.json();

  if (!title || !teaser || !body) {
    return NextResponse.json({ error: 'Title, teaser, and body are required.' }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('posts')
    .select('author_id, status, published_at')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }

  if (existing.author_id !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Not authorized to edit this post.' }, { status: 403 });
  }

  const nextStatus = status === 'published' ? 'published' : 'draft';
  const publishedAt =
    nextStatus === 'published'
      ? existing.published_at || new Date().toISOString()
      : null;

  const { error } = await supabaseAdmin
    .from('posts')
    .update({
      title,
      teaser,
      body,
      tag: tag || 'NEWS',
      cover_image_url: cover_image_url || null,
      cover_media_type: cover_image_url ? (cover_media_type || 'image') : null,
      status: nextStatus,
      published_at: publishedAt,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { id } = await params;

  const { data: post, error: fetchError } = await supabaseAdmin
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }

  if (post.author_id !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Not authorized to delete this post.' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
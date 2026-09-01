// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { title, teaser, body, tag, status, cover_image_url, cover_media_type } = await request.json();

  if (!title || !teaser || !body) {
    return NextResponse.json({ error: 'Title, teaser, and body are required.' }, { status: 400 });
  }

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      author_id: session.user.id,
      title,
      slug,
      teaser,
      body,
      tag: tag || 'NEWS',
      cover_image_url: cover_image_url || null,
      cover_media_type: cover_image_url ? (cover_media_type || 'image') : null,
      status: status === 'published' ? 'published' : 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id, slug')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 });
}
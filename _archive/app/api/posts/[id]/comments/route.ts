// app/api/posts/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabase-public';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabasePublic
    .from('comments')
    .select('id, body, author_name, created_at, users ( avatar_url )')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to load comments.' }, { status: 500 });
  }

  const comments = (data ?? []).map((c: any) => ({
    id: c.id,
    body: c.body,
    author_name: c.author_name,
    created_at: c.created_at,
    avatar_url: c.users?.avatar_url ?? null,
  }));

  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'You must be logged in to comment.' }, { status: 401 });
  }

  const { id } = await params;
  const { body } = await req.json();

  if (!body || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({
      post_id: id,
      user_id: (session.user as any).id,
      author_name: session.user.name || 'Anonymous',
      body: body.trim(),
    })
    .select('id, body, author_name, created_at, users ( avatar_url )')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to post comment.' }, { status: 500 });
  }

  const comment = {
    id: data.id,
    body: data.body,
    author_name: data.author_name,
    created_at: data.created_at,
    avatar_url: (data as any).users?.avatar_url ?? null,
  };

  return NextResponse.json({ comment }, { status: 201 });
}
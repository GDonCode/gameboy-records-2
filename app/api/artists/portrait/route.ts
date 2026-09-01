// app/api/artist/portrait/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image.' }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('artist-portraits')
    .upload(path, arrayBuffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('artist-portraits')
    .getPublicUrl(path);

  const { error: updateError } = await supabaseAdmin
    .from('artists')
    .update({ portrait_url: publicUrlData.publicUrl })
    .eq('id', session.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
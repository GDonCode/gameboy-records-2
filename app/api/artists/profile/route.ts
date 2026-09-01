// app/api/artist/profile/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, currentPassword, newPassword } = body as {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const updates: Record<string, any> = {};

  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (!email.trim()) {
      return NextResponse.json({ error: 'Email cannot be empty.' }, { status: 400 });
    }
    updates.email = email.trim();
  }

  if (newPassword !== undefined) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('artists')
      .select('password_hash')
      .eq('id', session.user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Could not verify current password.' }, { status: 500 });
    }

    const valid = await bcrypt.compare(currentPassword, existing.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    updates.password_hash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes provided.' }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('artists')
    .update(updates)
    .eq('id', session.user.id)
    .select('id, name, email, portrait_url')
    .single();

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ artist: updated });
}
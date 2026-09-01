// app/api/account/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, displayName } = body as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  if (!email?.trim() || !password || !displayName?.trim()) {
    return NextResponse.json({ error: 'Email, password, and name are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({ email: email.trim(), password_hash, display_name: displayName.trim() })
    .select('id, email, display_name')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user });
}
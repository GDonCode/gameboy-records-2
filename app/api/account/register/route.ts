// app/api/account/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardPoints, SIGNUP_BONUS } from '@/lib/points';


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const { email, password, displayName } = body as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof displayName !== 'string' ||
    !email.trim() ||
    !password ||
    !displayName.trim()
  ) {
    return NextResponse.json({ error: 'Email, password, and name are required.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !EMAIL_RE.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (displayName.trim().length > 50) {
    return NextResponse.json({ error: 'Display name must be 50 characters or fewer.' }, { status: 400 });
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return NextResponse.json({ error: 'Password is too long. Try a shorter one.' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({ email: normalizedEmail, password_hash, display_name: displayName.trim() })
    .select('id, email, display_name')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 });
    }
    console.error('Registration insert failed:', error.message);
    return NextResponse.json({ error: 'Could not create your account. Please try again.' }, { status: 500 });
  }

  // Endowed progress: new members start partway to their first reward.
  // A failed award is logged inside awardPoints and must not block registration.
  try {
    await awardPoints(user.id, SIGNUP_BONUS, 'signup_bonus');
  } catch (err) {
    console.error('Signup bonus failed:', err);
  }

  return NextResponse.json({ user });
}
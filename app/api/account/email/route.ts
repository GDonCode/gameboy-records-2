// app/api/account/email/route.ts
// Step 1 of changing the account email: check the password and email a code to the new address.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateEmail } from '@/lib/account-validation';
import { sendEmailChangeCode } from '@/lib/mailer';
import { PASSWORD_CHECK_ERRORS, checkCurrentPassword } from '@/lib/account-security';
import { CODE_TTL_MINUTES, MAX_REQUESTS_PER_HOUR, generateCode, hashCode } from '@/lib/email-change';

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = validateEmail(body?.newEmail);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  const newEmail = result.value;

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email, password_hash, display_name')
    .eq('id', userId)
    .single();
  if (userError || !user) {
    return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });
  }

  // Google sign-in finds accounts by email, so changing it would lock a Google-only member out.
  if (!user.password_hash) {
    return NextResponse.json(
      { error: 'Your email comes from your Google sign-in, so it can’t be changed here.' },
      { status: 403 }
    );
  }
  if (newEmail === user.email) {
    return NextResponse.json({ error: 'That’s already your email.' }, { status: 400 });
  }
  // Wrong passwords are logged and rate-limited (shared with the Login & security tab).
  const check = await checkCurrentPassword(userId, user.password_hash, body?.password, request);
  if (check !== 'ok') {
    const { error, status } = PASSWORD_CHECK_ERRORS[check];
    return NextResponse.json({ error }, { status });
  }

  const { data: taken } = await supabaseAdmin.from('users').select('id').eq('email', newEmail).maybeSingle();
  if (taken) {
    return NextResponse.json({ error: 'That email is already used by another account.' }, { status: 409 });
  }

  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabaseAdmin
    .from('email_change_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', hourAgo);
  if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return NextResponse.json({ error: 'Too many codes requested. Try again in an hour.' }, { status: 429 });
  }

  const code = generateCode();
  const { error: insertError } = await supabaseAdmin.from('email_change_requests').insert({
    user_id: userId,
    new_email: newEmail,
    code_hash: hashCode(userId, newEmail, code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
  });
  if (insertError) {
    console.error('Failed to store email change request:', insertError.message);
    return NextResponse.json({ error: 'Could not send a code. Please try again.' }, { status: 500 });
  }

  try {
    await sendEmailChangeCode(newEmail, code, user.display_name);
  } catch (err) {
    console.error('Failed to send email change code:', err);
    return NextResponse.json({ error: 'Could not send a code to that address. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ sentTo: newEmail });
}

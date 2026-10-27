// app/api/account/password/code/route.ts
// Google-only members: email a code to the account address before they can add a password.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendSetPasswordCode } from '@/lib/mailer';
import { CODE_TTL_MINUTES, MAX_REQUESTS_PER_HOUR, generateCode, hashCode } from '@/lib/email-change';

export async function POST() {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('email, password_hash, display_name')
    .eq('id', userId)
    .single();
  if (error || !user) {
    return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });
  }
  if (user.password_hash) {
    return NextResponse.json({ error: 'Your account already has a password.' }, { status: 400 });
  }

  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabaseAdmin
    .from('account_verification_codes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('purpose', 'set_password')
    .gte('created_at', hourAgo);
  if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return NextResponse.json({ error: 'Too many codes requested. Try again in an hour.' }, { status: 429 });
  }

  const code = generateCode();
  const { error: insertError } = await supabaseAdmin.from('account_verification_codes').insert({
    user_id: userId,
    purpose: 'set_password',
    code_hash: hashCode(userId, `set_password:${user.email}`, code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
  });
  if (insertError) {
    console.error('Failed to store set-password code:', insertError.message);
    return NextResponse.json({ error: 'Could not send a code. Please try again.' }, { status: 500 });
  }

  try {
    await sendSetPasswordCode(user.email, code, user.display_name);
  } catch (err) {
    console.error('Failed to send set-password code:', err);
    return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ sentTo: user.email });
}

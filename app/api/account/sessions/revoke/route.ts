// app/api/account/sessions/revoke/route.ts
// Sign out everywhere. Members with a password confirm it first, and the page signs this device back in;
// Google-only members are signed out here too and sign in again with Google.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PASSWORD_CHECK_ERRORS, checkCurrentPassword, logSecurityEvent, revokeSessions } from '@/lib/account-security';

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('email, password_hash')
    .eq('id', userId)
    .single();
  if (error || !user) {
    return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });
  }

  if (user.password_hash) {
    const check = await checkCurrentPassword(userId, user.password_hash, body?.currentPassword, request);
    if (check !== 'ok') {
      const { error: message, status } = PASSWORD_CHECK_ERRORS[check];
      return NextResponse.json({ error: message }, { status });
    }
  }

  if (!(await revokeSessions(userId))) {
    return NextResponse.json({ error: 'Could not sign out your devices. Please try again.' }, { status: 500 });
  }
  await logSecurityEvent(userId, 'signed_out_everywhere', request);

  return NextResponse.json({ email: user.email, keepThisDevice: !!user.password_hash });
}

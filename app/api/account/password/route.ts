// app/api/account/password/route.ts
// Change the password (current password required) or, for Google-only members, add one (emailed code required).
// Either way every session is signed out; the page signs this device straight back in with the new password.
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateNewPassword } from '@/lib/account-validation';
import { sendPasswordChangedNotice } from '@/lib/mailer';
import { MAX_CODE_ATTEMPTS, codesMatch, hashCode } from '@/lib/email-change';
import { PASSWORD_CHECK_ERRORS, checkCurrentPassword, logSecurityEvent, revokeSessions } from '@/lib/account-security';

type CodeCheck = { ok: true; id: string } | { ok: false; error: string; status: number };

async function checkSetPasswordCode(userId: string, email: string, code: unknown): Promise<CodeCheck> {
  const clean = typeof code === 'string' ? code.replace(/\s/g, '') : '';
  if (!/^\d{6}$/.test(clean)) return { ok: false, error: 'Enter the 6-digit code from the email.', status: 400 };

  const { data: row, error } = await supabaseAdmin
    .from('account_verification_codes')
    .select('id, code_hash, attempts, expires_at')
    .eq('user_id', userId)
    .eq('purpose', 'set_password')
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, error: 'Could not check the code. Please try again.', status: 500 };
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: 'That code has expired. Request a new one.', status: 400 };
  }
  if (row.attempts >= MAX_CODE_ATTEMPTS) {
    return { ok: false, error: 'Too many wrong codes. Request a new one.', status: 429 };
  }
  if (!codesMatch(row.code_hash, hashCode(userId, `set_password:${email}`, clean))) {
    await supabaseAdmin.from('account_verification_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
    const left = MAX_CODE_ATTEMPTS - row.attempts - 1;
    return {
      ok: false,
      error: left > 0 ? `That code isn’t right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Request a new one.',
      status: 400,
    };
  }
  return { ok: true, id: row.id };
}

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email, password_hash, display_name')
    .eq('id', userId)
    .single();
  if (userError || !user) {
    return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });
  }

  const passwordError = validateNewPassword(body?.newPassword, user.email);
  if (passwordError) return NextResponse.json({ error: passwordError, field: 'newPassword' }, { status: 400 });
  const newPassword: string = body.newPassword;

  const isChange = !!user.password_hash;
  let codeId: string | null = null;

  if (isChange) {
    const check = await checkCurrentPassword(userId, user.password_hash, body?.currentPassword, request);
    if (check !== 'ok') {
      const { error, status } = PASSWORD_CHECK_ERRORS[check];
      return NextResponse.json({ error, field: 'currentPassword' }, { status });
    }
    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return NextResponse.json({ error: 'Choose a password you haven’t used here before.', field: 'newPassword' }, { status: 400 });
    }
  } else {
    const code = await checkSetPasswordCode(userId, user.email, body?.code);
    if (!code.ok) return NextResponse.json({ error: code.error, field: 'code' }, { status: code.status });
    codeId = code.id;
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: await bcrypt.hash(newPassword, 10), password_changed_at: now })
    .eq('id', userId);
  if (updateError) {
    console.error('Failed to save password:', updateError.message);
    return NextResponse.json({ error: 'Could not save your password. Please try again.' }, { status: 500 });
  }

  if (codeId) {
    await supabaseAdmin
      .from('account_verification_codes')
      .update({ used_at: now })
      .eq('user_id', userId)
      .eq('purpose', 'set_password')
      .is('used_at', null);
  }

  await revokeSessions(userId);
  await logSecurityEvent(userId, isChange ? 'password_changed' : 'password_set', request);
  try {
    await sendPasswordChangedNotice(user.email, user.display_name, isChange ? 'changed' : 'set');
  } catch (err) {
    console.error('Failed to send password notice:', err);
  }

  // The page signs back in with this email and the new password.
  return NextResponse.json({ email: user.email });
}

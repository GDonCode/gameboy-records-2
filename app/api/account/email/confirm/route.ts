// app/api/account/email/confirm/route.ts
// Step 2 of changing the account email: check the emailed code and switch the address.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { MAX_CODE_ATTEMPTS, codesMatch, hashCode } from '@/lib/email-change';

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.replace(/\s/g, '') : '';
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code from the email.' }, { status: 400 });
  }

  // Only the newest unused request counts; requesting a new code replaces the old one.
  const { data: req, error } = await supabaseAdmin
    .from('email_change_requests')
    .select('id, new_email, code_hash, attempts, expires_at')
    .eq('user_id', userId)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load email change request:', error.message);
    return NextResponse.json({ error: 'Could not check the code. Please try again.' }, { status: 500 });
  }
  if (!req || new Date(req.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'That code has expired. Request a new one.' }, { status: 400 });
  }
  if (req.attempts >= MAX_CODE_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many wrong codes. Request a new one.' }, { status: 429 });
  }

  if (!codesMatch(req.code_hash, hashCode(userId, req.new_email, code))) {
    await supabaseAdmin.from('email_change_requests').update({ attempts: req.attempts + 1 }).eq('id', req.id);
    const left = MAX_CODE_ATTEMPTS - req.attempts - 1;
    return NextResponse.json(
      { error: left > 0 ? `That code isn’t right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Request a new one.' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabaseAdmin.from('users').update({ email: req.new_email }).eq('id', userId);
  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json({ error: 'That email is already used by another account.' }, { status: 409 });
    }
    console.error('Failed to update email:', updateError.message);
    return NextResponse.json({ error: 'Could not change your email. Please try again.' }, { status: 500 });
  }

  // Close this request and any older open ones.
  await supabaseAdmin
    .from('email_change_requests')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('used_at', null);

  return NextResponse.json({ email: req.new_email });
}

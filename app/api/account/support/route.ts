// app/api/account/support/route.ts
// A member sends a support request: saved with a reference number, emailed to the support inbox
// (replies go straight to the member) and confirmed to the member by email.
import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendSupportConfirmation, sendSupportRequestToStaff } from '@/lib/mailer';
import { getSupportRequests } from '@/lib/support-requests';
import { MAX_OPEN_REQUESTS, MAX_REQUESTS_PER_DAY, topicLabel, validateSupportRequest } from '@/lib/support';

// No 0/O or 1/I, so references are easy to read out and type.
const REF_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
function newReference(): string {
  let ref = 'GBR-';
  for (let i = 0; i < 6; i++) ref += REF_CHARS[randomInt(REF_CHARS.length)];
  return ref;
}

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = validateSupportRequest(body);
  if ('errors' in result) {
    return NextResponse.json({ error: 'Check the highlighted fields.', fieldErrors: result.errors }, { status: 400 });
  }
  const input = result.value;

  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [{ data: user, error: userError }, { count: today }, { count: open }] = await Promise.all([
    supabaseAdmin.from('users').select('email, display_name, points_balance, created_at').eq('id', userId).single(),
    supabaseAdmin.from('support_requests').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', dayAgo),
    supabaseAdmin.from('support_requests').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'open'),
  ]);
  if (userError || !user) {
    return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });
  }
  if ((today ?? 0) >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: 'You’ve sent several requests today. We’ll get to them soon; you can send more tomorrow.' }, { status: 429 });
  }
  if ((open ?? 0) >= MAX_OPEN_REQUESTS) {
    return NextResponse.json({ error: `You have ${MAX_OPEN_REQUESTS} open requests. Mark one resolved, or add to it by replying to its confirmation email.` }, { status: 429 });
  }

  // References are random; retry on the rare clash with an existing one.
  let saved: { id: string; reference: string } | null = null;
  for (let attempt = 0; attempt < 3 && !saved; attempt++) {
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .insert({ ...input, user_id: userId, reference: newReference() })
      .select('id, reference')
      .single();
    if (data) saved = data;
    else if (error?.code !== '23505') {
      console.error('Failed to save support request:', error?.message);
      break;
    }
  }
  if (!saved) {
    return NextResponse.json({ error: 'Could not send your message. Please try again, or email us directly.' }, { status: 500 });
  }

  const mailReq = {
    reference: saved.reference,
    topicLabel: topicLabel(input.topic),
    subject: input.subject,
    message: input.message,
    orderNumber: input.order_number,
  };
  const member = {
    id: userId,
    email: user.email,
    name: user.display_name,
    points: user.points_balance ?? 0,
    memberSince: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  // The request is already saved, so a mail failure is logged (and flagged on the row) rather than shown as an error.
  try {
    await sendSupportRequestToStaff(mailReq, member);
    await supabaseAdmin.from('support_requests').update({ staff_notified: true }).eq('id', saved.id);
  } catch (err) {
    console.error(`Failed to email support request ${saved.reference} to staff:`, err);
  }
  try {
    await sendSupportConfirmation(mailReq, member);
  } catch (err) {
    console.error(`Failed to send support confirmation ${saved.reference}:`, err);
  }

  return NextResponse.json({ reference: saved.reference, requests: await getSupportRequests(userId) }, { status: 201 });
}

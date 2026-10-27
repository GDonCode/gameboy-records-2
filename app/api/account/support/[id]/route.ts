// app/api/account/support/[id]/route.ts
// The member marks one of their requests resolved, or reopens it.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSupportRequests } from '@/lib/support-requests';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (status !== 'open' && status !== 'resolved') {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('support_requests')
    .update({ status, updated_at: now, resolved_at: status === 'resolved' ? now : null })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id');
  if (error) {
    console.error('Failed to update support request:', error.message);
    return NextResponse.json({ error: 'Could not update the request. Please try again.' }, { status: 500 });
  }
  if (!data || data.length === 0) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

  return NextResponse.json({ requests: await getSupportRequests(userId) });
}

// app/api/account/addresses/[id]/route.ts
// Edit, make default, or delete one of the member's shipping addresses.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateAddress } from '@/lib/account-validation';
import { getAddresses, setDefaultAddress } from '@/lib/addresses';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function ownedAddress(userId: string, id: string) {
  if (!UUID_RE.test(id)) return null;
  const { data } = await supabaseAdmin
    .from('user_addresses')
    .select('id, is_default')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

// Body: a full address to edit it, or { is_default: true } alone to make it the default.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAddress(userId, id);
  if (!existing) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const onlyDefault = body && typeof body === 'object' && Object.keys(body).length === 1 && body.is_default === true;

  if (!onlyDefault) {
    const result = validateAddress(body);
    if ('errors' in result) {
      return NextResponse.json({ error: 'Check the highlighted fields.', fieldErrors: result.errors }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('user_addresses')
      .update({ ...result.value, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('Failed to update address:', error.message);
      return NextResponse.json({ error: 'Could not save the address. Please try again.' }, { status: 500 });
    }
  }

  if (body?.is_default === true && !existing.is_default) {
    if (!(await setDefaultAddress(userId, id))) {
      return NextResponse.json({ error: 'Could not update your default address. Please try again.' }, { status: 500 });
    }
  }

  return NextResponse.json({ addresses: await getAddresses(userId) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAddress(userId, id);
  if (!existing) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

  const { error } = await supabaseAdmin.from('user_addresses').delete().eq('id', id).eq('user_id', userId);
  if (error) {
    console.error('Failed to delete address:', error.message);
    return NextResponse.json({ error: 'Could not delete the address. Please try again.' }, { status: 500 });
  }

  // Deleting the default promotes the oldest remaining address.
  let addresses = await getAddresses(userId);
  if (existing.is_default && addresses.length > 0) {
    await setDefaultAddress(userId, addresses[0].id);
    addresses = await getAddresses(userId);
  }

  return NextResponse.json({ addresses });
}

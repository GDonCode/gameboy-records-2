// app/api/account/addresses/route.ts
// Add a shipping address. The member's first address becomes the default.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { MAX_ADDRESSES, validateAddress } from '@/lib/account-validation';
import { getAddresses, setDefaultAddress } from '@/lib/addresses';

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = validateAddress(body);
  if ('errors' in result) {
    return NextResponse.json({ error: 'Check the highlighted fields.', fieldErrors: result.errors }, { status: 400 });
  }

  const { count, error: countError } = await supabaseAdmin
    .from('user_addresses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) {
    console.error('Failed to count addresses:', countError.message);
    return NextResponse.json({ error: 'Could not save the address. Please try again.' }, { status: 500 });
  }
  if ((count ?? 0) >= MAX_ADDRESSES) {
    return NextResponse.json({ error: `You can save up to ${MAX_ADDRESSES} addresses.` }, { status: 400 });
  }

  const { data: created, error } = await supabaseAdmin
    .from('user_addresses')
    .insert({ ...result.value, user_id: userId, is_default: false })
    .select('id')
    .single();
  if (error || !created) {
    console.error('Failed to save address:', error?.message);
    return NextResponse.json({ error: 'Could not save the address. Please try again.' }, { status: 500 });
  }

  if ((count ?? 0) === 0 || body?.is_default === true) {
    await setDefaultAddress(userId, created.id);
  }

  return NextResponse.json({ addresses: await getAddresses(userId) }, { status: 201 });
}

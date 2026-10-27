// app/api/account/payment-methods/[id]/route.ts
// Make a saved payment method the default (PATCH) or remove it (DELETE).
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logSecurityEvent } from '@/lib/account-security';
import { getPaymentProvider } from '@/lib/payments/provider';
import { getPaymentMethods, setDefaultPaymentMethod } from '@/lib/payments/methods';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function ownedMethod(userId: string, id: string) {
  if (!UUID_RE.test(id)) return null;
  const { data } = await supabaseAdmin
    .from('payment_methods')
    .select('id, provider, provider_method_id, provider_customer_id, is_default')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { id } = await params;
  const method = await ownedMethod(userId, id);
  if (!method) return NextResponse.json({ error: 'Payment method not found.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (body?.is_default !== true) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  if (!method.is_default && !(await setDefaultPaymentMethod(userId, id))) {
    return NextResponse.json({ error: 'Could not update your default payment method. Please try again.' }, { status: 500 });
  }
  return NextResponse.json({ methods: await getPaymentMethods(userId) });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { id } = await params;
  const method = await ownedMethod(userId, id);
  if (!method) return NextResponse.json({ error: 'Payment method not found.' }, { status: 404 });

  // Remove it from the processor's vault too. If the site has since switched processors, the old
  // processor isn't reachable from here, so only the saved reference is deleted.
  const provider = getPaymentProvider();
  if (provider && provider.id === method.provider) {
    try {
      await provider.removeMethod({
        providerMethodId: method.provider_method_id,
        providerCustomerId: method.provider_customer_id,
      });
    } catch (err) {
      console.error('Processor failed to remove payment method:', err);
      return NextResponse.json({ error: 'Could not remove the payment method. Please try again.' }, { status: 502 });
    }
  }

  const { error } = await supabaseAdmin.from('payment_methods').delete().eq('id', id).eq('user_id', userId);
  if (error) {
    console.error('Failed to delete payment method:', error.message);
    return NextResponse.json({ error: 'Could not remove the payment method. Please try again.' }, { status: 500 });
  }

  // Removing the default promotes the oldest remaining method.
  let methods = await getPaymentMethods(userId);
  if (method.is_default && methods.length > 0) {
    await setDefaultPaymentMethod(userId, methods[0].id);
    methods = await getPaymentMethods(userId);
  }

  await logSecurityEvent(userId, 'payment_method_removed', request);
  return NextResponse.json({ methods });
}

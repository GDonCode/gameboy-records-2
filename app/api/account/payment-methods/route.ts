// app/api/account/payment-methods/route.ts
// Step 2 of adding a payment method: the browser hands back the processor's reference, the server confirms
// it with the processor and saves only display details (brand, last 4, expiry). Card numbers never touch this server.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logSecurityEvent } from '@/lib/account-security';
import { PaymentMethodError, getPaymentProvider } from '@/lib/payments/provider';
import { loadPaymentCustomer } from '@/lib/payments/customer';
import {
  MAX_METHOD_ATTEMPTS_PER_HOUR,
  MAX_PAYMENT_METHODS,
  getPaymentMethods,
  setDefaultPaymentMethod,
} from '@/lib/payments/methods';

export async function POST(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const provider = getPaymentProvider();
  if (!provider) {
    return NextResponse.json({ error: 'Adding payment methods isn’t available yet.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';
  if (!reference || reference.length > 255) {
    return NextResponse.json({ error: 'Missing payment method.' }, { status: 400 });
  }

  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const [{ count: total, error: countError }, { count: attempts }] = await Promise.all([
    supabaseAdmin.from('payment_methods').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseAdmin
      .from('account_security_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('kind', ['payment_method_added', 'payment_method_failed'])
      .gte('created_at', hourAgo),
  ]);
  if (countError) {
    console.error('Failed to count payment methods:', countError.message);
    return NextResponse.json({ error: 'Could not save the payment method. Please try again.' }, { status: 500 });
  }
  if ((total ?? 0) >= MAX_PAYMENT_METHODS) {
    return NextResponse.json({ error: `You can save up to ${MAX_PAYMENT_METHODS} payment methods. Remove one first.` }, { status: 400 });
  }
  if ((attempts ?? 0) >= MAX_METHOD_ATTEMPTS_PER_HOUR) {
    return NextResponse.json({ error: 'Too many payment methods added recently. Try again in an hour.' }, { status: 429 });
  }

  const customer = await loadPaymentCustomer(userId, provider.id);
  if (!customer) return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });

  let method;
  try {
    method = await provider.verifyMethod(customer, reference);
  } catch (err) {
    await logSecurityEvent(userId, 'payment_method_failed', request);
    if (err instanceof PaymentMethodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error('Payment method verification failed:', err);
    return NextResponse.json({ error: 'Could not save the payment method. Please try again.' }, { status: 502 });
  }

  const { data: created, error } = await supabaseAdmin
    .from('payment_methods')
    .insert({
      user_id: userId,
      provider: provider.id,
      provider_method_id: method.providerMethodId,
      provider_customer_id: method.providerCustomerId,
      type: method.type,
      brand: method.brand,
      last4: method.last4,
      exp_month: method.expMonth,
      exp_year: method.expYear,
      label: method.label,
      is_default: false,
    })
    .select('id')
    .single();

  if (error || !created) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'That payment method is already saved.' }, { status: 409 });
    }
    console.error('Failed to save payment method:', error?.message);
    // Don't leave an orphaned method in the processor's vault.
    await provider.removeMethod(method).catch((e) => console.error('Failed to roll back payment method:', e));
    return NextResponse.json({ error: 'Could not save the payment method. Please try again.' }, { status: 500 });
  }

  if ((total ?? 0) === 0 || body?.makeDefault === true) await setDefaultPaymentMethod(userId, created.id);
  await logSecurityEvent(userId, 'payment_method_added', request);

  return NextResponse.json({ methods: await getPaymentMethods(userId) }, { status: 201 });
}

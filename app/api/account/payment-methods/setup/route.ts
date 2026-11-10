// app/api/account/payment-methods/setup/route.ts
// Step 1 of adding a payment method: ask the processor for what the browser component needs.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { getPaymentProvider } from '@/lib/payments/provider';
import { loadPaymentCustomer } from '@/lib/payments/customer';

export async function POST() {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const provider = getPaymentProvider();
  if (!provider) {
    return NextResponse.json({ error: 'Adding payment methods isn’t available yet.' }, { status: 503 });
  }

  const customer = await loadPaymentCustomer(userId, provider.id);
  if (!customer) return NextResponse.json({ error: 'Could not load your account. Please try again.' }, { status: 500 });

  try {
    return NextResponse.json({ provider: provider.id, setup: await provider.beginSetup(customer) });
  } catch (err) {
    console.error('Payment setup failed:', err);
    return NextResponse.json({ error: 'Could not start adding a payment method. Please try again.' }, { status: 502 });
  }
}

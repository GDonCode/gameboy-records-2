// lib/payments/provider.ts
// Server-only. The one place a payment processor plugs in.
//
// To add a processor (Stripe, PayPal, a Caribbean gateway…): write a module implementing PaymentProvider,
// register it in PROVIDERS below, add a matching browser component in components/account/payments/,
// and set PAYMENTS_PROVIDER=<id> (plus that processor's keys) in the environment.

import { testProvider } from './test-provider';
import type { PaymentProvider, ProviderId } from './types';

export { PaymentMethodError } from './types';
export type { PaymentCustomer, PaymentProvider, ProviderId, VerifiedMethod } from './types';

const PROVIDERS: Partial<Record<ProviderId, PaymentProvider>> = {
  test: testProvider,
};

/**
 * The processor named by PAYMENTS_PROVIDER, or null when none is set up yet.
 * The test processor is refused in production builds so it can never take real sign-ups.
 */
export function getPaymentProvider(): PaymentProvider | null {
  const id = process.env.PAYMENTS_PROVIDER?.trim();
  if (!id) return null;
  if (id === 'test' && process.env.NODE_ENV === 'production') {
    console.error('PAYMENTS_PROVIDER=test is ignored in production.');
    return null;
  }
  const provider = PROVIDERS[id as ProviderId];
  if (!provider) console.error(`PAYMENTS_PROVIDER "${id}" has no implementation in lib/payments/provider.ts.`);
  return provider ?? null;
}

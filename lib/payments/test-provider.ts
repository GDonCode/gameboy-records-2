// lib/payments/test-provider.ts
// Development-only stand-in processor (PAYMENTS_PROVIDER=test, refused in production).
// Lets the Payments tab be tried end to end before a real processor is chosen. Nothing is charged or stored
// anywhere except the display details in payment_methods.

import { randomUUID } from 'crypto';
import { PaymentMethodError, type PaymentProvider } from './types';

const TEST_CARDS: Record<string, { brand: string; last4: string; expMonth: number; expYear: number } | 'declined'> = {
  test_visa: { brand: 'visa', last4: '4242', expMonth: 12, expYear: new Date().getFullYear() + 3 },
  test_mastercard: { brand: 'mastercard', last4: '4444', expMonth: 6, expYear: new Date().getFullYear() + 2 },
  test_amex: { brand: 'amex', last4: '8431', expMonth: 3, expYear: new Date().getFullYear() + 4 },
  test_expired: { brand: 'visa', last4: '0069', expMonth: 1, expYear: new Date().getFullYear() - 1 },
  test_declined: 'declined',
};

export const testProvider: PaymentProvider = {
  id: 'test',

  async beginSetup() {
    return { cards: Object.keys(TEST_CARDS) };
  },

  async verifyMethod(customer, reference) {
    const card = TEST_CARDS[reference];
    if (!card) throw new PaymentMethodError('That payment method could not be found.');
    if (card === 'declined') throw new PaymentMethodError('Your card was declined. Try a different card.');
    return {
      providerMethodId: `${reference}_${randomUUID()}`,
      providerCustomerId: customer.providerCustomerId ?? `test_cus_${customer.userId}`,
      type: 'card',
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      label: null,
    };
  },

  async removeMethod() {},
};

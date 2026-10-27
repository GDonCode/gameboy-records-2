// lib/payments/types.ts
// Shared by the payment processor modules (see provider.ts).

export type ProviderId = 'test' | 'stripe' | 'paypal' | 'wipay' | 'fygaro' | 'fac';

export interface PaymentCustomer {
  userId: string;
  email: string;
  name: string;
  /** The processor's customer id from a previously saved method, if any. */
  providerCustomerId: string | null;
}

/** Display details for a saved method, as reported by the processor (never by the browser). */
export interface VerifiedMethod {
  providerMethodId: string;
  providerCustomerId: string | null;
  type: 'card' | 'paypal';
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  /** For non-card methods, e.g. the PayPal account email. */
  label: string | null;
}

/** An error whose message is safe to show the member (e.g. "Your card was declined."). */
export class PaymentMethodError extends Error {}

export interface PaymentProvider {
  id: ProviderId;
  /** Starts adding a method. Returns what the browser component needs, e.g. a Stripe SetupIntent client secret. */
  beginSetup(customer: PaymentCustomer): Promise<Record<string, unknown>>;
  /**
   * Called with the reference the browser component got back from the processor (a token or method id).
   * Must confirm with the processor that it's real, usable and belongs to this customer, then return its details.
   * Throw PaymentMethodError for problems the member can fix.
   */
  verifyMethod(customer: PaymentCustomer, reference: string): Promise<VerifiedMethod>;
  /** Deletes the method from the processor's vault. */
  removeMethod(method: { providerMethodId: string; providerCustomerId: string | null }): Promise<void>;
}

// lib/payments/methods.ts
// Server-only: the member's saved payment methods (default first, then oldest first).

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { PaymentMethod } from '@/components/account/types';

export const MAX_PAYMENT_METHODS = 5;
// Card-testing guard: adding (or failing to add) more than this many methods an hour is refused.
export const MAX_METHOD_ATTEMPTS_PER_HOUR = 5;

export const METHOD_COLUMNS = 'id, provider, type, brand, last4, exp_month, exp_year, label, is_default';

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const { data, error } = await supabaseAdmin
    .from('payment_methods')
    .select(METHOD_COLUMNS)
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) {
    // Also hit before the payment_methods migration has run: show an empty list rather than break the page.
    console.error('Failed to load payment methods:', error.message);
    return [];
  }
  // Copy out only the display fields, so processor ids can never reach the browser.
  return (data ?? []).map(
    (r): PaymentMethod => ({
      id: r.id,
      provider: r.provider,
      type: r.type,
      brand: r.brand,
      last4: r.last4,
      exp_month: r.exp_month,
      exp_year: r.exp_year,
      label: r.label,
      is_default: r.is_default,
    })
  );
}

/** Makes `methodId` the member's only default payment method. */
export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  // Clear first: a unique index allows one default per user.
  const { error: clearError } = await supabaseAdmin
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)
    .neq('id', methodId);
  if (clearError) {
    console.error('Failed to clear default payment method:', clearError.message);
    return false;
  }
  const { error } = await supabaseAdmin
    .from('payment_methods')
    .update({ is_default: true })
    .eq('user_id', userId)
    .eq('id', methodId);
  if (error) {
    console.error('Failed to set default payment method:', error.message);
    return false;
  }
  return true;
}

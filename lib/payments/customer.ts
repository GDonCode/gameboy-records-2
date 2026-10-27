// lib/payments/customer.ts
// Server-only: the member as the payment processor knows them.

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { PaymentCustomer, ProviderId } from './types';

export async function loadPaymentCustomer(userId: string, provider: ProviderId): Promise<PaymentCustomer | null> {
  const [{ data: user, error }, { data: existing }] = await Promise.all([
    supabaseAdmin.from('users').select('email, display_name').eq('id', userId).single(),
    // Reuse the processor's customer record from an earlier saved method, so one member = one processor customer.
    supabaseAdmin
      .from('payment_methods')
      .select('provider_customer_id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .not('provider_customer_id', 'is', null)
      .limit(1)
      .maybeSingle(),
  ]);
  if (error || !user) return null;
  return {
    userId,
    email: user.email,
    name: user.display_name,
    providerCustomerId: existing?.provider_customer_id ?? null,
  };
}

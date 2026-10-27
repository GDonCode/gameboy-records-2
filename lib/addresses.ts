// lib/addresses.ts
// Server-only: read the member's saved shipping addresses (default first, then oldest first).

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Address } from '@/components/account/types';

export const ADDRESS_COLUMNS =
  'id, full_name, line1, line2, city, region, postal_code, country_code, phone, is_default';

export async function getAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabaseAdmin
    .from('user_addresses')
    .select(ADDRESS_COLUMNS)
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load addresses:', error.message);
    return [];
  }
  return (data ?? []) as Address[];
}

/** Makes `addressId` the member's only default address. */
export async function setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
  // Clear first: a unique index allows one default per user.
  const { error: clearError } = await supabaseAdmin
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)
    .neq('id', addressId);
  if (clearError) {
    console.error('Failed to clear default address:', clearError.message);
    return false;
  }
  const { error } = await supabaseAdmin
    .from('user_addresses')
    .update({ is_default: true })
    .eq('user_id', userId)
    .eq('id', addressId);
  if (error) {
    console.error('Failed to set default address:', error.message);
    return false;
  }
  return true;
}

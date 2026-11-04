// lib/orders.ts
// Server-only. Members' orders, mirrored from WooCommerce by the order webhook.

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Order, OrderItem, OrderStatus } from '@/components/account/types';

/** WooCommerce status → the status members see. Unpaid orders (pending, failed) aren't shown. */
export function memberStatus(wooStatus: string): OrderStatus | null {
  switch (wooStatus) {
    case 'processing':
    case 'on-hold':
      return 'processing';
    case 'completed':
      return 'shipped';
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
      return 'returned';
    default:
      return null;
  }
}

export async function getOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, number, status, total, items, tracking_url, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    // The table arrives with the 20261104_orders migration; until then members simply have no orders.
    if (error.code !== '42P01') console.error('Failed to load orders:', error.message);
    return [];
  }
  return (data ?? []).flatMap((row) => {
    const status = memberStatus(row.status);
    if (!status) return [];
    return [
      {
        id: row.id,
        number: row.number,
        created_at: row.created_at,
        status,
        total: Number(row.total),
        tracking_url: row.tracking_url,
        items: (row.items ?? []) as OrderItem[],
      },
    ];
  });
}

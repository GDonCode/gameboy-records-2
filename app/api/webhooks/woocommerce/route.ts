// app/api/webhooks/woocommerce/route.ts
// WooCommerce → site. Set up in WooCommerce → Settings → Advanced → Webhooks:
//   Topic: Order updated (add a second webhook for Order created if you like)
//   Delivery URL: https://<site>/api/webhooks/woocommerce
//   Secret: the same value as WOOCOMMERCE_WEBHOOK_SECRET
//
// For orders placed from this site (they carry _gbr_user_id) it:
//   • mirrors the order into Supabase so it appears under My orders,
//   • awards Club Points once the order is paid (once per order, however often the webhook fires),
//   • clears the member's cart once the order is paid.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardPoints } from '@/lib/points';
import { pointsForOrder } from '@/lib/club';
import { getCatalog } from '@/lib/catalog';
import { verifyWebhook, type WooOrder } from '@/lib/woocommerce';

const PAID = new Set(['processing', 'completed']);

export async function POST(request: Request) {
  const raw = await request.text();

  // WooCommerce sends an unsigned "ping" (webhook_id=…) when the webhook is saved.
  if (!request.headers.get('x-wc-webhook-signature') && raw.startsWith('webhook_id=')) {
    return NextResponse.json({ ok: true });
  }
  if (!verifyWebhook(raw, request.headers.get('x-wc-webhook-signature'))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let order: WooOrder;
  try {
    order = JSON.parse(raw) as WooOrder;
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }
  if (!order?.id || !Array.isArray(order.meta_data)) return NextResponse.json({ ok: true, ignored: 'not an order' });

  const userId = order.meta_data.find((m) => m.key === '_gbr_user_id')?.value;
  if (typeof userId !== 'string' || !userId) return NextResponse.json({ ok: true, ignored: 'not a site order' });

  const { products } = await getCatalog();
  const items = order.line_items.map((li) => {
    const product = products.find((p) => p.wooId === li.product_id);
    const sizeMeta = li.meta_data.find((m) => /size/i.test(m.display_key ?? m.key));
    return {
      product_id: String(li.product_id),
      name: li.name,
      slug: product?.slug ?? '',
      image: li.image?.src || product?.images[0] || null,
      size: String(sizeMeta?.display_value ?? sizeMeta?.value ?? ''),
      quantity: li.quantity,
      price: Number(li.price) || Number(li.subtotal) / Math.max(1, li.quantity),
    };
  });
  const subtotal = order.line_items.reduce((sum, li) => sum + Number(li.subtotal || 0), 0);
  const tracking = order.meta_data.find((m) => /tracking.*(url|link)/i.test(m.key))?.value;

  const { error } = await supabaseAdmin.from('orders').upsert(
    {
      user_id: userId,
      woo_order_id: order.id,
      number: String(order.number || order.id),
      status: order.status,
      currency: order.currency || 'USD',
      total: Number(order.total) || 0,
      subtotal,
      items,
      tracking_url: typeof tracking === 'string' && tracking.startsWith('http') ? tracking : null,
      created_at: order.date_created_gmt ? `${order.date_created_gmt}Z` : undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'woo_order_id' }
  );
  if (error) {
    console.error('Order mirror failed:', error.message);
    return NextResponse.json({ error: 'Could not save the order.' }, { status: 500 });
  }

  if (PAID.has(order.status)) {
    // Idempotent: award_points records (user, reason, ref) once.
    await awardPoints(userId, pointsForOrder(subtotal), 'order_paid', String(order.id));
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
  }

  return NextResponse.json({ ok: true });
}

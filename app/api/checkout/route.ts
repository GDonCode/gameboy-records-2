// app/api/checkout/route.ts
// Turns the member's cart into a WooCommerce order and returns the order's secure payment page.
// The shopper pays there with the store's payment gateways (Stripe, PayPal, etc.); Tapstitch picks up
// the paid order and fulfils it. The cart is cleared once WooCommerce reports the order paid
// (app/api/webhooks/woocommerce), so an abandoned payment never loses the cart.

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCatalog } from '@/lib/catalog';
import { getAddresses } from '@/lib/addresses';
import { createOrder, wooHasKeys, type WooLineItemInput } from '@/lib/woocommerce';

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || (session.user as { role?: string }).role !== 'user') {
    return NextResponse.json({ error: 'Sign in to check out.' }, { status: 401 });
  }

  if (!wooHasKeys()) {
    return NextResponse.json(
      { error: 'Checkout is being connected. Your cart is saved to your account until it opens.' },
      { status: 503 }
    );
  }

  const [{ data: rows, error }, { data: user }, catalog, addresses] = await Promise.all([
    supabaseAdmin.from('cart_items').select('product_id, size, quantity').eq('user_id', userId),
    supabaseAdmin.from('users').select('email, display_name').eq('id', userId).single(),
    getCatalog(),
    getAddresses(userId),
  ]);

  if (error || !user) {
    return NextResponse.json({ error: 'We couldn’t read your cart. Please try again.' }, { status: 500 });
  }
  if (!rows?.length) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const lineItems: WooLineItemInput[] = [];
  for (const row of rows) {
    const product = catalog.products.find((p) => p.id === row.product_id);
    if (!product?.wooId || !product.inStock || !product.sizes.includes(row.size)) {
      return NextResponse.json({ error: `${product?.name ?? 'An item'} is no longer available. Remove it to continue.` }, { status: 409 });
    }
    const variationId = product.variationIds?.[row.size];
    if (product.sizes.length > 1 && !variationId) {
      return NextResponse.json({ error: `${product.name} in size ${row.size} can’t be ordered right now.` }, { status: 409 });
    }
    lineItems.push({ product_id: product.wooId, ...(variationId ? { variation_id: variationId } : {}), quantity: row.quantity });
  }

  const [first, ...rest] = (user.display_name || '').trim().split(/\s+/);
  const address = addresses.find((a) => a.is_default) ?? addresses[0];
  const shipping = address
    ? {
        first_name: address.full_name.split(/\s+/)[0] ?? first,
        last_name: address.full_name.split(/\s+/).slice(1).join(' '),
        address_1: address.line1,
        address_2: address.line2 ?? '',
        city: address.city,
        state: address.region ?? '',
        postcode: address.postal_code ?? '',
        country: address.country_code,
        phone: address.phone ?? '',
      }
    : undefined;

  try {
    const order = await createOrder({
      status: 'pending',
      set_paid: false,
      created_via: 'gameboyrecords.com',
      billing: { first_name: first ?? '', last_name: rest.join(' '), email: user.email, ...(shipping ? { ...shipping, email: user.email } : {}) },
      ...(shipping ? { shipping } : {}),
      line_items: lineItems,
      meta_data: [{ key: '_gbr_user_id', value: userId }],
    });
    return NextResponse.json({ url: order.payment_url, orderId: order.id });
  } catch (err) {
    console.error('WooCommerce order failed:', err);
    return NextResponse.json({ error: 'Checkout didn’t start. Please try again in a moment.' }, { status: 502 });
  }
}

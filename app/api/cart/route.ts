// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { MAX_CART_QUANTITY, getProduct, products } from '@/lib/products';

// A whole number from 1 to MAX_CART_QUANTITY, or null.
function validQuantity(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_CART_QUANTITY ? value : null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select('id, product_id, size, quantity, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load cart:', error.message);
    return NextResponse.json({ error: 'Could not load your cart.' }, { status: 500 });
  }

  const items = (data ?? []).map((row) => {
    const product = products.find((p) => p.id === row.product_id);
    return {
      id: row.id,
      product_id: row.product_id,
      size: row.size,
      quantity: row.quantity,
      name: product?.name ?? 'Unknown product',
      price: product?.price ?? 0,
      image: product?.images?.[0] ?? null,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { productId, size, quantity } = (await request.json().catch(() => ({}))) ?? {};

  // Only real, listed products in sizes they come in.
  const product = typeof productId === 'string' ? getProduct(productId) : undefined;
  if (!product) {
    return NextResponse.json({ error: 'That product isn’t available.' }, { status: 400 });
  }
  if (typeof size !== 'string' || !product.sizes.includes(size)) {
    return NextResponse.json({ error: 'Choose a size.' }, { status: 400 });
  }
  const addQty = quantity === undefined ? 1 : validQuantity(quantity);
  if (!addQty) {
    return NextResponse.json({ error: `Quantity must be between 1 and ${MAX_CART_QUANTITY}.` }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', session.user.id)
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle();

  if (fetchError) {
    console.error('Failed to read cart:', fetchError.message);
    return NextResponse.json({ error: 'Could not update your cart. Please try again.' }, { status: 500 });
  }

  if (existing) {
    if (existing.quantity >= MAX_CART_QUANTITY) {
      return NextResponse.json({ error: `You can have up to ${MAX_CART_QUANTITY} of each item.` }, { status: 400 });
    }
    const { error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: Math.min(existing.quantity + addQty, MAX_CART_QUANTITY) })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Failed to update cart:', updateError.message);
      return NextResponse.json({ error: 'Could not update your cart. Please try again.' }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from('cart_items').insert({
      user_id: session.user.id,
      product_id: product.id,
      size,
      quantity: addQty,
    });

    if (insertError) {
      console.error('Failed to add to cart:', insertError.message);
      return NextResponse.json({ error: 'Could not update your cart. Please try again.' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { id, quantity } = (await request.json().catch(() => ({}))) ?? {};

  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }
  if (!validQuantity(quantity)) {
    return NextResponse.json({ error: `Quantity must be between 1 and ${MAX_CART_QUANTITY}.` }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Failed to update cart quantity:', error.message);
    return NextResponse.json({ error: 'Could not update your cart. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { id } = (await request.json().catch(() => ({}))) ?? {};

  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Failed to remove cart item:', error.message);
    return NextResponse.json({ error: 'Could not update your cart. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
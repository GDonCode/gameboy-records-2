// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { products } from '@/lib/products';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { productId, size, quantity } = await request.json();

  if (!productId || !size) {
    return NextResponse.json({ error: 'productId and size are required.' }, { status: 400 });
  }

  const addQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', session.user.id)
    .eq('product_id', productId)
    .eq('size', size)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existing) {
    const { error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: existing.quantity + addQty })
      .eq('id', existing.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from('cart_items').insert({
      user_id: session.user.id,
      product_id: productId,
      size,
      quantity: addQty,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { id, quantity } = await request.json();

  if (!id || !Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json({ error: 'id and a positive quantity are required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
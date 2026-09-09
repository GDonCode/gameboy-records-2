// app/api/wishlist/route.ts
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
    .from('wishlist_items')
    .select('id, product_id, created_at')
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
      name: product?.name ?? 'Unknown product',
      price: product?.price ?? 0,
      image: product?.images?.[0] ?? null,
      slug: product?.slug ?? row.product_id,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { productId } = await request.json();

  if (!productId) {
    return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .insert({ user_id: session.user.id, product_id: productId });

  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { productId } = await request.json();

  if (!productId) {
    return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .delete()
    .eq('user_id', session.user.id)
    .eq('product_id', productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
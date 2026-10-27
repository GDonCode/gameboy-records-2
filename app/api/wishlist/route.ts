// app/api/wishlist/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getProduct, products } from '@/lib/products';
import { awardPoints } from '@/lib/points';
import { FIRST_SAVE_POINTS } from '@/lib/quests';

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
    console.error('Failed to load wishlist:', error.message);
    return NextResponse.json({ error: 'Could not load your saved items.' }, { status: 500 });
  }

  const items = (data ?? []).map((row) => {
    const product = products.find((p) => p.id === row.product_id);
    return {
      id: row.id,
      product_id: row.product_id,
      name: product?.name ?? 'Unavailable item',
      price: product?.price ?? 0,
      image: product?.images?.[0] ?? null,
      slug: product?.slug ?? row.product_id,
      sizes: product?.sizes ?? [],
      // Saved items that were taken out of the shop stay listed, flagged, until the member removes them.
      available: !!getProduct(row.product_id),
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { productId } = (await request.json().catch(() => ({}))) ?? {};

  if (typeof productId !== 'string' || !getProduct(productId)) {
    return NextResponse.json({ error: 'That product isn’t available.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .insert({ user_id: session.user.id, product_id: productId });

  if (error && error.code !== '23505') {
    console.error('Failed to save wishlist item:', error.message);
    return NextResponse.json({ error: 'Could not save that item. Please try again.' }, { status: 500 });
  }

  await awardPoints(session.user.id, FIRST_SAVE_POINTS, 'first_save');

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
    console.error('Failed to remove wishlist item:', error.message);
    return NextResponse.json({ error: 'Could not update that item. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
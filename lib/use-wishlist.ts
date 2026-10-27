// lib/use-wishlist.ts
'use client';

// Wishlist hearts on the shop, linked to /api/wishlist. Updates show immediately and roll back
// if the server refuses. Moved from app/shop/page.tsx.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useWishlist() {
  const router = useRouter();
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setSaved(new Set((data.items || []).map((item: { product_id: string }) => item.product_id))))
      .catch(() => setSaved(new Set()));
  }, []);

  const flip = (productId: string, on: boolean) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (on) next.add(productId);
      else next.delete(productId);
      return next;
    });

  async function toggle(productId: string) {
    const wasSaved = saved.has(productId);
    setError(null);
    flip(productId, !wasSaved);
    try {
      const res = await fetch('/api/wishlist', {
        method: wasSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        flip(productId, wasSaved);
        router.push('/account/login');
        return;
      }
      if (!res.ok) throw new Error();
    } catch {
      flip(productId, wasSaved);
      setError('Couldn’t update your wishlist. Please try again.');
    }
  }

  return { isSaved: (productId: string) => saved.has(productId), toggle, error };
}

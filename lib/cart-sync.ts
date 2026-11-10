// lib/cart-sync.ts
// Keeps every cart UI in sync: shop cards, the cart page, and the header's red counter.
'use client';

import { useEffect, useState } from 'react';

const CART_EVENT = 'cart:count';

/** Broadcast the new total number of items in the cart (sum of quantities). */
export function emitCartCount(count: number) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<number>(CART_EVENT, { detail: Math.max(0, count) }));
}

/** Total quantity from /api/cart, or 0 when signed out / on error. */
async function fetchCartCount(): Promise<number> {
  try {
    const res = await fetch('/api/cart');
    if (!res.ok) return 0;
    const data = await res.json();
    return (data.items ?? []).reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
  } catch {
    return 0;
  }
}

/** Live cart count for the header badge. */
export function useCartCount(refreshKey?: unknown): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      fetchCartCount().then((n) => { if (alive) setCount(n); });
    };
    const onChange = (e: Event) => setCount((e as CustomEvent<number>).detail);

    refresh();
    window.addEventListener(CART_EVENT, onChange);
    window.addEventListener('pageshow', refresh); // back/forward cache
    window.addEventListener('focus', refresh);    // changed in another tab
    return () => {
      alive = false;
      window.removeEventListener(CART_EVENT, onChange);
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refreshKey]); // refetch when the signed-in user changes

  return count;
}

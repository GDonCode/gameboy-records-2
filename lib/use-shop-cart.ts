// lib/use-shop-cart.ts
'use client';

// The shop's cart state, linked to /api/cart. Each cart line is a product in one size.
// Changes show immediately (optimistic) and are then confirmed with the server; requests for the same
// line run one after another so add → +/- → remove can't race. Moved from app/shop/page.tsx, which
// managed a single size (M) per product.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { emitCartCount } from '@/lib/cart-sync';

interface CartRow {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
}

const keyOf = (productId: string, size: string) => `${productId}|${size}`;

export interface ShopCart {
  /** Quantity of a product in one size (0 = not in the cart). */
  quantity: (productId: string, size: string) => number;
  /** Sizes of this product currently in the cart, in the order they were added. */
  sizesInCart: (productId: string) => string[];
  add: (productId: string, size: string) => void;
  change: (productId: string, size: string, next: number) => void;
  remove: (productId: string, size: string) => void;
  /** Set when a request fails, for a status message. Cleared on the next change. */
  error: string | null;
}

export function useShopCart(maxQuantity: number): ShopCart {
  const router = useRouter();
  const [qty, setQtyState] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const qtyRef = useRef<Record<string, number>>({});           // latest quantity per line
  const idsRef = useRef<Record<string, string>>({});           // cart_items row id per line
  const savedQtyRef = useRef<Record<string, number>>({});      // last quantity the server confirmed
  const chainsRef = useRef<Record<string, Promise<void>>>({}); // per-line request queue

  const setQty = (key: string, q: number | null) => {
    const next = { ...qtyRef.current };
    if (q === null) delete next[key];
    else next[key] = q;
    qtyRef.current = next;
    setQtyState(next);
    // Tell the header's red counter right away (optimistic, same as the buttons).
    emitCartCount(Object.values(next).reduce((a, b) => a + b, 0));
  };

  const fetchCart = async (): Promise<CartRow[] | null> => {
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) return null; // 401 = signed out: buttons just stay neutral
      const data = await res.json();
      return data.items ?? [];
    } catch {
      return null;
    }
  };

  // Re-read the cart from the server: one line (after a failed request) or everything (on load).
  const syncFromServer = async (only?: string) => {
    const rows = await fetchCart();
    if (!rows) return;
    const apply = (key: string, row: CartRow | undefined) => {
      if (row) {
        idsRef.current[key] = row.id;
        savedQtyRef.current[key] = row.quantity;
        setQty(key, row.quantity);
      } else {
        delete idsRef.current[key];
        delete savedQtyRef.current[key];
        setQty(key, null);
      }
    };
    if (only) {
      apply(only, rows.find((r) => keyOf(r.product_id, r.size) === only));
    } else {
      rows.forEach((r) => apply(keyOf(r.product_id, r.size), r));
    }
  };

  useEffect(() => {
    syncFromServer();
    // Load the cart once on mount; later updates come from the actions below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fail = async (key: string, message = 'Couldn’t update your cart. Please try again.') => {
    setError(message);
    await syncFromServer(key);
  };

  const enqueue = (key: string, task: () => Promise<void>) => {
    chainsRef.current[key] = (chainsRef.current[key] ?? Promise.resolve())
      .then(task)
      .catch(async () => {
        if (!idsRef.current[key]) setQty(key, null); // add never reached the server
        await fail(key);
      });
  };

  const readError = async (res: Response) => {
    const data = await res.json().catch(() => null);
    return typeof data?.error === 'string' ? data.error : undefined;
  };

  const add = (productId: string, size: string) => {
    const key = keyOf(productId, size);
    setError(null);
    setQty(key, (qtyRef.current[key] ?? 0) + 1);
    enqueue(key, async () => {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, quantity: 1 }),
      });
      if (res.status === 401) {
        setQty(key, null);
        router.push('/account/login');
        return;
      }
      if (!res.ok) {
        await fail(key, await readError(res));
        return;
      }
      // POST doesn't return the row id, which PATCH / DELETE need.
      const rows = await fetchCart();
      const row = rows?.find((r) => r.product_id === productId && r.size === size);
      if (!row) return;
      idsRef.current[key] = row.id;
      savedQtyRef.current[key] = row.quantity;
      setQty(key, row.quantity);
    });
  };

  const change = (productId: string, size: string, next: number) => {
    if (next < 1 || next > maxQuantity) return;
    const key = keyOf(productId, size);
    setError(null);
    setQty(key, next);
    enqueue(key, async () => {
      const id = idsRef.current[key];
      const latest = qtyRef.current[key];
      if (!id || latest === undefined) return;          // removed in the meantime
      if (savedQtyRef.current[key] === latest) return;  // a queued request already saved this value
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: latest }),
      });
      if (res.status === 401) {
        router.push('/account/login');
        return;
      }
      if (!res.ok) {
        await fail(key, await readError(res));
        return;
      }
      savedQtyRef.current[key] = latest;
    });
  };

  const remove = (productId: string, size: string) => {
    const key = keyOf(productId, size);
    setError(null);
    setQty(key, null);
    enqueue(key, async () => {
      const id = idsRef.current[key];
      if (!id) return;
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) {
        router.push('/account/login');
        return;
      }
      if (!res.ok) {
        await fail(key, await readError(res));
        return;
      }
      delete idsRef.current[key];
      delete savedQtyRef.current[key];
    });
  };

  return {
    quantity: (productId, size) => qty[keyOf(productId, size)] ?? 0,
    sizesInCart: (productId) =>
      Object.keys(qty)
        .filter((k) => k.startsWith(`${productId}|`) && qty[k] > 0)
        .map((k) => k.slice(productId.length + 1)),
    add,
    change,
    remove,
    error,
  };
}

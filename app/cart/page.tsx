// app/cart/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { emitCartCount } from '@/lib/cart-sync';
import { formatPrice } from '@/lib/products';
import PageShell from '@/components/PageShell';
import { CLUB_NAME } from '@/lib/site';
import { pointsForOrder } from '@/lib/club';
import CartLineItem from '@/components/cart/CartLineItem';
import WishlistItem from '@/components/cart/WishlistItem';
import { BODY, SEMI, type CartLine, type SavedItem } from '@/components/cart/types';

type Notice = { kind: 'error' | 'info'; text: string; undo?: () => void };

const SECTION_TITLE = 'text-[13px] uppercase tracking-[0.16em] text-[#0B0A07]';

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const markBusy = (key: string, on: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  // Every request goes through here: signed-out → login, failures → a readable message.
  const send = useCallback(
    async (url: string, method: string, body?: unknown): Promise<boolean> => {
      try {
        const res = await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 401) {
          router.push('/account/login');
          return false;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setNotice({ kind: 'error', text: data?.error ?? 'Something went wrong. Please try again.' });
          return false;
        }
        return true;
      } catch {
        setNotice({ kind: 'error', text: 'You seem to be offline. Check your connection and try again.' });
        return false;
      }
    },
    [router]
  );

  // Fetch both lists without touching state, so the first load can run from an effect.
  const fetchAll = useCallback(async (): Promise<{ lines: CartLine[]; saved: SavedItem[] } | 'signed-out' | null> => {
    try {
      const [cartRes, wishRes] = await Promise.all([fetch('/api/cart'), fetch('/api/wishlist')]);
      if (cartRes.status === 401 || wishRes.status === 401) return 'signed-out';
      if (!cartRes.ok || !wishRes.ok) return null;
      return { lines: (await cartRes.json()).items ?? [], saved: (await wishRes.json()).items ?? [] };
    } catch {
      return null;
    }
  }, []);

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof fetchAll>>) => {
      if (result === 'signed-out') {
        router.push('/account/login');
        return;
      }
      if (!result) {
        // A failed refresh keeps what's on screen; only the first load shows the error state.
        setStatus((s) => (s === 'ready' ? s : 'error'));
        return;
      }
      setLines(result.lines);
      setSaved(result.saved);
      setStatus('ready');
    },
    [router]
  );

  const load = useCallback(async () => apply(await fetchAll()), [apply, fetchAll]);

  useEffect(() => {
    let current = true;
    fetchAll().then((result) => {
      if (current) apply(result);
    });
    return () => {
      current = false;
    };
  }, [apply, fetchAll]);

  // Keep the header's red counter in step with this page.
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  useEffect(() => {
    if (status === 'ready') emitCartCount(itemCount);
  }, [itemCount, status]);

  async function changeQuantity(line: CartLine, quantity: number) {
    setNotice(null);
    markBusy(line.id, true);
    setLines((prev) => prev.map((l) => (l.id === line.id ? { ...l, quantity } : l)));
    if (!(await send('/api/cart', 'PATCH', { id: line.id, quantity }))) {
      setLines((prev) => prev.map((l) => (l.id === line.id ? { ...l, quantity: line.quantity } : l)));
    }
    markBusy(line.id, false);
  }

  async function changeSize(line: CartLine, size: string) {
    setNotice(null);
    markBusy(line.id, true);
    const ok = await send('/api/cart', 'PATCH', { id: line.id, size });
    await load(); // the line may have merged into another one of the new size
    markBusy(line.id, false);
    if (ok) setNotice({ kind: 'info', text: `${line.name} changed to size ${size}.` });
  }

  async function removeLine(line: CartLine) {
    setNotice(null);
    markBusy(line.id, true);
    const index = lines.findIndex((l) => l.id === line.id);
    setLines((prev) => prev.filter((l) => l.id !== line.id));
    const ok = await send('/api/cart', 'DELETE', { id: line.id });
    markBusy(line.id, false);
    if (!ok) {
      setLines((prev) => [...prev.slice(0, index), line, ...prev.slice(index)]);
      return;
    }
    setNotice({
      kind: 'info',
      text: `Removed ${line.name} (size ${line.size}).`,
      undo: line.available
        ? async () => {
            setNotice(null);
            if (await send('/api/cart', 'POST', { productId: line.product_id, size: line.size, quantity: line.quantity })) await load();
          }
        : undefined,
    });
  }

  async function saveForLater(line: CartLine) {
    setNotice(null);
    markBusy(line.id, true);
    if ((await send('/api/wishlist', 'POST', { productId: line.product_id })) && (await send('/api/cart', 'DELETE', { id: line.id }))) {
      setNotice({ kind: 'info', text: `${line.name} moved to your wishlist.` });
    }
    await load();
    markBusy(line.id, false);
  }

  async function moveToCart(item: SavedItem, size: string) {
    setNotice(null);
    markBusy(item.id, true);
    if ((await send('/api/cart', 'POST', { productId: item.product_id, size, quantity: 1 })) && (await send('/api/wishlist', 'DELETE', { productId: item.product_id }))) {
      setNotice({ kind: 'info', text: `${item.name} (size ${size}) moved to your cart.` });
    }
    await load();
    markBusy(item.id, false);
  }

  async function removeSaved(item: SavedItem) {
    setNotice(null);
    markBusy(item.id, true);
    const index = saved.findIndex((s) => s.id === item.id);
    setSaved((prev) => prev.filter((s) => s.id !== item.id));
    const ok = await send('/api/wishlist', 'DELETE', { productId: item.product_id });
    markBusy(item.id, false);
    if (!ok) {
      setSaved((prev) => [...prev.slice(0, index), item, ...prev.slice(index)]);
      return;
    }
    setNotice({
      kind: 'info',
      text: `Removed ${item.name} from your wishlist.`,
      undo: item.available
        ? async () => {
            setNotice(null);
            if (await send('/api/wishlist', 'POST', { productId: item.product_id })) await load();
          }
        : undefined,
    });
  }

  const available = lines.filter((l) => l.available);
  const subtotal = available.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const availableCount = available.reduce((sum, l) => sum + l.quantity, 0);
  const hasUnavailable = lines.some((l) => !l.available);

  // Checkout: the server creates the order in WooCommerce and returns its secure payment page.
  async function checkout() {
    setNotice(null);
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      if (res.status === 401) {
        router.push('/account/login');
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        setNotice({ kind: 'error', text: data?.error ?? 'Checkout didn’t start. Please try again.' });
        setCheckingOut(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setNotice({ kind: 'error', text: 'You seem to be offline. Check your connection and try again.' });
      setCheckingOut(false);
    }
  }

  const summary = lines.length > 0 && (
    <aside aria-labelledby="summary-title" className="border border-[#226B4F]/20 bg-white p-5 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-[calc(var(--header-h)+24px)]" style={BODY}>
      <h2 id="summary-title" style={SEMI} className={`${SECTION_TITLE} mb-4`}>Order summary</h2>
      <dl className="flex flex-col gap-2.5 text-[14px] text-[#0B0A07]">
        <div className="flex justify-between">
          <dt>Subtotal ({availableCount} {availableCount === 1 ? 'item' : 'items'})</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-[#0B0A07]/60">
          <dt>Shipping</dt>
          <dd>Calculated at checkout</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-[#0B0A07]/10 pt-3" style={SEMI}>
          <dt>Estimated total</dt>
          <dd className="tabular-nums text-[#226B4F]">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      {hasUnavailable && (
        <p className="mt-4 text-[12px] text-[#A3322A]">Remove items that are no longer available to check out.</p>
      )}
      <p className="mt-4 text-[13px] text-[#0B0A07]/70">
        {CLUB_NAME} members earn <strong className="font-semibold text-[#0B0A07]">{pointsForOrder(subtotal).toLocaleString('en-US')} Club Points</strong> on this order.
      </p>
      <button
        type="button"
        onClick={checkout}
        disabled={checkingOut || hasUnavailable || availableCount === 0}
        className="zoom-content mt-5 w-full h-14 rounded-[2px] bg-[#E2BA0A] text-[13px] font-semibold uppercase tracking-[0.16em] text-[#0B0A07] hover:bg-[#F0C928] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <span>{checkingOut ? 'Opening secure checkout' : 'Checkout'}</span>
      </button>
      <p className="mt-2 text-center text-[12px] text-[#0B0A07]/60">
        You’ll pay on our secure checkout page. Shipping and tax are added there.
      </p>
      <Link href="/shop" className="mt-4 block text-center text-[13px] text-[#226B4F] underline-offset-4 hover:underline">
        Continue shopping
      </Link>
    </aside>
  );

  return (
    <PageShell>
      <div className="on-light flex-1 w-full bg-[#EDEAE0] text-[#0B0A07] px-4 pt-10 pb-16 sm:px-6 md:px-10 md:pt-14">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-6 flex items-baseline justify-between gap-4 md:mb-8">
            <h1 className="m-0 text-[28px] font-semibold uppercase leading-none tracking-[0.04em] text-[#0B0A07] md:text-[40px]">Your cart</h1>
            {status === 'ready' && (
              <p style={BODY} className="text-[14px] text-[#0B0A07]/60">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          <div aria-live="polite" style={BODY}>
            {notice && (
              <div
                role={notice.kind === 'error' ? 'alert' : 'status'}
                className={`mb-5 flex items-center justify-between gap-4 border px-4 py-3 text-[14px] ${
                  notice.kind === 'error' ? 'border-[#A3322A]/30 bg-[#A3322A]/5 text-[#A3322A]' : 'border-[#226B4F]/30 bg-[#226B4F]/5 text-[#0B0A07]'
                }`}
              >
                <span>{notice.text}</span>
                <span className="flex items-center gap-4">
                  {notice.undo && (
                    <button type="button" onClick={notice.undo} style={SEMI} className="text-[#226B4F] underline underline-offset-4 cursor-pointer">Undo</button>
                  )}
                  <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="text-[#0B0A07]/50 hover:text-[#0B0A07] cursor-pointer">✕</button>
                </span>
              </div>
            )}
          </div>

          {status === 'loading' && (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your cart">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-4 border border-[#226B4F]/10 bg-white p-4">
                  <div className="h-24 w-24 animate-pulse bg-[#0B0A07]/10" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="h-4 w-1/3 animate-pulse bg-[#0B0A07]/10" />
                    <div className="h-3 w-1/5 animate-pulse bg-[#0B0A07]/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div style={BODY} className="border border-[#A3322A]/25 bg-white px-5 py-8 text-center">
              <p className="text-[15px] text-[#0B0A07]">We couldn’t load your cart.</p>
              <button type="button" onClick={() => { setStatus('loading'); load(); }} style={SEMI} className="mt-4 bg-[#226B4F] px-5 py-2.5 text-[13px] tracking-[0.08em] text-white hover:bg-[#1c5a42] cursor-pointer">
                TRY AGAIN
              </button>
            </div>
          )}

          {status === 'ready' && (
            // Phones show cart → summary → wishlist; on desktop the summary sits beside both.
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              <div className="lg:col-start-1 lg:row-start-1">
                {lines.length === 0 ? (
                  <div style={BODY} className="border border-dashed border-[#226B4F]/30 bg-white px-5 py-12 text-center">
                    <p style={SEMI} className="text-[17px] text-[#0B0A07]">Your cart is empty</p>
                    <p className="mt-1 text-[14px] text-[#0B0A07]/60">The Rise Collection is in the shop, in small runs.</p>
                    <Link href="/shop" style={SEMI} className="mt-5 inline-block bg-[#0B0A07] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F5] hover:bg-[#1F1C17]">
                      Shop the collection
                    </Link>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3 list-none p-0" aria-label="Items in your cart">
                    {lines.map((line) => (
                      <CartLineItem
                        key={line.id}
                        line={line}
                        busy={busy.has(line.id)}
                        onQuantity={(q) => changeQuantity(line, q)}
                        onSize={(s) => changeSize(line, s)}
                        onRemove={() => removeLine(line)}
                        onSaveForLater={() => saveForLater(line)}
                      />
                    ))}
                  </ul>
                )}
              </div>

              {summary}

              <section aria-labelledby="wishlist-title" className="border border-[#226B4F]/20 bg-white p-5 lg:col-start-1 lg:row-start-2">
                  <div className="mb-4 flex items-baseline justify-between">
                    <h2 id="wishlist-title" style={SEMI} className={SECTION_TITLE}>Wishlist</h2>
                    {saved.length > 0 && <span style={BODY} className="text-[13px] text-[#0B0A07]/55">{saved.length} saved</span>}
                  </div>
                  {saved.length === 0 ? (
                    <p style={BODY} className="text-[14px] text-[#0B0A07]/60">
                      Nothing saved yet. Tap the heart on any item in the{' '}
                      <Link href="/shop" className="text-[#226B4F] underline underline-offset-4">shop</Link> to save it here.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 list-none p-0">
                      {saved.map((item) => (
                        <WishlistItem
                          key={item.id}
                          item={item}
                          busy={busy.has(item.id)}
                          onMoveToCart={(s) => moveToCart(item, s)}
                          onRemove={() => removeSaved(item)}
                        />
                      ))}
                    </ul>
                  )}
                </section>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

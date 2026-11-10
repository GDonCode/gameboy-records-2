// components/shop/ProductPurchase.tsx
// Product page gallery and purchase panel: size, quantity, add to cart.
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import { emitCartCount } from '@/lib/cart-sync';
import { MAX_CART_QUANTITY, colorLabel, formatPrice, type Product } from '@/lib/products';

export default function ProductPurchase({ product, points, pointsName }: { product: Product; points: number; pointsName: string }) {
  const router = useRouter();
  const { status } = useSession();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function addToCart() {
    if (!size) {
      setMessage({ ok: false, text: 'Choose a size first.' });
      return;
    }
    if (status !== 'authenticated') {
      router.push(`/account/login?next=${encodeURIComponent(`/shop/${product.slug}`)}`);
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, size, quantity }),
    }).catch(() => null);
    setBusy(false);
    if (!res) {
      setMessage({ ok: false, text: 'Check your connection and try again.' });
      return;
    }
    if (res.status === 401) {
      router.push('/account/login');
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ ok: false, text: data.error || 'That didn’t go through. Please try again.' });
      return;
    }
    // Refresh the header count from the server.
    fetch('/api/cart')
      .then((r) => r.json())
      .then((d) => emitCartCount((d.items ?? []).reduce((n: number, i: { quantity: number }) => n + i.quantity, 0)))
      .catch(() => {});
    setMessage({ ok: true, text: `Added: ${product.name}, size ${size}.` });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Gallery */}
      <div className="lg:col-span-7">
        <div className="zoom-media frame hard relative aspect-[4/5] overflow-hidden bg-[#EAEAEA]">
          <Image src={product.images[active]} alt={`${product.name}${product.images.length > 1 ? `, view ${active + 1}` : ''}`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        </div>
        {product.images.length > 1 && (
          <ul className="list-none p-0 m-0 mt-3 grid grid-cols-5 gap-3" aria-label="More views">
            {product.images.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show view ${i + 1}`}
                  aria-pressed={i === active}
                  className={`relative block w-full aspect-square overflow-hidden bg-[#EAEAEA] cursor-pointer outline-offset-2 ${i === active ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'}`}
                >
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Details */}
      <div className="lg:col-span-5 lg:pt-4">
        <p className="eyebrow text-green-deep m-0">{product.categoryLabel}</p>
        <h1 className="m-0 mt-4 text-[1.9rem] md:text-[2.4rem] font-semibold leading-tight uppercase tracking-[0.02em]">{product.name}</h1>
        <p className="m-0 mt-3 text-[1.25rem]">{formatPrice(product.price, product.currency)}</p>
        <p className="m-0 mt-2 inline-flex items-center gap-2 text-[0.85rem] text-stone">
          <Icon name="star" className="w-3.5 h-3.5 text-gold" />
          Members earn {points.toLocaleString('en-US')} {pointsName}
        </p>

        <div className="mt-8 whitespace-pre-line leading-relaxed text-stone">{product.description}</div>
        {product.color && <p className="m-0 mt-4 text-[0.9rem] text-stone">Colour: {colorLabel(product.color)}</p>}

        {product.inStock ? (
          <div className="mt-10 grid gap-8">
            <fieldset className="border-0 p-0 m-0">
              <legend className="eyebrow text-ink mb-3">Size</legend>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((s) => (
                  <label key={s} className="relative">
                    <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="peer sr-only" />
                    <span className="flex items-center justify-center h-12 border-2 border-ink text-[0.85rem] font-semibold cursor-pointer transition-colors hover:bg-gold peer-checked:bg-ink peer-checked:border-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green-deep">
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <p className="eyebrow text-ink m-0 mb-3" id="qty-label">
                Quantity
              </p>
              <div className="inline-flex items-center border-2 border-ink" role="group" aria-labelledby="qty-label">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="w-12 h-12 inline-flex items-center justify-center disabled:opacity-30 cursor-pointer">
                  <Icon name="minus" className="w-3 h-3" />
                </button>
                <span className="w-10 text-center tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(MAX_CART_QUANTITY, q + 1))} disabled={quantity >= MAX_CART_QUANTITY} aria-label="Increase quantity" className="w-12 h-12 inline-flex items-center justify-center disabled:opacity-30 cursor-pointer">
                  <Icon name="plus" className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <Button variant="primary" size="lg" onClick={addToCart} disabled={busy} className="w-full">
                {busy ? 'Adding' : 'Add to cart'}
              </Button>
              <p role="status" aria-live="polite" className={`m-0 min-h-[1.5em] text-[0.9rem] ${message?.ok ? 'text-green-deep' : 'text-danger'}`}>
                {message?.text ?? ''}
                {message?.ok && (
                  <>
                    {' '}
                    <a href="/cart" className="underline underline-offset-4 text-ink">
                      View cart
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-10 mb-0 inline-block bg-ink text-paper px-4 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.16em]">Sold out</p>
        )}

        <ul className="list-none p-0 m-0 mt-10 border-t-2 border-ink divide-y-2 divide-ink/15 text-[0.9rem]">
          <li className="flex items-center gap-3 py-4">
            <Icon name="truck" className="w-4 h-4 text-green-deep" /> Made to order for you, then shipped. Delivery times are shown at checkout.
          </li>
          <li className="flex items-center gap-3 py-4">
            <Icon name="shirt" className="w-4 h-4 text-green-deep" /> Printed on demand, so nothing goes to waste.
          </li>
        </ul>
      </div>
    </div>
  );
}

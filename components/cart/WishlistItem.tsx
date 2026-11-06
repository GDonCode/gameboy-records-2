// components/cart/WishlistItem.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/products';
import { BODY, SEMI, type SavedItem } from './types';

export default function WishlistItem({
  item,
  busy,
  onMoveToCart,
  onRemove,
}: {
  item: SavedItem;
  busy: boolean;
  onMoveToCart: (size: string) => void;
  onRemove: () => void;
}) {
  // Moving to the cart needs a size; the choices open in place.
  const [choosing, setChoosing] = useState(false);
  const href = `/shop/${item.slug}`;

  return (
    <li className={`flex gap-3 ${busy ? 'opacity-70' : ''}`}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative h-16 w-16 flex-shrink-0 overflow-hidden border border-[#0B0A07]/10 bg-[#EAEAEA]">
        {item.image && <Image src={item.image} alt="" fill sizes="64px" className={`object-cover ${item.available ? '' : 'grayscale opacity-60'}`} />}
      </Link>
      <div className="min-w-0 flex-1" style={BODY}>
        <Link href={href} style={SEMI} className="block text-[14px] leading-snug text-[#0B0A07] hover:underline underline-offset-2">
          {item.name}
        </Link>
        {item.available && <p className="mt-0.5 text-[12px] text-[#226B4F]">{formatPrice(item.price)}</p>}
        {!item.available && <p className="mt-1 text-[12px] text-[#A3322A]">No longer available.</p>}

        {choosing && item.available ? (
          <div className="mt-2.5" role="group" aria-label={`Choose a size for ${item.name}`}>
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-[#0B0A07]/60">Choose a size</p>
            <div className="flex flex-wrap gap-1.5">
              {item.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => { setChoosing(false); onMoveToCart(s); }}
                  style={SEMI}
                  aria-label={`Move ${item.name} to cart in size ${s}`}
                  className="h-8 min-w-9 border border-[#226B4F]/40 px-2 text-[12px] text-[#0B0A07] hover:border-[#226B4F] hover:bg-[#226B4F] hover:text-white cursor-pointer disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#226B4F]"
                >
                  {s}
                </button>
              ))}
              <button type="button" onClick={() => setChoosing(false)} className="h-8 px-2 text-[12px] text-[#0B0A07]/60 hover:underline cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex gap-4 text-[13px]">
            {item.available && (
              <button type="button" disabled={busy} onClick={() => setChoosing(true)} className="text-[#226B4F] underline-offset-4 hover:underline cursor-pointer disabled:opacity-40">
                Move to cart
              </button>
            )}
            <button type="button" disabled={busy} onClick={onRemove} aria-label={`Remove ${item.name} from wishlist`} className="text-[#A3322A] underline-offset-4 hover:underline cursor-pointer disabled:opacity-40">
              Remove
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

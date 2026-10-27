// components/cart/CartLineItem.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MAX_CART_QUANTITY, formatPrice } from '@/lib/products';
import { BODY, SEMI, type CartLine } from './types';

const stepBtn =
  'flex h-8 w-8 items-center justify-center text-[#16432a] cursor-pointer transition-colors hover:bg-[#1a9e4a]/10 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a]';
const linkBtn =
  'text-[13px] underline-offset-4 hover:underline cursor-pointer disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed';

export default function CartLineItem({
  line,
  busy,
  onQuantity,
  onSize,
  onRemove,
  onSaveForLater,
}: {
  line: CartLine;
  busy: boolean;
  onQuantity: (q: number) => void;
  onSize: (size: string) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}) {
  const href = line.slug ? `/shop/${line.slug}` : null;
  const image = (
    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden border border-[#2f8a68]/10 bg-[#F6F6F4] sm:h-28 sm:w-28">
      {line.image && (
        <Image src={line.image} alt="" fill sizes="112px" className={`object-cover ${line.available ? '' : 'grayscale opacity-60'}`} />
      )}
    </div>
  );

  return (
    <li className={`flex gap-4 border bg-white p-4 transition-opacity ${line.available ? 'border-[#1a9e4a]/20' : 'border-[#a42a2a]/25'} ${busy ? 'opacity-70' : ''}`}>
      {href ? <Link href={href} tabIndex={-1} aria-hidden="true">{image}</Link> : image}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 style={SEMI} className="text-[15px] leading-snug text-[#16432a]">
              {href ? <Link href={href} className="hover:underline underline-offset-2">{line.name}</Link> : line.name}
            </h3>
            {line.available && <p style={BODY} className="mt-0.5 text-[13px] text-[#1a9e4a]">{formatPrice(line.price)}</p>}
            {!line.available && (
              <p style={BODY} className="mt-1 text-[12px] text-[#a42a2a]">No longer available. Remove it to continue.</p>
            )}
          </div>
          <p style={SEMI} className="text-[15px] tabular-nums text-[#16432a]" aria-label={`Line total ${formatPrice(line.price * line.quantity)}`}>
            {line.available ? formatPrice(line.price * line.quantity) : '—'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3" style={BODY}>
          {line.available && (
            <>
              <label className="flex items-center gap-2 text-[13px] text-[#16432a]/70">
                Size
                <select
                  value={line.size}
                  onChange={(e) => onSize(e.target.value)}
                  disabled={busy}
                  aria-label={`Size for ${line.name}`}
                  className="h-8 cursor-pointer border border-[#1a9e4a]/30 bg-white px-2 text-[13px] text-[#16432a] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a]"
                >
                  {line.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <div role="group" aria-label={`Quantity of ${line.name}`} className="flex items-center border border-[#1a9e4a]/30">
                <button type="button" className={stepBtn} onClick={() => onQuantity(line.quantity - 1)} disabled={busy || line.quantity <= 1} aria-label={`Decrease quantity of ${line.name}`}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5"><path d="M5 12h14" /></svg>
                </button>
                <span aria-live="polite" style={SEMI} className="w-8 text-center text-[14px] tabular-nums text-[#16432a]">{line.quantity}</span>
                <button type="button" className={stepBtn} onClick={() => onQuantity(line.quantity + 1)} disabled={busy || line.quantity >= MAX_CART_QUANTITY} aria-label={`Increase quantity of ${line.name}`}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </>
          )}
          {!line.available && <span className="text-[13px] text-[#16432a]/60">Size {line.size} · Qty {line.quantity}</span>}

          <div className="flex items-center gap-4 sm:ml-auto">
            {line.available && (
              <button type="button" className={`${linkBtn} text-[#1a9e4a]`} onClick={onSaveForLater} disabled={busy}>
                Save for later
              </button>
            )}
            <button type="button" className={`${linkBtn} text-[#a42a2a]`} onClick={onRemove} disabled={busy} aria-label={`Remove ${line.name} (size ${line.size}) from cart`}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

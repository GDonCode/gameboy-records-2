// components/shop/ProductCard.tsx
// The original shop card: white card, square photo, quick add with a size picker, wishlist heart.
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MAX_CART_QUANTITY, formatPrice, type Product } from '@/lib/products';
import type { ShopCart } from '@/lib/use-shop-cart';
import { CartButton, CartStepper, SizePicker } from './CartControls';
import WishlistButton from './WishlistButton';

const SEMI = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;
const BODY = { fontFamily: "'Poppins', sans-serif" } as const;

export default function ProductCard({
  product,
  cart,
  saved,
  onToggleSaved,
  priority,
}: {
  product: Product;
  cart: ShopCart;
  saved: boolean;
  onToggleSaved: () => void;
  /** Load the image eagerly (the first row of the grid). */
  priority?: boolean;
}) {
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // The card's stepper controls one size: the one just picked, or the first size already in the cart.
  const inCart = cart.sizesInCart(product.id);
  const size = pickedSize && inCart.includes(pickedSize) ? pickedSize : inCart[0] ?? null;
  const quantity = size ? cart.quantity(product.id, size) : 0;
  const href = `/shop/${product.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden bg-white frame hard transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-green-deep)]">
      <div className="relative aspect-square w-full overflow-hidden border-b-[3px] border-ink bg-[#F6F6F6]">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>
        {!product.inStock && (
          <span style={SEMI} className="absolute left-3 top-3 z-10 bg-ink px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white">
            Sold out
          </span>
        )}
        <WishlistButton productName={product.name} saved={saved} onToggle={onToggleSaved} />
        <CartStepper
          productName={`${product.name}, size ${size ?? ''}`}
          quantity={quantity}
          max={MAX_CART_QUANTITY}
          onChange={(q) => size && cart.change(product.id, size, q)}
        />
        <SizePicker
          productName={product.name}
          sizes={product.sizes}
          open={pickerOpen && quantity === 0}
          onPick={(s) => {
            setPickedSize(s);
            setPickerOpen(false);
            cart.add(product.id, s);
          }}
          onClose={() => setPickerOpen(false)}
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-3.5 md:gap-3 md:px-4">
        <div className="min-w-0">
          <p style={BODY} className="text-[10px] uppercase leading-none tracking-[0.16em] text-[#0E3A20]/55">
            {product.categoryLabel}
          </p>
          <h3 style={SEMI} className="mt-1.5 text-[14px] leading-snug text-[#0E3A20] sm:text-[15px] md:text-base">
            <Link href={href} className="line-clamp-2 hover:underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#067F3A]">
              {product.name}
            </Link>
          </h3>
          <p style={BODY} className="mt-0.5 text-[12px] leading-tight text-[#067F3A] md:text-[13px]">
            {formatPrice(product.price, product.currency)}
            {quantity > 0 && size && <span className="text-[#0E3A20]/55"> · Size {size} in cart</span>}
          </p>
        </div>
        {product.inStock && (
          <CartButton
            productName={product.name}
            quantity={quantity}
            onAdd={() => setPickerOpen(true)}
            onRemove={() => size && cart.remove(product.id, size)}
          />
        )}
      </div>
    </article>
  );
}

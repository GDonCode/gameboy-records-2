// components/shop/ProductCard.tsx
// One piece in the shop: a large image, then name and price set quietly underneath.
// Saving and quick-add sit over the image; the frame holds still while the photo zooms on hover.
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MAX_CART_QUANTITY, formatPrice, type Product } from '@/lib/products';
import type { ShopCart } from '@/lib/use-shop-cart';
import { CartButton, CartStepper, SizePicker } from './CartControls';
import WishlistButton from './WishlistButton';

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
    <article className="group relative flex flex-col">
      <div className="zoom-media relative aspect-[4/5] w-full overflow-hidden bg-[#E2DED2]">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 50vw"
            className="object-cover"
          />
        </Link>
        {!product.inStock && (
          <span className="absolute left-3 top-3 z-10 bg-ink px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-paper">
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

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="m-0 text-[0.65rem] uppercase leading-none tracking-[0.22em] text-stone">{product.categoryLabel}</p>
          <h3 className="m-0 mt-2 text-[0.9rem] md:text-[0.95rem] font-medium leading-snug text-ink">
            <Link href={href} className="line-clamp-2 hover:underline underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="m-0 mt-1 text-[0.85rem] text-stone">
            {formatPrice(product.price, product.currency)}
            {quantity > 0 && size && <span> · Size {size} in cart</span>}
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

// components/shop/ProductCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MAX_CART_QUANTITY, formatPrice, type Product } from '@/lib/products';
import type { ShopCart } from '@/lib/use-shop-cart';
import { CartButton, CartStepper, SizePicker } from './CartControls';
import WishlistButton from './WishlistButton';

const CATEGORY_LABEL: Record<Product['category'], string> = { 't-shirt': 'T-Shirt', hoodie: 'Hoodie' };
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
    <article className="group relative flex flex-col overflow-hidden bg-white shadow-[0_4px_16px_rgba(22,67,42,0.18)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(22,67,42,0.28)]">
      <div className="relative aspect-square w-full overflow-hidden bg-[#F6F6F6]">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>
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
          <p style={BODY} className="text-[10px] uppercase leading-none tracking-[0.16em] text-[#16432a]/55">
            {CATEGORY_LABEL[product.category]}
          </p>
          <h3 style={SEMI} className="mt-1.5 text-[14px] leading-snug text-[#16432a] sm:text-[15px] md:text-base">
            <Link href={href} className="line-clamp-2 hover:underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a]">
              {product.name}
            </Link>
          </h3>
          <p style={BODY} className="mt-0.5 text-[12px] leading-tight text-[#1a9e4a] md:text-[13px]">
            {formatPrice(product.price)}
            {quantity > 0 && size && <span className="text-[#16432a]/55"> · Size {size} in cart</span>}
          </p>
        </div>
        <CartButton
          productName={product.name}
          quantity={quantity}
          onAdd={() => setPickerOpen(true)}
          onRemove={() => size && cart.remove(product.id, size)}
        />
      </div>
    </article>
  );
}

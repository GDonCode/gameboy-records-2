// components/shop/ProductGrid.tsx
// The shop grid with live cart and saved-item state.
'use client';

import ProductCard from '@/components/shop/ProductCard';
import { MAX_CART_QUANTITY, type Product } from '@/lib/products';
import { useShopCart } from '@/lib/use-shop-cart';
import { useWishlist } from '@/lib/use-wishlist';

export default function ProductGrid({ products }: { products: Product[] }) {
  const cart = useShopCart(MAX_CART_QUANTITY);
  const wishlist = useWishlist();
  const status = cart.error ?? wishlist.error;

  return (
    <>
      {/* Cart / saved-item problems (e.g. a lost connection) are announced here. */}
      <p
        role="status"
        aria-live="polite"
        className={status ? 'mb-6 border border-danger/40 bg-danger/10 px-4 py-3 text-[0.85rem] text-danger' : 'sr-only'}
      >
        {status ?? ''}
      </p>
      <ul className="list-none p-0 m-0 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14 lg:grid-cols-3">
        {products.map((product, i) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              cart={cart}
              saved={wishlist.isSaved(product.id)}
              onToggleSaved={() => wishlist.toggle(product.id)}
              priority={i < 3}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

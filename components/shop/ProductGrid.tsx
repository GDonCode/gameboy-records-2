// components/shop/ProductGrid.tsx
// The shop grid (original Shop design): three columns from tablet up, two on phones.
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
        style={{ fontFamily: "'Poppins', sans-serif" }}
        className={status ? 'mb-4 border-2 border-danger bg-danger/5 px-3 py-2 text-[13px] text-danger' : 'sr-only'}
      >
        {status ?? ''}
      </p>
      <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8 list-none p-0 m-0">
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

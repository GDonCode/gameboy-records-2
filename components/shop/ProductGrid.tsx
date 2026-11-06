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
        className={status ? 'mb-4 rounded-[6px] border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-2 text-[13px] text-[#ffb3b3]' : 'sr-only'}
      >
        {status ?? ''}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 list-none p-0 m-0">
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

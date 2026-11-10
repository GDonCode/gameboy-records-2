// components/shop/ProductGrid.tsx
// The shop: a filter sidebar (a collapsible panel on phones) beside the product grid.
'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import ShopFilters, { NO_FILTERS, filterProducts, type ShopFilterState } from '@/components/shop/ShopFilters';
import { MAX_CART_QUANTITY, type Product } from '@/lib/products';
import { useShopCart } from '@/lib/use-shop-cart';
import { useWishlist } from '@/lib/use-wishlist';

export default function ProductGrid({ products }: { products: Product[] }) {
  const cart = useShopCart(MAX_CART_QUANTITY);
  const wishlist = useWishlist();
  const status = cart.error ?? wishlist.error;
  const [filters, setFilters] = useState<ShopFilterState>(NO_FILTERS);
  const shown = useMemo(() => filterProducts(products, filters), [products, filters]);

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
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <ShopFilters products={products} value={filters} onChange={setFilters} resultCount={shown.length} />
        {shown.length === 0 ? (
          <p style={{ fontFamily: "'Poppins', sans-serif" }} className="py-16 text-center text-[15px] text-stone">
            Nothing matches those filters.{' '}
            <button type="button" onClick={() => setFilters(NO_FILTERS)} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-green-deep underline underline-offset-4">
              Clear all
            </button>
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 md:gap-8 list-none p-0 m-0 content-start">
            {shown.map((product, i) => (
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
        )}
      </div>
    </>
  );
}

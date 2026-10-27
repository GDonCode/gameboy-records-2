'use client';

import { Suspense, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import ProductCard from '@/components/shop/ProductCard';
import {
  COLOR_OPTIONS,
  FilterSidebar,
  MobileFilterBar,
  SORT_OPTIONS,
  TYPE_OPTIONS,
  type ColorFilter,
  type FilterState,
  type SortOrder,
  type TypeFilter,
} from '@/components/shop/ShopFilters';
import { MAX_CART_QUANTITY, listedProducts } from '@/lib/products';
import { useShopCart } from '@/lib/use-shop-cart';
import { useWishlist } from '@/lib/use-wishlist';

const DEFAULTS: FilterState = { type: 'all', color: 'all', sort: 'featured' };

// Read filters from the URL, ignoring anything that isn't a known option.
function pick<T extends string>(value: string | null, options: { value: T }[], fallback: T): T {
  return options.some((o) => o.value === value) ? (value as T) : fallback;
}

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters: FilterState = {
    type: pick<TypeFilter>(params.get('type'), TYPE_OPTIONS, DEFAULTS.type),
    color: pick<ColorFilter>(params.get('color'), COLOR_OPTIONS, DEFAULTS.color),
    sort: pick<SortOrder>(params.get('sort'), SORT_OPTIONS, DEFAULTS.sort),
  };

  // Filters live in the URL, so they survive a refresh, can be shared, and work with the back button.
  const setFilters = (change: Partial<FilterState>) => {
    const next = { ...filters, ...change };
    const query = new URLSearchParams();
    (Object.keys(next) as (keyof FilterState)[]).forEach((k) => {
      if (next[k] !== DEFAULTS[k]) query.set(k, next[k]);
    });
    const qs = query.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const resetFilters = () => setFilters({ type: 'all', color: 'all' });

  const shown = useMemo(() => {
    const list = listedProducts.filter(
      (p) => (filters.type === 'all' || p.category === filters.type) && (filters.color === 'all' || p.color === filters.color)
    );
    if (filters.sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (filters.sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filters.type, filters.color, filters.sort]);

  const cart = useShopCart(MAX_CART_QUANTITY);
  const wishlist = useWishlist();
  const status = cart.error ?? wishlist.error;

  const filterProps = { ...filters, onChange: setFilters, onReset: resetFilters, resultCount: shown.length };

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-[#FEFEFA]">
      <FilterSidebar {...filterProps} />
      <div className="relative flex-1 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1c2e20 0%, #181f1a 60%, #1a2420 100%)' }}>
        <div className="absolute inset-0 z-[1] flex flex-col overflow-y-auto">
          <main className="flex-1 px-4 pt-[76px] pb-10 md:px-8 md:pt-8">
            <section className="mb-6 md:mb-8">
              <h1 style={{ fontFamily: "'Poppins_semibold', sans-serif" }} className="text-[34px] md:text-5xl uppercase leading-none text-[#FEFEFA]">
                &ldquo;RISE&rdquo; COLLECTION
              </h1>
              <p style={{ fontFamily: "'Poppins', sans-serif" }} className="mt-2 ml-1 text-[12px] md:text-sm tracking-[0.35em] text-[#3dc97e]">
                by ALEXX A-GAME
              </p>
            </section>

            <div className="mb-5">
              <MobileFilterBar {...filterProps} />
            </div>

            {/* Cart / saved-item problems (e.g. a lost connection) are announced here. */}
            <p role="status" aria-live="polite" style={{ fontFamily: "'Poppins', sans-serif" }} className={status ? 'mb-4 rounded-[6px] border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-2 text-[13px] text-[#ffb3b3]' : 'sr-only'}>
              {status ?? ''}
            </p>

            {shown.length === 0 ? (
              <p style={{ fontFamily: "'Poppins', sans-serif" }} className="py-16 text-center text-[15px] text-[#e8f5ec]/80">
                No products match these filters.{' '}
                <button type="button" onClick={resetFilters} className="text-[#3dc97e] underline underline-offset-4 cursor-pointer">
                  Reset filters
                </button>
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 list-none p-0">
                {shown.map((product, i) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      cart={cart}
                      saved={wishlist.isSaved(product.id)}
                      onToggleSaved={() => wishlist.toggle(product.id)}
                      priority={i < 4}
                    />
                  </li>
                ))}
              </ul>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <>
      <style>{`
        @keyframes cart-pop { 0% { transform: scale(0.8); } 55% { transform: scale(1.18); } 100% { transform: scale(1); } }
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <Header />
      <MobileBottomNav />
      {/* useSearchParams needs a Suspense boundary; the shop renders the moment the URL is read. */}
      <Suspense fallback={<div className="h-screen bg-[#181f1a]" />}>
        <ShopContent />
      </Suspense>
    </>
  );
}

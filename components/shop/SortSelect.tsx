// components/shop/SortSelect.tsx
// Sort menu. A GET form with a button, so it works without JavaScript; with it, changing the menu applies at once.
'use client';

import { useRouter } from 'next/navigation';
import { shopHref, type ShopQuery, type SortOrder } from '@/lib/shop-filters';

export default function SortSelect({ query, options }: { query: ShopQuery; options: { value: SortOrder; label: string }[] }) {
  const router = useRouter();
  return (
    <form action="/shop" method="get" className="flex items-center gap-3">
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.type && <input type="hidden" name="type" value={query.type} />}
      {query.color && <input type="hidden" name="color" value={query.color} />}
      {query.size && <input type="hidden" name="size" value={query.size} />}
      <label htmlFor="shop-sort" className="eyebrow text-stone whitespace-nowrap">
        Sort
      </label>
      <select
        id="shop-sort"
        name="sort"
        defaultValue={query.sort}
        onChange={(e) => router.replace(shopHref(query, { sort: e.target.value as SortOrder }), { scroll: false })}
        className="field field-light h-10 w-auto text-[0.85rem]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="h-10 px-4 bg-ink text-paper text-[0.75rem] uppercase tracking-[0.14em]">
          Apply
        </button>
      </noscript>
    </form>
  );
}

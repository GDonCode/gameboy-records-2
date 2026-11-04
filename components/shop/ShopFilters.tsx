// components/shop/ShopFilters.tsx
// Shop search, filters and sort. Every control is a plain link or a GET form, so it works before
// JavaScript loads; the sort menu submits itself on change once it has.
import Link from 'next/link';
import Icon from '@/components/icons';
import { colorLabel, colorSwatch } from '@/lib/products';
import { SORT_OPTIONS, shopHref, type FacetOptions, type ShopQuery } from '@/lib/shop-filters';
import SortSelect from './SortSelect';

function Chip({ href, active, children, label }: { href: string; active: boolean; children: React.ReactNode; label?: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      aria-label={label}
      className={`zoom-content inline-flex items-center h-10 px-4 rounded-xs border text-[0.75rem] font-medium uppercase tracking-[0.14em] whitespace-nowrap transition-colors ${
        active ? 'bg-ink border-ink text-paper' : 'border-ink/20 text-ink hover:border-ink/60'
      }`}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}

export default function ShopFilters({ query, options, resultCount }: { query: ShopQuery; options: FacetOptions; resultCount: number }) {
  const filtered = !!(query.q || query.type || query.color || query.size);

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <form action="/shop" method="get" role="search" className="flex gap-2">
        {query.type && <input type="hidden" name="type" value={query.type} />}
        {query.color && <input type="hidden" name="color" value={query.color} />}
        {query.size && <input type="hidden" name="size" value={query.size} />}
        {query.sort !== 'featured' && <input type="hidden" name="sort" value={query.sort} />}
        <label htmlFor="shop-search" className="sr-only">
          Search the shop
        </label>
        <div className="relative flex-1">
          <Icon name="magnifying-glass" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input id="shop-search" type="search" name="q" defaultValue={query.q} placeholder="Search the collection" className="field field-light pl-11" />
        </div>
        <button type="submit" className="zoom-content inline-flex items-center justify-center h-12 px-6 rounded-xs bg-ink text-paper text-[0.75rem] font-semibold uppercase tracking-[0.16em] cursor-pointer">
          <span>Search</span>
        </button>
      </form>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          {/* Type */}
          <nav aria-label="Filter by type" className="no-scrollbar -mx-4 px-4 overflow-x-auto">
            <ul className="list-none p-0 m-0 flex gap-2">
              <li>
                <Chip href={shopHref(query, { type: '' })} active={!query.type}>
                  All
                </Chip>
              </li>
              {options.types.map((t) => (
                <li key={t.value}>
                  <Chip href={shopHref(query, { type: query.type === t.value ? '' : t.value })} active={query.type === t.value}>
                    {t.label}
                  </Chip>
                </li>
              ))}
            </ul>
          </nav>
          {/* Colour and size */}
          <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
            <ul className="list-none p-0 m-0 flex items-center gap-2" aria-label="Filter by colour and size">
              {options.colors.map((c) => (
                <li key={c.value}>
                  <Chip
                    href={shopHref(query, { color: query.color === c.value ? '' : c.value })}
                    active={query.color === c.value}
                    label={`Colour: ${colorLabel(c.value)}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-ink/25" style={{ background: colorSwatch(c.value) }} aria-hidden="true" />
                    {colorLabel(c.value)}
                  </Chip>
                </li>
              ))}
              {options.sizes.length > 1 && <li aria-hidden="true" className="w-px h-6 bg-ink/15 mx-1" />}
              {options.sizes.length > 1 &&
                options.sizes.map((s) => (
                  <li key={s}>
                    <Chip href={shopHref(query, { size: query.size === s ? '' : s })} active={query.size === s} label={`Size ${s}`}>
                      {s}
                    </Chip>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 lg:justify-end">
          <p className="m-0 text-[0.8rem] text-stone" aria-live="polite">
            {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
            {filtered && (
              <>
                {' · '}
                <Link href="/shop" scroll={false} className="text-ink underline underline-offset-4">
                  Clear all
                </Link>
              </>
            )}
          </p>
          <SortSelect query={query} options={SORT_OPTIONS} />
        </div>
      </div>
    </div>
  );
}

// lib/shop-filters.ts
// Shop search, filters and sorting, kept in the URL (?q=hoodie&type=hoodie&color=black&size=L&sort=price-asc)
// so results can be shared, bookmarked and used with the back button. Pure functions, safe anywhere.

import type { Product } from '@/lib/products';

export type SortOrder = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'name', label: 'Name, A to Z' },
];

export interface ShopQuery {
  q: string;
  type: string;
  color: string;
  size: string;
  sort: SortOrder;
}

export const EMPTY_QUERY: ShopQuery = { q: '', type: '', color: '', size: '', sort: 'featured' };

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export function parseShopQuery(params: Params): ShopQuery {
  const sort = one(params.sort) as SortOrder;
  return {
    q: one(params.q).trim().slice(0, 80),
    type: one(params.type).trim().toLowerCase(),
    color: one(params.color).trim().toLowerCase(),
    size: one(params.size).trim().toUpperCase(),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'featured',
  };
}

/** Link to the shop with one part of the query changed. Empty values are dropped. */
export function shopHref(query: ShopQuery, change: Partial<ShopQuery> = {}): string {
  const next = { ...query, ...change };
  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  if (next.type) params.set('type', next.type);
  if (next.color) params.set('color', next.color);
  if (next.size) params.set('size', next.size);
  if (next.sort !== 'featured') params.set('sort', next.sort);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

export interface FacetOptions {
  types: { value: string; label: string; count: number }[];
  colors: { value: string; count: number }[];
  sizes: string[];
}

export function facets(products: Product[]): FacetOptions {
  const types = new Map<string, { label: string; count: number }>();
  const colors = new Map<string, number>();
  const sizes: string[] = [];
  for (const p of products) {
    const t = types.get(p.category);
    types.set(p.category, { label: p.categoryLabel, count: (t?.count ?? 0) + 1 });
    if (p.color) colors.set(p.color, (colors.get(p.color) ?? 0) + 1);
    for (const s of p.sizes) if (!sizes.includes(s)) sizes.push(s);
  }
  return {
    types: [...types].map(([value, v]) => ({ value, label: v.label, count: v.count })),
    colors: [...colors].map(([value, count]) => ({ value, count })),
    sizes,
  };
}

export function applyShopQuery(products: Product[], query: ShopQuery): Product[] {
  const words = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = products.filter((p) => {
    if (query.type && p.category !== query.type) return false;
    if (query.color && p.color !== query.color) return false;
    if (query.size && !p.sizes.includes(query.size)) return false;
    if (words.length) {
      const hay = `${p.name} ${p.categoryLabel} ${p.color ?? ''} ${p.description}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  switch (query.sort) {
    case 'price-asc':
      return [...list].sort((a, b) => a.price - b.price);
    case 'price-desc':
      return [...list].sort((a, b) => b.price - a.price);
    case 'name':
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    default:
      return list;
  }
}

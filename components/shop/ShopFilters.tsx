// components/shop/ShopFilters.tsx
// Filter sidebar for the Shop: Categories and Size, built from the products on sale.
// Several options in a group widen the match (any of them); different groups narrow it (all of them).
'use client';

import { useId, useState } from 'react';
import type { Product } from '@/lib/products';

export interface ShopFilterState {
  categories: string[];
  sizes: string[];
}

export const NO_FILTERS: ShopFilterState = { categories: [], sizes: [] };

export function filterProducts(products: Product[], f: ShopFilterState): Product[] {
  return products.filter(
    (p) =>
      (f.categories.length === 0 || f.categories.includes(p.category)) &&
      (f.sizes.length === 0 || p.sizes.some((s) => f.sizes.includes(s))),
  );
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL', '5XL', 'OS', 'ONE SIZE'];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? SIZE_ORDER.length : i;
};

type Option = { value: string; label: string };

function optionsFor(products: Product[]): { categories: Option[]; sizes: Option[] } {
  const categories = new Map<string, string>();
  const sizes = new Set<string>();
  for (const p of products) {
    categories.set(p.category, p.categoryLabel);
    p.sizes.forEach((s) => sizes.add(s));
  }
  return {
    categories: [...categories].map(([value, label]) => ({ value, label })),
    sizes: [...sizes].sort((a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b)).map((s) => ({ value: s, label: s })),
  };
}

function Group({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const id = useId();
  if (options.length === 0) return null;
  return (
    <fieldset className="m-0 min-w-0 border-0 border-b-2 border-ink/15 p-0 pb-6 last:border-b-0 last:pb-0">
      <legend id={id} className="mb-3 p-0 text-[1.15rem] font-bold uppercase tracking-[0.06em] text-ink">
        {title}
      </legend>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex min-h-9 cursor-pointer items-center gap-3 text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-ink hover:text-green-deep">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => onToggle(o.value)}
                className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#067F3A]"
              />
              {o.label}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export default function ShopFilters({
  products,
  value,
  onChange,
  resultCount,
}: {
  products: Product[];
  value: ShopFilterState;
  onChange: (next: ShopFilterState) => void;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const opts = optionsFor(products);
  const active = value.categories.length + value.sizes.length;

  const toggle = (key: keyof ShopFilterState) => (v: string) =>
    onChange({ ...value, [key]: value[key].includes(v) ? value[key].filter((x) => x !== v) : [...value[key], v] });

  return (
    <aside aria-label="Filter products" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between border-[3px] border-ink bg-paper px-4 py-3 text-[0.9rem] font-bold uppercase tracking-[0.14em] text-ink lg:hidden"
      >
        <span>Filters{active > 0 ? ` (${active})` : ''}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      <div id={panelId} className={`${open ? 'block' : 'hidden'} mt-4 flex flex-col gap-6 lg:mt-0 lg:flex`}>
        <Group title="Categories" options={opts.categories} selected={value.categories} onToggle={toggle('categories')} />
        <Group title="Size" options={opts.sizes} selected={value.sizes} onToggle={toggle('sizes')} />

        <div className="flex items-center justify-between gap-3 text-[0.85rem] text-stone">
          <span role="status" aria-live="polite">
            {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </span>
          {active > 0 && (
            <button
              type="button"
              onClick={() => onChange(NO_FILTERS)}
              className="cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-green-deep underline underline-offset-4"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

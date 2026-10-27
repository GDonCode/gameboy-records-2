// components/shop/ShopFilters.tsx
'use client';

// Shop filters and sorting: a sidebar on desktop, a row of chips plus a sort menu on phones.
// The page keeps the choices in the URL (?type=hoodie&color=black&sort=price-asc).

export type TypeFilter = 'all' | 't-shirt' | 'hoodie';
export type ColorFilter = 'all' | 'black' | 'white' | 'gray';
export type SortOrder = 'featured' | 'price-asc' | 'price-desc' | 'name';

export const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 't-shirt', label: 'T-Shirts' },
  { value: 'hoodie', label: 'Hoodies' },
];

export const COLOR_OPTIONS: { value: ColorFilter; label: string; swatch?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'black', label: 'Black', swatch: '#111111' },
  { value: 'white', label: 'White', swatch: '#FFFFFF' },
  { value: 'gray', label: 'Gray', swatch: '#9a9a9a' },
];

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

const BODY = { fontFamily: "'Poppins', sans-serif" } as const;
const SEMI = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;

export interface FilterState {
  type: TypeFilter;
  color: ColorFilter;
  sort: SortOrder;
}

interface FilterProps extends FilterState {
  onChange: (next: Partial<FilterState>) => void;
  onReset: () => void;
  resultCount: number;
}

function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string; swatch?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend style={SEMI} className="mb-2.5 text-[11px] uppercase leading-none tracking-[0.18em] text-[#16432a]/60">
        {title}
      </legend>
      <div role="radiogroup" aria-label={title} className="flex flex-col gap-0.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              style={active ? SEMI : BODY}
              className={`flex items-center gap-2.5 border-l-[3px] px-3 py-[7px] text-left text-[14px] leading-tight cursor-pointer transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a] ${
                active
                  ? 'border-[#1a9e4a] bg-[#1a9e4a]/10 text-[#16432a]'
                  : 'border-transparent text-[#16432a]/75 hover:bg-[#16432a]/5 hover:text-[#16432a]'
              }`}
            >
              {o.swatch && (
                <span aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-[#16432a]/30" style={{ background: o.swatch }} />
              )}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SortSelect({ id, value, onChange, dark }: { id: string; value: SortOrder; onChange: (v: SortOrder) => void; dark?: boolean }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as SortOrder)}
      style={BODY}
      className={`w-full cursor-pointer border px-2.5 py-2 text-[13px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a] ${
        dark
          ? 'border-[#1a9e4a]/30 bg-transparent text-[#e8f5ec] [&>*]:text-black'
          : 'border-[#16432a]/20 bg-white text-[#16432a]'
      }`}
    >
      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function FilterSidebar(props: FilterProps) {
  const dirty = props.type !== 'all' || props.color !== 'all';
  return (
    <aside aria-label="Product filters" className="hidden md:flex w-60 shrink-0 flex-col overflow-y-auto border-r-2 border-[#2f8a68]/10 bg-[#FEFEFA] px-5 pt-8 pb-6">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 style={SEMI} className="text-[15px] uppercase leading-none tracking-[0.14em] text-[#16432a]">Filters</h2>
        <button
          type="button"
          onClick={props.onReset}
          disabled={!dirty}
          style={BODY}
          className="text-[12px] text-[#1a9e4a] underline underline-offset-4 decoration-[#1a9e4a]/40 hover:decoration-[#1a9e4a] disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-7">
        <div>
          <label htmlFor="sort-desktop" style={SEMI} className="mb-2.5 block text-[11px] uppercase leading-none tracking-[0.18em] text-[#16432a]/60">
            Sort by
          </label>
          <SortSelect id="sort-desktop" value={props.sort} onChange={(sort) => props.onChange({ sort })} />
        </div>
        <OptionGroup title="Type" options={TYPE_OPTIONS} value={props.type} onChange={(type) => props.onChange({ type })} />
        <OptionGroup title="Color" options={COLOR_OPTIONS} value={props.color} onChange={(color) => props.onChange({ color })} />
      </div>

      <p aria-live="polite" style={BODY} className="mt-auto border-t border-[#16432a]/10 pt-4 text-[13px] leading-none text-[#16432a]/70">
        <span style={SEMI} className="tabular-nums text-[#16432a]">{props.resultCount}</span>{' '}
        {props.resultCount === 1 ? 'item' : 'items'}
      </p>
    </aside>
  );
}

export function MobileFilterBar(props: FilterProps) {
  const chip = (active: boolean) =>
    `shrink-0 border px-3 py-1.5 text-[12px] leading-none cursor-pointer transition-colors ${
      active ? 'bg-[#1a9e4a] border-[#1a9e4a] text-white' : 'border-[#1a9e4a]/30 text-[#e8f5ec]'
    }`;
  return (
    <div className="md:hidden flex flex-col gap-3 w-full" aria-label="Product filters" role="group">
      <div className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 no-scrollbar">
        <div className="flex gap-2 pb-1" style={BODY}>
          {TYPE_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
            <button key={o.value} type="button" aria-pressed={props.type === o.value} onClick={() => props.onChange({ type: props.type === o.value ? 'all' : o.value })} className={chip(props.type === o.value)}>
              {o.label}
            </button>
          ))}
          <span aria-hidden="true" className="mx-1 w-px shrink-0 bg-[#e8f5ec]/20" />
          {COLOR_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
            <button key={o.value} type="button" aria-pressed={props.color === o.value} onClick={() => props.onChange({ color: props.color === o.value ? 'all' : o.value })} className={chip(props.color === o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3" style={BODY}>
        <p aria-live="polite" className="text-[12px] text-[#e8f5ec]/70">
          <span style={SEMI} className="tabular-nums text-[#e8f5ec]">{props.resultCount}</span> {props.resultCount === 1 ? 'item' : 'items'}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-mobile" className="text-[12px] text-[#e8f5ec]/70">Sort</label>
          <div className="w-44"><SortSelect id="sort-mobile" value={props.sort} onChange={(sort) => props.onChange({ sort })} dark /></div>
        </div>
      </div>
    </div>
  );
}

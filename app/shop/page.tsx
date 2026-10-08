'use client';

import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import Footer from '@/components/Footer';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { emitCartCount } from '@/lib/cart-sync';

// ── CORNER BRACKETS ──────────────────────────────────────────────────────────
function Corners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
    </>
  );
}


// ── FILTER SIDEBAR ───────────────────────────────────────────────────────────
type ColorFilter = 'all' | 'black' | 'white' | 'gray';
type TypeFilter = 'all' | 't' | 'h';

const COLOR_OPTIONS: { value: ColorFilter; label: string; swatch?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'black', label: 'Black', swatch: '#111111' },
  { value: 'white', label: 'White', swatch: '#FFFFFF' },
  { value: 'gray', label: 'Gray', swatch: '#9a9a9a' },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 't', label: 'T-Shirts' },
  { value: 'h', label: 'Hoodies' },
];

const SIDEBAR_BODY = { fontFamily: "'Poppins', sans-serif" } as const;
const SIDEBAR_HEADING = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;

function FilterGroup<T extends string>({
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
    <fieldset className="mb-8 border-0 p-0">
      <legend style={SIDEBAR_BODY} className="mb-3 text-[11px] font-semibold uppercase leading-none tracking-[0.18em] text-[#16432a]/70">
        {title}
      </legend>
      <div role="radiogroup" aria-label={title} className="flex flex-col gap-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              style={SIDEBAR_BODY}
              className={`flex items-center gap-3 border-l-[3px] px-3 py-2 text-left text-[15px] leading-snug tracking-[0.005em] antialiased cursor-pointer transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a] ${
                active
                  ? 'border-[#1a9e4a] bg-[#1a9e4a]/10 font-semibold text-[#16432a]'
                  : 'border-transparent font-medium text-[#16432a]/80 hover:bg-[#16432a]/5 hover:text-[#16432a]'
              }`}
            >
              {o.swatch && (
                <span aria-hidden="true" className="h-4 w-4 rounded-full border border-[#16432a]/30" style={{ background: o.swatch }} />
              )}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterSidebar(props: {
  color: ColorFilter;
  type: TypeFilter;
  onColor: (v: ColorFilter) => void;
  onType: (v: TypeFilter) => void;
  onReset: () => void;
  resultCount: number;
}) {
  const dirty = props.color !== 'all' || props.type !== 'all';
  return (
    <aside aria-label="Product filters" className="hidden md:flex w-64 shrink-0 flex-col overflow-y-auto border-r-2 border-[#2f8a68]/10 bg-[#FEFEFA] px-5 pt-24 pb-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 style={SIDEBAR_HEADING} className="text-xl uppercase leading-none tracking-[0.08em] text-[#16432a]">Filters</h2>
        <button
          type="button"
          onClick={props.onReset}
          disabled={!dirty}
          style={SIDEBAR_BODY}
          className="text-[13px] font-medium text-[#1a9e4a] underline underline-offset-4 decoration-[#1a9e4a]/40 hover:decoration-[#1a9e4a] disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
      <FilterGroup title="Type" options={TYPE_OPTIONS} value={props.type} onChange={props.onType} />
      <FilterGroup title="Color" options={COLOR_OPTIONS} value={props.color} onChange={props.onColor} />
      <p aria-live="polite" style={SIDEBAR_BODY} className="mt-auto border-t border-[#16432a]/10 pt-4 text-[13px] leading-none text-[#16432a]/70">
        <span className="font-semibold tabular-nums text-[#16432a]">{props.resultCount}</span>{' '}
        {props.resultCount === 1 ? 'item' : 'items'}
      </p>
    </aside>
  );
}

function MobileFilterBar(props: {
  color: ColorFilter;
  type: TypeFilter;
  onColor: (v: ColorFilter) => void;
  onType: (v: TypeFilter) => void;
}) {
  const chip = (active: boolean) =>
    `shrink-0 border px-3 py-1.5 text-xs cursor-pointer ${
      active ? 'bg-[#1a9e4a] border-[#1a9e4a] text-white' : 'border-[#1a9e4a]/30 text-[#16432a]'
    }`;
  return (
    <div className="md:hidden -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4" aria-label="Product filters">
      <div className="flex gap-2 pb-1" style={{ fontFamily: "'Poppins', monospace" }}>
        {TYPE_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
          <button key={o.value} type="button" aria-pressed={props.type === o.value} onClick={() => props.onType(props.type === o.value ? 'all' : o.value)} className={chip(props.type === o.value)}>
            {o.label}
          </button>
        ))}
        <span aria-hidden="true" className="mx-1 w-px shrink-0 bg-[#16432a]/20" />
        {COLOR_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
          <button key={o.value} type="button" aria-pressed={props.color === o.value} onClick={() => props.onColor(props.color === o.value ? 'all' : o.value)} className={chip(props.color === o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CART BUTTON (icon only: neutral → added → removed → neutral) ─────────────
// Icons: Font Awesome Free v7.3.1 (https://fontawesome.com/license/free), © 2026 Fonticons, Inc.
type CartState = 'neutral' | 'added' | 'removed';

// How long the red "removed" state shows before returning to neutral (about one icon transition).
const REMOVED_MS = 400;

// Shop cards add one unit at this size. It's the same default the cart page uses for "Move to cart";
// the card has no size picker, so other sizes are managed on the product page / cart page.
const CART_SIZE = 'M';

interface CartRow {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
}

function CartButton({
  productName,
  quantity,
  onAdd,
  onRemove,
}: {
  productName: string;
  quantity: number; // 0 = not in the cart
  onAdd: () => void;
  onRemove: () => void;
}) {
  // "removed" is a brief flash; neutral / added come straight from the cart quantity.
  const [flash, setFlash] = useState(false);
  // The remove preview (trash on hover) stays off right after a click-to-add,
  // and is armed again once the pointer leaves the button (or focus moves away).
  const [armed, setArmed] = useState(true);
  // Only play the add "pop" for clicks, not for items already in the cart on page load.
  const [pop, setPop] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const state: CartState = flash ? 'removed' : quantity > 0 ? 'added' : 'neutral';

  const handleClick = (e: MouseEvent) => {
    // Card is wrapped in a <Link>, so keep the click from navigating.
    e.preventDefault();
    e.stopPropagation();

    if (state === 'neutral') {
      setArmed(false);
      setPop(true);
      onAdd();
    } else if (state === 'added') {
      setPop(false);
      setFlash(true);
      onRemove();
      timer.current = setTimeout(() => setFlash(false), REMOVED_MS);
    }
  };

  const label =
    state === 'neutral' ? `Add ${productName} to cart`
    : state === 'added' ? `${productName} is in your cart (${quantity}). Remove from cart`
    : `${productName} removed from cart`;

  const iconBase = 'absolute inset-0 m-auto h-6 w-6 transition-all duration-300 ease-out';

  // Button fill + border per state. Neutral is outlined (white fill, green border and icon);
  // added is solid green and removed is solid red, both with white icons.
  // While added (and armed), hover / focus previews the red Remove look.
  const fillCls =
    state === 'removed' ? 'bg-[#a42a2a] border-[#a42a2a]'
    : state === 'added'
      ? `bg-[#1a9e4a] border-[#1a9e4a] ${armed ? 'hover:bg-[#a42a2a] hover:border-[#a42a2a] focus-visible:bg-[#a42a2a] focus-visible:border-[#a42a2a]' : ''}`
      : 'bg-white border-[#1a9e4a] border-[0.09rem] hover:bg-[#e8f5ec]';

  // neutral: visible only in the neutral state
  const neutralCls = `${iconBase} ${state === 'neutral' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45'}`;

  // Hover / focus preview of the Remove state (only while "armed")
  const swapOut = 'group-hover/cart:opacity-0 group-hover/cart:scale-50 group-hover/cart:rotate-12 group-focus-visible/cart:opacity-0 group-focus-visible/cart:scale-50 group-focus-visible/cart:rotate-12';
  const swapIn = 'group-hover/cart:opacity-100 group-hover/cart:scale-100 group-hover/cart:rotate-0 group-focus-visible/cart:opacity-100 group-focus-visible/cart:scale-100 group-focus-visible/cart:rotate-0';

  // added: visible while added; swaps out for the trash icon on hover once armed
  const addedCls = `${iconBase} ${
    state === 'added'
      ? `opacity-100 scale-100 rotate-0 ${armed ? swapOut : ''}`
      : 'opacity-0 scale-50 rotate-45'
  }`;

  // remove: visible in the removed state, and previewed on hover while added (once armed)
  const removeCls = `${iconBase} ${
    state === 'removed'
      ? 'opacity-100 scale-100 rotate-0'
      : state === 'added'
        ? `opacity-0 scale-50 -rotate-12 ${armed ? swapIn : ''}`
        : 'opacity-0 scale-50 -rotate-12'
  }`;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={state === 'added'}
      disabled={state === 'removed'}
      onClick={handleClick}
      onMouseLeave={() => setArmed(true)}
      onBlur={() => setArmed(true)}
      className={`group/cart relative h-11 w-11 shrink-0 rounded-full border-2 ${fillCls} shadow-md cursor-pointer transition-all duration-300 ease-out active:scale-90 disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a9e4a] ${pop && state === 'added' ? 'animate-[cart-pop_350ms_ease-out]' : ''}`}
    >
      <span aria-live="polite" className="sr-only">{label}</span>
      {/* neutral: cart with plus */}
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={neutralCls}>
        <path fill="#1a9e4a" d="M0 72C0 58.7 10.7 48 24 48L69.3 48C96.4 48 119.6 67.4 124.4 94L124.8 96L537.5 96C557.5 96 572.6 114.2 568.9 133.9L537.8 299.8C532.1 330.1 505.7 352 474.9 352L171.3 352L176.4 380.3C178.5 391.7 188.4 400 200 400L456 400C469.3 400 480 410.7 480 424C480 437.3 469.3 448 456 448L200.1 448C165.3 448 135.5 423.1 129.3 388.9L77.2 102.6C76.5 98.8 73.2 96 69.3 96L24 96C10.7 96 0 85.3 0 72zM160 528C160 501.5 181.5 480 208 480C234.5 480 256 501.5 256 528C256 554.5 234.5 576 208 576C181.5 576 160 554.5 160 528zM384 528C384 501.5 405.5 480 432 480C458.5 480 480 501.5 480 528C480 554.5 458.5 576 432 576C405.5 576 384 554.5 384 528zM336 142.4C322.7 142.4 312 153.1 312 166.4L312 200L278.4 200C265.1 200 254.4 210.7 254.4 224C254.4 237.3 265.1 248 278.4 248L312 248L312 281.6C312 294.9 322.7 305.6 336 305.6C349.3 305.6 360 294.9 360 281.6L360 248L393.6 248C406.9 248 417.6 237.3 417.6 224C417.6 210.7 406.9 200 393.6 200L360 200L360 166.4C360 153.1 349.3 142.4 336 142.4z" />
      </svg>
      {/* added: check */}
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={addedCls}>
        <path fill="#ffffff" d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" />
      </svg>
      {/* remove: trash (button turns the wishlist heart's red) */}
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={removeCls}>
        <path fill="#ffffff" d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z" />
      </svg>
    </button>
  );
}

// ── QUANTITY STEPPER (appears over the card image while the item is in the cart) ──
function CartStepper({
  productName,
  quantity,
  onChange,
}: {
  productName: string;
  quantity: number; // 0 = not in the cart (stepper hidden)
  onChange: (next: number) => void;
}) {
  const open = quantity > 0;
  // Keep showing the last quantity while the stepper fades out after a removal.
  const shown = useRef(quantity);
  if (quantity > 0) shown.current = quantity;

  // The card is wrapped in a <Link>; swallow clicks from anything inside the stepper.
  const stop = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const stepBtn =
    'flex h-9 w-9 items-center justify-center rounded-full text-[#1a9e4a] cursor-pointer transition-colors duration-150 hover:bg-[#e8f5ec] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a]';

  return (
    <div
      role="group"
      aria-label={`${productName} quantity`}
      aria-hidden={!open}
      onClick={stop}
      className={`absolute bottom-3 right-3 z-10 flex h-11 items-center rounded-full border-[0.09rem] border-[#1a9e4a] bg-white/95 px-1 shadow-md transition-all duration-300 ease-out ${open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2'}`}
    >
      <button
        type="button"
        aria-label={`Decrease quantity of ${productName}`}
        disabled={open && quantity <= 1}
        tabIndex={open ? 0 : -1}
        onClick={() => onChange(quantity - 1)}
        className={stepBtn}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span aria-live="polite" style={{ fontFamily: "'Poppins', monospace" }} className="min-w-6 px-1 text-center text-[15px] font-semibold tabular-nums text-[#16432a]">
        {shown.current}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${productName}`}
        tabIndex={open ? 0 : -1}
        onClick={() => onChange(quantity + 1)}
        className={stepBtn}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

export default function ShopPage() {
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [selectedColor, setSelectedColor] = useState<ColorFilter>('all');
    const [selectedType, setSelectedType] = useState<TypeFilter>('all');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/wishlist')
            .then(res => (res.ok ? res.json() : { items: [] }))
            .then(data => {
                const ids = (data.items || []).map((item: { product_id: string }) => item.product_id);
                setWishlist(new Set(ids));
            })
            .catch(() => setWishlist(new Set()));
    }, []);

    const toggleWishlist = async (key: string) => {
        const isWishlisted = wishlist.has(key);

        setWishlist(prev => {
            const next = new Set(prev);
            if (isWishlisted) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });

        const res = await fetch('/api/wishlist', {
            method: isWishlisted ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: key }),
        });

        if (res.status === 401) {
            router.push('/account/login');
            return;
        }

        if (!res.ok) {
            setWishlist(prev => {
                const next = new Set(prev);
                if (isWishlisted) {
                    next.add(key);
                } else {
                    next.delete(key);
                }
                return next;
            });
        }
    };

    // ── CART (linked to /api/cart) ───────────────────────────────────────────
    // cartQty drives the buttons; it is updated optimistically, then confirmed against the server.
    // Requests for the same product run one after another so add → +/- → remove can't race.
    const [cartQty, setCartQty] = useState<Record<string, number>>({});
    const qtyRef = useRef<Record<string, number>>({});           // latest quantity per product
    const idsRef = useRef<Record<string, string>>({});           // cart_items row id per product
    const savedQtyRef = useRef<Record<string, number>>({});      // last quantity the server confirmed
    const chainsRef = useRef<Record<string, Promise<void>>>({}); // per-product request queue
    const otherQtyRef = useRef(0);                               // items in the cart this page doesn't manage (other sizes)

    const setQty = (pid: string, q: number | null) => {
        const next = { ...qtyRef.current };
        if (q === null) {
            delete next[pid];
        } else {
            next[pid] = q;
        }
        qtyRef.current = next;
        setCartQty(next);
        // Tell the header's red counter right away (optimistic, same as the buttons).
        emitCartCount((Object.values(next) as number[]).reduce((a: number, b: number) => a + b, 0) + otherQtyRef.current);
    };

    const fetchCart = async (): Promise<CartRow[] | null> => {
        try {
            const res = await fetch('/api/cart');
            if (!res.ok) return null; // 401 = signed out: buttons just stay neutral
            const data = await res.json();
            return data.items ?? [];
        } catch {
            return null;
        }
    };

    // Re-read the cart from the server: one product (after a failed request) or everything (on load).
    const syncFromServer = async (pid?: string) => {
        const rows = await fetchCart();
        if (!rows) return;
        const mine = rows.filter(r => r.size === CART_SIZE);
        otherQtyRef.current = rows.filter(r => r.size !== CART_SIZE).reduce((a, r) => a + r.quantity, 0);
        const apply = (id: string) => {
            const row = mine.find(r => r.product_id === id);
            if (row) {
                idsRef.current[id] = row.id;
                savedQtyRef.current[id] = row.quantity;
                setQty(id, row.quantity);
            } else {
                delete idsRef.current[id];
                delete savedQtyRef.current[id];
                setQty(id, null);
            }
        };
        if (pid) {
            apply(pid);
        } else {
            mine.forEach(r => apply(r.product_id));
        }
    };

    useEffect(() => {
        syncFromServer();
    }, []);

    const enqueue = (pid: string, task: () => Promise<void>) => {
        chainsRef.current[pid] = (chainsRef.current[pid] ?? Promise.resolve())
            .then(task)
            .catch(async () => {
                if (!idsRef.current[pid]) setQty(pid, null); // add never reached the server
                await syncFromServer(pid);
            });
    };

    const addToCart = (pid: string) => {
        setQty(pid, 1);
        enqueue(pid, async () => {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: pid, size: CART_SIZE, quantity: 1 }),
            });

            if (res.status === 401) {
                setQty(pid, null);
                router.push('/account/login');
                return;
            }
            if (!res.ok) {
                await syncFromServer(pid);
                return;
            }

            // POST doesn't return the row id, which PATCH / DELETE need.
            const rows = await fetchCart();
            const row = rows?.find(r => r.product_id === pid && r.size === CART_SIZE);
            if (!row) return;
            idsRef.current[pid] = row.id;
            savedQtyRef.current[pid] = row.quantity;
            // Untouched since the click: show the real total (the item may already have been in the cart).
            if (qtyRef.current[pid] === 1) setQty(pid, row.quantity);
        });
    };

    const changeQuantity = (pid: string, next: number) => {
        if (next < 1) return;
        setQty(pid, next);
        enqueue(pid, async () => {
            const id = idsRef.current[pid];
            const latest = qtyRef.current[pid];
            if (!id || latest === undefined) return;          // removed in the meantime
            if (savedQtyRef.current[pid] === latest) return;  // a queued request already saved this value

            const res = await fetch('/api/cart', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, quantity: latest }),
            });

            if (res.status === 401) {
                router.push('/account/login');
                return;
            }
            if (!res.ok) {
                await syncFromServer(pid);
                return;
            }
            savedQtyRef.current[pid] = latest;
        });
    };

    const removeFromCart = (pid: string) => {
        setQty(pid, null);
        enqueue(pid, async () => {
            const id = idsRef.current[pid];
            if (!id) return;

            const res = await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.status === 401) {
                router.push('/account/login');
                return;
            }
            if (!res.ok) {
                await syncFromServer(pid);
                return;
            }
            delete idsRef.current[pid];
            delete savedQtyRef.current[pid];
        });
    };

    const PRODUCT_IDS = ['black-t', 'gray-t', 'white-t', 'black-h', 'white-h', 'gray-h'];
    const colorMatches = (productId: string) =>
        (selectedColor === 'all' || productId.startsWith(selectedColor)) &&
        (selectedType === 'all' || productId.endsWith(`-${selectedType}`));
    const resultCount = PRODUCT_IDS.filter(colorMatches).length;
    const resetFilters = () => { setSelectedColor('all'); setSelectedType('all'); };

    return (
        <>
            <style>{`@keyframes cart-pop { 0% { transform: scale(0.8); } 55% { transform: scale(1.18); } 100% { transform: scale(1); } }`}</style>
            <Header />
            <MobileBottomNav />
            <div className="flex flex-row h-screen overflow-hidden bg-[#FEFEFA]">
                <FilterSidebar color={selectedColor} type={selectedType} onColor={setSelectedColor} onType={setSelectedType} onReset={resetFilters} resultCount={resultCount} />
                <div className="flex flex-wrap content-start gap-6 p-4 pt-18 md:pt-4 flex-1 overflow-y-auto relative">
                    <section className="relative isolate -mx-4 -mt-3 w-[calc(100%+2rem)] overflow-hidden bg-[#0c1510] px-6 pt-4 pb-6 md:mx-0 md:mt-0 md:w-full md:px-8 md:py-8">
                        <GameIconsBackground />
                        <div className="relative z-[1]">
                            <h1 style={{ fontFamily: "'Poppins_semibold', sans-serif" }} className="mt-3 text-4xl md:text-5xl uppercase leading-none text-[#FEFEFA]">
                                "RISE" COLLECTION
                            </h1>
                            <span style={{ fontFamily: "'Poppins', monospace" }} className="block text-sm md:text-md tracking-[0.35em] text-[#3dc97e] ml-8">
                                by ALEXX A-GAME
                            </span>
                        </div>
                    </section>
                    <MobileFilterBar color={selectedColor} type={selectedType} onColor={setSelectedColor} onType={setSelectedType} />
                    {resultCount === 0 && (
                        <p style={{ fontFamily: "'Poppins', monospace" }} className="w-full py-12 text-center text-[#16432a]/70">
                            No products match these filters.{' '}
                            <button type="button" onClick={resetFilters} className="text-[#1a9e4a] underline cursor-pointer">Reset filters</button>
                        </p>
                    )}
                    <Link href="/shop/black-t" className={`group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] h-fit shadow-[0_4px_16px_rgba(22,67,42,0.18)] bg-transparent ${colorMatches('black-t') ? '' : 'hidden'}`}>
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F6] overflow-hidden">
                            <Image src="/black-t.png" alt="Product 1" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('black-t') ? 'Remove Black T-Shirt from wishlist' : 'Add Black T-Shirt to wishlist'}
                                aria-pressed={wishlist.has('black-t')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist('black-t'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-t') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-t') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                            <CartStepper productName="Black T-Shirt" quantity={cartQty['black-t'] ?? 0} onChange={(q) => changeQuantity('black-t', q)} />
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Black T-Shirt</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$19.99</span>
                                <CartButton productName="Black T-Shirt" quantity={cartQty['black-t'] ?? 0} onAdd={() => addToCart('black-t')} onRemove={() => removeFromCart('black-t')} />
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/gray-t" className={`group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] h-fit shadow-[0_4px_16px_rgba(22,67,42,0.18)] bg-transparent ${colorMatches('gray-t') ? '' : 'hidden'}`}>
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F6] overflow-hidden">
                            <Image src="/gray-t.png" alt="Product 2" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('gray-t') ? 'Remove Gray T-Shirt from wishlist' : 'Add Gray T-Shirt to wishlist'}
                                aria-pressed={wishlist.has('gray-t')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist('gray-t'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-t') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-t') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                            <CartStepper productName="Gray T-Shirt" quantity={cartQty['gray-t'] ?? 0} onChange={(q) => changeQuantity('gray-t', q)} />
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Gray T-Shirt</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$19.99</span>
                                <CartButton productName="Gray T-Shirt" quantity={cartQty['gray-t'] ?? 0} onAdd={() => addToCart('gray-t')} onRemove={() => removeFromCart('gray-t')} />
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/white-t" className={`group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] h-fit shadow-[0_4px_16px_rgba(22,67,42,0.18)] bg-transparent ${colorMatches('white-t') ? '' : 'hidden'}`}>
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F6] overflow-hidden">
                            <Image src="/white-t.png" alt="Product 3" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('white-t') ? 'Remove White T-Shirt from wishlist' : 'Add White T-Shirt to wishlist'}
                                aria-pressed={wishlist.has('white-t')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist('white-t'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-t') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-t') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button> 
                            <CartStepper productName="White T-Shirt" quantity={cartQty['white-t'] ?? 0} onChange={(q) => changeQuantity('white-t', q)} />
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">White T-Shirt</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$19.99</span>
                                <CartButton productName="White T-Shirt" quantity={cartQty['white-t'] ?? 0} onAdd={() => addToCart('white-t')} onRemove={() => removeFromCart('white-t')} />
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/black-h" className={`group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] h-fit shadow-[0_4px_16px_rgba(22,67,42,0.18)] bg-transparent ${colorMatches('black-h') ? '' : 'hidden'}`}>
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F6] overflow-hidden">
                            <Image src="/black-h.png" alt="Product 4" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('black-h') ? 'Remove Black Hoodie from wishlist' : 'Add Black Hoodie to wishlist'}
                                aria-pressed={wishlist.has('black-h')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist('black-h'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-h') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-h') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                            <CartStepper productName="Black Hoodie" quantity={cartQty['black-h'] ?? 0} onChange={(q) => changeQuantity('black-h', q)} />
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Black Hoodie</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$39.99</span>
                                <CartButton productName="Black Hoodie" quantity={cartQty['black-h'] ?? 0} onAdd={() => addToCart('black-h')} onRemove={() => removeFromCart('black-h')} />
                            </div>
                        </div>
                    </Link>
                                        <Link href="/shop/white-h" className={`group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] h-fit shadow-[0_4px_16px_rgba(22,67,42,0.18)] bg-transparent ${colorMatches('white-h') ? '' : 'hidden'}`}>
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F6] overflow-hidden">
                            <Image src="/white-h.png" alt="Product 5" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('white-h') ? 'Remove White Hoodie from wishlist' : 'Add White Hoodie to wishlist'}
                                aria-pressed={wishlist.has('white-h')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist('white-h'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-h') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-h') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                            <CartStepper productName="White Hoodie" quantity={cartQty['white-h'] ?? 0} onChange={(q) => changeQuantity('white-h', q)} />
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">White Hoodie</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$39.99</span>
                                <CartButton productName="White Hoodie" quantity={cartQty['white-h'] ?? 0} onAdd={() => addToCart('white-h')} onRemove={() => removeFromCart('white-h')} />
                            </div>
                        </div>
                    </Link>
                                        <Link href="/shop/gray-h" className={`group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] h-fit shadow-[0_4px_16px_rgba(22,67,42,0.18)] bg-white ${colorMatches('gray-h') ? '' : 'hidden'}`}>
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F6] overflow-hidden">
                            <Image src="/gray-h.png" alt="Product 6" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('gray-h') ? 'Remove Gray Hoodie from wishlist' : 'Add Gray Hoodie to wishlist'}
                                aria-pressed={wishlist.has('gray-h')}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist('gray-h'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-h') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-h') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                            <CartStepper productName="Gray Hoodie" quantity={cartQty['gray-h'] ?? 0} onChange={(q) => changeQuantity('gray-h', q)} />
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Gray Hoodie</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Poppins', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$39.99</span>
                                <CartButton productName="Gray Hoodie" quantity={cartQty['gray-h'] ?? 0} onAdd={() => addToCart('gray-h')} onRemove={() => removeFromCart('gray-h')} />
                            </div>
                        </div>
                    </Link>
                    <div className="-mx-4 -mb-4 w-[calc(100%+2rem)]">
                        <Footer />
                    </div>
                </div>
            </div>
        </>
    );
}

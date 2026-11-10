// components/shop/CartControls.tsx
'use client';

// The product card's cart controls: the icon button (neutral → added → removed → neutral) and the
// quantity stepper over the card image. Moved unchanged from app/shop/page.tsx, plus the size picker
// that now opens before the first add.

import { useEffect, useRef, useState, type MouseEvent } from 'react';

// ── CART BUTTON (icon only: neutral → added → removed → neutral) ─────────────
// Icons: Font Awesome Free v7.3.1 (https://fontawesome.com/license/free), © 2026 Fonticons, Inc.
type CartState = 'neutral' | 'added' | 'removed';

// How long the red "removed" state shows before returning to neutral (about one icon transition).
const REMOVED_MS = 400;

export function CartButton({
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
    // Keep the click from reaching the card's image link underneath.
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

  const iconBase = 'absolute inset-0 m-auto h-5 w-5 md:h-6 md:w-6 transition-all duration-300 ease-out';

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
      className={`group/cart relative h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full border-2 ${fillCls} shadow-md cursor-pointer transition-all duration-300 ease-out active:scale-90 disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a9e4a] ${pop && state === 'added' ? 'animate-[cart-pop_350ms_ease-out]' : ''}`}
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
export function CartStepper({
  productName,
  quantity,
  onChange,
  max,
}: {
  productName: string;
  quantity: number; // 0 = not in the cart (stepper hidden)
  onChange: (next: number) => void;
  /** Most allowed in one cart line; + is disabled there. */
  max: number;
}) {
  const open = quantity > 0;
  // Keep showing the last quantity while the stepper fades out after a removal.
  const [shown, setShown] = useState(quantity);
  if (quantity > 0 && quantity !== shown) setShown(quantity);

  // Swallow clicks so they don't reach the card's image link underneath.
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
        {shown}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${productName}`}
        disabled={open && quantity >= max}
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

// ── SIZE PICKER (opens over the card image when the cart button is first pressed) ──
export function SizePicker({
  productName,
  sizes,
  open,
  onPick,
  onClose,
}: {
  productName: string;
  sizes: string[];
  open: boolean;
  onPick: (size: string) => void;
  onClose: () => void;
}) {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const stop = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div
      role="dialog"
      aria-label={`Choose a size for ${productName}`}
      aria-hidden={!open}
      onClick={stop}
      className={`absolute inset-x-2 bottom-2 z-20 rounded-[10px] border border-[#1a9e4a]/40 bg-white/95 p-3 shadow-lg backdrop-blur transition-all duration-200 ease-out ${
        open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-2'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span style={{ fontFamily: "'Poppins_semibold', sans-serif" }} className="text-[11px] uppercase tracking-[0.16em] text-[#16432a]">
          Choose a size
        </span>
        <button
          type="button"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          aria-label="Close size picker"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#16432a]/60 hover:bg-[#16432a]/5 hover:text-[#16432a] cursor-pointer"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {sizes.map((size, i) => (
          <button
            key={size}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => onPick(size)}
            aria-label={`Add size ${size} to cart`}
            style={{ fontFamily: "'Poppins_semibold', sans-serif" }}
            className="h-9 rounded-[6px] border border-[#1a9e4a]/40 text-[13px] text-[#16432a] transition-colors hover:border-[#1a9e4a] hover:bg-[#1a9e4a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a9e4a] cursor-pointer"
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

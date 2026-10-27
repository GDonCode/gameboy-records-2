// components/shop/WishlistButton.tsx
'use client';

// Heart on the product card: outline when not saved (fills on hover), filled when saved.
// Icons: Font Awesome Free v7.3.1 (https://fontawesome.com/license/free), © 2026 Fonticons, Inc.

const OUTLINE = 'M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z';
const FILLED = 'M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z';

export default function WishlistButton({
  productName,
  saved,
  onToggle,
}: {
  productName: string;
  saved: boolean;
  onToggle: () => void;
}) {
  const icon = 'absolute inset-0 transition-all duration-300 ease-out';
  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${productName} from saved items` : `Save ${productName} for later`}
      aria-pressed={saved}
      onClick={onToggle}
      className="group/wishlist absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md cursor-pointer transition-transform active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a9e4a]"
    >
      <span className="relative block h-[22px] w-[22px]">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={`${icon} ${saved ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
          <path fill="rgb(164, 42, 42)" d={OUTLINE} />
        </svg>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={`${icon} ${saved ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
          <path fill="rgb(164, 42, 42)" d={FILLED} />
        </svg>
      </span>
    </button>
  );
}

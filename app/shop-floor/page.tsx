// app/shop-floor/page.tsx — the shop as a game screen. A test route: not in the nav, kept out of search.
import type { Metadata } from 'next';
import ShopScene from '@/components/shop-scene/ShopScene';

export const metadata: Metadata = {
  title: 'The Shop Floor',
  description: 'Step inside the Gameboy Records shop and pick an aisle.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/shop-floor' },
};

export default function ShopFloorPage() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <ShopScene />
    </main>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Official Alexx A-Game and Gameboy Records merch: tees and hoodies from the "Rise" collection.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}

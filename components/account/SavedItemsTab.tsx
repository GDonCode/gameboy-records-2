// components/account/SavedItemsTab.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Panel, TabHeading } from './Panel';
import type { SavedItem } from './types';

export default function SavedItemsTab({ initialItems }: { initialItems: SavedItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(item: SavedItem) {
    setRemovingId(item.id);
    setError(null);

    const res = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: item.product_id }),
    });

    setRemovingId(null);

    if (!res.ok) {
      setError('Could not remove that item. Try again.');
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  return (
    <div className="flex flex-col gap-8">
      <TabHeading
        title="Saved items"
        subtitle={items.length === 1 ? '1 item saved for later.' : `${items.length} items saved for later.`}
      />

      {error && (
        <p className="text-[#ff6b6b] text-[0.85em]" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <Panel className="flex flex-col items-center text-center gap-4 py-14">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
            <Heart className="w-7 h-7 text-[#4dff91]" strokeWidth={2} />
          </span>
          <p className="text-white/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Nothing saved yet.
          </p>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-[6px] bg-[#1a9e4a] text-white text-[0.85em] tracking-[0.1em] hover:bg-[#149262] transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            BROWSE THE SHOP
          </Link>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col bg-[#0f1a12] border border-[rgba(26,158,74,0.3)] rounded-[12px] overflow-hidden"
            >
              <Link href={`/shop/${item.slug}`} className="relative block aspect-square bg-[#F6F6F4]">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </Link>
              <div className="flex flex-col gap-3 p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div>
                  <Link href={`/shop/${item.slug}`} className="block text-white hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-[#4dff91] text-[0.9em] mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4 text-[0.8em]">
                  <Link href={`/shop/${item.slug}`} className="text-[#4dff91] hover:underline">
                    View item
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.id}
                    className="text-[#ff6b6b] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {removingId === item.id ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

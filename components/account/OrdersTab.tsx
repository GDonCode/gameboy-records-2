// components/account/OrdersTab.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Archive, Package } from 'lucide-react';
import { Panel, TabHeading } from './Panel';
import { isArchivedOrder, type Order, type OrderStatus } from './types';

const MONO = { fontFamily: "'Poppins_semibold', sans-serif" };
const BODY = { fontFamily: "'Poppins', sans-serif" };

type OrderView = 'current' | 'archived';

const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  processing: 'bg-[#f5c542]/15 text-[#f5c542] border-[#f5c542]/40',
  shipped: 'bg-[#4dff91]/15 text-[#4dff91] border-[#4dff91]/40',
  delivered: 'bg-white/10 text-white/80 border-white/20',
  cancelled: 'bg-[#ff6b6b]/10 text-[#ff6b6b] border-[#ff6b6b]/40',
  returned: 'bg-white/10 text-white/80 border-white/20',
};

function OrderCard({ order }: { order: Order }) {
  const placed = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article className="bg-[#0f1a12] border border-[rgba(26,158,74,0.3)] rounded-[12px] overflow-hidden" style={BODY}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[rgba(26,158,74,0.2)]">
        <div className="flex flex-col">
          <span className="text-white" style={MONO}>Order #{order.number}</span>
          <span className="text-[0.8em] text-white/60">
            Placed {placed} · {itemCount} {itemCount === 1 ? 'item' : 'items'} · ${order.total.toFixed(2)}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full border text-[0.7em] tracking-[0.15em] uppercase ${STATUS_CLASS[order.status]}`} style={MONO}>
          {STATUS_LABEL[order.status]}
        </span>
      </header>

      <ul className="flex flex-col divide-y divide-white/5">
        {order.items.map((item) => (
          <li key={`${item.product_id}-${item.size}`} className="flex items-center gap-4 px-5 py-3">
            <Link href={`/shop/${item.slug}`} className="relative w-14 h-14 flex-shrink-0 rounded-[8px] overflow-hidden bg-[#F6F6F4]">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
            </Link>
            <div className="flex flex-col min-w-0 flex-1">
              <Link href={`/shop/${item.slug}`} className="text-white truncate hover:underline">{item.name}</Link>
              <span className="text-[0.8em] text-white/60">Size {item.size} · Qty {item.quantity}</span>
            </div>
            <span className="text-[#4dff91] text-[0.9em]">${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {order.tracking_url && order.status === 'shipped' && (
        <footer className="px-5 py-3 border-t border-[rgba(26,158,74,0.2)]">
          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[0.85em] text-[#4dff91] hover:underline">
            Track package →
          </a>
        </footer>
      )}
    </article>
  );
}

export default function OrdersTab({ orders }: { orders: Order[] }) {
  const [view, setView] = useState<OrderView>('current');

  const current = orders.filter((o) => !isArchivedOrder(o.status));
  const archived = orders.filter((o) => isArchivedOrder(o.status));
  const shown = view === 'current' ? current : archived;

  const views: { value: OrderView; label: string; count: number }[] = [
    { value: 'current', label: 'Current', count: current.length },
    { value: 'archived', label: 'Archived', count: archived.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <TabHeading title="My orders" subtitle="Track, manage and return your orders." />

      <div role="tablist" aria-label="Order status" className="inline-flex self-start gap-1 p-1 rounded-[10px] bg-white/5 border border-white/10">
        {views.map((v) => {
          const active = v.value === view;
          return (
            <button
              key={v.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(v.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[0.85em] tracking-[0.08em] uppercase cursor-pointer transition-colors ${
                active ? 'bg-[#1a9e4a] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
              style={MONO}
            >
              {v.label}
              <span className={`min-w-5 px-1.5 rounded-full text-[0.85em] tabular-nums ${active ? 'bg-white/20' : 'bg-white/10'}`}>
                {v.count}
              </span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <Panel className="flex flex-col items-center text-center gap-4 py-14">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1a9e4a]/15 border border-[#1a9e4a]/40">
            {view === 'current' ? (
              <Package className="w-7 h-7 text-[#4dff91]" strokeWidth={2} />
            ) : (
              <Archive className="w-7 h-7 text-[#4dff91]" strokeWidth={2} />
            )}
          </span>
          <p className="max-w-[360px] text-[0.95em] text-white/70" style={BODY}>
            {view === 'current'
              ? 'No orders on the way right now.'
              : 'Delivered, cancelled and returned orders will be kept here.'}
          </p>
          {view === 'current' && (
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-[6px] bg-[#1a9e4a] text-white text-[0.85em] tracking-[0.1em] hover:bg-[#149262] transition-colors"
              style={BODY}
            >
              BROWSE THE SHOP
            </Link>
          )}
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          {shown.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

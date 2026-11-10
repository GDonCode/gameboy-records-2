// lib/woocommerce.ts
// Server-only. Talks to the WooCommerce store (Tapstitch syncs its print-on-demand products into it and
// fulfils the orders it receives).
//
//   WOOCOMMERCE_URL              https://shop.example.com — the WordPress site running WooCommerce
//   WOOCOMMERCE_CONSUMER_KEY     ck_… (WooCommerce → Settings → Advanced → REST API, Read/Write)
//   WOOCOMMERCE_CONSUMER_SECRET  cs_…
//   WOOCOMMERCE_WEBHOOK_SECRET   the secret set on the "Order updated" webhook
//
// Reading products needs only the URL (public Store API). Placing orders and reading them back needs the keys.
import { createHmac, timingSafeEqual } from 'node:crypto';

export function wooUrl(): string | null {
  const url = process.env.WOOCOMMERCE_URL?.trim();
  return url ? url.replace(/\/$/, '') : null;
}

export function wooHasKeys(): boolean {
  return !!(wooUrl() && process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET);
}

// ── Store API (public, read-only) ─────────────────────────────────────────────

export interface StoreTerm {
  id: number;
  name: string;
  slug: string;
}
export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  permalink: string;
  description: string;
  short_description: string;
  prices: { price: string; regular_price: string; sale_price: string; currency_code: string; currency_minor_unit: number };
  images: { id: number; src: string; alt: string }[];
  categories: StoreTerm[];
  tags: StoreTerm[];
  attributes: { id: number; name: string; taxonomy: string | null; has_variations: boolean; terms: StoreTerm[] }[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
  is_in_stock: boolean;
  is_purchasable: boolean;
}

/** Every published product, cached for five minutes. Throws when the store can't be reached. */
export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const base = wooUrl();
  if (!base) return [];
  const all: StoreProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=100&page=${page}&orderby=menu_order&order=asc`, {
      next: { revalidate: 300, tags: ['woo-products'] },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`WooCommerce Store API responded ${res.status}`);
    const batch = (await res.json()) as StoreProduct[];
    all.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages || batch.length === 0) break;
  }
  return all;
}

// ── REST API v3 (authenticated) ──────────────────────────────────────────────

export interface WooLineItemInput {
  product_id: number;
  variation_id?: number;
  quantity: number;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  date_created_gmt: string;
  payment_url: string;
  customer_id: number;
  billing: { email: string; first_name: string; last_name: string };
  line_items: { id: number; name: string; product_id: number; variation_id: number; quantity: number; subtotal: string; total: string; price: number; image?: { src: string } | null; meta_data: { key: string; value: unknown; display_key?: string; display_value?: string }[] }[];
  meta_data: { key: string; value: unknown }[];
}

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = wooUrl();
  if (!base || !wooHasKeys()) throw new Error('WooCommerce REST credentials are not configured.');
  const auth = Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${base}/wp-json/wc/v3${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && typeof data.message === 'string' ? data.message : `WooCommerce responded ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export function createOrder(body: Record<string, unknown>): Promise<WooOrder> {
  return rest<WooOrder>('/orders', { method: 'POST', body: JSON.stringify(body) });
}

export function getOrder(id: number): Promise<WooOrder> {
  return rest<WooOrder>(`/orders/${id}`);
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

/** WooCommerce signs each delivery: base64(HMAC-SHA256(raw body, secret)) in X-WC-Webhook-Signature. */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

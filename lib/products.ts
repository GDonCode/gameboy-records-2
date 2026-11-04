// lib/products.ts
// The product shape the shop works with, plus helpers that are safe in the browser.
// Live products come from WooCommerce (lib/catalog.ts, server only); LOCAL_PRODUCTS below is the in-house
// catalogue used until the store is connected (WOOCOMMERCE_URL unset).

export interface Product {
  /** Stable id stored in carts and wishlists. WooCommerce products use their numeric id as a string. */
  id: string;
  slug: string;
  name: string;
  price: number;
  /** ISO currency code. */
  currency: string;
  images: string[];
  description: string;
  sizes: string[];
  /** Shop filter group, e.g. 't-shirt', 'hoodie', 'sweatpants'. */
  category: string;
  categoryLabel: string;
  /** Lower-case colour name, when the product has one. */
  color: string | null;
  inStock: boolean;
  /** WooCommerce ids, needed to place the order. */
  wooId?: number;
  variationIds?: Record<string, number>;
  /** Only listed in development (e.g. a cheap product for testing checkout). */
  testOnly?: boolean;
}

/** Most of one item a single cart line can hold. */
export const MAX_CART_QUANTITY = 10;

const BASE = { currency: 'USD', inStock: true, sizes: ['S', 'M', 'L', 'XL'] };

const TEE_COPY =
  'Heavyweight cotton jersey in a boxed fit that holds its shape wash after wash. Tonal Gameboy Records mark at the chest. Made in a small run.';
const HOODIE_COPY =
  'Dense loopback fleece with a dropped shoulder and a full, structured hood. Tonal Gameboy Records mark at the chest. Made in a small run.';

export const LOCAL_PRODUCTS: Product[] = [
  { ...BASE, id: 'black-t', slug: 'black-t', name: 'Rise Tee — Black', price: 19.99, images: ['/black-t.png'], description: TEE_COPY, category: 't-shirt', categoryLabel: 'T-Shirt', color: 'black' },
  { ...BASE, id: 'gray-t', slug: 'gray-t', name: 'Rise Tee — Heather Grey', price: 19.99, images: ['/gray-t.png'], description: TEE_COPY, category: 't-shirt', categoryLabel: 'T-Shirt', color: 'gray' },
  { ...BASE, id: 'white-t', slug: 'white-t', name: 'Rise Tee — White', price: 19.99, images: ['/white-t.png'], description: TEE_COPY, category: 't-shirt', categoryLabel: 'T-Shirt', color: 'white' },
  { ...BASE, id: 'black-h', slug: 'black-h', name: 'Rise Hoodie — Black', price: 39.99, images: ['/black-h.png'], description: HOODIE_COPY, category: 'hoodie', categoryLabel: 'Hoodie', color: 'black' },
  { ...BASE, id: 'white-h', slug: 'white-h', name: 'Rise Hoodie — Bone', price: 39.99, images: ['/white-h.png'], description: HOODIE_COPY, category: 'hoodie', categoryLabel: 'Hoodie', color: 'white' },
  { ...BASE, id: 'gray-h', slug: 'gray-h', name: 'Rise Hoodie — Heather Grey', price: 39.99, images: ['/gray-h.png'], description: HOODIE_COPY, category: 'hoodie', categoryLabel: 'Hoodie', color: 'gray' },
  {
    ...BASE,
    id: 'test-t',
    slug: 'test-t',
    name: 'Test T-Shirt',
    price: 9.99,
    images: ['/black-t.png'],
    description: 'Development-only product for testing checkout.',
    category: 't-shirt',
    categoryLabel: 'T-Shirt',
    color: 'black',
    testOnly: true,
  },
];

export function isListed(product: Product): boolean {
  return !product.testOnly || process.env.NODE_ENV !== 'production';
}

const priceFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function formatPrice(amount: number, currency = 'USD'): string {
  if (currency === 'USD') return priceFormat.format(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/** Display label for a colour value. */
export function colorLabel(color: string): string {
  const named: Record<string, string> = { gray: 'Heather Grey', grey: 'Heather Grey', white: 'White / Bone' };
  return named[color] ?? color.replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());
}

/** CSS colour for a filter swatch. */
export function colorSwatch(color: string): string {
  const known: Record<string, string> = {
    black: '#0B0A07',
    white: '#F5F5F5',
    bone: '#EDEAE0',
    cream: '#EDEAE0',
    gray: '#9A9893',
    grey: '#9A9893',
    green: '#2C8663',
    gold: '#A8895A',
    brown: '#5B4632',
    navy: '#1E2A44',
  };
  return known[color] ?? '#9A9893';
}

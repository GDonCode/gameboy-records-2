// lib/catalog.ts
// Server-only. The shop's product list: WooCommerce when WOOCOMMERCE_URL is set, otherwise the in-house
// catalogue in lib/products.ts. Every page and API route reads products through here.

import { LOCAL_PRODUCTS, isListed, type Product } from '@/lib/products';
import { fetchStoreProducts, wooUrl, type StoreProduct } from '@/lib/woocommerce';

export type CatalogSource = 'woocommerce' | 'local';

export interface Catalog {
  products: Product[];
  source: CatalogSource;
  /** Set when the store is configured but couldn't be reached. */
  error: string | null;
}

// Map store categories onto the shop's filter groups.
const CATEGORY_ALIASES: Record<string, { key: string; label: string }> = {
  't-shirt': { key: 't-shirt', label: 'T-Shirt' },
  't-shirts': { key: 't-shirt', label: 'T-Shirt' },
  tee: { key: 't-shirt', label: 'T-Shirt' },
  tees: { key: 't-shirt', label: 'T-Shirt' },
  shirts: { key: 't-shirt', label: 'T-Shirt' },
  hoodie: { key: 'hoodie', label: 'Hoodie' },
  hoodies: { key: 'hoodie', label: 'Hoodie' },
  sweatshirts: { key: 'hoodie', label: 'Hoodie' },
  sweatpants: { key: 'sweatpants', label: 'Sweatpants' },
  joggers: { key: 'sweatpants', label: 'Sweatpants' },
  pants: { key: 'sweatpants', label: 'Sweatpants' },
};

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL', '5XL', 'OS', 'ONE SIZE'];

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isAttr(name: string, wanted: string) {
  const n = name.toLowerCase().replace(/^pa_/, '');
  return n === wanted || n === `${wanted}s`;
}

export function fromStore(p: StoreProduct): Product {
  const minor = p.prices.currency_minor_unit ?? 2;
  const price = Number(p.prices.price) / 10 ** minor;

  const cat = p.categories.map((c) => CATEGORY_ALIASES[c.slug]).find(Boolean) ?? {
    key: p.categories[0]?.slug ?? 'other',
    label: p.categories[0]?.name ?? 'Apparel',
  };

  const sizeAttr = p.attributes.find((a) => isAttr(a.name, 'size') || (a.taxonomy && isAttr(a.taxonomy, 'size')));
  const colorAttr = p.attributes.find((a) => isAttr(a.name, 'color') || isAttr(a.name, 'colour') || (a.taxonomy && (isAttr(a.taxonomy, 'color') || isAttr(a.taxonomy, 'colour'))));

  const sizes = (sizeAttr?.terms ?? [])
    .map((t) => t.name.toUpperCase())
    .sort((a, b) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99));

  // Size → variation id. Variation attribute values are term slugs (or names on custom attributes).
  const variationIds: Record<string, number> = {};
  if (sizeAttr) {
    for (const v of p.variations) {
      const attr = v.attributes.find((a) => isAttr(a.name, 'size'));
      if (!attr) continue;
      const term = sizeAttr.terms.find((t) => t.slug === attr.value || t.name.toLowerCase() === attr.value.toLowerCase());
      if (term) variationIds[term.name.toUpperCase()] = v.id;
    }
  }

  return {
    id: String(p.id),
    slug: p.slug,
    name: stripHtml(p.name),
    price,
    currency: p.prices.currency_code || 'USD',
    images: p.images.length ? p.images.map((i) => i.src) : ['/assets/placeholder.jpg'],
    description: stripHtml(p.short_description || p.description),
    sizes: sizes.length ? sizes : ['One Size'],
    category: cat.key,
    categoryLabel: cat.label,
    color: colorAttr?.terms.length === 1 ? colorAttr.terms[0].name.toLowerCase() : null,
    inStock: p.is_in_stock && p.is_purchasable,
    wooId: p.id,
    variationIds,
  };
}

/** The shop's products, in catalogue order. */
export async function getCatalog(): Promise<Catalog> {
  if (!wooUrl()) {
    return { products: LOCAL_PRODUCTS.filter(isListed), source: 'local', error: null };
  }
  try {
    const store = await fetchStoreProducts();
    return { products: store.map(fromStore), source: 'woocommerce', error: null };
  } catch (err) {
    console.error('WooCommerce catalogue failed:', err);
    return { products: [], source: 'woocommerce', error: 'The shop is being restocked. Please check back shortly.' };
  }
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getCatalog()).products.find((p) => p.id === id);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getCatalog()).products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const { products } = await getCatalog();
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const others = products.filter((p) => p.id !== product.id && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[]; // ASSUMPTION: only 1 image per product exists today; add more paths here later for a real gallery
  description: string;
  sizes: string[]; // ASSUMPTION: generic S/M/L/XL — replace with real sizing per product
  category: 't-shirt' | 'hoodie';
  color: 'black' | 'white' | 'gray';
  /** Only listed in development (e.g. a cheap product for testing checkout). Hidden from the live shop and cart. */
  testOnly?: boolean;
}

export const products: Product[] = [
  {
    id: 'black-t',
    slug: 'black-t',
    name: 'Black T-Shirt',
    price: 19.99,
    images: ['/black-t.png'],
    description: 'TODO: add real product description.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 't-shirt',
    color: 'black',
  },
  {
    id: 'gray-t',
    slug: 'gray-t',
    name: 'Gray T-Shirt',
    price: 19.99,
    images: ['/gray-t.png'],
    description: 'TODO: add real product description.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 't-shirt',
    color: 'gray',
  },
  {
    id: 'white-t',
    slug: 'white-t',
    name: 'White T-Shirt',
    price: 19.99,
    images: ['/white-t.png'],
    description: 'TODO: add real product description.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 't-shirt',
    color: 'white',
  },
  {
    id: 'black-h',
    slug: 'black-h',
    name: 'Black Hoodie',
    price: 39.99,
    images: ['/black-h.png'],
    description: 'TODO: add real product description.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'hoodie',
    color: 'black',
  },
  {
    id: 'white-h',
    slug: 'white-h',
    name: 'White Hoodie',
    price: 39.99,
    images: ['/white-h.png'],
    description: 'TODO: add real product description.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'hoodie',
    color: 'white',
  },
  {
    id: 'gray-h',
    slug: 'gray-h',
    name: 'Gray Hoodie',
    price: 39.99,
    images: ['/gray-h.png'],
    description: 'TODO: add real product description.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'hoodie',
    color: 'gray',
  },
  {
    id: 'test-t',
    slug: 'test-t',
    name: 'Test T-Shirt',
    price: 9.99,
    images: ['/black-t.png'],
    description: 'TEST PRODUCT - not for sale.',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 't-shirt',
    color: 'black',
    testOnly: true,
  },
];

/** Most of one item a single cart line can hold. */
export const MAX_CART_QUANTITY = 10;

export function isListed(product: Product): boolean {
  return !product.testOnly || process.env.NODE_ENV !== 'production';
}

/** Products shown in the shop, in catalog order. */
export const listedProducts: Product[] = products.filter(isListed);

export function getProduct(id: string): Product | undefined {
  return listedProducts.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return listedProducts.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return listedProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

const priceFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function formatPrice(amount: number): string {
  return priceFormat.format(amount);
}
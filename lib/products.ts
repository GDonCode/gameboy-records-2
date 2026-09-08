export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[]; // ASSUMPTION: only 1 image per product exists today; add more paths here later for a real gallery
  description: string;
  sizes: string[]; // ASSUMPTION: generic S/M/L/XL — replace with real sizing per product
  category: 't-shirt' | 'hoodie';
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
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
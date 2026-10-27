// components/cart/types.ts
// Shapes returned by GET /api/cart and GET /api/wishlist.

export interface CartLine {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  name: string;
  price: number;
  image: string | null;
  slug: string | null;
  sizes: string[];
  /** False when the product (or this size) is no longer sold. */
  available: boolean;
}

export interface SavedItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
  sizes: string[];
  available: boolean;
}

export const SEMI = { fontFamily: "'Poppins_semibold', 'Poppins', sans-serif" } as const;
export const BODY = { fontFamily: "'Poppins', sans-serif" } as const;

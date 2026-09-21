// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';

interface CartItem {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  name: string;
  price: number;
  image: string | null;
}

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [cartRes, wishlistRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/wishlist'),
      ]);

      if (cartRes.status === 401 || wishlistRes.status === 401) {
        router.push('/account/login');
        return;
      }

      if (!cartRes.ok || !wishlistRes.ok) {
        setError('Failed to load your cart.');
        setIsLoading(false);
        return;
      }

      const cartData = await cartRes.json();
      const wishlistData = await wishlistRes.json();

      setCartItems(cartData.items || []);
      setWishlistItems(wishlistData.items || []);
      setIsLoading(false);
    }

    loadData();
  }, [router]);

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) return;

    setCartItems(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)));

    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });

    if (res.status === 401) {
      router.push('/account/login');
    }
  }

  async function removeFromCart(id: string) {
    setCartItems(prev => prev.filter(item => item.id !== id));

    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.status === 401) {
      router.push('/account/login');
    }
  }

  async function removeFromWishlist(productId: string) {
    setWishlistItems(prev => prev.filter(item => item.product_id !== productId));

    const res = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    if (res.status === 401) {
      router.push('/account/login');
    }
  }

  async function moveToCart(item: WishlistItem) {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: item.product_id, size: 'M', quantity: 1 }),
    });

    if (res.status === 401) {
      router.push('/account/login');
      return;
    }

    if (res.ok) {
      await removeFromWishlist(item.product_id);
      const cartRes = await fetch('/api/cart');
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartItems(cartData.items || []);
      }
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-[#FEFEFA] px-6 md:px-10 py-10">
        <h1
          style={{ fontFamily: "'Poppins', monospace" }}
          className="text-2xl text-[#16432a] mb-8"
        >
          Your Cart
        </h1>

        {isLoading ? (
          <p style={{ fontFamily: "'Poppins', monospace" }} className="text-[#16432a]/70">
            Loading…
          </p>
        ) : error ? (
          <p style={{ fontFamily: "'Poppins', monospace" }} className="text-red-600">
            {error}
          </p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart items — main column */}
            <div className="flex-1 w-full">
              {cartItems.length === 0 ? (
                <p style={{ fontFamily: "'Poppins', monospace" }} className="text-[#16432a]/70">
                  Your cart is empty.{' '}
                  <Link href="/shop" className="text-[#1a9e4a] underline">
                    Continue shopping
                  </Link>
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border border-[#1a9e4a]/20 bg-white px-4 py-4"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 bg-[#F6F6F4] border border-[#2f8a68]/10">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          style={{ fontFamily: "'Poppins', monospace" }}
                          className="text-[#16432a] font-semibold"
                        >
                          {item.name}
                        </p>
                        <p style={{ fontFamily: "'Poppins', monospace" }} className="text-sm text-[#16432a]/60">
                          Size: {item.size}
                        </p>
                        <p style={{ fontFamily: "'Poppins', monospace" }} className="text-[#1a9e4a] mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 border border-[#1a9e4a]/30 text-[#16432a] disabled:opacity-40 cursor-pointer"
                        >
                          −
                        </button>
                        <span style={{ fontFamily: "'Poppins', monospace" }} className="w-6 text-center text-[#16432a]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-[#1a9e4a]/30 text-[#16432a] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{ fontFamily: "'Poppins', monospace" }}
                        className="text-sm text-red-600 hover:underline cursor-pointer ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-end mt-4">
                    <p style={{ fontFamily: "'Poppins', monospace" }} className="text-lg text-[#16432a]">
                      Subtotal: <span className="text-[#1a9e4a]">${subtotal.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist — sidebar */}
            <aside className="w-full lg:w-[320px] flex-shrink-0 border border-[#1a9e4a]/20 bg-white px-5 py-5">
              <h2
                style={{ fontFamily: "'Poppins', monospace" }}
                className="text-[#16432a] mb-4"
              >
                Wishlist
              </h2>

              {wishlistItems.length === 0 ? (
                <p style={{ fontFamily: "'Poppins', monospace" }} className="text-sm text-[#16432a]/60">
                  Nothing saved yet.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Link href={`/shop/${item.slug}`} className="relative w-14 h-14 flex-shrink-0 bg-[#F6F6F4] border border-[#2f8a68]/10">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        )}
                      </Link>
                      <div className="flex-1">
                        <Link
                          href={`/shop/${item.slug}`}
                          style={{ fontFamily: "'Poppins', monospace" }}
                          className="block text-sm text-[#16432a] font-semibold hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p style={{ fontFamily: "'Poppins', monospace" }} className="text-xs text-[#1a9e4a] mb-2">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => moveToCart(item)}
                            style={{ fontFamily: "'Poppins', monospace" }}
                            className="text-xs text-[#1a9e4a] hover:underline cursor-pointer"
                          >
                            Move to cart
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.product_id)}
                            style={{ fontFamily: "'Poppins', monospace" }}
                            className="text-xs text-red-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
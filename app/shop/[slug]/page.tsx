'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product);

  return (
    <>
      <Header />
      <div className="w-full h-screen overflow-y-auto px-8 py-10 bg-[#FEFEFA]">
        <div className="flex flex-col md:flex-row gap-10 md:items-start">
          <div className="w-full md:w-[380px] flex-shrink-0">
            <div style={{ aspectRatio: '1 / 1' }} className="relative w-full bg-[#F6F6F4] border-2 border-[#2f8a68]/10 overflow-hidden">
              <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 border-2 ${i === activeImage ? 'border-[#1a9e4a]' : 'border-transparent'}`}
                  >
                    <Image src={img} alt={`${product.name} thumbnail ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }} className="text-2xl text-[#16432a] mb-2">
              {product.name}
            </h1>
            <p style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }} className="text-xl text-[#1a9e4a] mb-6">
              ${product.price.toFixed(2)}
            </p>
            <p style={{ fontFamily: "'Arvo', monospace" }} className="text-[#16432a]/80 mb-6">
              {product.description}
            </p>

            <div className="mb-6">
              <h2 style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }} className="text-sm text-[#16432a] mb-2">
                Size
              </h2>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#1a9e4a] text-white border-[#1a9e4a]'
                        : 'border-[#1a9e4a]/30 text-[#16432a]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedSize}
              className="w-full py-3 bg-[#1a9e4a] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }} className="text-lg text-[#16432a] mb-4">
              You may also like
            </h2>
            <div className="flex flex-wrap gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/shop/${r.slug}`}
                  className="group w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#1a9e4a_100%)]"
                >
                  <div style={{ aspectRatio: '4 / 5' }} className="relative w-full bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                    <Image src={r.images[0]} alt={r.name} fill className="object-cover" />
                  </div>
                  <div className="w-full px-4 py-4">
                    <span style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }} className="block font-semibold text-white">
                      {r.name}
                    </span>
                    <span style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }} className="block font-semibold text-white">
                      ${r.price.toFixed(2)}
                    </span>
                    <div className="w-full flex justify-end mt-2">
                      <span
                        style={{ fontFamily: "'Hemisphers Bold Sans', monospace" }}
                        className="text-xs text-white transition-transform duration-200 group-hover:underline hover:scale-110 hover:underline"
                      >
                        View Product
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
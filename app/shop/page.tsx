'use client';

import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
  id: string;
  date: string;
  title: string;
  teaser: string;
  tag: string;
  slug: string;
  coverImageUrl: string | null;
}

// ── CORNER BRACKETS ──────────────────────────────────────────────────────────
function Corners() {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-[#1a9e4a] pointer-events-none z-50" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-[#1a9e4a] pointer-events-none z-50" />
    </>
  );
}


export default function ShopPage() {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const toggleWishlist = (key: string) => {
        setWishlist(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };
    return (
        <>
            <Header />
            <div className="flex flex-row h-screen overflow-hidden bg-[#FEFEFA]" >
                <aside className="hidden md:flex news-sidebar relative flex-col w-64 h-full flex-shrink-0 bg-[#EDEAE0] z-[25] overflow-hidden">
                <Corners />
                <div className="no-scrollbar flex-1 overflow-y-auto">
                  <div className="px-4 py-5">
                    <div  className="space-y-8">
                        <div>
                            <h2 style={{fontFamily: "'Hemisphers Bold Sans', monospace",fontSize: '1.1em',letterSpacing: '0.1em',color: '#16432a',}}>Browse</h2>
                            <ul className="pl-5 space-y-3 bg-[#1a9e4a]/[0.1] border border-[#1a9e4a]/20 px-4 py-3">
                                <li style={{fontFamily: "'Arvo', monospace",fontSize: '1em',fontWeight: 'semibold',letterSpacing: '0.1em',color: '#fff',}}><button className="cursor-pointer bg-[#1a9e4a] px-5 py-2 rounded-md">All Products</button></li>
                                <li style={{fontFamily: "'Arvo', monospace",fontSize: '1em',fontWeight: 'semibold',letterSpacing: '0.1em',color: '#16432a',}}><button className="cursor-pointer hover:scale-102 transition-transform duration-200">"Rise Up" Collection</button></li>
                            </ul>
                        </div>
                        <div>
                            <h2 style={{fontFamily: "'Hemisphers Bold Sans', monospace",fontSize: '1.1em',letterSpacing: '0.1em',color: '#16432a',}}>Account</h2>
                            <ul className="pl-5 space-y-3 bg-[#1a9e4a]/[0.1] border border-[#1a9e4a]/20 px-4 py-3">
                                <li style={{fontFamily: "'Arvo', monospace",fontSize: '1em',fontWeight: 'semibold',letterSpacing: '0.1em',color: '#16432a',}}><button className="cursor-pointer hover:scale-102 transition-transform duration-200">My Account</button></li>
                                <li style={{fontFamily: "'Arvo', monospace",fontSize: '1em',fontWeight: 'semibold',letterSpacing: '0.1em',color: '#16432a',}}><button className="cursor-pointer hover:scale-102 transition-transform duration-200">Cart</button></li>   
                            </ul>
                        </div>
                    </div>
                  </div>
                </div>
                </aside>
                <div className="flex flex-wrap content-start gap-6 p-4 flex-1 overflow-y-auto relative">
                    <Link href="/shop/black-t" className="group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-transparent">
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/black-t.png" alt="Product 1" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('black-t') ? 'Remove Black T-Shirt from wishlist' : 'Add Black T-Shirt to wishlist'}
                                aria-pressed={wishlist.has('black-t')}
                                onClick={(e) => { e.preventDefault(); toggleWishlist('black-t'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-t') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-t') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Black T-Shirt</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$19.99</span>
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace"}} className="text-xs text-[#16432a] transition-transform duration-200 hover:scale-110 hover:underline group-hover:underline">
                                    View Product
                                </span>
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/gray-t" className="group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-transparent">
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/gray-t.png" alt="Product 2" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('gray-t') ? 'Remove Gray T-Shirt from wishlist' : 'Add Gray T-Shirt to wishlist'}
                                aria-pressed={wishlist.has('gray-t')}
                                onClick={(e) => { e.preventDefault(); toggleWishlist('gray-t'); }}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-t') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-t') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Gray T-Shirt</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$19.99</span>
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace"}} className="text-xs text-[#16432a] transition-transform duration-200 hover:scale-110 hover:underline group-hover:underline">
                                    View Product
                                </span>
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/white-t" className="group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-transparent">
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/white-t.png" alt="Product 3" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('white-t') ? 'Remove White T-Shirt from wishlist' : 'Add White T-Shirt to wishlist'}
                                aria-pressed={wishlist.has('white-t')}
                                onClick={() => toggleWishlist('white-t')}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-t') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-t') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button> 
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">White T-Shirt</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$19.99</span>
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace"}} className="text-xs text-[#16432a] transition-transform duration-200 hover:scale-110 hover:underline group-hover:underline">
                                    View Product
                                </span>
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/black-h" className="group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-transparent">
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/black-h.png" alt="Product 4" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('black-h') ? 'Remove Black Hoodie from wishlist' : 'Add Black Hoodie to wishlist'}
                                aria-pressed={wishlist.has('black-h')}
                                onClick={() => toggleWishlist('black-h')}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-h') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('black-h') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Black Hoodie</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$39.99</span>
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace"}} className="text-xs text-[#16432a] transition-transform duration-200 hover:scale-110 hover:underline group-hover:underline">
                                    View Product
                                </span>
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/white-h" className="group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-transparent">
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/white-h.png" alt="Product 5" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('white-h') ? 'Remove White Hoodie from wishlist' : 'Add White Hoodie to wishlist'}
                                aria-pressed={wishlist.has('white-h')}
                                onClick={() => toggleWishlist('white-h')}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-h') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('white-h') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">White Hoodie</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$39.99</span>
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace"}} className="text-xs text-[#16432a] transition-transform duration-200 hover:scale-110 hover:underline group-hover:underline">
                                    View Product
                                </span>
                            </div>
                        </div>
                    </Link>
                    <Link href="/shop/gray-h" className="group items-center flex flex-col overflow-hidden cursor-pointer w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-transparent">
                        <div style={{ aspectRatio: '1 / 1' }} className="group relative w-full mx-auto bg-[#F6F6F4] border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/gray-h.png" alt="Product 6" fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                            <button
                                type="button"
                                aria-label={wishlist.has('gray-h') ? 'Remove Gray Hoodie from wishlist' : 'Add Gray Hoodie to wishlist'}
                                aria-pressed={wishlist.has('gray-h')}
                                onClick={() => toggleWishlist('gray-h')}
                                className="group/wishlist absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer"
                            >
                                <span className="relative block w-[24px] h-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-h') ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover/wishlist:opacity-0 group-hover/wishlist:scale-75'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" className={`absolute inset-0 transition-all duration-300 ease-out ${wishlist.has('gray-h') ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/wishlist:opacity-100 group-hover/wishlist:scale-100'}`}>
                                        <path fill="rgb(164, 42, 42)" d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.3em'}} className="block font-semibold text-[#16432a]">Gray Hoodie</span>
                            <div className="flex items-center justify-between">
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="font-semibold text-[#1a9e4a]">$39.99</span>
                                <span style={{fontFamily: "'Hemisphers Bold Sans', monospace"}} className="text-xs text-[#16432a] transition-transform duration-200 hover:scale-110 hover:underline group-hover:underline">
                                    View Product
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}

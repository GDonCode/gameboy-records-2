'use client';

import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import GameIconsBackground from '@/components/GameIconsBackground';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
                    <div className="items-center flex flex-col overflow-hidden w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#2f8a68_100%)]">
                        <div style={{ aspectRatio: '4 / 5' }} className="relative w-full mx-auto bg-white border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/black-t.png" alt="Product 1" fill className="object-cover" />
                            <button
                                type="button"
                                aria-label="Add Black T-Shirt to cart"
                                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1a9e4a] text-white flex items-center justify-center shadow-md hover:bg-[#16432a] transition-colors duration-200 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18">
                                    <path fill="#ffffff" d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.5em'}} className="block font-semibold text-white">Black T-Shirt</span>
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="block font-semibold text-white">$19.99</span>
                        </div>
                    </div>
                    <div className="items-center flex flex-col overflow-hidden w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#2f8a68_100%)]">
                        <div style={{ aspectRatio: '4 / 5' }} className="relative w-full mx-auto bg-white border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/gray-t.png" alt="Product 2" fill className="object-cover" />
                            <button
                                type="button"
                                aria-label="Add Gray T-Shirt to cart"
                                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1a9e4a] text-white flex items-center justify-center shadow-md hover:bg-[#16432a] transition-colors duration-200 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18">
                                    <path fill="#ffffff" d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.5em'}} className="block font-semibold text-white">Gray T-Shirt</span>
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="block font-semibold text-white">$19.99</span>
                        </div>
                    </div>
                    <div className="items-center flex flex-col overflow-hidden w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#2f8a68_100%)]">
                        <div style={{ aspectRatio: '4 / 5' }} className="relative w-full mx-auto bg-white border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/white-t.png" alt="Product 3" fill className="object-cover" />
                            <button
                                type="button"
                                aria-label="Add White T-Shirt to cart"
                                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1a9e4a] text-white flex items-center justify-center shadow-md hover:bg-[#16432a] transition-colors duration-200 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18">
                                    <path fill="#ffffff" d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.5em'}} className="block font-semibold text-white">White T-Shirt</span>
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="block font-semibold text-white">$19.99</span>
                        </div>
                    </div>
                    <div className="items-center flex flex-col overflow-hidden w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#2f8a68_100%)]">
                        <div style={{ aspectRatio: '4 / 5' }} className="relative w-full mx-auto bg-white border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/black-h.png" alt="Product 4" fill className="object-cover" />
                            <button
                                type="button"
                                aria-label="Add Black Hoodie to cart"
                                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1a9e4a] text-white flex items-center justify-center shadow-md hover:bg-[#16432a] transition-colors duration-200 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18">
                                    <path fill="#ffffff" d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.5em'}} className="block font-semibold text-white">Black Hoodie</span>
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="block font-semibold text-white">$39.99</span>
                        </div>
                    </div>
                    <div className="items-center flex flex-col overflow-hidden w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#2f8a68_100%)]">
                        <div style={{ aspectRatio: '4 / 5' }} className="relative w-full mx-auto bg-white border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/white-h.png" alt="Product 5" fill className="object-cover" />
                            <button
                                type="button"
                                aria-label="Add White Hoodie to cart"
                                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1a9e4a] text-white flex items-center justify-center shadow-md hover:bg-[#16432a] transition-colors duration-200 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18">
                                    <path fill="#ffffff" d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.5em'}} className="block font-semibold text-white">White Hoodie</span>
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="block font-semibold text-white">$39.99</span>
                        </div>
                    </div>
                    <div className="items-center flex flex-col overflow-hidden w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-fit bg-[linear-gradient(to_bottom,white_0%,white_18%,#a9cdb6_45%,#5fa584_68%,#2f8a68_100%)]">
                        <div style={{ aspectRatio: '4 / 5' }} className="relative w-full mx-auto bg-white border-2 border-b-0 border-[#2f8a68]/10 overflow-hidden">
                            <Image src="/gray-h.png" alt="Product 6" fill className="object-cover" />
                            <button
                                type="button"
                                aria-label="Add Gray Hoodie to cart"
                                className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1a9e4a] text-white flex items-center justify-center shadow-md hover:bg-[#16432a] transition-colors duration-200 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="18" height="18">
                                    <path fill="#ffffff" d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="w-full px-4 py-4">
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.5em'}} className="block font-semibold text-white">Gray Hoodie</span>
                            <span style={{fontFamily: "'Hemisphers Bold Sans', monospace", fontSize: '1.25em'}} className="block font-semibold text-white">$39.99</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

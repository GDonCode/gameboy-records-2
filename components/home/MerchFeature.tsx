// components/home/MerchFeature.tsx
// Home page apparel feature: the first four pieces from the live shop catalogue (the same one the Shop page lists),
// each leading to its product page.
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/home/SectionTitle';
import MerchChains from '@/components/home/MerchChains';
import { getCatalog } from '@/lib/catalog';

export default async function MerchFeature() {
  const { products } = await getCatalog();
  // Three shirts only (tees first; if the catalogue has fewer than three tees, the next pieces fill in).
  const withImage = products.filter((p) => p.images[0]);
  const isTee = (name: string) => /\b(tee|t-shirt|shirt)\b/i.test(name);
  const pieces = [...withImage.filter((p) => isTee(p.name)), ...withImage.filter((p) => !isTee(p.name))].slice(0, 3);
  if (pieces.length === 0) return null;
  return (
    <section aria-labelledby="merch-title" className="relative overflow-hidden on-light paper-deep text-ink section-y">
      <div className="container-site max-w-[1560px]">
        <SectionTitle ghost="Merch" id="merch-title">
          Merch
        </SectionTitle>
        <ul inert data-chain-center className="list-none p-0 m-0 mt-10 mx-auto max-w-[1180px] grid grid-cols-3 gap-3 md:gap-8 lg:gap-10">
          {pieces.map((p) => (
            <li key={p.id}>
              <Link href={`/shop/${p.slug}`} aria-label={p.name} className="zoom-media group flex flex-col h-full">
                {/* A recessed well: no border, the edges are shaded as if the tile were cut into the page */}
                <div className="relative aspect-square bg-white">
                  <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 1180px) 380px, 32vw" className="object-contain p-2 md:p-4" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 shadow-[inset_4px_4px_10px_rgba(11,10,7,0.35),inset_-4px_-4px_10px_rgba(11,10,7,0.25)]"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative z-20 mt-12 flex flex-col items-center gap-5 text-center">
          <p className="m-0 max-w-[44ch] text-[0.95rem] md:text-[1.05rem] leading-relaxed">
            The merch is almost here. Sign up to get first access when it drops.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button href="/account/login?mode=register" variant="green" size="lg">
              Sign up
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
      {/* Chained up: lies over the whole section and blocks the pieces; the sign-up block above stays on top. */}
      <MerchChains />
    </section>
  );
}

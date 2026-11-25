// components/home/MerchFeature.tsx
// Home page apparel feature: the first four pieces from the live shop catalogue (the same one the Shop page lists),
// each leading to its product page.
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/home/SectionTitle';
import { getCatalog } from '@/lib/catalog';

export default async function MerchFeature() {
  const { products } = await getCatalog();
  const pieces = products.filter((p) => p.images[0]).slice(0, 4);
  if (pieces.length === 0) return null;
  return (
    <section aria-labelledby="merch-title" className="on-light paper-deep text-ink section-y">
      <div className="container-site max-w-[1560px]">
        <SectionTitle ghost="Merch" id="merch-title">
          Merch
        </SectionTitle>
        <ul className="list-none p-0 m-0 mt-10 grid grid-cols-2 gap-3 md:gap-8 lg:grid-cols-4 lg:gap-10">
          {pieces.map((p) => (
            <li key={p.id}>
              <Link href={`/shop/${p.slug}`} className="zoom-media group flex flex-col gap-3 h-full">
                {/* A recessed well: no border, the edges are shaded as if the tile were cut into the page */}
                <div className="relative aspect-square bg-white">
                  <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 1024px) 24vw, 48vw" className="object-contain p-2 md:p-4" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 shadow-[inset_4px_4px_10px_rgba(11,10,7,0.35),inset_-3px_-3px_8px_rgba(255,255,255,0.7)]"
                  />
                </div>
                <h3 className="m-0 mt-2 text-[0.85rem] md:text-[1rem] font-semibold uppercase tracking-[0.12em]">{p.name}</h3>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <Button href="/shop" variant="green" size="lg">
            Shop all apparel
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

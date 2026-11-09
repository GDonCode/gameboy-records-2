// components/home/MerchFeature.tsx
// Home page apparel feature: four pieces from the catalogue, each leading to its product page.
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/home/SectionTitle';
import { LOCAL_PRODUCTS, isListed } from '@/lib/products';

export default function MerchFeature() {
  const pieces = LOCAL_PRODUCTS.filter(isListed).filter((p) => p.images[0]).slice(0, 4);
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
                <div className="relative aspect-square bg-white border-[3px] border-ink group-hover:shadow-[6px_6px_0_var(--color-green-deep)] transition-shadow duration-200">
                  <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 1024px) 24vw, 48vw" className="object-contain p-2 md:p-4" />
                </div>
                <h3 className="m-0 mt-2 text-[0.85rem] md:text-[1rem] font-semibold uppercase tracking-[0.12em]">{p.name}</h3>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <Button href="/shop" variant="light" size="lg" >
            Shop all apparel
            <Icon name="arrow-right" className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

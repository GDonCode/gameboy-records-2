// components/home/MerchFeature.tsx
// Home page apparel feature: three garments, each leading into its corner of the shop.
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/icons';
import Button from '@/components/ui/Button';

const PIECES = [
  { href: '/shop', name: 'The Tee', line: 'Heavyweight cotton, boxed fit.' },
  { href: '/shop', name: 'The Sweatpants', line: 'Brushed fleece, tapered leg.' },
  { href: '/shop', name: 'The Hoodie', line: 'Dense loopback, dropped shoulder.' },
];

export default function MerchFeature() {
  return (
    <section aria-labelledby="merch-title" className="on-light bg-bone text-ink section-y">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end mb-12 md:mb-16">
          <div className="lg:col-span-7">
            <p className="eyebrow text-green-deep m-0 mb-5">Apparel · The Rise Collection</p>
            <h2 id="merch-title" className="display m-0 text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] max-w-[14ch]">
              Worn by the ones who show up early.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-6">
            <p className="m-0 text-stone leading-relaxed">
              Made in small runs and not restocked once they’re gone. Every piece earns Club Points for members.
            </p>
            <Button href="/shop" variant="primary" size="lg" className="self-start">
              Shop all apparel
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <ul className="list-none p-0 m-0 grid gap-4 md:gap-6 md:grid-cols-3">
          {PIECES.map((piece) => (
            <li key={piece.name}>
              <Link href={piece.href} className="zoom-media group block">
                <div className="relative aspect-[4/5] bg-ink overflow-hidden">
                  {/* This is a placeholder image */}
                  <Image
                    src="/assets/placeholder.jpg"
                    alt={`${piece.name} from the Rise Collection`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-4 pt-5">
                  <div>
                    <h3 className="m-0 text-[1.05rem] font-semibold uppercase tracking-[0.12em]">{piece.name}</h3>
                    <p className="m-0 mt-1 text-[0.9rem] text-stone">{piece.line}</p>
                  </div>
                  <span className="zoom-content mt-1 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-green-deep">
                    <span className="inline-flex items-center gap-2">
                      Shop
                      <Icon name="arrow-right" className="w-3 h-3" />
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

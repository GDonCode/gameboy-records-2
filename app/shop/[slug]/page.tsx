// app/shop/[slug]/page.tsx — Product
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/icons';
import ProductPurchase from '@/components/shop/ProductPurchase';
import { getProductBySlug, getRelatedProducts } from '@/lib/catalog';
import { pointsForOrder } from '@/lib/club';
import { formatPrice } from '@/lib/products';
import { POINTS_NAME, SITE_NAME, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: 'Not found' };
  const description = product.description.split('\n')[0].slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      url: `/shop/${product.slug}`,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: product.images.slice(0, 1).map((src) => ({ url: src, alt: product.name })),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((src) => (src.startsWith('http') ? src : `${SITE_URL}${src}`)),
    description: product.description,
    sku: product.id,
    category: product.categoryLabel,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@id': `${SITE_URL}/#label` },
    },
  };

  return (
    <PageShell>
      <JsonLd data={jsonLd} />
      <div className="on-light bg-bone text-ink">
        <div className="container-site pt-8 pb-16 md:pt-12 md:pb-24">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="list-none p-0 m-0 flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.16em] text-stone">
              <li>
                <Link href="/shop" className="hover:text-ink underline-offset-4 hover:underline">
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span>{product.categoryLabel}</span>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink truncate">
                {product.name}
              </li>
            </ol>
          </nav>

          <ProductPurchase product={product} points={pointsForOrder(product.price)} pointsName={POINTS_NAME} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-ink section-y">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6 mb-10">
              <h2 id="related-title" className="display m-0 text-[1.75rem] md:text-[2.25rem]">
                Wear it with
              </h2>
              <Link href="/shop" className="zoom-content inline-flex text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-paper">
                <span className="inline-flex items-center gap-2">
                  All apparel <Icon name="arrow-right" className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <ul className="list-none p-0 m-0 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} className={related.length === 3 ? 'last:hidden lg:last:block' : ''}>
                  <Link href={`/shop/${r.slug}`} className="zoom-media group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#E2DED2]">
                      <Image src={r.images[0]} alt={r.name} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
                    </div>
                    <p className="m-0 mt-4 text-[0.95rem]">{r.name}</p>
                    <p className="m-0 mt-1 text-[0.85rem] text-mist">{formatPrice(r.price, r.currency)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageShell>
  );
}

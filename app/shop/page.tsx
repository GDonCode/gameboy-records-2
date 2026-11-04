// app/shop/page.tsx — Shop
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import PageShell from '@/components/PageShell';
import NeonHeading from '@/components/NeonHeading';
import ShopFilters from '@/components/shop/ShopFilters';
import ProductGrid from '@/components/shop/ProductGrid';
import ClubPointsInfo from '@/components/shop/ClubPointsInfo';
import JsonLd from '@/components/JsonLd';
import { getCatalog } from '@/lib/catalog';
import { applyShopQuery, facets, parseShopQuery } from '@/lib/shop-filters';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ARTIST, CLUB_NAME, SITE_URL, OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop',
  description: `Limited apparel from Gameboy Records and ${ARTIST}. Tees, hoodies and sweatpants made in small runs. Members earn Club Points on every order.`,
  alternates: { canonical: '/shop' },
  openGraph: { url: '/shop', title: 'Shop | Gameboy Records', images: [OG_IMAGE] },
};

async function memberBalance(): Promise<{ signedIn: boolean; balance: number | null }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || (session.user as { role?: string }).role !== 'user') return { signedIn: false, balance: null };
  const { data } = await supabaseAdmin.from('users').select('points_balance').eq('id', userId).maybeSingle();
  return { signedIn: true, balance: data?.points_balance ?? 0 };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseShopQuery(await searchParams);
  const [catalog, member] = await Promise.all([getCatalog(), memberBalance().catch(() => ({ signedIn: false, balance: null }))]);
  const shown = applyShopQuery(catalog.products, query);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gameboy Records apparel',
    itemListElement: catalog.products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/shop/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <PageShell>
      <JsonLd data={itemList} />
      <section className="bg-ink pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="container-site">
          <NeonHeading kicker="Gameboy Records" subtitle={`The Rise Collection · by ${ARTIST}`}>
            The Shop
          </NeonHeading>
          <p className="mx-auto mt-8 mb-0 max-w-[52ch] text-center text-mist leading-relaxed">
            Small runs, made to last, not restocked once they’re gone. {CLUB_NAME} members hear about every drop first.
          </p>
        </div>
      </section>

      <section aria-label="Products" className="on-light bg-bone text-ink py-10 md:py-16">
        <div className="container-site">
          <ShopFilters query={query} options={facets(catalog.products)} resultCount={shown.length} />

          <div className="mt-10 md:mt-14">
            {catalog.error ? (
              <p className="py-20 text-center text-stone">{catalog.error}</p>
            ) : shown.length === 0 ? (
              <div className="py-20 text-center">
                <p className="m-0 text-[1.1rem]">Nothing in this cut right now.</p>
                <p className="m-0 mt-2 text-stone">New pieces are announced to the {CLUB_NAME} first.</p>
                <Link href="/shop" className="inline-block mt-6 text-[0.8rem] font-semibold uppercase tracking-[0.16em] underline underline-offset-[6px]">
                  View the full collection
                </Link>
              </div>
            ) : (
              <ProductGrid products={shown} />
            )}
          </div>
        </div>
      </section>

      <ClubPointsInfo signedIn={member.signedIn} balance={member.balance} />
    </PageShell>
  );
}

// app/shop/page.tsx — Shop (product grid with a filter sidebar, inside the site frame)
import type { Metadata } from 'next';
import { auth } from '@/auth';
import PageShell from '@/components/PageShell';
import PageTitle from '@/components/PageTitle';
import ProductGrid from '@/components/shop/ProductGrid';
import ClubPointsInfo from '@/components/shop/ClubPointsInfo';
import JsonLd from '@/components/JsonLd';
import { getCatalog } from '@/lib/catalog';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ARTIST, OG_IMAGE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shop',
  description: `Limited apparel from ${ARTIST} and Gameboy Records. Tees and hoodies from the Rise Collection, made in small runs. Members earn Club Points on every order.`,
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

export default async function ShopPage() {
  const [catalog, member] = await Promise.all([getCatalog(), memberBalance().catch(() => ({ signedIn: false, balance: null }))]);
  const { products } = catalog;

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rise Collection',
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/shop/${p.slug}`, name: p.name })),
  };

  return (
    <PageShell>
      <JsonLd data={itemList} />
      <section aria-label="Products" className="on-light paper text-ink">
        <div className="mx-auto w-full max-w-[1180px] px-4 pt-12 pb-16 md:px-8 md:pt-16 md:pb-24">
          <PageTitle ghost="Shop" subtitle={`by ${ARTIST}`} className="mb-10 md:mb-14">
            Rise Collection
          </PageTitle>

          {catalog.error ? (
            <p style={{ fontFamily: "'Poppins', sans-serif" }} className="py-16 text-center text-[15px] text-stone">
              {catalog.error}
            </p>
          ) : products.length === 0 ? (
            <p style={{ fontFamily: "'Poppins', sans-serif" }} className="py-16 text-center text-[15px] text-stone">
              The next drop is on its way. Playaz Club members hear first.
            </p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </section>

      <ClubPointsInfo signedIn={member.signedIn} balance={member.balance} />
    </PageShell>
  );
}

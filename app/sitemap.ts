// app/sitemap.ts — every public page, including each product.
import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/shows`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/music`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/karaoke`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/trivia`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
  const { products } = await getCatalog();
  return [
    ...pages,
    ...products.map((p) => ({ url: `${SITE_URL}/shop/${p.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}

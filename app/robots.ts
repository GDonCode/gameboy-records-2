// app/robots.ts — while SITE_PASSWORD is set (development), search engines are kept out entirely.
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Read SITE_PASSWORD when requested, not when built.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_PASSWORD?.trim()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/account', '/cart', '/unlock'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { NextConfig } from 'next';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : 'ggkhbhwqjlsmushwkgwn.supabase.co';
const wooHost = process.env.WOOCOMMERCE_URL ? new URL(process.env.WOOCOMMERCE_URL).hostname : null;

const nextConfig: NextConfig = {
  // Hostinger (Node.js hosting / VPS): `npm run build` produces a self-contained server in .next/standalone.
  output: 'standalone',
  // Dev only: lets phones on your Wi-Fi load dev assets. Use your PC's IPv4 from `ipconfig`.
  allowedDevOrigins: ['192.168.39.122'],
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // WooCommerce product photos (Tapstitch syncs its mockups into the store's media library).
      ...(wooHost ? [{ protocol: 'https' as const, hostname: wooHost }] : []),
      { protocol: 'https', hostname: '*.wp.com' },
    ],
  },
  async redirects() {
    return [{ source: '/discography', destination: '/music', permanent: true }];
  },
};

export default nextConfig;

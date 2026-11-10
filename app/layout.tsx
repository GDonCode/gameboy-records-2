import type { Metadata, Viewport } from 'next';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import PlayerProvider from '@/components/player/PlayerProvider';
import PlayazClubPopup from '@/components/PlayazClubPopup';
import JsonLd from '@/components/JsonLd';
import { ARTIST, CONTACT_EMAIL, FOUNDER, LOGO_URL, MEDIA_BASE, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL } from '@/lib/site';

const FAVICON_URL = `${MEDIA_BASE}/favicon.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Independent label of ${ARTIST}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['Gameboy Records', 'Alexx A-Game', 'independent record label', 'merch', 'live shows', 'Playaz Club'],
  icons: {
    icon: [{ url: FAVICON_URL, type: 'image/png' }],
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#0B0A07',
  colorScheme: 'dark',
};

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#label`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  email: CONTACT_EMAIL,
  description: SITE_DESCRIPTION,
  founder: { '@type': 'Person', name: FOUNDER },
  sameAs: [SOCIAL.instagram, SOCIAL.youtube, SOCIAL.tiktok],
  contactPoint: { '@type': 'ContactPoint', email: CONTACT_EMAIL, contactType: 'customer support' },
};

const artist = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  '@id': `${SITE_URL}/#artist`,
  name: ARTIST,
  url: SITE_URL,
  recordLabel: { '@id': `${SITE_URL}/#label` },
  sameAs: [SOCIAL.spotify, SOCIAL.appleMusic, SOCIAL.youtube, SOCIAL.audiomack, SOCIAL.soundcloud, SOCIAL.tiktok],
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#label` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins/poppins-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins/poppins-semibold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <JsonLd data={[organization, artist, website]} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SessionProviderWrapper>
          <PlayerProvider>
            {children}
            <PlayazClubPopup />
          </PlayerProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

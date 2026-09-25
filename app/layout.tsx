import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const FAVICON_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/favicon.png`;

export const metadata: Metadata = {
  metadataBase: new URL("https://gameboyrecords.com"),
  title: {
    default: "Gameboy Records",
    template: "%s | Gameboy Records",
  },
  description:
    "Gameboy Records — home of Alexx A-Game. New music, artists, karaoke, merch and news from the label.",
  icons: {
    icon: [{ url: FAVICON_URL, type: "image/png" }],
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  openGraph: {
    title: "Gameboy Records",
    description:
      "Gameboy Records — home of Alexx A-Game. New music, merch and vibes from the label.",
    url: "https://gameboyrecords.com",
    siteName: "Gameboy Records",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
         <link
          rel="preload"
          href="/fonts/Hemisphers_Bold_Sans.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full overflow-hidden flex flex-col">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}

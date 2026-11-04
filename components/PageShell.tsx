// components/PageShell.tsx
// The frame every page sits in: header, the page's <main>, footer.
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PageShell({
  children,
  footer = true,
  className = '',
}: {
  children: ReactNode;
  /** Full-screen experiences (Music, Karaoke) leave the footer out. */
  footer?: boolean;
  className?: string;
}) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className={`flex-1 flex flex-col outline-none ${className}`}>
        {children}
      </main>
      {footer && <Footer />}
    </>
  );
}

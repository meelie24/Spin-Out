import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { AccountSync } from '@/components/AccountSync';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spinitout.com';

const uiFont = Manrope({ subsets:['latin'], variable:'--font-ui', display:'swap' });
const displayFont = Barlow_Condensed({ subsets:['latin'], weight:['500','600','700','800'], variable:'--font-display', display:'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Spin Out',
    template: '%s · Spin Out',
  },
  description: 'A private Reality Run for the moment you are about to gamble.',
  alternates: { canonical: '/' },
  applicationName: 'Spin Out',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon', apple: '/icon' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Spin Out',
    title: 'Spin Out',
    description: 'About to gamble? Run it here first.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Spin Out' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spin Out',
    description: 'About to gamble? Run it here first.',
    images: ['/opengraph-image'],
  },
};

export const viewport: Viewport = {
  themeColor: '#120b09',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${uiFont.variable} ${displayFont.variable}`}>
        <AccountSync />
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Spin Out home"><span className="brand-mark" aria-hidden="true">S</span><span>Spin Out</span></Link>
          <nav aria-label="Main navigation">
            <Link href="/research">Research</Link>
            <Link href="/help">Get help</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

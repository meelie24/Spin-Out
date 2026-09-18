import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spinitout.com'),
  alternates: { canonical: '/' },
  title: 'Spin Out',
  description: 'A private pre-gambling Reality Run built to make leaving feel real before money is on the line.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
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

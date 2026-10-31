import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { PROFILE } from '@/lib/data';
import './globals.css';

const interTight = localFont({
  src: '../fonts/InterTight-Variable.woff2',
  variable: '--font-inter-tight',
  weight: '100 900',
  display: 'swap',
});
const instrumentSerif = localFont({
  src: [
    { path: '../fonts/InstrumentSerif-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/InstrumentSerif-Italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-instrument-serif',
  display: 'swap',
});
const jetbrainsMono = localFont({
  src: '../fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains-mono',
  weight: '100 800',
  display: 'swap',
});

// the address the build is for (https://andre.loomwest.com since 2026-10-07): `NEXT_PUBLIC_SITE_URL=... npm run build`
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const title = `${PROFILE.name} | ${PROFILE.roleLine}`;
const description =
  'Andre Costa, founder and designer of Loomwest in Gilroy, California. Websites for local businesses, quoted on a free call, live in three to seven days.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  // LAUNCHED 2026-10-07 (Andre: "yes take my portfolio off hidden from google once all changes are finished and live"):
  // indexable, with one canonical address that matches public/sitemap.xml; robots.txt allows all and names the sitemap.
  // The canonical and og:url are written in src/app/page.tsx since 2026-10-12 (audit L9): Next printed this one as
  // https://andre.loomwest.com, without the slash the sitemap has.
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: PROFILE.name,
    title,
    description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: "Andre Costa's 3D character standing on a warm white backdrop" }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#f4f2ee',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

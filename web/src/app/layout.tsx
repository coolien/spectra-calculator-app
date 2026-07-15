import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { adsenseConfig } from '@/lib/ads';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spectra',
  description: "Spectra's Malaysia-focused finance planning calculator.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/spectra-brand-v2-favicon.png',
    apple: '/icons/spectra-brand-v2-192.png',
  },
  ...(adsenseConfig.client ? {
    other: { 'google-adsense-account': adsenseConfig.client },
  } : {}),
};

export const viewport: Viewport = {
  themeColor: '#146356',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {adsenseConfig.ready && (
          <Script
            async
            id="spectra-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.client}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

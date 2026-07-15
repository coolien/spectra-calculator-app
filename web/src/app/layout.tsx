import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spectra',
  description: "Spectra's Malaysia-focused finance planning calculator.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/spectra-brand-v2-favicon.png',
    apple: '/icons/spectra-brand-v2-192.png',
  },
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
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spectra Calculator',
  description: "Spectra's Malaysia-focused finance planning calculator.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.png',
    apple: '/icons/Icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#35C79A',
  colorScheme: 'light',
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
      <body>{children}</body>
    </html>
  );
}

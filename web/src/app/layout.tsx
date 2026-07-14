import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spectra',
  description: "Spectra's Malaysia-focused finance planning calculator.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/spectra-ring-favicon.png',
    apple: '/icons/spectra-ring-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#146356',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

const pwaBootstrapScript = `
  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    navigator.serviceWorker.register('/sw.js').then((registration) => registration.update());
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: pwaBootstrapScript }} />
        {children}
      </body>
    </html>
  );
}

import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

/**
 * Server-rendered shell for the crawlable content pages (/learn, /about,
 * /contact). Deliberately plain HTML with no client JavaScript so the text is
 * present in the exported file itself.
 */
export function ContentPage({
  title,
  intro,
  children,
  breadcrumb,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  breadcrumb?: { href: string; label: string };
}) {
  return (
    <div className="content-page">
      <header className="content-masthead">
        <Link href="/" className="content-brand">{SITE_NAME}</Link>
        <nav aria-label="Main">
          <Link href="/learn">Learn</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/" className="content-cta">Open the calculator</Link>
        </nav>
      </header>

      <main className="content-main">
        {breadcrumb && (
          <p className="content-breadcrumb">
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
          </p>
        )}
        <h1>{title}</h1>
        {intro && <p className="content-intro">{intro}</p>}
        {children}
      </main>

      <footer className="content-footer">
        <p>
          Educational only — not financial, legal, tax or Syariah advice. Verify current
          figures with the official source before acting.
        </p>
        <nav aria-label="Legal">
          <Link href="/legal">Privacy &amp; Terms</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}

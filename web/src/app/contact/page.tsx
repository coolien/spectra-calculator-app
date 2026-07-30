import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/content/ContentPage';
import { SITE_URL, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Spectra Calculator',
  description:
    'How to reach Spectra Calculator — corrections to a figure, data deletion requests, and general enquiries.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro="Corrections, data requests and enquiries all reach the same place."
    >
      <section className="content-section">
        <h2>Email</h2>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>

      <section className="content-section">
        <h2>Found a figure that looks wrong?</h2>
        <p>
          Tell us which calculator, what you entered, what it showed, and what you expected —
          and where your figure comes from if you have a source. Rules change with each Budget
          cycle and corrections are welcome. A calculator that quietly gets Malaysian financing
          rules wrong is worse than no calculator.
        </p>
      </section>

      <section className="content-section">
        <h2>Deleting your data</h2>
        <p>
          If you enabled cloud sync you can delete everything held for your account from inside
          the app, or by email. This removes your saved snapshot, your consent record and your
          profile.
        </p>
        <p>
          <Link href="/legal">Privacy notice and terms →</Link>
        </p>
      </section>
    </ContentPage>
  );
}

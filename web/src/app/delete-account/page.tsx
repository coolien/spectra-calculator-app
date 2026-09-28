import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/content/ContentPage';
import { SITE_URL, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Delete your Spectra Calculator account',
  description:
    'How to delete your Spectra Calculator account and the cloud data linked to it, what is removed, and what is kept.',
  alternates: { canonical: `${SITE_URL}/delete-account` },
};

export default function DeleteAccountPage() {
  return (
    <ContentPage
      title="Delete your account"
      intro="Spectra Calculator, by Spectrality Enterprise. You can delete your account and its cloud data at any time."
    >
      <section className="content-section">
        <h2>Delete it in the app</h2>
        <ol>
          <li>Open Spectra Calculator and sign in with the email you used for cloud sync.</li>
          <li>Go to <strong>Settings → Account &amp; cloud sync</strong>.</li>
          <li>Tap <strong>Delete account</strong> and confirm.</li>
        </ol>
        <p>Your account is deleted straight away. You are signed out on every device.</p>
      </section>

      <section className="content-section">
        <h2>Can&apos;t sign in? Ask us by email</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}?subject=Delete%20my%20Spectra%20account`}>{CONTACT_EMAIL}</a>{' '}
          from the address linked to your account, with the subject &ldquo;Delete my Spectra
          account&rdquo;. We delete the account within 30 days and reply to confirm.
        </p>
      </section>

      <section className="content-section">
        <h2>What is deleted</h2>
        <ul>
          <li>Your sign-in account and email address</li>
          <li>Your cloud backup: finance profile, salary profiles, active loans, saved scenarios, calculator drafts and language setting</li>
          <li>Your cloud sync consent record</li>
        </ul>
        <p>Nothing is kept after deletion. There is no extra retention period.</p>
      </section>

      <section className="content-section">
        <h2>What stays on your device</h2>
        <p>
          Spectra is local-first. Figures saved on your phone or browser are not removed by
          deleting the account. Clear them by uninstalling the app or clearing the site data.
          You can use every calculator without an account.
        </p>
        <p>
          Only want to remove the cloud backup and keep the account? Use <strong>Delete cloud
          backup</strong> on the same screen.
        </p>
        <p>
          <Link href="/legal">Privacy notice and terms →</Link>
        </p>
      </section>
    </ContentPage>
  );
}

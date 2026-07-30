import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/content/ContentPage';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Spectra Calculator',
  description:
    'Who publishes Spectra Calculator, how the Malaysian financing figures are calculated, and the limits of what the app can tell you.',
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About Spectra Calculator"
      intro="A Malaysia-focused finance planning tool that answers one question in many forms: can I actually afford this?"
    >
      <section className="content-section">
        <h2>What this is</h2>
        <p>
          Spectra Calculator works out home financing, car hire purchase, personal loans,
          credit card repayment, PTPTN and faraid using the rules that apply in Malaysia —
          not generic loan maths borrowed from elsewhere. Car financing changed on
          1 June 2026, when the Hire-Purchase (Amendment) Act 2026 replaced flat rates and
          the Rule of 78 with effective interest rate on a reducing balance. Agreements
          signed before that date still follow the old rules, so the calculator handles both
          and tells you which one applies to yours.
        </p>
      </section>

      <section className="content-section">
        <h2>How the figures are produced</h2>
        <p>
          Every figure comes from deterministic code with a test suite behind it, not from
          an estimate or a language model. Statutory rules — stamp duty bands, legal fee
          scales, service tax, hire purchase caps, the Rule of 78 early settlement rebate —
          live in a single configuration file so they can be checked and updated in one
          place when the law changes.
        </p>
        <p>
          Where a rate has been verified against a primary source it is used directly. Where
          it has not, it is shown as an estimate rather than presented as fact.
        </p>
      </section>

      <section className="content-section">
        <h2>What this is not</h2>
        <p>
          This is education, not financial advice. It does not recommend a bank, a product
          or a package, and it earns nothing from any lender. Actual bank quotes, solicitor
          invoices, promotions and your own credit standing will differ from any planning
          estimate here. Verify with the official source before you commit to anything.
        </p>
      </section>

      <section className="content-section">
        <h2>Your data</h2>
        <p>
          The calculators work fully offline and without an account. Cloud sync is optional
          and consented — it exists so your profile follows you between devices, not so the
          app can collect anything. Spectra never asks for your NRIC, bank account number,
          card number, OTP, payslip or loan documents, and you should never enter them.
        </p>
        <p>
          <Link href="/legal">Read the privacy notice and terms →</Link>
        </p>
      </section>
    </ContentPage>
  );
}

import { ScreenHeading } from '@/components/ui/Controls';

export function LegalScreen() {
  return (
    <div className="standard-screen legal-screen">
      <ScreenHeading title="Legal & privacy" subtitle="Clear limits, plain language and no surprises." />
      <details open><summary>Calculator disclaimer</summary><p>Spectra provides planning estimates, not financial, legal, tax, Syariah, or investment advice. Confirm all figures with the relevant bank, authority, adviser, or court.</p></details>
      <details><summary>Terms of use</summary><p>Use the app for personal planning. Results can differ from official offers because providers use their own rules, fees, rounding, and eligibility checks.</p></details>
      <details><summary>How data is handled</summary><p>Cloud sync will use your Spectra account. Do not enter NRIC, OTPs, card numbers, passwords from other services, or official documents into calculator fields.</p></details>
    </div>
  );
}

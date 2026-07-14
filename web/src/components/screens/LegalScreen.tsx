import { ScreenHeading } from '@/components/ui/Controls';

export function LegalScreen() {
  return (
    <div className="standard-screen legal-screen">
      <ScreenHeading title="Legal & privacy" subtitle="Clear limits, plain language and no surprises." />
      <details open><summary>Calculator disclaimer</summary><p>Spectra provides planning estimates, not financial, legal, tax, Syariah, or investment advice. Confirm all figures with the relevant bank, authority, adviser, or court.</p></details>
      <details><summary>Terms of use</summary><p>Use Spectra for lawful personal planning. Results can differ from official offers because providers use their own rules, fees, rounding, and eligibility checks. You remain responsible for decisions made using these estimates.</p></details>
      <details><summary>Privacy notice</summary><p>Spectrality Enterprise operates Spectra. Your profile, calculator entries, app preferences, and saved scenarios currently stay in this browser using local storage and are not yet synced to Spectra's cloud. Website infrastructure and font providers may process basic technical request data, such as IP address and device information, to deliver and secure the service. Clearing this site's browser data removes the local copy. Do not enter NRIC, OTPs, card details, passwords, or official documents.</p></details>
      <details><summary>Notis privasi</summary><p>Spectrality Enterprise mengendalikan Spectra. Profil, input kalkulator, pilihan aplikasi dan senario tersimpan kini disimpan dalam pelayar ini dan belum diselaraskan ke awan Spectra. Penyedia infrastruktur laman dan fon mungkin memproses data permintaan teknikal asas seperti alamat IP dan maklumat peranti untuk menyediakan dan melindungi perkhidmatan. Memadam data laman dalam pelayar akan memadam salinan tempatan.</p></details>
      <details><summary>Changes and consent</summary><p>Your acceptance is saved on this device with the notice version and date. If these terms or data practices materially change, Spectra can ask you to review and agree again.</p></details>
      <a className="legal-site-link" href="https://spectramsia.com/" target="_blank" rel="noreferrer">Visit the Spectra website</a>
    </div>
  );
}

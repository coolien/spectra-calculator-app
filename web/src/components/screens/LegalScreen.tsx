import { ScreenHeading } from '@/components/ui/Controls';

export function LegalScreen() {
  return (
    <div className="standard-screen legal-screen">
      <ScreenHeading title="Legal & privacy" subtitle="Clear limits, plain language and no surprises." />
      <details open><summary>Calculator disclaimer</summary><p>Spectra provides planning estimates, not financial, legal, tax, Syariah, or investment advice. Confirm all figures with the relevant bank, authority, adviser, or court.</p></details>
      <details><summary>Terms of use</summary><p>Use Spectra for lawful personal planning. Results can differ from official offers because providers use their own rules, fees, rounding, and eligibility checks. You remain responsible for decisions made using these estimates.</p></details>
      <details><summary>Privacy notice</summary><p>Spectrality Enterprise operates Spectra. Your profile, calculator entries, app preferences, saved scenarios, and active-loan records stay in this browser unless you choose account sign-in. With cloud sync enabled, this data is stored in Spectra's Supabase project so it can be restored on your devices. Website infrastructure, authentication, database, and font providers may process email, IP address, device information, and service logs to deliver and secure the app. You can delete the cloud backup from Account & cloud sync. Clearing browser site data removes the local copy. Do not enter NRIC, OTPs, card details, passwords, or official documents.</p></details>
      <details><summary>Notis privasi</summary><p>Spectrality Enterprise mengendalikan Spectra. Profil, input kalkulator, pilihan aplikasi, senario tersimpan dan rekod pinjaman aktif kekal dalam pelayar ini melainkan anda memilih log masuk akaun. Apabila penyelarasan awan diaktifkan, data ini disimpan dalam projek Supabase Spectra supaya ia boleh dipulihkan pada peranti anda. Penyedia laman, pengesahan, pangkalan data dan fon mungkin memproses e-mel, alamat IP, maklumat peranti dan log perkhidmatan. Anda boleh memadam sandaran awan melalui Akaun & penyelarasan awan.</p></details>
      <details><summary>Changes and consent</summary><p>Your acceptance is saved on this device with the notice version and date. If these terms or data practices materially change, Spectra can ask you to review and agree again.</p></details>
      <a className="legal-site-link" href="https://spectramsia.com/" target="_blank" rel="noreferrer">Visit the Spectra website</a>
    </div>
  );
}

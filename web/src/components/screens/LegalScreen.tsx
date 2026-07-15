import { ScreenHeading } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function LegalScreen() {
  const { t } = useI18n();
  return (
    <div className="standard-screen legal-screen">
      <ScreenHeading title="Legal & privacy" subtitle="Clear limits, plain language and no surprises." />
      <details open><summary>{t('Calculator disclaimer')}</summary><p>{t('Spectra provides planning estimates, not financial, legal, tax, Syariah, or investment advice. Confirm all figures with the relevant bank, authority, adviser, or court.')}</p></details>
      <details><summary>{t('Terms of use')}</summary><p>{t('Use Spectra for lawful personal planning. Results can differ from official offers because providers use their own rules, fees, rounding, and eligibility checks. You remain responsible for decisions made using these estimates.')}</p></details>
      <details><summary>{t('Privacy notice')}</summary><p>{t("Spectrality Enterprise operates Spectra. Your profile, calculator entries, app preferences, saved scenarios, and active-loan records stay in this browser unless you choose account sign-in. With cloud sync enabled, this data is stored in Spectra's Supabase project so it can be restored on your devices. Website infrastructure, authentication, database, and font providers may process email, IP address, device information, and service logs to deliver and secure the app. You can delete the cloud backup from Account & cloud sync. Clearing browser site data removes the local copy. Do not enter NRIC, OTPs, card details, passwords, or official documents.")}</p></details>
      <details><summary>{t('Advertising')}</summary><p>{t('When advertising is enabled, Google AdSense and its partners may use cookies, local storage, device information, IP address, and interaction data to select, deliver, measure, and protect ads. Where required, Spectra will use a Google-certified consent platform before ad storage or personalized advertising.')}</p><a className="legal-inline-link" href="https://business.safety.google/privacy/ads-and-data/" target="_blank" rel="noreferrer">{t("How Google uses advertising data")}</a></details>
      <details><summary>{t('Changes and consent')}</summary><p>{t('Your acceptance is saved on this device with the notice version and date. If these terms or data practices materially change, Spectra can ask you to review and agree again.')}</p></details>
      <a className="legal-site-link" href="https://spectramsia.com/" target="_blank" rel="noreferrer">{t('Visit the Spectra website')}</a>
    </div>
  );
}

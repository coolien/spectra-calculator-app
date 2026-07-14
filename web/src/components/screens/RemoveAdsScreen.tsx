import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function RemoveAdsScreen() {
  const { t } = useI18n();
  return (
    <div className="standard-screen">
      <ScreenHeading title="Remove ads" subtitle="Ads help keep Spectra free - you can go ad-free anytime." />
      <section className="remove-ads-card">
        <Sparkles size={26} />
        <span>{t('Planned one-time price')}</span>
        <strong>RM 88.88</strong>
        <p>{t('No banners, no interstitials, forever. Calculators and results stay exactly the same.')}</p>
        <div><Check size={17} />{t('One purchase for this account')}</div>
        <button type="button" onClick={() => window.alert(t('RM88.88 is a preview price for now. Payment is not enabled yet.'))}>{t('Remove ads')} - RM88.88</button>
      </section>
      <button className="restore-purchase" type="button" onClick={() => window.alert(t('There are no purchases to restore yet.'))}><RotateCcw size={17} />{t('Restore purchase')}</button>
    </div>
  );
}

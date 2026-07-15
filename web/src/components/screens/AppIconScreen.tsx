import { ScreenHeading } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';
import { BrandRingLogo } from '@/components/ui/RingLogo';

export function AppIconScreen() {
  const { t } = useI18n();
  return (
    <div className="standard-screen">
      <ScreenHeading title="App icon" subtitle="Spectra's rainbow ring is the app icon on every device." />
      <div className="brand-icon-preview"><BrandRingLogo size={132} /></div>
      <p className="detail-footnote">{t('Theme colours only change the interface. The Spectra logo stays the same.')}</p>
    </div>
  );
}

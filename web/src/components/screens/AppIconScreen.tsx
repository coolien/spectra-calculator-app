import { ScreenHeading, ThemeSwatchGrid } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function AppIconScreen() {
  const { t } = useI18n();
  return (
    <div className="standard-screen">
      <ScreenHeading title="App icon" subtitle="The same Spectra ring, in your chosen theme colour." />
      <ThemeSwatchGrid />
      <p className="detail-footnote">{t('Your app icon colour and in-app accent are one shared setting.')}</p>
    </div>
  );
}

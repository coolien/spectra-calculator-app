import { CircleUserRound, Cloud, Languages, Palette, Scale, Shield, Sparkles } from 'lucide-react';
import { SegmentedControl, ThemeSwatchGrid, ScreenHeading } from '@/components/ui/Controls';
import { useTheme } from '@/components/app-shell/ThemeProvider';
import { SettingsGroup, SettingsRow } from '@/components/screens/ScreenParts';
import type { Language } from '@/lib/i18n';
import { languageName } from '@/lib/i18n';
import { BrandRingLogo } from '@/components/ui/RingLogo';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function SettingsScreen({ language, hasProfile, accountStatus, onOpen }: {
  language: Language;
  hasProfile: boolean;
  accountStatus: string;
  onOpen: (screen: 'profile' | 'account' | 'language' | 'legal' | 'remove-ads' | 'app-icon') => void;
}) {
  const { mode, setMode, accent, scrim, setScrim } = useTheme();
  const { t } = useI18n();
  return (
    <div className="standard-screen settings-screen">
      <ScreenHeading title="Settings" subtitle="Just the essentials - one screen, no rabbit holes." />

      <SettingsGroup title={t('Appearance')}>
        <div className="appearance-panel">
          <SegmentedControl
            value={mode}
            options={[{ value: 'light', label: t('Light') }, { value: 'dark', label: t('Dark') }]}
            onChange={(value) => setMode(value === 'dark' ? 'dark' : 'light')}
            ariaLabel={t('Appearance')}
          />
          <button className="app-icon-preview" type="button" onClick={() => onOpen('app-icon')}>
            <span><BrandRingLogo size={42} /></span>
            <span><strong>{t('App icon')}</strong><small>{t('Rainbow ring')}</small></span>
          </button>
          <label className="slider-field">
            <span><strong>{t('Card background darkness')}</strong><b>{Math.round(scrim * 100)}%</b></span>
            <input type="range" min="0" max="70" value={Math.round(scrim * 100)} onChange={(event) => setScrim(Number(event.target.value) / 100)} />
          </label>
          <div className="theme-panel-title"><strong>{t('Theme colour')}</strong><span>{t(accent.label)}</span></div>
          <ThemeSwatchGrid compact />
        </div>
      </SettingsGroup>

      <SettingsGroup title={t('Account')}>
        <SettingsRow icon={<CircleUserRound size={19} />} label={t('Personal profile')} value={t(hasProfile ? 'Set up' : 'Not set')} onClick={() => onOpen('profile')} />
        <SettingsRow icon={<Cloud size={19} />} label={t('Account & cloud sync')} value={t(accountStatus === 'synced' ? 'Synced' : accountStatus === 'syncing' ? 'Syncing' : accountStatus === 'error' ? 'Needs attention' : accountStatus)} onClick={() => onOpen('account')} />
        <SettingsRow icon={<Languages size={19} />} label={t('Language')} value={languageName(language)} onClick={() => onOpen('language')} />
      </SettingsGroup>

      <SettingsGroup title={t('More')}>
        <SettingsRow icon={<Shield size={19} />} label={t('Legal & privacy')} value={t('Terms and data')} onClick={() => onOpen('legal')} />
        <SettingsRow icon={<Sparkles size={19} />} label={t('Remove ads')} action={t('Go ad-free')} onClick={() => onOpen('remove-ads')} />
        <SettingsRow icon={<Scale size={19} />} label={t('About Spectra')} value="spectramsia.com" href="https://spectramsia.com/" />
      </SettingsGroup>
      <footer className="settings-footer">{t('Developed by Spectrality Enterprise')}</footer>
    </div>
  );
}

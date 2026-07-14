import { CircleUserRound, Cloud, Languages, Palette, Scale, Shield, Sparkles } from 'lucide-react';
import { SegmentedControl, ThemeSwatchGrid, ScreenHeading } from '@/components/ui/Controls';
import { useTheme } from '@/components/app-shell/ThemeProvider';
import { SettingsGroup, SettingsRow } from '@/components/screens/ScreenParts';
import type { Language } from '@/lib/i18n';
import { languageName } from '@/lib/i18n';
import { RingLogo } from '@/components/ui/RingLogo';

export function SettingsScreen({ language, hasProfile, onOpen }: {
  language: Language;
  hasProfile: boolean;
  onOpen: (screen: 'profile' | 'account' | 'language' | 'legal' | 'remove-ads' | 'app-icon') => void;
}) {
  const { mode, setMode, accent, scrim, setScrim } = useTheme();
  return (
    <div className="standard-screen settings-screen">
      <ScreenHeading title="Settings" subtitle="Just the essentials — one screen, no rabbit holes." />

      <SettingsGroup title="Appearance">
        <div className="appearance-panel">
          <SegmentedControl
            value={mode}
            options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            onChange={(value) => setMode(value === 'dark' ? 'dark' : 'light')}
            ariaLabel="Appearance"
          />
          <button className="app-icon-preview" type="button" onClick={() => onOpen('app-icon')}>
            <span><RingLogo stops={accent.stops} size={42} /></span>
            <span><strong>App icon</strong><small>{accent.label}</small></span>
          </button>
          <label className="slider-field">
            <span><strong>Card background darkness</strong><b>{Math.round(scrim * 100)}%</b></span>
            <input type="range" min="0" max="70" value={Math.round(scrim * 100)} onChange={(event) => setScrim(Number(event.target.value) / 100)} />
          </label>
          <div className="theme-panel-title"><strong>Theme colour</strong><span>{accent.label}</span></div>
          <ThemeSwatchGrid compact />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Account">
        <SettingsRow icon={<CircleUserRound size={19} />} label="Personal profile" value={hasProfile ? 'Set up' : 'Not set'} onClick={() => onOpen('profile')} />
        <SettingsRow icon={<Cloud size={19} />} label="Account & cloud sync" value="Not signed in" onClick={() => onOpen('account')} />
        <SettingsRow icon={<Languages size={19} />} label="Language" value={languageName(language)} onClick={() => onOpen('language')} />
      </SettingsGroup>

      <SettingsGroup title="More">
        <SettingsRow icon={<Shield size={19} />} label="Legal & privacy" value="Terms and data" onClick={() => onOpen('legal')} />
        <SettingsRow icon={<Sparkles size={19} />} label="Remove ads" action="Go ad-free" onClick={() => onOpen('remove-ads')} />
        <SettingsRow icon={<Scale size={19} />} label="About Spectra" value="Official release" />
      </SettingsGroup>
      <footer className="settings-footer">Developed by Spectrality Enterprise</footer>
    </div>
  );
}

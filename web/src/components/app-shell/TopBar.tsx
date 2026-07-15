import { UserRound } from 'lucide-react';
import { BrandRingLogo } from '@/components/ui/RingLogo';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function TopBar({ isProfileOpen, onProfileToggle }: { isProfileOpen: boolean; onProfileToggle: () => void }) {
  const { t } = useI18n();
  return (
    <header className="top-bar">
      <div className="brand-lockup" aria-label="Spectra">
        <BrandRingLogo />
        <span>Spectra</span>
      </div>
      <div className="top-bar-slot top-bar-slot-right">
        <button
          className="icon-button"
          type="button"
          aria-label={t(isProfileOpen ? 'Go to home' : 'Open personal profile')}
          onClick={onProfileToggle}
        >
          <UserRound size={18} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

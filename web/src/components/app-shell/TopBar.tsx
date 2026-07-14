import { UserRound } from 'lucide-react';
import { RingLogo } from '@/components/ui/RingLogo';
import { useTheme } from '@/components/app-shell/ThemeProvider';

export function TopBar({ isProfileOpen, onProfileToggle }: { isProfileOpen: boolean; onProfileToggle: () => void }) {
  const { accent } = useTheme();
  return (
    <header className="top-bar">
      <div className="brand-lockup" aria-label="Spectra">
        <RingLogo stops={accent.stops} />
        <span>Spectra</span>
      </div>
      <div className="top-bar-slot top-bar-slot-right">
        <button
          className="icon-button"
          type="button"
          aria-label={isProfileOpen ? 'Go to home' : 'Open personal profile'}
          onClick={onProfileToggle}
        >
          <UserRound size={18} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

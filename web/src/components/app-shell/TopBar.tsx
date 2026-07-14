import { ChevronLeft, UserRound } from 'lucide-react';
import { RingLogo } from '@/components/ui/RingLogo';
import { useTheme } from '@/components/app-shell/ThemeProvider';

export function TopBar({ hasBack, onBack, onProfile }: { hasBack: boolean; onBack: () => void; onProfile: () => void }) {
  const { accent } = useTheme();
  return (
    <header className="top-bar">
      <div className="top-bar-slot">
        {hasBack && (
          <button className="icon-button" type="button" aria-label="Go back" onClick={onBack}>
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}
      </div>
      <div className="brand-lockup" aria-label="Spectra">
        <RingLogo stops={accent.stops} />
        <span>Spectra</span>
      </div>
      <div className="top-bar-slot top-bar-slot-right">
        <button className="icon-button" type="button" aria-label="Open personal profile" onClick={onProfile}>
          <UserRound size={18} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

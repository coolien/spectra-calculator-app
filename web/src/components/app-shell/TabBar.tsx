import { Bookmark, Calculator, Home, Settings } from 'lucide-react';
import type { TabKey } from '@/lib/app-model';

const tabs = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'calculators', label: 'Calculators', icon: Calculator },
  { key: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

export function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          className={active === key ? 'tab-item is-active' : 'tab-item'}
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={active === key ? 'page' : undefined}
        >
          <Icon size={21} strokeWidth={2.2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

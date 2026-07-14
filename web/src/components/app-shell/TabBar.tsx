import { Bookmark, Calculator, Home, Settings } from 'lucide-react';
import type { TabKey } from '@/lib/app-model';
import { useI18n } from '@/components/app-shell/I18nProvider';

const tabs = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'calculators', label: 'Calculators', icon: Calculator },
  { key: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

export function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  const { t } = useI18n();
  return (
    <nav className="tab-bar" aria-label={t('Main navigation')}>
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          className={active === key ? 'tab-item is-active' : 'tab-item'}
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={active === key ? 'page' : undefined}
        >
          <Icon size={21} strokeWidth={2.2} />
          <span>{t(label)}</span>
        </button>
      ))}
    </nav>
  );
}

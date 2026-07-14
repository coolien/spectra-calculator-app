import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  return <section className="settings-group">{title && <h2>{title}</h2>}<div className="settings-card">{children}</div></section>;
}

export function SettingsRow({ icon, label, value, action, onClick }: {
  icon: ReactNode; label: string; value?: string; action?: string; onClick?: () => void;
}) {
  return (
    <button className="settings-row" type="button" onClick={onClick}>
      <span className="settings-icon">{icon}</span>
      <span className="settings-label">{label}</span>
      {(action || value) && <span className={action ? 'settings-value is-action' : 'settings-value'}>{action ?? value}</span>}
      <ChevronRight size={17} />
    </button>
  );
}

import { ChevronRight, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  return <section className="settings-group">{title && <h2>{title}</h2>}<div className="settings-card">{children}</div></section>;
}

export function SettingsRow({ icon, label, value, action, onClick, href }: {
  icon: ReactNode; label: string; value?: string; action?: string; onClick?: () => void; href?: string;
}) {
  const content = (
    <>
      <span className="settings-icon">{icon}</span>
      <span className="settings-copy">
        <span className="settings-label">{label}</span>
        {(action || value) && <span className={action ? 'settings-value is-action' : 'settings-value'}>{action ?? value}</span>}
      </span>
      {href ? <ExternalLink size={16} /> : <ChevronRight size={17} />}
    </>
  );

  if (href) {
    return <a className="settings-row" href={href} target="_blank" rel="noreferrer">{content}</a>;
  }

  return (
    <button className="settings-row" type="button" onClick={onClick}>
      {content}
    </button>
  );
}

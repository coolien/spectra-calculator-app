'use client';

import { Info, X } from 'lucide-react';
import { useState } from 'react';
import config from '@/lib/finance/malaysia-2026-config.json' with { type: 'json' };

export function GlobalDisclaimer() {
  const [expanded, setExpanded] = useState(false);
  return (
    <aside className={expanded ? 'global-disclaimer is-expanded' : 'global-disclaimer'} aria-label="Global planning disclaimer">
      <div className="global-disclaimer-line">
        <Info size={15} aria-hidden="true" />
        <p>{config.disclaimer.short}</p>
        <button type="button" className="global-disclaimer-button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? <X size={15} aria-hidden="true" /> : <span>Why?</span>}
        </button>
      </div>
      {expanded && <p className="global-disclaimer-full">{config.disclaimer.full}</p>}
    </aside>
  );
}

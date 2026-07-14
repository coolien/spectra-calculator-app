import { Bookmark, RotateCcw } from 'lucide-react';

export function StickyResultBar({
  primaryLabel, primaryValue, secondaryLabel, secondaryValue, saved, error,
  onSave, onReset, onCalculate, calculated,
}: {
  primaryLabel: string; primaryValue: string; secondaryLabel: string; secondaryValue: string;
  saved: boolean; error?: string; calculated: boolean;
  onSave: () => void; onReset: () => void; onCalculate: () => void;
}) {
  return (
    <div className="sticky-result-bar">
      {error ? <div className="result-error">{error}</div> : (
        <div className="result-totals">
          <div><span>{primaryLabel}</span><strong>{primaryValue}</strong></div>
          <div><span>{secondaryLabel}</span><strong>{secondaryValue}</strong></div>
        </div>
      )}
      <div className="result-actions">
        <button className={saved ? 'icon-action is-saved' : 'icon-action'} type="button" onClick={onSave} aria-label="Save result" disabled={Boolean(error)}>
          <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button className="icon-action" type="button" onClick={onReset} aria-label="Reset calculator"><RotateCcw size={19} /></button>
        <button className="primary-action" type="button" onClick={onCalculate} disabled={Boolean(error)}>
          {calculated ? 'Recalculate' : 'Calculate'}
        </button>
      </div>
    </div>
  );
}

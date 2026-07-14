import { CheckCircle2 } from 'lucide-react';
import { formatMyr, formatPercent } from '@/lib/calculators';
import type { CalculatorOutcome } from '@/lib/app-model';
import { MetricCard } from '@/components/ui/Controls';

export function CalculatorResult({ result }: { result: CalculatorOutcome }) {
  return (
    <section className="full-result" aria-label="Full calculation breakdown">
      <div className="result-summary-card">
        <span>{result.title}</span>
        <strong>{result.primaryValue}</strong>
        <p>{result.subtitle}</p>
      </div>

      <div className="metric-grid">
        {result.metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      {result.rows && (
        <section className="breakdown-card">
          <h2>Breakdown</h2>
          {result.rows.map((row) => (
            <div className="breakdown-row" key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>
          ))}
        </section>
      )}

      {'shares' in result && (
        <section className="breakdown-card share-breakdown">
          <h2>Estimated Faraid shares</h2>
          {result.shares.map((share) => (
            <div className="share-row" key={share.heir}>
              <div><strong>{share.count > 1 ? `${share.heir} (${share.count})` : share.heir}</strong><p>{share.rule}</p></div>
              <div><strong>{formatPercent(share.sharePercent)}</strong><span>{formatMyr(share.amount)}</span></div>
            </div>
          ))}
        </section>
      )}

      <section className="notes-card">
        <h2>Planning notes</h2>
        {result.notes.map((note) => <p key={note}><CheckCircle2 size={16} />{note}</p>)}
      </section>
    </section>
  );
}

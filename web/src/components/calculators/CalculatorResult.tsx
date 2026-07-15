import { CheckCircle2, FileDown } from 'lucide-react';
import { formatMyr, formatPercent } from '@/lib/calculators';
import type { CalculatorOutcome } from '@/lib/app-model';
import { MetricCard } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';
import { BrandRingLogo } from '@/components/ui/RingLogo';

export function CalculatorResult({
  result, calculatorTitle, generatedDate, onExportPdf,
}: {
  result: CalculatorOutcome;
  calculatorTitle: string;
  generatedDate: string;
  onExportPdf: () => void;
}) {
  const { t } = useI18n();
  return (
    <section className="full-result print-report" aria-label={t('Full calculation breakdown')}>
      <header className="print-report-header">
        <div className="print-report-brand"><BrandRingLogo size={32} /><strong>Spectra</strong></div>
        <div><h1>{t(calculatorTitle)}</h1><p>{t('Generated on {date}', { date: generatedDate })}</p></div>
      </header>

      <button className="result-export-action" type="button" onClick={onExportPdf}>
        <FileDown size={18} /><span>{t('Save as PDF')}</span>
      </button>

      <div className="result-summary-card">
        <span>{t(result.title)}</span>
        <strong>{result.primaryValue}</strong>
        <p>{t(result.subtitle)}</p>
      </div>

      <div className="metric-grid">
        {result.metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      {result.rows && (
        <section className="breakdown-card">
          <h2>{t('Breakdown')}</h2>
          {result.rows.map((row) => (
            <div className="breakdown-row" key={row.label}><span>{t(row.label)}</span><strong>{row.value}</strong></div>
          ))}
        </section>
      )}

      {'shares' in result && (
        <section className="breakdown-card share-breakdown">
          <h2>{t('Estimated Faraid shares')}</h2>
          {result.shares.map((share) => (
            <div className="share-row" key={share.heir}>
              <div><strong>{share.count > 1 ? `${t(share.heir)} (${share.count})` : t(share.heir)}</strong><p>{t(share.rule)}</p></div>
              <div><strong>{formatPercent(share.sharePercent)}</strong><span>{formatMyr(share.amount)}</span></div>
            </div>
          ))}
        </section>
      )}

      <section className="notes-card">
        <h2>{t('Planning notes')}</h2>
        {result.notes.map((note) => <p key={note}><CheckCircle2 size={16} />{t(note)}</p>)}
      </section>

      <footer className="print-report-footer">
        {t('Planning estimate only - verify with official sources before making a decision.')}
      </footer>
    </section>
  );
}

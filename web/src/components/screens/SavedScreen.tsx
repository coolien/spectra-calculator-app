'use client';

import { useMemo, useState } from 'react';
import { Check, Circle, Landmark, Plus, Scale, Trash2, X } from 'lucide-react';
import type { SalaryProfile, SavedScenario } from '@/lib/app-model';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { ScreenHeading } from '@/components/ui/Controls';
import { formatRinggit } from '@/lib/profile-math';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function SavedScreen({ salaryProfiles, scenarios, onAddSalary, onTrackScenario, onOpenActiveLoans, onDeleteScenario }: {
  salaryProfiles: SalaryProfile[];
  scenarios: SavedScenario[];
  onAddSalary: () => void;
  onTrackScenario: (scenario: SavedScenario) => void;
  onOpenActiveLoans: () => void;
  onDeleteScenario: (id: string) => void;
}) {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const selectedScenarios = useMemo(
    () => scenarios.filter((scenario) => selectedIds.includes(scenario.id) && scenario.comparison),
    [scenarios, selectedIds],
  );

  function toggleScenario(scenario: SavedScenario) {
    if (!scenario.comparison) return;
    setComparisonOpen(false);
    setSelectedIds((current) => {
      if (current.includes(scenario.id)) return current.filter((id) => id !== scenario.id);
      if (current.length >= 3) return current;
      return [...current, scenario.id];
    });
  }

  function deleteScenario(id: string) {
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    setComparisonOpen(false);
    onDeleteScenario(id);
  }

  return (
    <div className="standard-screen">
      <ScreenHeading title="Saved" subtitle="Compare scenarios side by side before you decide." />

      <section className="saved-section">
        <div className="section-title-row"><h2>{t('Salary profiles')}</h2><button type="button" onClick={onAddSalary}>+ {t('Add')} ({salaryProfiles.length}/15)</button></div>
        <p className="section-explainer">{t('Name and save income scenarios for family members or clients. These stay separate from your personal profile.')}</p>
        <div className="salary-scroll">
          {salaryProfiles.map((profile) => (
            <article className="salary-card" key={profile.id}>
              <strong>{profile.name}</strong>
              <div><span>{t('Take-home')}</span><b>{formatRinggit(profile.takeHome)}</b></div>
              <div><span>{t('Max loan installment')}</span><b>{formatRinggit(profile.maxInstallment)}/{t('mo')}</b></div>
            </article>
          ))}
          <button className="new-salary-card" type="button" onClick={onAddSalary} disabled={salaryProfiles.length >= 15}>
            <Plus size={22} /><span>{t(salaryProfiles.length >= 15 ? 'Limit reached' : 'New profile')}</span>
          </button>
        </div>
      </section>

      <section className="saved-section">
        <div className="section-title-row">
          <h2>{t('Loan scenarios')}</h2>
          {selectedIds.length > 0 && <span className="selection-count">{t('{count}/3 selected', { count: selectedIds.length })}</span>}
        </div>
        {scenarios.length === 0 ? (
          <div className="empty-state"><p>{t('No saved calculations yet.')}</p><span>{t('Use the bookmark button in any calculator to keep a result here.')}</span></div>
        ) : (
          <div className="scenario-list">
            {scenarios.map((scenario) => {
              const selected = selectedIds.includes(scenario.id);
              return (
                <article className={selected ? 'is-selected' : undefined} key={scenario.id}>
                  <span className={`calculator-icon icon-${scenario.calculator}`}><CalculatorIcon calculator={scenario.calculator} size={19} /></span>
                  <span>
                    <strong>{scenario.label}</strong>
                    <small>{scenario.result} - saved {scenario.savedAt}</small>
                    {!scenario.comparison && <small className="comparison-unavailable">{t('Re-save this result to compare it')}</small>}
                  </span>
                  <button
                    className="scenario-select"
                    type="button"
                    aria-label={t(selected ? 'Remove {name} from comparison' : 'Select {name} for comparison', { name: scenario.label })}
                    aria-pressed={selected}
                    disabled={!scenario.comparison || (!selected && selectedIds.length >= 3)}
                    title={t(!scenario.comparison ? 'Re-save this calculation to unlock comparison' : 'Select for comparison')}
                    onClick={() => toggleScenario(scenario)}
                  >
                    {selected ? <Check size={17} /> : <Circle size={17} />}
                  </button>
                  <button type="button" aria-label={t('Track {name} as an active loan', { name: scenario.label })} title={t('Track active loan')} disabled={!scenario.comparison || scenario.calculator === 'faraid'} onClick={() => onTrackScenario(scenario)}><Landmark size={17} /></button>
                  <button type="button" aria-label={t('Delete {name}', { name: scenario.label })} title={t('Delete scenario')} onClick={() => deleteScenario(scenario.id)}><Trash2 size={17} /></button>
                </article>
              );
            })}
          </div>
        )}
        {comparisonOpen && selectedScenarios.length >= 2 && (
          <ScenarioComparison scenarios={selectedScenarios} onClose={() => setComparisonOpen(false)} />
        )}
        <button className="secondary-action compare-action" type="button" disabled={selectedScenarios.length < 2} onClick={() => setComparisonOpen(true)}>
          <Scale size={17} /> {t('Compare selected')}
        </button>
        <button className="secondary-action compare-action" type="button" onClick={onOpenActiveLoans}>
          <Landmark size={17} /> {t('View active loans')}
        </button>
      </section>
    </div>
  );
}

function ScenarioComparison({ scenarios, onClose }: { scenarios: SavedScenario[]; onClose: () => void }) {
  const { t } = useI18n();
  const metrics = [
    { label: 'Monthly payment', value: (scenario: SavedScenario) => formatRinggit(scenario.comparison!.monthlyPayment) },
    { label: 'Total repayment', value: (scenario: SavedScenario) => formatRinggit(scenario.comparison!.totalRepayment) },
    { label: 'Upfront cash', value: (scenario: SavedScenario) => formatRinggit(scenario.comparison!.upfrontCash) },
    { label: 'Timeline', value: (scenario: SavedScenario) => t(formatDuration(scenario.comparison!.durationMonths)) },
  ];

  return (
    <section className="comparison-panel" aria-label={t('Scenario comparison')}>
      <div className="comparison-heading">
        <div><Scale size={18} /><h3>{t('Side-by-side')}</h3></div>
        <button type="button" aria-label={t('Close comparison')} title={t('Close comparison')} onClick={onClose}><X size={18} /></button>
      </div>
      <p>{t('Compare scenarios with similar amounts and goals. Lower cost alone does not make a product suitable.')}</p>
      <div className="comparison-scroll">
        <div className="comparison-grid" style={{ gridTemplateColumns: `112px repeat(${scenarios.length}, minmax(138px, 1fr))` }}>
          <div className="comparison-corner">{t('Metric')}</div>
          {scenarios.map((scenario) => <div className="comparison-name" key={scenario.id}>{scenario.label}<small>{scenario.savedAt}</small></div>)}
          {metrics.flatMap((metric) => [
            <div className="comparison-label" key={`${metric.label}-label`}>{t(metric.label)}</div>,
            ...scenarios.map((scenario) => <div className="comparison-value" key={`${metric.label}-${scenario.id}`}>{metric.value(scenario)}</div>),
          ])}
        </div>
      </div>
    </section>
  );
}

function formatDuration(months: number | null) {
  if (!months) return 'Not cleared';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} mo`;
  return remainingMonths === 0 ? `${years} yr` : `${years} yr ${remainingMonths} mo`;
}

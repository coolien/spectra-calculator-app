import { Plus, Trash2 } from 'lucide-react';
import type { SalaryProfile, SavedScenario } from '@/lib/app-model';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { ScreenHeading } from '@/components/ui/Controls';
import { formatRinggit } from '@/lib/profile-math';

export function SavedScreen({ salaryProfiles, scenarios, onAddSalary, onDeleteScenario }: {
  salaryProfiles: SalaryProfile[];
  scenarios: SavedScenario[];
  onAddSalary: () => void;
  onDeleteScenario: (id: string) => void;
}) {
  return (
    <div className="standard-screen">
      <ScreenHeading title="Saved" subtitle="Compare scenarios side by side before you decide." />

      <section className="saved-section">
        <div className="section-title-row"><h2>Salary profiles</h2><button type="button" onClick={onAddSalary}>+ Add ({salaryProfiles.length}/15)</button></div>
        <p className="section-explainer">Name and save income scenarios for family members or clients. These stay separate from your personal profile.</p>
        <div className="salary-scroll">
          {salaryProfiles.map((profile) => (
            <article className="salary-card" key={profile.id}>
              <strong>{profile.name}</strong>
              <div><span>Take-home</span><b>{formatRinggit(profile.takeHome)}</b></div>
              <div><span>Max loan installment</span><b>{formatRinggit(profile.maxInstallment)}/mo</b></div>
            </article>
          ))}
          <button className="new-salary-card" type="button" onClick={onAddSalary} disabled={salaryProfiles.length >= 15}>
            <Plus size={22} /><span>{salaryProfiles.length >= 15 ? 'Limit reached' : 'New profile'}</span>
          </button>
        </div>
      </section>

      <section className="saved-section">
        <h2>Loan scenarios</h2>
        {scenarios.length === 0 ? (
          <div className="empty-state"><p>No saved calculations yet.</p><span>Use the bookmark button in any calculator to keep a result here.</span></div>
        ) : (
          <div className="scenario-list">
            {scenarios.map((scenario) => (
              <article key={scenario.id}>
                <span className={`calculator-icon icon-${scenario.calculator}`}><CalculatorIcon calculator={scenario.calculator} size={19} /></span>
                <span><strong>{scenario.label}</strong><small>{scenario.result} · saved {scenario.savedAt}</small></span>
                <button type="button" aria-label={`Delete ${scenario.label}`} onClick={() => onDeleteScenario(scenario.id)}><Trash2 size={17} /></button>
              </article>
            ))}
          </div>
        )}
        <button className="secondary-action" type="button" disabled={scenarios.length < 2}>Compare selected</button>
      </section>
    </div>
  );
}

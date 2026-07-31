'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { AccordionCard, ScreenHeading } from '@/components/ui/Controls';
import type { PersonalProfile } from '@/lib/app-model';
import { formatRinggit, profileMetrics } from '@/lib/profile-math';
import { useI18n } from '@/components/app-shell/I18nProvider';
import { financialHealthScore, financingContext, profileUpgradeSuggestions, type UserProfile } from '@/lib/finance/profile-engine';

export const defaultPersonalProfile: PersonalProfile = {
  grossSalary: '5000', epfRate: '11', socsoMonthly: '29.75', eisMonthly: '11.90', tax: '120', livingExpenses: '1500', commitments: '500', targetDsr: '40', age: '30', citizenship: 'citizen', financingPreference: 'either', isMuslim: false, ownsResidentialProperty: false, propertiesOwned: '0', otherIncome: '0', creditCardLimit: '0', creditCardBalance: '0', emergencyFundMonths: '1', epfBalance: '0', monthlySavings: '0', savingsGoal: '0', hasLifeOrTakaful: false, hasMedicalCard: false, hasMortgageCover: false, ctosBand: 'fair', recentLatePayments12m: '0',
};

export function PersonalProfileScreen({ profile, onSave }: { profile: PersonalProfile | null; onSave: (profile: PersonalProfile) => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState<PersonalProfile>({ ...defaultPersonalProfile, ...(profile ?? {}) });
  const [open, setOpen] = useState<string[]>(['identity', 'income']);
  const [saved, setSaved] = useState(false);
  const metrics = profileMetrics(form);
  const engineProfile = toEngineProfile(form);
  const health = financialHealthScore(engineProfile);
  const suggestions = profileUpgradeSuggestions(engineProfile).slice(0, 2);
  const context = financingContext(engineProfile);

  function update(key: keyof PersonalProfile, value: string | boolean | undefined) {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  }
  function toggle(id: string) { setOpen((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return (
    <div className="profile-screen">
      <div className="screen-scroll profile-scroll">
        <ScreenHeading title="Personal profile" subtitle="Set it once — every calculator can use it to check what fits your budget." />
        <AccordionCard number={1} title="Identity & financing" summary={`${form.citizenship === 'foreign' ? 'Foreign' : form.citizenship === 'pr' ? 'PR' : 'Citizen'} · ${context.resolved === 'islamic' ? 'Islamic' : 'Conventional'}`} open={open.includes('identity')} onToggle={() => toggle('identity')}>
          <div className="field-grid">
            <ProfileField label="Age" suffix="years" value={form.age ?? ''} onChange={(value) => update('age', value)} />
            <ProfileField label="Properties owned" value={form.propertiesOwned ?? ''} onChange={(value) => update('propertiesOwned', value)} />
            <ChoiceField label="Citizenship" value={form.citizenship ?? 'citizen'} options={[['citizen', 'Citizen'], ['pr', 'PR'], ['foreign', 'Foreign']]} onChange={(value) => update('citizenship', value as PersonalProfile['citizenship'])} />
            <ChoiceField label="Financing preference" full value={form.financingPreference ?? 'either'} options={[['islamic', 'Islamic'], ['conventional', 'Conventional'], ['either', 'Either']]} onChange={(value) => update('financingPreference', value as PersonalProfile['financingPreference'])} />
            <ToggleField label="Muslim" value={Boolean(form.isMuslim)} onChange={(value) => update('isMuslim', value)} />
            <ToggleField full label="Already own a residential property" value={Boolean(form.ownsResidentialProperty)} onChange={(value) => update('ownsResidentialProperty', value)} />
          </div>
          <p className="field-helper">Current context: {context.products.home}; {context.products.rateLabel}; settlement uses {context.products.settlementRebate}.</p>
        </AccordionCard>
        <AccordionCard number={2} title="Income & deductions" summary={formatRinggit(metrics.gross)} open={open.includes('income')} onToggle={() => toggle('income')}>
          <div className="field-grid">
            <ProfileField label="Gross monthly salary" prefix="RM" value={form.grossSalary} onChange={(value) => update('grossSalary', value)} full />
            <ProfileField label="Other monthly income" prefix="RM" value={form.otherIncome ?? ''} onChange={(value) => update('otherIncome', value)} />
            <ProfileField label="EPF rate" suffix="%" value={form.epfRate} onChange={(value) => update('epfRate', value)} />
            <ProfileField label="SOCSO / month" prefix="RM" value={form.socsoMonthly} onChange={(value) => update('socsoMonthly', value)} />
            <ProfileField label="EIS / month" prefix="RM" value={form.eisMonthly} onChange={(value) => update('eisMonthly', value)} />
            <ProfileField label="PCB / tax" prefix="RM" value={form.tax} onChange={(value) => update('tax', value)} />
          </div>
          <p className="step-description">SOCSO and EIS are estimated automatically for this planning view.</p>
        </AccordionCard>
        <AccordionCard number={3} title="Cashflow plan" summary={`${form.targetDsr}% DSR`} open={open.includes('cashflow')} onToggle={() => toggle('cashflow')}>
          <div className="field-grid">
            <ProfileField label="Living expenses" prefix="RM" value={form.livingExpenses} onChange={(value) => update('livingExpenses', value)} />
            <ProfileField label="Existing commitments" prefix="RM" value={form.commitments} onChange={(value) => update('commitments', value)} />
            <ProfileField label="Target DSR" suffix="%" value={form.targetDsr} onChange={(value) => update('targetDsr', value)} full />
            <ProfileField label="Emergency fund" suffix="months" value={form.emergencyFundMonths ?? ''} onChange={(value) => update('emergencyFundMonths', value)} />
            <ProfileField label="Monthly savings" prefix="RM" value={form.monthlySavings ?? ''} onChange={(value) => update('monthlySavings', value)} />
            <ProfileField label="Savings goal" prefix="RM" value={form.savingsGoal ?? ''} onChange={(value) => update('savingsGoal', value)} />
          </div>
        </AccordionCard>
        <AccordionCard number={4} title="Credit & protection" summary={form.ctosBand === 'excellent' ? 'Strong' : 'Review'} optional open={open.includes('protection')} onToggle={() => toggle('protection')}>
          <div className="field-grid">
            <ProfileField label="Credit-card limit" prefix="RM" value={form.creditCardLimit ?? ''} onChange={(value) => update('creditCardLimit', value)} />
            <ProfileField label="Card balance" prefix="RM" value={form.creditCardBalance ?? ''} onChange={(value) => update('creditCardBalance', value)} />
            <ChoiceField label="CTOS band" full value={form.ctosBand ?? 'fair'} options={[['excellent', 'Excellent'], ['good', 'Good'], ['fair', 'Fair'], ['needs-work', 'Needs work']]} onChange={(value) => update('ctosBand', value as PersonalProfile['ctosBand'])} />
            <ProfileField label="Late payments (12m)" value={form.recentLatePayments12m ?? ''} onChange={(value) => update('recentLatePayments12m', value)} />
            <ProfileField label="EPF balance" prefix="RM" value={form.epfBalance ?? ''} onChange={(value) => update('epfBalance', value)} />
            <ToggleField full label="Life / takaful cover" value={Boolean(form.hasLifeOrTakaful)} onChange={(value) => update('hasLifeOrTakaful', value)} />
            <ToggleField full label="Medical card" value={Boolean(form.hasMedicalCard)} onChange={(value) => update('hasMedicalCard', value)} />
            <ToggleField full label="Mortgage cover" value={Boolean(form.hasMortgageCover)} onChange={(value) => update('hasMortgageCover', value)} />
          </div>
        </AccordionCard>
        <section className="health-card" aria-label="Financial health">
          <div className="health-card-heading"><div><span className="snapshot-label">Financial health</span><strong>{Math.round(health.overall)} / 100</strong><p>{health.band} · net DSR {Math.round(health.dsrNet)}%</p></div><div className="health-score-ring" style={{ '--score': `${health.overall * 3.6}deg` } as CSSProperties}><span>{Math.round(health.overall)}</span></div></div>
          <div className="health-pillars">{health.pillars.map((pillar) => <div key={pillar.key}><span>{pillar.key === 'debtHealth' ? 'Debt health' : pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}</span><div><i style={{ width: `${pillar.score}%` }} /></div><b>{Math.round(pillar.score)}</b></div>)}</div>
          {suggestions.length > 0 && <div className="health-suggestions"><strong>Next best upgrades</strong>{suggestions.map((suggestion) => <p key={suggestion.pillar}>{suggestion.action}</p>)}</div>}
        </section>
        <AccordionCard number={5} title="Investment view" summary="Not configured" optional open={open.includes('investment')} onToggle={() => toggle('investment')}>
          <p className="step-description">For rental or income-producing assets. Cashflow estimates are not investment advice.</p>
          <div className="empty-inline">{t('Investment income fields will arrive with property scenario comparison.')}</div>
        </AccordionCard>
      </div>
      <div className="profile-sticky">
        <div className="result-totals"><div><span>{t('Take-home pay')}</span><strong>{formatRinggit(metrics.takeHome)}</strong></div><div><span>{t('Room left')}</span><strong>{formatRinggit(metrics.roomLeft)}</strong></div></div>
        <button className="primary-action full" type="button" onClick={() => { onSave(form); setSaved(true); }}>{t(saved ? 'Profile saved' : 'Save profile')}</button>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, prefix, suffix, full }: { label: string; value: string; onChange: (value: string) => void; prefix?: string; suffix?: string; full?: boolean }) {
  return <label className={full ? 'field-wrap is-full' : 'field-wrap'}><span className="field-label">{label}</span><span className="input-shell">{prefix && <span>{prefix}</span>}<input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />{suffix && <span>{suffix}</span>}</span></label>;
}

function ChoiceField({ label, value, options, onChange, full }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void; full?: boolean }) {
  return <div className={full ? 'field-wrap is-full' : 'field-wrap'}><span className="field-label">{label}</span><div className="segmented-control">{options.map(([option, text]) => <button key={option} type="button" className={value === option ? 'is-selected' : ''} onClick={() => onChange(option)}>{text}</button>)}</div></div>;
}

function ToggleField({ label, value, onChange, full }: { label: string; value: boolean; onChange: (value: boolean) => void; full?: boolean }) {
  return <button className={full ? 'toggle-row is-full' : 'toggle-row'} type="button" onClick={() => onChange(!value)}><span>{label}</span><span className={value ? 'toggle-track is-on' : 'toggle-track'}><span /></span></button>;
}

function toEngineProfile(form: PersonalProfile): UserProfile {
  const numeric = (value: string | undefined) => { const parsed = Number(String(value ?? '').replaceAll(',', '').replaceAll('RM', '').trim()); return Number.isFinite(parsed) ? parsed : 0; };
  return { age: numeric(form.age), citizenship: form.citizenship, financingPreference: form.financingPreference, isMuslim: form.isMuslim, ownsResidentialProperty: form.ownsResidentialProperty, propertiesOwned: numeric(form.propertiesOwned), grossMonthlySalary: numeric(form.grossSalary), otherMonthlyIncome: numeric(form.otherIncome), epfEmployeeRate: numeric(form.epfRate), socsoMonthly: numeric(form.socsoMonthly), eisMonthly: numeric(form.eisMonthly), monthlyTax: numeric(form.tax), existingMonthlyCommitments: numeric(form.commitments), creditCardTotalLimit: numeric(form.creditCardLimit), creditCardBalance: numeric(form.creditCardBalance), emergencyFundMonths: numeric(form.emergencyFundMonths), epfBalance: numeric(form.epfBalance), monthlySavings: numeric(form.monthlySavings), monthlyExpenses: numeric(form.livingExpenses), hasLifeOrTakaful: form.hasLifeOrTakaful, hasMedicalCard: form.hasMedicalCard, hasMortgageCover: form.hasMortgageCover, ctosBand: form.ctosBand, recentLatePayments12m: numeric(form.recentLatePayments12m), targetDsrPercent: numeric(form.targetDsr), savingsGoal: numeric(form.savingsGoal) };
}

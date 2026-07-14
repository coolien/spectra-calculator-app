'use client';

import { useState } from 'react';
import { AccordionCard } from '@/components/ui/Controls';
import type { PersonalProfile } from '@/lib/app-model';
import { formatRinggit, profileMetrics } from '@/lib/profile-math';
import { ScreenHeading } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';

export const defaultPersonalProfile: PersonalProfile = {
  grossSalary: '5000', epfRate: '11', tax: '120', livingExpenses: '1500', commitments: '500', targetDsr: '40',
};

export function PersonalProfileScreen({ profile, onSave }: {
  profile: PersonalProfile | null;
  onSave: (profile: PersonalProfile) => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<PersonalProfile>(profile ?? defaultPersonalProfile);
  const [open, setOpen] = useState<string[]>(['income']);
  const [saved, setSaved] = useState(false);
  const metrics = profileMetrics(form);

  function update(key: keyof PersonalProfile, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggle(id: string) {
    setOpen((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="profile-screen">
      <div className="screen-scroll profile-scroll">
        <ScreenHeading title="Personal profile" subtitle="Set it once - every calculator can use it to check what fits your budget." />
        <AccordionCard number={1} title="Income & deductions" summary={formatRinggit(metrics.gross)} open={open.includes('income')} onToggle={() => toggle('income')}>
          <div className="field-grid">
            <ProfileField label="Gross monthly salary" prefix="RM" value={form.grossSalary} onChange={(value) => update('grossSalary', value)} full />
            <ProfileField label="EPF rate" suffix="%" value={form.epfRate} onChange={(value) => update('epfRate', value)} />
            <ProfileField label="PCB / tax" prefix="RM" value={form.tax} onChange={(value) => update('tax', value)} />
          </div>
          <p className="step-description">{t('SOCSO and EIS are estimated automatically for this planning view.')}</p>
        </AccordionCard>
        <AccordionCard number={2} title="Cashflow plan" summary={`${form.targetDsr}% DSR`} open={open.includes('cashflow')} onToggle={() => toggle('cashflow')}>
          <div className="field-grid">
            <ProfileField label="Living expenses" prefix="RM" value={form.livingExpenses} onChange={(value) => update('livingExpenses', value)} />
            <ProfileField label="Existing commitments" prefix="RM" value={form.commitments} onChange={(value) => update('commitments', value)} />
            <ProfileField label="Target DSR" suffix="%" value={form.targetDsr} onChange={(value) => update('targetDsr', value)} full />
          </div>
        </AccordionCard>
        <AccordionCard number={3} title="Investment view" summary="Not configured" optional open={open.includes('investment')} onToggle={() => toggle('investment')}>
          <p className="step-description">{t('For rental or income-producing assets. Cashflow estimates are not investment advice.')}</p>
          <div className="empty-inline">{t('Investment income fields will arrive with property scenario comparison.')}</div>
        </AccordionCard>
      </div>
      <div className="profile-sticky">
        <div className="result-totals">
          <div><span>{t('Take-home pay')}</span><strong>{formatRinggit(metrics.takeHome)}</strong></div>
          <div><span>{t('Room left')}</span><strong>{formatRinggit(metrics.roomLeft)}</strong></div>
        </div>
        <button className="primary-action full" type="button" onClick={() => { onSave(form); setSaved(true); }}>{t(saved ? 'Profile saved' : 'Save profile')}</button>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, prefix, suffix, full }: {
  label: string; value: string; onChange: (value: string) => void; prefix?: string; suffix?: string; full?: boolean;
}) {
  const { t } = useI18n();
  return (
    <label className={full ? 'field-wrap is-full' : 'field-wrap'}>
      <span className="field-label">{t(label)}</span>
      <span className="input-shell">{prefix && <span>{prefix}</span>}<input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />{suffix && <span>{suffix}</span>}</span>
    </label>
  );
}

'use client';

import { useState } from 'react';
import type { SalaryProfile } from '@/lib/app-model';
import { numeric } from '@/lib/profile-math';
import { ScreenHeading, SegmentedControl } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function AddSalaryProfileScreen({ count, onSave }: { count: number; onSave: (profile: SalaryProfile) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [salary, setSalary] = useState('5000');
  const [commitments, setCommitments] = useState('0');
  const [targetDsr, setTargetDsr] = useState('40');
  const [error, setError] = useState('');

  function save() {
    if (count >= 15) return setError(t('You have reached the 15-profile limit.'));
    if (!name.trim()) return setError(t('Add a profile name first.'));
    if (numeric(salary) <= 0) return setError(t('Gross salary must be above RM 0.'));
    const gross = numeric(salary);
    const takeHome = Math.max(0, gross - gross * 0.1165);
    const maxInstallment = Math.max(0, gross * numeric(targetDsr) / 100 - numeric(commitments));
    onSave({
      id: `salary-${Date.now()}`,
      name: name.trim(), label, grossSalary: gross, commitments: numeric(commitments),
      targetDsr: numeric(targetDsr), takeHome, maxInstallment,
    });
  }

  return (
    <div className="profile-screen">
      <div className="screen-scroll profile-scroll">
        <ScreenHeading title="New salary profile" subtitle={t('{count} of 15 slots used - name it for a family member or client.', { count })} />
        <label className="simple-field"><span>{t('Profile name')}</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('e.g. Wife, Mum, Client - Aiman')} /></label>
        <div className="simple-field"><span>{t('Quick label (optional)')}</span><SegmentedControl value={label} onChange={setLabel} ariaLabel={t('Quick label')} options={[
          { value: 'spouse', label: 'Spouse' }, { value: 'child', label: 'Child' },
          { value: 'parent', label: 'Parent' }, { value: 'client', label: 'Client' },
        ]} /></div>
        <label className="simple-field"><span>{t('Gross monthly salary')}</span><span className="input-shell"><span>RM</span><input inputMode="decimal" value={salary} onChange={(event) => setSalary(event.target.value)} /></span></label>
        <div className="field-grid">
          <label className="field-wrap"><span className="field-label">{t('Existing commitments')}</span><span className="input-shell"><span>RM</span><input inputMode="decimal" value={commitments} onChange={(event) => setCommitments(event.target.value)} /></span></label>
          <label className="field-wrap"><span className="field-label">{t('Target DSR')}</span><span className="input-shell"><input inputMode="decimal" value={targetDsr} onChange={(event) => setTargetDsr(event.target.value)} /><span>%</span></span></label>
        </div>
        {error && <p className="form-message is-error" role="alert">{error}</p>}
      </div>
      <div className="profile-sticky"><button className="primary-action full" type="button" onClick={save} disabled={count >= 15}>{t('Save profile')}</button></div>
    </div>
  );
}

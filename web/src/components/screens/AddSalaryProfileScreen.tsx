'use client';

import { useState } from 'react';
import type { SalaryProfile } from '@/lib/app-model';
import { numeric } from '@/lib/profile-math';
import { ScreenHeading, SegmentedControl } from '@/components/ui/Controls';

export function AddSalaryProfileScreen({ count, onSave }: { count: number; onSave: (profile: SalaryProfile) => void }) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [salary, setSalary] = useState('5000');
  const [commitments, setCommitments] = useState('0');
  const [targetDsr, setTargetDsr] = useState('40');
  const [error, setError] = useState('');

  function save() {
    if (count >= 15) return setError('You have reached the 15-profile limit.');
    if (!name.trim()) return setError('Add a profile name first.');
    if (numeric(salary) <= 0) return setError('Gross salary must be above RM 0.');
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
        <ScreenHeading title="New salary profile" subtitle={`${count} of 15 slots used — name it for a family member or client.`} />
        <label className="simple-field"><span>Profile name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Wife, Mum, Client — Aiman" /></label>
        <div className="simple-field"><span>Quick label (optional)</span><SegmentedControl value={label} onChange={setLabel} ariaLabel="Quick label" options={[
          { value: 'spouse', label: 'Spouse' }, { value: 'child', label: 'Child' },
          { value: 'parent', label: 'Parent' }, { value: 'client', label: 'Client' },
        ]} /></div>
        <label className="simple-field"><span>Gross monthly salary</span><span className="input-shell"><span>RM</span><input inputMode="decimal" value={salary} onChange={(event) => setSalary(event.target.value)} /></span></label>
        <div className="field-grid">
          <label className="field-wrap"><span className="field-label">Existing commitments</span><span className="input-shell"><span>RM</span><input inputMode="decimal" value={commitments} onChange={(event) => setCommitments(event.target.value)} /></span></label>
          <label className="field-wrap"><span className="field-label">Target DSR</span><span className="input-shell"><input inputMode="decimal" value={targetDsr} onChange={(event) => setTargetDsr(event.target.value)} /><span>%</span></span></label>
        </div>
        {error && <p className="form-message is-error" role="alert">{error}</p>}
      </div>
      <div className="profile-sticky"><button className="primary-action full" type="button" onClick={save} disabled={count >= 15}>Save profile</button></div>
    </div>
  );
}

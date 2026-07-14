'use client';

import { useState } from 'react';
import { Cloud, ShieldCheck } from 'lucide-react';
import { ScreenHeading, SegmentedControl } from '@/components/ui/Controls';

export function AccountScreen() {
  const [mode, setMode] = useState('signin');
  const [message, setMessage] = useState('');
  return (
    <div className="standard-screen">
      <ScreenHeading title="Account & cloud sync" subtitle="One free account keeps your profile and scenarios backed up everywhere." />
      <form className="auth-card" onSubmit={(event) => { event.preventDefault(); setMessage('Cloud sign-in is being connected. Your details were not sent.'); }}>
        <div className="auth-title"><span><Cloud size={21} /></span><strong>Sign in to Spectra</strong></div>
        <SegmentedControl
          value={mode}
          options={[{ value: 'signin', label: 'Sign in' }, { value: 'create', label: 'Create account' }]}
          onChange={setMode}
          ariaLabel="Account action"
        />
        <label className="simple-field"><span>Email</span><input type="email" autoComplete="email" placeholder="you@example.com" required /></label>
        <label className="simple-field"><span>Password</span><input type="password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} placeholder="At least 8 characters" minLength={8} required /></label>
        <button className="primary-action full" type="submit">Continue</button>
        {message && <p className="form-message" role="status">{message}</p>}
      </form>
      <section className="why-account">
        <span><ShieldCheck size={20} /></span>
        <div><h2>Why an account?</h2><p>Spectra is free to use. Cloud sync protects your profile if you change devices and supports future calculator improvements.</p><strong>Never enter NRIC, card numbers, OTPs, or official loan documents.</strong></div>
      </section>
    </div>
  );
}

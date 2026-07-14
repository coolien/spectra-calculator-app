'use client';

import { useState } from 'react';
import { Check, Cloud, CloudOff, Download, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';
import type { useCloudSync } from '@/hooks/useCloudSync';

type CloudController = ReturnType<typeof useCloudSync>;

export function AccountScreen({ cloud }: { cloud: CloudController }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setLocalMessage('');
    try {
      await action();
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const message = localMessage || cloud.message;

  return (
    <div className="standard-screen">
      <ScreenHeading title="Account & cloud sync" subtitle="One free account keeps your profile, loans, and scenarios backed up everywhere." />
      {!cloud.configured ? (
        <section className="auth-card cloud-unavailable">
          <div className="auth-title"><span><CloudOff size={21} /></span><strong>Cloud setup pending</strong></div>
          <p>The app remains local and fully usable while the secure cloud connection is configured.</p>
        </section>
      ) : cloud.session ? (
        <section className="auth-card">
          <div className="auth-title"><span><Cloud size={21} /></span><div><strong>Cloud sync is on</strong><small>{cloud.session.user.email}</small></div></div>
          <div className={`cloud-status is-${cloud.syncState}`}>
            {cloud.syncState === 'syncing' ? <RefreshCw className="is-spinning" size={18} /> : <Check size={18} />}
            <span><strong>{cloud.syncState === 'syncing' ? 'Syncing changes' : 'Protected in your account'}</strong><small>{cloud.lastSyncedAt ? `Last synced ${formatSyncTime(cloud.lastSyncedAt)}` : 'Preparing first backup'}</small></span>
          </div>
          <button className="primary-action full" type="button" disabled={busy || cloud.syncState === 'syncing'} onClick={() => run(cloud.syncNow)}><RefreshCw size={17} />Sync now</button>
          <button className="secondary-action" type="button" disabled={busy} onClick={() => run(cloud.signOut)}>Sign out</button>
          <button className="danger-action" type="button" disabled={busy} onClick={() => {
            if (window.confirm('Delete the cloud backup? Data on this device will stay here.')) void run(cloud.removeCloudData);
          }}><Trash2 size={16} />Delete cloud backup</button>
          {message && <p className={cloud.syncState === 'error' || localMessage ? 'form-message is-error' : 'form-message'} role="status">{message}</p>}
        </section>
      ) : (
        <form className="auth-card" onSubmit={(event) => { event.preventDefault(); void run(() => cloud.sendMagicLink(email)); }}>
          <div className="auth-title"><span><Cloud size={21} /></span><strong>Sign in to Spectra</strong></div>
          <p className="auth-explainer">Enter your email and we will send a secure sign-in link. No password needed.</p>
          <label className="simple-field"><span>Email</span><input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <button className="primary-action full" type="submit" disabled={busy}>{busy ? 'Sending link...' : 'Email me a sign-in link'}</button>
          {message && <p className={localMessage ? 'form-message is-error' : 'form-message'} role="status">{message}</p>}
        </form>
      )}
      <section className="why-account">
        <span><ShieldCheck size={20} /></span>
        <div><h2>Local first, cloud when you choose</h2><p>Spectra works without an account. Signing in backs up your profile, active loans, and saved scenarios so another device can restore them.</p><strong>Never enter NRIC, card numbers, OTPs, or official loan documents.</strong></div>
      </section>
      <button className="secondary-action account-export" type="button" onClick={cloud.exportData}><Download size={17} />Export my Spectra data</button>
    </div>
  );
}

function formatSyncTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

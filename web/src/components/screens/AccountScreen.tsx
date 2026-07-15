'use client';

import { useRef, useState } from 'react';
import { Check, Cloud, CloudOff, Download, RefreshCw, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';
import type { useCloudSync } from '@/hooks/useCloudSync';
import { useI18n } from '@/components/app-shell/I18nProvider';

type CloudController = ReturnType<typeof useCloudSync>;

export function AccountScreen({ cloud }: { cloud: CloudController }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [localMessage, setLocalMessage] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setLocalMessage('');
    try {
      await action();
    } catch (error) {
      setLocalMessage(t(error instanceof Error ? error.message : 'Something went wrong. Please try again.'));
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
          <div className="auth-title"><span><CloudOff size={21} /></span><strong>{t('Cloud setup pending')}</strong></div>
          <p>{t('The app remains local and fully usable while the secure cloud connection is configured.')}</p>
        </section>
      ) : cloud.session ? (
        <section className="auth-card">
          <div className="auth-title"><span><Cloud size={21} /></span><div><strong>{t('Cloud sync is on')}</strong><small>{cloud.session.user.email}</small></div></div>
          <div className={`cloud-status is-${cloud.syncState}`}>
            {cloud.syncState === 'syncing' ? <RefreshCw className="is-spinning" size={18} /> : <Check size={18} />}
            <span><strong>{t(cloud.syncState === 'syncing' ? 'Syncing changes' : 'Protected in your account')}</strong><small>{cloud.lastSyncedAt ? t('Last synced {time}', { time: formatSyncTime(cloud.lastSyncedAt) }) : t('Preparing first backup')}</small></span>
          </div>
          <button className="primary-action full" type="button" disabled={busy || cloud.syncState === 'syncing'} onClick={() => run(cloud.syncNow)}><RefreshCw size={17} />{t('Sync now')}</button>
          <button className="secondary-action" type="button" disabled={busy} onClick={() => run(cloud.signOut)}>{t('Sign out')}</button>
          <button className="danger-action" type="button" disabled={busy} onClick={() => {
            if (window.confirm(t('Delete the cloud backup? Data on this device will stay here.'))) void run(cloud.removeCloudData);
          }}><Trash2 size={16} />{t('Delete cloud backup')}</button>
          {message && <p className={cloud.syncState === 'error' || localMessage ? 'form-message is-error' : 'form-message'} role="status">{t(message)}</p>}
        </section>
      ) : (
        <form className="auth-card" onSubmit={(event) => { event.preventDefault(); void run(() => cloud.sendMagicLink(email)); }}>
          <div className="auth-title"><span><Cloud size={21} /></span><strong>{t('Sign in to Spectra')}</strong></div>
          <p className="auth-explainer">{t('Enter your email and we will send a secure sign-in link. No password needed.')}</p>
          <label className="simple-field"><span>{t('Email')}</span><input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <button className="primary-action full" type="submit" disabled={busy}>{t(busy ? 'Sending link...' : 'Email me a sign-in link')}</button>
          {message && <p className={localMessage ? 'form-message is-error' : 'form-message'} role="status">{t(message)}</p>}
        </form>
      )}
      <section className="why-account">
        <span><ShieldCheck size={20} /></span>
        <div><h2>{t('Local first, cloud when you choose')}</h2><p>{t('Spectra works without an account. Signing in backs up your profile, active loans, and saved scenarios so another device can restore them.')}</p><strong>{t('Never enter NRIC, card numbers, OTPs, or official loan documents.')}</strong></div>
      </section>
      <div className="account-data-actions">
        <button className="secondary-action account-export" type="button" onClick={cloud.exportData}><Download size={17} />{t('Export my Spectra data')}</button>
        <button className="secondary-action account-export" type="button" disabled={busy} onClick={() => importInputRef.current?.click()}><Upload size={17} />{t('Restore Spectra backup')}</button>
        <input
          ref={importInputRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          aria-label={t('Select Spectra backup file')}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file || !window.confirm(t('Restore this backup? It will replace the Spectra data on this device.'))) return;
            void run(() => cloud.importData(file));
          }}
        />
      </div>
    </div>
  );
}

function formatSyncTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

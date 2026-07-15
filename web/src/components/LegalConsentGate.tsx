'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { RingLogo } from '@/components/ui/RingLogo';
import { useTheme } from '@/components/app-shell/ThemeProvider';
import { useI18n } from '@/components/app-shell/I18nProvider';

export const LEGAL_CONSENT_KEY = 'spectra_legal_consent';
export const LEGAL_CONSENT_VERSION = '2026-07-14-cloud-v2';

export function LegalConsentGate({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const { accent } = useTheme();
  const { t } = useI18n();

  return (
    <div className="consent-backdrop" role="presentation">
      <section className="consent-dialog" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div className="consent-brand"><RingLogo stops={accent.stops} size={44} /><span>Spectra</span></div>
        <div className="consent-heading">
          <span><ShieldCheck size={20} /></span>
          <div>
            <h1 id="consent-title">{t('Before you continue')}</h1>
            <p>{t('A quick check before we start')}</p>
          </div>
        </div>

        <div className="consent-copy">
          <div>
            <strong>{t('Terms of use')}</strong>
            <p>{t('Spectra provides planning estimates only, not financial, legal, tax, Syariah, or investment advice. Results may differ from official decisions and offers.')}</p>
          </div>
          <div>
            <strong>{t('Privacy notice')}</strong>
            <p>{t("Your data stays in this browser unless you choose to sign in. When cloud sync is enabled, your profile, saved scenarios, and active-loan records are sent to Spectra's Supabase account storage. Service providers also process technical logs needed to deliver and secure the website.")}</p>
          </div>
        </div>

        <label className="consent-check">
          <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
          <span>{t('I have read and agree to the Terms of Use and Privacy Notice.')}</span>
        </label>

        <button className="primary-action full consent-accept" type="button" disabled={!agreed} onClick={onAccept}>{t('Agree and continue')}</button>
        <a className="consent-site-link" href="https://spectramsia.com/legal#calculator-privacy" target="_blank" rel="noreferrer">{t('Read the full legal and privacy notice')}</a>
      </section>
    </div>
  );
}

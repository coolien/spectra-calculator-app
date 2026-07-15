'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/components/app-shell/I18nProvider';
import { adsenseConfig } from '@/lib/ads';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdSenseSlot() {
  const { t } = useI18n();
  const initialized = useRef(false);

  useEffect(() => {
    if (!adsenseConfig.ready || initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      initialized.current = false;
    }
  }, []);

  if (!adsenseConfig.ready) return null;

  return (
    <aside className="ad-placement" aria-label={t('Advertisement')}>
      <span className="ad-label">{t('Advertisement')}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseConfig.client!}
        data-ad-slot={adsenseConfig.homeSlot!}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

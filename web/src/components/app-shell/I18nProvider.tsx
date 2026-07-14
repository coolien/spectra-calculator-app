'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { translate, type Language, type Translate } from '@/lib/i18n';

const I18nContext = createContext<{ language: Language; t: Translate }>({ language: 'en', t: (source) => source });

export function I18nProvider({ language, children }: { language: Language; children: ReactNode }) {
  const value = useMemo(() => ({ language, t: (source: string, values?: Record<string, string | number>) => translate(language, source, values) }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

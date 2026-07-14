'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CalculatorKey } from '@/lib/calculators';
import type {
  DetailKey, FormState, PersonalProfile, SalaryProfile, SavedScenario, TabKey,
} from '@/lib/app-model';
import type { Language } from '@/lib/i18n';
import { ThemeProvider } from '@/components/app-shell/ThemeProvider';
import { TopBar } from '@/components/app-shell/TopBar';
import { TabBar } from '@/components/app-shell/TabBar';
import { calculatorDefaults, calculatorOrder } from '@/components/calculators/schemas';
import { CalculatorScreen } from '@/components/calculators/CalculatorScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { CalculatorsScreen } from '@/components/screens/CalculatorsScreen';
import { SavedScreen } from '@/components/screens/SavedScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { LanguageScreen } from '@/components/screens/LanguageScreen';
import { AccountScreen } from '@/components/screens/AccountScreen';
import { RemoveAdsScreen } from '@/components/screens/RemoveAdsScreen';
import { AppIconScreen } from '@/components/screens/AppIconScreen';
import { LegalScreen } from '@/components/screens/LegalScreen';
import { PersonalProfileScreen } from '@/components/screens/PersonalProfileScreen';
import { AddSalaryProfileScreen } from '@/components/screens/AddSalaryProfileScreen';
import { LegalConsentGate, LEGAL_CONSENT_KEY, LEGAL_CONSENT_VERSION } from '@/components/LegalConsentGate';
import { useCloudSync } from '@/hooks/useCloudSync';
import type { CloudPayload } from '@/lib/cloud-sync';

const STORAGE_KEY = 'spectra_app_state_v2';

export function SpectraApp() {
  return <ThemeProvider><SpectraExperience /></ThemeProvider>;
}

function SpectraExperience() {
  const [tab, setTab] = useState<TabKey>('home');
  const [detail, setDetail] = useState<DetailKey | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [forms, setForms] = useState<Record<CalculatorKey, FormState>>(calculatorDefaults);
  const [lastCalculator, setLastCalculator] = useState<CalculatorKey>('home');
  const [personalProfile, setPersonalProfile] = useState<PersonalProfile | null>(null);
  const [salaryProfiles, setSalaryProfiles] = useState<SalaryProfile[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [hasLegalConsent, setHasLegalConsent] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<PersistedState>;
      if (saved.language && ['en', 'bm', 'zh', 'ta'].includes(saved.language)) setLanguage(saved.language);
      if (saved.lastCalculator && calculatorOrder.includes(saved.lastCalculator)) setLastCalculator(saved.lastCalculator);
      if (saved.forms) {
        setForms(Object.fromEntries(calculatorOrder.map((key) => [
          key, { ...calculatorDefaults[key], ...(saved.forms?.[key] ?? {}) },
        ])) as Record<CalculatorKey, FormState>);
      }
      if (saved.personalProfile) setPersonalProfile(saved.personalProfile);
      if (Array.isArray(saved.salaryProfiles)) setSalaryProfiles(saved.salaryProfiles.slice(0, 15));
      if (Array.isArray(saved.savedScenarios)) setSavedScenarios(saved.savedScenarios);
    } catch {
      // Invalid older data is ignored and replaced after the first edit.
    }
    try {
      const consent = JSON.parse(window.localStorage.getItem(LEGAL_CONSENT_KEY) ?? '{}') as { version?: string };
      setHasLegalConsent(consent.version === LEGAL_CONSENT_VERSION);
    } catch {
      setHasLegalConsent(false);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = {
      language, forms, lastCalculator, personalProfile, salaryProfiles, savedScenarios,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, language, forms, lastCalculator, personalProfile, salaryProfiles, savedScenarios]);

  const cloudPayload = useMemo<CloudPayload>(() => ({
    language, forms, lastCalculator, personalProfile, salaryProfiles, savedScenarios,
  }), [language, forms, lastCalculator, personalProfile, salaryProfiles, savedScenarios]);

  const applyCloudState = useCallback((cloud: CloudPayload) => {
    if (['en', 'bm', 'zh', 'ta'].includes(cloud.language)) setLanguage(cloud.language);
    if (calculatorOrder.includes(cloud.lastCalculator)) setLastCalculator(cloud.lastCalculator);
    setForms(Object.fromEntries(calculatorOrder.map((key) => [
      key, { ...calculatorDefaults[key], ...(cloud.forms?.[key] ?? {}) },
    ])) as Record<CalculatorKey, FormState>);
    setPersonalProfile(cloud.personalProfile ?? null);
    setSalaryProfiles(Array.isArray(cloud.salaryProfiles) ? cloud.salaryProfiles.slice(0, 15) : []);
    setSavedScenarios(Array.isArray(cloud.savedScenarios) ? cloud.savedScenarios : []);
  }, []);

  const cloud = useCloudSync({
    enabled: hydrated && hasLegalConsent === true,
    payload: cloudPayload,
    onCloudState: applyCloudState,
  });

  function changeTab(next: TabKey) {
    setTab(next);
    setDetail(null);
  }

  function openCalculator(key: CalculatorKey) {
    setLastCalculator(key);
    setDetail(key);
  }

  function openSettingsDetail(screen: Exclude<DetailKey, CalculatorKey | 'add-salary-profile'>) {
    setTab('settings');
    setDetail(screen);
  }

  function toggleProfile() {
    if (detail === 'profile') {
      changeTab('home');
      return;
    }
    setDetail('profile');
  }

  function updateCalculatorField(key: CalculatorKey, field: string, value: string) {
    setForms((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  }

  function acceptLegalTerms() {
    window.localStorage.setItem(LEGAL_CONSENT_KEY, JSON.stringify({
      version: LEGAL_CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    }));
    setHasLegalConsent(true);
  }

  function renderScreen() {
    if (detail && isCalculatorKey(detail)) {
      return (
        <CalculatorScreen
          calculator={detail}
          form={forms[detail]}
          onChange={(field, value) => updateCalculatorField(detail, field, value)}
          onReset={() => setForms((current) => ({ ...current, [detail]: { ...calculatorDefaults[detail] } }))}
          onSave={(scenario) => setSavedScenarios((current) => [scenario, ...current.filter((item) => item.id !== scenario.id)])}
        />
      );
    }

    switch (detail) {
      case 'profile':
        return <PersonalProfileScreen profile={personalProfile} onSave={setPersonalProfile} />;
      case 'add-salary-profile':
        return <AddSalaryProfileScreen count={salaryProfiles.length} onSave={(profile) => { setSalaryProfiles((current) => [...current, profile].slice(0, 15)); setTab('saved'); setDetail(null); }} />;
      case 'language':
        return <LanguageScreen language={language} onChange={setLanguage} />;
      case 'account':
        return <AccountScreen cloud={cloud} />;
      case 'remove-ads':
        return <RemoveAdsScreen />;
      case 'app-icon':
        return <AppIconScreen />;
      case 'legal':
        return <LegalScreen />;
    }

    switch (tab) {
      case 'home':
        return <HomeScreen profile={personalProfile} lastCalculator={lastCalculator} onOpenCalculator={openCalculator} onOpenProfile={() => setDetail('profile')} onSeeAll={() => changeTab('calculators')} />;
      case 'calculators':
        return <CalculatorsScreen onOpen={openCalculator} />;
      case 'saved':
        return <SavedScreen salaryProfiles={salaryProfiles} scenarios={savedScenarios} onAddSalary={() => setDetail('add-salary-profile')} onDeleteScenario={(id) => setSavedScenarios((current) => current.filter((item) => item.id !== id))} />;
      case 'settings':
        return <SettingsScreen language={language} hasProfile={Boolean(personalProfile)} accountStatus={cloud.session ? cloud.syncState : 'Not signed in'} onOpen={openSettingsDetail} />;
    }
  }

  return (
    <main className="spectra-app">
      <TopBar isProfileOpen={detail === 'profile'} onProfileToggle={toggleProfile} />
      <div className="app-content">{renderScreen()}</div>
      <TabBar active={tab} onChange={changeTab} />
      {hasLegalConsent === false && <LegalConsentGate onAccept={acceptLegalTerms} />}
    </main>
  );
}

type PersistedState = {
  language: Language;
  forms: Record<CalculatorKey, FormState>;
  lastCalculator: CalculatorKey;
  personalProfile: PersonalProfile | null;
  salaryProfiles: SalaryProfile[];
  savedScenarios: SavedScenario[];
};

function isCalculatorKey(value: DetailKey): value is CalculatorKey {
  return calculatorOrder.includes(value as CalculatorKey);
}

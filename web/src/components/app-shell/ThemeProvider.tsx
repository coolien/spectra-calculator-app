'use client';

import type { CSSProperties, ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type AccentKey = 'spectrum' | 'modern' | 'coral' | 'amber' | 'jade' | 'azure' | 'violet';

export type AccentPreset = {
  key: AccentKey;
  label: string;
  accent: string;
  contrast: string;
  gradient: string;
  stops: string[];
};

export const accentPresets: AccentPreset[] = [
  {
    key: 'spectrum', label: 'Spectrum', accent: '#146356', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FF5D6C, #FFB443, #35C79A, #4C82F7, #A667F5)',
    stops: ['#FF5D6C', '#FFB443', '#35C79A', '#4C82F7', '#A667F5'],
  },
  {
    key: 'modern', label: 'Modern', accent: '#15141A', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #3A3940, #15141A)', stops: ['#3A3940', '#15141A'],
  },
  {
    key: 'coral', label: 'Coral', accent: '#D43E50', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FF9CA5, #FF5D6C)', stops: ['#FF9CA5', '#FF5D6C'],
  },
  {
    key: 'amber', label: 'Amber', accent: '#B76B00', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FFD88F, #FFB443)', stops: ['#FFD88F', '#FFB443'],
  },
  {
    key: 'jade', label: 'Jade', accent: '#168365', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #8BE2C7, #35C79A)', stops: ['#8BE2C7', '#35C79A'],
  },
  {
    key: 'azure', label: 'Azure', accent: '#315EC9', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #96B5FF, #4C82F7)', stops: ['#96B5FF', '#4C82F7'],
  },
  {
    key: 'violet', label: 'Violet', accent: '#7540BC', contrast: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #D2AEFF, #A667F5)', stops: ['#D2AEFF', '#A667F5'],
  },
];

type ThemeContextValue = {
  mode: ThemeMode;
  accentKey: AccentKey;
  accent: AccentPreset;
  scrim: number;
  setMode: (mode: ThemeMode) => void;
  setAccentKey: (key: AccentKey) => void;
  setScrim: (value: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accentKey, setAccentKey] = useState<AccentKey>('spectrum');
  const [scrim, setScrim] = useState(0.38);

  useEffect(() => {
    const saved = readSettings();
    if (saved.mode === 'light' || saved.mode === 'dark') setMode(saved.mode);
    if (accentPresets.some((preset) => preset.key === saved.accentKey)) setAccentKey(saved.accentKey as AccentKey);
    if (typeof saved.scrim === 'number') setScrim(Math.min(0.7, Math.max(0, saved.scrim)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('spectra_theme', JSON.stringify({ mode, accentKey, scrim }));
  }, [mode, accentKey, scrim]);

  const accent = accentPresets.find((preset) => preset.key === accentKey) ?? accentPresets[0];
  const value = useMemo(
    () => ({ mode, accentKey, accent, scrim, setMode, setAccentKey, setScrim }),
    [mode, accentKey, accent, scrim],
  );

  const tokens = mode === 'dark'
    ? { page: '#12181A', card: '#1B2420', border: '#2B3730', text: '#F3F1E8', secondary: '#A9B3AC', muted: '#7C877E', chip: '#233029', segment: '#233029' }
    : { page: '#FAF9F5', card: '#FFFFFF', border: '#E7E3D8', text: '#14231D', secondary: '#6B7566', muted: '#8A8A7A', chip: '#F0EEE4', segment: '#EFEBDD' };

  const style = {
    '--page-bg': tokens.page,
    '--card': tokens.card,
    '--border': tokens.border,
    '--text': tokens.text,
    '--text-secondary': tokens.secondary,
    '--text-muted': tokens.muted,
    '--chip': tokens.chip,
    '--segment': tokens.segment,
    '--accent': accent.accent,
    '--accent-contrast': accent.contrast,
    '--accent-gradient': accent.gradient,
    '--hero-gradient': `linear-gradient(rgba(0,0,0,${scrim}), rgba(0,0,0,${scrim})), ${accent.gradient}`,
  } as CSSProperties;

  return (
    <ThemeContext.Provider value={value}>
      <div className={`spectra-root theme-${mode}`} style={style}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

function readSettings(): { mode?: string; accentKey?: string; scrim?: number } {
  try {
    return JSON.parse(window.localStorage.getItem('spectra_theme') ?? '{}');
  } catch {
    return {};
  }
}

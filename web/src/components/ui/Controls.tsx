'use client';

import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AccentKey } from '@/components/app-shell/ThemeProvider';
import { accentPresets, useTheme } from '@/components/app-shell/ThemeProvider';
import { RingLogo } from '@/components/ui/RingLogo';

export function ScreenHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="screen-heading"><h1>{title}</h1><p>{subtitle}</p></div>;
}

export function AccordionCard({
  number, title, summary, optional, open, onToggle, children,
}: {
  number: number; title: string; summary?: string; optional?: boolean; open: boolean;
  onToggle: () => void; children: ReactNode;
}) {
  return (
    <section className="accordion-card">
      <button className="accordion-header" type="button" onClick={onToggle} aria-expanded={open}>
        <span className={open ? 'step-number is-active' : 'step-number'}>{number}</span>
        <span className="accordion-title">{title}</span>
        {!open && summary && <span className="accordion-summary">{summary}</span>}
        {optional && <span className="optional-pill">Optional</span>}
        <ChevronDown className={open ? 'chevron is-open' : 'chevron'} size={17} />
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </section>
  );
}

export function SegmentedControl({
  value, options, onChange, ariaLabel,
}: {
  value: string; options: { value: string; label: string }[];
  onChange: (value: string) => void; ariaLabel: string;
}) {
  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          className={value === option.value ? 'is-selected' : ''}
          type="button"
          onClick={() => onChange(option.value)}
        >{option.label}</button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button className="toggle-row" type="button" onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span>{label}</span><span className={checked ? 'toggle-track is-on' : 'toggle-track'}><span /></span>
    </button>
  );
}

export function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="metric-card"><span>{label}</span><strong>{value}</strong></div>;
}

export function ThemeSwatchGrid({ compact = false }: { compact?: boolean }) {
  const { accentKey, setAccentKey } = useTheme();
  return (
    <div className={compact ? 'theme-grid is-compact' : 'theme-grid'}>
      {accentPresets.map((preset) => (
        <button
          className={accentKey === preset.key ? 'theme-option is-active' : 'theme-option'}
          key={preset.key}
          type="button"
          onClick={() => setAccentKey(preset.key as AccentKey)}
          aria-label={`Use ${preset.label} theme colour`}
        >
          <span className="theme-ring"><RingLogo stops={preset.stops} size={compact ? 35 : 48} /></span>
          <span>{preset.label}</span>
          {accentKey === preset.key && <Check className="theme-check" size={14} />}
        </button>
      ))}
    </div>
  );
}

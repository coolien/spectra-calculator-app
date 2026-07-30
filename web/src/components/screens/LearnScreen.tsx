'use client';

import { ArrowRight, Calculator, ChevronDown, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { CalculatorKey } from '@/lib/calculators';
import { ScreenHeading } from '@/components/ui/Controls';
import content from '@/lib/finance/learn-content.json' with { type: 'json' };

type Lesson = (typeof content.categories)[number]['lessons'][number];

export function LearnScreen({ onOpenCalculator }: { onOpenCalculator: (key: CalculatorKey) => void }) {
  const [query, setQuery] = useState('');
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<'grow' | 'debt'>('grow');
  const normalizedQuery = query.trim().toLowerCase();
  const categories = useMemo(() => content.categories.map((category) => ({
    ...category,
    lessons: category.lessons.filter((lesson) => !normalizedQuery || [lesson.term, lesson.oneLiner, lesson.body, lesson.whyItMatters, lesson.quickTip, ...lesson.keywords].join(' ').toLowerCase().includes(normalizedQuery)),
  })).filter((category) => category.lessons.length > 0), [normalizedQuery]);

  useEffect(() => {
    const lessonId = window.location.hash.replace('#', '');
    if (lessonId) setOpenLesson(lessonId);
  }, []);

  function toggleLesson(lessonId: string) {
    const next = openLesson === lessonId ? null : lessonId;
    setOpenLesson(next);
    if (next) window.history.replaceState(null, '', `#${next}`);
  }

  return (
    <div className="standard-screen learn-screen">
      <ScreenHeading title="Learn" subtitle="Money basics in plain language — short by default, deeper when you need it." />
      <div className="learn-meta-row"><span>{content.meta.lastVerified} review</span><span>{content.categories.reduce((count, category) => count + category.lessons.length, 0)} lessons</span></div>
      <label className="learn-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search CCRIS, EIR, tax, BNPL…" aria-label="Search lessons" /></label>
      {categories.length === 0 && <div className="empty-inline">No lesson matches that search yet.</div>}
      {categories.map((category) => (
        <section className="learn-category" key={category.id}>
          <div className="learn-category-heading"><span className="learn-category-icon" aria-hidden="true">{category.icon}</span><div><h2>{category.title}</h2><p>{category.intro}</p></div></div>
          <div className="learn-lesson-list">
            {category.lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} open={openLesson === lesson.id} onToggle={() => toggleLesson(lesson.id)} onOpenCalculator={onOpenCalculator} />)}
          </div>
        </section>
      ))}
      <CompoundVisualizer mode={visualizerMode} onModeChange={setVisualizerMode} />
      <p className="learn-footnote">Numbers and rules are planning references, not a quote. Check the official source after each Budget cycle.</p>
    </div>
  );
}

function LessonCard({ lesson, open, onToggle, onOpenCalculator }: { lesson: Lesson; open: boolean; onToggle: () => void; onOpenCalculator: (key: CalculatorKey) => void }) {
  const calculatorForLesson: Partial<Record<string, CalculatorKey>> = { eir: 'car', 'flat-vs-reducing': 'personal', dsr: 'home', 'credit-card': 'credit', bnpl: 'credit' };
  return (
    <article className={open ? 'learn-lesson is-open' : 'learn-lesson'} id={lesson.id}>
      <button className="learn-lesson-toggle" type="button" aria-expanded={open} onClick={onToggle}>
        <span className="learn-lesson-mark" aria-hidden="true">{lesson.term.slice(0, 1)}</span>
        <span><strong>{lesson.term}</strong><small>{lesson.oneLiner}</small></span>
        <ChevronDown size={18} className={open ? 'chevron is-open' : 'chevron'} aria-hidden="true" />
      </button>
      {open && <div className="learn-lesson-body"><p>{lesson.body}</p><div className="learn-why"><strong>Why it matters</strong><span>{lesson.whyItMatters}</span></div><div className="learn-tip"><strong>Quick tip</strong><span>{lesson.quickTip}</span></div>{calculatorForLesson[lesson.id] && <button className="learn-link-action" type="button" onClick={() => onOpenCalculator(calculatorForLesson[lesson.id]!)}><Calculator size={15} /> Try the related calculator <ArrowRight size={15} /></button>}</div>}
    </article>
  );
}

function CompoundVisualizer({ mode, onModeChange }: { mode: 'grow' | 'debt'; onModeChange: (mode: 'grow' | 'debt') => void }) {
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(5);
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(18);
  const [debtYears, setDebtYears] = useState(5);
  const chartValues = useMemo(() => {
    if (mode === 'grow') {
      return Array.from({ length: 7 }, (_, index) => {
        const pointYears = Math.max(0, Math.round(years * index / 6));
        const i = returnRate / 100 / 12;
        const n = pointYears * 12;
        return i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i);
      });
    }
    return Array.from({ length: 7 }, (_, index) => balance * Math.pow(1 + apr / 100 / 12, debtYears * 12 * index / 6));
  }, [apr, balance, debtYears, mode, monthly, returnRate, years]);
  const max = Math.max(...chartValues, 1);
  const headline = mode === 'grow' ? `RM${Math.round(chartValues.at(-1) ?? 0).toLocaleString('en-MY')} future value` : `RM${Math.round(chartValues.at(-1) ?? 0).toLocaleString('en-MY')} if untouched`;
  return (
    <section className="compound-card">
      <div className="compound-heading"><span className="compound-icon"><Sparkles size={18} /></span><div><h2>Compound interest visualizer</h2><p>See the same curve work for you — or against you.</p></div></div>
      <div className="segmented-control compound-toggle"><button type="button" className={mode === 'grow' ? 'is-selected' : ''} onClick={() => onModeChange('grow')}>Grow savings</button><button type="button" className={mode === 'debt' ? 'is-selected' : ''} onClick={() => onModeChange('debt')}>Cost of debt</button></div>
      <div className="compound-chart" aria-label={mode === 'grow' ? 'Savings growth chart' : 'Debt growth chart'}><svg viewBox="0 0 320 130" role="img"><defs><linearGradient id="compound-fill" x1="0" x2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".12" /><stop offset="1" stopColor="var(--accent)" stopOpacity=".4" /></linearGradient></defs><path d={chartPath(chartValues, max)} fill="url(#compound-fill)" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" /></svg><strong>{headline}</strong></div>
      {mode === 'grow' ? <div className="compound-controls"><RangeField label="Monthly saving" value={monthly} min={50} max={1000} step={50} suffix="RM" onChange={setMonthly} /><RangeField label="Years" value={years} min={5} max={40} step={5} suffix="y" onChange={setYears} /><RangeField label="Return" value={returnRate} min={1} max={10} step={.5} suffix="%" onChange={setReturnRate} /></div> : <div className="compound-controls"><RangeField label="Balance" value={balance} min={500} max={20000} step={500} suffix="RM" onChange={setBalance} /><RangeField label="APR" value={apr} min={5} max={24} step={1} suffix="%" onChange={setApr} /><RangeField label="Years" value={debtYears} min={1} max={10} step={1} suffix="y" onChange={setDebtYears} /></div>}
    </section>
  );
}

function RangeField({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) {
  return <label className="compound-range"><span><span>{label}</span><strong>{value}{suffix}</strong></span><input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function chartPath(values: number[], max: number) {
  const points = values.map((value, index) => `${Math.round(index / Math.max(1, values.length - 1) * 320)},${118 - value / max * 100}`);
  return `M 0 118 L ${points.join(' L ')} L 320 118 Z`;
}

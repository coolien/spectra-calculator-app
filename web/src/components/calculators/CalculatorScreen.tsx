'use client';

import { useMemo, useRef, useState } from 'react';
import type { CalculatorKey } from '@/lib/calculators';
import type { FormState, SavedScenario } from '@/lib/app-model';
import { calculateFromForm } from '@/lib/calculator-runtime';
import { calculatorSchemas } from '@/components/calculators/schemas';
import { CalculatorForm } from '@/components/calculators/CalculatorForm';
import { CalculatorResult } from '@/components/calculators/CalculatorResult';
import { StickyResultBar } from '@/components/calculators/StickyResultBar';
import { ScreenHeading } from '@/components/ui/Controls';

export function CalculatorScreen({
  calculator, form, onChange, onReset, onSave,
}: {
  calculator: CalculatorKey;
  form: FormState;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  onSave: (scenario: SavedScenario) => void;
}) {
  const schema = calculatorSchemas[calculator];
  const [calculated, setCalculated] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const outcome = useMemo(() => {
    try {
      return { result: calculateFromForm(calculator, form) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Check the input values.' };
    }
  }, [calculator, form]);

  const result = 'result' in outcome ? outcome.result : null;
  const secondary = result?.metrics[schema.secondaryMetricIndex];

  function calculate() {
    setCalculated(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function save() {
    if (!result) return;
    const scenario: SavedScenario = {
      id: `${calculator}-${Date.now()}`,
      calculator,
      label: `${schema.title} scenario`,
      result: result.primaryValue,
      secondary: secondary?.value ?? '',
      savedAt: new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short' }).format(new Date()),
    };
    onSave(scenario);
    setSaved(true);
  }

  return (
    <div className="calculator-screen">
      <div className="screen-scroll">
        <ScreenHeading title={schema.screenTitle} subtitle="Estimates in MYR · review official quotes before deciding" />
        {schema.disclaimer && <div className="faraid-disclaimer"><strong>Important</strong><p>{schema.disclaimer}</p></div>}
        <CalculatorForm schema={schema} form={form} onChange={(key, value) => { setSaved(false); onChange(key, value); }} />
        <p className="scroll-hint">Calculate to review the full breakdown</p>
        {calculated && result && <div ref={resultRef}><CalculatorResult result={result} /></div>}
      </div>
      <StickyResultBar
        primaryLabel={result?.title ?? 'Result'}
        primaryValue={result?.primaryValue ?? '—'}
        secondaryLabel={schema.secondaryLabel}
        secondaryValue={secondary?.value ?? '—'}
        error={'error' in outcome ? outcome.error : undefined}
        saved={saved}
        calculated={calculated}
        onSave={save}
        onReset={() => { setCalculated(false); setSaved(false); onReset(); }}
        onCalculate={calculate}
      />
    </div>
  );
}

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
import { useI18n } from '@/components/app-shell/I18nProvider';

export function CalculatorScreen({
  calculator, form, onChange, onReset, onSave,
}: {
  calculator: CalculatorKey;
  form: FormState;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  onSave: (scenario: SavedScenario) => void;
}) {
  const { language, t } = useI18n();
  const schema = calculatorSchemas[calculator];
  const [calculated, setCalculated] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const outcome = useMemo(() => {
    try {
      return { result: calculateFromForm(calculator, form) };
    } catch (error) {
      return { error: t(error instanceof Error ? error.message : 'Check the input values.') };
    }
  }, [calculator, form, t]);

  const result = 'result' in outcome ? outcome.result : null;
  const secondary = result?.metrics[schema.secondaryMetricIndex];
  const locale = language === 'bm' ? 'ms-MY' : language === 'zh' ? 'zh-MY' : language === 'ta' ? 'ta-MY' : 'en-MY';
  const generatedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date());

  function calculate() {
    setCalculated(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function save() {
    if (!result) return;
    const scenario: SavedScenario = {
      id: `${calculator}-${Date.now()}`,
      calculator,
      label: `${t(schema.title)} - ${t('saved plan')}`,
      result: result.primaryValue,
      secondary: secondary?.value ?? '',
      savedAt: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date()),
      comparison: result.comparison,
    };
    onSave(scenario);
    setSaved(true);
  }

  function exportPdf() {
    const originalTitle = document.title;
    document.title = `Spectra - ${t(schema.title)}`;
    const restoreTitle = () => { document.title = originalTitle; };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    window.print();
    window.setTimeout(restoreTitle, 1000);
  }

  return (
    <div className="calculator-screen">
      <div className="screen-scroll">
        <ScreenHeading title={schema.screenTitle} subtitle="Estimates in MYR - review official quotes before deciding" />
        {schema.disclaimer && <div className="faraid-disclaimer"><strong>{t('Important')}</strong><p>{t(schema.disclaimer)}</p></div>}
        <CalculatorForm schema={schema} form={form} onChange={(key, value) => { setSaved(false); onChange(key, value); }} />
        <p className="scroll-hint">{t('Calculate to review the full breakdown')}</p>
        {calculated && result && (
          <div ref={resultRef}>
            <CalculatorResult
              result={result}
              calculatorTitle={schema.title}
              generatedDate={generatedDate}
              onExportPdf={exportPdf}
            />
          </div>
        )}
      </div>
      <StickyResultBar
        primaryLabel={t(result?.title ?? 'Result')}
        primaryValue={result?.primaryValue ?? '-'}
        secondaryLabel={t(schema.secondaryLabel)}
        secondaryValue={secondary?.value ?? '-'}
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

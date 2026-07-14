'use client';

import { useEffect, useState } from 'react';
import { AccordionCard, SegmentedControl, Toggle } from '@/components/ui/Controls';
import type { CalculatorField, CalculatorSchema, FormState } from '@/lib/app-model';

export function CalculatorForm({
  schema, form, onChange,
}: {
  schema: CalculatorSchema;
  form: FormState;
  onChange: (key: string, value: string) => void;
}) {
  const [openSteps, setOpenSteps] = useState<string[]>([schema.steps[0].id]);

  useEffect(() => setOpenSteps([schema.steps[0].id]), [schema]);

  return (
    <div className="calculator-steps">
      {schema.steps.map((step, index) => {
        const open = openSteps.includes(step.id);
        return (
          <AccordionCard
            key={step.id}
            number={index + 1}
            title={step.title}
            summary={step.summary(form)}
            optional={step.optional}
            open={open}
            onToggle={() => setOpenSteps((current) => current.includes(step.id)
              ? current.filter((id) => id !== step.id)
              : [...current, step.id])}
          >
            {step.description && <p className="step-description">{step.description}</p>}
            <div className="field-grid">
              {step.fields.map((field) => shouldShowField(schema.key, field, form) && (
                <CalculatorFieldControl
                  field={field}
                  key={field.key}
                  value={form[field.key] ?? ''}
                  onChange={(value) => onChange(field.key, value)}
                />
              ))}
            </div>
          </AccordionCard>
        );
      })}
    </div>
  );
}

function CalculatorFieldControl({
  field, value, onChange,
}: {
  field: CalculatorField; value: string; onChange: (value: string) => void;
}) {
  if (field.type === 'toggle') {
    return (
      <div className={field.fullWidth ? 'field-wrap is-full' : 'field-wrap'}>
        <Toggle label={field.label} checked={value === 'true'} onChange={(checked) => onChange(String(checked))} />
      </div>
    );
  }

  if (field.type === 'segmented') {
    return (
      <div className={field.fullWidth ? 'field-wrap is-full' : 'field-wrap'}>
        <label className="field-label">{field.label}</label>
        <SegmentedControl value={value} options={field.options ?? []} onChange={onChange} ariaLabel={field.label} />
      </div>
    );
  }

  return (
    <label className={field.fullWidth ? 'field-wrap is-full' : 'field-wrap'}>
      <span className="field-label">{field.label}</span>
      <span className="input-shell">
        {field.prefix && <span>{field.prefix}</span>}
        <input
          value={value}
          inputMode="decimal"
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {field.suffix && <span>{field.suffix}</span>}
      </span>
    </label>
  );
}

function shouldShowField(calculator: string, field: CalculatorField, form: FormState) {
  if (calculator !== 'faraid') return true;
  if (field.key === 'wives') return form.deceasedGender === 'male';
  if (field.key === 'hasHusband') return form.deceasedGender === 'female';
  return true;
}

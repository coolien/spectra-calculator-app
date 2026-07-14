import type { CalculatorSchema } from '@/lib/app-model';

export const faraidSchema: CalculatorSchema = {
  key: 'faraid',
  shortName: 'Faraid',
  title: 'Faraid Inheritance',
  screenTitle: 'Faraid inheritance estimate',
  description: 'Islamic inheritance shares for core direct heirs',
  homeDescription: 'Islamic estate share estimate',
  disclaimer: 'This is a planning estimate only. Confirm final shares with a certified Faraid officer or the Syariah court.',
  secondaryMetricIndex: 3,
  secondaryLabel: 'Heir groups',
  defaults: {
    grossEstate: '500000', debtsAndExpenses: '0', wasiyyah: '0', deceasedGender: 'male',
    wives: '1', hasHusband: 'false', sons: '1', daughters: '1', hasFather: 'true', hasMother: 'true',
  },
  steps: [
    {
      id: 'estate', title: 'Estate value',
      summary: (form) => `RM ${Number(form.grossEstate || 0).toLocaleString('en-MY')}`,
      fields: [
        { key: 'grossEstate', label: 'Gross estate', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'debtsAndExpenses', label: 'Debts & expenses', type: 'number', prefix: 'RM' },
        { key: 'wasiyyah', label: 'Wasiyyah', type: 'number', prefix: 'RM' },
      ],
    },
    {
      id: 'family', title: 'Spouse & children',
      summary: (form) => `${Number(form.sons) + Number(form.daughters)} children entered`,
      fields: [
        {
          key: 'deceasedGender', label: 'Deceased', type: 'segmented', fullWidth: true,
          options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }],
        },
        { key: 'wives', label: 'Wife / wives', type: 'number' },
        { key: 'hasHusband', label: 'Husband survived', type: 'toggle' },
        { key: 'sons', label: 'Sons', type: 'number' },
        { key: 'daughters', label: 'Daughters', type: 'number' },
      ],
    },
    {
      id: 'parents', title: 'Parents',
      summary: (form) => [form.hasFather === 'true' && 'Father', form.hasMother === 'true' && 'Mother'].filter(Boolean).join(' · ') || 'None entered',
      fields: [
        { key: 'hasFather', label: 'Father survived', type: 'toggle' },
        { key: 'hasMother', label: 'Mother survived', type: 'toggle' },
      ],
    },
  ],
};

import type { CalculatorSchema } from '@/lib/app-model';

export const homeLoanSchema: CalculatorSchema = {
  key: 'home',
  shortName: 'Home',
  title: 'Home Loan',
  screenTitle: 'Property financing',
  description: 'Installment, upfront cash and full cost estimate',
  homeDescription: 'Installment, upfront cash & full amortization',
  secondaryMetricIndex: 1,
  secondaryLabel: 'Upfront cash',
  defaults: {
    propertyPrice: '500000',
    downPaymentPercent: '10',
    annualRatePercent: '4.00',
    tenureYears: '35',
    buyerStatus: 'citizen',
    propertyType: 'subsale',
    firstHome: 'true',
    monthlyIncome: '8000',
    existingCommitments: '500',
    targetDsrPercent: '40',
  },
  steps: [
    {
      id: 'basics',
      title: 'Loan basics',
      summary: (form) => `RM ${Number(form.propertyPrice || 0).toLocaleString('en-MY')} · ${form.tenureYears}y`,
      fields: [
        { key: 'propertyPrice', label: 'Property price', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'downPaymentPercent', label: 'Down payment', type: 'number', suffix: '%' },
        { key: 'annualRatePercent', label: 'Interest rate', type: 'number', suffix: '%' },
        {
          key: 'tenureYears', label: 'Tenure', type: 'segmented', fullWidth: true,
          options: ['20', '25', '30', '35'].map((value) => ({ value, label: `${value}y` })),
        },
      ],
    },
    {
      id: 'buyer',
      title: 'Buyer & property status',
      summary: (form) => `${label(form.buyerStatus)} · ${label(form.propertyType)}`,
      fields: [
        {
          key: 'buyerStatus', label: 'Buyer status', type: 'segmented', fullWidth: true,
          options: [
            { value: 'citizen', label: 'Citizen' },
            { value: 'pr', label: 'PR' },
            { value: 'foreign', label: 'Foreign' },
          ],
        },
        {
          key: 'propertyType', label: 'Property type', type: 'segmented', fullWidth: true,
          options: [
            { value: 'subsale', label: 'Subsale' },
            { value: 'new-project', label: 'New project' },
          ],
        },
        { key: 'firstHome', label: 'First residential home', type: 'toggle', fullWidth: true },
      ],
    },
    {
      id: 'affordability',
      title: 'Affordability check',
      optional: true,
      description: "Your saved profile is used automatically. Adjust these values for this estimate only.",
      summary: (form) => form.monthlyIncome ? `RM ${Number(form.monthlyIncome).toLocaleString('en-MY')} income` : 'Not added',
      fields: [
        { key: 'monthlyIncome', label: 'Monthly gross income', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'existingCommitments', label: 'Existing commitments', type: 'number', prefix: 'RM' },
        { key: 'targetDsrPercent', label: 'Target DSR', type: 'number', suffix: '%' },
      ],
    },
  ],
};

function label(value: string) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

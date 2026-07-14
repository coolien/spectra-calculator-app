import type { CalculatorSchema } from '@/lib/app-model';

export const personalLoanSchema: CalculatorSchema = {
  key: 'personal',
  shortName: 'Personal',
  title: 'Personal Loan',
  screenTitle: 'Personal financing',
  description: 'Compare reducing-balance and flat-rate repayments',
  homeDescription: 'Reducing-balance or flat-rate repayment',
  secondaryMetricIndex: 0,
  secondaryLabel: 'Total interest',
  defaults: {
    principal: '20000', annualRatePercent: '8.00', tenureYears: '5',
    upfrontFees: '0', stampDutyRatePercent: '0.50', method: 'reducing',
  },
  steps: [
    {
      id: 'loan', title: 'Loan basics',
      summary: (form) => `RM ${Number(form.principal || 0).toLocaleString('en-MY')} · ${form.tenureYears}y`,
      fields: [
        { key: 'principal', label: 'Loan amount', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'annualRatePercent', label: 'Interest rate', type: 'number', suffix: '%' },
        { key: 'tenureYears', label: 'Tenure', type: 'number', suffix: 'years' },
      ],
    },
    {
      id: 'method', title: 'Interest method',
      summary: (form) => form.method === 'flat' ? 'Flat rate' : 'Reducing balance',
      fields: [{
        key: 'method', label: 'Method', type: 'segmented', fullWidth: true,
        options: [{ value: 'reducing', label: 'Reducing' }, { value: 'flat', label: 'Flat' }],
      }],
    },
    {
      id: 'costs', title: 'Fees & stamp duty', optional: true,
      summary: (form) => `${form.stampDutyRatePercent}% stamp duty`,
      fields: [
        { key: 'upfrontFees', label: 'Upfront fees', type: 'number', prefix: 'RM' },
        { key: 'stampDutyRatePercent', label: 'Stamp duty rate', type: 'number', suffix: '%' },
      ],
    },
  ],
};

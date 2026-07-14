import type { CalculatorSchema } from '@/lib/app-model';

export const carLoanSchema: CalculatorSchema = {
  key: 'car',
  shortName: 'Car',
  title: 'Car Loan',
  screenTitle: 'Hire purchase estimate',
  description: 'Malaysia flat-rate hire purchase planning',
  homeDescription: 'Hire purchase flat-rate installment',
  secondaryMetricIndex: 0,
  secondaryLabel: 'Total interest',
  defaults: {
    vehiclePrice: '90000', downPaymentPercent: '10', annualFlatRatePercent: '3.00',
    tenureYears: '7', upfrontFees: '0', vehicleType: 'new',
  },
  steps: [
    {
      id: 'financing', title: 'Vehicle & financing',
      summary: (form) => `RM ${Number(form.vehiclePrice || 0).toLocaleString('en-MY')} · ${form.tenureYears}y`,
      fields: [
        { key: 'vehiclePrice', label: 'Vehicle price', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'downPaymentPercent', label: 'Down payment', type: 'number', suffix: '%' },
        { key: 'annualFlatRatePercent', label: 'Flat rate', type: 'number', suffix: '%' },
        {
          key: 'tenureYears', label: 'Tenure', type: 'segmented', fullWidth: true,
          options: ['5', '7', '9'].map((value) => ({ value, label: `${value}y` })),
        },
      ],
    },
    {
      id: 'vehicle', title: 'Vehicle details',
      summary: (form) => `${form.vehicleType === 'used' ? 'Used' : 'New'} vehicle`,
      fields: [
        {
          key: 'vehicleType', label: 'Vehicle type', type: 'segmented', fullWidth: true,
          options: [{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }],
        },
      ],
    },
    {
      id: 'fees', title: 'Upfront costs', optional: true,
      summary: (form) => form.upfrontFees === '0' ? 'No fee buffer' : `RM ${Number(form.upfrontFees).toLocaleString('en-MY')}`,
      fields: [{ key: 'upfrontFees', label: 'Upfront fee buffer', type: 'number', prefix: 'RM', fullWidth: true }],
    },
  ],
};

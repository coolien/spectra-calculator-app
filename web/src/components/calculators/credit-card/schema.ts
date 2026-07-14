import type { CalculatorSchema } from '@/lib/app-model';

export const creditCardSchema: CalculatorSchema = {
  key: 'credit',
  shortName: 'Card',
  title: 'Credit Card Payoff',
  screenTitle: 'Credit card payoff',
  description: 'See payoff time and the cost of minimum payments',
  homeDescription: 'Payoff timeline & minimum-payment cost',
  secondaryMetricIndex: 0,
  secondaryLabel: 'Finance charge',
  defaults: {
    outstandingBalance: '5000', annualFinanceChargePercent: '18.00', monthlyPayment: '500',
    monthlyNewSpending: '0', minimumPaymentPercent: '5', minimumPaymentFloor: '50',
  },
  steps: [
    {
      id: 'balance', title: 'Balance & payment',
      summary: (form) => `RM ${Number(form.outstandingBalance || 0).toLocaleString('en-MY')} balance`,
      fields: [
        { key: 'outstandingBalance', label: 'Outstanding balance', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'monthlyPayment', label: 'Monthly payment', type: 'number', prefix: 'RM' },
        { key: 'annualFinanceChargePercent', label: 'Finance charge', type: 'number', suffix: '%' },
      ],
    },
    {
      id: 'minimum', title: 'Minimum-payment terms',
      summary: (form) => `${form.minimumPaymentPercent}% · RM ${form.minimumPaymentFloor} floor`,
      fields: [
        { key: 'minimumPaymentPercent', label: 'Minimum payment', type: 'number', suffix: '%' },
        { key: 'minimumPaymentFloor', label: 'Minimum floor', type: 'number', prefix: 'RM' },
      ],
    },
    {
      id: 'spending', title: 'New spending', optional: true,
      summary: (form) => form.monthlyNewSpending === '0' ? 'None' : `RM ${form.monthlyNewSpending}/mo`,
      fields: [{ key: 'monthlyNewSpending', label: 'Monthly new spending', type: 'number', prefix: 'RM', fullWidth: true }],
    },
  ],
};

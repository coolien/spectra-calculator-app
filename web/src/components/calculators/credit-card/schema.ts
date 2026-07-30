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
    monthlyNewSpending: '0', minimumPaymentPercent: '5', minimumPaymentFloor: '50', grossMonthlyIncome: '5000', existingMonthlyCommitments: '500', paysInFullEveryMonth: 'true', totalLimit: '5000', bnplPurchaseAmount: '100', bnplLateFee: '10', bnplWeeksLate: '2', lateHorizonMonths: '24',
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
    {
      id: 'reality', title: 'Reality check',
      summary: (form) => form.paysInFullEveryMonth === 'true' ? 'Pay in full' : 'Carry a balance',
      fields: [
        { key: 'grossMonthlyIncome', label: 'Gross monthly income', type: 'number', prefix: 'RM' },
        { key: 'existingMonthlyCommitments', label: 'Existing commitments', type: 'number', prefix: 'RM' },
        { key: 'totalLimit', label: 'Assigned card limit', type: 'number', prefix: 'RM' },
        { key: 'paysInFullEveryMonth', label: 'I pay in full every month', type: 'toggle', fullWidth: true },
      ],
    },
    {
      id: 'bnpl', title: 'BNPL late-fee check', optional: true,
      summary: (form) => `RM ${form.bnplLateFee} on RM ${form.bnplPurchaseAmount}`,
      fields: [
        { key: 'bnplPurchaseAmount', label: 'Purchase amount', type: 'number', prefix: 'RM' },
        { key: 'bnplLateFee', label: 'Late fee', type: 'number', prefix: 'RM' },
        { key: 'bnplWeeksLate', label: 'Weeks late', type: 'number', suffix: 'weeks' },
        { key: 'lateHorizonMonths', label: 'Late-cost horizon', type: 'number', suffix: 'months' },
      ],
    },
  ],
};

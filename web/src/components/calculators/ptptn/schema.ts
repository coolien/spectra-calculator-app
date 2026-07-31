import type { CalculatorSchema } from '@/lib/app-model';

export const ptptnSchema: CalculatorSchema = {
  key: 'ptptn',
  shortName: 'PTPTN',
  title: 'PTPTN Loan',
  screenTitle: 'PTPTN repayment',
  description: 'Education loan repayment and Ujrah planning',
  homeDescription: 'Education repayment, discount-aware',
  secondaryMetricIndex: 1,
  secondaryLabel: 'Total Ujrah',
  defaults: {
    outstandingBalance: '30000', annualUjrahRatePercent: '1.00', tenureYears: '10',
    extraMonthlyPayment: '0', method: 'reducing', grossMonthlyIncome: '0', monthlyTax: '0', settlementDiscountPercent: '0',
  },
  steps: [
    {
      id: 'repayment', title: 'Repayment basics',
      summary: (form) => `RM ${Number(form.outstandingBalance || 0).toLocaleString('en-MY')} · ${form.tenureYears}y`,
      fields: [
        { key: 'outstandingBalance', label: 'Outstanding balance', type: 'number', prefix: 'RM', fullWidth: true },
        { key: 'annualUjrahRatePercent', label: 'Ujrah rate', type: 'number', suffix: '%' },
        { key: 'tenureYears', label: 'Tenure', type: 'number', suffix: 'years' },
      ],
    },
    {
      id: 'method', title: 'Charge method',
      summary: (form) => form.method === 'flat' ? 'Flat rate' : 'Reducing balance',
      fields: [{
        key: 'method', label: 'Method', type: 'segmented', fullWidth: true,
        options: [{ value: 'reducing', label: 'Reducing' }, { value: 'flat', label: 'Flat' }],
      }],
    },
    {
      id: 'extra', title: 'Pay faster', optional: true,
      summary: (form) => form.extraMonthlyPayment === '0' ? 'No extra payment' : `+ RM ${form.extraMonthlyPayment}/mo`,
      fields: [{ key: 'extraMonthlyPayment', label: 'Extra monthly payment', type: 'number', prefix: 'RM', fullWidth: true }],
    },
    {
      id: 'reality', title: 'Discount & credit impact', optional: true,
      summary: (form) => Number(form.settlementDiscountPercent || 0) > 0 ? `${form.settlementDiscountPercent}% discount quoted` : 'No discount quoted',
      fields: [
        // Discounts are quoted per borrower and PTPTN runs no standing scheme, so this is
        // keyed in from the borrower's own settlement quote rather than looked up.
        { key: 'settlementDiscountPercent', label: 'Discount quoted to you', type: 'number', suffix: '%', fullWidth: true, help: 'Leave at 0 if PTPTN has not offered you one. Enter the exact percentage from your settlement quote.' },
        { key: 'grossMonthlyIncome', label: 'Gross monthly income', type: 'number', prefix: 'RM' },
        { key: 'monthlyTax', label: 'Monthly PCB / tax', type: 'number', prefix: 'RM' },
      ],
    },
  ],
};

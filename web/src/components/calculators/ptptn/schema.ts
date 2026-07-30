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
    extraMonthlyPayment: '0', method: 'reducing', grossMonthlyIncome: '0', monthlyTax: '0', settlementDiscount: 'full-settlement',
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
      summary: (form) => form.grossMonthlyIncome === '0' ? 'Add income' : `RM ${form.grossMonthlyIncome} income`,
      fields: [
        { key: 'settlementDiscount', label: 'Settlement option', type: 'segmented', fullWidth: true, options: [{ value: 'full-settlement', label: '15% full settlement' }, { value: 'partial-or-salary-deduction', label: '10% partial / salary' }, { value: 'consistent-scheduled', label: '10% scheduled' }] },
        { key: 'grossMonthlyIncome', label: 'Gross monthly income', type: 'number', prefix: 'RM' },
        { key: 'monthlyTax', label: 'Monthly PCB / tax', type: 'number', prefix: 'RM' },
      ],
    },
  ],
};

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
    upfrontFees: '0', stampDutyRatePercent: '0.50', method: 'reducing', grossMonthlyIncome: '0', existingCommitments: '0', monthlyTax: '0', settleAfterYears: '2', askedForUpfrontFee: 'false', payToPersonalAccount: 'false', guaranteedApproval: 'false', whatsappOnly: 'false', foundOnIKrediKom: 'false', financingType: 'conventional',
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
      }, { key: 'financingType', label: 'Financing type', type: 'segmented', fullWidth: true, options: [{ value: 'conventional', label: 'Conventional' }, { value: 'islamic', label: 'Islamic' }] }],
    },
    {
      id: 'costs', title: 'Fees & stamp duty', optional: true,
      summary: (form) => `${form.stampDutyRatePercent}% stamp duty`,
      fields: [
        { key: 'upfrontFees', label: 'Upfront fees', type: 'number', prefix: 'RM' },
        { key: 'stampDutyRatePercent', label: 'Stamp duty rate', type: 'number', suffix: '%' },
      ],
    },
    {
      id: 'affordability', title: 'Affordability & early settlement', optional: true,
      summary: (form) => form.grossMonthlyIncome === '0' ? 'Add income' : `RM ${form.grossMonthlyIncome} income`,
      fields: [
        { key: 'grossMonthlyIncome', label: 'Gross monthly income', type: 'number', prefix: 'RM' },
        { key: 'existingCommitments', label: 'Existing commitments', type: 'number', prefix: 'RM' },
        { key: 'monthlyTax', label: 'Monthly PCB / tax', type: 'number', prefix: 'RM' },
        { key: 'settleAfterYears', label: 'Settle after', type: 'number', suffix: 'years' },
      ],
    },
    {
      id: 'safety', title: 'Lender safety', optional: true,
      summary: (form) => form.askedForUpfrontFee === 'true' ? 'Red flag entered' : 'Check before borrowing',
      fields: [
        { key: 'askedForUpfrontFee', label: 'Asked for upfront fee', type: 'toggle' },
        { key: 'payToPersonalAccount', label: 'Payment to personal account', type: 'toggle' },
        { key: 'guaranteedApproval', label: 'Guaranteed approval', type: 'toggle' },
        { key: 'whatsappOnly', label: 'WhatsApp-only contact', type: 'toggle' },
        { key: 'foundOnIKrediKom', label: 'Found on i-KrediKom', type: 'toggle' },
      ],
    },
  ],
};

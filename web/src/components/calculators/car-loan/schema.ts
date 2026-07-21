import type { CalculatorSchema } from '@/lib/app-model';

export const carLoanSchema: CalculatorSchema = {
  key: 'car',
  shortName: 'Car',
  title: 'Car Loan / Hire Purchase',
  screenTitle: 'Hire purchase estimate',
  description: 'Malaysia hire-purchase planning with EIR and reducing balance',
  homeDescription: 'Hire purchase EIR and reducing-balance planning',
  secondaryMetricIndex: 0,
  secondaryLabel: 'Total interest',
  defaults: {
    vehiclePrice: '90000', downPaymentPercent: '10', downPaymentAmount: '9000', downPaymentMode: 'percent',
    annualFlatRatePercent: '3.00', flatRatePercent: '3.00', eirPercent: '5.00', rateMode: 'eir',
    rateType: 'fixed', referenceRate: '3.00', spread: '2.00', oprStress: '0',
    tenureYears: '7', customTenureYears: '7', upfrontFees: '0', vehicleType: 'new',
    agreementTiming: 'after', providerReadiness: 'not-sure', settleAfterMonths: '12',
    processingFee: '0', firstYearInsurance: '0', roadTax: '0', registrationTransfer: '0', accessories: '0',
    insuranceRenewal: '0', recurringRoadTax: '0', maintenance: '0', tyres: '0', parkingTollFuel: '0',
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

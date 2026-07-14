import {
  calculateCarLoan,
  calculateCreditCard,
  calculateFaraid,
  calculateHomeLoan,
  calculatePersonalLoan,
  calculatePtptn,
  parseNumber,
  type CalculatorKey,
} from '@/lib/calculators';
import type { CalculatorOutcome, FormState } from '@/lib/app-model';

export function calculateFromForm(
  calculator: CalculatorKey,
  form: FormState,
): CalculatorOutcome {
  switch (calculator) {
    case 'home':
      return calculateHomeLoan({
        propertyPrice: parseNumber(form.propertyPrice),
        downPaymentPercent: parseNumber(form.downPaymentPercent),
        annualRatePercent: parseNumber(form.annualRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        monthlyIncome: parseNumber(form.monthlyIncome),
        existingCommitments: parseNumber(form.existingCommitments),
        targetDsrPercent: parseNumber(form.targetDsrPercent),
      });
    case 'car':
      return calculateCarLoan({
        vehiclePrice: parseNumber(form.vehiclePrice),
        downPaymentPercent: parseNumber(form.downPaymentPercent),
        annualFlatRatePercent: parseNumber(form.annualFlatRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        upfrontFees: parseNumber(form.upfrontFees),
      });
    case 'personal':
      return calculatePersonalLoan({
        principal: parseNumber(form.principal),
        annualRatePercent: parseNumber(form.annualRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        upfrontFees: parseNumber(form.upfrontFees),
        stampDutyRatePercent: parseNumber(form.stampDutyRatePercent),
        method: form.method === 'flat' ? 'flat' : 'reducing',
      });
    case 'credit':
      return calculateCreditCard({
        outstandingBalance: parseNumber(form.outstandingBalance),
        annualFinanceChargePercent: parseNumber(form.annualFinanceChargePercent),
        monthlyPayment: parseNumber(form.monthlyPayment),
        monthlyNewSpending: parseNumber(form.monthlyNewSpending),
        minimumPaymentPercent: parseNumber(form.minimumPaymentPercent),
        minimumPaymentFloor: parseNumber(form.minimumPaymentFloor),
      });
    case 'ptptn':
      return calculatePtptn({
        outstandingBalance: parseNumber(form.outstandingBalance),
        annualUjrahRatePercent: parseNumber(form.annualUjrahRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        extraMonthlyPayment: parseNumber(form.extraMonthlyPayment),
        method: form.method === 'flat' ? 'flat' : 'reducing',
      });
    case 'faraid':
      return calculateFaraid({
        grossEstate: parseNumber(form.grossEstate),
        debtsAndExpenses: parseNumber(form.debtsAndExpenses),
        wasiyyah: parseNumber(form.wasiyyah),
        deceasedGender: form.deceasedGender === 'female' ? 'female' : 'male',
        wives: parseNumber(form.wives),
        hasHusband: form.hasHusband === 'true',
        sons: parseNumber(form.sons),
        daughters: parseNumber(form.daughters),
        hasFather: form.hasFather === 'true',
        hasMother: form.hasMother === 'true',
      });
  }
}

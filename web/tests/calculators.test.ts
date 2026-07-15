import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCarLoan,
  calculateCreditCard,
  calculateFaraid,
  calculateHomeLoan,
  calculatePersonalLoan,
  calculatePtptn,
} from '../src/lib/calculators.ts';

function closeTo(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
}

test('home loan uses reducing-balance repayment and Malaysia upfront estimates', () => {
  const result = calculateHomeLoan({
    propertyPrice: 500_000,
    downPaymentPercent: 10,
    annualRatePercent: 4,
    tenureYears: 30,
    monthlyIncome: 8_000,
    existingCommitments: 500,
    targetDsrPercent: 60,
    extraMonthlyPayment: 0,
    settlementYears: 0,
  });

  closeTo(result.comparison!.monthlyPayment, 2_148.37);
  closeTo(result.comparison!.totalRepayment, 773_412.78);
  assert.ok(result.comparison!.upfrontCash > 50_000);
  assert.equal(result.comparison!.durationMonths, 360);
});

test('home loan extra payments shorten payoff and estimate early settlement', () => {
  const baseInput = {
    propertyPrice: 500_000,
    downPaymentPercent: 10,
    annualRatePercent: 4,
    tenureYears: 30,
    monthlyIncome: 8_000,
    existingCommitments: 500,
    targetDsrPercent: 60,
  };
  const regular = calculateHomeLoan({ ...baseInput, extraMonthlyPayment: 0, settlementYears: 0 });
  const accelerated = calculateHomeLoan({ ...baseInput, extraMonthlyPayment: 500, settlementYears: 10 });

  assert.ok(accelerated.comparison!.durationMonths! < regular.comparison!.durationMonths!);
  assert.ok(accelerated.comparison!.totalRepayment < regular.comparison!.totalRepayment);
  const interestSaved = accelerated.rows!.find((row) => row.label === 'Interest saved')!;
  const settlementBalance = accelerated.rows!.find((row) => row.label === 'Estimated settlement balance')!;
  assert.ok(Number(interestSaved.value.replace(/[^\d.]/g, '')) > 0);
  assert.ok(Number(settlementBalance.value.replace(/[^\d.]/g, '')) > 0);
});

test('car loan uses flat-rate hire purchase math', () => {
  const result = calculateCarLoan({
    vehiclePrice: 90_000,
    downPaymentPercent: 10,
    annualFlatRatePercent: 3,
    tenureYears: 7,
    upfrontFees: 500,
  });

  closeTo(result.comparison!.monthlyPayment, 1_166.79);
  closeTo(result.comparison!.totalRepayment, 98_010);
  closeTo(result.comparison!.upfrontCash, 9_500);
});

test('personal loan handles zero-rate reducing balance', () => {
  const result = calculatePersonalLoan({
    principal: 12_000,
    annualRatePercent: 0,
    tenureYears: 1,
    upfrontFees: 0,
    stampDutyRatePercent: 0.5,
    method: 'reducing',
  });

  closeTo(result.comparison!.monthlyPayment, 1_000);
  closeTo(result.comparison!.totalRepayment, 12_000);
});

test('credit card payoff clears a zero-interest balance on schedule', () => {
  const result = calculateCreditCard({
    outstandingBalance: 1_000,
    annualFinanceChargePercent: 0,
    monthlyPayment: 100,
    monthlyNewSpending: 0,
    minimumPaymentPercent: 5,
    minimumPaymentFloor: 50,
  });

  assert.equal(result.comparison!.durationMonths, 10);
  closeTo(result.comparison!.totalRepayment, 1_000);
});

test('PTPTN zero-Ujrah schedule respects extra monthly payments', () => {
  const result = calculatePtptn({
    outstandingBalance: 12_000,
    annualUjrahRatePercent: 0,
    tenureYears: 10,
    extraMonthlyPayment: 100,
    method: 'reducing',
  });

  closeTo(result.comparison!.monthlyPayment, 200);
  assert.equal(result.comparison!.durationMonths, 60);
  closeTo(result.comparison!.totalRepayment, 12_000);
});

test('Faraid allocation preserves the estate and the two-to-one child ratio', () => {
  const result = calculateFaraid({
    grossEstate: 500_000,
    debtsAndExpenses: 0,
    wasiyyah: 0,
    deceasedGender: 'male',
    wives: 1,
    hasHusband: false,
    sons: 1,
    daughters: 1,
    hasFather: true,
    hasMother: true,
  });
  const total = result.shares.reduce((sum, share) => sum + share.amount, 0);
  const son = result.shares.find((share) => share.heir === 'Son')!;
  const daughter = result.shares.find((share) => share.heir === 'Daughter')!;

  closeTo(total, 500_000);
  closeTo(son.amount, daughter.amount * 2);
});

test('invalid optional values and fractional heir counts are rejected', () => {
  assert.throws(() => calculateCarLoan({
    vehiclePrice: 50_000,
    downPaymentPercent: 10,
    annualFlatRatePercent: 3,
    tenureYears: 5,
    upfrontFees: -1,
  }), /Upfront fees cannot be negative/);

  assert.throws(() => calculateCreditCard({
    outstandingBalance: 1_000,
    annualFinanceChargePercent: 18,
    monthlyPayment: 100,
    monthlyNewSpending: 0,
    minimumPaymentPercent: 101,
    minimumPaymentFloor: 50,
  }), /Minimum payment must be 100% or below/);

  assert.throws(() => calculateFaraid({
    grossEstate: 100_000,
    debtsAndExpenses: 0,
    wasiyyah: 0,
    deceasedGender: 'male',
    wives: 0,
    hasHusband: false,
    sons: 1.5,
    daughters: 0,
    hasFather: false,
    hasMother: false,
  }), /Son count must be a whole number/);
});

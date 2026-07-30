import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateHousingPurchase,
  calculateLoanStampDuty,
  calculateMOTStampDuty,
} from '../src/lib/finance/housing-finance-engine.ts';
import {
  effectiveInterestRate,
  personalLoanQuote,
} from '../src/lib/finance/personal-loan-engine.ts';
import {
  bnplTrueCost,
  minimumPaymentTrap,
} from '../src/lib/finance/credit-card-literacy-engine.ts';
import {
  ptptnRepayment,
  settlementWithDiscount,
} from '../src/lib/finance/ptptn-literacy-engine.ts';
import {
  deriveCalculatorDefaults,
  financingContext,
  financialHealthScore,
  type UserProfile,
} from '../src/lib/finance/profile-engine.ts';

function closeTo(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
}

const profile: UserProfile = {
  age: 30,
  citizenship: 'citizen',
  financingPreference: 'islamic',
  isMuslim: true,
  ownsResidentialProperty: false,
  propertiesOwned: 0,
  grossMonthlySalary: 8_000,
  otherMonthlyIncome: 0,
  existingMonthlyCommitments: 500,
  monthlyTax: 500,
  creditCardTotalLimit: 10_000,
  creditCardBalance: 2_000,
  emergencyFundMonths: 1,
  epfBalance: 10_000,
  monthlySavings: 500,
  savingsGoal: 10_000,
  hasLifeOrTakaful: false,
  hasMedicalCard: false,
  hasMortgageCover: false,
  ctosBand: 'good',
  recentLatePayments12m: 0,
};

test('Malaysia 2026 housing rules apply first-home stamp-duty relief', () => {
  const mot = calculateMOTStampDuty({ propertyPrice: 500_000, buyerType: 'citizen', firstHome: true });
  const loanDuty = calculateLoanStampDuty({ loanAmount: 450_000, propertyPrice: 500_000, buyerType: 'citizen', firstHome: true });
  const quote = calculateHousingPurchase({
    propertyPrice: 500_000,
    downPaymentPercent: 10,
    annualRatePercent: 4,
    tenureYears: 30,
    grossMonthlyIncome: 8_000,
    existingCommitments: 500,
    buyerType: 'citizen',
    firstHome: true,
  });

  assert.equal(mot.netDuty, 0);
  assert.equal(loanDuty.netDuty, 0);
  closeTo(quote.monthlyCommitment.total, 2_148.37);
  assert.equal(quote.taxRelief.annualCap, 7_000);
});

test('foreign MOT duty uses the configured flat 8% rate', () => {
  const duty = calculateMOTStampDuty({ propertyPrice: 1_200_000, buyerType: 'foreign', firstHome: false });
  assert.equal(duty.netDuty, 96_000);
});

test('personal loan exposes EIR and calculates stamp duty as a percentage', () => {
  const quote = personalLoanQuote({ principal: 20_000, ratePercent: 6, years: 5, method: 'flat' });
  closeTo(quote.monthlyInstalment, 433.33);
  closeTo(quote.eirPercent, 10.85);
  closeTo(quote.stampDuty, 100);
  closeTo(quote.totalCost, 26_100);
  closeTo(effectiveInterestRate(20_000, quote.monthlyInstalment, 60), 10.85);
});

test('credit-card literacy surfaces minimum-payment and BNPL costs', () => {
  const trap = minimumPaymentTrap({ balance: 5_000, aprPercent: 18 });
  const bnpl = bnplTrueCost({ purchaseAmount: 1_000, lateFee: 30, weeksLate: 4 });
  assert.ok(trap.minimumOnly.months > 60);
  assert.ok(trap.minimumOnly.totalInterest > 1_000);
  closeTo(bnpl.effectiveAPRPercent, 39);
});

test('PTPTN exposes the 2026 settlement discount and minimum payment warning', () => {
  const settlement = settlementWithDiscount(10_000, 'full-settlement');
  const repayment = ptptnRepayment({ outstandingBalance: 10_000, ujrahRatePercent: 1, tenureYears: 10 });
  assert.equal(settlement.amountToPay, 8_500);
  assert.equal(settlement.saving, 1_500);
  assert.equal(repayment.minInstalment, 150);
  assert.equal(repayment.belowMinimum, true);
});

test('profile context resolves Islamic products and calculator defaults', () => {
  const context = financingContext(profile);
  const defaults = deriveCalculatorDefaults(profile);
  const health = financialHealthScore(profile);
  assert.equal(context.resolved, 'islamic');
  assert.equal(context.products.car, 'AITAB');
  assert.equal(defaults.home.firstHome, true);
  assert.equal(defaults.home.existingCommitments, 500);
  assert.equal(defaults.personal.financingType, 'islamic');
  assert.ok(health.overall > 0);
  assert.ok(health.dsrNet > 0);
});

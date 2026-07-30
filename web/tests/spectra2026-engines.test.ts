import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateHousingPurchase,
  calculateLoanStampDuty,
  calculateMOTStampDuty,
  calculateDSR,
  netMonthlyIncome,
  epfEmployeeRateForAge,
  maxAffordablePrice,
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

test('EPF employee rate halves at 60 and lifts net income', () => {
  const under60 = netMonthlyIncome({ grossMonthlyIncome: 6_000, age: 45 });
  const at60 = netMonthlyIncome({ grossMonthlyIncome: 6_000, age: 60 });
  const unknownAge = netMonthlyIncome({ grossMonthlyIncome: 6_000 });

  assert.equal(under60.epf, 660);           // 11%
  assert.equal(at60.epf, 330);              // 5.5% from age 60
  assert.equal(unknownAge.epf, 660);        // unknown age keeps the under-60 default
  assert.ok(at60.net > under60.net, 'a 60-year-old keeps more of the same salary');
  assert.equal(epfEmployeeRateForAge(59), 0.11);
  assert.equal(epfEmployeeRateForAge(60), 0.055);
});

test('DSR verdict bands on gross income, the basis banks assess', () => {
  // RM5,000 gross, RM2,400 total commitments: 48% of gross, but ~55% of net.
  // Both land in "stretched" only because gross is used; net alone would over-penalise.
  const dsr = calculateDSR({
    income: { grossMonthlyIncome: 5_000, age: 35 },
    existingCommitments: 2_400,
    newInstalment: 0,
  });

  assert.equal(dsr.verdictBasis, 'gross');
  assert.equal(dsr.dsrGross, 48);
  assert.ok(dsr.dsrNet > dsr.dsrGross, 'net DSR is always the harsher number');
  assert.equal(dsr.verdict, 'stretched');

  // A borrower at 39% of gross must read as comfortable, matching a bank's view.
  const comfortable = calculateDSR({
    income: { grossMonthlyIncome: 10_000, age: 35 },
    existingCommitments: 3_900,
    newInstalment: 0,
  });
  assert.equal(comfortable.dsrGross, 39);
  assert.equal(comfortable.verdict, 'comfortable');
});

test('maxAffordablePrice solves the reverse question and respects the gross DSR budget', () => {
  const result = maxAffordablePrice({
    grossMonthlyIncome: 6_000,
    existingCommitments: 800,
    age: 30,
    targetDsrPercent: 40,
    annualRatePercent: 4,
    tenureYears: 35,
    downPaymentPercent: 10,
  });

  // Budget = 40% of RM6,000 gross, less RM800 existing = RM1,600/month.
  assert.equal(result.instalmentBudget, 1_600);
  assert.equal(result.basis, 'gross');
  assert.equal(result.limitedBy, 'dsr');

  // The instalment must fit the budget, and the price must be the largest that does.
  assert.ok(result.monthlyInstalment <= result.instalmentBudget);
  assert.ok(result.maxPropertyPrice > 0);
  assert.equal(result.maxPropertyPrice % 1000, 0, 'price is rounded down to a shoppable figure');

  // Total DSR on gross lands at or just under the target — never above it.
  assert.ok(result.dsrGross <= 40 + 0.01, `dsrGross ${result.dsrGross} exceeded target`);
  assert.ok(result.dsrNet > result.dsrGross, 'net DSR is always the harsher number');

  // Upfront cash must exceed the bare down payment: duties, legal fees and valuation.
  assert.ok(result.upfrontCashNeeded > result.maxPropertyPrice * 0.1);
});

test('maxAffordablePrice returns zero when commitments already exhaust the DSR budget', () => {
  const result = maxAffordablePrice({
    grossMonthlyIncome: 4_000,
    existingCommitments: 2_000, // already 50% of gross, past a 40% target
    targetDsrPercent: 40,
    annualRatePercent: 4,
    tenureYears: 35,
  });

  assert.equal(result.limitedBy, 'zero-budget');
  assert.equal(result.maxPropertyPrice, 0);
  assert.equal(result.monthlyInstalment, 0);
  assert.equal(result.instalmentBudget, 0);
});

test('maxAffordablePrice is consistent with calculateHousingPurchase at the same price', () => {
  const affordable = maxAffordablePrice({
    grossMonthlyIncome: 8_000,
    existingCommitments: 0,
    age: 30,
    targetDsrPercent: 40,
    annualRatePercent: 4,
    tenureYears: 30,
    downPaymentPercent: 10,
  });

  const forward = calculateHousingPurchase({
    propertyPrice: affordable.maxPropertyPrice,
    downPaymentPercent: 10,
    annualRatePercent: 4,
    tenureYears: 30,
    buyerType: 'citizen',
    firstHome: true,
    grossMonthlyIncome: 8_000,
    existingCommitments: 0,
    targetDsrPercent: 40,
  });

  // The reverse solver and the forward calculator must agree on the instalment.
  assert.equal(forward.monthlyCommitment.baseInstalment, affordable.monthlyInstalment);
  assert.equal(forward.affordability?.dsrGross, affordable.dsrGross);
});

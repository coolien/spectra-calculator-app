import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAmortisationSchedule,
  eirToFlat,
  flatToEIR,
  monthlyFromEIR,
  monthlyFromFlat,
  outstandingBalanceReducing,
  publishedGuideQuoteFromEIR,
  ruleOf78Rebate,
  statutoryCapFor,
  totalCostOfOwnership,
} from '../src/lib/finance/hirePurchase.ts';

const principalSen = 100_000 * 100;

test('official guide flat-rate example converts to the published EIR reference', () => {
  assert.equal(monthlyFromFlat(principalSen, 3, 108), 117_593);
  assert.equal(principalSen * 3 / 100 * 9, 2_700_000);
  assert.ok(Math.abs(flatToEIR(3, 108) - 5.5) < 0.01);
  assert.equal(Math.round(eirToFlat(flatToEIR(3, 108), 108) * 100) / 100, 3);
});

test('official guide EIR example is reproducible at its published display precision', () => {
  const quote = publishedGuideQuoteFromEIR(principalSen, 5, 108);
  assert.equal(quote.monthlySen, 115_176);
  assert.equal(quote.totalInterestSen, 2_439_000);

  // The underlying engine remains the standard reducing-balance annuity.
  assert.equal(monthlyFromEIR(principalSen, 5, 108), 115_173);
});

test('statutory caps follow fixed tenure boundaries and variable-rate rule', () => {
  assert.equal(statutoryCapFor('fixed', 60), 17);
  assert.equal(statutoryCapFor('fixed', 61), 16);
  assert.equal(statutoryCapFor('variable', 108), 17);
});

test('Rule of 78 rebate uses k(k+1) / n(n+1)', () => {
  const totalChargesSen = 2_700_000;
  const k = 6;
  const n = 12;
  const expected = Math.round(totalChargesSen * k * (k + 1) / (n * (n + 1)));
  assert.equal(ruleOf78Rebate(totalChargesSen, k, n), expected);
});

test('every reducing-balance schedule closes at exactly zero sen', () => {
  for (const annualEIRPercent of [0, 5, 16, 17]) {
    const schedule = buildAmortisationSchedule(principalSen, annualEIRPercent, 108);
    assert.equal(schedule.length, 108);
    assert.equal(schedule.at(-1)?.outstandingBalanceSen, 0);
    assert.equal(schedule.reduce((sum, row) => sum + row.principalSen, 0), principalSen);
  }
});

test('outstanding balance is principal before payment and zero after final payment', () => {
  assert.equal(outstandingBalanceReducing(principalSen, 5, 108, 0), principalSen);
  assert.equal(outstandingBalanceReducing(principalSen, 5, 108, 108), 0);
  assert.ok(outstandingBalanceReducing(principalSen, 5, 108, 12) < principalSen);
});

test('total cost of ownership returns the true monthly cost', () => {
  const result = totalCostOfOwnership({
    instalmentSen: 115_173,
    upfrontCostsSen: 150_000,
    annualInsuranceSen: 300_000,
    annualRoadTaxSen: 90_000,
    annualMaintenanceSen: 120_000,
    monthlyParkingTollFuelSen: 50_000,
  });
  assert.equal(result.upfrontCostsSen, 150_000);
  assert.equal(result.recurringMonthlySen, 92_500);
  assert.equal(result.trueMonthlyCostSen, 207_673);
});

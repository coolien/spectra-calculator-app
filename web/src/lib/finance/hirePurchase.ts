/**
 * Hire-purchase finance calculations.
 *
 * The public money values in this module are integer sen.  Rates are annual
 * percentages (for example, `5` means 5.00% p.a.) and tenure is expressed in
 * months.  The calculation keeps full precision until a money value crosses a
 * public boundary; the returned money values are then rounded to the nearest
 * sen.  This keeps the module independent from the UI's display formatter.
 */

export type HirePurchaseRateType = 'fixed' | 'variable';

export type AmortisationRow = {
  period: number;
  openingBalanceSen: number;
  instalmentSen: number;
  interestSen: number;
  principalSen: number;
  outstandingBalanceSen: number;
};

export type TotalCostOfOwnershipInput = {
  instalmentSen: number;
  upfrontCostsSen?: number;
  /** Recurring costs entered as monthly amounts. */
  recurringMonthlySen?: number;
  /** Optional annual recurring costs, converted to monthly equivalents. */
  annualInsuranceSen?: number;
  annualRoadTaxSen?: number;
  annualMaintenanceSen?: number;
  annualTyresSen?: number;
  monthlyParkingTollFuelSen?: number;
};

export type TotalCostOfOwnership = {
  upfrontCostsSen: number;
  recurringMonthlySen: number;
  trueMonthlyCostSen: number;
};

const MONTHS_PER_YEAR = 12;
const MAX_BISECTION_ITERATIONS = 160;
const BISECTION_TOLERANCE = 1e-10;

/**
 * Calculates the scheduled monthly instalment for an EIR reducing-balance
 * agreement. `principalSen` is the amount financed, not the vehicle price.
 */
export function monthlyFromEIR(
  principalSen: number,
  annualEIRPercent: number,
  tenureMonths: number,
): number {
  assertPrincipalAndTerm(principalSen, tenureMonths);
  assertRate(annualEIRPercent, 'EIR');

  const monthlyRate = monthlyRateFromAnnualPercent(annualEIRPercent);
  if (monthlyRate === 0) {
    return roundSen(principalSen / tenureMonths);
  }

  const paymentSen = principalSen * monthlyRate
    / (1 - Math.pow(1 + monthlyRate, -tenureMonths));
  return roundSen(paymentSen);
}

/**
 * Calculates the legacy flat-rate monthly instalment.
 *
 * Flat-rate charges are based on the original principal for every year of the
 * agreement. The input term is in months so the conversion remains explicit
 * and cannot accidentally treat a month count as a year count.
 */
export function monthlyFromFlat(
  principalSen: number,
  annualFlatRatePercent: number,
  tenureMonths: number,
): number {
  assertPrincipalAndTerm(principalSen, tenureMonths);
  assertRate(annualFlatRatePercent, 'Flat rate');

  const years = tenureMonths / MONTHS_PER_YEAR;
  const totalInterestSen = principalSen * annualFlatRatePercent / 100 * years;
  return roundSen((principalSen + totalInterestSen) / tenureMonths);
}

/**
 * Converts a legacy flat rate to the equivalent annual EIR that reproduces the
 * same unrounded instalment stream over the same tenure.
 */
export function flatToEIR(
  annualFlatRatePercent: number,
  tenureMonths: number,
): number {
  assertTerm(tenureMonths);
  assertRate(annualFlatRatePercent, 'Flat rate');

  const years = tenureMonths / MONTHS_PER_YEAR;
  const paymentToPrincipal = (1 + annualFlatRatePercent / 100 * years) / tenureMonths;
  return solveAnnualRateForPaymentRatio(paymentToPrincipal, tenureMonths);
}

/**
 * Converts an annual reducing-balance EIR to its equivalent annual flat rate.
 */
export function eirToFlat(
  annualEIRPercent: number,
  tenureMonths: number,
): number {
  assertTerm(tenureMonths);
  assertRate(annualEIRPercent, 'EIR');

  const monthlyRate = monthlyRateFromAnnualPercent(annualEIRPercent);
  const paymentToPrincipal = monthlyRate === 0
    ? 1 / tenureMonths
    : monthlyRate / (1 - Math.pow(1 + monthlyRate, -tenureMonths));
  const years = tenureMonths / MONTHS_PER_YEAR;
  return ((paymentToPrincipal * tenureMonths - 1) / years) * 100;
}

/**
 * Builds a sen-accurate reducing-balance schedule. The final instalment is
 * adjusted by a few sen when necessary so the closing outstanding balance is
 * exactly zero rather than a floating-point residue.
 */
export function buildAmortisationSchedule(
  principalSen: number,
  annualEIRPercent: number,
  tenureMonths: number,
  instalmentSen = monthlyFromEIR(principalSen, annualEIRPercent, tenureMonths),
): AmortisationRow[] {
  assertPrincipalAndTerm(principalSen, tenureMonths);
  assertRate(annualEIRPercent, 'EIR');
  assertMoney(instalmentSen, 'Instalment');
  if (instalmentSen <= 0) {
    throw new RangeError('Instalment must be above 0 sen.');
  }

  const monthlyRate = monthlyRateFromAnnualPercent(annualEIRPercent);
  const schedule: AmortisationRow[] = [];
  let outstandingBalanceSen = roundSen(principalSen);

  for (let period = 1; period <= tenureMonths && outstandingBalanceSen > 0; period += 1) {
    const openingBalanceSen = outstandingBalanceSen;
    const interestSen = roundSen(openingBalanceSen * monthlyRate);
    const scheduledPrincipalSen = Math.max(0, instalmentSen - interestSen);
    const principalSenForPeriod = Math.min(openingBalanceSen, scheduledPrincipalSen);
    const actualInstalmentSen = roundSen(interestSen + principalSenForPeriod);
    outstandingBalanceSen = Math.max(0, roundSen(openingBalanceSen - principalSenForPeriod));

    schedule.push({
      period,
      openingBalanceSen,
      instalmentSen: actualInstalmentSen,
      interestSen,
      principalSen: principalSenForPeriod,
      outstandingBalanceSen,
    });
  }

  // A payment below the interest due cannot amortise the loan. Fail loudly
  // instead of returning a partial schedule that looks valid to a consumer.
  if (schedule.length !== tenureMonths || outstandingBalanceSen !== 0) {
    throw new RangeError('Instalment does not amortise the financed amount within the tenure.');
  }
  return schedule;
}

/**
 * Returns the outstanding principal after `paymentsMade` completed payments.
 */
export function outstandingBalanceReducing(
  principalSen: number,
  annualEIRPercent: number,
  tenureMonths: number,
  paymentsMade: number,
): number {
  assertPrincipalAndTerm(principalSen, tenureMonths);
  assertRate(annualEIRPercent, 'EIR');
  if (!Number.isInteger(paymentsMade) || paymentsMade < 0 || paymentsMade > tenureMonths) {
    throw new RangeError('Payments made must be a whole number within the loan tenure.');
  }
  if (paymentsMade === tenureMonths) return 0;

  const schedule = buildAmortisationSchedule(principalSen, annualEIRPercent, tenureMonths);
  return schedule[paymentsMade - 1]?.outstandingBalanceSen ?? principalSen;
}

/**
 * Calculates the statutory Rule-of-78 rebate for a legacy agreement.
 * `remainingMonths` is k and `tenureMonths` is n in k(k+1) / n(n+1).
 */
export function ruleOf78Rebate(
  totalTermChargesSen: number,
  remainingMonths: number,
  tenureMonths: number,
): number {
  assertMoney(totalTermChargesSen, 'Total term charges');
  assertTerm(tenureMonths);
  if (!Number.isInteger(remainingMonths) || remainingMonths < 0 || remainingMonths > tenureMonths) {
    throw new RangeError('Remaining months must be a whole number within the tenure.');
  }
  return roundSen(totalTermChargesSen * remainingMonths * (remainingMonths + 1)
    / (tenureMonths * (tenureMonths + 1)));
}

/**
 * Returns the revised statutory EIR ceiling for the selected rate type.
 */
export function statutoryCapFor(
  rateType: HirePurchaseRateType,
  tenureMonths: number,
): number {
  assertTerm(tenureMonths);
  if (rateType !== 'fixed' && rateType !== 'variable') {
    throw new RangeError('Rate type must be fixed or variable.');
  }
  if (rateType === 'variable') return 17;
  return tenureMonths <= 60 ? 17 : 16;
}

/**
 * Calculates upfront costs, recurring monthly-equivalent costs, and the true
 * monthly cost of ownership. Annual recurring values are divided by 12 and
 * combined with any values already entered as monthly amounts.
 */
export function totalCostOfOwnership(
  input: TotalCostOfOwnershipInput,
): TotalCostOfOwnership;
export function totalCostOfOwnership(
  instalmentSen: number,
  recurringMonthlySen: number,
  upfrontCostsSen?: number,
): TotalCostOfOwnership;
export function totalCostOfOwnership(
  inputOrInstalment: TotalCostOfOwnershipInput | number,
  recurringMonthlySen = 0,
  upfrontCostsSen = 0,
): TotalCostOfOwnership {
  const input: TotalCostOfOwnershipInput = typeof inputOrInstalment === 'number'
    ? { instalmentSen: inputOrInstalment, recurringMonthlySen, upfrontCostsSen }
    : inputOrInstalment;

  assertMoney(input.instalmentSen, 'Instalment');
  assertMoney(input.upfrontCostsSen ?? 0, 'Upfront costs');
  assertMoney(input.recurringMonthlySen ?? 0, 'Recurring monthly costs');
  assertMoney(input.monthlyParkingTollFuelSen ?? 0, 'Monthly parking, toll and fuel costs');
  assertAnnualMoney(input.annualInsuranceSen ?? 0, 'Annual insurance or takaful');
  assertAnnualMoney(input.annualRoadTaxSen ?? 0, 'Annual road tax');
  assertAnnualMoney(input.annualMaintenanceSen ?? 0, 'Annual maintenance');
  assertAnnualMoney(input.annualTyresSen ?? 0, 'Annual tyres');

  const annualCostsSen = (input.annualInsuranceSen ?? 0)
    + (input.annualRoadTaxSen ?? 0)
    + (input.annualMaintenanceSen ?? 0)
    + (input.annualTyresSen ?? 0);
  const recurringMonthly = roundSen(
    (input.recurringMonthlySen ?? 0)
      + (input.monthlyParkingTollFuelSen ?? 0)
      + annualCostsSen / MONTHS_PER_YEAR,
  );

  return {
    upfrontCostsSen: roundSen(input.upfrontCostsSen ?? 0),
    recurringMonthlySen: recurringMonthly,
    trueMonthlyCostSen: roundSen(input.instalmentSen + recurringMonthly),
  };
}

/**
 * The guide's table rounds total interest to the nearest RM10 for presentation.
 * This helper is intentionally separate from the finance engine so source-guide
 * examples can be reproduced without changing the underlying sen schedule.
 */
export function publishedGuideQuoteFromEIR(
  principalSen: number,
  annualEIRPercent: number,
  tenureMonths: number,
): { monthlySen: number; totalInterestSen: number } {
  assertPrincipalAndTerm(principalSen, tenureMonths);
  assertRate(annualEIRPercent, 'EIR');
  const exactMonthlySen = monthlyFromEIR(principalSen, annualEIRPercent, tenureMonths);
  const exactTotalInterestSen = exactMonthlySen * tenureMonths - principalSen;
  const publishedTotalInterestSen = Math.round(exactTotalInterestSen / 1000) * 1000;
  return {
    monthlySen: roundSen((principalSen + publishedTotalInterestSen) / tenureMonths),
    totalInterestSen: publishedTotalInterestSen,
  };
}

function solveAnnualRateForPaymentRatio(paymentToPrincipal: number, tenureMonths: number): number {
  const zeroRatePayment = 1 / tenureMonths;
  if (Math.abs(paymentToPrincipal - zeroRatePayment) <= BISECTION_TOLERANCE) return 0;
  if (paymentToPrincipal < zeroRatePayment) {
    throw new RangeError('Payment must be at least the zero-rate principal repayment.');
  }

  let lowMonthlyRate = 0;
  let highMonthlyRate = 1;
  for (let iteration = 0; iteration < MAX_BISECTION_ITERATIONS; iteration += 1) {
    const midMonthlyRate = (lowMonthlyRate + highMonthlyRate) / 2;
    const paymentAtMid = annuityPaymentRatio(midMonthlyRate, tenureMonths);
    if (paymentAtMid < paymentToPrincipal) {
      lowMonthlyRate = midMonthlyRate;
    } else {
      highMonthlyRate = midMonthlyRate;
    }
    if (highMonthlyRate - lowMonthlyRate <= BISECTION_TOLERANCE) break;
  }
  return ((lowMonthlyRate + highMonthlyRate) / 2) * MONTHS_PER_YEAR * 100;
}

function annuityPaymentRatio(monthlyRate: number, tenureMonths: number): number {
  if (monthlyRate === 0) return 1 / tenureMonths;
  return monthlyRate / (1 - Math.pow(1 + monthlyRate, -tenureMonths));
}

function monthlyRateFromAnnualPercent(annualRatePercent: number): number {
  return annualRatePercent / 100 / MONTHS_PER_YEAR;
}

function roundSen(value: number): number {
  return Math.round(value + Number.EPSILON);
}

function assertPrincipalAndTerm(principalSen: number, tenureMonths: number): void {
  assertMoney(principalSen, 'Principal');
  if (principalSen <= 0) throw new RangeError('Principal must be above 0 sen.');
  assertTerm(tenureMonths);
}

function assertTerm(tenureMonths: number): void {
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) {
    throw new RangeError('Tenure must be a positive whole number of months.');
  }
}

function assertRate(ratePercent: number, label: string): void {
  if (!Number.isFinite(ratePercent) || ratePercent < 0) {
    throw new RangeError(`${label} cannot be negative.`);
  }
}

function assertMoney(valueSen: number, label: string): void {
  if (!Number.isFinite(valueSen) || !Number.isInteger(valueSen) || valueSen < 0) {
    throw new RangeError(`${label} must be a non-negative integer number of sen.`);
  }
}

function assertAnnualMoney(valueSen: number, label: string): void {
  assertMoney(valueSen, label);
}

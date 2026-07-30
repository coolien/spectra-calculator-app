import DEFAULT_CONFIG from './malaysia-2026-config.json' with { type: 'json' };
import { calculateDSR, round2, type DSRResult } from './housing-finance-engine.ts';

const CL = DEFAULT_CONFIG.carLoan;
export type RateType = 'fixed' | 'variable';
export type VehicleType = 'new' | 'used';

export function flatMonthly(principal: number, flatRatePercent: number, years: number): number {
  return (principal + principal * flatRatePercent / 100 * years) / Math.max(1, years * 12);
}
export function monthlyFromEIR(principal: number, eirPercent: number, months: number): number {
  const i = eirPercent / 100 / 12;
  return i === 0 ? principal / Math.max(1, months) : principal * i / (1 - Math.pow(1 + i, -months));
}
export function flatToEIR(flatRatePercent: number, months: number): number {
  const ratio = (1 + flatRatePercent / 100 * months / 12) / Math.max(1, months);
  let low = 0;
  let high = 1;
  for (let index = 0; index < 160; index += 1) {
    const mid = (low + high) / 2;
    const factor = mid === 0 ? 1 / months : mid / (1 - Math.pow(1 + mid, -months));
    if (factor < ratio) low = mid; else high = mid;
  }
  return round2((low + high) / 2 * 12 * 100);
}
export function reducingOutstanding(principal: number, eirPercent: number, months: number, paidMonths: number): number {
  const i = eirPercent / 100 / 12;
  const payment = monthlyFromEIR(principal, eirPercent, months);
  if (i === 0) return Math.max(0, principal - payment * paidMonths);
  return Math.max(0, principal * Math.pow(1 + i, paidMonths) - payment * ((Math.pow(1 + i, paidMonths) - 1) / i));
}
export function eirCapPercent(rateType: RateType, tenureMonths: number): number {
  const band = CL.eirCaps[rateType].find((item: { maxTenureMonths: number | null; capPercent: number }) => item.maxTenureMonths == null || tenureMonths <= item.maxTenureMonths);
  return band?.capPercent ?? 17;
}
export function withinEirCap(eirPercent: number, rateType: RateType, tenureMonths: number) { const cap = eirCapPercent(rateType, tenureMonths); return { cap, withinCap: eirPercent <= cap + 1e-9 }; }
export function maxTenureYears(vehicleType: VehicleType): number { return vehicleType === 'used' ? CL.tenureCaps.usedVehicleYears : CL.tenureCaps.newVehicleYears; }

export interface SettlementComparison { eirEquivalentPercent: number; monthlyInstalment: number; totalInterestFullTerm: number; settleAfterMonths: number; old: { interestCost: number; rebate: number; settlementAmount: number }; new: { interestCost: number; settlementAmount: number }; reformSaving: number; note: string }
export function earlySettlementComparison(principal: number, flatRatePercent: number, years: number, settleAfterYears: number): SettlementComparison {
  const months = Math.max(1, Math.round(years * 12));
  const paidMonths = Math.min(months, Math.max(0, Math.round(settleAfterYears * 12)));
  const remaining = months - paidMonths;
  const monthlyFlat = flatMonthly(principal, flatRatePercent, years);
  const totalInterest = monthlyFlat * months - principal;
  const rebate = totalInterest * remaining * (remaining + 1) / (months * (months + 1));
  const oldSettlement = Math.max(0, principal + totalInterest - monthlyFlat * paidMonths - rebate);
  const eirEquivalentPercent = flatToEIR(flatRatePercent, months);
  const reducingPayment = monthlyFromEIR(principal, eirEquivalentPercent, months);
  const reducingBalance = reducingOutstanding(principal, eirEquivalentPercent, months, paidMonths);
  const oldInterestCost = totalInterest - rebate;
  const newInterestCost = reducingPayment * paidMonths - (principal - reducingBalance);
  return { eirEquivalentPercent, monthlyInstalment: round2(monthlyFlat), totalInterestFullTerm: round2(totalInterest), settleAfterMonths: paidMonths, old: { interestCost: round2(oldInterestCost), rebate: round2(rebate), settlementAmount: round2(oldSettlement) }, new: { interestCost: round2(newInterestCost), settlementAmount: round2(reducingBalance) }, reformSaving: round2(Math.max(0, oldInterestCost - newInterestCost)), note: 'The 2026 reform is mainly a transparency and fairness change. For the same full-term cost, the early-settlement difference is usually modest.' };
}

export function carLoanDsr(args: { monthlyInstalment: number; grossMonthlyIncome: number; existingCommitments?: number; monthlyTax?: number; targetDsrPercent?: number }): DSRResult {
  return calculateDSR({ income: { grossMonthlyIncome: args.grossMonthlyIncome, monthlyTax: args.monthlyTax }, existingCommitments: args.existingCommitments ?? 0, newInstalment: args.monthlyInstalment, targetDsrPercent: args.targetDsrPercent });
}
export function trueMonthlyCost(args: { instalment: number; annualInsurance?: number; annualRoadTax?: number; annualMaintenance?: number; annualTyres?: number; monthlyParkingTollFuel?: number }) {
  const recurringMonthly = ((args.annualInsurance ?? 0) + (args.annualRoadTax ?? 0) + (args.annualMaintenance ?? 0) + (args.annualTyres ?? 0)) / 12 + (args.monthlyParkingTollFuel ?? 0);
  return { recurringMonthly: round2(recurringMonthly), trueMonthly: round2(args.instalment + recurringMonthly) };
}

export function carLoanReview(input: { vehiclePrice: number; downPaymentPercent: number; flatRatePercent: number; years: number; vehicleType?: VehicleType; rateType?: RateType; grossMonthlyIncome?: number; existingCommitments?: number; monthlyTax?: number; settleAfterYears?: number; costs?: Omit<Parameters<typeof trueMonthlyCost>[0], 'instalment'> }) {
  const vehicleType = input.vehicleType ?? 'new';
  const rateType = input.rateType ?? 'fixed';
  const months = Math.max(1, Math.round(input.years * 12));
  const downPayment = input.vehiclePrice * input.downPaymentPercent / 100;
  const financedAmount = input.vehiclePrice - downPayment;
  const monthlyInstalment = flatMonthly(financedAmount, input.flatRatePercent, input.years);
  const eirPercent = flatToEIR(input.flatRatePercent, months);
  const cap = withinEirCap(eirPercent, rateType, months);
  const dsr = input.grossMonthlyIncome != null ? carLoanDsr({ monthlyInstalment, grossMonthlyIncome: input.grossMonthlyIncome, existingCommitments: input.existingCommitments, monthlyTax: input.monthlyTax }) : null;
  const settlement = input.settleAfterYears != null ? earlySettlementComparison(financedAmount, input.flatRatePercent, input.years, input.settleAfterYears) : null;
  const tco = input.costs ? trueMonthlyCost({ instalment: monthlyInstalment, ...input.costs }) : null;
  return { financedAmount: round2(financedAmount), downPayment: round2(downPayment), monthlyInstalment: round2(monthlyInstalment), flatRatePercent: input.flatRatePercent, eirPercent, totalInterest: round2(monthlyInstalment * months - financedAmount), statutoryCap: cap.cap, withinCap: cap.withinCap, marginWithinCap: financedAmount / Math.max(1, input.vehiclePrice) <= CL.marginOfFinanceMax + 1e-9, tenureWithinCap: input.years <= maxTenureYears(vehicleType), maxTenureYears: maxTenureYears(vehicleType), dsr, settlement, tco };
}

export { CL as CAR_LOAN_CONFIG };

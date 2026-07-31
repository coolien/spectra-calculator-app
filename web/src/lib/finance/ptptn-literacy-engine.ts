import DEFAULT_CONFIG from './malaysia-2026-config.json' with { type: 'json' };
import { calculateDSR, calculateLoanAmortization, netMonthlyIncome, reducingBalanceInstalment, round2 } from './housing-finance-engine.ts';

const P = DEFAULT_CONFIG.ptptn;

export interface PtptnRepaymentInput { outstandingBalance: number; ujrahRatePercent?: number; tenureYears: number; method?: 'reducing' | 'flat'; extraMonthlyPayment?: number }
export interface PtptnRepaymentResult { method: 'reducing' | 'flat'; scheduledInstalment: number; plannedInstalment: number; belowMinimum: boolean; minInstalment: number; totalUjrah: number; payoffMonths: number; totalRepayment: number }
export function ptptnRepayment(input: PtptnRepaymentInput): PtptnRepaymentResult {
  const rate = input.ujrahRatePercent ?? P.ujrahRatePerAnnum * 100;
  const method = input.method ?? 'reducing';
  const months = Math.max(1, Math.round(input.tenureYears * 12));
  const extra = Math.max(0, input.extraMonthlyPayment ?? 0);
  if (method === 'flat') {
    const totalUjrah = input.outstandingBalance * rate / 100 * input.tenureYears;
    const scheduled = (input.outstandingBalance + totalUjrah) / months;
    return { method, scheduledInstalment: round2(scheduled), plannedInstalment: round2(scheduled + extra), belowMinimum: scheduled + extra < P.minMonthlyInstalment, minInstalment: P.minMonthlyInstalment, totalUjrah: round2(totalUjrah), payoffMonths: months, totalRepayment: round2(input.outstandingBalance + totalUjrah) };
  }
  const scheduled = reducingBalanceInstalment(input.outstandingBalance, rate, months);
  const amortization = calculateLoanAmortization({ principal: input.outstandingBalance, annualRatePercent: rate, tenureYears: input.tenureYears, extraMonthlyPayment: extra });
  return { method, scheduledInstalment: round2(scheduled), plannedInstalment: round2(scheduled + extra), belowMinimum: scheduled + extra < P.minMonthlyInstalment, minInstalment: P.minMonthlyInstalment, totalUjrah: amortization.totalInterest, payoffMonths: amortization.actualMonths, totalRepayment: amortization.totalRepayment };
}

export interface SettlementResult { discountType: string; discountRate: number; grossBalance: number; amountToPay: number; saving: number; label: string; discountActive: boolean; note: string; expiredScheme?: { periodFrom: string; periodTo: string } }

/**
 * Settlement quote for a PTPTN balance.
 *
 * PTPTN offers NO repayment discount at present. Its last scheme ran
 * 14 Oct 2023 – 31 Mar 2024 and expired; PTPTN has stated publicly that Budget
 * 2026 introduced none. This function therefore returns a zero discount, and
 * says so, rather than quoting a saving that will not materialise at the counter.
 *
 * Config previously carried a 15% full-settlement discount. It was wrong twice
 * over — the scheme had expired, and the 15% belonged to salary deduction, not
 * full settlement. See docs/RATE_AUDIT_2026-07-30.md, DISPUTED-1.
 *
 * If PTPTN announces a new scheme, set `ptptn.discountsActive` and repopulate
 * `ptptn.discounts2026`; this function needs no change beyond that.
 */
export function settlementWithDiscount(outstandingBalance: number, discountType: 'full-settlement' | 'partial-or-salary-deduction' | 'consistent-scheduled' = 'full-settlement'): SettlementResult {
  const balance = Math.max(0, outstandingBalance);
  // Typed explicitly: with no active scheme the JSON array is empty, which TypeScript
  // would otherwise infer as never[].
  const tiers = P.discounts2026 as { type: string; rate: number; label: string }[];
  const active = P.discountsActive === true && tiers.length > 0;
  const discount = active ? (tiers.find((item) => item.type === discountType) ?? tiers[0]) : null;
  const rate = discount?.rate ?? 0;
  const saving = balance * rate;

  return {
    discountType: discount?.type ?? discountType,
    discountRate: rate,
    grossBalance: round2(balance),
    amountToPay: round2(balance - saving),
    saving: round2(saving),
    label: discount?.label ?? 'No PTPTN repayment discount is currently offered',
    discountActive: active,
    note: active ? '' : P.discountsNote,
    ...(active ? {} : { expiredScheme: { periodFrom: P.expiredDiscountScheme.periodFrom, periodTo: P.expiredDiscountScheme.periodTo } }),
  };
}

export interface PtptnDsrImpactResult { monthlyCommitment: number; netIncome: number; dsrContributionPercent: number; homeLoanCapacityLost: number; reportedToCCRIS: boolean; reminder: string }
export function ptptnDsrImpact(args: { monthlyInstalment: number; grossMonthlyIncome: number; monthlyTax?: number; benchmarkHomeLoanRatePercent?: number; benchmarkTenureYears?: number }): PtptnDsrImpactResult {
  const net = netMonthlyIncome({ grossMonthlyIncome: args.grossMonthlyIncome, monthlyTax: args.monthlyTax }).net;
  const rate = args.benchmarkHomeLoanRatePercent ?? 4;
  const years = args.benchmarkTenureYears ?? 35;
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const principalPerRinggit = monthlyRate > 0 ? (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate : months;
  return { monthlyCommitment: round2(args.monthlyInstalment), netIncome: round2(net), dsrContributionPercent: net > 0 ? round2(args.monthlyInstalment / net * 100) : 0, homeLoanCapacityLost: round2(args.monthlyInstalment * principalPerRinggit), reportedToCCRIS: P.creditReporting.reportedToCCRIS, reminder: 'PTPTN repayment is recorded on CCRIS and counts in DSR. Paying on time protects your next home, car-loan or card application.' };
}

export { P as PTPTN_CONFIG };

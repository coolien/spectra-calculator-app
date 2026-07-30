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

export interface SettlementResult { discountType: string; discountRate: number; grossBalance: number; amountToPay: number; saving: number; label: string }
export function settlementWithDiscount(outstandingBalance: number, discountType: 'full-settlement' | 'partial-or-salary-deduction' | 'consistent-scheduled' = 'full-settlement'): SettlementResult {
  const discount = P.discounts2026.find((item) => item.type === discountType) ?? P.discounts2026[0];
  const saving = outstandingBalance * discount.rate;
  return { discountType: discount.type, discountRate: discount.rate, grossBalance: round2(outstandingBalance), amountToPay: round2(outstandingBalance - saving), saving: round2(saving), label: discount.label };
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

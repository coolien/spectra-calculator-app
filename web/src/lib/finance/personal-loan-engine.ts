import DEFAULT_CONFIG from './malaysia-2026-config.json' with { type: 'json' };
import { calculateDSR, reducingBalanceInstalment, round2 } from './housing-finance-engine.ts';

const PL = DEFAULT_CONFIG.personalLoan;
export type InterestMethod = 'flat' | 'reducing';

export function flatMonthlyInstalment(principal: number, flatRatePercent: number, years: number): number {
  const months = Math.max(1, Math.round(years * 12));
  return (principal + principal * flatRatePercent / 100 * years) / months;
}

export function effectiveInterestRate(principal: number, monthlyPayment: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const ratio = monthlyPayment / principal;
  let low = 0;
  let high = 1;
  for (let index = 0; index < 160; index += 1) {
    const mid = (low + high) / 2;
    const paymentFactor = mid === 0 ? 1 / months : mid / (1 - Math.pow(1 + mid, -months));
    if (paymentFactor < ratio) low = mid; else high = mid;
  }
  return round2(((low + high) / 2) * 12 * 100);
}

export function flatToEirApprox(flatRatePercent: number): number {
  return round2(flatRatePercent * PL.flatToEirApprox);
}

export interface PersonalLoanQuoteInput { principal: number; ratePercent: number; years: number; method?: InterestMethod; upfrontFees?: number; stampDutyRatePercent?: number }
export interface PersonalLoanQuote {
  method: InterestMethod; principal: number; ratePercent: number; years: number; months: number; monthlyInstalment: number; totalInterest: number; totalRepayment: number; eirPercent: number; eirApproxPercent?: number; interestAsPctOfPrincipal: number; stampDuty: number; upfrontFees: number; totalCost: number;
}

export function personalLoanQuote(input: PersonalLoanQuoteInput): PersonalLoanQuote {
  const method = input.method ?? 'flat';
  const months = Math.max(1, Math.round(input.years * 12));
  const monthlyInstalment = method === 'flat' ? flatMonthlyInstalment(input.principal, input.ratePercent, input.years) : reducingBalanceInstalment(input.principal, input.ratePercent, months);
  const totalRepayment = monthlyInstalment * months;
  const totalInterest = Math.max(0, totalRepayment - input.principal);
  const stampDutyRatePercent = input.stampDutyRatePercent ?? PL.stampDutyRate * 100;
  const stampDuty = input.principal * stampDutyRatePercent / 100;
  const upfrontFees = Math.max(0, input.upfrontFees ?? 0);
  return { method, principal: round2(input.principal), ratePercent: round2(input.ratePercent), years: input.years, months, monthlyInstalment: round2(monthlyInstalment), totalInterest: round2(totalInterest), totalRepayment: round2(totalRepayment), eirPercent: method === 'flat' ? effectiveInterestRate(input.principal, monthlyInstalment, months) : round2(input.ratePercent), eirApproxPercent: method === 'flat' ? flatToEirApprox(input.ratePercent) : undefined, interestAsPctOfPrincipal: input.principal > 0 ? round2(totalInterest / input.principal * 100) : 0, stampDuty: round2(stampDuty), upfrontFees, totalCost: round2(totalRepayment + stampDuty + upfrontFees) };
}

export interface EarlySettlementResult { settleAfterMonths: number; remainingMonths: number; interestRebate: number; settlementAmount: number; plainPrincipalRemaining: number; extraVsPlainPrincipal: number; penalty: number; note: string }
export function earlySettlementRuleOf78(principal: number, flatRatePercent: number, years: number, settleAfterYears: number): EarlySettlementResult {
  const months = Math.max(1, Math.round(years * 12));
  const settledMonths = Math.min(months, Math.max(0, Math.round(settleAfterYears * 12)));
  const remainingMonths = Math.max(0, months - settledMonths);
  const monthly = flatMonthlyInstalment(principal, flatRatePercent, years);
  const totalInterest = principal * flatRatePercent / 100 * years;
  const rebate = remainingMonths > 0 ? totalInterest * remainingMonths * (remainingMonths + 1) / (months * (months + 1)) : 0;
  const grossBalance = Math.max(0, principal + totalInterest - monthly * settledMonths);
  const settlementAmount = Math.max(0, grossBalance - rebate);
  const plainPrincipalRemaining = Math.max(0, principal - (principal / months) * settledMonths);
  return { settleAfterMonths: settledMonths, remainingMonths, interestRebate: round2(rebate), settlementAmount: round2(settlementAmount), plainPrincipalRemaining: round2(plainPrincipalRemaining), extraVsPlainPrincipal: round2(Math.max(0, settlementAmount - plainPrincipalRemaining)), penalty: 0, note: 'Rule of 78 rebates unearned interest, but allocates more interest to earlier months. Most bank personal loans do not add an early-settlement penalty; verify the offer.' };
}

export function personalLoanDsr(args: { monthlyInstalment: number; grossMonthlyIncome: number; existingCommitments?: number; monthlyTax?: number; targetDsrPercent?: number }) {
  return calculateDSR({ income: { grossMonthlyIncome: args.grossMonthlyIncome, monthlyTax: args.monthlyTax }, existingCommitments: args.existingCommitments ?? 0, newInstalment: args.monthlyInstalment, targetDsrPercent: args.targetDsrPercent });
}

export interface SafetyCheckInput { askedForUpfrontFee?: boolean; payToPersonalAccount?: boolean; guaranteedApproval?: boolean; whatsappOnly?: boolean; foundOnIKrediKom?: boolean; }
export interface SafetyCheckResult { verdict: 'likely-scam' | 'verify-first' | 'looks-legitimate'; riskFlags: string[]; redFlags: string[]; verifyTools: string[]; note: string }
export function lenderSafetyCheck(input: SafetyCheckInput = {}): SafetyCheckResult {
  const redFlags = ['Upfront fee before the loan is disbursed', 'Payment requested to a personal account', 'Guaranteed approval with no documents', 'WhatsApp-only agent, APK or unknown link'];
  const riskFlags = [input.askedForUpfrontFee && redFlags[0], input.payToPersonalAccount && redFlags[1], input.guaranteedApproval && redFlags[2], input.whatsappOnly && redFlags[3]].filter(Boolean) as string[];
  const verdict = riskFlags.length > 0 ? 'likely-scam' : input.foundOnIKrediKom ? 'looks-legitimate' : 'verify-first';
  return { verdict, riskFlags, redFlags, verifyTools: ['BNM Financial Consumer Alert List', 'KPKT i-KrediKom licensed lender search'], note: verdict === 'likely-scam' ? 'Stop and verify. Never pay to unlock a loan.' : verdict === 'looks-legitimate' ? 'No red flags were entered, but still confirm the licence and official product disclosure sheet.' : 'Verify the lender licence and contact details before sharing documents or paying anything.' };
}

export interface PersonalLoanReviewInput extends PersonalLoanQuoteInput { grossMonthlyIncome?: number; existingCommitments?: number; monthlyTax?: number; targetDsrPercent?: number; settleAfterYears?: number; safety?: SafetyCheckInput }
export function personalLoanReview(input: PersonalLoanReviewInput) {
  const quote = personalLoanQuote(input);
  const dsr = input.grossMonthlyIncome != null ? personalLoanDsr({ monthlyInstalment: quote.monthlyInstalment, grossMonthlyIncome: input.grossMonthlyIncome, existingCommitments: input.existingCommitments, monthlyTax: input.monthlyTax, targetDsrPercent: input.targetDsrPercent }) : null;
  const settlement = input.method === 'flat' && input.settleAfterYears != null ? earlySettlementRuleOf78(input.principal, input.ratePercent, input.years, input.settleAfterYears) : null;
  const safety = lenderSafetyCheck(input.safety);
  return { quote, dsr, settlement, safety, regulatoryNote: input.method === 'flat' ? `From 1 Jan 2027, flat-rate personal financing and Rule of 78 are due to be replaced by reducing-balance/EIR comparison. Confirm the current method with your provider.` : null };
}

export { PL as PERSONAL_LOAN_CONFIG };

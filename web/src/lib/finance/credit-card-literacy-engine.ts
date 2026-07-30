import DEFAULT_CONFIG from './malaysia-2026-config.json' with { type: 'json' };
import { netMonthlyIncome, round2 } from './housing-finance-engine.ts';

const CC = DEFAULT_CONFIG.creditCard;
export const DEFAULT_DSR_CEILING = 60;

export interface EligibilityInput { grossMonthlyIncome: number; existingMonthlyCommitments?: number; monthlyTax?: number; assumedLimit?: number; dsrCeilingPercent?: number }
export interface EligibilityResult { eligible: boolean; incomeGatePasses: boolean; incomeTier: 'below-minimum' | 'capped' | 'standard'; annualIncome: number; maxIssuers: number | null; maxLimitPerIssuer: number | null; assumedLimit: number; dsrBefore: number; dsrAfter: number; maxSupportableLimit: number; reasons: string[] }

export function assessEligibility(input: EligibilityInput): EligibilityResult {
  const income = Math.max(0, input.grossMonthlyIncome);
  const annualIncome = income * 12;
  const net = netMonthlyIncome({ grossMonthlyIncome: income, monthlyTax: input.monthlyTax }).net;
  const commitments = Math.max(0, input.existingMonthlyCommitments ?? 0);
  const ceiling = input.dsrCeilingPercent ?? DEFAULT_DSR_CEILING;
  const incomeGatePasses = annualIncome >= CC.eligibility.minAnnualIncome;
  const incomeTier = !incomeGatePasses ? 'below-minimum' : annualIncome <= CC.eligibility.lowIncomeThresholdAnnual ? 'capped' : 'standard';
  const regulatoryLimit = incomeTier === 'capped' ? income * CC.eligibility.limitMultipleLowIncome : null;
  const assumedLimit = input.assumedLimit ?? regulatoryLimit ?? income * 4;
  const dsrBefore = net > 0 ? commitments / net * 100 : 0;
  const cardCommitment = assumedLimit * (CC.dsrCommitmentPercent ?? 0.05);
  const dsrAfter = net > 0 ? (commitments + cardCommitment) / net * 100 : 0;
  const maxSupportableLimit = Math.max(0, (net * ceiling / 100 - commitments) / (CC.dsrCommitmentPercent ?? 0.05));
  const reasons = !incomeGatePasses ? ['Minimum gross income is RM24,000 a year (about RM2,000 a month).'] : dsrAfter > ceiling ? ['The assumed credit limit pushes the DSR above the planning ceiling.', `Banks may count about 5% of the assigned limit as a monthly commitment.`] : ['Income gate passes; the bank still checks CCRIS, CTOS, documents and its own DSR policy.'];
  return { eligible: incomeGatePasses && dsrAfter <= ceiling, incomeGatePasses, incomeTier, annualIncome: round2(annualIncome), maxIssuers: incomeTier === 'capped' ? CC.eligibility.maxIssuersLowIncome : null, maxLimitPerIssuer: regulatoryLimit, assumedLimit: round2(assumedLimit), dsrBefore: round2(dsrBefore), dsrAfter: round2(dsrAfter), maxSupportableLimit: round2(maxSupportableLimit), reasons };
}

export interface CardCountInput { grossMonthlyIncome: number; existingMonthlyCommitments?: number; paysInFullEveryMonth: boolean; monthlyTax?: number; dsrCeilingPercent?: number }
export interface CardCountResult { recommended: number; regulatoryMax: number | null; dsrDragPerCardPercent: number; cumulativeDsr: { cards: number; dsrPercent: number }[]; rationale: string; caution: string }
export function recommendCardCount(input: CardCountInput): CardCountResult {
  const base = assessEligibility({ grossMonthlyIncome: input.grossMonthlyIncome, existingMonthlyCommitments: input.existingMonthlyCommitments, monthlyTax: input.monthlyTax, dsrCeilingPercent: input.dsrCeilingPercent });
  const net = netMonthlyIncome({ grossMonthlyIncome: input.grossMonthlyIncome, monthlyTax: input.monthlyTax }).net;
  const perCardCommitment = base.maxLimitPerIssuer ?? input.grossMonthlyIncome * 2;
  const drag = net > 0 ? perCardCommitment * (CC.dsrCommitmentPercent ?? 0.05) / net * 100 : 0;
  const cumulativeDsr = [1, 2, 3].map((cards) => ({ cards, dsrPercent: round2((Math.max(0, input.existingMonthlyCommitments ?? 0) + perCardCommitment * (CC.dsrCommitmentPercent ?? 0.05) * cards) / Math.max(1, net) * 100) }));
  const regulatoryMax = base.maxIssuers ?? null;
  const maxByDsr = cumulativeDsr.filter((row) => row.dsrPercent <= (input.dsrCeilingPercent ?? DEFAULT_DSR_CEILING)).at(-1)?.cards ?? 0;
  const recommended = !base.eligible ? 0 : Math.min(regulatoryMax ?? 3, input.paysInFullEveryMonth ? Math.max(1, maxByDsr) : 1);
  return { recommended, regulatoryMax, dsrDragPerCardPercent: round2(drag), cumulativeDsr, rationale: !base.eligible ? 'Clear the income or DSR gate first.' : input.paysInFullEveryMonth ? `One card is usually enough; a second can be reasonable if you clear the full statement every month.` : 'Keep it to one card until paying in full becomes automatic.', caution: 'More cards mean more due dates and a larger assigned limit that can reduce future borrowing capacity.' };
}

export interface PayoffInput { balance: number; aprPercent: number; fixedPayment?: number }
export interface MinimumPaymentTrapResult { payInFull: { months: number; totalInterest: number; totalPaid: number }; minimumOnly: { months: number; totalInterest: number; totalPaid: number; stopped: boolean }; headline: string }
function simulate(balance: number, aprPercent: number, payment: (balance: number) => number) {
  let owed = Math.max(0, balance);
  let interest = 0;
  let months = 0;
  while (owed > 0.01 && months < 1200) {
    const charge = owed * aprPercent / 100 / 12;
    const paid = Math.min(owed + charge, Math.max(charge + 0.01, payment(owed)));
    owed = Math.max(0, owed + charge - paid);
    interest += charge;
    months += 1;
  }
  return { months, totalInterest: round2(interest), totalPaid: round2(balance + interest), stopped: months >= 1200 };
}
export function minimumPaymentTrap(input: PayoffInput): MinimumPaymentTrapResult {
  const payInFull = { months: input.balance > 0 ? 1 : 0, totalInterest: 0, totalPaid: round2(Math.max(0, input.balance)) };
  const minimumOnly = simulate(input.balance, input.aprPercent, (owed) => Math.max(owed * (CC.fees.minimumPaymentPercent ?? 0.05), CC.fees.minimumPaymentFloor ?? 50));
  return { payInFull, minimumOnly, headline: `RM${Math.round(input.balance).toLocaleString('en-MY')} cleared in full costs RM0 interest; paying only the minimum can keep the balance open for years.` };
}

export interface LatePaymentInput { carriedBalance: number; horizonMonths: number; }
export interface LatePaymentResult { lateFeePerIncident: number; alwaysOnTimeInterest: number; oneLateExtraCost: number; chronicLateExtraCost: number; headline: string; creditNote: string }
export function latePaymentCost(input: LatePaymentInput): LatePaymentResult {
  const balance = Math.max(0, input.carriedBalance);
  const months = Math.max(1, Math.round(input.horizonMonths));
  const fee = Math.min(CC.fees.lateMax ?? 100, Math.max(CC.fees.lateMin ?? 10, balance * (CC.fees.latePercent ?? 0.01)));
  const alwaysOnTimeInterest = balance * (CC.interest.tier1 ?? 0.15) / 12 * months;
  const oneLateExtraCost = balance * ((CC.interest.tier2 ?? 0.17) - (CC.interest.tier1 ?? 0.15)) / 12 * Math.min(months, 12) + fee;
  const chronicLateExtraCost = balance * ((CC.interest.capAPR ?? 0.18) - (CC.interest.tier1 ?? 0.15)) / 12 * months + fee * months;
  return { lateFeePerIncident: round2(fee), alwaysOnTimeInterest: round2(alwaysOnTimeInterest), oneLateExtraCost: round2(oneLateExtraCost), chronicLateExtraCost: round2(chronicLateExtraCost), headline: `One late payment adds about RM${round2(oneLateExtraCost).toLocaleString('en-MY')} here, before the credit-record cost.`, creditNote: 'A late payment can move you to a higher interest tier and posts repayment conduct to CCRIS for 12 months.' };
}

export interface BnplInput { purchaseAmount: number; lateFee: number; weeksLate: number }
export interface BnplResult { costIfOnTime: number; costIfLate: number; effectiveAPRPercent: number; headline: string }
export function bnplTrueCost(input: BnplInput): BnplResult {
  const weeks = Math.max(0.1, input.weeksLate);
  const effectiveAPRPercent = input.purchaseAmount > 0 ? input.lateFee / input.purchaseAmount / (weeks / 52) * 100 : 0;
  return { costIfOnTime: 0, costIfLate: round2(input.lateFee), effectiveAPRPercent: round2(effectiveAPRPercent), headline: `A RM${input.lateFee} fee on a RM${input.purchaseAmount} purchase paid ${input.weeksLate} weeks late works out to about ${round2(effectiveAPRPercent)}% APR.` };
}

export interface UtilizationResult { utilizationPercent: number; healthyThresholdPercent: number; status: 'healthy' | 'elevated' | 'high'; note: string }
export function utilizationImpact(totalBalance: number, totalLimit: number): UtilizationResult {
  const utilizationPercent = totalLimit > 0 ? totalBalance / totalLimit * 100 : 0;
  const healthyThresholdPercent = (CC.healthyUtilization ?? 0.3) * 100;
  const status = utilizationPercent <= healthyThresholdPercent ? 'healthy' : utilizationPercent <= 50 ? 'elevated' : 'high';
  return { utilizationPercent: round2(utilizationPercent), healthyThresholdPercent, status, note: `Keep balances at or below ${healthyThresholdPercent}% of the limit to protect the amounts-owed part of your CTOS profile.` };
}

export interface DecisionInput extends EligibilityInput { paysInFullEveryMonth: boolean }
export function creditCardRealityCheck(input: DecisionInput) {
  const eligibility = assessEligibility(input);
  const cards = recommendCardCount({ ...input, paysInFullEveryMonth: input.paysInFullEveryMonth });
  const verdict = !eligibility.eligible ? 'not-yet' : input.paysInFullEveryMonth ? 'go-ahead-disciplined' : 'proceed-with-caution';
  const headline = verdict === 'not-yet' ? 'Not yet — clear the income or DSR gate first.' : verdict === 'go-ahead-disciplined' ? `You qualify, and paying in full keeps the card working for you. Recommended: ${cards.recommended}.` : 'You qualify, but carrying a balance can turn a convenience into expensive debt.';
  return { verdict, headline, eligibility, cards };
}

export { CC as CREDIT_CARD_CONFIG };

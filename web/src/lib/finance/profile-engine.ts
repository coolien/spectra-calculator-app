import DEFAULT_CONFIG from './malaysia-2026-config.json' with { type: 'json' };
import { netMonthlyIncome, round2, type MalaysiaConfig } from './housing-finance-engine.ts';

type ProfileConfig = typeof DEFAULT_CONFIG['profile'];
const CFG = DEFAULT_CONFIG as unknown as MalaysiaConfig;
const PROFILE = DEFAULT_CONFIG.profile as ProfileConfig;

export type Citizenship = 'citizen' | 'pr' | 'foreign';
export type FinancingPreference = 'islamic' | 'conventional' | 'either';
export type FinancingResolved = 'islamic' | 'conventional';

export interface UserProfile {
  age?: number;
  citizenship?: Citizenship;
  maritalStatus?: 'single' | 'married';
  dependents?: number;
  financingPreference?: FinancingPreference;
  isMuslim?: boolean;
  ownsResidentialProperty?: boolean;
  propertiesOwned?: number;
  grossMonthlySalary?: number;
  otherMonthlyIncome?: number;
  epfEmployeeRate?: number;
  monthlyTax?: number;
  existingMonthlyCommitments?: number;
  creditCardTotalLimit?: number;
  creditCardBalance?: number;
  emergencyFundMonths?: number;
  epfBalance?: number;
  monthlySavings?: number;
  monthlyExpenses?: number;
  hasLifeOrTakaful?: boolean;
  hasMedicalCard?: boolean;
  hasMortgageCover?: boolean;
  ctosBand?: 'excellent' | 'good' | 'fair' | 'needs-work';
  recentLatePayments12m?: number;
  targetDsrPercent?: number;
  savingsGoal?: number;
}

export interface FinancingContext {
  resolved: FinancingResolved;
  fromPreference: FinancingPreference;
  products: ProfileConfig['financingProductMap']['islamic'];
}

export function financingContext(profile: UserProfile): FinancingContext {
  const preference = profile.financingPreference ?? 'either';
  const resolved = preference === 'islamic' ? 'islamic' : preference === 'conventional' ? 'conventional' : profile.isMuslim ? 'islamic' : 'conventional';
  return { resolved, fromPreference: preference, products: PROFILE.financingProductMap[resolved] };
}

export function grossMonthlyIncome(profile: UserProfile): number {
  return Math.max(0, (profile.grossMonthlySalary ?? 0) + (profile.otherMonthlyIncome ?? 0));
}

export interface CalculatorDefaults {
  financingType: FinancingResolved;
  productLabels: FinancingContext['products'];
  home: { buyerStatus: Citizenship; firstHome: boolean; financingType: FinancingResolved; monthlyIncome: number; existingCommitments: number; targetDsrPercent: number; tenureYears: number; ltvCapPercent: number };
  car: { financingType: FinancingResolved; grossMonthlyIncome: number; existingCommitments: number };
  personal: { financingType: FinancingResolved; grossMonthlyIncome: number; existingCommitments: number };
  credit: { grossMonthlyIncome: number; existingMonthlyCommitments: number; creditCardTotalLimit: number };
  ptptn: { grossMonthlyIncome: number };
  faraid: { show: boolean };
}

export function deriveCalculatorDefaults(profile: UserProfile): CalculatorDefaults {
  const context = financingContext(profile);
  const gross = grossMonthlyIncome(profile);
  const commitments = Math.max(0, profile.existingMonthlyCommitments ?? 0);
  const citizenship = profile.citizenship ?? 'citizen';
  const properties = profile.propertiesOwned ?? (profile.ownsResidentialProperty ? 1 : 0);
  const firstHome = citizenship === 'citizen' && properties === 0 && profile.ownsResidentialProperty !== true;
  const maxTenure = profile.age == null ? 35 : Math.max(5, Math.min(35, 70 - profile.age));
  return {
    financingType: context.resolved,
    productLabels: context.products,
    home: { buyerStatus: citizenship, firstHome, financingType: context.resolved, monthlyIncome: gross, existingCommitments: commitments, targetDsrPercent: profile.targetDsrPercent ?? 40, tenureYears: maxTenure, ltvCapPercent: properties >= 2 ? 70 : 90 },
    car: { financingType: context.resolved, grossMonthlyIncome: gross, existingCommitments: commitments },
    personal: { financingType: context.resolved, grossMonthlyIncome: gross, existingCommitments: commitments },
    credit: { grossMonthlyIncome: gross, existingMonthlyCommitments: commitments, creditCardTotalLimit: profile.creditCardTotalLimit ?? 0 },
    ptptn: { grossMonthlyIncome: gross },
    faraid: { show: context.products.showFaraid || profile.isMuslim === true },
  };
}

export interface PillarScore { key: string; score: number; weight: number; measures: string }
export interface HealthScore { overall: number; band: string; pillars: PillarScore[]; netIncome: number; dsrNet: number; dsrGross: number }
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function financialHealthScore(profile: UserProfile): HealthScore {
  const gross = grossMonthlyIncome(profile);
  const net = netMonthlyIncome({ grossMonthlyIncome: gross, monthlyTax: profile.monthlyTax, age: profile.age }, CFG).net;
  const commitments = Math.max(0, profile.existingMonthlyCommitments ?? 0);
  const dsrNet = net > 0 ? commitments / net * 100 : 0;
  // Scored on gross, matching how a bank assesses DSR. dsrNet is still reported as the
  // cash-flow reality, but it must not drive the verdict. See docs/RATE_AUDIT_2026-07-30.md.
  const dsrGross = gross > 0 ? commitments / gross * 100 : 0;
  const affordability = gross > 0 ? clamp((70 - dsrGross) / 35 * 100) : 50;
  const savings = clamp((profile.emergencyFundMonths ?? 0) / 6 * 100);
  const bandScore = { excellent: 100, good: 80, fair: 55, 'needs-work': 30 } as const;
  let debtHealth: number = profile.ctosBand ? bandScore[profile.ctosBand] : (profile.recentLatePayments12m ?? 0) === 0 ? 80 : (profile.recentLatePayments12m ?? 0) === 1 ? 55 : 30;
  if ((profile.creditCardTotalLimit ?? 0) > 0 && profile.creditCardBalance != null) debtHealth = clamp(debtHealth - Math.max(0, profile.creditCardBalance / profile.creditCardTotalLimit! - 0.3) * 100);
  let protection = 0;
  if (profile.hasLifeOrTakaful) protection += 35;
  if (profile.hasMedicalCard) protection += 30;
  if (profile.hasMortgageCover) protection += 15;
  if ((profile.epfBalance ?? 0) > 0) protection += 20;
  let planning = 0;
  if ((profile.monthlySavings ?? 0) > 0) planning += 40;
  if (profile.targetDsrPercent != null) planning += 25;
  if ((profile.savingsGoal ?? 0) > 0) planning += 15;
  if ((profile.recentLatePayments12m ?? 0) === 0) planning += 20;
  const raw: Record<string, number> = { affordability, savings, debtHealth, protection: clamp(protection), planning: clamp(planning) };
  const pillars = PROFILE.healthScore.pillars.map((pillar) => ({ ...pillar, score: round2(raw[pillar.key] ?? 50) }));
  const overall = round2(pillars.reduce((sum, pillar) => sum + pillar.score * pillar.weight, 0));
  const band = PROFILE.healthScore.bands.find((item) => overall >= item.min)?.label ?? 'At risk';
  return { overall, band, pillars, netIncome: round2(net), dsrNet: round2(dsrNet), dsrGross: round2(dsrGross) };
}

export interface UpgradeSuggestion { pillar: string; priority: number; action: string }
export function profileUpgradeSuggestions(profile: UserProfile): UpgradeSuggestion[] {
  const health = financialHealthScore(profile);
  const actions: Record<string, string> = {
    affordability: 'Lower DSR before taking new financing — it directly raises how much you can borrow.',
    savings: 'Build an emergency fund toward 3–6 months of expenses and automate the transfer.',
    debtHealth: 'Keep card balances under 30% of the limit and never miss a due date — payment history is 45% of CTOS.',
    protection: 'Review life/takaful, medical cover and mortgage protection so a setback does not cost the household its home.',
    planning: 'Set a target DSR and savings goal, then review your assumptions after each Budget cycle.',
  };
  return health.pillars.map((pillar) => ({ pillar: pillar.key, priority: round2(pillar.weight * (100 - pillar.score)), action: actions[pillar.key] })).filter((item) => item.priority > 0).sort((a, b) => b.priority - a.priority);
}

export { PROFILE as PROFILE_CONFIG };

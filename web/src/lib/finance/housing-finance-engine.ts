import DEFAULT_CONFIG from './malaysia-2026-config.json' with { type: 'json' };

export interface FeeBand {
  sliceUpTo: number | null;
  rate: number;
  label?: string;
}

export interface MalaysiaConfig {
  serviceTax: { rateOnProfessionalServices: number };
  legalFeeScaleSRO2023: { minimumFee: number; maxNegotiableDiscount: number; bands: FeeBand[]; disbursementsPerDocument: { default: number } };
  stampDuty: { memorandumOfTransfer: { citizenAndPrTiers: FeeBand[]; foreignFlatRate: number; foreignAppliesTo: string[] }; loanAgreement: { rate: number } };
  firstHomeExemption: { tiers: { priceUpTo: number; motExemptionRate: number; loanAgreementExemptionRate: number }[] };
  valuationFeeScale: { minimumFee: number; serviceTaxApplies: boolean; bands: FeeBand[] };
  financing: { tenure: { maxYears: number; maxAgeAtEnd: number }; loanToValueCap: { firstAndSecondProperty: number; thirdAndSubsequent: number } };
  affordability: { dsr: { benchmarkBands: { maxRatio: number | null; verdict: string; label: string }[] }; statutoryDeductions: { epfEmployeeRate: number; epfEmployeeRateFromAge60: number; epfReducedRateFromAge: number; socso: { employeeRate: number; wageCeiling: number }; eis: { employeeRate: number; wageCeiling: number } } };
  taxRelief: { housingLoanInterest: { consecutiveYearsOfAssessment: number; bands: { priceUpTo: number | null; annualReliefCap: number }[] }; marginalTaxRateBandsYA2026: { chargeableUpTo: number | null; rate: number }[] };
  financingProducts?: unknown;
}

const CONFIG = DEFAULT_CONFIG as unknown as MalaysiaConfig;

export type BuyerType = 'citizen' | 'pr' | 'foreign' | 'foreign-individual' | 'foreign-company';
export type FinancingType = 'conventional' | 'islamic';
export type PropertyType = 'subsale' | 'new-project';

export interface FeeBreakdown { scaleFee: number; discount: number; serviceTax: number; disbursements: number; total: number }
export interface DutyBreakdown { grossDuty: number; exemption: number; netDuty: number; basis: string }
export interface AmortizationRow { month: number; openingBalance: number; instalment: number; interest: number; principal: number; extraPayment: number; lumpSum: number; closingBalance: number }
export interface AmortizationResult { monthlyInstalment: number; scheduledMonths: number; actualMonths: number; totalInterest: number; totalPrincipal: number; totalRepayment: number; monthsSaved: number; interestSaved: number; schedule: AmortizationRow[]; settlementBalance: number | null; interestByYear: number[] }

export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function tieredCharge(base: number, bands: FeeBand[]): number {
  let remaining = Math.max(0, base);
  let result = 0;
  for (const band of bands) {
    if (remaining <= 0) break;
    const slice = band.sliceUpTo == null ? remaining : Math.min(remaining, band.sliceUpTo);
    result += slice * band.rate;
    remaining -= slice;
  }
  return result;
}

export function reducingBalanceInstalment(principal: number, annualRatePercent: number, tenureMonths: number): number {
  if (tenureMonths <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function maxTenureYears(currentAge: number, cfg: MalaysiaConfig = CONFIG): number {
  return Math.max(0, Math.min(cfg.financing.tenure.maxYears, cfg.financing.tenure.maxAgeAtEnd - currentAge));
}

export interface AmortizationInput {
  principal: number;
  annualRatePercent: number;
  tenureYears: number;
  extraMonthlyPayment?: number;
  lumpSums?: { month: number; amount: number }[];
  settlementYear?: number;
  interestYearsToTrack?: number;
}

export function calculateLoanAmortization(input: AmortizationInput): AmortizationResult {
  const scheduledMonths = Math.max(0, Math.round(input.tenureYears * 12));
  const monthlyInstalment = reducingBalanceInstalment(input.principal, input.annualRatePercent, scheduledMonths);
  const monthlyRate = input.annualRatePercent / 100 / 12;
  const extras = Math.max(0, input.extraMonthlyPayment ?? 0);
  const lumpByMonth = new Map<number, number>();
  for (const lump of input.lumpSums ?? []) lumpByMonth.set(lump.month, (lumpByMonth.get(lump.month) ?? 0) + Math.max(0, lump.amount));
  const schedule: AmortizationRow[] = [];
  const interestByYear = new Array(input.interestYearsToTrack ?? 3).fill(0) as number[];
  const settlementMonth = input.settlementYear && input.settlementYear > 0 ? Math.round(input.settlementYear * 12) : 0;
  let balance = Math.max(0, input.principal);
  let totalInterest = 0;
  let totalPrincipal = 0;
  let settlementBalance: number | null = null;

  for (let month = 1; month <= scheduledMonths && balance > 0.005; month += 1) {
    const openingBalance = balance;
    const interest = balance * monthlyRate;
    const scheduledPrincipal = Math.min(Math.max(0, monthlyInstalment - interest), balance);
    const extra = Math.min(extras, Math.max(0, balance - scheduledPrincipal));
    const lump = Math.min(lumpByMonth.get(month) ?? 0, Math.max(0, balance - scheduledPrincipal - extra));
    balance = Math.max(0, balance - scheduledPrincipal - extra - lump);
    totalInterest += interest;
    totalPrincipal += scheduledPrincipal + extra + lump;
    const yearIndex = Math.floor((month - 1) / 12);
    if (yearIndex < interestByYear.length) interestByYear[yearIndex] += interest;
    schedule.push({
      month,
      openingBalance: round2(openingBalance),
      instalment: round2(interest + scheduledPrincipal),
      interest: round2(interest),
      principal: round2(scheduledPrincipal),
      extraPayment: round2(extra),
      lumpSum: round2(lump),
      closingBalance: round2(balance),
    });
    if (settlementMonth && month === settlementMonth) settlementBalance = round2(balance);
  }

  const baselineInterest = Math.max(0, monthlyInstalment * scheduledMonths - input.principal);
  return {
    monthlyInstalment: round2(monthlyInstalment),
    scheduledMonths,
    actualMonths: schedule.length,
    totalInterest: round2(totalInterest),
    totalPrincipal: round2(totalPrincipal),
    totalRepayment: round2(totalInterest + totalPrincipal),
    monthsSaved: Math.max(0, scheduledMonths - schedule.length),
    interestSaved: round2(Math.max(0, baselineInterest - totalInterest)),
    schedule,
    settlementBalance,
    interestByYear: interestByYear.map(round2),
  };
}

function legalFee(base: number, discount: number, cfg: MalaysiaConfig): FeeBreakdown {
  const scaleFee = Math.max(cfg.legalFeeScaleSRO2023.minimumFee, tieredCharge(base, cfg.legalFeeScaleSRO2023.bands));
  const boundedDiscount = Math.min(Math.max(0, discount), cfg.legalFeeScaleSRO2023.maxNegotiableDiscount);
  const discounted = scaleFee * (1 - boundedDiscount);
  const serviceTax = discounted * cfg.serviceTax.rateOnProfessionalServices;
  const disbursements = cfg.legalFeeScaleSRO2023.disbursementsPerDocument.default;
  return { scaleFee: round2(scaleFee), discount: round2(scaleFee - discounted), serviceTax: round2(serviceTax), disbursements, total: round2(discounted + serviceTax + disbursements) };
}

export function calculateSPALegalFees(price: number, discount = 0, cfg: MalaysiaConfig = CONFIG): FeeBreakdown { return legalFee(price, discount, cfg); }
export function calculateLoanLegalFees(loanAmount: number, discount = 0, cfg: MalaysiaConfig = CONFIG): FeeBreakdown { return legalFee(loanAmount, discount, cfg); }

export function calculateValuationFees(propertyPrice: number, propertyType: PropertyType = 'subsale', cfg: MalaysiaConfig = CONFIG): number {
  if (propertyType === 'new-project') return 0;
  const base = Math.max(cfg.valuationFeeScale.minimumFee, tieredCharge(propertyPrice, cfg.valuationFeeScale.bands));
  return round2(base * (cfg.valuationFeeScale.serviceTaxApplies ? 1 + CONFIG.serviceTax.rateOnProfessionalServices : 1));
}

function isForeign(buyerType: BuyerType, cfg: MalaysiaConfig): boolean {
  return cfg.stampDuty.memorandumOfTransfer.foreignAppliesTo.includes(buyerType) || buyerType === 'foreign';
}

function exemptionRate(price: number, firstHome: boolean, cfg: MalaysiaConfig): number {
  if (!firstHome) return 0;
  const tier = cfg.firstHomeExemption.tiers.find((item) => price <= item.priceUpTo);
  return tier?.motExemptionRate ?? 0;
}

export function calculateMOTStampDuty(input: { propertyPrice: number; buyerType: BuyerType; firstHome?: boolean }, cfg: MalaysiaConfig = CONFIG): DutyBreakdown {
  const grossDuty = isForeign(input.buyerType, cfg)
    ? input.propertyPrice * cfg.stampDuty.memorandumOfTransfer.foreignFlatRate
    : tieredCharge(input.propertyPrice, cfg.stampDuty.memorandumOfTransfer.citizenAndPrTiers);
  const exemption = grossDuty * exemptionRate(input.propertyPrice, input.firstHome === true && input.buyerType === 'citizen', cfg);
  return { grossDuty: round2(grossDuty), exemption: round2(exemption), netDuty: round2(grossDuty - exemption), basis: isForeign(input.buyerType, cfg) ? 'Foreign flat rate' : 'Citizen/PR tiers' };
}

export function calculateLoanStampDuty(input: { loanAmount: number; propertyPrice: number; buyerType: BuyerType; firstHome?: boolean }, cfg: MalaysiaConfig = CONFIG): DutyBreakdown {
  const grossDuty = input.loanAmount * cfg.stampDuty.loanAgreement.rate;
  const eligible = input.firstHome === true && input.buyerType === 'citizen' && input.propertyPrice <= 500000;
  const exemption = eligible ? grossDuty : 0;
  return { grossDuty: round2(grossDuty), exemption: round2(exemption), netDuty: round2(grossDuty - exemption), basis: 'Loan agreement duty at 0.5%' };
}

export interface NetIncomeInput { grossMonthlyIncome: number; epfRatePercent?: number; monthlyTax?: number; age?: number }
export interface NetIncomeResult { gross: number; epf: number; socso: number; eis: number; pcb: number; net: number }

/**
 * Statutory EPF employee rate for an age. The rate halves at 60 — using the
 * under-60 rate for an older worker understates their net income and makes
 * every downstream affordability verdict wrong for them.
 */
export function epfEmployeeRateForAge(age: number | undefined, cfg: MalaysiaConfig = CONFIG): number {
  const deductions = cfg.affordability.statutoryDeductions;
  if (age != null && age >= deductions.epfReducedRateFromAge) return deductions.epfEmployeeRateFromAge60;
  return deductions.epfEmployeeRate;
}

export function netMonthlyIncome(input: NetIncomeInput, cfg: MalaysiaConfig = CONFIG): NetIncomeResult {
  const gross = Math.max(0, input.grossMonthlyIncome);
  const deductions = cfg.affordability.statutoryDeductions;
  const epf = gross * (input.epfRatePercent ?? epfEmployeeRateForAge(input.age, cfg) * 100) / 100;
  const socso = Math.min(gross, deductions.socso.wageCeiling) * deductions.socso.employeeRate;
  const eis = Math.min(gross, deductions.eis.wageCeiling) * deductions.eis.employeeRate;
  const pcb = Math.max(0, input.monthlyTax ?? 0);
  return { gross: round2(gross), epf: round2(epf), socso: round2(socso), eis: round2(eis), pcb: round2(pcb), net: round2(Math.max(0, gross - epf - socso - eis - pcb)) };
}

export interface DSRResult { dsrNet: number; dsrGross: number; netIncome: number; grossIncome: number; verdict: string; label: string; target: number; verdictBasis: 'gross' }
export function calculateDSR(input: { income: NetIncomeInput; existingCommitments: number; newInstalment: number; targetDsrPercent?: number }, cfg: MalaysiaConfig = CONFIG): DSRResult {
  const income = netMonthlyIncome(input.income, cfg);
  const commitments = Math.max(0, input.existingCommitments) + Math.max(0, input.newInstalment);
  const dsrNet = income.net > 0 ? commitments / income.net : 0;
  const dsrGross = income.gross > 0 ? commitments / income.gross : 0;
  // Malaysian banks assess DSR on GROSS income, so the verdict must band on gross —
  // banding on net made the app stricter than any bank and told people they could not
  // afford something they would in fact be approved for. `dsrNet` stays exposed because
  // it is the honest cash-flow picture, but it is not what a bank decides on.
  const band = cfg.affordability.dsr.benchmarkBands.find((item) => item.maxRatio == null || dsrGross <= item.maxRatio) ?? cfg.affordability.dsr.benchmarkBands.at(-1)!;
  return { dsrNet: round2(dsrNet * 100), dsrGross: round2(dsrGross * 100), netIncome: income.net, grossIncome: income.gross, verdict: band.verdict, label: band.label, target: input.targetDsrPercent ?? 60, verdictBasis: 'gross' };
}

export interface TaxReliefResult { annualCap: number; marginalRate: number; savingByYear: number[]; totalSaving: number; note: string }
export function marginalTaxRate(annualChargeableIncome: number, cfg: MalaysiaConfig = CONFIG): number {
  return cfg.taxRelief.marginalTaxRateBandsYA2026.find((band) => band.chargeableUpTo == null || annualChargeableIncome <= band.chargeableUpTo)?.rate ?? 0;
}
export function calculateTaxReliefSavings(input: { propertyPrice: number; firstHome: boolean; interestByYear: number[]; annualChargeableIncome?: number }, cfg: MalaysiaConfig = CONFIG): TaxReliefResult {
  const band = cfg.taxRelief.housingLoanInterest.bands.find((item) => item.priceUpTo == null || input.propertyPrice <= item.priceUpTo);
  const annualCap = input.firstHome ? band?.annualReliefCap ?? 0 : 0;
  const rate = marginalTaxRate(input.annualChargeableIncome ?? 0, cfg);
  const savingByYear = input.interestByYear.slice(0, cfg.taxRelief.housingLoanInterest.consecutiveYearsOfAssessment).map((interest) => round2(Math.min(interest, annualCap) * rate));
  while (savingByYear.length < cfg.taxRelief.housingLoanInterest.consecutiveYearsOfAssessment) savingByYear.push(0);
  return { annualCap, marginalRate: rate, savingByYear, totalSaving: round2(savingByYear.reduce((sum, value) => sum + value, 0)), note: annualCap > 0 ? `Up to RM${annualCap.toLocaleString('en-MY')} interest relief for three consecutive YAs.` : 'No qualifying first-home interest relief in this estimate.' };
}

export interface IbraResult { effectiveInstalment: number; ceilingInstalment: number; ibraIfHeldToTerm: number; settlementBalance: number | null; note: string }
export function calculateIbra(input: { principal: number; effectiveRatePercent: number; ceilingRatePercent: number; tenureYears: number; settlementBalance: number | null }): IbraResult {
  const months = Math.round(input.tenureYears * 12);
  const effectiveInstalment = reducingBalanceInstalment(input.principal, input.effectiveRatePercent, months);
  const ceilingInstalment = reducingBalanceInstalment(input.principal, input.ceilingRatePercent, months);
  const ibraIfHeldToTerm = Math.max(0, ceilingInstalment * months - input.principal - (effectiveInstalment * months - input.principal));
  return { effectiveInstalment: round2(effectiveInstalment), ceilingInstalment: round2(ceilingInstalment), ibraIfHeldToTerm: round2(ibraIfHeldToTerm), settlementBalance: input.settlementBalance, note: "Islamic financing uses Ibra' so early settlement is modelled on the effective reducing-balance amount." };
}

export interface HousingPurchaseInput {
  propertyPrice: number; downPaymentPercent: number; annualRatePercent: number; tenureYears: number;
  buyerType: BuyerType; firstHome: boolean; propertyType?: PropertyType; financingType?: FinancingType;
  ceilingRatePercent?: number; grossMonthlyIncome?: number; monthlyTax?: number; existingCommitments?: number; targetDsrPercent?: number;
  extraMonthlyPayment?: number; lumpSums?: { month: number; amount: number }[]; settlementYear?: number;
  epfWithdrawal?: number; solicitorDiscountPercent?: number; mrtaPremium?: number; mrtaCapitalize?: boolean; mltaMonthlyPremium?: number; annualChargeableIncome?: number;
}

export function calculateHousingPurchase(input: HousingPurchaseInput, cfg: MalaysiaConfig = CONFIG) {
  const propertyPrice = Math.max(0, input.propertyPrice);
  const baseLoan = propertyPrice * Math.max(0, 1 - input.downPaymentPercent / 100);
  const mrta = Math.max(0, input.mrtaPremium ?? 0);
  const financedAmount = baseLoan + (input.mrtaCapitalize ? mrta : 0);
  const amortization = calculateLoanAmortization({ principal: financedAmount, annualRatePercent: input.annualRatePercent, tenureYears: input.tenureYears, extraMonthlyPayment: input.extraMonthlyPayment, lumpSums: input.lumpSums, settlementYear: input.settlementYear });
  const mot = calculateMOTStampDuty({ propertyPrice, buyerType: input.buyerType, firstHome: input.firstHome }, cfg);
  const loanDuty = calculateLoanStampDuty({ loanAmount: financedAmount, propertyPrice, buyerType: input.buyerType, firstHome: input.firstHome }, cfg);
  const spaLegal = calculateSPALegalFees(propertyPrice, (input.solicitorDiscountPercent ?? 0) / 100, cfg);
  const loanLegal = calculateLoanLegalFees(financedAmount, (input.solicitorDiscountPercent ?? 0) / 100, cfg);
  const valuation = calculateValuationFees(propertyPrice, input.propertyType ?? 'subsale', cfg);
  const downPayment = propertyPrice * Math.max(0, input.downPaymentPercent) / 100;
  const mrtaCash = input.mrtaCapitalize ? 0 : mrta;
  const grossUpfront = downPayment + mot.netDuty + loanDuty.netDuty + spaLegal.total + loanLegal.total + valuation + mrtaCash;
  const epfWithdrawal = Math.min(Math.max(0, input.epfWithdrawal ?? 0), grossUpfront);
  const monthlyCommitment = { baseInstalment: amortization.monthlyInstalment, mltaPremium: round2(input.mltaMonthlyPremium ?? 0), total: round2(amortization.monthlyInstalment + Math.max(0, input.mltaMonthlyPremium ?? 0)) };
  const affordability = input.grossMonthlyIncome != null ? calculateDSR({ income: { grossMonthlyIncome: input.grossMonthlyIncome, monthlyTax: input.monthlyTax }, existingCommitments: input.existingCommitments ?? 0, newInstalment: monthlyCommitment.total, targetDsrPercent: input.targetDsrPercent }, cfg) : null;
  const taxRelief = calculateTaxReliefSavings({ propertyPrice, firstHome: input.firstHome && input.buyerType === 'citizen', interestByYear: amortization.interestByYear, annualChargeableIncome: input.annualChargeableIncome }, cfg);
  const ibra = input.financingType === 'islamic' ? calculateIbra({ principal: financedAmount, effectiveRatePercent: input.annualRatePercent, ceilingRatePercent: input.ceilingRatePercent ?? 10, tenureYears: input.tenureYears, settlementBalance: amortization.settlementBalance }) : null;
  const ltvPercent = propertyPrice > 0 ? financedAmount / propertyPrice * 100 : 0;
  return {
    loan: { baseLoan: round2(baseLoan), financedAmount: round2(financedAmount), ltvPercent: round2(ltvPercent), downPayment: round2(downPayment) },
    monthlyCommitment,
    upfrontCash: { downPayment: round2(downPayment), motStampDuty: mot.netDuty, loanStampDuty: loanDuty.netDuty, spaLegalFees: spaLegal.total, loanLegalFees: loanLegal.total, valuationFees: valuation, mrtaCash: round2(mrtaCash), grossUpfront: round2(grossUpfront), epfWithdrawal: round2(epfWithdrawal), netCashOutlay: round2(Math.max(0, grossUpfront - epfWithdrawal)), motBasis: mot.basis },
    amortization,
    affordability,
    taxRelief,
    ibra,
    notes: { mot, loanDuty, spaLegal, loanLegal, valuation },
  };
}

export { CONFIG as MALAYSIA_2026_CONFIG };

export interface AffordablePriceInput {
  grossMonthlyIncome: number;
  existingCommitments?: number;
  monthlyTax?: number;
  age?: number;
  targetDsrPercent?: number;
  annualRatePercent: number;
  tenureYears: number;
  downPaymentPercent?: number;
  buyerType?: BuyerType;
  firstHome?: boolean;
  propertyType?: PropertyType;
}

export interface AffordablePriceResult {
  maxPropertyPrice: number;
  maxLoanAmount: number;
  monthlyInstalment: number;
  instalmentBudget: number;
  upfrontCashNeeded: number;
  dsrGross: number;
  dsrNet: number;
  netIncome: number;
  targetDsrPercent: number;
  basis: 'gross';
  limitedBy: 'dsr' | 'zero-budget';
}

/**
 * Solves the reverse question — "what price can I afford?" — which the rest of the
 * engine cannot answer, because everything else runs price -> instalment -> DSR.
 *
 * Bisection on property price rather than a closed form: upfront cash, stamp duty
 * and legal fees are all tiered and price-dependent, so there is no clean inverse.
 * 60 iterations over a 0..RM50m bracket converges well past sen precision.
 *
 * DSR is assessed on GROSS income, matching how Malaysian banks decide (see
 * docs/RATE_AUDIT_2026-07-30.md, DEFECT-2). `dsrNet` is returned alongside as the
 * honest cash-flow picture, and callers should show both.
 *
 * This is a planning estimate, not an approval. Banks apply their own credit
 * scoring, income multiples and internal DSR ceilings on top of this.
 */
export function maxAffordablePrice(input: AffordablePriceInput, cfg: MalaysiaConfig = CONFIG): AffordablePriceResult {
  const gross = Math.max(0, input.grossMonthlyIncome);
  const commitments = Math.max(0, input.existingCommitments ?? 0);
  const targetDsrPercent = input.targetDsrPercent ?? 40;
  const downPaymentPercent = input.downPaymentPercent ?? 10;
  const tenureMonths = Math.max(1, Math.round(input.tenureYears * 12));

  const income = netMonthlyIncome({ grossMonthlyIncome: gross, monthlyTax: input.monthlyTax, age: input.age }, cfg);
  const instalmentBudget = round2(Math.max(0, gross * targetDsrPercent / 100 - commitments));

  const empty = (): AffordablePriceResult => ({
    maxPropertyPrice: 0, maxLoanAmount: 0, monthlyInstalment: 0, instalmentBudget,
    upfrontCashNeeded: 0, dsrGross: 0, dsrNet: 0, netIncome: income.net,
    targetDsrPercent, basis: 'gross', limitedBy: 'zero-budget',
  });
  if (gross <= 0 || instalmentBudget <= 0) return empty();

  const instalmentFor = (price: number) =>
    reducingBalanceInstalment(price * Math.max(0, 1 - downPaymentPercent / 100), input.annualRatePercent, tenureMonths);

  let low = 0;
  let high = 50_000_000;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (instalmentFor(mid) <= instalmentBudget) low = mid; else high = mid;
  }

  // Round down to the nearest RM1,000 — a price to shop at, not a false precision.
  const maxPropertyPrice = Math.floor(low / 1000) * 1000;
  if (maxPropertyPrice <= 0) return empty();

  const maxLoanAmount = round2(maxPropertyPrice * Math.max(0, 1 - downPaymentPercent / 100));
  const monthlyInstalment = round2(instalmentFor(maxPropertyPrice));

  const buyerType = input.buyerType ?? 'citizen';
  const firstHome = input.firstHome ?? true;
  const mot = calculateMOTStampDuty({ propertyPrice: maxPropertyPrice, buyerType, firstHome }, cfg);
  const loanDuty = calculateLoanStampDuty({ loanAmount: maxLoanAmount, propertyPrice: maxPropertyPrice, buyerType, firstHome }, cfg);
  const spaLegal = calculateSPALegalFees(maxPropertyPrice, 0, cfg);
  const loanLegal = calculateLoanLegalFees(maxLoanAmount, 0, cfg);
  const valuation = calculateValuationFees(maxPropertyPrice, input.propertyType ?? 'subsale', cfg);
  const downPayment = maxPropertyPrice * downPaymentPercent / 100;

  return {
    maxPropertyPrice,
    maxLoanAmount,
    monthlyInstalment,
    instalmentBudget,
    upfrontCashNeeded: round2(downPayment + mot.netDuty + loanDuty.netDuty + spaLegal.total + loanLegal.total + valuation),
    dsrGross: round2((commitments + monthlyInstalment) / gross * 100),
    dsrNet: income.net > 0 ? round2((commitments + monthlyInstalment) / income.net * 100) : 0,
    netIncome: income.net,
    targetDsrPercent,
    basis: 'gross',
    limitedBy: 'dsr',
  };
}

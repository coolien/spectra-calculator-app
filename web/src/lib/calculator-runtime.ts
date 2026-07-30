import {
  calculateCarLoan,
  calculateCreditCard,
  calculateFaraid,
  parseNumber,
  formatMyr,
  formatPercent,
  type CalculatorKey,
  type CalculatorResult,
} from '@/lib/calculators';
import type { CalculatorOutcome, FormState } from '@/lib/app-model';
import { calculateHousingPurchase } from '@/lib/finance/housing-finance-engine';
import { personalLoanReview } from '@/lib/finance/personal-loan-engine';
import { assessEligibility, bnplTrueCost, creditCardRealityCheck, latePaymentCost, minimumPaymentTrap, utilizationImpact } from '@/lib/finance/credit-card-literacy-engine';
import { ptptnDsrImpact, ptptnRepayment, settlementWithDiscount } from '@/lib/finance/ptptn-literacy-engine';

const number = (value: string | undefined) => parseNumber(value ?? '0');
const boolean = (value: string | undefined) => value === 'true';

export function calculateFromForm(calculator: CalculatorKey, form: FormState): CalculatorOutcome {
  switch (calculator) {
    case 'home': return calculateHomeFromForm(form);
    case 'car':
      return calculateCarLoan({ vehiclePrice: number(form.vehiclePrice), downPaymentPercent: number(form.downPaymentPercent), annualFlatRatePercent: number(form.annualFlatRatePercent), tenureYears: number(form.tenureYears), upfrontFees: number(form.upfrontFees) });
    case 'personal': return calculatePersonalFromForm(form);
    case 'credit': return calculateCreditFromForm(form);
    case 'ptptn': return calculatePtptnFromForm(form);
    case 'faraid':
      return calculateFaraid({ grossEstate: number(form.grossEstate), debtsAndExpenses: number(form.debtsAndExpenses), wasiyyah: number(form.wasiyyah), deceasedGender: form.deceasedGender === 'female' ? 'female' : 'male', wives: number(form.wives), hasHusband: boolean(form.hasHusband), sons: number(form.sons), daughters: number(form.daughters), hasFather: boolean(form.hasFather), hasMother: boolean(form.hasMother) });
  }
}

function calculateHomeFromForm(form: FormState): CalculatorResult {
  const financingType = form.financingType === 'islamic' ? 'islamic' : 'conventional';
  const monthlyIncome = number(form.monthlyIncome);
  const result = calculateHousingPurchase({
    propertyPrice: number(form.propertyPrice),
    downPaymentPercent: number(form.downPaymentPercent),
    annualRatePercent: number(form.annualRatePercent),
    tenureYears: number(form.tenureYears),
    buyerType: form.buyerStatus === 'foreign' ? 'foreign-individual' : form.buyerStatus === 'pr' ? 'pr' : 'citizen',
    firstHome: boolean(form.firstHome),
    propertyType: form.propertyType === 'new-project' ? 'new-project' : 'subsale',
    financingType,
    ceilingRatePercent: number(form.ceilingRatePercent) || 10,
    grossMonthlyIncome: monthlyIncome,
    monthlyTax: number(form.monthlyTax),
    existingCommitments: number(form.existingCommitments),
    targetDsrPercent: number(form.targetDsrPercent),
    extraMonthlyPayment: number(form.extraMonthlyPayment),
    settlementYear: number(form.settlementYears),
    epfWithdrawal: number(form.epfWithdrawal),
    solicitorDiscountPercent: number(form.solicitorDiscountPercent),
    mrtaPremium: number(form.mrtaPremium),
    mrtaCapitalize: boolean(form.mrtaCapitalize),
    mltaMonthlyPremium: number(form.mltaMonthlyPremium),
    annualChargeableIncome: number(form.annualChargeableIncome) || monthlyIncome * 12,
  });
  const label = financingType === 'islamic' ? 'profit' : 'instalment';
  const dsr = result.affordability;
  return {
    title: `Estimated monthly ${label}`,
    primaryValue: formatMyr(result.monthlyCommitment.total),
    subtitle: `${formatMyr(result.loan.financedAmount)} financed after ${formatMyr(result.loan.downPayment)} down payment.`,
    metrics: [
      { label: 'Loan amount', value: formatMyr(result.loan.financedAmount) },
      { label: 'Net cash needed', value: formatMyr(result.upfrontCash.netCashOutlay) },
      { label: 'DSR on net income', value: dsr ? formatPercent(dsr.dsrNet) : 'Add income' },
      { label: '3-year tax relief saving', value: formatMyr(result.taxRelief.totalSaving) },
    ],
    rows: [
      { label: 'MOT stamp duty', value: formatMyr(result.upfrontCash.motStampDuty) },
      { label: 'Loan agreement duty', value: formatMyr(result.upfrontCash.loanStampDuty) },
      { label: 'SPA legal fees', value: formatMyr(result.upfrontCash.spaLegalFees) },
      { label: 'Loan legal fees', value: formatMyr(result.upfrontCash.loanLegalFees) },
      { label: 'Valuation fees', value: formatMyr(result.upfrontCash.valuationFees) },
      { label: 'Gross upfront cash', value: formatMyr(result.upfrontCash.grossUpfront) },
      { label: 'EPF withdrawal offset', value: formatMyr(result.upfrontCash.epfWithdrawal) },
      { label: 'Base monthly instalment', value: formatMyr(result.monthlyCommitment.baseInstalment) },
      { label: 'Months saved', value: String(result.amortization.monthsSaved) },
      { label: 'Interest/profit saved', value: formatMyr(result.amortization.interestSaved) },
      { label: 'Settlement balance', value: result.amortization.settlementBalance == null ? 'Not set' : formatMyr(result.amortization.settlementBalance) },
    ],
    notes: [
      'Numbers are config-driven planning estimates for Peninsular Malaysia; replace fees with official quotes.',
      'The first-home exemption applies only to eligible Malaysian citizens buying a qualifying home at or below RM500,000.',
      'DSR is shown on net income after EPF, SOCSO, EIS and PCB; each bank can use its own policy.',
      result.taxRelief.totalSaving > 0 ? result.taxRelief.note : 'Tax relief depends on the SPA window, first-home status, use of the property and your chargeable income.',
    ],
    insights: [
      { id: 'monthly', title: 'Monthly commitment', headline: `${formatMyr(result.monthlyCommitment.total)} including protection`, detail: 'The monthly view combines the reducing-balance instalment with any MLTA/MLTT premium entered above.' },
      { id: 'upfront', title: 'Upfront cash', headline: `${formatMyr(result.upfrontCash.netCashOutlay)} after EPF offset`, detail: 'MOT, loan duty, SRO 2023 legal fees, valuation and MRTA/MRTT are itemised so each assumption can be edited.' },
      { id: 'affordability', title: 'Affordability', headline: dsr ? `${formatPercent(dsr.dsrNet)} net DSR · ${dsr.verdict}` : 'Add income to check DSR', detail: dsr ? dsr.label : 'A bank may assess commitments on a different income basis or use a different ceiling.' },
      { id: 'schedule', title: 'Amortisation', headline: `${result.amortization.actualMonths} months planned`, detail: `The schedule tracks interest, principal, extra payments and the optional settlement year. Interest saved here is from the extra payment assumptions only.`, tone: 'accent' },
    ],
    comparison: { monthlyPayment: result.monthlyCommitment.total, totalRepayment: result.amortization.totalRepayment, upfrontCash: result.upfrontCash.netCashOutlay, durationMonths: result.amortization.actualMonths },
  };
}

function calculatePersonalFromForm(form: FormState): CalculatorResult {
  const method = form.method === 'flat' ? 'flat' : 'reducing';
  const review = personalLoanReview({ principal: number(form.principal), ratePercent: number(form.annualRatePercent), years: number(form.tenureYears), method, upfrontFees: number(form.upfrontFees), stampDutyRatePercent: number(form.stampDutyRatePercent), grossMonthlyIncome: number(form.grossMonthlyIncome), existingCommitments: number(form.existingCommitments), monthlyTax: number(form.monthlyTax), settleAfterYears: number(form.settleAfterYears), safety: { askedForUpfrontFee: boolean(form.askedForUpfrontFee), payToPersonalAccount: boolean(form.payToPersonalAccount), guaranteedApproval: boolean(form.guaranteedApproval), whatsappOnly: boolean(form.whatsappOnly), foundOnIKrediKom: boolean(form.foundOnIKrediKom) } });
  const { quote, dsr, settlement, safety } = review;
  return {
    title: 'Effective interest rate (EIR)',
    primaryValue: formatPercent(quote.eirPercent),
    subtitle: method === 'flat' ? `${formatPercent(quote.ratePercent)} flat → ${formatPercent(quote.eirPercent)} real cost.` : 'Reducing-balance rate shown directly as the EIR.',
    metrics: [
      { label: 'Monthly payment', value: formatMyr(quote.monthlyInstalment) },
      { label: 'Total interest', value: formatMyr(quote.totalInterest) },
      { label: 'Total cost', value: formatMyr(quote.totalCost) },
      { label: 'DSR after loan', value: dsr ? formatPercent(dsr.dsrNet) : 'Add income' },
    ],
    rows: [
      { label: 'Quoted rate', value: formatPercent(quote.ratePercent) },
      { label: 'Interest as % of principal', value: formatPercent(quote.interestAsPctOfPrincipal) },
      { label: 'Stamp duty estimate', value: formatMyr(quote.stampDuty) },
      { label: 'Upfront fees', value: formatMyr(quote.upfrontFees) },
      { label: 'Rule-of-78 settlement', value: settlement ? formatMyr(settlement.settlementAmount) : 'Settle-after not set' },
      { label: 'Extra vs plain principal', value: settlement ? formatMyr(settlement.extraVsPlainPrincipal) : '—' },
    ],
    notes: [review.regulatoryNote ?? 'Reducing-balance personal financing is easier to compare on EIR.', safety.note, 'Always verify the lender licence and product disclosure sheet before sharing documents or paying anything.'],
    insights: [
      { id: 'eir', title: 'The real cost', headline: method === 'flat' ? `${formatPercent(quote.ratePercent)} flat becomes ${formatPercent(quote.eirPercent)} EIR` : `${formatPercent(quote.eirPercent)} EIR`, detail: 'Flat interest is charged on the original amount for the whole tenure. Use EIR to compare offers on the same basis.', tone: 'accent' },
      { id: 'dsr', title: 'DSR hit', headline: dsr ? `${formatPercent(dsr.dsrNet)} on net income` : 'Add income and commitments', detail: dsr ? dsr.label : 'The app cannot judge affordability from loan amount alone; commitments and statutory deductions matter.' },
      { id: 'settlement', title: 'Early settlement', headline: settlement ? `${formatMyr(settlement.extraVsPlainPrincipal)} above plain principal` : 'Rule of 78 appears for flat loans', detail: settlement ? settlement.note : 'Choose flat rate and enter a settlement year to see how the rebate changes the settlement amount.' },
      { id: 'safety', title: 'Borrow safely', headline: safety.verdict === 'likely-scam' ? 'Likely scam — stop' : safety.verdict === 'looks-legitimate' ? 'No red flag entered' : 'Verify the lender first', detail: `${safety.note} ${safety.verifyTools.join(' · ')}`, tone: safety.verdict === 'likely-scam' ? 'warning' : 'neutral' },
    ],
    comparison: { monthlyPayment: quote.monthlyInstalment, totalRepayment: quote.totalRepayment, upfrontCash: quote.stampDuty + quote.upfrontFees, durationMonths: quote.months },
  };
}

function calculateCreditFromForm(form: FormState): CalculatorResult {
  const grossMonthlyIncome = number(form.grossMonthlyIncome);
  const existingCommitments = number(form.existingMonthlyCommitments);
  const reality = creditCardRealityCheck({ grossMonthlyIncome, existingMonthlyCommitments: existingCommitments, paysInFullEveryMonth: boolean(form.paysInFullEveryMonth), assumedLimit: number(form.totalLimit) || undefined });
  const trap = minimumPaymentTrap({ balance: number(form.outstandingBalance), aprPercent: number(form.annualFinanceChargePercent) });
  const late = latePaymentCost({ carriedBalance: number(form.outstandingBalance), horizonMonths: number(form.lateHorizonMonths) });
  const bnpl = bnplTrueCost({ purchaseAmount: number(form.bnplPurchaseAmount), lateFee: number(form.bnplLateFee), weeksLate: number(form.bnplWeeksLate) });
  const utilization = utilizationImpact(number(form.outstandingBalance), number(form.totalLimit));
  const eligibility = reality.eligibility;
  const primary = reality.verdict === 'go-ahead-disciplined' ? 'Pay in full' : reality.verdict === 'proceed-with-caution' ? 'Proceed carefully' : 'Not yet';
  return {
    title: 'Credit card reality check', primaryValue: primary, subtitle: reality.headline,
    metrics: [
      { label: 'DSR before / after', value: `${formatPercent(eligibility.dsrBefore)} / ${formatPercent(eligibility.dsrAfter)}` },
      { label: 'Recommended cards', value: String(reality.cards.recommended || 0) },
      { label: 'Minimum-only interest', value: formatMyr(trap.minimumOnly.totalInterest) },
      { label: 'BNPL effective APR', value: formatPercent(bnpl.effectiveAPRPercent) },
    ],
    rows: [
      { label: 'Income gate', value: eligibility.incomeGatePasses ? 'Passes RM24k/year gate' : 'Below RM24k/year gate' },
      { label: 'Maximum limit DSR supports', value: formatMyr(eligibility.maxSupportableLimit) },
      { label: 'Regulatory limit / issuer', value: eligibility.maxLimitPerIssuer == null ? 'Bank discretion' : formatMyr(eligibility.maxLimitPerIssuer) },
      { label: 'Card utilisation', value: formatPercent(utilization.utilizationPercent) },
      { label: 'One-late extra cost', value: formatMyr(late.oneLateExtraCost) },
      { label: 'Chronic-late extra cost', value: formatMyr(late.chronicLateExtraCost) },
    ],
    notes: [reality.headline, 'Paying in full is the default framing. The payoff view is here to show the cost of a balance you already have.', late.creditNote, bnpl.headline],
    insights: [
      { id: 'eligibility', title: 'Can you apply?', headline: eligibility.incomeGatePasses ? `${formatPercent(eligibility.dsrAfter)} DSR with the entered limit` : 'Income gate not met', detail: eligibility.reasons.join(' '), tone: eligibility.eligible ? 'accent' : 'warning' },
      { id: 'cards', title: 'One card, two, or more?', headline: `${reality.cards.recommended || 0} recommended`, detail: `${reality.cards.rationale} ${reality.cards.caution}` },
      { id: 'minimum', title: 'The minimum-payment trap', headline: `${trap.minimumOnly.months >= 1200 ? 'Long-running' : `${trap.minimumOnly.months} months`} · ${formatMyr(trap.minimumOnly.totalInterest)} interest`, detail: `${trap.headline} Pay-in-full interest is ${formatMyr(trap.payInFull.totalInterest)}.`, tone: 'warning' },
      { id: 'late', title: 'One late payment', headline: `${formatMyr(late.oneLateExtraCost)} extra in this example`, detail: `${late.creditNote} ${late.headline}` },
      { id: 'bnpl', title: 'BNPL true APR', headline: `${formatPercent(bnpl.effectiveAPRPercent)} if late`, detail: `${bnpl.headline} On-time cost is ${formatMyr(bnpl.costIfOnTime)}.`, tone: 'warning' },
    ],
    comparison: { monthlyPayment: 0, totalRepayment: trap.minimumOnly.totalPaid, upfrontCash: 0, durationMonths: trap.minimumOnly.months },
  };
}

function calculatePtptnFromForm(form: FormState): CalculatorResult {
  const repayment = ptptnRepayment({ outstandingBalance: number(form.outstandingBalance), ujrahRatePercent: number(form.annualUjrahRatePercent), tenureYears: number(form.tenureYears), method: form.method === 'flat' ? 'flat' : 'reducing', extraMonthlyPayment: number(form.extraMonthlyPayment) });
  const settlement = settlementWithDiscount(number(form.outstandingBalance), form.settlementDiscount === 'partial-or-salary-deduction' || form.settlementDiscount === 'consistent-scheduled' ? form.settlementDiscount : 'full-settlement');
  const impact = number(form.grossMonthlyIncome) > 0 ? ptptnDsrImpact({ monthlyInstalment: repayment.plannedInstalment, grossMonthlyIncome: number(form.grossMonthlyIncome), monthlyTax: number(form.monthlyTax) }) : null;
  return {
    title: 'Planned monthly instalment', primaryValue: formatMyr(repayment.plannedInstalment), subtitle: `${repayment.method === 'reducing' ? 'Reducing-balance Ujrah' : 'Flat statement-matching'} estimate over ${number(form.tenureYears)} years.`,
    metrics: [{ label: 'Total Ujrah', value: formatMyr(repayment.totalUjrah) }, { label: 'Payoff time', value: `${repayment.payoffMonths} months` }, { label: 'Settlement option', value: formatMyr(settlement.amountToPay) }, { label: 'Home capacity lost', value: impact ? formatMyr(impact.homeLoanCapacityLost) : 'Add income' }],
    rows: [{ label: 'Scheduled instalment', value: formatMyr(repayment.scheduledInstalment) }, { label: 'Minimum instalment', value: formatMyr(repayment.minInstalment) }, { label: 'Minimum check', value: repayment.belowMinimum ? 'Below RM150 — review' : 'At/above RM150' }, { label: 'Settlement discount', value: `${Math.round(settlement.discountRate * 100)}% · save ${formatMyr(settlement.saving)}` }, { label: 'CCRIS / DSR', value: impact ? `${formatPercent(impact.dsrContributionPercent)} of net DSR` : 'Add income' }],
    notes: [repayment.belowMinimum ? 'The planned payment is below the RM150 minimum instalment check. Confirm the actual PTPTN schedule.' : 'PTPTN Ujrah defaults to 1% reducing balance in this planning view.', impact?.reminder ?? 'PTPTN repayment is recorded on CCRIS and counts in DSR; add income to quantify the impact.', 'Discount rates and windows can change with each Budget cycle; verify on the PTPTN portal.'],
    insights: [{ id: 'minimum', title: 'Minimum instalment', headline: repayment.belowMinimum ? 'Below RM150 — review' : 'Passes the RM150 check', detail: 'The RM150 figure is a planning check; your official PTPTN statement and repayment schedule prevail.', tone: repayment.belowMinimum ? 'warning' : 'accent' }, { id: 'settlement', title: 'Settlement discount', headline: `${Math.round(settlement.discountRate * 100)}% → ${formatMyr(settlement.amountToPay)}`, detail: `Gross balance ${formatMyr(settlement.grossBalance)}; estimated saving ${formatMyr(settlement.saving)}. ${settlement.label}` }, { id: 'credit', title: 'CCRIS & DSR reminder', headline: impact ? `About ${formatMyr(impact.homeLoanCapacityLost)} less home-loan capacity` : 'Add income to quantify', detail: impact?.reminder ?? 'Every monthly PTPTN instalment is a monthly commitment a bank can count when assessing the next facility.' }],
    comparison: { monthlyPayment: repayment.plannedInstalment, totalRepayment: repayment.totalRepayment, upfrontCash: settlement.amountToPay, durationMonths: repayment.payoffMonths },
  };
}

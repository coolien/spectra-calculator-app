'use client';

import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileDown,
} from 'lucide-react';
import type { ComparisonSnapshot } from '@/lib/calculators';
import type { FormState, SavedScenario } from '@/lib/app-model';
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
  type AmortisationRow,
} from '@/lib/finance/hirePurchase';
import {
  APP_VERSION,
  contentLastReviewed,
  legislationEffectiveDate,
  providerGracePeriodEnd,
} from '@/lib/finance/hirePurchaseConfig';
import { CalculatorDisclaimer } from '@/components/calculators/CalculatorDisclaimer';
import { StickyResultBar } from '@/components/calculators/StickyResultBar';
import { AccordionCard, MetricCard, ScreenHeading, SegmentedControl } from '@/components/ui/Controls';
import { BrandRingLogo } from '@/components/ui/RingLogo';
import { useI18n } from '@/components/app-shell/I18nProvider';
import { formatMyr, formatPercent } from '@/lib/calculators';

type CarLoanCalculatorScreenProps = {
  form: FormState;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  onSave: (scenario: SavedScenario) => void;
};

type RateMode = 'eir' | 'flat';
type AgreementTiming = 'before' | 'after';
type ProviderReadiness = 'early' | 'not-yet' | 'not-sure';
type ScheduleView = 'yearly' | 'monthly';

type ValidationState = {
  errors: string[];
  warnings: string[];
};

type SettlementComparison = {
  month: number;
  newBalanceSen: number;
  newInterestSavedSen: number;
  oldBalanceSen: number;
  oldRebateSen: number;
  deltaSen: number;
};

type CarLoanCalculation = {
  vehiclePriceSen: number;
  downPaymentSen: number;
  downPaymentPercent: number;
  principalSen: number;
  tenureMonths: number;
  tenureYears: number;
  rateMode: RateMode;
  rateType: 'fixed' | 'variable';
  flatRatePercent: number;
  eirPercent: number;
  effectiveEIRPercent: number;
  statutoryCapPercent: number;
  schedule: AmortisationRow[];
  newMonthlySen: number;
  newTotalInterestSen: number;
  newExactTotalInterestSen: number;
  legacyMonthlySen: number;
  legacyTotalInterestSen: number;
  legacyTotalRepaymentSen: number;
  selectedMonthlySen: number;
  selectedTotalInterestSen: number;
  selectedTotalRepaymentSen: number;
  upfrontCostsSen: number;
  trueMonthlyCostSen: number;
  transition: AgreementTiming | ProviderReadiness;
  settlement: SettlementComparison;
  stressRows: StressRow[];
  validation: ValidationState;
};

type StressRow = {
  delta: number;
  eirPercent: number;
  monthlySen: number;
  totalInterestSen: number;
  overCap: boolean;
};

type ProviderOffer = {
  id: number;
  provider: string;
  basis: RateMode;
  rate: string;
  tenureMonths: string;
  preset?: boolean;
  monthlyOverrideSen?: number;
  interestOverrideSen?: number;
};

const STRESS_DELTAS = [-0.5, -0.25, 0, 0.25, 0.5, 1];

const FAQ_ITEMS = [
  ['Why is reducing balance being adopted?', 'Reducing balance replaces the Rule of 78 and charges interest only on the outstanding principal. That makes the interest allocation clearer and reduces the distortion for customers who settle early.'],
  ['Why does a flat rate look cheaper than an EIR?', 'A flat rate charges against the original amount for the whole tenure. A smaller-looking flat-rate percentage can therefore represent a higher true cost than the EIR shown on a reducing-balance quotation.'],
  ['What is the reducing-balance method?', 'Interest is charged on what you still owe. As principal is repaid, the interest portion falls and the principal portion rises.'],
  ['When do these changes take effect?', `The Hire-Purchase (Amendment) Act 2026 takes effect ${legislationEffectiveDate}. Providers have a grace period until ${providerGracePeriodEnd} to upgrade their systems.`],
  ['Does this affect my existing car loan?', 'Agreements signed before the effective date continue under their original terms. You and your provider may mutually agree to use the new net-balance method if the provider is ready.'],
  ['What happened to the Rule of 78?', 'It has been replaced for agreements under the new provisions. The old method front-loaded term charges, which could leave a larger balance when a customer settled early.'],
  ['Will I still get a rebate if I settle early?', 'Under the new reducing-balance method, no statutory rebate is needed because interest stops accruing when the outstanding principal is paid. Legacy agreements may use the Rule-of-78 rebate.'],
  ['What is the difference between fixed and variable rate financing?', 'Fixed financing keeps the rate and scheduled instalment constant. Variable financing moves with the Overnight Policy Rate, so the instalment can rise or fall.'],
  ['Is there a maximum interest rate?', 'Yes. Fixed financing is capped at 17% p.a. for up to five years and 16% p.a. beyond five years. Variable financing is capped at 17% p.a. for all tenures.'],
  ['What is a Reference Rate?', 'It is the benchmark used to price variable-rate financing under Bank Negara Malaysia’s Reference Rate Framework. The spread is added to it to determine the EIR.'],
  ['Can I sign electronically or digitally?', 'The guide confirms that electronic and digital signatures and electronic delivery may be used. The delivery method must be stated and mutually agreed in the agreement, and you can still request a hardcopy.'],
  ['How much down payment do I need?', 'Hire-purchase financing typically requires at least 10% of the vehicle price. Budget for instalments and related costs such as insurance or takaful, road tax, and maintenance.'],
  ['How accurate is this calculator?', 'It uses standard amortisation formulae and the published statutory parameters, but the output is an estimate. Your provider’s official quotation and product disclosure sheet apply.'],
  ['Who do I complain to if something goes wrong?', 'Contact the provider first. For unresolved matters, bank-provider customers may escalate to FMOS or BNMLINK. For non-bank providers, contact KPDN through its e-complaint portal or customer channels.'],
] as const;

export function CarLoanCalculatorScreen({
  form,
  onChange,
  onReset,
  onSave,
}: CarLoanCalculatorScreenProps) {
  const { language } = useI18n();
  const [calculated, setCalculated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSteps, setOpenSteps] = useState<string[]>(['financing']);
  const [resultRef, setResultRef] = useState<HTMLDivElement | null>(null);
  const [offers, setOffers] = useState<ProviderOffer[]>(defaultOffers);
  const outcome = useMemo(() => {
    try {
      return { result: calculateCarLoanForm(form) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Check the input values.' };
    }
  }, [form]);
  const result = 'result' in outcome ? outcome.result : null;
  const locale = language === 'bm' ? 'ms-MY' : language === 'zh' ? 'zh-MY' : language === 'ta' ? 'ta-MY' : 'en-MY';
  const generatedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date());
  const validation = result?.validation ?? validateCarLoanForm(form);

  function changeField(key: string, value: string) {
    setSaved(false);
    onChange(key, value);
    if (key === 'vehicleType' && value === 'used' && (form.tenureYears === '9' || form.tenureYears === 'custom')) {
      onChange('tenureYears', '7');
    }
  }

  function toggleStep(id: string) {
    setOpenSteps((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  function calculate() {
    setCalculated(true);
    window.requestAnimationFrame(() => resultRef?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function save() {
    if (!result) return;
    const comparison: ComparisonSnapshot = {
      monthlyPayment: result.selectedMonthlySen / 100,
      totalRepayment: result.selectedTotalRepaymentSen / 100,
      upfrontCash: result.upfrontCostsSen / 100,
      durationMonths: result.tenureMonths,
    };
    onSave({
      id: `car-${Date.now()}`,
      calculator: 'car',
      label: `Car Loan / Hire Purchase - saved plan`,
      result: formatSen(result.selectedMonthlySen),
      secondary: formatSen(result.selectedTotalInterestSen),
      savedAt: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date()),
      comparison,
    });
    setSaved(true);
  }

  function exportPdf() {
    const originalTitle = document.title;
    document.title = 'Spectra - Car Loan / Hire Purchase';
    const restoreTitle = () => { document.title = originalTitle; };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    window.print();
    window.setTimeout(restoreTitle, 1000);
  }

  return (
    <div className="calculator-screen">
      <div className="screen-scroll">
        <ScreenHeading title="Hire purchase estimate" subtitle="Estimates in MYR - ask for the EIR and review the official quotation before deciding" />
        <div className="hp-law-banner">
          <CheckCircle2 size={17} aria-hidden="true" />
          <p><strong>EIR + reducing balance from {legislationEffectiveDate}.</strong> Providers may adopt the new method during the transition period. Ask yours which method applies.</p>
        </div>

        <div className="calculator-steps">
          <AccordionCard number={1} title="Vehicle & financing" summary={`${formatSen(toSen(numberValue(form.vehiclePrice)))} · ${tenureLabel(form)}`} open={openSteps.includes('financing')} onToggle={() => toggleStep('financing')}>
            <p className="step-description">Start with the amount financed, tenure, and the rate you were quoted.</p>
            <div className="field-grid">
              <MoneyInput label="Vehicle price" value={form.vehiclePrice ?? ''} prefix="RM" onChange={(value) => changeField('vehiclePrice', value)} fullWidth />
              <div className="field-wrap is-full">
                <span className="field-label">Down payment input</span>
                <SegmentedControl value={form.downPaymentMode === 'amount' ? 'amount' : 'percent'} options={[{ value: 'percent', label: '%' }, { value: 'amount', label: 'RM' }]} onChange={(value) => changeField('downPaymentMode', value)} ariaLabel="Down payment input type" />
              </div>
              {form.downPaymentMode === 'amount'
                ? <MoneyInput label="Down payment" value={form.downPaymentAmount ?? ''} prefix="RM" onChange={(value) => changeField('downPaymentAmount', value)} />
                : <NumberInput label="Down payment" value={form.downPaymentPercent ?? ''} suffix="%" onChange={(value) => changeField('downPaymentPercent', value)} min="0" max="90" />}
              <div className="field-wrap">
                <span className="field-label">Rate basis</span>
                <SegmentedControl value={form.rateMode === 'flat' ? 'flat' : 'eir'} options={[{ value: 'eir', label: 'EIR (reducing balance)' }, { value: 'flat', label: 'Flat (legacy)' }]} onChange={(value) => changeField('rateMode', value)} ariaLabel="Rate basis" />
              </div>
              {form.rateMode === 'flat' ? (
                <div className="field-wrap is-full">
                  <NumberInput label="Flat rate p.a." value={form.flatRatePercent ?? form.annualFlatRatePercent ?? ''} suffix="%" onChange={(value) => { changeField('flatRatePercent', value); changeField('annualFlatRatePercent', value); }} min="0" max="100" />
                  <div className="hp-notice hp-notice-amber"><AlertTriangle size={15} aria-hidden="true" /><span>Flat rate is being phased out under the Hire-Purchase (Amendment) Act 2026. We convert it to the equivalent EIR so you can compare fairly.</span></div>
                </div>
              ) : (
                <div className="field-wrap is-full">
                  <NumberInput label="Effective Interest Rate (EIR) p.a." value={form.rateType === 'variable' ? variableEIR(form) : form.eirPercent ?? ''} suffix="%" onChange={(value) => changeField('eirPercent', value)} min="0" max="17" readOnly={form.rateType === 'variable'} />
                  <p className="field-helper">The rate providers must quote from {legislationEffectiveDate}. Ask your provider: &quot;What&apos;s the EIR?&quot;</p>
                </div>
              )}
              <div className="field-wrap is-full">
                <span className="field-label">Tenure</span>
                <SegmentedControl value={['5', '7', '9'].includes(form.tenureYears ?? '') ? (form.tenureYears ?? '7') : 'custom'} options={[{ value: '5', label: '5y' }, { value: '7', label: '7y' }, { value: '9', label: '9y' }, { value: 'custom', label: 'Custom' }]} onChange={(value) => changeField('tenureYears', value)} ariaLabel="Tenure" />
                {form.tenureYears === 'custom' && <NumberInput label="Custom tenure (1-9 years)" value={form.customTenureYears ?? ''} suffix="years" onChange={(value) => changeField('customTenureYears', value)} min="1" max="9" step="1" />}
              </div>
              {validation.warnings.map((warning) => <div className="hp-notice hp-notice-amber is-full" key={warning}><AlertTriangle size={15} aria-hidden="true" /><span>{warning}</span></div>)}
            </div>
          </AccordionCard>

          <AccordionCard number={2} title="Rate type" summary={form.rateType === 'variable' ? 'Variable rate' : 'Fixed rate'} open={openSteps.includes('rate')} onToggle={() => toggleStep('rate')}>
            <div className="field-grid">
              <div className="field-wrap is-full">
                <span className="field-label">Rate type</span>
                <SegmentedControl value={form.rateType === 'variable' ? 'variable' : 'fixed'} options={[{ value: 'fixed', label: 'Fixed rate' }, { value: 'variable', label: 'Variable rate' }]} onChange={(value) => changeField('rateType', value)} ariaLabel="Rate type" />
                <p className="field-helper">{form.rateType === 'variable' ? 'Rate moves with the Overnight Policy Rate (OPR). Your instalment can go up or down.' : 'Rate and instalment stay the same for the whole tenure. Easier to budget.'}</p>
              </div>
              {form.rateType === 'variable' && <>
                <NumberInput label="Reference Rate" value={form.referenceRate ?? ''} suffix="%" onChange={(value) => changeField('referenceRate', value)} min="0" max="17" />
                <NumberInput label="Spread / margin" value={form.spread ?? ''} suffix="%" onChange={(value) => changeField('spread', value)} min="0" max="17" />
                <NumberInput label="EIR (Reference Rate + spread)" value={variableEIR(form)} suffix="%" readOnly fullWidth />
                <div className="field-wrap is-full">
                  <span className="field-label">OPR stress test</span>
                  <div className="stress-chip-row" role="group" aria-label="OPR stress test scenarios">
                    {STRESS_DELTAS.map((delta) => <button type="button" className={String(delta) === (form.oprStress ?? '0') ? 'stress-chip is-selected' : 'stress-chip'} key={delta} onClick={() => changeField('oprStress', String(delta))}>{stressLabel(delta)}</button>)}
                  </div>
                  <div className="stress-table">
                    {result?.stressRows.map((row) => <div className={row.overCap ? 'stress-row is-over-cap' : 'stress-row'} key={row.delta}><span>{stressLabel(row.delta)} <small>{formatPercent(row.eirPercent)} EIR</small></span><strong>{formatSen(row.monthlySen)}</strong><em>{formatSen(row.totalInterestSen)} interest</em></div>)}
                  </div>
                </div>
              </>}
              {result && <div className={result.eirPercent <= result.statutoryCapPercent ? 'hp-cap-check is-valid is-full' : 'hp-cap-check is-invalid is-full'}>{result.eirPercent <= result.statutoryCapPercent ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}<span>{result.eirPercent <= result.statutoryCapPercent ? `Within the statutory maximum of ${formatPercent(result.statutoryCapPercent)} p.a.` : statutoryCapMessage(result.eirPercent, result.statutoryCapPercent, result.rateType, result.tenureYears)}</span></div>}
              {!result && validation.errors.filter((error) => error.startsWith('Exceeds the statutory maximum')).map((error) => <div className="hp-cap-check is-invalid is-full" key={error}><AlertTriangle size={16} /><span>{error}</span></div>)}
            </div>
          </AccordionCard>

          <AccordionCard number={3} title="Vehicle details" summary={`${form.vehicleType === 'used' ? 'Used' : 'New'} vehicle`} open={openSteps.includes('vehicle')} onToggle={() => toggleStep('vehicle')}>
            <div className="field-grid">
              <div className="field-wrap is-full">
                <span className="field-label">Vehicle type</span>
                <SegmentedControl value={form.vehicleType === 'used' ? 'used' : 'new'} options={[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }]} onChange={(value) => changeField('vehicleType', value)} ariaLabel="Vehicle type" />
              </div>
              {form.vehicleType === 'used' && <div className="hp-notice hp-notice-amber is-full"><AlertTriangle size={15} aria-hidden="true" /><span>Used vehicles often receive a higher EIR and a shorter maximum tenure because providers may cap financing by vehicle age.</span></div>}
              {form.vehicleType !== 'used' && <p className="field-helper is-full">New vehicles commonly have more tenure options. Your provider&apos;s eligibility and margin rules still apply.</p>}
            </div>
          </AccordionCard>

          <AccordionCard number={4} title="Transition / provider readiness" summary={transitionSummary(form)} open={openSteps.includes('transition')} onToggle={() => toggleStep('transition')}>
            <p className="step-description">The agreement date and provider&apos;s system readiness determine which method applies.</p>
            <div className="field-grid">
              <div className="field-wrap is-full">
                <span className="field-label">When is your agreement signed?</span>
                <SegmentedControl value={form.agreementTiming === 'before' ? 'before' : 'after'} options={[{ value: 'before', label: `Before ${legislationEffectiveDate}` }, { value: 'after', label: `On/after ${legislationEffectiveDate}` }]} onChange={(value) => changeField('agreementTiming', value)} ariaLabel="Agreement signing date" />
              </div>
              {form.agreementTiming !== 'before' && <div className="field-wrap is-full">
                <span className="field-label">Has your provider switched to reducing balance yet?</span>
                <SegmentedControl value={form.providerReadiness === 'early' ? 'early' : form.providerReadiness === 'not-yet' ? 'not-yet' : 'not-sure'} options={[{ value: 'early', label: 'Yes - early adopter' }, { value: 'not-yet', label: 'Not yet' }, { value: 'not-sure', label: 'Not sure' }]} onChange={(value) => changeField('providerReadiness', value)} ariaLabel="Provider readiness" />
              </div>}
              <div className="hp-notice hp-notice-neutral is-full"><span>{transitionMessage(form)}</span></div>
            </div>
          </AccordionCard>

          <AccordionCard number={5} title="Upfront costs & ownership" summary="Estimate only" optional open={openSteps.includes('ownership')} onToggle={() => toggleStep('ownership')}>
            <p className="step-description">Include costs beyond the instalment so the true monthly cost is easier to budget. All fields are estimates and optional.</p>
            <h3 className="hp-subheading">Upfront</h3>
            <div className="field-grid">
              <MoneyInput label="Processing / documentation fee" value={form.processingFee ?? ''} prefix="RM" onChange={(value) => changeField('processingFee', value)} />
              <MoneyInput label="First-year insurance / takaful" value={form.firstYearInsurance ?? ''} prefix="RM" onChange={(value) => changeField('firstYearInsurance', value)} />
              <MoneyInput label="Road tax" value={form.roadTax ?? ''} prefix="RM" onChange={(value) => changeField('roadTax', value)} />
              <MoneyInput label="Registration / ownership transfer" value={form.registrationTransfer ?? ''} prefix="RM" onChange={(value) => changeField('registrationTransfer', value)} />
              <MoneyInput label="Accessories" value={form.accessories ?? ''} prefix="RM" onChange={(value) => changeField('accessories', value)} />
            </div>
            <h3 className="hp-subheading">Recurring monthly-equivalent</h3>
            <div className="field-grid">
              <MoneyInput label="Insurance / takaful renewal (annual)" value={form.insuranceRenewal ?? ''} prefix="RM" suffix="/yr" onChange={(value) => changeField('insuranceRenewal', value)} />
              <MoneyInput label="Road tax (annual)" value={form.recurringRoadTax ?? ''} prefix="RM" suffix="/yr" onChange={(value) => changeField('recurringRoadTax', value)} />
              <MoneyInput label="Servicing & maintenance (annual)" value={form.maintenance ?? ''} prefix="RM" suffix="/yr" onChange={(value) => changeField('maintenance', value)} />
              <MoneyInput label="Tyres (annual)" value={form.tyres ?? ''} prefix="RM" suffix="/yr" onChange={(value) => changeField('tyres', value)} />
              <MoneyInput label="Parking / toll / fuel (monthly)" value={form.parkingTollFuel ?? ''} prefix="RM" suffix="/mo" onChange={(value) => changeField('parkingTollFuel', value)} />
            </div>
          </AccordionCard>
        </div>

        {validation.errors.length > 0 && <div className="hp-validation-summary" role="alert" aria-live="polite">{validation.errors.map((error) => <p key={error}><AlertTriangle size={15} />{error}</p>)}</div>}
        <p className="scroll-hint">{calculated ? 'Review the full breakdown below' : 'Calculate to review the full breakdown'}</p>

        {calculated && result && (
          <div ref={setResultRef}>
            <CarLoanResult calculation={result} form={form} generatedDate={generatedDate} onExportPdf={exportPdf} offers={offers} setOffers={setOffers} />
          </div>
        )}
      </div>
      <StickyResultBar
        primaryLabel={result ? (result.transition === 'before' ? 'Legacy monthly instalment' : 'Estimated monthly instalment') : 'Estimated monthly instalment'}
        primaryValue={result ? formatSen(result.selectedMonthlySen) : '-'}
        secondaryLabel="Total interest"
        secondaryValue={result ? formatSen(result.selectedTotalInterestSen) : '-'}
        error={outcome.error}
        saved={saved}
        calculated={calculated}
        onSave={save}
        onReset={() => { setCalculated(false); setSaved(false); onReset(); }}
        onCalculate={calculate}
      />
    </div>
  );
}

function CarLoanResult({
  calculation,
  form,
  generatedDate,
  onExportPdf,
  offers,
  setOffers,
}: {
  calculation: CarLoanCalculation;
  form: FormState;
  generatedDate: string;
  onExportPdf: () => void;
  offers: ProviderOffer[];
  setOffers: (offers: ProviderOffer[]) => void;
}) {
  const { language } = useI18n();
  return (
    <section className="full-result print-report" aria-label="Full hire-purchase calculation breakdown">
      <header className="print-report-header">
        <div className="print-report-brand"><BrandRingLogo size={32} /><strong>Spectra</strong></div>
        <div><h1>Car Loan / Hire Purchase</h1><p>Generated on {generatedDate} · Calculator version {APP_VERSION}</p></div>
      </header>

      <button className="result-export-action" type="button" onClick={onExportPdf}><FileDown size={18} /><span>Save as PDF</span></button>
      <CalculatorDisclaimer level="compact" />

      {calculation.transition === 'before' && <div className="hp-notice hp-notice-amber"><AlertTriangle size={16} /><span>Agreements signed before {legislationEffectiveDate} continue under the original Hire-Purchase Act 1967 terms.</span></div>}
      {calculation.transition === 'not-yet' || calculation.transition === 'not-sure' ? <div className="hp-notice hp-notice-neutral"><span>Providers have until {providerGracePeriodEnd} to switch. Ask yours whether it has moved to the reducing-balance method; early adopters may already offer it.</span></div> : null}

      <div className="result-summary-card">
        <span>{calculation.transition === 'before' ? 'Estimated legacy monthly instalment' : 'Estimated monthly instalment'}</span>
        <strong>{formatSen(calculation.selectedMonthlySen)}</strong>
        <p>{formatSen(calculation.principalSen)} financed after {formatSen(calculation.downPaymentSen)} down payment over {calculation.tenureYears} years. True monthly cost: <strong>{formatSen(calculation.trueMonthlyCostSen)}</strong>.</p>
      </div>

      {(calculation.transition === 'not-yet' || calculation.transition === 'not-sure') && <MethodComparison calculation={calculation} />}

      <div className="metric-grid">
        <MetricCard label="True monthly cost" value={formatSen(calculation.trueMonthlyCostSen)} />
        <MetricCard label="Total interest" value={formatSen(calculation.selectedTotalInterestSen)} />
        <MetricCard label="Effective Interest Rate (EIR)" value={formatPercent(calculation.effectiveEIRPercent)} />
        <MetricCard label="Total repayment" value={formatSen(calculation.selectedTotalRepaymentSen)} />
        <MetricCard label="Upfront cash estimate" value={formatSen(calculation.downPaymentSen + calculation.upfrontCostsSen)} />
      </div>

      <section className="breakdown-card">
        <h2>Breakdown</h2>
        {[
          ['Vehicle price', formatSen(calculation.vehiclePriceSen)],
          ['Down payment', `${formatSen(calculation.downPaymentSen)} (${formatPercent(calculation.downPaymentPercent)})`],
          ['Amount financed', formatSen(calculation.principalSen)],
          ['Rate type', calculation.rateType === 'variable' ? 'Variable rate' : 'Fixed rate'],
          ['Rate entered', calculation.rateMode === 'flat' ? `${formatPercent(calculation.flatRatePercent)} flat (legacy)` : `${formatPercent(calculation.eirPercent)} EIR`],
          ['Equivalent EIR', formatPercent(calculation.effectiveEIRPercent)],
          ['Statutory cap', formatPercent(calculation.statutoryCapPercent)],
          ['Tenure', `${calculation.tenureYears} years (${calculation.tenureMonths} months)`],
          ['Upfront ownership costs', formatSen(calculation.upfrontCostsSen)],
          ['Recurring monthly-equivalent costs', formatSen(calculation.trueMonthlyCostSen - calculation.selectedMonthlySen)],
        ].map(([label, value]) => <div className="breakdown-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <section className="notes-card">
        <h2>Planning notes</h2>
        <p><CheckCircle2 size={16} />The reducing-balance schedule shows how interest falls as principal is repaid.</p>
        <p><CheckCircle2 size={16} />The EIR is the comparison rate to request from each provider; a flat rate is shown only as a legacy reference.</p>
        <p><CheckCircle2 size={16} />This estimate excludes provider-specific fees, insurance terms, lock-in conditions, and eligibility rules.</p>
      </section>

      <PaymentScheduleSection schedule={calculation.schedule} />
      <EarlySettlementSection calculation={calculation} />
      <ProviderComparison calculation={calculation} offers={offers} setOffers={setOffers} />
      <KnowYourRights />
      <CalculatorDisclaimer level="full" />
      <FaqSection />
      <SourcesSection language={language} generatedDate={generatedDate} />
      <footer className="print-report-footer">
        <CalculatorDisclaimer level="pdf" />
        <p>Generated on {generatedDate} · Calculator version {APP_VERSION} · Content last reviewed {contentLastReviewed}.</p>
      </footer>
    </section>
  );
}

function PaymentScheduleSection({ schedule }: { schedule: AmortisationRow[] }) {
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<ScheduleView>('yearly');
  const [page, setPage] = useState(1);
  const yearly = yearlyRows(schedule);
  const rows = view === 'yearly' ? yearly : schedule;
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = view === 'monthly' ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const totalInterestSen = schedule.reduce((sum, row) => sum + row.interestSen, 0);
  const totalPrincipalSen = schedule.reduce((sum, row) => sum + row.principalSen, 0);
  const firstYear = yearly[0];
  const lastYear = yearly.at(-1);
  const firstPrincipalPercent = firstYear ? firstYear.principalSen / Math.max(1, firstYear.instalmentSen) * 100 : 0;
  const lastPrincipalPercent = lastYear ? lastYear.principalSen / Math.max(1, lastYear.instalmentSen) * 100 : 0;

  return (
    <section className="breakdown-card hp-collapsible" aria-label="Payment schedule">
      <button className="hp-section-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><span><strong>Payment schedule</strong><small>Interest vs principal on a reducing balance</small></span><ChevronDown className={open ? 'chevron is-open' : 'chevron'} size={17} /></button>
      {open && <div className="hp-collapsible-body">
        <div className="schedule-split-label"><span>Interest {formatSen(totalInterestSen)}</span><span>Principal {formatSen(totalPrincipalSen)}</span></div>
        <div className="schedule-split-bar" aria-label="Interest and principal split"><span style={{ width: `${totalInterestSen / Math.max(1, totalInterestSen + totalPrincipalSen) * 100}%` }} /><span style={{ width: `${totalPrincipalSen / Math.max(1, totalInterestSen + totalPrincipalSen) * 100}%` }} /></div>
        <p className="hp-summary-line">In year 1 you repay {formatSen(firstYear?.principalSen ?? 0)} of principal ({formatPercent(firstPrincipalPercent)} of what you paid). By year {lastYear?.year ?? 1} that rises to {formatSen(lastYear?.principalSen ?? 0)} ({formatPercent(lastPrincipalPercent)}).</p>
        <div className="schedule-toolbar"><SegmentedControl value={view} options={[{ value: 'yearly', label: 'Yearly' }, { value: 'monthly', label: 'Monthly' }]} onChange={(value) => { setView(value as ScheduleView); setPage(1); }} ariaLabel="Payment schedule view" />{view === 'monthly' && <span className="schedule-page-label">Page {page} of {pageCount}</span>}</div>
        <div className="comparison-scroll"><PaymentScheduleTable rows={visibleRows} /></div>
        <div className="print-only-schedule" aria-hidden="true"><PaymentScheduleTable rows={schedule} /></div>
        {view === 'monthly' && <div className="schedule-pagination"><button type="button" className="secondary-action" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</button><button type="button" className="secondary-action" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>Next</button></div>}
      </div>}
    </section>
  );
}

function MethodComparison({ calculation }: { calculation: CarLoanCalculation }) {
  return <section className="hp-method-compare" aria-label="New and legacy method comparison">
    <div className="method-compare-card is-new"><span className="settlement-kicker">EIR + REDUCING BALANCE</span><strong>New method</strong><b>{formatSen(calculation.newMonthlySen)} / month</b><small>{formatSen(calculation.newTotalInterestSen)} total interest · EIR {formatPercent(calculation.effectiveEIRPercent)}</small></div>
    <div className="method-compare-card"><span className="settlement-kicker">FLAT / RULE OF 78</span><strong>Legacy reference</strong><b>{formatSen(calculation.legacyMonthlySen)} / month</b><small>{formatSen(calculation.legacyTotalInterestSen)} total term charges · equivalent flat {formatPercent(calculation.flatRatePercent)}</small></div>
  </section>;
}

function PaymentScheduleTable({ rows }: { rows: Array<AmortisationRow | YearlyScheduleRow> }) {
  return <table className="hp-schedule-table"><caption className="visually-hidden">Hire-purchase payment schedule</caption><thead><tr><th scope="col">Period</th><th scope="col">Instalment</th><th scope="col">Interest</th><th scope="col">Principal</th><th scope="col">Outstanding balance</th></tr></thead><tbody>{rows.map((row) => <tr key={row.period}><th scope="row">{'year' in row ? `Year ${row.year}` : `Month ${row.period}`}</th><td>{formatSen(row.instalmentSen)}</td><td>{formatSen(row.interestSen)}</td><td>{formatSen(row.principalSen)}</td><td>{formatSen(row.outstandingBalanceSen)}</td></tr>)}</tbody></table>;
}

type YearlyScheduleRow = AmortisationRow & { year: number };

function yearlyRows(schedule: AmortisationRow[]): YearlyScheduleRow[] {
  const rows: YearlyScheduleRow[] = [];
  for (let start = 0; start < schedule.length; start += 12) {
    const slice = schedule.slice(start, start + 12);
    const first = slice[0];
    const last = slice.at(-1);
    if (!first || !last) continue;
    rows.push({
      year: Math.floor(start / 12) + 1,
      period: first.period,
      openingBalanceSen: first.openingBalanceSen,
      instalmentSen: slice.reduce((sum, row) => sum + row.instalmentSen, 0),
      interestSen: slice.reduce((sum, row) => sum + row.interestSen, 0),
      principalSen: slice.reduce((sum, row) => sum + row.principalSen, 0),
      outstandingBalanceSen: last.outstandingBalanceSen,
    });
  }
  return rows;
}

function EarlySettlementSection({ calculation }: { calculation: CarLoanCalculation }) {
  const [open, setOpen] = useState(true);
  const [month, setMonth] = useState(calculation.settlement.month);
  const selected = calculation.settlement.month === month ? calculation.settlement : calculateSettlement(calculation, month);
  const difference = Math.abs(selected.deltaSen);
  const newIsLower = selected.deltaSen > 0;
  return <section className="breakdown-card hp-collapsible" aria-label="Early settlement">
    <button className="hp-section-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><span><strong>Settle early?</strong><small>Compare the new method with the legacy Rule of 78</small></span><ChevronDown className={open ? 'chevron is-open' : 'chevron'} size={17} /></button>
    {open && <div className="hp-collapsible-body">
      <div className="field-wrap hp-settlement-input"><NumberInput label="Settle after" value={String(month)} suffix="months" min="0" max={String(calculation.tenureMonths)} step="1" onChange={(value) => setMonth(clampWhole(value, 0, calculation.tenureMonths))} /></div>
      <div className="settlement-grid">
        <div className="settlement-card is-new"><span className="settlement-kicker">NEW METHOD</span><strong>Hire-Purchase (Amendment) Act 2026</strong><div><span>Outstanding principal</span><b>{formatSen(selected.newBalanceSen)}</b></div><div><span>Interest saved</span><b>{formatSen(selected.newInterestSavedSen)}</b></div><p>Rebate: not applicable - interest simply stops accruing.</p><small>Under the new reducing-balance method, you were only charged interest on what you still owed.</small></div>
        <div className="settlement-card"><span className="settlement-kicker">OLD METHOD</span><strong>Hire-Purchase Act 1967 - Rule of 78</strong><div><span>Net balance due after rebate</span><b>{formatSen(selected.oldBalanceSen)}</b></div><div><span>Rebate under Rule of 78</span><b>{formatSen(selected.oldRebateSen)}</b></div><p>Rule of 78 front-loads interest, so settling early under an old agreement leaves a larger balance.</p></div>
      </div>
      <div className="hp-delta">Settling at month {selected.month} costs {formatSen(difference)} {newIsLower ? 'less' : 'more'} under the new method.</div>
    </div>}
  </section>;
}

function ProviderComparison({ calculation, offers, setOffers }: { calculation: CarLoanCalculation; offers: ProviderOffer[]; setOffers: (offers: ProviderOffer[]) => void }) {
  const quotes = offers.map((offer) => providerQuote(offer, calculation.principalSen));
  const cheapest = quotes.filter(Boolean).sort((a, b) => (a?.totalInterestSen ?? Infinity) - (b?.totalInterestSen ?? Infinity))[0]?.id;
  return <section className="breakdown-card hp-comparison-section" aria-label="Compare offers">
    <div className="hp-section-heading"><div><h2>Compare offers</h2><p>Always compare the EIR, not the flat rate - a flat rate looks cheaper than it really is.</p></div><button type="button" className="secondary-action" onClick={() => setOffers(guideOffers())}>Load guide example</button></div>
    <div className="comparison-offer-list">
      {offers.map((offer, index) => {
        const quote = quotes[index];
        return <div className={quote?.id === cheapest ? 'provider-offer is-cheapest' : 'provider-offer'} key={offer.id}>
          <div className="provider-offer-heading"><strong>{quote?.id === cheapest ? 'Cheapest total interest' : `Offer ${index + 1}`}</strong>{offers.length > 1 && <button type="button" className="small-icon-button" aria-label={`Remove offer ${index + 1}`} onClick={() => setOffers(offers.filter((item) => item.id !== offer.id))}>×</button>}</div>
          <div className="field-grid">
            <TextInput label="Provider name" value={offer.provider} onChange={(value) => updateOffer(offers, setOffers, offer.id, { provider: value })} />
            <NumberInput label="Tenure" value={String(Number(offer.tenureMonths) / 12 || '')} suffix="years" min="1" max="9" step="1" onChange={(value) => updateOffer(offers, setOffers, offer.id, { tenureMonths: String(clampWhole(value, 12, 108)) })} />
            <div className="field-wrap is-full"><span className="field-label">Rate entered</span><SegmentedControl value={offer.basis} options={[{ value: 'eir', label: 'EIR' }, { value: 'flat', label: 'Flat' }]} onChange={(value) => updateOffer(offers, setOffers, offer.id, { basis: value as RateMode, preset: false })} ariaLabel={`${offer.provider || 'Provider'} rate basis`} /></div>
            <NumberInput label={offer.basis === 'eir' ? 'EIR p.a.' : 'Flat rate p.a.'} value={offer.rate} suffix="%" min="0" max="17" onChange={(value) => updateOffer(offers, setOffers, offer.id, { rate: value, preset: false })} />
          </div>
          {quote && <div className="provider-quote"><span>Normalised EIR {formatPercent(quote.eirPercent)}</span><strong>{formatSen(quote.monthlySen)} / month</strong><b>{formatSen(quote.totalInterestSen)} interest</b></div>}
        </div>;
      })}
    </div>
    {offers.length < 3 && <button type="button" className="secondary-action hp-add-offer" onClick={() => setOffers([...offers, { id: Date.now(), provider: '', basis: 'eir', rate: '5.00', tenureMonths: String(calculation.tenureMonths) }] )}>+ Add provider</button>}
  </section>;
}

function KnowYourRights() {
  return <section className="breakdown-card hp-rights-section" aria-label="Know your rights"><h2>Know your rights</h2><div className="rights-grid"><div><CheckCircle2 size={17} /><p><strong>Ask for the EIR.</strong> Compare providers on the same reducing-balance measure, not a flat-rate headline.</p></div><div><CheckCircle2 size={17} /><p><strong>Read the agreement and product disclosure sheet.</strong> Check fees, delivery method, rate type, and settlement terms before signing.</p></div><div><CheckCircle2 size={17} /><p><strong>Electronic or digital signing is permitted.</strong> The agreed delivery method must be stated, and you can request a hardcopy.</p></div><div><CheckCircle2 size={17} /><p><strong>Use the right redress route.</strong> Contact the provider first; unresolved matters may go to FMOS or BNMLINK for bank providers, or KPDN for non-bank providers.</p></div></div><div className="external-links"><a href="https://www.kpdn.gov.my/" target="_blank" rel="noopener noreferrer">KPDN homepage <ExternalLink size={14} /></a><a href="https://www.bnm.gov.my/" target="_blank" rel="noopener noreferrer">Bank Negara Malaysia <ExternalLink size={14} /></a><a href="https://www.fmos.org.my/" target="_blank" rel="noopener noreferrer">FMOS <ExternalLink size={14} /></a></div></section>;
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ_ITEMS.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) };
  return <section className="breakdown-card hp-faq" aria-label="Frequently asked questions"><h2>Frequently asked questions</h2><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />{FAQ_ITEMS.map(([question, answer], index) => <div className="faq-item" key={question}><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}><span>{index + 1}. {question}</span><ChevronDown className={open === index ? 'chevron is-open' : 'chevron'} size={17} /></button><p className={open === index ? '' : 'faq-answer-closed'}>{answer}</p></div>)}</section>;
}

function SourcesSection({ language, generatedDate }: { language: string; generatedDate: string }) {
  return <section className="breakdown-card hp-sources" aria-label="Sources and further reading"><h2>Sources & further reading</h2><p className="hp-version-line">Content last reviewed: {contentLastReviewed}<br />Reflects legislation effective: {legislationEffectiveDate}<br />Calculator version: {APP_VERSION}</p><h3>Primary legislation & regulations</h3><SourceRow text="Hire-Purchase (Amendment) Act 2026 - Government of Malaysia. Effective 1 June 2026." href="https://www.kpdn.gov.my/" /><SourceRow text="Hire-Purchase Act 1967 (as amended) - Government of Malaysia." href="https://www.kpdn.gov.my/" /><SourceRow text="Hire-Purchase (Term Charges) Regulations 2005, as revised - statutory EIR thresholds used here." href="https://www.kpdn.gov.my/" /><SourceRow text="Consumer Credit Act 2025 - Ministry of Finance Malaysia." href="https://www.mof.gov.my/" /><SourceRow text="Electronic Commerce Act 2006 - electronic-signature basis." href="https://www.kpdn.gov.my/" /><SourceRow text="Digital Signature Act 1997 - digital-signature basis." href="https://www.mcmc.gov.my/" /><h3>Regulatory guidance</h3><SourceRow text="Consumer Guide: Five Key Highlights of the Hire-Purchase (Amendment) Act 2026 - KPDN with Bank Negara Malaysia, 2026." href="https://www.kpdn.gov.my/" /><SourceRow text="Reference Rate Framework - Bank Negara Malaysia." href="https://www.bnm.gov.my/" /><SourceRow text="Overnight Policy Rate announcements - Bank Negara Malaysia." href="https://www.bnm.gov.my/" /><h3>Consumer protection & redress</h3><SourceRow text="KPDN e-Complaint portal: eaduan.kpdn.gov.my · 1-800-886-800 · e-aduan@kpdn.gov.my" href="https://eaduan.kpdn.gov.my/" /><SourceRow text="Financial Markets Ombudsman Service (FMOS) - for providers regulated by BNM." href="https://www.fmos.org.my/" /><SourceRow text="BNMLINK / BNMTELELINK - Bank Negara Malaysia customer contact centre." href="https://www.bnm.gov.my/" /><h3>Methodology note</h3><p className="hp-source-note">Monthly instalments under EIR mode use the standard reducing-balance annuity formula. Flat-rate figures are converted to an equivalent EIR by numerical solving. Rule-of-78 rebates use total term charges × k(k+1) / n(n+1). The worked examples are validated against the supplied KPDN/BNM consumer guide.</p><p className="hp-error-link"><a href="https://www.kpdn.gov.my/" target="_blank" rel="noopener noreferrer">Spot an error? Tell us <ExternalLink size={13} /></a></p><small className="visually-hidden">{language} {generatedDate}</small></section>;
}

function SourceRow({ text, href }: { text: string; href: string }) {
  return <a className="source-row" href={href} target="_blank" rel="noopener noreferrer"><span>{text}</span><ExternalLink size={14} /></a>;
}

function calculateCarLoanForm(form: FormState): CarLoanCalculation {
  const validation = validateCarLoanForm(form);
  if (validation.errors.length > 0) throw new Error(validation.errors[0]);
  const vehiclePriceSen = toSen(numberValue(form.vehiclePrice));
  const downPaymentPercentInput = numberValue(form.downPaymentPercent);
  const downPaymentSen = form.downPaymentMode === 'amount'
    ? toSen(numberValue(form.downPaymentAmount))
    : toSen(vehiclePriceSen * downPaymentPercentInput / 100);
  const downPaymentPercent = vehiclePriceSen > 0 ? downPaymentSen / vehiclePriceSen * 100 : 0;
  const principalSen = vehiclePriceSen - downPaymentSen;
  const tenureYears = selectedTenureYears(form);
  const tenureMonths = tenureYears * 12;
  const rateType = form.rateType === 'variable' ? 'variable' : 'fixed';
  const rateMode = form.rateMode === 'flat' ? 'flat' : 'eir';
  const flatRatePercent = rateMode === 'flat' ? numberValue(form.flatRatePercent ?? form.annualFlatRatePercent) : eirToFlat(variableOrEnteredEIR(form), tenureMonths);
  const effectiveEIRPercent = rateMode === 'flat' ? flatToEIR(flatRatePercent, tenureMonths) : variableOrEnteredEIR(form);
  const eirPercent = rateMode === 'eir' ? effectiveEIRPercent : effectiveEIRPercent;
  const statutoryCapPercent = statutoryCapFor(rateType, tenureMonths);
  const schedule = buildAmortisationSchedule(principalSen, effectiveEIRPercent, tenureMonths);
  const newExactTotalInterestSen = schedule.reduce((sum, row) => sum + row.interestSen, 0);
  const publishedQuote = publishedGuideQuoteFromEIR(principalSen, effectiveEIRPercent, tenureMonths);
  const newMonthlySen = rateMode === 'flat' ? monthlyFromFlat(principalSen, flatRatePercent, tenureMonths) : publishedQuote.monthlySen;
  const newTotalInterestSen = rateMode === 'flat' ? roundMoney(principalSen * flatRatePercent / 100 * tenureMonths / 12) : publishedQuote.totalInterestSen;
  const legacyTotalInterestSen = roundMoney(principalSen * flatRatePercent / 100 * tenureMonths / 12);
  const legacyMonthlySen = monthlyFromFlat(principalSen, flatRatePercent, tenureMonths);
  const legacyTotalRepaymentSen = principalSen + legacyTotalInterestSen;
  const agreementTiming = form.agreementTiming === 'before' ? 'before' : 'after';
  const readiness = form.providerReadiness === 'early' ? 'early' : form.providerReadiness === 'not-yet' ? 'not-yet' : 'not-sure';
  const transition: AgreementTiming | ProviderReadiness = agreementTiming === 'before' ? 'before' : readiness;
  const selectedMonthlySen = transition === 'before' ? legacyMonthlySen : newMonthlySen;
  const selectedTotalInterestSen = transition === 'before' ? legacyTotalInterestSen : newTotalInterestSen;
  const selectedTotalRepaymentSen = principalSen + selectedTotalInterestSen;
  const upfrontCostsSen = totalCostOfOwnership({
    instalmentSen: selectedMonthlySen,
    upfrontCostsSen: toSen(numberValue(form.processingFee ?? form.upfrontFees)) + toSen(numberValue(form.firstYearInsurance)) + toSen(numberValue(form.roadTax)) + toSen(numberValue(form.registrationTransfer)) + toSen(numberValue(form.accessories)),
    annualInsuranceSen: toSen(numberValue(form.insuranceRenewal)),
    annualRoadTaxSen: toSen(numberValue(form.recurringRoadTax)),
    annualMaintenanceSen: toSen(numberValue(form.maintenance)),
    annualTyresSen: toSen(numberValue(form.tyres)),
    monthlyParkingTollFuelSen: toSen(numberValue(form.parkingTollFuel)),
  }).upfrontCostsSen;
  const tco = totalCostOfOwnership({
    instalmentSen: selectedMonthlySen,
    upfrontCostsSen,
    annualInsuranceSen: toSen(numberValue(form.insuranceRenewal)),
    annualRoadTaxSen: toSen(numberValue(form.recurringRoadTax)),
    annualMaintenanceSen: toSen(numberValue(form.maintenance)),
    annualTyresSen: toSen(numberValue(form.tyres)),
    monthlyParkingTollFuelSen: toSen(numberValue(form.parkingTollFuel)),
  });
  const settlementMonth = clampWhole(form.settleAfterMonths ?? '12', 0, tenureMonths);
  const settlement = calculateSettlement({ principalSen, tenureMonths, effectiveEIRPercent, flatRatePercent, schedule, newTotalInterestSen, legacyTotalInterestSen }, settlementMonth);
  const stressRows = STRESS_DELTAS.map((delta) => {
    const stressEIR = Math.max(0, variableOrEnteredEIR(form) + delta);
    const stressSchedule = buildAmortisationSchedule(principalSen, stressEIR, tenureMonths);
    const stressInterest = stressSchedule.reduce((sum, row) => sum + row.interestSen, 0);
    const guide = publishedGuideQuoteFromEIR(principalSen, stressEIR, tenureMonths);
    return { delta, eirPercent: stressEIR, monthlySen: guide.monthlySen, totalInterestSen: roundMoney(stressInterest), overCap: stressEIR > statutoryCapPercent };
  });
  return { vehiclePriceSen, downPaymentSen, downPaymentPercent, principalSen, tenureMonths, tenureYears, rateMode, rateType, flatRatePercent, eirPercent, effectiveEIRPercent, statutoryCapPercent, schedule, newMonthlySen, newTotalInterestSen, newExactTotalInterestSen, legacyMonthlySen, legacyTotalInterestSen, legacyTotalRepaymentSen, selectedMonthlySen, selectedTotalInterestSen, selectedTotalRepaymentSen, upfrontCostsSen: tco.upfrontCostsSen, trueMonthlyCostSen: tco.trueMonthlyCostSen, transition, settlement, stressRows, validation };
}

function calculateSettlement(input: { principalSen: number; tenureMonths: number; effectiveEIRPercent: number; flatRatePercent: number; schedule: AmortisationRow[]; newTotalInterestSen: number; legacyTotalInterestSen: number }, month: number): SettlementComparison {
  const remainingMonths = input.tenureMonths - month;
  const newBalanceSen = outstandingBalanceReducing(input.principalSen, input.effectiveEIRPercent, input.tenureMonths, month);
  const paidInterestSen = input.schedule.slice(0, month).reduce((sum, row) => sum + row.interestSen, 0);
  const newInterestSavedSen = Math.max(0, input.newTotalInterestSen - paidInterestSen);
  const legacyMonthlySen = monthlyFromFlat(input.principalSen, input.flatRatePercent, input.tenureMonths);
  const grossLegacyBalanceSen = Math.max(0, input.principalSen + input.legacyTotalInterestSen - legacyMonthlySen * month);
  const oldRebateSen = ruleOf78Rebate(input.legacyTotalInterestSen, remainingMonths, input.tenureMonths);
  const oldBalanceSen = Math.max(0, grossLegacyBalanceSen - oldRebateSen);
  return { month, newBalanceSen, newInterestSavedSen, oldBalanceSen, oldRebateSen, deltaSen: oldBalanceSen - newBalanceSen };
}

function validateCarLoanForm(form: FormState): ValidationState {
  const errors: string[] = [];
  const warnings: string[] = [];
  const vehiclePrice = numberValue(form.vehiclePrice);
  const downPayment = form.downPaymentMode === 'amount' ? (vehiclePrice > 0 ? numberValue(form.downPaymentAmount) / vehiclePrice * 100 : 0) : numberValue(form.downPaymentPercent);
  const tenureYears = selectedTenureYears(form);
  const tenureMonths = tenureYears * 12;
  if (!Number.isFinite(vehiclePrice) || vehiclePrice <= 0) errors.push('Vehicle price must be above RM0.');
  if (!Number.isFinite(downPayment) || downPayment < 0 || downPayment > 90) errors.push('Down payment must be between 0% and 90% of the vehicle price.');
  if (downPayment < 10) warnings.push('Hire-purchase financing typically requires at least a 10% down payment.');
  if (!Number.isInteger(tenureYears) || tenureYears < 1 || tenureYears > 9 || tenureMonths < 12 || tenureMonths > 108) errors.push('Tenure must be between 1 and 9 years (12 to 108 months).');
  const rateType = form.rateType === 'variable' ? 'variable' : 'fixed';
  const eir = form.rateMode === 'flat' ? safeFlatToEIR(numberValue(form.flatRatePercent ?? form.annualFlatRatePercent), tenureMonths) : variableOrEnteredEIR(form);
  if (!Number.isFinite(eir) || eir < 0) errors.push('EIR must be between 0% and 17% p.a.');
  if (Number.isFinite(eir) && Number.isInteger(tenureYears) && tenureMonths > 0) {
    const cap = statutoryCapFor(rateType, tenureMonths);
    if (eir > cap) errors.push(statutoryCapMessage(eir, cap, rateType, tenureYears));
    else if (eir > 17) errors.push('EIR must be between 0% and 17% p.a.');
  }
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

function statutoryCapMessage(eir: number, cap: number, rateType: 'fixed' | 'variable', tenureYears: number): string {
  return `Exceeds the statutory maximum of ${formatPercent(cap)} p.a. for ${rateType} rate financing with a ${tenureYears}-year tenure under the revised Hire-Purchase (Term Charges) Regulations.`;
}

function transitionMessage(form: FormState): string {
  if (form.agreementTiming === 'before') return `Agreements signed before ${legislationEffectiveDate} continue under the original Hire-Purchase Act 1967 terms.`;
  if (form.providerReadiness === 'not-yet' || form.providerReadiness === 'not-sure') return `Providers have until ${providerGracePeriodEnd} to switch. Ask yours whether it has moved to reducing balance.`;
  return 'Your provider has indicated that it is ready to use reducing balance and EIR.';
}

function transitionSummary(form: FormState): string {
  if (form.agreementTiming === 'before') return 'Before effective date';
  return form.providerReadiness === 'early' ? 'Early adopter' : 'Readiness to confirm';
}

function variableEIR(form: FormState): string {
  return (numberValue(form.referenceRate) + numberValue(form.spread)).toFixed(2);
}

function variableOrEnteredEIR(form: FormState): number {
  return form.rateType === 'variable' ? numberValue(form.referenceRate) + numberValue(form.spread) : numberValue(form.eirPercent);
}

function selectedTenureYears(form: FormState): number {
  return form.tenureYears === 'custom' ? numberValue(form.customTenureYears) : numberValue(form.tenureYears);
}

function tenureLabel(form: FormState): string {
  const years = selectedTenureYears(form);
  return Number.isFinite(years) && years > 0 ? `${years}y` : 'tenure';
}

function safeFlatToEIR(flat: number, months: number): number {
  try { return flatToEIR(flat, months); } catch { return Number.NaN; }
}

function numberValue(value: string | undefined): number {
  const parsed = Number((value ?? '').replaceAll(',', '').replaceAll('RM', '').replaceAll('%', '').trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toSen(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 100)) : 0;
}

function roundMoney(value: number): number {
  return Math.max(0, Math.round(value));
}

function formatSen(valueSen: number): string {
  return formatMyr(valueSen / 100);
}

function stressLabel(delta: number): string {
  if (delta === 0) return 'Base';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`;
}

function clampWhole(value: string | number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function MoneyInput({ label, value, onChange, prefix = 'RM', suffix, fullWidth = false }: { label: string; value: string; onChange: (value: string) => void; prefix?: string; suffix?: string; fullWidth?: boolean }) {
  return <label className={fullWidth ? 'field-wrap is-full' : 'field-wrap'}><span className="field-label">{label}</span><span className="input-shell"><span>{prefix}</span><input type="number" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />{suffix && <span>{suffix}</span>}</span></label>;
}

function NumberInput({ label, value, onChange, suffix, min, max, step, readOnly = false, fullWidth = false }: { label: string; value: string; onChange?: (value: string) => void; suffix?: string; min?: string; max?: string; step?: string; readOnly?: boolean; fullWidth?: boolean }) {
  return <label className={fullWidth ? 'field-wrap is-full' : 'field-wrap'}><span className="field-label">{label}</span><span className="input-shell"><input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} readOnly={readOnly} aria-readonly={readOnly || undefined} onChange={(event) => onChange?.(event.target.value)} />{suffix && <span>{suffix}</span>}</span></label>;
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="field-wrap"><span className="field-label">{label}</span><span className="input-shell"><input type="text" value={value} onChange={(event) => onChange(event.target.value)} /></span></label>;
}

function defaultOffers(): ProviderOffer[] {
  return [
    { id: 1, provider: '', basis: 'eir', rate: '5.00', tenureMonths: '84' },
  ];
}

function guideOffers(): ProviderOffer[] {
  return [
    { id: 1, provider: 'Bank A', basis: 'flat', rate: '3.00', tenureMonths: '108', preset: true, monthlyOverrideSen: 117_593, interestOverrideSen: 2_700_000 },
    { id: 2, provider: 'Bank B', basis: 'eir', rate: '5.50', tenureMonths: '108', preset: true, monthlyOverrideSen: 117_593, interestOverrideSen: 2_700_000 },
    { id: 3, provider: 'Bank C', basis: 'eir', rate: '5.00', tenureMonths: '108', preset: true, monthlyOverrideSen: 115_176, interestOverrideSen: 2_439_000 },
  ];
}

function updateOffer(offers: ProviderOffer[], setOffers: (offers: ProviderOffer[]) => void, id: number, patch: Partial<ProviderOffer>) {
  setOffers(offers.map((offer) => offer.id === id ? { ...offer, ...patch } : offer));
}

function providerQuote(offer: ProviderOffer, principalSen: number): { id: number; eirPercent: number; monthlySen: number; totalInterestSen: number } | null {
  const rate = numberValue(offer.rate);
  const tenureMonths = clampWhole(offer.tenureMonths, 12, 108);
  if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(tenureMonths)) return null;
  const eirPercent = offer.basis === 'flat' ? safeFlatToEIR(rate, tenureMonths) : rate;
  if (!Number.isFinite(eirPercent)) return null;
  if (offer.preset && offer.monthlyOverrideSen !== undefined && offer.interestOverrideSen !== undefined) return { id: offer.id, eirPercent, monthlySen: offer.monthlyOverrideSen, totalInterestSen: offer.interestOverrideSen };
  if (offer.basis === 'flat') return { id: offer.id, eirPercent, monthlySen: monthlyFromFlat(principalSen, rate, tenureMonths), totalInterestSen: roundMoney(principalSen * rate / 100 * tenureMonths / 12) };
  const quote = publishedGuideQuoteFromEIR(principalSen, rate, tenureMonths);
  return { id: offer.id, eirPercent, monthlySen: quote.monthlySen, totalInterestSen: quote.totalInterestSen };
}

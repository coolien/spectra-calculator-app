'use client';

import {
  Banknote,
  Calculator,
  Car,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe2,
  GraduationCap,
  Home,
  Landmark,
  PieChart,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  type CalculatorKey,
  type CalculatorResult,
  type FaraidResult,
  calculateCarLoan,
  calculateCreditCard,
  calculateFaraid,
  calculateHomeLoan,
  calculatePersonalLoan,
  calculatePtptn,
  formatMyr,
  formatPercent,
  parseNumber,
} from '@/lib/calculators';
import { type Language, languageOptions, t } from '@/lib/i18n';

type FormState = Record<string, string>;

const calculatorOrder: CalculatorKey[] = [
  'home',
  'car',
  'personal',
  'credit',
  'ptptn',
  'faraid',
];

const defaults: Record<CalculatorKey, FormState> = {
  home: {
    propertyPrice: '500000',
    downPaymentPercent: '10',
    annualRatePercent: '4.00',
    tenureYears: '35',
    monthlyIncome: '8000',
    existingCommitments: '500',
    targetDsrPercent: '40',
  },
  car: {
    vehiclePrice: '90000',
    downPaymentPercent: '10',
    annualFlatRatePercent: '3.00',
    tenureYears: '7',
    upfrontFees: '0',
  },
  personal: {
    principal: '20000',
    annualRatePercent: '8.00',
    tenureYears: '5',
    upfrontFees: '0',
    stampDutyRatePercent: '0.50',
    method: 'reducing',
  },
  credit: {
    outstandingBalance: '5000',
    annualFinanceChargePercent: '18.00',
    monthlyPayment: '500',
    monthlyNewSpending: '0',
    minimumPaymentPercent: '5',
    minimumPaymentFloor: '50',
  },
  ptptn: {
    outstandingBalance: '30000',
    annualUjrahRatePercent: '1.00',
    tenureYears: '10',
    extraMonthlyPayment: '0',
    method: 'reducing',
  },
  faraid: {
    grossEstate: '500000',
    debtsAndExpenses: '0',
    wasiyyah: '0',
    deceasedGender: 'male',
    wives: '1',
    hasHusband: 'false',
    sons: '1',
    daughters: '1',
    hasFather: 'true',
    hasMother: 'true',
  },
};

const icons: Record<CalculatorKey, ReactNode> = {
  home: <Home size={22} />,
  car: <Car size={22} />,
  personal: <Banknote size={22} />,
  credit: <CreditCard size={22} />,
  ptptn: <GraduationCap size={22} />,
  faraid: <UsersRound size={22} />,
};

const accents: Record<CalculatorKey, string> = {
  home: '#35C79A',
  car: '#4C82F7',
  personal: '#9B68F5',
  credit: '#F05D6C',
  ptptn: '#D8901F',
  faraid: '#0E7C66',
};

export function SpectraApp() {
  const [language, setLanguage] = useState<Language>('en');
  const [active, setActive] = useState<CalculatorKey>('home');
  const [forms, setForms] = useState<Record<CalculatorKey, FormState>>(defaults);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('spectra_language');
    if (isLanguage(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    const savedForms = window.localStorage.getItem('spectra_forms');
    if (savedForms) {
      try {
        const parsed = JSON.parse(savedForms) as Partial<Record<CalculatorKey, FormState>>;
        setForms({ ...defaults, ...parsed });
      } catch {
        setForms(defaults);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('spectra_language', language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem('spectra_forms', JSON.stringify(forms));
  }, [forms]);

  const activeForm = forms[active];
  const activeMeta = getCalculatorMeta(language, active);
  const result = useMemo(() => {
    try {
      return calculateActive(active, activeForm);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Check the input values.',
      };
    }
  }, [active, activeForm]);

  function updateField(key: string, value: string) {
    setForms((current) => ({
      ...current,
      [active]: {
        ...current[active],
        [key]: value,
      },
    }));
  }

  function updateLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
  }

  function focusResult() {
    document
      .querySelector<HTMLElement>('.result-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-row">
            <img src="/icons/Icon-192.png" alt="" className="brand-mark" />
            <div>
              <p className="eyebrow">Spectra</p>
              <h1>{t(language, 'loanPlanner')}</h1>
            </div>
          </div>
          <p className="intro">{t(language, 'intro')}</p>
        </div>
        <div className="language-switch" aria-label={t(language, 'language')}>
          <Globe2 size={18} />
          {languageOptions.map((option) => (
            <button
              key={option.code}
              className={option.code === language ? 'is-selected' : ''}
              type="button"
              onClick={() => updateLanguage(option.code)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <section className="workspace" aria-label={t(language, 'workspace')}>
        <div className="workspace-item">
          <div className="icon-box">
            <UserRound size={20} />
          </div>
          <div>
            <h2>{t(language, 'profile')}</h2>
            <p>{t(language, 'profileBody')}</p>
          </div>
        </div>
        <button
          className={profileSaved ? 'status-button is-done' : 'status-button'}
          type="button"
          onClick={() => setProfileSaved((current) => !current)}
        >
          <ShieldCheck size={18} />
          {profileSaved ? 'Saved locally' : 'Local profile'}
        </button>
      </section>

      <div className="main-grid">
        <aside className="module-list" aria-label={t(language, 'calculators')}>
          <h2>{t(language, 'calculators')}</h2>
          {calculatorOrder.map((key) => {
            const meta = getCalculatorMeta(language, key);
            return (
              <button
                key={key}
                type="button"
                className={key === active ? 'module-card is-active' : 'module-card'}
                style={{ '--accent': accents[key] } as CSSProperties}
                onClick={() => setActive(key)}
              >
                <span className="module-icon">{icons[key]}</span>
                <span className="module-copy">
                  <span className="module-title-row">
                    <strong>{meta.title}</strong>
                    <em>{t(language, 'official')}</em>
                  </span>
                  <span>{meta.description}</span>
                </span>
                <ChevronRight size={18} />
              </button>
            );
          })}
        </aside>

        <section className="calculator-panel">
          <div className="panel-heading">
            <div className="large-icon" style={{ color: accents[active] }}>
              {icons[active]}
            </div>
            <div>
              <p className="eyebrow">{t(language, 'official')}</p>
              <h2>{activeMeta.title}</h2>
              <p>{activeMeta.description}</p>
            </div>
          </div>

          <CalculatorForm
            active={active}
            form={activeForm}
            updateField={updateField}
          />

          <button className="calculate-button" type="button" onClick={focusResult}>
            <Calculator size={18} />
            {t(language, 'calculate')}
          </button>
        </section>

        <section className="result-panel" aria-label={t(language, 'result')}>
          {'error' in result ? (
            <div className="error-box">{result.error}</div>
          ) : (
            <ResultView
              language={language}
              result={result}
              accent={accents[active]}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function CalculatorForm({
  active,
  form,
  updateField,
}: {
  active: CalculatorKey;
  form: FormState;
  updateField: (key: string, value: string) => void;
}) {
  switch (active) {
    case 'home':
      return (
        <div className="form-grid">
          <Field label="Property price" prefix="RM" value={form.propertyPrice} onChange={(value) => updateField('propertyPrice', value)} />
          <Field label="Down payment" suffix="%" value={form.downPaymentPercent} onChange={(value) => updateField('downPaymentPercent', value)} />
          <Field label="Interest / profit rate" suffix="% p.a." value={form.annualRatePercent} onChange={(value) => updateField('annualRatePercent', value)} />
          <Field label="Tenure" suffix="years" value={form.tenureYears} onChange={(value) => updateField('tenureYears', value)} />
          <Field label="Monthly gross income" prefix="RM" value={form.monthlyIncome} onChange={(value) => updateField('monthlyIncome', value)} />
          <Field label="Existing commitments" prefix="RM" value={form.existingCommitments} onChange={(value) => updateField('existingCommitments', value)} />
          <Field label="Target DSR" suffix="%" value={form.targetDsrPercent} onChange={(value) => updateField('targetDsrPercent', value)} />
        </div>
      );
    case 'car':
      return (
        <div className="form-grid">
          <Field label="Vehicle price" prefix="RM" value={form.vehiclePrice} onChange={(value) => updateField('vehiclePrice', value)} />
          <Field label="Down payment" suffix="%" value={form.downPaymentPercent} onChange={(value) => updateField('downPaymentPercent', value)} />
          <Field label="Flat interest rate" suffix="% p.a." value={form.annualFlatRatePercent} onChange={(value) => updateField('annualFlatRatePercent', value)} />
          <Field label="Tenure" suffix="years" value={form.tenureYears} onChange={(value) => updateField('tenureYears', value)} />
          <Field label="Upfront fee buffer" prefix="RM" value={form.upfrontFees} onChange={(value) => updateField('upfrontFees', value)} />
        </div>
      );
    case 'personal':
      return (
        <div className="form-grid">
          <Field label="Loan amount" prefix="RM" value={form.principal} onChange={(value) => updateField('principal', value)} />
          <Field label="Interest rate" suffix="% p.a." value={form.annualRatePercent} onChange={(value) => updateField('annualRatePercent', value)} />
          <Field label="Tenure" suffix="years" value={form.tenureYears} onChange={(value) => updateField('tenureYears', value)} />
          <Field label="Upfront fees" prefix="RM" value={form.upfrontFees} onChange={(value) => updateField('upfrontFees', value)} />
          <Field label="Stamp duty rate" suffix="%" value={form.stampDutyRatePercent} onChange={(value) => updateField('stampDutyRatePercent', value)} />
          <Segmented
            label="Method"
            value={form.method}
            options={[
              { value: 'reducing', label: 'Reducing' },
              { value: 'flat', label: 'Flat' },
            ]}
            onChange={(value) => updateField('method', value)}
          />
        </div>
      );
    case 'credit':
      return (
        <div className="form-grid">
          <Field label="Outstanding balance" prefix="RM" value={form.outstandingBalance} onChange={(value) => updateField('outstandingBalance', value)} />
          <Field label="Finance charge" suffix="% p.a." value={form.annualFinanceChargePercent} onChange={(value) => updateField('annualFinanceChargePercent', value)} />
          <Field label="Monthly payment" prefix="RM" value={form.monthlyPayment} onChange={(value) => updateField('monthlyPayment', value)} />
          <Field label="Monthly new spending" prefix="RM" value={form.monthlyNewSpending} onChange={(value) => updateField('monthlyNewSpending', value)} />
          <Field label="Minimum payment" suffix="%" value={form.minimumPaymentPercent} onChange={(value) => updateField('minimumPaymentPercent', value)} />
          <Field label="Minimum floor" prefix="RM" value={form.minimumPaymentFloor} onChange={(value) => updateField('minimumPaymentFloor', value)} />
        </div>
      );
    case 'ptptn':
      return (
        <div className="form-grid">
          <Field label="Outstanding balance" prefix="RM" value={form.outstandingBalance} onChange={(value) => updateField('outstandingBalance', value)} />
          <Field label="Ujrah / service charge" suffix="% p.a." value={form.annualUjrahRatePercent} onChange={(value) => updateField('annualUjrahRatePercent', value)} />
          <Field label="Tenure" suffix="years" value={form.tenureYears} onChange={(value) => updateField('tenureYears', value)} />
          <Field label="Extra monthly payment" prefix="RM" value={form.extraMonthlyPayment} onChange={(value) => updateField('extraMonthlyPayment', value)} />
          <Segmented
            label="Method"
            value={form.method}
            options={[
              { value: 'reducing', label: 'Reducing' },
              { value: 'flat', label: 'Flat' },
            ]}
            onChange={(value) => updateField('method', value)}
          />
        </div>
      );
    case 'faraid':
      return (
        <div className="form-grid">
          <Field label="Gross estate" prefix="RM" value={form.grossEstate} onChange={(value) => updateField('grossEstate', value)} />
          <Field label="Debts, funeral and admin costs" prefix="RM" value={form.debtsAndExpenses} onChange={(value) => updateField('debtsAndExpenses', value)} />
          <Field label="Wasiyyah amount" prefix="RM" value={form.wasiyyah} onChange={(value) => updateField('wasiyyah', value)} />
          <Segmented
            label="Deceased"
            value={form.deceasedGender}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            onChange={(value) => updateField('deceasedGender', value)}
          />
          {form.deceasedGender === 'male' ? (
            <Field label="Wife/wives survived" value={form.wives} onChange={(value) => updateField('wives', value)} />
          ) : (
            <Toggle label="Husband survived" value={form.hasHusband === 'true'} onChange={(value) => updateField('hasHusband', String(value))} />
          )}
          <Field label="Sons" value={form.sons} onChange={(value) => updateField('sons', value)} />
          <Field label="Daughters" value={form.daughters} onChange={(value) => updateField('daughters', value)} />
          <Toggle label="Father survived" value={form.hasFather === 'true'} onChange={(value) => updateField('hasFather', String(value))} />
          <Toggle label="Mother survived" value={form.hasMother === 'true'} onChange={(value) => updateField('hasMother', String(value))} />
        </div>
      );
  }
}

function ResultView({
  language,
  result,
  accent,
}: {
  language: Language;
  result: CalculatorResult | FaraidResult;
  accent: string;
}) {
  return (
    <>
      <div className="result-hero" style={{ '--accent': accent } as CSSProperties}>
        <p>{t(language, 'result')}</p>
        <h2>{result.primaryValue}</h2>
        <strong>{result.title}</strong>
        <span>{result.subtitle}</span>
      </div>

      <div className="metric-grid">
        {result.metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      {result.rows && (
        <section className="detail-list">
          <h3>{t(language, 'details')}</h3>
          {result.rows.map((row) => (
            <div className="detail-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </section>
      )}

      {'shares' in result && (
        <section className="share-list">
          <h3>Estimated faraid shares</h3>
          {result.shares.map((share) => (
            <div className="share-row" key={share.heir}>
              <div>
                <strong>{share.count > 1 ? `${share.heir} (${share.count})` : share.heir}</strong>
                <p>{share.rule}</p>
              </div>
              <div>
                <strong>{formatPercent(share.sharePercent)}</strong>
                <span>{formatMyr(share.amount)}</span>
                {share.count > 1 && <small>Each {formatMyr(share.amount / share.count)}</small>}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="notes">
        <h3>{t(language, 'notes')}</h3>
        {result.notes.map((note) => (
          <p key={note}>
            <CheckCircle2 size={16} />
            {note}
          </p>
        ))}
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div>
        {prefix && <em>{prefix}</em>}
        <input
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="field segmented-field">
      <span>{label}</span>
      <div className="segmented">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={option.value === value ? 'is-selected' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button className="toggle-row" type="button" onClick={() => onChange(!value)}>
      <span>{label}</span>
      <span className={value ? 'toggle is-on' : 'toggle'} aria-hidden="true" />
    </button>
  );
}

function calculateActive(active: CalculatorKey, form: FormState) {
  switch (active) {
    case 'home':
      return calculateHomeLoan({
        propertyPrice: parseNumber(form.propertyPrice),
        downPaymentPercent: parseNumber(form.downPaymentPercent),
        annualRatePercent: parseNumber(form.annualRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        monthlyIncome: parseNumber(form.monthlyIncome),
        existingCommitments: parseNumber(form.existingCommitments),
        targetDsrPercent: parseNumber(form.targetDsrPercent),
      });
    case 'car':
      return calculateCarLoan({
        vehiclePrice: parseNumber(form.vehiclePrice),
        downPaymentPercent: parseNumber(form.downPaymentPercent),
        annualFlatRatePercent: parseNumber(form.annualFlatRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        upfrontFees: parseNumber(form.upfrontFees),
      });
    case 'personal':
      return calculatePersonalLoan({
        principal: parseNumber(form.principal),
        annualRatePercent: parseNumber(form.annualRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        upfrontFees: parseNumber(form.upfrontFees),
        stampDutyRatePercent: parseNumber(form.stampDutyRatePercent),
        method: form.method === 'flat' ? 'flat' : 'reducing',
      });
    case 'credit':
      return calculateCreditCard({
        outstandingBalance: parseNumber(form.outstandingBalance),
        annualFinanceChargePercent: parseNumber(form.annualFinanceChargePercent),
        monthlyPayment: parseNumber(form.monthlyPayment),
        monthlyNewSpending: parseNumber(form.monthlyNewSpending),
        minimumPaymentPercent: parseNumber(form.minimumPaymentPercent),
        minimumPaymentFloor: parseNumber(form.minimumPaymentFloor),
      });
    case 'ptptn':
      return calculatePtptn({
        outstandingBalance: parseNumber(form.outstandingBalance),
        annualUjrahRatePercent: parseNumber(form.annualUjrahRatePercent),
        tenureYears: parseNumber(form.tenureYears),
        extraMonthlyPayment: parseNumber(form.extraMonthlyPayment),
        method: form.method === 'flat' ? 'flat' : 'reducing',
      });
    case 'faraid':
      return calculateFaraid({
        grossEstate: parseNumber(form.grossEstate),
        debtsAndExpenses: parseNumber(form.debtsAndExpenses),
        wasiyyah: parseNumber(form.wasiyyah),
        deceasedGender: form.deceasedGender === 'female' ? 'female' : 'male',
        wives: parseNumber(form.wives),
        hasHusband: form.hasHusband === 'true',
        sons: parseNumber(form.sons),
        daughters: parseNumber(form.daughters),
        hasFather: form.hasFather === 'true',
        hasMother: form.hasMother === 'true',
      });
  }
}

function getCalculatorMeta(language: Language, key: CalculatorKey) {
  const meta = {
    home: { title: t(language, 'home'), description: t(language, 'homeDesc') },
    car: { title: t(language, 'car'), description: t(language, 'carDesc') },
    personal: { title: t(language, 'personal'), description: t(language, 'personalDesc') },
    credit: { title: t(language, 'credit'), description: t(language, 'creditDesc') },
    ptptn: { title: t(language, 'ptptn'), description: t(language, 'ptptnDesc') },
    faraid: { title: t(language, 'faraid'), description: t(language, 'faraidDesc') },
  };

  return meta[key];
}

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'bm' || value === 'zh' || value === 'ta';
}

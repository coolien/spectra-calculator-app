'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CreditCard, Landmark, Pencil, Plus, Trash2, WalletCards, X } from 'lucide-react';
import type { ActiveLoan, ActiveLoanType, SavedScenario } from '@/lib/app-model';
import { activeLoanProgress, formatLoanDuration, projectActiveLoan } from '@/lib/active-loans';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { ScreenHeading } from '@/components/ui/Controls';
import { formatRinggit } from '@/lib/profile-math';
import { useI18n } from '@/components/app-shell/I18nProvider';

const loanTypes: { value: ActiveLoanType; label: string }[] = [
  { value: 'home', label: 'Home loan' },
  { value: 'car', label: 'Car loan' },
  { value: 'personal', label: 'Personal loan' },
  { value: 'credit', label: 'Credit card' },
  { value: 'ptptn', label: 'PTPTN' },
  { value: 'other', label: 'Other financing' },
];

type LoanForm = {
  name: string;
  type: ActiveLoanType;
  remainingBalance: string;
  monthlyPayment: string;
  annualRatePercent: string;
  nextPaymentDate: string;
};

const emptyForm: LoanForm = {
  name: '', type: 'home', remainingBalance: '', monthlyPayment: '', annualRatePercent: '', nextPaymentDate: '',
};

export function ActiveLoansScreen({ loans, initialScenario, onSave, onDelete, onConsumeScenario }: {
  loans: ActiveLoan[];
  initialScenario: SavedScenario | null;
  onSave: (loan: ActiveLoan) => void;
  onDelete: (id: string) => void;
  onConsumeScenario: () => void;
}) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LoanForm>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialScenario?.comparison || initialScenario.calculator === 'faraid') return;
    setEditingId(null);
    setForm({
      ...emptyForm,
      name: initialScenario.label,
      type: initialScenario.calculator,
      monthlyPayment: initialScenario.comparison.monthlyPayment.toFixed(2),
    });
    setError('');
    setFormOpen(true);
    onConsumeScenario();
  }, [initialScenario, onConsumeScenario]);

  const totals = useMemo(() => loans.reduce((summary, loan) => {
    const projection = projectActiveLoan(loan);
    return {
      balance: summary.balance + loan.remainingBalance,
      monthly: summary.monthly + loan.monthlyPayment,
      interest: summary.interest + projection.totalFutureInterest,
    };
  }, { balance: 0, monthly: 0, interest: 0 }), [loans]);

  function openNewLoan() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setFormOpen(true);
  }

  function editLoan(loan: ActiveLoan) {
    setEditingId(loan.id);
    setForm({
      name: loan.name,
      type: loan.type,
      remainingBalance: String(loan.remainingBalance),
      monthlyPayment: String(loan.monthlyPayment),
      annualRatePercent: String(loan.annualRatePercent),
      nextPaymentDate: loan.nextPaymentDate,
    });
    setError('');
    setFormOpen(true);
  }

  function submitLoan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = new FormData(event.currentTarget);
    const remainingBalance = Number(form.remainingBalance);
    const monthlyPayment = Number(form.monthlyPayment);
    const annualRatePercent = Number(form.annualRatePercent || 0);
    if (!form.name.trim() || !Number.isFinite(remainingBalance) || remainingBalance <= 0 || !Number.isFinite(monthlyPayment) || monthlyPayment <= 0 || !Number.isFinite(annualRatePercent) || annualRatePercent < 0 || annualRatePercent > 100) {
      setError(t('Enter a name, positive balance and payment, plus a valid rate.'));
      return;
    }

    const existing = editingId ? loans.find((loan) => loan.id === editingId) : undefined;
    const now = new Date().toISOString();
    onSave({
      id: existing?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      type: form.type,
      remainingBalance,
      originalBalance: existing ? Math.max(existing.originalBalance, remainingBalance) : remainingBalance,
      monthlyPayment,
      annualRatePercent,
      nextPaymentDate: String(submitted.get('nextPaymentDate') ?? form.nextPaymentDate),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    setFormOpen(false);
    setEditingId(null);
  }

  return (
    <div className="standard-screen active-loans-screen">
      <ScreenHeading title="Active loans" subtitle="Keep real balances and monthly commitments in one place." />

      {loans.length > 0 && (
        <section className="loan-summary" aria-label={t('Active loan summary')}>
          <div><span>{t('Total outstanding')}</span><strong>{formatRinggit(totals.balance)}</strong></div>
          <div><span>{t('Monthly payments')}</span><strong>{formatRinggit(totals.monthly)}</strong></div>
          <div><span>{t('Projected interest')}</span><strong>{formatRinggit(totals.interest)}</strong></div>
        </section>
      )}

      <div className="section-title-row">
        <h2>{t('Your loans')}</h2>
        <button type="button" onClick={openNewLoan}><Plus size={15} /> {t('Add loan')}</button>
      </div>

      {formOpen && (
        <form className="loan-form" onSubmit={submitLoan}>
          <div className="loan-form-heading">
            <div><Landmark size={18} /><strong>{t(editingId ? 'Update loan' : 'Track a loan')}</strong></div>
            <button type="button" aria-label={t('Close loan form')} title={t('Close')} onClick={() => setFormOpen(false)}><X size={18} /></button>
          </div>
          <p>{t('Use the latest balance from your bank statement. Spectra estimates the payoff path from these figures.')}</p>
          <label className="simple-field"><span>{t('Loan name')}</span><input required value={form.name} placeholder={t('e.g. Maybank home loan')} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="simple-field"><span>{t('Loan type')}</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ActiveLoanType })}>{loanTypes.map((type) => <option value={type.value} key={type.value}>{t(type.label)}</option>)}</select></label>
          <div className="loan-form-grid">
            <label className="simple-field"><span>{t('Outstanding balance')}</span><div className="input-with-prefix"><span>RM</span><input required inputMode="decimal" type="number" min="0.01" step="0.01" value={form.remainingBalance} onChange={(event) => setForm({ ...form, remainingBalance: event.target.value })} /></div></label>
            <label className="simple-field"><span>{t('Monthly payment')}</span><div className="input-with-prefix"><span>RM</span><input required inputMode="decimal" type="number" min="0.01" step="0.01" value={form.monthlyPayment} onChange={(event) => setForm({ ...form, monthlyPayment: event.target.value })} /></div></label>
            <label className="simple-field"><span>{t('Annual rate')}</span><div className="input-with-suffix"><input inputMode="decimal" type="number" min="0" max="100" step="0.01" value={form.annualRatePercent} onChange={(event) => setForm({ ...form, annualRatePercent: event.target.value })} /><span>%</span></div></label>
            <label className="simple-field"><span>{t('Next payment')}</span><input name="nextPaymentDate" type="date" value={form.nextPaymentDate} onChange={(event) => setForm({ ...form, nextPaymentDate: event.target.value })} /></label>
          </div>
          {error && <p className="form-message is-error">{error}</p>}
          <button className="primary-action full" type="submit">{t(editingId ? 'Save changes' : 'Start tracking')}</button>
        </form>
      )}

      {loans.length === 0 && !formOpen ? (
        <div className="empty-state"><p>{t('No active loans yet.')}</p><span>{t('Add one manually or use the track button beside a saved loan scenario.')}</span></div>
      ) : (
        <div className="active-loan-list">
          {loans.map((loan) => <ActiveLoanCard loan={loan} key={loan.id} onEdit={() => editLoan(loan)} onDelete={() => onDelete(loan.id)} />)}
        </div>
      )}
      <p className="detail-footnote">{t('Projections are planning estimates. Your lender statement remains the source of truth.')}</p>
    </div>
  );
}

function ActiveLoanCard({ loan, onEdit, onDelete }: { loan: ActiveLoan; onEdit: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  const projection = projectActiveLoan(loan);
  const progress = activeLoanProgress(loan);
  return (
    <article className="active-loan-card">
      <div className="active-loan-heading">
        <span className={`calculator-icon icon-${loan.type}`}>{loan.type === 'other' ? <WalletCards size={19} /> : <CalculatorIcon calculator={loan.type} size={19} />}</span>
        <span><strong>{loan.name}</strong><small>{t(loanTypes.find((type) => type.value === loan.type)?.label ?? '')}</small></span>
        <button type="button" aria-label={t('Edit {name}', { name: loan.name })} title={t('Edit loan')} onClick={onEdit}><Pencil size={16} /></button>
        <button type="button" aria-label={t('Delete {name}', { name: loan.name })} title={t('Delete loan')} onClick={onDelete}><Trash2 size={16} /></button>
      </div>
      <div className="active-loan-balance"><span>{t('Outstanding')}</span><strong>{formatRinggit(loan.remainingBalance)}</strong></div>
      <div className="loan-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="active-loan-metrics">
        <div><span>{t('Monthly')}</span><strong>{formatRinggit(loan.monthlyPayment)}</strong></div>
        <div><span>{t('Payoff estimate')}</span><strong>{projection.isPaidOff ? t(formatLoanDuration(projection.monthsProjected)) : t('Over 50 yr')}</strong></div>
        <div><span>{t('Future interest')}</span><strong>{formatRinggit(projection.totalFutureInterest)}</strong></div>
      </div>
      {loan.nextPaymentDate && <div className="next-payment"><CalendarDays size={14} /><span>{t('Next payment {date}', { date: formatDate(loan.nextPaymentDate) })}</span></div>}
      {!projection.isPaidOff && <div className="loan-warning"><CreditCard size={14} />{t('Payment may not clear this balance within 50 years.')}</div>}
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

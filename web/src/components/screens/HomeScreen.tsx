import { ArrowRight, UserRound } from 'lucide-react';
import type { CalculatorKey } from '@/lib/calculators';
import type { PersonalProfile } from '@/lib/app-model';
import { calculatorOrder, calculatorSchemas } from '@/components/calculators/schemas';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { ScreenHeading } from '@/components/ui/Controls';
import { formatRinggit, profileMetrics } from '@/lib/profile-math';
import { useI18n } from '@/components/app-shell/I18nProvider';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { financialHealthScore, profileUpgradeSuggestions, type UserProfile } from '@/lib/finance/profile-engine';

export function HomeScreen({
  profile, lastCalculator, onOpenCalculator, onOpenProfile, onSeeAll,
}: {
  profile: PersonalProfile | null;
  lastCalculator: CalculatorKey;
  onOpenCalculator: (key: CalculatorKey) => void;
  onOpenProfile: () => void;
  onSeeAll: () => void;
}) {
  const { t } = useI18n();
  const metrics = profile ? profileMetrics(profile) : null;
  const health = profile ? financialHealthScore(toEngineProfile(profile)) : null;
  const topSuggestion = profile ? profileUpgradeSuggestions(toEngineProfile(profile))[0] : null;
  const last = calculatorSchemas[lastCalculator];
  return (
    <div className="standard-screen home-screen">
      <ScreenHeading title="Good evening" subtitle="Here's where your money stands today." />

      {!profile ? (
        <section className="profile-prompt">
          <span className="prompt-icon"><UserRound size={20} /></span>
          <div><h2>{t('Set up your profile')}</h2><p>{t('Two minutes unlocks take-home pay and affordability checks everywhere.')}</p></div>
          <button className="primary-small" type="button" onClick={onOpenProfile}>{t('Create profile')}</button>
        </section>
      ) : (
        <section className="snapshot-card">
          <span className="snapshot-label">{t('Monthly snapshot')}</span>
          <div className="snapshot-metrics">
            <div><span>{t('Take-home pay')}</span><strong>{formatRinggit(metrics!.takeHome)}</strong></div>
            <div><span>{t('DSR used')}</span><strong>{Math.round(metrics!.dsrUsed)}%</strong></div>
          </div>
          <div className="snapshot-progress"><span style={{ width: `${Math.min(metrics!.dsrUsed, 100)}%` }} /></div>
          <p>{t('Comfortable room for {amount} more before your {percent}% DSR target.', { amount: formatRinggit(metrics!.roomLeft), percent: profile.targetDsr })}</p>
        </section>
      )}

      {health && <section className="home-health-card"><div className="home-health-top"><div><span className="snapshot-label">Financial health</span><strong>{Math.round(health.overall)} / 100</strong><p>{health.band} · net DSR {Math.round(health.dsrNet)}%</p></div><button type="button" onClick={onOpenProfile}>Review profile</button></div><div className="home-health-bar"><span style={{ width: `${health.overall}%` }} /></div>{topSuggestion && <p className="home-health-suggestion"><strong>Next best move</strong>{topSuggestion.action}</p>}</section>}

      <section className="home-section">
        <h2>{t('Continue where you left off')}</h2>
        <button className="continue-card" type="button" onClick={() => onOpenCalculator(lastCalculator)}>
          <span className={`calculator-icon icon-${lastCalculator}`}><CalculatorIcon calculator={lastCalculator} /></span>
          <span><strong>{t(last.title)}</strong><small>{t(last.description)}</small></span>
          <ArrowRight size={18} />
        </button>
      </section>

      <section className="home-section">
        <div className="section-title-row"><h2>{t('Calculators')}</h2><button type="button" onClick={onSeeAll}>{t('See all')}</button></div>
        <div className="calculator-grid">
          {calculatorOrder.map((key) => (
            <button type="button" key={key} onClick={() => onOpenCalculator(key)}>
              <span className={`calculator-icon icon-${key}`}><CalculatorIcon calculator={key} size={24} /></span>
              <span>{t(calculatorSchemas[key].shortName)}</span>
            </button>
          ))}
        </div>
      </section>

      <AdSenseSlot />
    </div>
  );
}

function toEngineProfile(profile: PersonalProfile): UserProfile {
  const numeric = (value: string | undefined) => { const parsed = Number(String(value ?? '').replaceAll(',', '').replaceAll('RM', '').trim()); return Number.isFinite(parsed) ? parsed : 0; };
  return { age: numeric(profile.age), citizenship: profile.citizenship, financingPreference: profile.financingPreference, isMuslim: profile.isMuslim, ownsResidentialProperty: profile.ownsResidentialProperty, propertiesOwned: numeric(profile.propertiesOwned), grossMonthlySalary: numeric(profile.grossSalary), otherMonthlyIncome: numeric(profile.otherIncome), epfEmployeeRate: numeric(profile.epfRate), monthlyTax: numeric(profile.tax), existingMonthlyCommitments: numeric(profile.commitments), creditCardTotalLimit: numeric(profile.creditCardLimit), creditCardBalance: numeric(profile.creditCardBalance), emergencyFundMonths: numeric(profile.emergencyFundMonths), epfBalance: numeric(profile.epfBalance), monthlySavings: numeric(profile.monthlySavings), hasLifeOrTakaful: profile.hasLifeOrTakaful, hasMedicalCard: profile.hasMedicalCard, hasMortgageCover: profile.hasMortgageCover, ctosBand: profile.ctosBand, recentLatePayments12m: numeric(profile.recentLatePayments12m), targetDsrPercent: numeric(profile.targetDsr), savingsGoal: numeric(profile.savingsGoal) };
}

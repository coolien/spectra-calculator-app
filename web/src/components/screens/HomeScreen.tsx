import { ArrowRight, UserRound } from 'lucide-react';
import type { CalculatorKey } from '@/lib/calculators';
import type { PersonalProfile } from '@/lib/app-model';
import { calculatorOrder, calculatorSchemas } from '@/components/calculators/schemas';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { ScreenHeading } from '@/components/ui/Controls';
import { formatRinggit, profileMetrics } from '@/lib/profile-math';
import { useI18n } from '@/components/app-shell/I18nProvider';

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
    </div>
  );
}

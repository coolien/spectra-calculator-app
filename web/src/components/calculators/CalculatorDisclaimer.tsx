import { AlertTriangle } from 'lucide-react';
import { legislationEffectiveDate, providerGracePeriodEnd } from '@/lib/finance/hirePurchaseConfig';

export type CalculatorDisclaimerLevel = 'compact' | 'full' | 'pdf';

export function CalculatorDisclaimer({ level }: { level: CalculatorDisclaimerLevel }) {
  if (level === 'compact') {
    return (
      <aside className="calculator-disclaimer calculator-disclaimer-compact" aria-label="Calculator disclaimer">
        <AlertTriangle size={16} aria-hidden="true" />
        <p><strong>Planning estimate only.</strong> Your provider&apos;s official quotation and product disclosure sheet apply. Ask for the EIR and confirm all fees, insurance or takaful, and settlement terms before signing.</p>
      </aside>
    );
  }

  return (
    <section className={`calculator-disclaimer calculator-disclaimer-${level}`} aria-label="Important calculator information">
      <h2>{level === 'pdf' ? 'Disclaimer' : 'Important information'}</h2>
      <p>This calculator is an educational planning tool, not a quotation, offer of financing, legal advice, or financial advice. Figures are estimates based on the information entered and standard amortisation formulae.</p>
      <p>Actual instalments, EIR, variable-rate changes, fees, insurance or takaful, early-settlement amounts, rebates, and provider eligibility rules may differ. Always ask the hire-purchase provider for the EIR, product disclosure sheet, agreement terms, and the official settlement figure.</p>
      <p>For agreements signed before {legislationEffectiveDate}, the original contractual terms continue to apply unless you and the provider mutually agree otherwise. Providers may use the transition period through {providerGracePeriodEnd} while their systems are upgraded.</p>
    </section>
  );
}

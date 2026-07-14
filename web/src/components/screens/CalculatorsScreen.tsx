import { ChevronRight } from 'lucide-react';
import type { CalculatorKey } from '@/lib/calculators';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { calculatorOrder, calculatorSchemas } from '@/components/calculators/schemas';
import { ScreenHeading } from '@/components/ui/Controls';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function CalculatorsScreen({ onOpen }: { onOpen: (key: CalculatorKey) => void }) {
  const { t } = useI18n();
  return (
    <div className="standard-screen">
      <ScreenHeading title="Calculators" subtitle="Pick one - every result is an estimate you can save." />
      <div className="calculator-list">
        {calculatorOrder.map((key) => {
          const schema = calculatorSchemas[key];
          return (
            <button type="button" key={key} onClick={() => onOpen(key)}>
              <span className={`calculator-icon icon-${key}`}><CalculatorIcon calculator={key} /></span>
              <span><strong>{t(schema.title)}</strong><small>{t(schema.homeDescription)}</small></span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

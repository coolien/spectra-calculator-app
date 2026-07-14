import { ChevronRight } from 'lucide-react';
import type { CalculatorKey } from '@/lib/calculators';
import { CalculatorIcon } from '@/components/calculators/CalculatorIcon';
import { calculatorOrder, calculatorSchemas } from '@/components/calculators/schemas';
import { ScreenHeading } from '@/components/ui/Controls';

export function CalculatorsScreen({ onOpen }: { onOpen: (key: CalculatorKey) => void }) {
  return (
    <div className="standard-screen">
      <ScreenHeading title="Calculators" subtitle="Pick one — every result is an estimate you can save." />
      <div className="calculator-list">
        {calculatorOrder.map((key) => {
          const schema = calculatorSchemas[key];
          return (
            <button type="button" key={key} onClick={() => onOpen(key)}>
              <span className={`calculator-icon icon-${key}`}><CalculatorIcon calculator={key} /></span>
              <span><strong>{schema.title}</strong><small>{schema.homeDescription}</small></span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

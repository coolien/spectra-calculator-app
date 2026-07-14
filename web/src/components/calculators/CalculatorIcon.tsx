import { Banknote, Car, CreditCard, GraduationCap, Home, Scale } from 'lucide-react';
import type { CalculatorKey } from '@/lib/calculators';

const iconMap = {
  home: Home,
  car: Car,
  personal: Banknote,
  credit: CreditCard,
  ptptn: GraduationCap,
  faraid: Scale,
};

export function CalculatorIcon({ calculator, size = 22 }: { calculator: CalculatorKey; size?: number }) {
  const Icon = iconMap[calculator];
  return <Icon size={size} strokeWidth={2.1} />;
}

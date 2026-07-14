import { carLoanSchema } from '@/components/calculators/car-loan/schema';
import { creditCardSchema } from '@/components/calculators/credit-card/schema';
import { faraidSchema } from '@/components/calculators/faraid/schema';
import { homeLoanSchema } from '@/components/calculators/home-loan/schema';
import { personalLoanSchema } from '@/components/calculators/personal-loan/schema';
import { ptptnSchema } from '@/components/calculators/ptptn/schema';
import type { CalculatorKey } from '@/lib/calculators';

export const calculatorSchemas = {
  home: homeLoanSchema,
  car: carLoanSchema,
  personal: personalLoanSchema,
  credit: creditCardSchema,
  ptptn: ptptnSchema,
  faraid: faraidSchema,
};

export const calculatorOrder: CalculatorKey[] = ['home', 'car', 'personal', 'credit', 'ptptn', 'faraid'];

export const calculatorDefaults = Object.fromEntries(
  calculatorOrder.map((key) => [key, calculatorSchemas[key].defaults]),
) as Record<CalculatorKey, Record<string, string>>;

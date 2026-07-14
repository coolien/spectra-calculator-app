import type { CalculatorKey, CalculatorResult, ComparisonSnapshot, FaraidResult } from '@/lib/calculators';

export type TabKey = 'home' | 'calculators' | 'saved' | 'settings';

export type DetailKey =
  | CalculatorKey
  | 'profile'
  | 'add-salary-profile'
  | 'language'
  | 'account'
  | 'remove-ads'
  | 'app-icon'
  | 'legal';

export type FormState = Record<string, string>;

export type CalculatorOutcome = CalculatorResult | FaraidResult;

export type PersonalProfile = {
  grossSalary: string;
  epfRate: string;
  tax: string;
  livingExpenses: string;
  commitments: string;
  targetDsr: string;
};

export type SalaryProfile = {
  id: string;
  name: string;
  label: string;
  grossSalary: number;
  commitments: number;
  targetDsr: number;
  takeHome: number;
  maxInstallment: number;
};

export type SavedScenario = {
  id: string;
  calculator: CalculatorKey;
  label: string;
  result: string;
  secondary: string;
  savedAt: string;
  comparison?: ComparisonSnapshot;
};

export type FieldOption = {
  label: string;
  value: string;
};

export type CalculatorField = {
  key: string;
  label: string;
  type: 'number' | 'segmented' | 'toggle';
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  options?: FieldOption[];
  fullWidth?: boolean;
};

export type CalculatorStepSchema = {
  id: string;
  title: string;
  summary: (form: FormState) => string;
  optional?: boolean;
  description?: string;
  fields: CalculatorField[];
};

export type CalculatorSchema = {
  key: CalculatorKey;
  shortName: string;
  title: string;
  screenTitle: string;
  description: string;
  homeDescription: string;
  defaults: FormState;
  steps: CalculatorStepSchema[];
  disclaimer?: string;
  secondaryMetricIndex: number;
  secondaryLabel: string;
};

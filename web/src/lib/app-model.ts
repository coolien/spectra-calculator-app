import type { CalculatorKey, CalculatorResult, ComparisonSnapshot, FaraidResult } from '@/lib/calculators';

export type TabKey = 'home' | 'calculators' | 'learn' | 'saved' | 'settings';

export type DetailKey =
  | CalculatorKey
  | 'profile'
  | 'active-loans'
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
  age?: string;
  citizenship?: 'citizen' | 'pr' | 'foreign';
  financingPreference?: 'islamic' | 'conventional' | 'either';
  isMuslim?: boolean;
  ownsResidentialProperty?: boolean;
  propertiesOwned?: string;
  otherIncome?: string;
  creditCardLimit?: string;
  creditCardBalance?: string;
  emergencyFundMonths?: string;
  epfBalance?: string;
  monthlySavings?: string;
  savingsGoal?: string;
  hasLifeOrTakaful?: boolean;
  hasMedicalCard?: boolean;
  hasMortgageCover?: boolean;
  ctosBand?: 'excellent' | 'good' | 'fair' | 'needs-work';
  recentLatePayments12m?: string;
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

export type ActiveLoanType = Exclude<CalculatorKey, 'faraid'> | 'other';

export type ActiveLoan = {
  id: string;
  name: string;
  type: ActiveLoanType;
  monthlyPayment: number;
  remainingBalance: number;
  originalBalance: number;
  annualRatePercent: number;
  nextPaymentDate: string;
  createdAt: string;
  updatedAt: string;
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

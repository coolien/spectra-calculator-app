export type CalculatorKey =
  | 'home'
  | 'car'
  | 'personal'
  | 'credit'
  | 'ptptn'
  | 'faraid';

export type ResultMetric = {
  label: string;
  value: string;
};

export type ComparisonSnapshot = {
  monthlyPayment: number;
  totalRepayment: number;
  upfrontCash: number;
  durationMonths: number | null;
};

export type CalculatorResult = {
  title: string;
  primaryValue: string;
  subtitle: string;
  metrics: ResultMetric[];
  notes: string[];
  rows?: ResultMetric[];
  comparison?: ComparisonSnapshot;
};

export type HomeLoanInput = {
  propertyPrice: number;
  downPaymentPercent: number;
  annualRatePercent: number;
  tenureYears: number;
  monthlyIncome: number;
  existingCommitments: number;
  targetDsrPercent: number;
  extraMonthlyPayment: number;
  settlementYears: number;
};

export type CarLoanInput = {
  vehiclePrice: number;
  downPaymentPercent: number;
  annualFlatRatePercent: number;
  tenureYears: number;
  upfrontFees: number;
};

export type PersonalLoanInput = {
  principal: number;
  annualRatePercent: number;
  tenureYears: number;
  upfrontFees: number;
  stampDutyRatePercent: number;
  method: 'reducing' | 'flat';
};

export type CreditCardInput = {
  outstandingBalance: number;
  annualFinanceChargePercent: number;
  monthlyPayment: number;
  monthlyNewSpending: number;
  minimumPaymentPercent: number;
  minimumPaymentFloor: number;
};

export type PtptnInput = {
  outstandingBalance: number;
  annualUjrahRatePercent: number;
  tenureYears: number;
  extraMonthlyPayment: number;
  method: 'reducing' | 'flat';
};

export type FaraidInput = {
  grossEstate: number;
  debtsAndExpenses: number;
  wasiyyah: number;
  deceasedGender: 'male' | 'female';
  wives: number;
  hasHusband: boolean;
  sons: number;
  daughters: number;
  hasFather: boolean;
  hasMother: boolean;
};

export type FaraidShare = {
  heir: string;
  count: number;
  sharePercent: number;
  amount: number;
  rule: string;
};

export type FaraidResult = CalculatorResult & {
  shares: FaraidShare[];
};

export function calculateHomeLoan(input: HomeLoanInput): CalculatorResult {
  requirePositive(input.propertyPrice, 'Property price');
  requirePercentBelow(input.downPaymentPercent, 'Down payment');
  requireNonNegative(input.annualRatePercent, 'Interest/profit rate');
  requirePositive(input.tenureYears, 'Tenure');
  requireNonNegative(input.monthlyIncome, 'Monthly income');
  requireNonNegative(input.existingCommitments, 'Existing commitments');
  requirePercentAtMost100(input.targetDsrPercent, 'Target DSR');
  requireNonNegative(input.extraMonthlyPayment, 'Extra monthly payment');
  requireNonNegative(input.settlementYears, 'Settlement year');
  if (input.settlementYears > input.tenureYears) {
    throw new Error('Settlement year cannot exceed tenure.');
  }

  const downPayment = input.propertyPrice * input.downPaymentPercent / 100;
  const loanAmount = input.propertyPrice - downPayment;
  const monthlyInstallment = reducingBalancePayment(
    loanAmount,
    input.annualRatePercent,
    input.tenureYears,
  );
  const totalRepayment = monthlyInstallment * input.tenureYears * 12;
  const totalInterest = totalRepayment - loanAmount;
  const plannedMonthlyPayment = monthlyInstallment + input.extraMonthlyPayment;
  const accelerated = simulateReducingBalance({
    principal: loanAmount,
    annualRatePercent: input.annualRatePercent,
    monthlyPayment: plannedMonthlyPayment,
    maximumMonths: input.tenureYears * 12,
    captureMonth: input.settlementYears > 0 ? Math.round(input.settlementYears * 12) : undefined,
  });
  const monthsSaved = Math.max(0, input.tenureYears * 12 - accelerated.months);
  const interestSaved = Math.max(0, totalInterest - accelerated.totalInterest);
  const transferDuty = calculateMotStampDuty(input.propertyPrice);
  const loanDuty = loanAmount * 0.005;
  const professionalFees = estimateProfessionalFees(input.propertyPrice, loanAmount);
  const upfrontCash = downPayment + transferDuty + loanDuty + professionalFees;
  const dsr = input.monthlyIncome > 0
    ? (input.existingCommitments + plannedMonthlyPayment) / input.monthlyIncome * 100
    : 0;

  return {
    title: 'Estimated monthly installment',
    primaryValue: formatMyr(monthlyInstallment),
    subtitle: `${formatMyr(loanAmount)} financed after ${formatMyr(downPayment)} down payment.`,
    metrics: [
      { label: 'Loan amount', value: formatMyr(loanAmount) },
      { label: 'Upfront cash', value: formatMyr(upfrontCash) },
      { label: 'Total interest/profit', value: formatMyr(accelerated.totalInterest) },
      {
        label: 'DSR after loan',
        value: input.monthlyIncome > 0 ? formatPercent(dsr) : 'Add income',
      },
    ],
    rows: [
      { label: 'Transfer stamp duty', value: formatMyr(transferDuty) },
      { label: 'Loan agreement duty', value: formatMyr(loanDuty) },
      { label: 'Professional fee estimate', value: formatMyr(professionalFees) },
      { label: 'Planning DSR target', value: formatPercent(input.targetDsrPercent) },
      { label: 'Base monthly installment', value: formatMyr(monthlyInstallment) },
      { label: 'Planned monthly payment', value: formatMyr(plannedMonthlyPayment) },
      { label: 'Estimated payoff time', value: formatMonths(accelerated.months) },
      { label: 'Time saved', value: monthsSaved > 0 ? formatMonths(monthsSaved) : 'No time saved' },
      { label: 'Interest saved', value: formatMyr(interestSaved) },
      ...(input.settlementYears > 0 ? [{
        label: 'Estimated settlement balance',
        value: formatMyr(accelerated.balanceAtCapture ?? 0),
      }] : []),
    ],
    notes: [
      'Uses a standard reducing-balance installment estimate.',
      'Stamp duty and professional fees are planning estimates. Replace them with official quotes when available.',
      'Extra-payment savings assume the rate stays unchanged and every extra payment reduces principal immediately.',
      'Early settlement estimate excludes lock-in penalties, rebates, legal fees, and lender-specific settlement terms.',
    ],
    comparison: {
      monthlyPayment: plannedMonthlyPayment,
      totalRepayment: accelerated.totalPaid,
      upfrontCash,
      durationMonths: accelerated.months,
    },
  };
}

export function calculateCarLoan(input: CarLoanInput): CalculatorResult {
  requirePositive(input.vehiclePrice, 'Vehicle price');
  requirePercentBelow(input.downPaymentPercent, 'Down payment');
  requireNonNegative(input.annualFlatRatePercent, 'Flat interest rate');
  requirePositive(input.tenureYears, 'Tenure');
  requireNonNegative(input.upfrontFees, 'Upfront fees');

  const downPayment = input.vehiclePrice * input.downPaymentPercent / 100;
  const amountFinanced = input.vehiclePrice - downPayment;
  const totalInterest = amountFinanced * input.annualFlatRatePercent / 100 * input.tenureYears;
  const totalRepayment = amountFinanced + totalInterest;
  const monthlyInstallment = totalRepayment / (input.tenureYears * 12);
  const effectiveRate = effectiveAnnualRate(amountFinanced, monthlyInstallment, input.tenureYears * 12);

  return {
    title: 'Estimated monthly installment',
    primaryValue: formatMyr(monthlyInstallment),
    subtitle: `${formatMyr(amountFinanced)} financed after ${formatMyr(downPayment)} down payment.`,
    metrics: [
      { label: 'Total interest', value: formatMyr(totalInterest) },
      { label: 'Effective rate est.', value: formatPercent(effectiveRate) },
      { label: 'Total repayment', value: formatMyr(totalRepayment) },
      { label: 'Upfront cash', value: formatMyr(downPayment + input.upfrontFees) },
    ],
    rows: [
      { label: 'Vehicle price', value: formatMyr(input.vehiclePrice) },
      { label: 'Down payment', value: formatMyr(downPayment) },
      { label: 'Amount financed', value: formatMyr(amountFinanced) },
      { label: 'Upfront fee buffer', value: formatMyr(input.upfrontFees) },
    ],
    notes: [
      'Malaysia car hire purchase quotes commonly use flat-rate interest.',
      'The effective rate helps compare against reducing-balance financing.',
    ],
    comparison: {
      monthlyPayment: monthlyInstallment,
      totalRepayment,
      upfrontCash: downPayment + input.upfrontFees,
      durationMonths: input.tenureYears * 12,
    },
  };
}

export function calculatePersonalLoan(input: PersonalLoanInput): CalculatorResult {
  requirePositive(input.principal, 'Loan amount');
  requireNonNegative(input.annualRatePercent, 'Interest rate');
  requirePositive(input.tenureYears, 'Tenure');
  requireNonNegative(input.upfrontFees, 'Upfront fees');
  requirePercentAtMost100(input.stampDutyRatePercent, 'Stamp duty rate');

  const monthlyInstallment = input.method === 'reducing'
    ? reducingBalancePayment(input.principal, input.annualRatePercent, input.tenureYears)
    : flatRateMonthlyPayment(input.principal, input.annualRatePercent, input.tenureYears);
  const totalRepayment = monthlyInstallment * input.tenureYears * 12;
  const totalInterest = totalRepayment - input.principal;
  const stampDuty = input.principal * input.stampDutyRatePercent / 100;
  const effectiveRate = input.method === 'reducing'
    ? input.annualRatePercent
    : effectiveAnnualRate(input.principal, monthlyInstallment, input.tenureYears * 12);

  return {
    title: 'Estimated monthly payment',
    primaryValue: formatMyr(monthlyInstallment),
    subtitle: `${input.method === 'reducing' ? 'Reducing-balance' : 'Flat-rate'} method over ${input.tenureYears} years.`,
    metrics: [
      { label: 'Total interest', value: formatMyr(totalInterest) },
      { label: 'Effective rate est.', value: formatPercent(effectiveRate) },
      { label: 'Stamp duty est.', value: formatMyr(stampDuty) },
      { label: 'Total cost', value: formatMyr(totalInterest + stampDuty + input.upfrontFees) },
    ],
    rows: [
      { label: 'Principal', value: formatMyr(input.principal) },
      { label: 'Total repayment', value: formatMyr(totalRepayment) },
      { label: 'Upfront fees', value: formatMyr(input.upfrontFees) },
      { label: 'Stamp duty rate', value: formatPercent(input.stampDutyRatePercent) },
    ],
    notes: [
      'Actual bank quotes may include fees, rebates, insurance, settlement rules, and different rounding.',
    ],
    comparison: {
      monthlyPayment: monthlyInstallment,
      totalRepayment,
      upfrontCash: stampDuty + input.upfrontFees,
      durationMonths: input.tenureYears * 12,
    },
  };
}

export function calculateCreditCard(input: CreditCardInput): CalculatorResult {
  requirePositive(input.outstandingBalance, 'Outstanding balance');
  requirePositive(input.monthlyPayment, 'Monthly payment');
  requireNonNegative(input.annualFinanceChargePercent, 'Finance charge');
  requireNonNegative(input.monthlyNewSpending, 'Monthly new spending');
  requirePositive(input.minimumPaymentPercent, 'Minimum payment');
  requirePercentAtMost100(input.minimumPaymentPercent, 'Minimum payment');
  requireNonNegative(input.minimumPaymentFloor, 'Minimum floor');

  const fixed = simulateCardPayoff(input, 'fixed');
  const minimum = simulateCardPayoff(input, 'minimum');
  const firstMinimum = Math.max(
    input.outstandingBalance * input.minimumPaymentPercent / 100,
    input.minimumPaymentFloor,
  );

  return {
    title: fixed.isPaidOff ? 'Estimated payoff time' : 'Payment may not clear balance',
    primaryValue: fixed.isPaidOff ? formatMonths(fixed.months) : 'Review payment',
    subtitle: fixed.isPaidOff
      ? `${formatMyr(fixed.totalPaid)} paid including ${formatMyr(fixed.totalInterest)} finance charge.`
      : `Projected balance remains ${formatMyr(fixed.remainingBalance)} after 600 months.`,
    metrics: [
      { label: 'Fixed-payment interest', value: formatMyr(fixed.totalInterest) },
      { label: 'Minimum-only time', value: minimum.isPaidOff ? formatMonths(minimum.months) : 'Not cleared' },
      { label: 'Minimum-only interest', value: formatMyr(minimum.totalInterest) },
      { label: 'First minimum payment', value: formatMyr(firstMinimum) },
    ],
    rows: [
      { label: 'Outstanding balance', value: formatMyr(input.outstandingBalance) },
      { label: 'Monthly payment', value: formatMyr(input.monthlyPayment) },
      { label: 'Monthly new spending', value: formatMyr(input.monthlyNewSpending) },
      { label: 'Finance charge', value: formatPercent(input.annualFinanceChargePercent) },
    ],
    notes: [
      input.monthlyPayment < firstMinimum
        ? 'Entered payment is below the first estimated minimum payment.'
        : 'Minimum-payment projection recalculates each month from the editable assumptions.',
      'Actual statement cycles, compounding, fees, and promotions can differ.',
    ],
    comparison: {
      monthlyPayment: input.monthlyPayment,
      totalRepayment: fixed.totalPaid,
      upfrontCash: 0,
      durationMonths: fixed.isPaidOff ? fixed.months : null,
    },
  };
}

export function calculatePtptn(input: PtptnInput): CalculatorResult {
  requirePositive(input.outstandingBalance, 'Outstanding balance');
  requireNonNegative(input.annualUjrahRatePercent, 'Ujrah rate');
  requirePositive(input.tenureYears, 'Tenure');
  requireNonNegative(input.extraMonthlyPayment, 'Extra monthly payment');

  const scheduled = input.method === 'reducing'
    ? reducingBalancePayment(input.outstandingBalance, input.annualUjrahRatePercent, input.tenureYears)
    : flatRateMonthlyPayment(input.outstandingBalance, input.annualUjrahRatePercent, input.tenureYears);
  const planned = scheduled + input.extraMonthlyPayment;
  const simulated = simulateReducingBalance({
    principal: input.outstandingBalance,
    annualRatePercent: input.method === 'reducing' ? input.annualUjrahRatePercent : 0,
    monthlyPayment: planned,
    maximumMonths: input.tenureYears * 12,
  });
  const flatCharge = input.method === 'flat'
    ? input.outstandingBalance * input.annualUjrahRatePercent / 100 * input.tenureYears
    : simulated.totalInterest;
  const totalRepayment = input.method === 'flat'
    ? input.outstandingBalance + flatCharge
    : simulated.totalPaid;

  return {
    title: 'Planned monthly repayment',
    primaryValue: formatMyr(planned),
    subtitle: `${input.method === 'reducing' ? 'Reducing-balance' : 'Flat-rate'} Ujrah planning estimate.`,
    metrics: [
      { label: 'Scheduled payment', value: formatMyr(scheduled) },
      { label: 'Total Ujrah est.', value: formatMyr(flatCharge) },
      { label: 'Total repayment', value: formatMyr(totalRepayment) },
      { label: 'Payoff time', value: formatMonths(simulated.months) },
    ],
    rows: [
      { label: 'Outstanding balance', value: formatMyr(input.outstandingBalance) },
      { label: 'Extra monthly payment', value: formatMyr(input.extraMonthlyPayment) },
      { label: 'Ujrah rate', value: formatPercent(input.annualUjrahRatePercent) },
      { label: 'Tenure', value: `${input.tenureYears} years` },
    ],
    notes: [
      'PTPTN statements and official schedules should be checked for actual service charge treatment.',
    ],
    comparison: {
      monthlyPayment: planned,
      totalRepayment,
      upfrontCash: 0,
      durationMonths: simulated.months,
    },
  };
}

export function calculateFaraid(input: FaraidInput): FaraidResult {
  requirePositive(input.grossEstate, 'Gross estate');
  requireNonNegative(input.debtsAndExpenses, 'Debts and expenses');
  requireNonNegative(input.wasiyyah, 'Wasiyyah');

  requireWholeNonNegative(input.wives, 'Wife count');
  requireWholeNonNegative(input.sons, 'Son count');
  requireWholeNonNegative(input.daughters, 'Daughter count');
  if (input.deceasedGender === 'male' && input.wives > 4) {
    throw new Error('Wife count cannot exceed 4.');
  }

  const estateAfterDeductions = input.grossEstate - input.debtsAndExpenses;
  requirePositive(estateAfterDeductions, 'Estate after deductions');

  const allowedWasiyyah = Math.min(input.wasiyyah, estateAfterDeductions / 3);
  const distributableEstate = estateAfterDeductions - allowedWasiyyah;
  requirePositive(distributableEstate, 'Distributable estate');

  const hasChildren = input.sons > 0 || input.daughters > 0;
  const spouseCount = input.deceasedGender === 'male'
    ? input.wives
    : input.hasHusband ? 1 : 0;
  const shares: WorkingFaraidShare[] = [];
  const notes = [
    'Covers spouse, parents, sons, and daughters only.',
    'Confirm entitled heirs and shares with the Syariah Court or a qualified faraid advisor.',
  ];

  let spouseShare = 0;
  if (input.deceasedGender === 'male' && input.wives > 0) {
    spouseShare = hasChildren ? 1 / 8 : 1 / 4;
    shares.push({
      heir: input.wives === 1 ? 'Wife' : 'Wives',
      count: input.wives,
      share: spouseShare,
      rule: hasChildren
        ? 'Wife/wives receive 1/8 when children exist.'
        : 'Wife/wives receive 1/4 when no children exist.',
      radd: false,
    });
  } else if (input.deceasedGender === 'female' && input.hasHusband) {
    spouseShare = hasChildren ? 1 / 4 : 1 / 2;
    shares.push({
      heir: 'Husband',
      count: 1,
      share: spouseShare,
      rule: hasChildren
        ? 'Husband receives 1/4 when children exist.'
        : 'Husband receives 1/2 when no children exist.',
      radd: false,
    });
  }

  if (input.hasMother) {
    const motherShare = hasChildren
      ? 1 / 6
      : input.hasFather && spouseCount > 0
        ? (1 - spouseShare) / 3
        : 1 / 3;
    shares.push({
      heir: 'Mother',
      count: 1,
      share: motherShare,
      rule: hasChildren
        ? 'Mother receives 1/6 when children exist.'
        : input.hasFather && spouseCount > 0
          ? 'Mother receives 1/3 of the remainder after spouse.'
          : 'Mother receives 1/3 when no children are entered.',
      radd: true,
    });
  }

  let fatherReceivesResidue = false;
  if (input.hasFather) {
    if (hasChildren) {
      shares.push({
        heir: 'Father',
        count: 1,
        share: 1 / 6,
        rule: input.sons > 0
          ? 'Father receives 1/6 when sons exist.'
          : 'Father receives 1/6 plus residue when only daughters exist.',
        radd: false,
      });
      fatherReceivesResidue = input.sons === 0;
    } else {
      fatherReceivesResidue = true;
    }
  }

  if (input.sons === 0 && input.daughters > 0) {
    shares.push({
      heir: input.daughters === 1 ? 'Daughter' : 'Daughters',
      count: input.daughters,
      share: input.daughters === 1 ? 1 / 2 : 2 / 3,
      rule: input.daughters === 1
        ? 'One daughter receives 1/2 when no sons exist.'
        : 'Two or more daughters share 2/3 when no sons exist.',
      radd: true,
    });
  }

  const fixedTotal = shares.reduce((total, share) => total + share.share, 0);
  if (fixedTotal > 1) {
    const awl = 1 / fixedTotal;
    for (const share of shares) {
      share.share *= awl;
      share.rule = `${share.rule} Adjusted proportionally because fixed shares exceed the estate.`;
    }
    notes.push('Awl applied: fixed shares exceeded 100%.');
  } else {
    const residue = 1 - fixedTotal;
    if (residue > 0.0000001) {
      if (input.sons > 0) {
        addChildrenResidue(shares, input.sons, input.daughters, residue);
      } else if (fatherReceivesResidue) {
        addOrUpdateShare(shares, 'Father', 1, residue, hasChildren
          ? 'Father also receives residue after daughter fixed share.'
          : 'Father receives residue after spouse/mother fixed shares.');
      } else {
        const raddShares = shares.filter((share) => share.radd);
        const raddBase = raddShares.reduce((total, share) => total + share.share, 0);
        if (raddBase > 0) {
          for (const share of raddShares) {
            share.share += residue * share.share / raddBase;
            share.rule = `${share.rule} Residue returned proportionally by radd estimate.`;
          }
          notes.push('Radd estimate applied to supported non-spouse fixed heirs.');
        } else {
          shares.push({
            heir: 'Undistributed residue',
            count: 1,
            share: residue,
            rule: 'No supported residuary heir was entered. Refer this balance for faraid review.',
            radd: false,
          });
        }
      }
    }
  }

  const finalShares = shares.map((share) => ({
    heir: share.heir,
    count: share.count,
    sharePercent: share.share * 100,
    amount: share.share * distributableEstate,
    rule: share.rule,
  }));

  return {
    title: 'Net distributable estate',
    primaryValue: formatMyr(distributableEstate),
    subtitle: `After ${formatMyr(input.debtsAndExpenses)} deductions and ${formatMyr(allowedWasiyyah)} allowed wasiyyah.`,
    metrics: [
      { label: 'Gross estate', value: formatMyr(input.grossEstate) },
      { label: 'Wasiyyah used', value: formatMyr(allowedWasiyyah) },
      { label: 'Total distributed', value: formatMyr(finalShares.reduce((sum, share) => sum + share.amount, 0)) },
      { label: 'Heir groups', value: finalShares.length.toString() },
    ],
    notes: [
      ...(input.wasiyyah > allowedWasiyyah
        ? ['Wasiyyah was capped at one third after debts and expenses.']
        : []),
      ...notes,
    ],
    shares: finalShares,
  };
}

type WorkingFaraidShare = {
  heir: string;
  count: number;
  share: number;
  rule: string;
  radd: boolean;
};

function addChildrenResidue(
  shares: WorkingFaraidShare[],
  sons: number,
  daughters: number,
  residue: number,
) {
  const totalUnits = sons * 2 + daughters;
  if (sons > 0) {
    shares.push({
      heir: sons === 1 ? 'Son' : 'Sons',
      count: sons,
      share: residue * sons * 2 / totalUnits,
      rule: 'Children receive residue, with each son taking the share of two daughters.',
      radd: false,
    });
  }
  if (daughters > 0) {
    shares.push({
      heir: daughters === 1 ? 'Daughter' : 'Daughters',
      count: daughters,
      share: residue * daughters / totalUnits,
      rule: 'Children receive residue, with each son taking the share of two daughters.',
      radd: false,
    });
  }
}

function addOrUpdateShare(
  shares: WorkingFaraidShare[],
  heir: string,
  count: number,
  addedShare: number,
  rule: string,
) {
  const existing = shares.find((share) => share.heir === heir);
  if (existing) {
    existing.share += addedShare;
    existing.rule = `${existing.rule} ${rule}`;
    return;
  }
  shares.push({ heir, count, share: addedShare, rule, radd: false });
}

function reducingBalancePayment(
  principal: number,
  annualRatePercent: number,
  tenureYears: number,
) {
  const months = tenureYears * 12;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) {
    return principal / months;
  }
  return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}

function flatRateMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  tenureYears: number,
) {
  return (principal + principal * annualRatePercent / 100 * tenureYears) / (tenureYears * 12);
}

function effectiveAnnualRate(principal: number, monthlyPayment: number, months: number) {
  if (principal <= 0 || monthlyPayment <= 0 || months <= 0) {
    return 0;
  }
  let low = 0;
  let high = 1;
  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2;
    const estimatedPayment = principal * mid / (1 - Math.pow(1 + mid, -months));
    if (estimatedPayment > monthlyPayment) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return ((low + high) / 2) * 12 * 100;
}

function calculateMotStampDuty(propertyPrice: number) {
  let remaining = propertyPrice;
  let duty = 0;

  const tiers = [
    { amount: 100000, rate: 0.01 },
    { amount: 400000, rate: 0.02 },
    { amount: 500000, rate: 0.03 },
    { amount: Number.POSITIVE_INFINITY, rate: 0.04 },
  ];

  for (const tier of tiers) {
    if (remaining <= 0) {
      break;
    }
    const taxable = Math.min(remaining, tier.amount);
    duty += taxable * tier.rate;
    remaining -= taxable;
  }
  return duty;
}

function estimateProfessionalFees(propertyPrice: number, loanAmount: number) {
  const spaLegal = scaledLegalFee(propertyPrice);
  const loanLegal = scaledLegalFee(loanAmount);
  const valuation = Math.max(400, propertyPrice * 0.0025);
  const serviceTax = (spaLegal + loanLegal + valuation) * 0.08;
  return spaLegal + loanLegal + valuation + serviceTax + 1500;
}

function scaledLegalFee(value: number) {
  let remaining = value;
  let fee = 0;
  const tiers = [
    { amount: 500000, rate: 0.0125 },
    { amount: 2500000, rate: 0.01 },
    { amount: 4000000, rate: 0.0075 },
    { amount: Number.POSITIVE_INFINITY, rate: 0.005 },
  ];

  for (const tier of tiers) {
    if (remaining <= 0) {
      break;
    }
    const chargeable = Math.min(remaining, tier.amount);
    fee += chargeable * tier.rate;
    remaining -= chargeable;
  }
  return fee;
}

function simulateCardPayoff(input: CreditCardInput, mode: 'fixed' | 'minimum') {
  let balance = input.outstandingBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  const monthlyRate = input.annualFinanceChargePercent / 100 / 12;

  for (let month = 1; month <= 600; month += 1) {
    const interest = balance * monthlyRate;
    balance += interest + input.monthlyNewSpending;
    const minimum = Math.max(
      balance * input.minimumPaymentPercent / 100,
      input.minimumPaymentFloor,
    );
    const payment = Math.min(
      balance,
      mode === 'fixed' ? Math.max(input.monthlyPayment, 0) : minimum,
    );
    balance -= payment;
    totalInterest += interest;
    totalPaid += payment;

    if (balance <= 0.01 && input.monthlyNewSpending === 0) {
      return {
        isPaidOff: true,
        months: month,
        totalInterest,
        totalPaid,
        remainingBalance: 0,
      };
    }
  }

  return {
    isPaidOff: false,
    months: 600,
    totalInterest,
    totalPaid,
    remainingBalance: balance,
  };
}

function simulateReducingBalance({
  principal,
  annualRatePercent,
  monthlyPayment,
  maximumMonths,
  captureMonth,
}: {
  principal: number;
  annualRatePercent: number;
  monthlyPayment: number;
  maximumMonths: number;
  captureMonth?: number;
}) {
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  let balanceAtCapture: number | undefined;

  for (let month = 1; month <= maximumMonths; month += 1) {
    const interest = balance * monthlyRate;
    const payment = Math.min(balance + interest, monthlyPayment);
    balance = balance + interest - payment;
    totalInterest += interest;
    totalPaid += payment;
    if (month === captureMonth) {
      balanceAtCapture = Math.max(0, balance);
    }
    if (balance <= 0.01) {
      return {
        months: month,
        totalInterest,
        totalPaid,
        balanceAtCapture: captureMonth && captureMonth > month ? 0 : balanceAtCapture,
      };
    }
  }

  return { months: maximumMonths, totalInterest, totalPaid, balanceAtCapture };
}

function requirePositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be above 0.`);
  }
}

function requireNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} cannot be negative.`);
  }
}

function requirePercentBelow(value: number, label: string) {
  requireNonNegative(value, label);
  if (value >= 100) {
    throw new Error(`${label} must be below 100%.`);
  }
}

function requirePercentAtMost100(value: number, label: string) {
  requireNonNegative(value, label);
  if (value > 100) {
    throw new Error(`${label} must be 100% or below.`);
  }
}

function requireWholeNonNegative(value: number, label: string) {
  requireNonNegative(value, label);
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be a whole number.`);
  }
}

export function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(',', '').replaceAll('RM', '').replaceAll('%', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMyr(value: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${round(value).toLocaleString('en-MY', {
    maximumFractionDigits: 2,
  })}%`;
}

function formatMonths(months: number) {
  if (months < 12) {
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  return `${years} yr ${remainingMonths} mo`;
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

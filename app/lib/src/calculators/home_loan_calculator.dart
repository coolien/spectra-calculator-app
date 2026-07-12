import 'dart:math' as math;

enum MalaysiaBuyerType {
  citizen,
  permanentResident,
  foreignIndividual,
  foreignCompany,
}

enum HomePurchaseType { subsale, hdaNewProject }

enum HomeFinancingType { conventional, islamic }

enum UpfrontCostCategory { cashBeforeLoan, statutory, professional, optional }

enum AffordabilityStatus { withinTarget, nearTarget, aboveTarget, unavailable }

class HomeLoanInput {
  HomeLoanInput({
    required this.propertyPrice,
    required this.downPaymentPercent,
    required this.annualInterestRatePercent,
    required this.tenureYears,
    required this.spaDate,
    this.buyerType = MalaysiaBuyerType.citizen,
    this.purchaseType = HomePurchaseType.subsale,
    this.financingType = HomeFinancingType.conventional,
    this.isFirstResidentialHome = false,
    this.isResidentialProperty = true,
    this.extraUpfrontCosts = const [],
  });

  final double propertyPrice;
  final double downPaymentPercent;
  final double annualInterestRatePercent;
  final int tenureYears;
  final DateTime spaDate;
  final MalaysiaBuyerType buyerType;
  final HomePurchaseType purchaseType;
  final HomeFinancingType financingType;
  final bool isFirstResidentialHome;
  final bool isResidentialProperty;
  final List<UpfrontCostItem> extraUpfrontCosts;

  double get loanAmount => propertyPrice - downPaymentAmount;

  double get downPaymentAmount => propertyPrice * downPaymentPercent / 100;
}

class HomeLoanResult {
  const HomeLoanResult({
    required this.financingType,
    required this.propertyPrice,
    required this.downPaymentAmount,
    required this.loanAmount,
    required this.monthlyInstallment,
    required this.totalRepayment,
    required this.totalInterest,
    required this.stampDuty,
    required this.upfrontCosts,
    required this.yearlyAmortization,
  });

  final HomeFinancingType financingType;
  final double propertyPrice;
  final double downPaymentAmount;
  final double loanAmount;
  final double monthlyInstallment;
  final double totalRepayment;
  final double totalInterest;
  final StampDutyBreakdown stampDuty;
  final UpfrontCostBreakdown upfrontCosts;
  final List<AmortizationYear> yearlyAmortization;
}

class AffordabilityInput {
  const AffordabilityInput({
    required this.monthlyIncome,
    required this.existingMonthlyCommitments,
    required this.targetDsrPercent,
    required this.loanAmount,
    required this.annualInterestRatePercent,
    required this.currentMonthlyInstallment,
    this.tenureOptionsYears = const [20, 25, 30, 35],
  });

  final double monthlyIncome;
  final double existingMonthlyCommitments;
  final double targetDsrPercent;
  final double loanAmount;
  final double annualInterestRatePercent;
  final double currentMonthlyInstallment;
  final List<int> tenureOptionsYears;
}

class AffordabilityResult {
  const AffordabilityResult({
    required this.maximumTargetInstallment,
    required this.remainingTargetRoom,
    required this.currentDsrPercent,
    required this.status,
    required this.tenureOptions,
  });

  final double maximumTargetInstallment;
  final double remainingTargetRoom;
  final double currentDsrPercent;
  final AffordabilityStatus status;
  final List<AffordabilityTenureOption> tenureOptions;
}

class AffordabilityTenureOption {
  const AffordabilityTenureOption({
    required this.tenureYears,
    required this.monthlyInstallment,
    required this.dsrPercent,
    required this.status,
  });

  final int tenureYears;
  final double monthlyInstallment;
  final double dsrPercent;
  final AffordabilityStatus status;
}

class StampDutyBreakdown {
  const StampDutyBreakdown({
    required this.transferDuty,
    required this.loanAgreementDuty,
    required this.transferDutyBeforeExemption,
    required this.loanAgreementDutyBeforeExemption,
    required this.firstHomeExemptionApplied,
  });

  final double transferDuty;
  final double loanAgreementDuty;
  final double transferDutyBeforeExemption;
  final double loanAgreementDutyBeforeExemption;
  final bool firstHomeExemptionApplied;

  double get total => transferDuty + loanAgreementDuty;

  double get totalBeforeExemption =>
      transferDutyBeforeExemption + loanAgreementDutyBeforeExemption;

  double get totalExemption => totalBeforeExemption - total;
}

class AmortizationYear {
  const AmortizationYear({
    required this.year,
    required this.payment,
    required this.principalPaid,
    required this.interestPaid,
    required this.endingBalance,
  });

  final int year;
  final double payment;
  final double principalPaid;
  final double interestPaid;
  final double endingBalance;
}

class UpfrontCostItem {
  const UpfrontCostItem({
    required this.label,
    required this.amount,
    required this.category,
  });

  final String label;
  final double amount;
  final UpfrontCostCategory category;
}

class UpfrontCostBreakdown {
  const UpfrontCostBreakdown({required this.items});

  final List<UpfrontCostItem> items;

  double get total => items.fold(0, (sum, item) => sum + item.amount);

  double totalForCategory(UpfrontCostCategory category) {
    return items
        .where((item) => item.category == category)
        .fold(0, (sum, item) => sum + item.amount);
  }
}

class ProfessionalFeeEstimate {
  const ProfessionalFeeEstimate({
    required this.spaLegalFee,
    required this.loanLegalFee,
    required this.valuationFee,
    required this.serviceTax,
  });

  final double spaLegalFee;
  final double loanLegalFee;
  final double valuationFee;
  final double serviceTax;

  double get total => spaLegalFee + loanLegalFee + valuationFee + serviceTax;
}

class StampDutyBracket {
  const StampDutyBracket({required this.amount, required this.rate});

  final double amount;
  final double rate;
}

class FeeScaleBracket {
  const FeeScaleBracket({required this.amount, required this.rate});

  final double amount;
  final double rate;
}

class MalaysiaHomeLoanRules {
  MalaysiaHomeLoanRules({
    required this.lastReviewed,
    required this.firstHomeExemptionStart,
    required this.firstHomeExemptionEnd,
    required this.firstHomePriceCap,
    required this.transferDutyBrackets,
    required this.loanAgreementDutyRate,
    required this.foreignResidentialDutyRateFrom2026,
    required this.foreignResidentialDutyEffectiveDate,
    required this.legalFeeBrackets,
    required this.valuationFeeBrackets,
    required this.minimumLegalFee,
    required this.minimumValuationFee,
    required this.serviceTaxRate,
  });

  final DateTime lastReviewed;
  final DateTime firstHomeExemptionStart;
  final DateTime firstHomeExemptionEnd;
  final double firstHomePriceCap;
  final List<StampDutyBracket> transferDutyBrackets;
  final double loanAgreementDutyRate;
  final double foreignResidentialDutyRateFrom2026;
  final DateTime foreignResidentialDutyEffectiveDate;
  final List<FeeScaleBracket> legalFeeBrackets;
  final List<FeeScaleBracket> valuationFeeBrackets;
  final double minimumLegalFee;
  final double minimumValuationFee;
  final double serviceTaxRate;

  static final current = MalaysiaHomeLoanRules(
    lastReviewed: DateTime(2026, 6, 30),
    firstHomeExemptionStart: DateTime(2026, 1, 1),
    firstHomeExemptionEnd: DateTime(2027, 12, 31),
    firstHomePriceCap: 500000,
    transferDutyBrackets: const [
      StampDutyBracket(amount: 100000, rate: 0.01),
      StampDutyBracket(amount: 400000, rate: 0.02),
      StampDutyBracket(amount: 500000, rate: 0.03),
      StampDutyBracket(amount: double.infinity, rate: 0.04),
    ],
    loanAgreementDutyRate: 0.005,
    foreignResidentialDutyRateFrom2026: 0.08,
    foreignResidentialDutyEffectiveDate: DateTime(2026, 1, 1),
    legalFeeBrackets: const [
      FeeScaleBracket(amount: 500000, rate: 0.0125),
      FeeScaleBracket(amount: 7000000, rate: 0.01),
      FeeScaleBracket(amount: double.infinity, rate: 0.01),
    ],
    valuationFeeBrackets: const [
      FeeScaleBracket(amount: 100000, rate: 0.0025),
      FeeScaleBracket(amount: 1900000, rate: 0.002),
      FeeScaleBracket(amount: 5000000, rate: 1 / 600),
      FeeScaleBracket(amount: 8000000, rate: 0.00125),
      FeeScaleBracket(amount: 35000000, rate: 0.001),
      FeeScaleBracket(amount: 150000000, rate: 1 / 1500),
      FeeScaleBracket(amount: 300000000, rate: 0.0005),
      FeeScaleBracket(amount: double.infinity, rate: 0.0004),
    ],
    minimumLegalFee: 500,
    minimumValuationFee: 400,
    serviceTaxRate: 0.08,
  );
}

class HomeLoanCalculator {
  const HomeLoanCalculator({required this.rules});

  final MalaysiaHomeLoanRules rules;

  HomeLoanResult calculate(HomeLoanInput input) {
    _validateInput(input);

    final monthlyInstallment = calculateMonthlyInstallment(
      principal: input.loanAmount,
      annualInterestRatePercent: input.annualInterestRatePercent,
      tenureYears: input.tenureYears,
    );
    final yearlyAmortization = buildYearlyAmortization(
      principal: input.loanAmount,
      annualInterestRatePercent: input.annualInterestRatePercent,
      tenureYears: input.tenureYears,
    );
    final totalRepayment = yearlyAmortization.fold(
      0.0,
      (sum, year) => sum + year.payment,
    );
    final stampDuty = calculateStampDuty(input);
    final upfrontCosts = calculateUpfrontCosts(input, stampDuty);

    return HomeLoanResult(
      financingType: input.financingType,
      propertyPrice: input.propertyPrice,
      downPaymentAmount: input.downPaymentAmount,
      loanAmount: input.loanAmount,
      monthlyInstallment: monthlyInstallment,
      totalRepayment: totalRepayment,
      totalInterest: totalRepayment - input.loanAmount,
      stampDuty: stampDuty,
      upfrontCosts: upfrontCosts,
      yearlyAmortization: yearlyAmortization,
    );
  }

  double calculateMonthlyInstallment({
    required double principal,
    required double annualInterestRatePercent,
    required int tenureYears,
  }) {
    _requirePositive('principal', principal);
    _requireNonNegative('annualInterestRatePercent', annualInterestRatePercent);
    if (tenureYears <= 0) {
      throw ArgumentError.value(tenureYears, 'tenureYears', 'must be positive');
    }

    final months = tenureYears * 12;
    final monthlyRate = annualInterestRatePercent / 100 / 12;

    if (monthlyRate == 0) {
      return principal / months;
    }

    final compound = math.pow(1 + monthlyRate, months).toDouble();
    return principal * monthlyRate * compound / (compound - 1);
  }

  List<AmortizationYear> buildYearlyAmortization({
    required double principal,
    required double annualInterestRatePercent,
    required int tenureYears,
  }) {
    final monthlyInstallment = calculateMonthlyInstallment(
      principal: principal,
      annualInterestRatePercent: annualInterestRatePercent,
      tenureYears: tenureYears,
    );
    final monthlyRate = annualInterestRatePercent / 100 / 12;
    final totalMonths = tenureYears * 12;
    final yearly = <AmortizationYear>[];

    var balance = principal;
    var yearPayment = 0.0;
    var yearPrincipal = 0.0;
    var yearInterest = 0.0;

    for (var month = 1; month <= totalMonths; month += 1) {
      final interest = balance * monthlyRate;
      final scheduledPrincipal = monthlyInstallment - interest;
      final principalPaid = math.min(scheduledPrincipal, balance);
      final payment = principalPaid + interest;

      balance = math.max(0, balance - principalPaid);
      yearPayment += payment;
      yearPrincipal += principalPaid;
      yearInterest += interest;

      if (month % 12 == 0 || month == totalMonths) {
        yearly.add(
          AmortizationYear(
            year: (month / 12).ceil(),
            payment: yearPayment,
            principalPaid: yearPrincipal,
            interestPaid: yearInterest,
            endingBalance: balance,
          ),
        );
        yearPayment = 0;
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    return yearly;
  }

  StampDutyBreakdown calculateStampDuty(HomeLoanInput input) {
    _validateInput(input);

    final transferDutyBeforeExemption = _calculateTransferDuty(
      propertyPrice: input.propertyPrice,
      buyerType: input.buyerType,
      isResidentialProperty: input.isResidentialProperty,
      spaDate: input.spaDate,
    );
    final loanAgreementDutyBeforeExemption =
        input.loanAmount * rules.loanAgreementDutyRate;
    final firstHomeExemptionApplied = _isFirstHomeExemptionEligible(input);

    return StampDutyBreakdown(
      transferDuty: firstHomeExemptionApplied ? 0 : transferDutyBeforeExemption,
      loanAgreementDuty: firstHomeExemptionApplied
          ? 0
          : loanAgreementDutyBeforeExemption,
      transferDutyBeforeExemption: transferDutyBeforeExemption,
      loanAgreementDutyBeforeExemption: loanAgreementDutyBeforeExemption,
      firstHomeExemptionApplied: firstHomeExemptionApplied,
    );
  }

  UpfrontCostBreakdown calculateUpfrontCosts(
    HomeLoanInput input,
    StampDutyBreakdown stampDuty,
  ) {
    _validateInput(input);

    final items = <UpfrontCostItem>[
      UpfrontCostItem(
        label: 'Down payment',
        amount: input.downPaymentAmount,
        category: UpfrontCostCategory.cashBeforeLoan,
      ),
      UpfrontCostItem(
        label: 'MOT stamp duty',
        amount: stampDuty.transferDuty,
        category: UpfrontCostCategory.statutory,
      ),
      UpfrontCostItem(
        label: 'Loan agreement stamp duty',
        amount: stampDuty.loanAgreementDuty,
        category: UpfrontCostCategory.statutory,
      ),
      ...input.extraUpfrontCosts,
    ];

    return UpfrontCostBreakdown(items: List.unmodifiable(items));
  }

  ProfessionalFeeEstimate estimateProfessionalFees({
    required double propertyPrice,
    required double loanAmount,
    required HomePurchaseType purchaseType,
  }) {
    _requirePositive('propertyPrice', propertyPrice);
    _requirePositive('loanAmount', loanAmount);

    final spaLegalFee = calculateLegalFee(
      amount: propertyPrice,
      purchaseType: purchaseType,
    );
    final loanLegalFee = calculateLegalFee(
      amount: loanAmount,
      purchaseType: purchaseType,
    );
    final valuationFee = calculateValuationFee(propertyPrice);
    final serviceTax =
        (spaLegalFee + loanLegalFee + valuationFee) * rules.serviceTaxRate;

    return ProfessionalFeeEstimate(
      spaLegalFee: spaLegalFee,
      loanLegalFee: loanLegalFee,
      valuationFee: valuationFee,
      serviceTax: serviceTax,
    );
  }

  double calculateLegalFee({
    required double amount,
    required HomePurchaseType purchaseType,
  }) {
    _requirePositive('amount', amount);

    final fullScaleFee = math.max(
      _calculateBracketedAmount(amount, rules.legalFeeBrackets),
      rules.minimumLegalFee,
    );

    if (purchaseType == HomePurchaseType.subsale) {
      return fullScaleFee;
    }

    if (amount <= 50000) {
      return rules.minimumLegalFee;
    }
    if (amount <= 250000) {
      return math.max(fullScaleFee * 0.75, rules.minimumLegalFee);
    }
    if (amount <= 500000) {
      return fullScaleFee * 0.70;
    }
    if (amount <= 1000000) {
      return fullScaleFee * 0.65;
    }

    return fullScaleFee * 0.50;
  }

  double calculateValuationFee(double propertyPrice) {
    _requirePositive('propertyPrice', propertyPrice);

    return math.max(
      _calculateBracketedAmount(propertyPrice, rules.valuationFeeBrackets),
      rules.minimumValuationFee,
    );
  }

  AffordabilityResult? calculateAffordability(AffordabilityInput input) {
    _requireNonNegative('monthlyIncome', input.monthlyIncome);
    _requireNonNegative(
      'existingMonthlyCommitments',
      input.existingMonthlyCommitments,
    );
    _requireNonNegative('targetDsrPercent', input.targetDsrPercent);
    _requirePositive('loanAmount', input.loanAmount);
    _requireNonNegative(
      'annualInterestRatePercent',
      input.annualInterestRatePercent,
    );
    _requirePositive(
      'currentMonthlyInstallment',
      input.currentMonthlyInstallment,
    );

    if (input.monthlyIncome == 0 || input.targetDsrPercent == 0) {
      return null;
    }

    final maximumTargetInstallment =
        input.monthlyIncome * input.targetDsrPercent / 100 -
        input.existingMonthlyCommitments;
    final remainingTargetRoom = math
        .max(0, maximumTargetInstallment)
        .toDouble();
    final currentDsrPercent =
        (input.existingMonthlyCommitments + input.currentMonthlyInstallment) /
        input.monthlyIncome *
        100;

    return AffordabilityResult(
      maximumTargetInstallment: math.max(0, maximumTargetInstallment),
      remainingTargetRoom: remainingTargetRoom,
      currentDsrPercent: currentDsrPercent,
      status: _affordabilityStatus(
        dsrPercent: currentDsrPercent,
        targetDsrPercent: input.targetDsrPercent,
      ),
      tenureOptions: [
        for (final tenureYears in input.tenureOptionsYears)
          _buildTenureOption(input: input, tenureYears: tenureYears),
      ],
    );
  }

  double _calculateTransferDuty({
    required double propertyPrice,
    required MalaysiaBuyerType buyerType,
    required bool isResidentialProperty,
    required DateTime spaDate,
  }) {
    final isForeignResidentialBuyer =
        isResidentialProperty &&
        (buyerType == MalaysiaBuyerType.foreignIndividual ||
            buyerType == MalaysiaBuyerType.foreignCompany);

    if (isForeignResidentialBuyer &&
        !spaDate.isBefore(rules.foreignResidentialDutyEffectiveDate)) {
      return propertyPrice * rules.foreignResidentialDutyRateFrom2026;
    }

    var remaining = propertyPrice;
    var duty = 0.0;

    for (final bracket in rules.transferDutyBrackets) {
      if (remaining <= 0) {
        break;
      }

      final taxableAmount = math.min(remaining, bracket.amount);
      duty += taxableAmount * bracket.rate;
      remaining -= taxableAmount;
    }

    return duty;
  }

  double _calculateBracketedAmount(
    double value,
    List<FeeScaleBracket> brackets,
  ) {
    var remaining = value;
    var total = 0.0;

    for (final bracket in brackets) {
      if (remaining <= 0) {
        break;
      }

      final amount = math.min(remaining, bracket.amount);
      total += amount * bracket.rate;
      remaining -= amount;
    }

    return total;
  }

  AffordabilityTenureOption _buildTenureOption({
    required AffordabilityInput input,
    required int tenureYears,
  }) {
    final monthlyInstallment = calculateMonthlyInstallment(
      principal: input.loanAmount,
      annualInterestRatePercent: input.annualInterestRatePercent,
      tenureYears: tenureYears,
    );
    final dsrPercent =
        (input.existingMonthlyCommitments + monthlyInstallment) /
        input.monthlyIncome *
        100;

    return AffordabilityTenureOption(
      tenureYears: tenureYears,
      monthlyInstallment: monthlyInstallment,
      dsrPercent: dsrPercent,
      status: _affordabilityStatus(
        dsrPercent: dsrPercent,
        targetDsrPercent: input.targetDsrPercent,
      ),
    );
  }

  AffordabilityStatus _affordabilityStatus({
    required double dsrPercent,
    required double targetDsrPercent,
  }) {
    if (targetDsrPercent <= 0) {
      return AffordabilityStatus.unavailable;
    }
    if (dsrPercent <= targetDsrPercent) {
      return AffordabilityStatus.withinTarget;
    }
    if (dsrPercent <= targetDsrPercent + 10) {
      return AffordabilityStatus.nearTarget;
    }

    return AffordabilityStatus.aboveTarget;
  }

  bool _isFirstHomeExemptionEligible(HomeLoanInput input) {
    return input.buyerType == MalaysiaBuyerType.citizen &&
        input.isResidentialProperty &&
        input.isFirstResidentialHome &&
        input.propertyPrice <= rules.firstHomePriceCap &&
        !input.spaDate.isBefore(rules.firstHomeExemptionStart) &&
        !input.spaDate.isAfter(rules.firstHomeExemptionEnd);
  }

  void _validateInput(HomeLoanInput input) {
    _requirePositive('propertyPrice', input.propertyPrice);
    _requireNonNegative('downPaymentPercent', input.downPaymentPercent);
    _requireNonNegative(
      'annualInterestRatePercent',
      input.annualInterestRatePercent,
    );
    if (input.downPaymentPercent >= 100) {
      throw ArgumentError.value(
        input.downPaymentPercent,
        'downPaymentPercent',
        'must be less than 100',
      );
    }
    if (input.tenureYears <= 0) {
      throw ArgumentError.value(
        input.tenureYears,
        'tenureYears',
        'must be positive',
      );
    }
    for (final item in input.extraUpfrontCosts) {
      _requireNonNegative(item.label, item.amount);
    }
  }

  void _requirePositive(String name, double value) {
    if (!value.isFinite || value <= 0) {
      throw ArgumentError.value(value, name, 'must be greater than zero');
    }
  }

  void _requireNonNegative(String name, double value) {
    if (!value.isFinite || value < 0) {
      throw ArgumentError.value(value, name, 'must be zero or greater');
    }
  }
}

double roundToCents(double value) => (value * 100).roundToDouble() / 100;

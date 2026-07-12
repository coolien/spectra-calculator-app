import 'dart:math' as math;

enum PersonalLoanInterestMethod { reducingBalance, flatRate }

enum PtptnServiceChargeMethod { reducingBalance, flatRate }

class LoanYearSummary {
  const LoanYearSummary({
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

class CarLoanInput {
  const CarLoanInput({
    required this.vehiclePrice,
    required this.downPaymentPercent,
    required this.annualFlatRatePercent,
    required this.tenureYears,
    this.upfrontFees = 0,
  });

  final double vehiclePrice;
  final double downPaymentPercent;
  final double annualFlatRatePercent;
  final int tenureYears;
  final double upfrontFees;

  double get downPaymentAmount => vehiclePrice * downPaymentPercent / 100;

  double get amountFinanced => vehiclePrice - downPaymentAmount;
}

class CarLoanResult {
  const CarLoanResult({
    required this.vehiclePrice,
    required this.downPaymentAmount,
    required this.amountFinanced,
    required this.monthlyInstallment,
    required this.totalInterest,
    required this.totalRepayment,
    required this.upfrontCash,
    required this.effectiveAnnualRatePercent,
    required this.yearlyRepaymentPlan,
  });

  final double vehiclePrice;
  final double downPaymentAmount;
  final double amountFinanced;
  final double monthlyInstallment;
  final double totalInterest;
  final double totalRepayment;
  final double upfrontCash;
  final double effectiveAnnualRatePercent;
  final List<LoanYearSummary> yearlyRepaymentPlan;
}

class PersonalLoanInput {
  const PersonalLoanInput({
    required this.principal,
    required this.annualInterestRatePercent,
    required this.tenureYears,
    this.upfrontFees = 0,
    this.stampDutyRatePercent = 0.5,
    this.interestMethod = PersonalLoanInterestMethod.reducingBalance,
  });

  final double principal;
  final double annualInterestRatePercent;
  final int tenureYears;
  final double upfrontFees;
  final double stampDutyRatePercent;
  final PersonalLoanInterestMethod interestMethod;
}

class PersonalLoanResult {
  const PersonalLoanResult({
    required this.interestMethod,
    required this.principal,
    required this.monthlyInstallment,
    required this.totalInterest,
    required this.totalRepayment,
    required this.upfrontFees,
    required this.stampDutyEstimate,
    required this.effectiveAnnualRatePercent,
    required this.yearlyRepaymentPlan,
  });

  final PersonalLoanInterestMethod interestMethod;
  final double principal;
  final double monthlyInstallment;
  final double totalInterest;
  final double totalRepayment;
  final double upfrontFees;
  final double stampDutyEstimate;
  final double effectiveAnnualRatePercent;
  final List<LoanYearSummary> yearlyRepaymentPlan;

  double get totalCost => totalInterest + upfrontFees + stampDutyEstimate;
}

class CreditCardPayoffInput {
  const CreditCardPayoffInput({
    required this.outstandingBalance,
    required this.annualFinanceChargePercent,
    required this.monthlyPayment,
    this.monthlyNewSpending = 0,
    this.minimumPaymentPercent = 5,
    this.minimumPaymentFloor = 50,
    this.maximumMonths = 600,
  });

  final double outstandingBalance;
  final double annualFinanceChargePercent;
  final double monthlyPayment;
  final double monthlyNewSpending;
  final double minimumPaymentPercent;
  final double minimumPaymentFloor;
  final int maximumMonths;
}

class CreditCardPayoffResult {
  const CreditCardPayoffResult({
    required this.isPaidOff,
    required this.monthsToPayoff,
    required this.totalInterest,
    required this.totalPaid,
    required this.remainingBalance,
    required this.firstMinimumPayment,
    required this.isBelowFirstMinimumPayment,
    required this.minimumOnlyIsPaidOff,
    required this.minimumOnlyMonthsToPayoff,
    required this.minimumOnlyTotalInterest,
    required this.minimumOnlyTotalPaid,
    required this.minimumOnlyRemainingBalance,
    required this.monthlyPlan,
  });

  final bool isPaidOff;
  final int monthsToPayoff;
  final double totalInterest;
  final double totalPaid;
  final double remainingBalance;
  final double firstMinimumPayment;
  final bool isBelowFirstMinimumPayment;
  final bool minimumOnlyIsPaidOff;
  final int minimumOnlyMonthsToPayoff;
  final double minimumOnlyTotalInterest;
  final double minimumOnlyTotalPaid;
  final double minimumOnlyRemainingBalance;
  final List<CreditCardMonthSummary> monthlyPlan;
}

class CreditCardMonthSummary {
  const CreditCardMonthSummary({
    required this.month,
    required this.interest,
    required this.spending,
    required this.payment,
    required this.endingBalance,
  });

  final int month;
  final double interest;
  final double spending;
  final double payment;
  final double endingBalance;
}

class PtptnLoanInput {
  const PtptnLoanInput({
    required this.outstandingBalance,
    required this.annualUjrahRatePercent,
    required this.tenureYears,
    this.extraMonthlyPayment = 0,
    this.serviceChargeMethod = PtptnServiceChargeMethod.reducingBalance,
  });

  final double outstandingBalance;
  final double annualUjrahRatePercent;
  final int tenureYears;
  final double extraMonthlyPayment;
  final PtptnServiceChargeMethod serviceChargeMethod;
}

class PtptnLoanResult {
  const PtptnLoanResult({
    required this.serviceChargeMethod,
    required this.outstandingBalance,
    required this.scheduledMonthlyPayment,
    required this.plannedMonthlyPayment,
    required this.totalServiceCharge,
    required this.totalRepayment,
    required this.payoffMonths,
    required this.finalPayment,
    required this.yearlyRepaymentPlan,
  });

  final PtptnServiceChargeMethod serviceChargeMethod;
  final double outstandingBalance;
  final double scheduledMonthlyPayment;
  final double plannedMonthlyPayment;
  final double totalServiceCharge;
  final double totalRepayment;
  final int payoffMonths;
  final double finalPayment;
  final List<LoanYearSummary> yearlyRepaymentPlan;
}

class MalaysiaConsumerLoanCalculator {
  const MalaysiaConsumerLoanCalculator();

  CarLoanResult calculateCarLoan(CarLoanInput input) {
    _requirePositive('vehiclePrice', input.vehiclePrice);
    _requireNonNegative('downPaymentPercent', input.downPaymentPercent);
    _requireNonNegative('annualFlatRatePercent', input.annualFlatRatePercent);
    _requirePositiveInt('tenureYears', input.tenureYears);
    _requireNonNegative('upfrontFees', input.upfrontFees);
    if (input.downPaymentPercent >= 100) {
      throw ArgumentError.value(
        input.downPaymentPercent,
        'downPaymentPercent',
        'must be below 100',
      );
    }

    final totalInterest =
        input.amountFinanced *
        input.annualFlatRatePercent /
        100 *
        input.tenureYears;
    final totalRepayment = input.amountFinanced + totalInterest;
    final monthlyInstallment = totalRepayment / (input.tenureYears * 12);
    final effectiveAnnualRatePercent = _effectiveAnnualRateFromPayment(
      principal: input.amountFinanced,
      monthlyPayment: monthlyInstallment,
      months: input.tenureYears * 12,
    );

    return CarLoanResult(
      vehiclePrice: input.vehiclePrice,
      downPaymentAmount: input.downPaymentAmount,
      amountFinanced: input.amountFinanced,
      monthlyInstallment: monthlyInstallment,
      totalInterest: totalInterest,
      totalRepayment: totalRepayment,
      upfrontCash: input.downPaymentAmount + input.upfrontFees,
      effectiveAnnualRatePercent: effectiveAnnualRatePercent,
      yearlyRepaymentPlan: _buildFlatRatePlan(
        principal: input.amountFinanced,
        totalInterest: totalInterest,
        monthlyPayment: monthlyInstallment,
      ),
    );
  }

  PersonalLoanResult calculatePersonalLoan(PersonalLoanInput input) {
    _requirePositive('principal', input.principal);
    _requireNonNegative(
      'annualInterestRatePercent',
      input.annualInterestRatePercent,
    );
    _requirePositiveInt('tenureYears', input.tenureYears);
    _requireNonNegative('upfrontFees', input.upfrontFees);
    _requireNonNegative('stampDutyRatePercent', input.stampDutyRatePercent);

    final monthlyInstallment = switch (input.interestMethod) {
      PersonalLoanInterestMethod.reducingBalance =>
        calculateReducingBalanceMonthlyPayment(
          principal: input.principal,
          annualInterestRatePercent: input.annualInterestRatePercent,
          tenureYears: input.tenureYears,
        ),
      PersonalLoanInterestMethod.flatRate => _flatRateMonthlyPayment(
        principal: input.principal,
        annualFlatRatePercent: input.annualInterestRatePercent,
        tenureYears: input.tenureYears,
      ),
    };
    final yearlyPlan = switch (input.interestMethod) {
      PersonalLoanInterestMethod.reducingBalance => buildReducingBalancePlan(
        principal: input.principal,
        annualInterestRatePercent: input.annualInterestRatePercent,
        tenureYears: input.tenureYears,
      ),
      PersonalLoanInterestMethod.flatRate => _buildFlatRatePlan(
        principal: input.principal,
        totalInterest:
            input.principal *
            input.annualInterestRatePercent /
            100 *
            input.tenureYears,
        monthlyPayment: monthlyInstallment,
      ),
    };
    final totalRepayment = yearlyPlan.fold(
      0.0,
      (sum, year) => sum + year.payment,
    );
    final stampDutyEstimate =
        input.principal * input.stampDutyRatePercent / 100;
    final effectiveAnnualRatePercent =
        input.interestMethod == PersonalLoanInterestMethod.reducingBalance
        ? input.annualInterestRatePercent
        : _effectiveAnnualRateFromPayment(
            principal: input.principal,
            monthlyPayment: monthlyInstallment,
            months: input.tenureYears * 12,
          );

    return PersonalLoanResult(
      interestMethod: input.interestMethod,
      principal: input.principal,
      monthlyInstallment: monthlyInstallment,
      totalInterest: totalRepayment - input.principal,
      totalRepayment: totalRepayment,
      upfrontFees: input.upfrontFees,
      stampDutyEstimate: stampDutyEstimate,
      effectiveAnnualRatePercent: effectiveAnnualRatePercent,
      yearlyRepaymentPlan: yearlyPlan,
    );
  }

  CreditCardPayoffResult calculateCreditCardPayoff(
    CreditCardPayoffInput input,
  ) {
    _requirePositive('outstandingBalance', input.outstandingBalance);
    _requireNonNegative(
      'annualFinanceChargePercent',
      input.annualFinanceChargePercent,
    );
    _requirePositive('monthlyPayment', input.monthlyPayment);
    _requireNonNegative('monthlyNewSpending', input.monthlyNewSpending);
    _requireNonNegative('minimumPaymentPercent', input.minimumPaymentPercent);
    _requireNonNegative('minimumPaymentFloor', input.minimumPaymentFloor);
    _requirePositiveInt('maximumMonths', input.maximumMonths);

    final monthlyRate = input.annualFinanceChargePercent / 100 / 12;
    final firstMinimumPayment = _minimumCardPayment(
      input.outstandingBalance,
      input.minimumPaymentPercent,
      input.minimumPaymentFloor,
    );
    final fixedPayment = _simulateCardPayoff(
      outstandingBalance: input.outstandingBalance,
      monthlyRate: monthlyRate,
      monthlyNewSpending: input.monthlyNewSpending,
      maximumMonths: input.maximumMonths,
      fixedMonthlyPayment: input.monthlyPayment,
      minimumPaymentPercent: input.minimumPaymentPercent,
      minimumPaymentFloor: input.minimumPaymentFloor,
      minimumOnly: false,
      collectPreview: true,
    );
    final minimumOnly = _simulateCardPayoff(
      outstandingBalance: input.outstandingBalance,
      monthlyRate: monthlyRate,
      monthlyNewSpending: input.monthlyNewSpending,
      maximumMonths: input.maximumMonths,
      fixedMonthlyPayment: 0,
      minimumPaymentPercent: input.minimumPaymentPercent,
      minimumPaymentFloor: input.minimumPaymentFloor,
      minimumOnly: true,
      collectPreview: false,
    );

    return CreditCardPayoffResult(
      isPaidOff: fixedPayment.isPaidOff,
      monthsToPayoff: fixedPayment.months,
      totalInterest: fixedPayment.totalInterest,
      totalPaid: fixedPayment.totalPaid,
      remainingBalance: fixedPayment.remainingBalance,
      firstMinimumPayment: firstMinimumPayment,
      isBelowFirstMinimumPayment:
          input.monthlyPayment + 0.005 < firstMinimumPayment,
      minimumOnlyIsPaidOff: minimumOnly.isPaidOff,
      minimumOnlyMonthsToPayoff: minimumOnly.months,
      minimumOnlyTotalInterest: minimumOnly.totalInterest,
      minimumOnlyTotalPaid: minimumOnly.totalPaid,
      minimumOnlyRemainingBalance: minimumOnly.remainingBalance,
      monthlyPlan: fixedPayment.monthlyPlan,
    );
  }

  PtptnLoanResult calculatePtptnLoan(PtptnLoanInput input) {
    _requirePositive('outstandingBalance', input.outstandingBalance);
    _requireNonNegative('annualUjrahRatePercent', input.annualUjrahRatePercent);
    _requirePositiveInt('tenureYears', input.tenureYears);
    _requireNonNegative('extraMonthlyPayment', input.extraMonthlyPayment);

    if (input.serviceChargeMethod == PtptnServiceChargeMethod.flatRate) {
      final totalServiceCharge =
          input.outstandingBalance *
          input.annualUjrahRatePercent /
          100 *
          input.tenureYears;
      final totalRepayment = input.outstandingBalance + totalServiceCharge;
      final scheduledMonthlyPayment = totalRepayment / (input.tenureYears * 12);
      final plannedMonthlyPayment =
          scheduledMonthlyPayment + input.extraMonthlyPayment;
      final payoffMonths = (totalRepayment / plannedMonthlyPayment).ceil();
      final finalPayment =
          totalRepayment - (plannedMonthlyPayment * (payoffMonths - 1));

      return PtptnLoanResult(
        serviceChargeMethod: input.serviceChargeMethod,
        outstandingBalance: input.outstandingBalance,
        scheduledMonthlyPayment: scheduledMonthlyPayment,
        plannedMonthlyPayment: plannedMonthlyPayment,
        totalServiceCharge: totalServiceCharge,
        totalRepayment: totalRepayment,
        payoffMonths: payoffMonths,
        finalPayment: finalPayment,
        yearlyRepaymentPlan: _buildFlatRatePlan(
          principal: input.outstandingBalance,
          totalInterest: totalServiceCharge,
          monthlyPayment: plannedMonthlyPayment,
        ),
      );
    }

    final scheduledMonthlyPayment = calculateReducingBalanceMonthlyPayment(
      principal: input.outstandingBalance,
      annualInterestRatePercent: input.annualUjrahRatePercent,
      tenureYears: input.tenureYears,
    );
    final plannedMonthlyPayment =
        scheduledMonthlyPayment + input.extraMonthlyPayment;
    final repaymentPlan = _buildReducingBalancePlanWithPayment(
      principal: input.outstandingBalance,
      annualInterestRatePercent: input.annualUjrahRatePercent,
      monthlyPayment: plannedMonthlyPayment,
      maximumMonths: input.tenureYears * 12,
    );

    return PtptnLoanResult(
      serviceChargeMethod: input.serviceChargeMethod,
      outstandingBalance: input.outstandingBalance,
      scheduledMonthlyPayment: scheduledMonthlyPayment,
      plannedMonthlyPayment: plannedMonthlyPayment,
      totalServiceCharge: repaymentPlan.totalInterest,
      totalRepayment: repaymentPlan.totalPaid,
      payoffMonths: repaymentPlan.months,
      finalPayment: repaymentPlan.finalPayment,
      yearlyRepaymentPlan: repaymentPlan.yearlyPlan,
    );
  }

  double calculateReducingBalanceMonthlyPayment({
    required double principal,
    required double annualInterestRatePercent,
    required int tenureYears,
  }) {
    _requirePositive('principal', principal);
    _requireNonNegative('annualInterestRatePercent', annualInterestRatePercent);
    _requirePositiveInt('tenureYears', tenureYears);

    final months = tenureYears * 12;
    final monthlyRate = annualInterestRatePercent / 100 / 12;

    if (monthlyRate == 0) {
      return principal / months;
    }

    final compound = math.pow(1 + monthlyRate, months).toDouble();
    return principal * monthlyRate * compound / (compound - 1);
  }

  List<LoanYearSummary> buildReducingBalancePlan({
    required double principal,
    required double annualInterestRatePercent,
    required int tenureYears,
  }) {
    final monthlyPayment = calculateReducingBalanceMonthlyPayment(
      principal: principal,
      annualInterestRatePercent: annualInterestRatePercent,
      tenureYears: tenureYears,
    );
    final monthlyRate = annualInterestRatePercent / 100 / 12;
    final totalMonths = tenureYears * 12;
    final yearly = <LoanYearSummary>[];

    var balance = principal;
    var yearPayment = 0.0;
    var yearPrincipal = 0.0;
    var yearInterest = 0.0;

    for (var month = 1; month <= totalMonths; month += 1) {
      final interest = balance * monthlyRate;
      final scheduledPrincipal = monthlyPayment - interest;
      final principalPaid = math.min(scheduledPrincipal, balance);
      final payment = principalPaid + interest;

      balance = math.max(0, balance - principalPaid);
      yearPayment += payment;
      yearPrincipal += principalPaid;
      yearInterest += interest;

      if (month % 12 == 0 || month == totalMonths) {
        yearly.add(
          LoanYearSummary(
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

    return List.unmodifiable(yearly);
  }

  List<LoanYearSummary> _buildFlatRatePlan({
    required double principal,
    required double totalInterest,
    required double monthlyPayment,
  }) {
    final totalRepayment = principal + totalInterest;
    final totalMonths = (totalRepayment / monthlyPayment).ceil();
    final principalRatio = totalRepayment == 0 ? 0 : principal / totalRepayment;
    final interestRatio = totalRepayment == 0
        ? 0
        : totalInterest / totalRepayment;
    final yearly = <LoanYearSummary>[];

    var remaining = totalRepayment;
    var yearPayment = 0.0;
    var yearPrincipal = 0.0;
    var yearInterest = 0.0;

    for (var month = 1; month <= totalMonths; month += 1) {
      final payment = math.min(monthlyPayment, remaining);
      remaining = math.max(0, remaining - payment);
      yearPayment += payment;
      yearPrincipal += payment * principalRatio;
      yearInterest += payment * interestRatio;

      if (month % 12 == 0 || month == totalMonths) {
        yearly.add(
          LoanYearSummary(
            year: (month / 12).ceil(),
            payment: yearPayment,
            principalPaid: yearPrincipal,
            interestPaid: yearInterest,
            endingBalance: remaining,
          ),
        );
        yearPayment = 0;
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    return List.unmodifiable(yearly);
  }

  double _flatRateMonthlyPayment({
    required double principal,
    required double annualFlatRatePercent,
    required int tenureYears,
  }) {
    final totalInterest = principal * annualFlatRatePercent / 100 * tenureYears;
    return (principal + totalInterest) / (tenureYears * 12);
  }

  double _effectiveAnnualRateFromPayment({
    required double principal,
    required double monthlyPayment,
    required int months,
  }) {
    if (monthlyPayment * months <= principal) {
      return 0;
    }

    var low = 0.0;
    var high = 1.0;

    for (var i = 0; i < 80; i += 1) {
      final mid = (low + high) / 2;
      final compound = math.pow(1 + mid, months).toDouble();
      final estimatedPayment = principal * mid * compound / (compound - 1);
      if (estimatedPayment > monthlyPayment) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return ((low + high) / 2) * 12 * 100;
  }

  ({
    bool isPaidOff,
    int months,
    double totalInterest,
    double totalPaid,
    double remainingBalance,
    List<CreditCardMonthSummary> monthlyPlan,
  })
  _simulateCardPayoff({
    required double outstandingBalance,
    required double monthlyRate,
    required double monthlyNewSpending,
    required int maximumMonths,
    required double fixedMonthlyPayment,
    required double minimumPaymentPercent,
    required double minimumPaymentFloor,
    required bool minimumOnly,
    required bool collectPreview,
  }) {
    var balance = outstandingBalance;
    var totalInterest = 0.0;
    var totalPaid = 0.0;
    final monthlyPlan = <CreditCardMonthSummary>[];

    for (var month = 1; month <= maximumMonths; month += 1) {
      final interest = balance * monthlyRate;
      balance += interest + monthlyNewSpending;
      final targetPayment = minimumOnly
          ? _minimumCardPayment(
              balance,
              minimumPaymentPercent,
              minimumPaymentFloor,
            )
          : fixedMonthlyPayment;
      final payment = math.min(targetPayment, balance);
      balance -= payment;
      totalInterest += interest;
      totalPaid += payment;

      if (collectPreview && monthlyPlan.length < 12) {
        monthlyPlan.add(
          CreditCardMonthSummary(
            month: month,
            interest: interest,
            spending: monthlyNewSpending,
            payment: payment,
            endingBalance: balance,
          ),
        );
      }

      if (balance <= 0.01) {
        return (
          isPaidOff: true,
          months: month,
          totalInterest: totalInterest,
          totalPaid: totalPaid,
          remainingBalance: 0,
          monthlyPlan: List.unmodifiable(monthlyPlan),
        );
      }
    }

    return (
      isPaidOff: false,
      months: maximumMonths,
      totalInterest: totalInterest,
      totalPaid: totalPaid,
      remainingBalance: balance,
      monthlyPlan: List.unmodifiable(monthlyPlan),
    );
  }

  ({
    int months,
    double totalInterest,
    double totalPaid,
    double finalPayment,
    List<LoanYearSummary> yearlyPlan,
  })
  _buildReducingBalancePlanWithPayment({
    required double principal,
    required double annualInterestRatePercent,
    required double monthlyPayment,
    required int maximumMonths,
  }) {
    final monthlyRate = annualInterestRatePercent / 100 / 12;
    final yearly = <LoanYearSummary>[];

    var balance = principal;
    var totalInterest = 0.0;
    var totalPaid = 0.0;
    var finalPayment = 0.0;
    var yearPayment = 0.0;
    var yearPrincipal = 0.0;
    var yearInterest = 0.0;

    for (var month = 1; month <= maximumMonths; month += 1) {
      final interest = balance * monthlyRate;
      final payment = math.min(monthlyPayment, balance + interest);
      final principalPaid = math.max(0.0, payment - interest);

      balance = math.max(0, balance + interest - payment);
      totalInterest += interest;
      totalPaid += payment;
      finalPayment = payment;
      yearPayment += payment;
      yearPrincipal += principalPaid;
      yearInterest += interest;

      if (month % 12 == 0 || balance <= 0.01 || month == maximumMonths) {
        yearly.add(
          LoanYearSummary(
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

      if (balance <= 0.01) {
        return (
          months: month,
          totalInterest: totalInterest,
          totalPaid: totalPaid,
          finalPayment: finalPayment,
          yearlyPlan: List.unmodifiable(yearly),
        );
      }
    }

    return (
      months: maximumMonths,
      totalInterest: totalInterest,
      totalPaid: totalPaid,
      finalPayment: finalPayment,
      yearlyPlan: List.unmodifiable(yearly),
    );
  }

  double _minimumCardPayment(
    double balance,
    double minimumPaymentPercent,
    double minimumPaymentFloor,
  ) {
    return math.min(
      balance,
      math.max(balance * minimumPaymentPercent / 100, minimumPaymentFloor),
    );
  }
}

void _requirePositive(String name, double value) {
  if (value <= 0) {
    throw ArgumentError.value(value, name, 'must be positive');
  }
}

void _requireNonNegative(String name, double value) {
  if (value < 0) {
    throw ArgumentError.value(value, name, 'must not be negative');
  }
}

void _requirePositiveInt(String name, int value) {
  if (value <= 0) {
    throw ArgumentError.value(value, name, 'must be positive');
  }
}

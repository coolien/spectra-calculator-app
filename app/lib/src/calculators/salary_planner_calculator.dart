import 'dart:math' as math;

enum CashflowFitStatus { comfortable, review, highPressure, unavailable }

class SalaryPlannerInput {
  const SalaryPlannerInput({
    required this.grossMonthlySalary,
    required this.epfEmployeeRatePercent,
    required this.socsoEmployeeRatePercent,
    required this.eisEmployeeRatePercent,
    required this.socialSecurityWageCeiling,
    required this.monthlyPcbTax,
    required this.existingMonthlyCommitments,
    required this.monthlyLivingExpenses,
    required this.targetSavingsPercent,
    required this.targetDsrPercent,
    required this.loanInstallmentToEvaluate,
    this.assetPrice = 0,
    this.expectedMonthlyIncome = 0,
    this.monthlyInvestmentExpenses = 0,
  });

  final double grossMonthlySalary;
  final double epfEmployeeRatePercent;
  final double socsoEmployeeRatePercent;
  final double eisEmployeeRatePercent;
  final double socialSecurityWageCeiling;
  final double monthlyPcbTax;
  final double existingMonthlyCommitments;
  final double monthlyLivingExpenses;
  final double targetSavingsPercent;
  final double targetDsrPercent;
  final double loanInstallmentToEvaluate;
  final double assetPrice;
  final double expectedMonthlyIncome;
  final double monthlyInvestmentExpenses;
}

class SalaryPlannerResult {
  const SalaryPlannerResult({
    required this.epfEmployeeContribution,
    required this.socsoEmployeeContribution,
    required this.eisEmployeeContribution,
    required this.monthlyPcbTax,
    required this.netMonthlyIncome,
    required this.targetMonthlySavings,
    required this.remainingBeforeNewLoan,
    required this.remainingAfterNewLoan,
    required this.remainingAfterSavingsTarget,
    required this.currentDsrPercent,
    required this.dsrAfterNewLoanPercent,
    required this.maxInstallmentByDsr,
    required this.maxInstallmentByCashflow,
    required this.recommendedMaxInstallment,
    required this.cashflowFitStatus,
    required this.monthlyInvestmentCashflow,
    required this.grossYieldPercent,
    required this.netYieldBeforeTaxPercent,
  });

  final double epfEmployeeContribution;
  final double socsoEmployeeContribution;
  final double eisEmployeeContribution;
  final double monthlyPcbTax;
  final double netMonthlyIncome;
  final double targetMonthlySavings;
  final double remainingBeforeNewLoan;
  final double remainingAfterNewLoan;
  final double remainingAfterSavingsTarget;
  final double currentDsrPercent;
  final double dsrAfterNewLoanPercent;
  final double maxInstallmentByDsr;
  final double maxInstallmentByCashflow;
  final double recommendedMaxInstallment;
  final CashflowFitStatus cashflowFitStatus;
  final double monthlyInvestmentCashflow;
  final double grossYieldPercent;
  final double netYieldBeforeTaxPercent;
}

class SalaryPlannerCalculator {
  const SalaryPlannerCalculator();

  SalaryPlannerResult calculate(SalaryPlannerInput input) {
    _requirePositive('grossMonthlySalary', input.grossMonthlySalary);
    _requireNonNegative('epfEmployeeRatePercent', input.epfEmployeeRatePercent);
    _requireNonNegative(
      'socsoEmployeeRatePercent',
      input.socsoEmployeeRatePercent,
    );
    _requireNonNegative('eisEmployeeRatePercent', input.eisEmployeeRatePercent);
    _requireNonNegative(
      'socialSecurityWageCeiling',
      input.socialSecurityWageCeiling,
    );
    _requireNonNegative('monthlyPcbTax', input.monthlyPcbTax);
    _requireNonNegative(
      'existingMonthlyCommitments',
      input.existingMonthlyCommitments,
    );
    _requireNonNegative('monthlyLivingExpenses', input.monthlyLivingExpenses);
    _requireNonNegative('targetSavingsPercent', input.targetSavingsPercent);
    _requireNonNegative('targetDsrPercent', input.targetDsrPercent);
    _requireNonNegative(
      'loanInstallmentToEvaluate',
      input.loanInstallmentToEvaluate,
    );
    _requireNonNegative('assetPrice', input.assetPrice);
    _requireNonNegative('expectedMonthlyIncome', input.expectedMonthlyIncome);
    _requireNonNegative(
      'monthlyInvestmentExpenses',
      input.monthlyInvestmentExpenses,
    );

    final socialSecurityBase = input.socialSecurityWageCeiling == 0
        ? input.grossMonthlySalary
        : math.min(input.grossMonthlySalary, input.socialSecurityWageCeiling);
    final epfEmployeeContribution =
        input.grossMonthlySalary * input.epfEmployeeRatePercent / 100;
    final socsoEmployeeContribution =
        socialSecurityBase * input.socsoEmployeeRatePercent / 100;
    final eisEmployeeContribution =
        socialSecurityBase * input.eisEmployeeRatePercent / 100;
    final netMonthlyIncome =
        input.grossMonthlySalary -
        epfEmployeeContribution -
        socsoEmployeeContribution -
        eisEmployeeContribution -
        input.monthlyPcbTax;
    final targetMonthlySavings =
        netMonthlyIncome * input.targetSavingsPercent / 100;
    final remainingBeforeNewLoan =
        netMonthlyIncome -
        input.existingMonthlyCommitments -
        input.monthlyLivingExpenses;
    final remainingAfterNewLoan =
        remainingBeforeNewLoan - input.loanInstallmentToEvaluate;
    final remainingAfterSavingsTarget =
        remainingAfterNewLoan - targetMonthlySavings;
    final currentDsrPercent =
        input.existingMonthlyCommitments / input.grossMonthlySalary * 100;
    final dsrAfterNewLoanPercent =
        (input.existingMonthlyCommitments + input.loanInstallmentToEvaluate) /
        input.grossMonthlySalary *
        100;
    final maxInstallmentByDsr = math.max(
      0.0,
      input.grossMonthlySalary * input.targetDsrPercent / 100 -
          input.existingMonthlyCommitments,
    );
    final maxInstallmentByCashflow = math.max(
      0.0,
      remainingBeforeNewLoan - targetMonthlySavings,
    );
    final recommendedMaxInstallment = math.min(
      maxInstallmentByDsr,
      maxInstallmentByCashflow,
    );
    final monthlyInvestmentCashflow =
        input.expectedMonthlyIncome -
        input.monthlyInvestmentExpenses -
        input.loanInstallmentToEvaluate;
    final grossYieldPercent = input.assetPrice == 0
        ? 0.0
        : input.expectedMonthlyIncome * 12 / input.assetPrice * 100;
    final netYieldBeforeTaxPercent = input.assetPrice == 0
        ? 0.0
        : (input.expectedMonthlyIncome - input.monthlyInvestmentExpenses) *
              12 /
              input.assetPrice *
              100;

    return SalaryPlannerResult(
      epfEmployeeContribution: epfEmployeeContribution,
      socsoEmployeeContribution: socsoEmployeeContribution,
      eisEmployeeContribution: eisEmployeeContribution,
      monthlyPcbTax: input.monthlyPcbTax,
      netMonthlyIncome: netMonthlyIncome,
      targetMonthlySavings: targetMonthlySavings,
      remainingBeforeNewLoan: remainingBeforeNewLoan,
      remainingAfterNewLoan: remainingAfterNewLoan,
      remainingAfterSavingsTarget: remainingAfterSavingsTarget,
      currentDsrPercent: currentDsrPercent,
      dsrAfterNewLoanPercent: dsrAfterNewLoanPercent,
      maxInstallmentByDsr: maxInstallmentByDsr,
      maxInstallmentByCashflow: maxInstallmentByCashflow,
      recommendedMaxInstallment: recommendedMaxInstallment,
      cashflowFitStatus: _cashflowFitStatus(
        loanInstallment: input.loanInstallmentToEvaluate,
        recommendedMaxInstallment: recommendedMaxInstallment,
        dsrAfterNewLoanPercent: dsrAfterNewLoanPercent,
        targetDsrPercent: input.targetDsrPercent,
        remainingAfterSavingsTarget: remainingAfterSavingsTarget,
      ),
      monthlyInvestmentCashflow: monthlyInvestmentCashflow,
      grossYieldPercent: grossYieldPercent,
      netYieldBeforeTaxPercent: netYieldBeforeTaxPercent,
    );
  }

  CashflowFitStatus _cashflowFitStatus({
    required double loanInstallment,
    required double recommendedMaxInstallment,
    required double dsrAfterNewLoanPercent,
    required double targetDsrPercent,
    required double remainingAfterSavingsTarget,
  }) {
    if (loanInstallment == 0 || targetDsrPercent == 0) {
      return CashflowFitStatus.unavailable;
    }

    if (loanInstallment <= recommendedMaxInstallment &&
        dsrAfterNewLoanPercent <= targetDsrPercent &&
        remainingAfterSavingsTarget >= 0) {
      return CashflowFitStatus.comfortable;
    }

    if (loanInstallment <= recommendedMaxInstallment * 1.15 ||
        dsrAfterNewLoanPercent <= targetDsrPercent + 5) {
      return CashflowFitStatus.review;
    }

    return CashflowFitStatus.highPressure;
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

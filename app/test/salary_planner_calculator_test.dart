import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/calculators/salary_planner_calculator.dart';

void main() {
  const calculator = SalaryPlannerCalculator();

  test('estimates take-home pay after editable statutory deductions', () {
    final result = calculator.calculate(
      const SalaryPlannerInput(
        grossMonthlySalary: 5000,
        epfEmployeeRatePercent: 11,
        socsoEmployeeRatePercent: 0.5,
        eisEmployeeRatePercent: 0.2,
        socialSecurityWageCeiling: 6000,
        monthlyPcbTax: 100,
        existingMonthlyCommitments: 500,
        monthlyLivingExpenses: 2000,
        targetSavingsPercent: 10,
        targetDsrPercent: 40,
        loanInstallmentToEvaluate: 1000,
      ),
    );

    expect(result.epfEmployeeContribution, 550);
    expect(result.socsoEmployeeContribution, 25);
    expect(result.eisEmployeeContribution, 10);
    expect(result.netMonthlyIncome, 4315);
    expect(result.remainingAfterNewLoan, 815);
    expect(result.dsrAfterNewLoanPercent, 30);
    expect(result.cashflowFitStatus, CashflowFitStatus.comfortable);
  });

  test('applies SOCSO and EIS wage ceiling', () {
    final result = calculator.calculate(
      const SalaryPlannerInput(
        grossMonthlySalary: 10000,
        epfEmployeeRatePercent: 11,
        socsoEmployeeRatePercent: 0.5,
        eisEmployeeRatePercent: 0.2,
        socialSecurityWageCeiling: 6000,
        monthlyPcbTax: 0,
        existingMonthlyCommitments: 0,
        monthlyLivingExpenses: 0,
        targetSavingsPercent: 0,
        targetDsrPercent: 40,
        loanInstallmentToEvaluate: 0,
      ),
    );

    expect(result.socsoEmployeeContribution, 30);
    expect(result.eisEmployeeContribution, 12);
  });

  test('flags high pressure when loan exceeds DSR and cashflow room', () {
    final result = calculator.calculate(
      const SalaryPlannerInput(
        grossMonthlySalary: 4000,
        epfEmployeeRatePercent: 11,
        socsoEmployeeRatePercent: 0.5,
        eisEmployeeRatePercent: 0.2,
        socialSecurityWageCeiling: 6000,
        monthlyPcbTax: 0,
        existingMonthlyCommitments: 800,
        monthlyLivingExpenses: 1800,
        targetSavingsPercent: 10,
        targetDsrPercent: 40,
        loanInstallmentToEvaluate: 1600,
      ),
    );

    expect(result.cashflowFitStatus, CashflowFitStatus.highPressure);
    expect(result.remainingAfterSavingsTarget, lessThan(0));
  });

  test('calculates optional investment cashflow and yields', () {
    final result = calculator.calculate(
      const SalaryPlannerInput(
        grossMonthlySalary: 8000,
        epfEmployeeRatePercent: 11,
        socsoEmployeeRatePercent: 0.5,
        eisEmployeeRatePercent: 0.2,
        socialSecurityWageCeiling: 6000,
        monthlyPcbTax: 0,
        existingMonthlyCommitments: 0,
        monthlyLivingExpenses: 2500,
        targetSavingsPercent: 10,
        targetDsrPercent: 40,
        loanInstallmentToEvaluate: 1800,
        assetPrice: 500000,
        expectedMonthlyIncome: 2200,
        monthlyInvestmentExpenses: 300,
      ),
    );

    expect(result.monthlyInvestmentCashflow, 100);
    expect(result.grossYieldPercent, closeTo(5.28, 0.01));
    expect(result.netYieldBeforeTaxPercent, closeTo(4.56, 0.01));
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/calculators/consumer_loan_calculators.dart';

void main() {
  const calculator = MalaysiaConsumerLoanCalculator();

  test('calculates car hire purchase using flat-rate interest', () {
    final result = calculator.calculateCarLoan(
      const CarLoanInput(
        vehiclePrice: 90000,
        downPaymentPercent: 10,
        annualFlatRatePercent: 3,
        tenureYears: 7,
      ),
    );

    expect(result.downPaymentAmount, 9000);
    expect(result.amountFinanced, 81000);
    expect(result.totalInterest, 17010);
    expect(result.totalRepayment, 98010);
    expect(result.monthlyInstallment, closeTo(1166.79, 0.01));
    expect(result.effectiveAnnualRatePercent, closeTo(5.57, 0.01));
  });

  test('calculates personal loan with reducing-balance amortization', () {
    final result = calculator.calculatePersonalLoan(
      const PersonalLoanInput(
        principal: 10000,
        annualInterestRatePercent: 12,
        tenureYears: 1,
      ),
    );

    expect(result.monthlyInstallment, closeTo(888.49, 0.01));
    expect(result.totalInterest, closeTo(661.85, 0.05));
    expect(result.stampDutyEstimate, 50);
    expect(result.totalCost, closeTo(711.85, 0.05));
    expect(result.yearlyRepaymentPlan.single.endingBalance, closeTo(0, 0.01));
  });

  test('calculates personal loan with flat-rate method', () {
    final result = calculator.calculatePersonalLoan(
      const PersonalLoanInput(
        principal: 10000,
        annualInterestRatePercent: 8,
        tenureYears: 5,
        interestMethod: PersonalLoanInterestMethod.flatRate,
        stampDutyRatePercent: 0.5,
      ),
    );

    expect(result.monthlyInstallment, closeTo(233.33, 0.01));
    expect(result.totalInterest, closeTo(4000, 0.01));
    expect(result.effectiveAnnualRatePercent, closeTo(14.13, 0.01));
  });

  test('calculates credit card payoff at zero finance charge', () {
    final result = calculator.calculateCreditCardPayoff(
      const CreditCardPayoffInput(
        outstandingBalance: 1000,
        annualFinanceChargePercent: 0,
        monthlyPayment: 200,
      ),
    );

    expect(result.isPaidOff, isTrue);
    expect(result.monthsToPayoff, 5);
    expect(result.totalInterest, 0);
    expect(result.totalPaid, 1000);
    expect(result.firstMinimumPayment, 50);
    expect(result.minimumOnlyIsPaidOff, isTrue);
  });

  test('flags credit card payment below editable minimum assumption', () {
    final result = calculator.calculateCreditCardPayoff(
      const CreditCardPayoffInput(
        outstandingBalance: 5000,
        annualFinanceChargePercent: 18,
        monthlyPayment: 100,
        minimumPaymentPercent: 5,
        minimumPaymentFloor: 50,
      ),
    );

    expect(result.firstMinimumPayment, 250);
    expect(result.isBelowFirstMinimumPayment, isTrue);
  });

  test('calculates PTPTN reducing-balance Ujrah planning estimate', () {
    final result = calculator.calculatePtptnLoan(
      const PtptnLoanInput(
        outstandingBalance: 30000,
        annualUjrahRatePercent: 1,
        tenureYears: 10,
        extraMonthlyPayment: 25,
      ),
    );

    expect(
      result.serviceChargeMethod,
      PtptnServiceChargeMethod.reducingBalance,
    );
    expect(result.totalServiceCharge, closeTo(1396.75, 0.1));
    expect(result.scheduledMonthlyPayment, closeTo(262.81, 0.01));
    expect(result.plannedMonthlyPayment, closeTo(287.81, 0.01));
    expect(result.payoffMonths, 110);
  });

  test('calculates PTPTN flat-rate Ujrah planning estimate when selected', () {
    final result = calculator.calculatePtptnLoan(
      const PtptnLoanInput(
        outstandingBalance: 30000,
        annualUjrahRatePercent: 1,
        tenureYears: 10,
        extraMonthlyPayment: 25,
        serviceChargeMethod: PtptnServiceChargeMethod.flatRate,
      ),
    );

    expect(result.totalServiceCharge, 3000);
    expect(result.totalRepayment, 33000);
    expect(result.scheduledMonthlyPayment, 275);
    expect(result.plannedMonthlyPayment, 300);
    expect(result.payoffMonths, 110);
  });
}

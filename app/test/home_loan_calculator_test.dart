import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/calculators/home_loan_calculator.dart';

void main() {
  final calculator = HomeLoanCalculator(rules: MalaysiaHomeLoanRules.current);

  group('HomeLoanCalculator', () {
    test('calculates reducing-balance monthly installment', () {
      final payment = calculator.calculateMonthlyInstallment(
        principal: 450000,
        annualInterestRatePercent: 4,
        tenureYears: 35,
      );

      expect(roundToCents(payment), 1992.49);
    });

    test('builds yearly amortization summary', () {
      final amortization = calculator.buildYearlyAmortization(
        principal: 450000,
        annualInterestRatePercent: 4,
        tenureYears: 35,
      );

      expect(amortization, hasLength(35));
      expect(roundToCents(amortization.first.payment), 23909.84);
      expect(
        roundToCents(amortization.first.principalPaid),
        closeTo(6019.36, 0.05),
      );
      expect(
        roundToCents(amortization.first.interestPaid),
        closeTo(17890.47, 0.05),
      );
      expect(roundToCents(amortization.last.endingBalance), 0);
    });

    test('calculates Malaysia stamp duty without first-home exemption', () {
      final stampDuty = calculator.calculateStampDuty(
        HomeLoanInput(
          propertyPrice: 650000,
          downPaymentPercent: 10,
          annualInterestRatePercent: 4,
          tenureYears: 35,
          spaDate: DateTime(2026, 6, 30),
        ),
      );

      expect(stampDuty.firstHomeExemptionApplied, isFalse);
      expect(stampDuty.transferDuty, 13500);
      expect(stampDuty.loanAgreementDuty, 2925);
      expect(stampDuty.total, 16425);
    });

    test(
      'applies first residential home exemption within current rule window',
      () {
        final stampDuty = calculator.calculateStampDuty(
          HomeLoanInput(
            propertyPrice: 500000,
            downPaymentPercent: 10,
            annualInterestRatePercent: 4,
            tenureYears: 35,
            spaDate: DateTime(2026, 6, 30),
            isFirstResidentialHome: true,
          ),
        );

        expect(stampDuty.firstHomeExemptionApplied, isTrue);
        expect(stampDuty.transferDuty, 0);
        expect(stampDuty.loanAgreementDuty, 0);
        expect(stampDuty.transferDutyBeforeExemption, 9000);
        expect(stampDuty.loanAgreementDutyBeforeExemption, 2250);
        expect(stampDuty.totalExemption, 11250);
      },
    );

    test(
      'uses 8 percent residential transfer duty for foreign buyers in 2026',
      () {
        final stampDuty = calculator.calculateStampDuty(
          HomeLoanInput(
            propertyPrice: 1000000,
            downPaymentPercent: 20,
            annualInterestRatePercent: 4,
            tenureYears: 30,
            spaDate: DateTime(2026, 1, 1),
            buyerType: MalaysiaBuyerType.foreignIndividual,
          ),
        );

        expect(stampDuty.transferDuty, 80000);
        expect(stampDuty.loanAgreementDuty, 4000);
      },
    );

    test('sums upfront cash needed from down payment and statutory costs', () {
      final input = HomeLoanInput(
        propertyPrice: 650000,
        downPaymentPercent: 10,
        annualInterestRatePercent: 4,
        tenureYears: 35,
        spaDate: DateTime(2026, 6, 30),
        extraUpfrontCosts: const [
          UpfrontCostItem(
            label: 'Disbursement buffer',
            amount: 1500,
            category: UpfrontCostCategory.professional,
          ),
        ],
      );

      final result = calculator.calculate(input);

      expect(result.upfrontCosts.total, 82925);
      expect(
        result.upfrontCosts.totalForCategory(UpfrontCostCategory.statutory),
        16425,
      );
      expect(
        result.upfrontCosts.totalForCategory(
          UpfrontCostCategory.cashBeforeLoan,
        ),
        65000,
      );
    });

    test(
      'estimates subsale professional fees from current fee assumptions',
      () {
        final estimate = calculator.estimateProfessionalFees(
          propertyPrice: 500000,
          loanAmount: 450000,
          purchaseType: HomePurchaseType.subsale,
        );

        expect(estimate.spaLegalFee, 6250);
        expect(estimate.loanLegalFee, 5625);
        expect(estimate.valuationFee, 1050);
        expect(estimate.serviceTax, 1034);
        expect(estimate.total, 13959);
      },
    );

    test('applies HDA new project legal fee discounts', () {
      final estimate = calculator.estimateProfessionalFees(
        propertyPrice: 500000,
        loanAmount: 450000,
        purchaseType: HomePurchaseType.hdaNewProject,
      );

      expect(estimate.spaLegalFee, 4375);
      expect(estimate.loanLegalFee, closeTo(3937.5, 0.01));
      expect(estimate.valuationFee, 1050);
      expect(estimate.serviceTax, closeTo(749, 0.01));
    });

    test('applies minimum valuation fee for lower property values', () {
      expect(calculator.calculateValuationFee(100000), 400);
    });

    test('calculates affordability guidance and tenure options', () {
      final currentInstallment = calculator.calculateMonthlyInstallment(
        principal: 450000,
        annualInterestRatePercent: 4,
        tenureYears: 35,
      );
      final affordability = calculator.calculateAffordability(
        AffordabilityInput(
          monthlyIncome: 6000,
          existingMonthlyCommitments: 1000,
          targetDsrPercent: 40,
          loanAmount: 450000,
          annualInterestRatePercent: 4,
          currentMonthlyInstallment: currentInstallment,
        ),
      );

      expect(affordability, isNotNull);
      expect(affordability!.maximumTargetInstallment, 1400);
      expect(roundToCents(affordability.currentDsrPercent), 49.87);
      expect(affordability.status, AffordabilityStatus.nearTarget);
      expect(affordability.tenureOptions, hasLength(4));
      expect(
        affordability.tenureOptions.first.status,
        AffordabilityStatus.aboveTarget,
      );
      expect(
        affordability.tenureOptions.last.status,
        AffordabilityStatus.nearTarget,
      );
    });

    test('skips affordability when income is not provided', () {
      final affordability = calculator.calculateAffordability(
        const AffordabilityInput(
          monthlyIncome: 0,
          existingMonthlyCommitments: 0,
          targetDsrPercent: 40,
          loanAmount: 450000,
          annualInterestRatePercent: 4,
          currentMonthlyInstallment: 1992.49,
        ),
      );

      expect(affordability, isNull);
    });
  });
}

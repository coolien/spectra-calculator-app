import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/ongoing_loans.dart';

void main() {
  group('OngoingLoanRepository', () {
    test('saves newest ongoing loans first', () async {
      final repository = OngoingLoanRepository(
        storage: MemoryOngoingLoanStorage(),
      );

      await repository.save(_loan(id: 'old', createdAt: DateTime(2026)));
      await repository.save(_loan(id: 'new', createdAt: DateTime(2026, 1, 2)));

      final loans = await repository.loadAll();

      expect(loans.map((loan) => loan.id), ['new', 'old']);
      expect(loans.first.annualRatePercent, 4.2);
    });

    test('replaces an ongoing loan with matching id', () async {
      final repository = OngoingLoanRepository(
        storage: MemoryOngoingLoanStorage(),
      );

      await repository.save(_loan(id: 'same', name: 'Old'));
      await repository.save(_loan(id: 'same', name: 'New'));

      final loans = await repository.loadAll();

      expect(loans, hasLength(1));
      expect(loans.single.name, 'New');
    });

    test('deletes ongoing loans and skips corrupted entries', () async {
      final validLoan = _loan(id: 'valid');
      final repository = OngoingLoanRepository(
        storage: MemoryOngoingLoanStorage([
          'not-json',
          jsonEncode(validLoan.toJson()),
        ]),
      );

      expect(await repository.loadAll(), hasLength(1));

      await repository.delete('valid');

      expect(await repository.loadAll(), isEmpty);
    });

    test('projects actual loan payoff with annual rate', () {
      const calculator = OngoingLoanProjectionCalculator();
      final projection = calculator.calculate(
        _loan(id: 'projection', monthlyPayment: 1000, annualRatePercent: 6),
      );

      expect(projection.isPaidOff, isTrue);
      expect(projection.monthsProjected, greaterThan(30));
      expect(projection.totalFuturePayment, greaterThan(30000));
      expect(projection.totalFutureInterest, greaterThan(0));
      expect(projection.yearlyPlan.length, greaterThanOrEqualTo(3));
      expect(projection.yearlyPlan.last.endingBalance, 0);
    });

    test(
      'flags payment that does not clear balance within projection window',
      () {
        const calculator = OngoingLoanProjectionCalculator();
        final projection = calculator.calculate(
          _loan(id: 'slow', monthlyPayment: 100, annualRatePercent: 12),
          maximumMonths: 24,
        );

        expect(projection.isPaidOff, isFalse);
        expect(projection.endingBalance, greaterThan(30000));
      },
    );
  });
}

OngoingLoanCommitment _loan({
  required String id,
  String name = 'Loan',
  double monthlyPayment = 900,
  double annualRatePercent = 4.2,
  DateTime? createdAt,
}) {
  return OngoingLoanCommitment(
    id: id,
    name: name,
    type: OngoingLoanType.car,
    monthlyPayment: monthlyPayment,
    remainingBalance: 30000,
    annualRatePercent: annualRatePercent,
    createdAt: createdAt ?? DateTime(2026, 6, 30),
  );
}

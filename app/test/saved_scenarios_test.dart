import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/calculators/home_loan_calculator.dart';
import 'package:loancalculator/src/saved_scenarios.dart';

void main() {
  group('SavedScenarioRepository', () {
    test('saves newest scenarios first', () async {
      final repository = SavedScenarioRepository(
        storage: MemoryScenarioStorage(),
      );

      await repository.save(_scenario(id: 'old', createdAt: DateTime(2026)));
      await repository.save(
        _scenario(id: 'new', createdAt: DateTime(2026, 1, 2)),
      );

      final scenarios = await repository.loadAll();

      expect(scenarios.map((scenario) => scenario.id), ['new', 'old']);
    });

    test('replaces an existing scenario with matching id', () async {
      final repository = SavedScenarioRepository(
        storage: MemoryScenarioStorage(),
      );

      await repository.save(_scenario(id: 'same', name: 'Old name'));
      await repository.save(_scenario(id: 'same', name: 'Updated name'));

      final scenarios = await repository.loadAll();

      expect(scenarios, hasLength(1));
      expect(scenarios.single.name, 'Updated name');
    });

    test('deletes a saved scenario', () async {
      final repository = SavedScenarioRepository(
        storage: MemoryScenarioStorage(),
      );

      await repository.save(_scenario(id: 'keep'));
      await repository.save(_scenario(id: 'delete'));
      await repository.delete('delete');

      final scenarios = await repository.loadAll();

      expect(scenarios.map((scenario) => scenario.id), ['keep']);
    });

    test('skips corrupted local entries', () async {
      final scenario = _scenario(id: 'valid');
      final repository = SavedScenarioRepository(
        storage: MemoryScenarioStorage([
          'not-json',
          jsonEncode(scenario.toJson()),
        ]),
      );

      final scenarios = await repository.loadAll();

      expect(scenarios, hasLength(1));
      expect(scenarios.single.id, 'valid');
    });

    test('defaults older saved scenarios to conventional financing', () async {
      final json = _scenario(id: 'legacy').toJson()..remove('financingType');
      final repository = SavedScenarioRepository(
        storage: MemoryScenarioStorage([jsonEncode(json)]),
      );

      final scenarios = await repository.loadAll();

      expect(scenarios.single.financingType, HomeFinancingType.conventional);
    });
  });

  group('ConsumerScenarioRepository', () {
    test('saves and filters beta calculator scenarios by type', () async {
      final repository = ConsumerScenarioRepository(
        storage: MemoryScenarioStorage(),
      );

      await repository.save(
        _consumerScenario(
          id: 'car',
          type: SavedScenarioType.carLoan,
          createdAt: DateTime(2026, 1, 1),
        ),
      );
      await repository.save(
        _consumerScenario(
          id: 'ptptn',
          type: SavedScenarioType.ptptnLoan,
          createdAt: DateTime(2026, 1, 2),
        ),
      );

      final allScenarios = await repository.loadAll();
      final ptptnScenarios = await repository.loadAll(
        type: SavedScenarioType.ptptnLoan,
      );

      expect(allScenarios.map((scenario) => scenario.id), ['ptptn', 'car']);
      expect(ptptnScenarios, hasLength(1));
      expect(ptptnScenarios.single.type, SavedScenarioType.ptptnLoan);
    });

    test('replaces consumer scenarios with matching id', () async {
      final repository = ConsumerScenarioRepository(
        storage: MemoryScenarioStorage(),
      );

      await repository.save(_consumerScenario(id: 'same', name: 'Old'));
      await repository.save(_consumerScenario(id: 'same', name: 'New'));

      final scenarios = await repository.loadAll();

      expect(scenarios, hasLength(1));
      expect(scenarios.single.name, 'New');
    });

    test('skips corrupted consumer entries', () async {
      final scenario = _consumerScenario(id: 'valid');
      final repository = ConsumerScenarioRepository(
        storage: MemoryScenarioStorage([
          'not-json',
          jsonEncode(scenario.toJson()),
        ]),
      );

      final scenarios = await repository.loadAll();

      expect(scenarios, hasLength(1));
      expect(scenarios.single.id, 'valid');
    });
  });
}

HomeLoanScenario _scenario({
  required String id,
  String name = 'Scenario',
  DateTime? createdAt,
}) {
  return HomeLoanScenario(
    id: id,
    name: name,
    createdAt: createdAt ?? DateTime(2026, 6, 30, 12),
    propertyPrice: 500000,
    downPaymentPercent: 10,
    annualInterestRatePercent: 4,
    tenureYears: 35,
    spaDate: DateTime(2026, 6, 30),
    buyerType: MalaysiaBuyerType.citizen,
    purchaseType: HomePurchaseType.subsale,
    financingType: HomeFinancingType.conventional,
    isFirstResidentialHome: false,
    spaLegalFee: 6250,
    loanLegalFee: 5625,
    valuationFee: 1050,
    serviceTax: 1034,
    disbursementBuffer: 1500,
    monthlyInstallment: 1992.49,
    upfrontCash: 79959,
    totalInterest: 386844.26,
  );
}

ConsumerLoanScenario _consumerScenario({
  required String id,
  String name = 'Scenario',
  SavedScenarioType type = SavedScenarioType.carLoan,
  DateTime? createdAt,
}) {
  return ConsumerLoanScenario(
    id: id,
    name: name,
    createdAt: createdAt ?? DateTime(2026, 6, 30, 12),
    type: type,
    amount: 90000,
    downPaymentPercent: 10,
    annualRatePercent: 3,
    tenureYears: 7,
    resultMonthlyPayment: 1166.79,
    totalInterest: 17010,
    totalRepayment: 98010,
    upfrontCash: 9000,
  );
}

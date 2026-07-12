import 'dart:convert';

import 'package:loancalculator/src/calculators/home_loan_calculator.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum SavedScenarioType {
  homeLoan,
  carLoan,
  personalLoan,
  creditCard,
  ptptnLoan,
}

extension SavedScenarioTypeLabels on SavedScenarioType {
  String get label {
    return switch (this) {
      SavedScenarioType.homeLoan => 'Home Loan',
      SavedScenarioType.carLoan => 'Car Loan',
      SavedScenarioType.personalLoan => 'Personal Loan',
      SavedScenarioType.creditCard => 'Credit Card',
      SavedScenarioType.ptptnLoan => 'PTPTN Loan',
    };
  }
}

class HomeLoanScenario {
  const HomeLoanScenario({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.propertyPrice,
    required this.downPaymentPercent,
    required this.annualInterestRatePercent,
    required this.tenureYears,
    required this.spaDate,
    required this.buyerType,
    required this.purchaseType,
    required this.financingType,
    required this.isFirstResidentialHome,
    required this.spaLegalFee,
    required this.loanLegalFee,
    required this.valuationFee,
    required this.serviceTax,
    required this.disbursementBuffer,
    required this.monthlyInstallment,
    required this.upfrontCash,
    required this.totalInterest,
  });

  final String id;
  final String name;
  final DateTime createdAt;
  final double propertyPrice;
  final double downPaymentPercent;
  final double annualInterestRatePercent;
  final int tenureYears;
  final DateTime spaDate;
  final MalaysiaBuyerType buyerType;
  final HomePurchaseType purchaseType;
  final HomeFinancingType financingType;
  final bool isFirstResidentialHome;
  final double spaLegalFee;
  final double loanLegalFee;
  final double valuationFee;
  final double serviceTax;
  final double disbursementBuffer;
  final double monthlyInstallment;
  final double upfrontCash;
  final double totalInterest;

  double get downPaymentAmount => propertyPrice * downPaymentPercent / 100;

  double get loanAmount => propertyPrice - downPaymentAmount;

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'name': name,
      'createdAt': createdAt.toIso8601String(),
      'propertyPrice': propertyPrice,
      'downPaymentPercent': downPaymentPercent,
      'annualInterestRatePercent': annualInterestRatePercent,
      'tenureYears': tenureYears,
      'spaDate': spaDate.toIso8601String(),
      'buyerType': buyerType.name,
      'purchaseType': purchaseType.name,
      'financingType': financingType.name,
      'isFirstResidentialHome': isFirstResidentialHome,
      'spaLegalFee': spaLegalFee,
      'loanLegalFee': loanLegalFee,
      'valuationFee': valuationFee,
      'serviceTax': serviceTax,
      'disbursementBuffer': disbursementBuffer,
      'monthlyInstallment': monthlyInstallment,
      'upfrontCash': upfrontCash,
      'totalInterest': totalInterest,
    };
  }

  factory HomeLoanScenario.fromJson(Map<String, Object?> json) {
    return HomeLoanScenario(
      id: _readString(json, 'id'),
      name: _readString(json, 'name'),
      createdAt: DateTime.parse(_readString(json, 'createdAt')),
      propertyPrice: _readDouble(json, 'propertyPrice'),
      downPaymentPercent: _readDouble(json, 'downPaymentPercent'),
      annualInterestRatePercent: _readDouble(json, 'annualInterestRatePercent'),
      tenureYears: _readInt(json, 'tenureYears'),
      spaDate: DateTime.parse(_readString(json, 'spaDate')),
      buyerType: _enumByName(
        MalaysiaBuyerType.values,
        _readString(json, 'buyerType'),
        MalaysiaBuyerType.citizen,
      ),
      purchaseType: _enumByName(
        HomePurchaseType.values,
        _readString(json, 'purchaseType'),
        HomePurchaseType.subsale,
      ),
      financingType: _enumByName(
        HomeFinancingType.values,
        _readOptionalString(json, 'financingType'),
        HomeFinancingType.conventional,
      ),
      isFirstResidentialHome: json['isFirstResidentialHome'] == true,
      spaLegalFee: _readDouble(json, 'spaLegalFee'),
      loanLegalFee: _readDouble(json, 'loanLegalFee'),
      valuationFee: _readDouble(json, 'valuationFee'),
      serviceTax: _readDouble(json, 'serviceTax'),
      disbursementBuffer: _readDouble(json, 'disbursementBuffer'),
      monthlyInstallment: _readDouble(json, 'monthlyInstallment'),
      upfrontCash: _readDouble(json, 'upfrontCash'),
      totalInterest: _readDouble(json, 'totalInterest'),
    );
  }
}

class ConsumerLoanScenario {
  const ConsumerLoanScenario({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.type,
    this.amount = 0,
    this.downPaymentPercent = 0,
    this.annualRatePercent = 0,
    this.tenureYears = 0,
    this.upfrontFees = 0,
    this.monthlyPaymentInput = 0,
    this.monthlyNewSpending = 0,
    this.minimumPaymentPercent = 0,
    this.minimumPaymentFloor = 0,
    this.extraMonthlyPayment = 0,
    this.stampDutyRatePercent = 0,
    this.calculationMethod = '',
    this.baseMonthlyPayment = 0,
    this.resultMonthlyPayment = 0,
    this.totalInterest = 0,
    this.totalRepayment = 0,
    this.upfrontCash = 0,
    this.payoffMonths = 0,
    this.isPaidOff = false,
    this.remainingBalance = 0,
    this.finalPayment = 0,
  });

  final String id;
  final String name;
  final DateTime createdAt;
  final SavedScenarioType type;
  final double amount;
  final double downPaymentPercent;
  final double annualRatePercent;
  final int tenureYears;
  final double upfrontFees;
  final double monthlyPaymentInput;
  final double monthlyNewSpending;
  final double minimumPaymentPercent;
  final double minimumPaymentFloor;
  final double extraMonthlyPayment;
  final double stampDutyRatePercent;
  final String calculationMethod;
  final double baseMonthlyPayment;
  final double resultMonthlyPayment;
  final double totalInterest;
  final double totalRepayment;
  final double upfrontCash;
  final int payoffMonths;
  final bool isPaidOff;
  final double remainingBalance;
  final double finalPayment;

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'name': name,
      'createdAt': createdAt.toIso8601String(),
      'type': type.name,
      'amount': amount,
      'downPaymentPercent': downPaymentPercent,
      'annualRatePercent': annualRatePercent,
      'tenureYears': tenureYears,
      'upfrontFees': upfrontFees,
      'monthlyPaymentInput': monthlyPaymentInput,
      'monthlyNewSpending': monthlyNewSpending,
      'minimumPaymentPercent': minimumPaymentPercent,
      'minimumPaymentFloor': minimumPaymentFloor,
      'extraMonthlyPayment': extraMonthlyPayment,
      'stampDutyRatePercent': stampDutyRatePercent,
      'calculationMethod': calculationMethod,
      'baseMonthlyPayment': baseMonthlyPayment,
      'resultMonthlyPayment': resultMonthlyPayment,
      'totalInterest': totalInterest,
      'totalRepayment': totalRepayment,
      'upfrontCash': upfrontCash,
      'payoffMonths': payoffMonths,
      'isPaidOff': isPaidOff,
      'remainingBalance': remainingBalance,
      'finalPayment': finalPayment,
    };
  }

  factory ConsumerLoanScenario.fromJson(Map<String, Object?> json) {
    return ConsumerLoanScenario(
      id: _readString(json, 'id'),
      name: _readString(json, 'name'),
      createdAt: DateTime.parse(_readString(json, 'createdAt')),
      type: _enumByName(
        SavedScenarioType.values,
        _readString(json, 'type'),
        SavedScenarioType.carLoan,
      ),
      amount: _readOptionalDouble(json, 'amount'),
      downPaymentPercent: _readOptionalDouble(json, 'downPaymentPercent'),
      annualRatePercent: _readOptionalDouble(json, 'annualRatePercent'),
      tenureYears: _readOptionalInt(json, 'tenureYears'),
      upfrontFees: _readOptionalDouble(json, 'upfrontFees'),
      monthlyPaymentInput: _readOptionalDouble(json, 'monthlyPaymentInput'),
      monthlyNewSpending: _readOptionalDouble(json, 'monthlyNewSpending'),
      minimumPaymentPercent: _readOptionalDouble(json, 'minimumPaymentPercent'),
      minimumPaymentFloor: _readOptionalDouble(json, 'minimumPaymentFloor'),
      extraMonthlyPayment: _readOptionalDouble(json, 'extraMonthlyPayment'),
      stampDutyRatePercent: _readOptionalDouble(json, 'stampDutyRatePercent'),
      calculationMethod: _readOptionalString(json, 'calculationMethod'),
      baseMonthlyPayment: _readOptionalDouble(json, 'baseMonthlyPayment'),
      resultMonthlyPayment: _readOptionalDouble(json, 'resultMonthlyPayment'),
      totalInterest: _readOptionalDouble(json, 'totalInterest'),
      totalRepayment: _readOptionalDouble(json, 'totalRepayment'),
      upfrontCash: _readOptionalDouble(json, 'upfrontCash'),
      payoffMonths: _readOptionalInt(json, 'payoffMonths'),
      isPaidOff: json['isPaidOff'] == true,
      remainingBalance: _readOptionalDouble(json, 'remainingBalance'),
      finalPayment: _readOptionalDouble(json, 'finalPayment'),
    );
  }
}

abstract class ScenarioStorage {
  Future<List<String>> readScenarios();

  Future<void> writeScenarios(List<String> encodedScenarios);
}

class SharedPreferencesScenarioStorage implements ScenarioStorage {
  SharedPreferencesScenarioStorage({
    SharedPreferencesAsync? preferences,
    this.key = 'home_loan_scenarios_v1',
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _preferences;
  final String key;

  @override
  Future<List<String>> readScenarios() async {
    return await _preferences.getStringList(key) ?? const [];
  }

  @override
  Future<void> writeScenarios(List<String> encodedScenarios) {
    return _preferences.setStringList(key, encodedScenarios);
  }
}

class ConsumerScenarioStorage implements ScenarioStorage {
  ConsumerScenarioStorage({
    SharedPreferencesAsync? preferences,
    this.key = 'consumer_loan_scenarios_v1',
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _preferences;
  final String key;

  @override
  Future<List<String>> readScenarios() async {
    return await _preferences.getStringList(key) ?? const [];
  }

  @override
  Future<void> writeScenarios(List<String> encodedScenarios) {
    return _preferences.setStringList(key, encodedScenarios);
  }
}

class MemoryScenarioStorage implements ScenarioStorage {
  List<String> _encodedScenarios;

  MemoryScenarioStorage([List<String> initialScenarios = const []])
    : _encodedScenarios = List.of(initialScenarios);

  @override
  Future<List<String>> readScenarios() async => List.of(_encodedScenarios);

  @override
  Future<void> writeScenarios(List<String> encodedScenarios) async {
    _encodedScenarios = List.of(encodedScenarios);
  }
}

class ConsumerScenarioRepository {
  ConsumerScenarioRepository({ScenarioStorage? storage})
    : _storage = storage ?? ConsumerScenarioStorage();

  final ScenarioStorage _storage;

  Future<List<ConsumerLoanScenario>> loadAll({SavedScenarioType? type}) async {
    final encodedScenarios = await _storage.readScenarios();
    final scenarios = <ConsumerLoanScenario>[];

    for (final encodedScenario in encodedScenarios) {
      try {
        final json = jsonDecode(encodedScenario) as Map<String, Object?>;
        final scenario = ConsumerLoanScenario.fromJson(json);
        if (type == null || scenario.type == type) {
          scenarios.add(scenario);
        }
      } on Object {
        continue;
      }
    }

    scenarios.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return scenarios;
  }

  Future<void> save(ConsumerLoanScenario scenario) async {
    final scenarios = await loadAll();
    final updated = [
      scenario,
      for (final existing in scenarios)
        if (existing.id != scenario.id) existing,
    ];

    await _writeAll(updated);
  }

  Future<void> delete(String id) async {
    final scenarios = await loadAll();
    await _writeAll([
      for (final scenario in scenarios)
        if (scenario.id != id) scenario,
    ]);
  }

  Future<void> deleteAll() async {
    await _storage.writeScenarios(const []);
  }

  Future<void> _writeAll(List<ConsumerLoanScenario> scenarios) {
    return _storage.writeScenarios([
      for (final scenario in scenarios) jsonEncode(scenario.toJson()),
    ]);
  }
}

class SavedScenarioRepository {
  SavedScenarioRepository({ScenarioStorage? storage})
    : _storage = storage ?? SharedPreferencesScenarioStorage();

  final ScenarioStorage _storage;

  Future<List<HomeLoanScenario>> loadAll() async {
    final encodedScenarios = await _storage.readScenarios();
    final scenarios = <HomeLoanScenario>[];

    for (final encodedScenario in encodedScenarios) {
      try {
        final json = jsonDecode(encodedScenario) as Map<String, Object?>;
        scenarios.add(HomeLoanScenario.fromJson(json));
      } on Object {
        continue;
      }
    }

    scenarios.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return scenarios;
  }

  Future<void> save(HomeLoanScenario scenario) async {
    final scenarios = await loadAll();
    final updated = [
      scenario,
      for (final existing in scenarios)
        if (existing.id != scenario.id) existing,
    ];

    await _writeAll(updated);
  }

  Future<void> delete(String id) async {
    final scenarios = await loadAll();
    await _writeAll([
      for (final scenario in scenarios)
        if (scenario.id != id) scenario,
    ]);
  }

  Future<void> deleteAll() async {
    await _storage.writeScenarios(const []);
  }

  Future<void> _writeAll(List<HomeLoanScenario> scenarios) {
    return _storage.writeScenarios([
      for (final scenario in scenarios) jsonEncode(scenario.toJson()),
    ]);
  }
}

String createScenarioId(DateTime now) => now.microsecondsSinceEpoch.toString();

String _readString(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is String) {
    return value;
  }

  throw FormatException('Missing string field: $key');
}

String _readOptionalString(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is String) {
    return value;
  }

  return '';
}

double _readDouble(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is num) {
    return value.toDouble();
  }

  throw FormatException('Missing number field: $key');
}

int _readInt(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.toInt();
  }

  throw FormatException('Missing integer field: $key');
}

double _readOptionalDouble(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is num) {
    return value.toDouble();
  }

  return 0;
}

int _readOptionalInt(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.toInt();
  }

  return 0;
}

T _enumByName<T extends Enum>(List<T> values, String name, T fallback) {
  for (final value in values) {
    if (value.name == name) {
      return value;
    }
  }

  return fallback;
}

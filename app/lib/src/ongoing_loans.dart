import 'dart:convert';
import 'dart:math' as math;

import 'package:shared_preferences/shared_preferences.dart';

enum OngoingLoanType { home, car, personal, creditCard, ptptn, other }

extension OngoingLoanTypeLabels on OngoingLoanType {
  String get label {
    return switch (this) {
      OngoingLoanType.home => 'Home loan',
      OngoingLoanType.car => 'Car loan',
      OngoingLoanType.personal => 'Personal loan',
      OngoingLoanType.creditCard => 'Credit card',
      OngoingLoanType.ptptn => 'PTPTN',
      OngoingLoanType.other => 'Other',
    };
  }
}

class OngoingLoanCommitment {
  const OngoingLoanCommitment({
    required this.id,
    required this.name,
    required this.type,
    required this.monthlyPayment,
    required this.createdAt,
    this.remainingBalance = 0,
    this.annualRatePercent = 0,
  });

  final String id;
  final String name;
  final OngoingLoanType type;
  final double monthlyPayment;
  final DateTime createdAt;
  final double remainingBalance;
  final double annualRatePercent;

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'monthlyPayment': monthlyPayment,
      'remainingBalance': remainingBalance,
      'annualRatePercent': annualRatePercent,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory OngoingLoanCommitment.fromJson(Map<String, Object?> json) {
    return OngoingLoanCommitment(
      id: _readString(json, 'id'),
      name: _readString(json, 'name'),
      type: _enumByName(
        OngoingLoanType.values,
        _readString(json, 'type'),
        OngoingLoanType.other,
      ),
      monthlyPayment: _readDouble(json, 'monthlyPayment'),
      remainingBalance: _readOptionalDouble(json, 'remainingBalance'),
      annualRatePercent: _readOptionalDouble(json, 'annualRatePercent'),
      createdAt: DateTime.parse(_readString(json, 'createdAt')),
    );
  }
}

class OngoingLoanProjectionYear {
  const OngoingLoanProjectionYear({
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

class OngoingLoanProjection {
  const OngoingLoanProjection({
    required this.isPaidOff,
    required this.monthsProjected,
    required this.totalFuturePayment,
    required this.totalFutureInterest,
    required this.finalPayment,
    required this.endingBalance,
    required this.yearlyPlan,
  });

  final bool isPaidOff;
  final int monthsProjected;
  final double totalFuturePayment;
  final double totalFutureInterest;
  final double finalPayment;
  final double endingBalance;
  final List<OngoingLoanProjectionYear> yearlyPlan;
}

class OngoingLoanProjectionCalculator {
  const OngoingLoanProjectionCalculator();

  OngoingLoanProjection calculate(
    OngoingLoanCommitment loan, {
    int maximumMonths = 600,
  }) {
    if (loan.remainingBalance <= 0 || loan.monthlyPayment <= 0) {
      return const OngoingLoanProjection(
        isPaidOff: true,
        monthsProjected: 0,
        totalFuturePayment: 0,
        totalFutureInterest: 0,
        finalPayment: 0,
        endingBalance: 0,
        yearlyPlan: [],
      );
    }

    final monthlyRate = loan.annualRatePercent / 100 / 12;
    var balance = loan.remainingBalance;
    var totalFuturePayment = 0.0;
    var totalFutureInterest = 0.0;
    var finalPayment = 0.0;
    var yearPayment = 0.0;
    var yearPrincipal = 0.0;
    var yearInterest = 0.0;
    final yearlyPlan = <OngoingLoanProjectionYear>[];

    for (var month = 1; month <= maximumMonths; month += 1) {
      final interest = balance * monthlyRate;
      final payment = math.min(loan.monthlyPayment, balance + interest);
      final principalPaid = math.max(0.0, payment - interest);

      balance = math.max(0, balance + interest - payment);
      totalFuturePayment += payment;
      totalFutureInterest += interest;
      finalPayment = payment;
      yearPayment += payment;
      yearPrincipal += principalPaid;
      yearInterest += interest;

      if (month % 12 == 0 || balance <= 0.01 || month == maximumMonths) {
        yearlyPlan.add(
          OngoingLoanProjectionYear(
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
        return OngoingLoanProjection(
          isPaidOff: true,
          monthsProjected: month,
          totalFuturePayment: totalFuturePayment,
          totalFutureInterest: totalFutureInterest,
          finalPayment: finalPayment,
          endingBalance: 0,
          yearlyPlan: List.unmodifiable(yearlyPlan),
        );
      }
    }

    return OngoingLoanProjection(
      isPaidOff: false,
      monthsProjected: maximumMonths,
      totalFuturePayment: totalFuturePayment,
      totalFutureInterest: totalFutureInterest,
      finalPayment: finalPayment,
      endingBalance: balance,
      yearlyPlan: List.unmodifiable(yearlyPlan),
    );
  }
}

abstract class OngoingLoanStorage {
  Future<List<String>> readLoans();

  Future<void> writeLoans(List<String> encodedLoans);
}

class SharedPreferencesOngoingLoanStorage implements OngoingLoanStorage {
  SharedPreferencesOngoingLoanStorage({
    SharedPreferencesAsync? preferences,
    this.key = 'ongoing_loan_commitments_v1',
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _preferences;
  final String key;

  @override
  Future<List<String>> readLoans() async {
    return await _preferences.getStringList(key) ?? const [];
  }

  @override
  Future<void> writeLoans(List<String> encodedLoans) {
    return _preferences.setStringList(key, encodedLoans);
  }
}

class MemoryOngoingLoanStorage implements OngoingLoanStorage {
  List<String> _encodedLoans;

  MemoryOngoingLoanStorage([List<String> initialLoans = const []])
    : _encodedLoans = List.of(initialLoans);

  @override
  Future<List<String>> readLoans() async => List.of(_encodedLoans);

  @override
  Future<void> writeLoans(List<String> encodedLoans) async {
    _encodedLoans = List.of(encodedLoans);
  }
}

class OngoingLoanRepository {
  OngoingLoanRepository({OngoingLoanStorage? storage})
    : _storage = storage ?? SharedPreferencesOngoingLoanStorage();

  final OngoingLoanStorage _storage;

  Future<List<OngoingLoanCommitment>> loadAll() async {
    final encodedLoans = await _storage.readLoans();
    final loans = <OngoingLoanCommitment>[];

    for (final encodedLoan in encodedLoans) {
      try {
        final json = jsonDecode(encodedLoan) as Map<String, Object?>;
        loans.add(OngoingLoanCommitment.fromJson(json));
      } on Object {
        continue;
      }
    }

    loans.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return loans;
  }

  Future<void> save(OngoingLoanCommitment loan) async {
    final loans = await loadAll();
    final updated = [
      loan,
      for (final existing in loans)
        if (existing.id != loan.id) existing,
    ];

    await _writeAll(updated);
  }

  Future<void> delete(String id) async {
    final loans = await loadAll();
    await _writeAll([
      for (final loan in loans)
        if (loan.id != id) loan,
    ]);
  }

  Future<void> deleteAll() {
    return _storage.writeLoans(const []);
  }

  Future<void> _writeAll(List<OngoingLoanCommitment> loans) {
    return _storage.writeLoans([
      for (final loan in loans) jsonEncode(loan.toJson()),
    ]);
  }
}

String _readString(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is String) {
    return value;
  }

  throw FormatException('Missing string field: $key');
}

double _readDouble(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is num) {
    return value.toDouble();
  }

  throw FormatException('Missing number field: $key');
}

double _readOptionalDouble(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is num) {
    return value.toDouble();
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

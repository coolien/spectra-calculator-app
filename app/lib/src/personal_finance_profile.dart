import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class PersonalFinanceProfile {
  const PersonalFinanceProfile({
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

  Map<String, Object?> toJson() {
    return {
      'grossMonthlySalary': grossMonthlySalary,
      'epfEmployeeRatePercent': epfEmployeeRatePercent,
      'socsoEmployeeRatePercent': socsoEmployeeRatePercent,
      'eisEmployeeRatePercent': eisEmployeeRatePercent,
      'socialSecurityWageCeiling': socialSecurityWageCeiling,
      'monthlyPcbTax': monthlyPcbTax,
      'existingMonthlyCommitments': existingMonthlyCommitments,
      'monthlyLivingExpenses': monthlyLivingExpenses,
      'targetSavingsPercent': targetSavingsPercent,
      'targetDsrPercent': targetDsrPercent,
    };
  }

  factory PersonalFinanceProfile.fromJson(Map<String, Object?> json) {
    return PersonalFinanceProfile(
      grossMonthlySalary: _readDouble(json, 'grossMonthlySalary'),
      epfEmployeeRatePercent: _readDouble(json, 'epfEmployeeRatePercent'),
      socsoEmployeeRatePercent: _readDouble(json, 'socsoEmployeeRatePercent'),
      eisEmployeeRatePercent: _readDouble(json, 'eisEmployeeRatePercent'),
      socialSecurityWageCeiling: _readDouble(json, 'socialSecurityWageCeiling'),
      monthlyPcbTax: _readDouble(json, 'monthlyPcbTax'),
      existingMonthlyCommitments: _readDouble(
        json,
        'existingMonthlyCommitments',
      ),
      monthlyLivingExpenses: _readDouble(json, 'monthlyLivingExpenses'),
      targetSavingsPercent: _readDouble(json, 'targetSavingsPercent'),
      targetDsrPercent: _readDouble(json, 'targetDsrPercent'),
    );
  }
}

abstract class PersonalProfileStorage {
  Future<String?> readProfile();

  Future<void> writeProfile(String encodedProfile);

  Future<void> deleteProfile();
}

class SharedPreferencesPersonalProfileStorage
    implements PersonalProfileStorage {
  SharedPreferencesPersonalProfileStorage({
    SharedPreferencesAsync? preferences,
    this.key = 'personal_finance_profile_v1',
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _preferences;
  final String key;

  @override
  Future<String?> readProfile() {
    return _preferences.getString(key);
  }

  @override
  Future<void> writeProfile(String encodedProfile) {
    return _preferences.setString(key, encodedProfile);
  }

  @override
  Future<void> deleteProfile() {
    return _preferences.remove(key);
  }
}

class MemoryPersonalProfileStorage implements PersonalProfileStorage {
  String? _encodedProfile;

  MemoryPersonalProfileStorage([this._encodedProfile]);

  @override
  Future<String?> readProfile() async => _encodedProfile;

  @override
  Future<void> writeProfile(String encodedProfile) async {
    _encodedProfile = encodedProfile;
  }

  @override
  Future<void> deleteProfile() async {
    _encodedProfile = null;
  }
}

class PersonalFinanceProfileRepository {
  PersonalFinanceProfileRepository({PersonalProfileStorage? storage})
    : _storage = storage ?? SharedPreferencesPersonalProfileStorage();

  final PersonalProfileStorage _storage;

  Future<PersonalFinanceProfile?> load() async {
    final encodedProfile = await _storage.readProfile();
    if (encodedProfile == null) {
      return null;
    }

    try {
      final json = jsonDecode(encodedProfile) as Map<String, Object?>;
      return PersonalFinanceProfile.fromJson(json);
    } on Object {
      return null;
    }
  }

  Future<void> save(PersonalFinanceProfile profile) {
    return _storage.writeProfile(jsonEncode(profile.toJson()));
  }

  Future<void> delete() {
    return _storage.deleteProfile();
  }
}

double _readDouble(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is num) {
    return value.toDouble();
  }

  throw FormatException('Missing number field: $key');
}

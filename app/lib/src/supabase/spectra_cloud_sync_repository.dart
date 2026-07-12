import 'package:loancalculator/src/app_preferences.dart';
import 'package:loancalculator/src/ongoing_loans.dart';
import 'package:loancalculator/src/personal_finance_profile.dart';
import 'package:loancalculator/src/saved_scenarios.dart';
import 'package:loancalculator/src/supabase/spectra_supabase_config.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SpectraCloudSyncException implements Exception {
  const SpectraCloudSyncException(this.message);

  final String message;

  @override
  String toString() => message;
}

class SpectraCloudSyncSummary {
  const SpectraCloudSyncSummary({
    required this.profileCount,
    required this.savedScenarioCount,
    required this.ongoingLoanCount,
    required this.settingsCount,
  });

  final int profileCount;
  final int savedScenarioCount;
  final int ongoingLoanCount;
  final int settingsCount;

  int get totalItems =>
      profileCount + savedScenarioCount + ongoingLoanCount + settingsCount;
}

class SpectraCloudSyncRepository {
  SpectraCloudSyncRepository({
    PersonalFinanceProfileRepository? profileRepository,
    SavedScenarioRepository? homeScenarioRepository,
    ConsumerScenarioRepository? consumerScenarioRepository,
    OngoingLoanRepository? ongoingLoanRepository,
    AppPreferenceRepository? preferenceRepository,
  }) : _profileRepository =
           profileRepository ?? PersonalFinanceProfileRepository(),
       _homeScenarioRepository =
           homeScenarioRepository ?? SavedScenarioRepository(),
       _consumerScenarioRepository =
           consumerScenarioRepository ?? ConsumerScenarioRepository(),
       _ongoingLoanRepository =
           ongoingLoanRepository ?? OngoingLoanRepository(),
       _preferenceRepository =
           preferenceRepository ?? AppPreferenceRepository();

  static const consentVersion = 'cloud-sync-v1-2026-07-12';

  final PersonalFinanceProfileRepository _profileRepository;
  final SavedScenarioRepository _homeScenarioRepository;
  final ConsumerScenarioRepository _consumerScenarioRepository;
  final OngoingLoanRepository _ongoingLoanRepository;
  final AppPreferenceRepository _preferenceRepository;

  SupabaseClient get _client => SpectraSupabaseConfig.client;

  String get _userId {
    final user = _client.auth.currentUser;
    if (user == null) {
      throw const SpectraCloudSyncException(
        'Sign in before syncing cloud data.',
      );
    }

    return user.id;
  }

  Future<SpectraCloudSyncSummary> pushLocalDataToCloud() async {
    final userId = _userId;
    final now = DateTime.now().toUtc().toIso8601String();

    await _ensureProfileRow(userId: userId, now: now);
    await _recordCloudSyncConsent(userId: userId, now: now);

    var profileCount = 0;
    final profile = await _profileRepository.load();
    if (profile != null) {
      await _client
          .from('finance_profiles')
          .upsert(
            _financeProfileRow(userId: userId, profile: profile, now: now),
            onConflict: 'user_id',
          );
      profileCount = 1;
    }

    final homeScenarios = await _homeScenarioRepository.loadAll();
    final consumerScenarios = await _consumerScenarioRepository.loadAll();
    final scenarioRows = [
      for (final scenario in homeScenarios)
        _homeScenarioRow(userId: userId, scenario: scenario, now: now),
      for (final scenario in consumerScenarios)
        _consumerScenarioRow(userId: userId, scenario: scenario, now: now),
    ];
    if (scenarioRows.isNotEmpty) {
      await _client
          .from('saved_scenarios')
          .upsert(scenarioRows, onConflict: 'user_id,id');
    }

    final ongoingLoans = await _ongoingLoanRepository.loadAll();
    if (ongoingLoans.isNotEmpty) {
      await _client.from('ongoing_loans').upsert([
        for (final loan in ongoingLoans)
          _ongoingLoanRow(userId: userId, loan: loan, now: now),
      ], onConflict: 'user_id,id');
    }

    final language = await _preferenceRepository.loadLanguage();
    await _client.from('app_settings').upsert({
      'user_id': userId,
      'language': language.name,
      'updated_at': now,
    }, onConflict: 'user_id');

    await _recordSyncEvent(
      userId: userId,
      direction: 'push',
      itemCount: profileCount + scenarioRows.length + ongoingLoans.length + 1,
      now: now,
    );

    return SpectraCloudSyncSummary(
      profileCount: profileCount,
      savedScenarioCount: scenarioRows.length,
      ongoingLoanCount: ongoingLoans.length,
      settingsCount: 1,
    );
  }

  Future<SpectraCloudSyncSummary> pullCloudDataToLocal() async {
    final userId = _userId;
    final now = DateTime.now().toUtc().toIso8601String();

    var profileCount = 0;
    final profileRows = await _client
        .from('finance_profiles')
        .select()
        .eq('user_id', userId)
        .limit(1);
    if (profileRows.isNotEmpty) {
      final profile = _profileFromRow(profileRows.first);
      if (profile != null) {
        await _profileRepository.save(profile);
        profileCount = 1;
      }
    }

    final scenarioRows = await _client
        .from('saved_scenarios')
        .select()
        .eq('user_id', userId);
    var savedScenarioCount = 0;
    for (final row in scenarioRows) {
      if (row['deleted_at'] != null) {
        continue;
      }

      final kind = row['scenario_kind'];
      final data = _jsonMap(row['scenario_data']);
      if (data == null) {
        continue;
      }

      if (kind == 'home_loan') {
        await _homeScenarioRepository.save(HomeLoanScenario.fromJson(data));
        savedScenarioCount += 1;
      } else {
        await _consumerScenarioRepository.save(
          ConsumerLoanScenario.fromJson(data),
        );
        savedScenarioCount += 1;
      }
    }

    final loanRows = await _client
        .from('ongoing_loans')
        .select()
        .eq('user_id', userId);
    var ongoingLoanCount = 0;
    for (final row in loanRows) {
      if (row['deleted_at'] != null) {
        continue;
      }

      final data = _jsonMap(row['loan_data']);
      if (data == null) {
        continue;
      }

      await _ongoingLoanRepository.save(OngoingLoanCommitment.fromJson(data));
      ongoingLoanCount += 1;
    }

    final settingRows = await _client
        .from('app_settings')
        .select()
        .eq('user_id', userId)
        .limit(1);
    var settingsCount = 0;
    if (settingRows.isNotEmpty) {
      final languageName = settingRows.first['language'];
      if (languageName is String) {
        final language = AppLanguage.values.cast<AppLanguage?>().firstWhere(
          (value) => value?.name == languageName,
          orElse: () => null,
        );
        if (language != null) {
          await _preferenceRepository.saveLanguage(language);
          settingsCount = 1;
        }
      }
    }

    await _recordSyncEvent(
      userId: userId,
      direction: 'pull',
      itemCount:
          profileCount + savedScenarioCount + ongoingLoanCount + settingsCount,
      now: now,
    );

    return SpectraCloudSyncSummary(
      profileCount: profileCount,
      savedScenarioCount: savedScenarioCount,
      ongoingLoanCount: ongoingLoanCount,
      settingsCount: settingsCount,
    );
  }

  Future<void> deleteCloudData() async {
    final userId = _userId;
    await _client.from('sync_events').delete().eq('user_id', userId);
    await _client.from('app_settings').delete().eq('user_id', userId);
    await _client.from('ongoing_loans').delete().eq('user_id', userId);
    await _client.from('saved_scenarios').delete().eq('user_id', userId);
    await _client.from('finance_profiles').delete().eq('user_id', userId);
    await _client.from('user_consents').delete().eq('user_id', userId);
    await _client.from('profiles').delete().eq('id', userId);
  }

  Future<void> _ensureProfileRow({
    required String userId,
    required String now,
  }) async {
    final user = _client.auth.currentUser;
    await _client.from('profiles').upsert({
      'id': userId,
      'email': user?.email,
      'display_name': user?.userMetadata?['name'],
      'updated_at': now,
    }, onConflict: 'id');
  }

  Future<void> _recordCloudSyncConsent({
    required String userId,
    required String now,
  }) async {
    await _client.from('user_consents').upsert({
      'user_id': userId,
      'consent_type': 'cloud_sync',
      'consent_version': consentVersion,
      'granted_at': now,
      'revoked_at': null,
    }, onConflict: 'user_id,consent_type,consent_version');
  }

  Future<void> _recordSyncEvent({
    required String userId,
    required String direction,
    required int itemCount,
    required String now,
  }) async {
    await _client.from('sync_events').insert({
      'user_id': userId,
      'direction': direction,
      'item_count': itemCount,
      'created_at': now,
    });
  }

  Map<String, Object?> _financeProfileRow({
    required String userId,
    required PersonalFinanceProfile profile,
    required String now,
  }) {
    return {
      'user_id': userId,
      'gross_monthly_salary': profile.grossMonthlySalary,
      'epf_employee_rate_percent': profile.epfEmployeeRatePercent,
      'socso_employee_rate_percent': profile.socsoEmployeeRatePercent,
      'eis_employee_rate_percent': profile.eisEmployeeRatePercent,
      'social_security_wage_ceiling': profile.socialSecurityWageCeiling,
      'monthly_pcb_tax': profile.monthlyPcbTax,
      'existing_monthly_commitments': profile.existingMonthlyCommitments,
      'monthly_living_expenses': profile.monthlyLivingExpenses,
      'target_savings_percent': profile.targetSavingsPercent,
      'target_dsr_percent': profile.targetDsrPercent,
      'profile_data': profile.toJson(),
      'updated_at': now,
    };
  }

  Map<String, Object?> _homeScenarioRow({
    required String userId,
    required HomeLoanScenario scenario,
    required String now,
  }) {
    return {
      'id': scenario.id,
      'user_id': userId,
      'scenario_kind': 'home_loan',
      'scenario_type': SavedScenarioType.homeLoan.name,
      'name': scenario.name,
      'scenario_data': scenario.toJson(),
      'local_created_at': scenario.createdAt.toUtc().toIso8601String(),
      'updated_at': now,
    };
  }

  Map<String, Object?> _consumerScenarioRow({
    required String userId,
    required ConsumerLoanScenario scenario,
    required String now,
  }) {
    return {
      'id': scenario.id,
      'user_id': userId,
      'scenario_kind': 'consumer_loan',
      'scenario_type': scenario.type.name,
      'name': scenario.name,
      'scenario_data': scenario.toJson(),
      'local_created_at': scenario.createdAt.toUtc().toIso8601String(),
      'updated_at': now,
    };
  }

  Map<String, Object?> _ongoingLoanRow({
    required String userId,
    required OngoingLoanCommitment loan,
    required String now,
  }) {
    return {
      'id': loan.id,
      'user_id': userId,
      'loan_type': loan.type.name,
      'name': loan.name,
      'monthly_payment': loan.monthlyPayment,
      'remaining_balance': loan.remainingBalance,
      'annual_rate_percent': loan.annualRatePercent,
      'loan_data': loan.toJson(),
      'local_created_at': loan.createdAt.toUtc().toIso8601String(),
      'updated_at': now,
    };
  }

  PersonalFinanceProfile? _profileFromRow(Map<String, dynamic> row) {
    final profileData = _jsonMap(row['profile_data']);
    if (profileData != null) {
      return PersonalFinanceProfile.fromJson(profileData);
    }

    return PersonalFinanceProfile(
      grossMonthlySalary: _readDouble(row, 'gross_monthly_salary'),
      epfEmployeeRatePercent: _readDouble(row, 'epf_employee_rate_percent'),
      socsoEmployeeRatePercent: _readDouble(row, 'socso_employee_rate_percent'),
      eisEmployeeRatePercent: _readDouble(row, 'eis_employee_rate_percent'),
      socialSecurityWageCeiling: _readDouble(
        row,
        'social_security_wage_ceiling',
      ),
      monthlyPcbTax: _readDouble(row, 'monthly_pcb_tax'),
      existingMonthlyCommitments: _readDouble(
        row,
        'existing_monthly_commitments',
      ),
      monthlyLivingExpenses: _readDouble(row, 'monthly_living_expenses'),
      targetSavingsPercent: _readDouble(row, 'target_savings_percent'),
      targetDsrPercent: _readDouble(row, 'target_dsr_percent'),
    );
  }

  Map<String, Object?>? _jsonMap(Object? value) {
    if (value is Map) {
      return value.map((key, value) => MapEntry(key.toString(), value));
    }

    return null;
  }

  double _readDouble(Map<String, dynamic> row, String key) {
    final value = row[key];
    if (value is num) {
      return value.toDouble();
    }

    return 0;
  }
}

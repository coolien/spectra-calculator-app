import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/personal_finance_profile.dart';

void main() {
  test('saves and loads a local personal finance profile', () async {
    final repository = PersonalFinanceProfileRepository(
      storage: MemoryPersonalProfileStorage(),
    );

    await repository.save(_profile(grossMonthlySalary: 6000));
    final profile = await repository.load();

    expect(profile, isNotNull);
    expect(profile!.grossMonthlySalary, 6000);
    expect(profile.epfEmployeeRatePercent, 11);
  });

  test('deletes a local personal finance profile', () async {
    final repository = PersonalFinanceProfileRepository(
      storage: MemoryPersonalProfileStorage(),
    );

    await repository.save(_profile());
    await repository.delete();

    expect(await repository.load(), isNull);
  });

  test('returns null for corrupted local profile data', () async {
    final repository = PersonalFinanceProfileRepository(
      storage: MemoryPersonalProfileStorage('not-json'),
    );

    expect(await repository.load(), isNull);
  });
}

PersonalFinanceProfile _profile({double grossMonthlySalary = 5000}) {
  return PersonalFinanceProfile(
    grossMonthlySalary: grossMonthlySalary,
    epfEmployeeRatePercent: 11,
    socsoEmployeeRatePercent: 0.5,
    eisEmployeeRatePercent: 0.2,
    socialSecurityWageCeiling: 6000,
    monthlyPcbTax: 0,
    existingMonthlyCommitments: 500,
    monthlyLivingExpenses: 2000,
    targetSavingsPercent: 10,
    targetDsrPercent: 40,
  );
}

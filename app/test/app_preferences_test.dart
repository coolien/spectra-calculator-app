import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/app_preferences.dart';

void main() {
  test('saves and loads Tamil language preference', () async {
    final storage = _FakeAppPreferenceStorage();
    final repository = AppPreferenceRepository(storage: storage);

    await repository.saveLanguage(AppLanguage.tamil);

    expect(await repository.loadLanguage(), AppLanguage.tamil);
    expect(storage.languageName, 'tamil');
  });

  test('falls back to English for unknown language preference', () async {
    final storage = _FakeAppPreferenceStorage(languageName: 'unknown');
    final repository = AppPreferenceRepository(storage: storage);

    expect(await repository.loadLanguage(), AppLanguage.english);
  });
}

class _FakeAppPreferenceStorage implements AppPreferenceStorage {
  _FakeAppPreferenceStorage({this.languageName});

  String? languageName;
  bool? accountPromptDismissed;

  @override
  Future<String?> readLanguage() async => languageName;

  @override
  Future<void> writeLanguage(String languageName) async {
    this.languageName = languageName;
  }

  @override
  Future<bool?> readAccountPromptDismissed() async => accountPromptDismissed;

  @override
  Future<void> writeAccountPromptDismissed(bool isDismissed) async {
    accountPromptDismissed = isDismissed;
  }
}

import 'package:shared_preferences/shared_preferences.dart';

enum AppLanguage { english, bahasaMalaysia, chinese, tamil }

extension AppLanguageLabels on AppLanguage {
  String get label {
    return switch (this) {
      AppLanguage.english => 'English',
      AppLanguage.bahasaMalaysia => 'Bahasa Malaysia',
      AppLanguage.chinese => 'Chinese',
      AppLanguage.tamil => 'Tamil',
    };
  }

  String get shortLabel {
    return switch (this) {
      AppLanguage.english => 'EN',
      AppLanguage.bahasaMalaysia => 'BM',
      AppLanguage.chinese => '中文',
      AppLanguage.tamil => 'TA',
    };
  }

  String get description {
    return switch (this) {
      AppLanguage.english => 'English first for v1.',
      AppLanguage.bahasaMalaysia => 'BM labels planned after v1.',
      AppLanguage.chinese => 'Chinese labels planned after v1.',
      AppLanguage.tamil => 'Tamil labels planned after v1.',
    };
  }
}

abstract class AppPreferenceStorage {
  Future<String?> readLanguage();

  Future<void> writeLanguage(String languageName);

  Future<bool?> readAccountPromptDismissed();

  Future<void> writeAccountPromptDismissed(bool isDismissed);
}

class SharedPreferencesAppPreferenceStorage implements AppPreferenceStorage {
  SharedPreferencesAppPreferenceStorage({
    SharedPreferencesAsync? preferences,
    this.languageKey = 'app_language_v1',
    this.accountPromptDismissedKey = 'account_prompt_dismissed_v1',
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _preferences;
  final String languageKey;
  final String accountPromptDismissedKey;

  @override
  Future<String?> readLanguage() {
    return _preferences.getString(languageKey);
  }

  @override
  Future<void> writeLanguage(String languageName) {
    return _preferences.setString(languageKey, languageName);
  }

  @override
  Future<bool?> readAccountPromptDismissed() {
    return _preferences.getBool(accountPromptDismissedKey);
  }

  @override
  Future<void> writeAccountPromptDismissed(bool isDismissed) {
    return _preferences.setBool(accountPromptDismissedKey, isDismissed);
  }
}

class AppPreferenceRepository {
  AppPreferenceRepository({AppPreferenceStorage? storage})
    : _storage = storage ?? SharedPreferencesAppPreferenceStorage();

  final AppPreferenceStorage _storage;

  Future<AppLanguage> loadLanguage() async {
    final languageName = await _storage.readLanguage();
    for (final language in AppLanguage.values) {
      if (language.name == languageName) {
        return language;
      }
    }

    return AppLanguage.english;
  }

  Future<void> saveLanguage(AppLanguage language) {
    return _storage.writeLanguage(language.name);
  }

  Future<bool> isAccountPromptDismissed() async {
    return await _storage.readAccountPromptDismissed() ?? false;
  }

  Future<void> saveAccountPromptDismissed(bool isDismissed) {
    return _storage.writeAccountPromptDismissed(isDismissed);
  }
}

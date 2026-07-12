import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/src/supabase/spectra_auth_repository.dart';
import 'package:loancalculator/src/supabase/spectra_supabase_config.dart';

void main() {
  test('Supabase stays disabled when no publishable key is provided', () {
    expect(SpectraSupabaseConfig.isConfigured, isFalse);

    final session = const SpectraAuthRepository().currentSession();
    expect(session.isConfigured, isFalse);
    expect(session.isSignedIn, isFalse);
  });
}

import 'package:loancalculator/src/supabase/spectra_supabase_config.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SpectraAccountSession {
  const SpectraAccountSession({
    required this.isConfigured,
    required this.isSignedIn,
    this.userId,
    this.email,
  });

  final bool isConfigured;
  final bool isSignedIn;
  final String? userId;
  final String? email;

  static const notConfigured = SpectraAccountSession(
    isConfigured: false,
    isSignedIn: false,
  );
}

class SpectraAuthRepository {
  const SpectraAuthRepository();

  bool get isConfigured => SpectraSupabaseConfig.isConfigured;

  SupabaseClient get _client => SpectraSupabaseConfig.client;

  SpectraAccountSession currentSession() {
    if (!isConfigured) {
      return SpectraAccountSession.notConfigured;
    }

    final user = SpectraSupabaseConfig.maybeClient?.auth.currentUser;
    return SpectraAccountSession(
      isConfigured: true,
      isSignedIn: user != null,
      userId: user?.id,
      email: user?.email,
    );
  }

  Stream<AuthState> get authStateChanges {
    if (!isConfigured) {
      return const Stream.empty();
    }

    return _client.auth.onAuthStateChange;
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) {
    return _client.auth.signUp(email: email, password: password);
  }

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) {
    return _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> sendPasswordReset(String email) {
    return _client.auth.resetPasswordForEmail(email);
  }

  Future<void> signOut() {
    return _client.auth.signOut();
  }
}

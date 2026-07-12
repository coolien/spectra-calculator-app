import 'package:supabase_flutter/supabase_flutter.dart';

class SpectraSupabaseConfig {
  const SpectraSupabaseConfig._();

  static const projectRef = 'ncunuuitbiygluduysmh';
  static const defaultUrl = 'https://$projectRef.supabase.co';

  static const url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: defaultUrl,
  );

  static const publishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  static bool get isConfigured => url.isNotEmpty && publishableKey.isNotEmpty;

  static Future<void> initialize() async {
    if (!isConfigured) {
      return;
    }

    await Supabase.initialize(url: url, publishableKey: publishableKey);
  }

  static SupabaseClient? get maybeClient {
    if (!isConfigured) {
      return null;
    }

    try {
      return Supabase.instance.client;
    } on StateError {
      return null;
    }
  }

  static SupabaseClient get client {
    final initializedClient = maybeClient;
    if (initializedClient == null) {
      throw StateError('Supabase is not configured or initialized.');
    }

    return initializedClient;
  }
}

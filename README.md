# Spectra Calculator App

Spectra Calculator is a Malaysia-focused loan and personal finance planning app
built with Flutter. It can run as a Progressive Web App first, with Android
packaging kept available for a later Play Store release.

## App

- Flutter app: `app/`
- PWA target domain: `calculatorapp.spectramsia.com`
- Supabase project ref: `ncunuuitbiygluduysmh`
- Brand guide: `docs/Spectra Brand Guideline.pdf`

## Local Development

```powershell
cd app
flutter pub get
flutter analyze
flutter test
flutter run -d chrome
```

## Production Web Build

Without Supabase credentials, the app still builds and runs in local-only mode:

```powershell
cd app
flutter build web --release --base-href /
dart run tools/copy_web_pwa_assets.dart
```

With Supabase cloud sync enabled:

```powershell
cd app
flutter build web --release --base-href / `
  --dart-define=SUPABASE_URL=https://ncunuuitbiygluduysmh.supabase.co `
  --dart-define=SUPABASE_PUBLISHABLE_KEY=your-publishable-key
dart run tools/copy_web_pwa_assets.dart
```

Deploy `app/build/web` to Cloudflare Pages.

## Supabase

Run these SQL files in Supabase SQL Editor:

1. `docs/supabase/schema.sql`
2. `docs/supabase/rls_policies.sql`

More setup notes are in `docs/SUPABASE_SETUP.md`.

## Safety

Cloud sync is optional. The app should not collect NRIC, bank account numbers,
card numbers, OTPs, payslips, or official loan documents.

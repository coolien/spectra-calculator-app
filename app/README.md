# Spectra Calculator Flutter App

Flutter application for Spectra's Malaysia-focused loan and finance planner.

## Validate

```powershell
flutter analyze
flutter test
```

## Build PWA

```powershell
flutter build web --release --base-href /
dart run tools/copy_web_pwa_assets.dart
```

Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` with `--dart-define` when
building a cloud-sync-enabled release.

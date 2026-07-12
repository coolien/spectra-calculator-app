# Release And Testing Checklist

Last updated: 30 June 2026

## Current Status

- Package/application ID: `com.spetrality.financecalculator`
- Display name: `Malaysia Loan & Finance Planner`
- Current version: `1.0.0+1`
- Debug APK is suitable for local testing only.
- Play Store upload should use a signed release Android App Bundle, not the debug APK.

## Before Play Console Upload

1. Wait for D-U-N-S if creating a Google Play organization developer account.
2. Create an upload keystore and keep it private.
3. Copy `app/android/key.properties.template` to `app/android/key.properties`.
4. Fill `key.properties` with the real keystore password, key password, alias, and keystore path.
5. Build the Play bundle with:

```powershell
cd "C:\Users\khoom\Desktop\Codex\Loan Calculator App\app"
powershell -ExecutionPolicy Bypass -File .\tools\build_play_bundle.ps1
```

Expected Play artifact:

```text
app\build\app\outputs\bundle\release\app-release.aab
```

## Keystore Safety

- Never upload `key.properties`.
- Never upload `upload-keystore.jks`.
- Keep a backup of the keystore and passwords in a password manager.
- Losing the upload key can delay or block future updates.

## Local Testing Before Store

1. Build debug APK:

```powershell
cd "C:\Users\khoom\Desktop\Codex\Loan Calculator App\app"
C:\Users\khoom\development\flutter\bin\flutter.bat build apk --debug
```

2. Install the APK manually on an Android phone.
3. Test:
   - First launch and Personal workspace setup
   - Personal Profile save/load
   - Overall Loans add/delete
   - Home, Car, Personal, Credit Card and PTPTN calculators
   - Saved Scenarios
   - Add saved scenario to Overall Loans
   - Settings, Privacy Notice, Terms of Use, Disclaimer and Data Deletion
   - Delete all local data

## Play Console Declarations To Prepare

- Data Safety: local financial data, no cloud upload in v1.
- Privacy Policy URL: required before launch.
- Financial features declaration: calculator/planner, not a lender or broker.
- Ads declaration: set no ads until AdMob is actually added.
- App access: no login in v1.
- Content rating questionnaire.
- Target audience: adults / general finance planning audience.

## References

- Flutter Android deployment: https://docs.flutter.dev/deployment/android
- Android app signing: https://developer.android.com/studio/publish/app-signing
- Google Play User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Financial Services policy: https://support.google.com/googleplay/android-developer/answer/9876821

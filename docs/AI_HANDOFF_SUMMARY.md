# AI Handoff Summary - Malaysia Loan & Finance Planner

Last updated: 7 July 2026

This file summarizes the project direction, current implementation, important decisions, and recommended next steps so another AI chat or developer can continue without needing the full conversation history.

## Product And Business Context

- App display name: `Malaysia Loan & Finance Planner`
- Android package/application ID: `com.spetrality.financecalculator`
- Flutter package name: `loancalculator`
- Business/publisher: Spetrality Enterprise
- Initial platform focus: Android / Google Play Store
- Current monetization plan:
  - Free app
  - Ads later through AdMob
  - One-time "Remove Ads" purchase through Google Play Billing
- Payment decision:
  - Avoid external payment links inside the Android app for remove-ads purchase.
  - Use Google Play Billing because planned pricing is low and should fall under Google Play's lower service fee tier.
- Account decision:
  - Real Google login/cloud sync is not enabled yet.
  - Current v1 remains local-only for saved data.
  - Google sync is represented as a planned feature with user-facing local-only messaging.

## Project Structure

Main folders:

- `app/` - Flutter application.
- `app/lib/main.dart` - Main UI and screens.
- `app/lib/src/calculators/home_loan_calculator.dart` - Malaysia home loan logic.
- `app/lib/src/calculators/consumer_loan_calculators.dart` - Car, personal, credit card, and PTPTN calculator logic.
- `app/lib/src/calculators/salary_planner_calculator.dart` - Salary, DSR, cashflow, and investment-fit logic.
- `app/lib/src/saved_scenarios.dart` - Saved calculator scenario storage.
- `app/lib/src/personal_finance_profile.dart` - Local salary/profile storage.
- `app/lib/src/ongoing_loans.dart` - Actual ongoing-loan tracker and payoff projection storage/logic.
- `app/lib/src/app_preferences.dart` - Local language and account-prompt preferences.
- `docs/` - Planning, rules, privacy, release, and handoff documentation.
- `research/` - Competitor review scraping and analysis scripts.

Existing documentation:

- `docs/MVP_BLUEPRINT.md`
- `docs/MALAYSIA_RULES_REVIEW.md`
- `docs/UX_RECOMMENDATIONS.md`
- `docs/RELEASE_AND_TESTING.md`
- `docs/PRIVACY_POLICY_DRAFT.md`
- `docs/TERMS_OF_USE_DRAFT.md`
- `docs/FINANCIAL_DISCLAIMER_DRAFT.md`
- `docs/DATA_DELETION_INSTRUCTIONS.md`

## Research Completed

The original strategy was to build a Malaysia all-in-one loan/finance calculator slowly, starting with home loans, then expanding into car loans, credit cards, personal loans, PTPTN, and Islamic financing.

Competitor Play Store apps researched:

- `com.appnextdoor.homeloancalculator`
- `com.agmostudio.myhomeloancalculator.my`
- `syncteq.propertycalculatormalaysia`
- `com.propertyXMalaysiaHomeLoan`
- `com.yestronic.loan`
- `com.yestronic.homeloan`

Research files exist under:

- `research/output/playstore_reviews_raw.json`
- `research/output/playstore_reviews.csv`
- `research/output/playstore_negative_reviews.csv`
- `research/output/playstore_summary.json`
- `research/output/playstore_summary.csv`
- `research/output/app_review_theme_stats.csv`
- `research/output/tagged_review_samples.csv`

Main product takeaways from competitor research and user discussion:

- Users want simple, reliable calculators.
- Older competitor apps feel dated.
- Modern UI, clear explanations, and Malaysia-specific assumptions can differentiate the app.
- Saved scenarios and personal cashflow context are important.
- Users need short explanations for finance terms like DSR, PCB, SOCSO, EPF, Ujrah, stamp duty, legal fee, and valuation fee.

## Current App Features Implemented

### Home Screen

- Hub screen for all calculators.
- Personal workspace flow:
  - Create Personal Profile.
  - Add Overall Loans.
  - Choose a Calculator.
- Today snapshot dashboard:
  - Take-home pay.
  - Listed loan payments.
  - DSR with loans.
  - Remaining after savings target.
- Loan type color legend.
- First-run account/sync prompt explaining local-only v1 and planned Google sync.
- Language icon and Account & Sync icon in the top bar.

### Calculators

Implemented calculator modules:

- Home Loan
- Car Loan
- Personal Loan
- Credit Card Payoff
- PTPTN Loan

Key shared behavior:

- Input fields use MYR and percent formatting.
- Important finance fields have mini info buttons.
- Calculator results can be saved locally as scenarios.
- Saved scenarios can be opened later.
- Saved scenarios can be added to Overall Loans.

### Home Loan Calculator

Includes:

- Monthly installment.
- Down payment.
- Interest/profit rate.
- Tenure.
- SPA date.
- Buyer type.
- Purchase type:
  - Subsale.
  - New project.
- Financing type:
  - Conventional.
  - Islamic.
- First residential home toggle.
- Optional affordability check:
  - Monthly gross income.
  - Existing commitments.
  - Target DSR.
- Editable professional fees:
  - SPA legal fee.
  - Loan legal fee.
  - Valuation fee.
  - SST/service tax.
  - Disbursement buffer.
- Upfront cost breakdown.
- Full amortization preview.

Important recent fix:

- Home-loan amortization preview no longer stops at 5 years. It now shows the full tenure.

### Car Loan Calculator

Includes:

- Vehicle price.
- Down payment.
- Flat interest rate.
- Tenure.
- Upfront fee buffer.
- Estimated monthly installment.
- Total interest.
- Effective annual rate estimate.
- Total repayment.
- Upfront cash.
- Full yearly repayment preview.

Important recent fix:

- Repayment preview no longer stops at 5 years. It now shows all years in the generated plan.

### Personal Loan Calculator

Includes:

- Loan amount.
- Interest rate.
- Tenure.
- Processing/other fee buffer.
- Loan agreement stamp duty.
- Reducing-balance or flat-rate method selector.
- Monthly repayment.
- Effective rate estimate.
- Total interest.
- Stamp duty estimate.
- Upfront fees.
- Total cost.
- Full yearly repayment preview.

Important recent fix:

- Repayment preview no longer stops at 5 years. It now shows all years in the generated plan.

### Credit Card Payoff Calculator

Includes:

- Outstanding balance.
- Finance charge.
- Monthly payment.
- New spending each month.
- Editable minimum payment assumption:
  - Minimum payment percent.
  - Minimum payment floor.
- Payoff time estimate.
- Total interest.
- Total paid.
- First minimum due.
- Minimum-payment comparison.
- First 12-month preview.

Note:

- Credit card preview is still monthly and currently shows the first 12 months because credit card payoff does not use a fixed "years entered" tenure like loans.

### PTPTN Loan Calculator

Includes:

- Outstanding balance.
- Ujrah/service charge.
- Target repayment tenure.
- Extra monthly payment.
- Ujrah method:
  - Reducing balance.
  - Flat mode.
- Monthly repayment.
- Payoff time.
- Ujrah estimate.
- Total repayment.
- Final payment.
- Full yearly repayment preview.

Important recent fix:

- Repayment preview no longer stops at 5 years. It now shows all years in the generated plan.

### Personal Profile

Purpose:

- Save salary, deductions, expenses, and targets locally.
- Use personal cashflow to make loan decisions easier.

Fields:

- Gross monthly salary.
- EPF employee rate.
- SOCSO employee estimate.
- EIS employee estimate.
- SOCSO/EIS wage ceiling.
- PCB/tax deduction.
- Existing monthly commitments.
- Monthly living expenses.
- Target savings.
- Target DSR.
- Loan installment to evaluate.
- Optional investment view:
  - Asset/property price.
  - Expected monthly rent/income.
  - Monthly upkeep/investment costs.

UX fixes:

- Saved Profile is accessible from the drawer.
- Saved Profile appears inside the Saved Scenarios area so users do not think it disappeared.

### Overall Loans / Actual Loan Tracker

This evolved from a simple ongoing-loans list into a more useful actual-loan tracker.

Current features:

- Add actual loans.
- Edit actual loans.
- Delete actual loans.
- Track:
  - Loan type.
  - Name.
  - Actual monthly repayment.
  - Current outstanding balance.
  - Optional annual rate estimate.
- Shows:
  - Outstanding balance.
  - Payoff time.
  - Future repayment amount.
  - Interest/profit estimate.
  - Warning if payment does not clear balance within projection window.
  - Expandable yearly payoff path.
- Overall Loans screen combines actual loan payments with saved Personal Profile to estimate:
  - Monthly cashflow.
  - DSR with loans.
  - Remaining money after expenses and savings target.
  - Known outstanding balances.
  - Projected future repayments.
  - Projected interest/profit.

Important recent fix:

- Users can now track actual loans and repayment progress over time instead of only storing a monthly commitment.

### Saved Scenarios

Current behavior:

- Calculator scenarios can be saved locally.
- Saved scenarios can be reopened.
- Saved scenarios can be deleted.
- Saved scenarios can be added to Overall Loans.
- Saved Profile summary appears in this screen.
- Scenario cards are color-coded by loan type.

### Settings And Policies

Implemented screens:

- Privacy Notice.
- Disclaimer.
- Terms of Use.
- Data Deletion Instructions.
- Local Data Controls.
- Assumptions and Sources.
- Account & Sync.
- Language.
- Remove Ads placeholder.
- Restore Purchase placeholder.
- Formula Version placeholder.

Important current policy position:

- v1 is local-only.
- No real Google login yet.
- No cloud sync yet.
- No ads yet.
- No billing yet.
- No analytics yet.
- If ads, billing, analytics, or cloud sync are added, privacy policy and Play Store Data Safety must be updated before release.

## UI/UX Improvements Implemented

- Modernized layout with Material 3.
- Loan type color coding:
  - Home.
  - Car.
  - Personal.
  - Credit Card.
  - PTPTN.
- Reduced repeated wording between app bars and screen headings.
- Added language selector for:
  - English.
  - Bahasa Malaysia.
  - Chinese.
- English remains active for v1; BM and Chinese full translations are planned later.
- Added info icons to explain confusing finance fields.
- Added account/sync prompt while keeping data local-only.
- Added drawer navigation for:
  - Saved Profile.
  - Overall Loans.
  - Saved Scenarios.
  - Language.
  - Account & Sync.
  - Settings.

## Local Data And Storage

Storage uses `shared_preferences`.

Stored locally:

- Personal Finance Profile.
- Saved home loan scenarios.
- Saved consumer loan scenarios.
- Ongoing/actual loan commitments.
- App language preference.
- Account prompt dismissed preference.

No server-side storage exists yet.

No user data is uploaded in v1.

## Rules And Assumptions

Home loan rules are in:

- `app/lib/src/calculators/home_loan_calculator.dart`
- `docs/MALAYSIA_RULES_REVIEW.md`

Important note:

- Malaysia fee/rule assumptions were last reviewed around 30 June 2026 in the project docs/code.
- Before Play Store launch, verify current rules again from official or professional sources.
- The app should always position calculations as estimates, not legal, tax, loan approval, or financial advice.

## Test And Build Status

Last known verification from the implementation session:

- `flutter analyze` passed.
- `flutter test` passed with 42 tests.
- `flutter build web` passed.
- `flutter build apk --debug` passed.

Common local commands:

```powershell
cd "C:\Users\khoom\Desktop\Codex\Loan Calculator App\app"
flutter analyze
flutter test
flutter build web
flutter build apk --debug
```

Debug APK path:

```text
C:\Users\khoom\Desktop\Codex\Loan Calculator App\app\build\app\outputs\flutter-apk\app-debug.apk
```

Play Store release should use a signed Android App Bundle, not the debug APK.

Release helper:

```powershell
cd "C:\Users\khoom\Desktop\Codex\Loan Calculator App\app"
powershell -ExecutionPolicy Bypass -File .\tools\build_play_bundle.ps1
```

Expected release artifact after signing is configured:

```text
app\build\app\outputs\bundle\release\app-release.aab
```

## Development Environment Notes

Flutter project is under:

```text
C:\Users\khoom\Desktop\Codex\Loan Calculator App\app
```

Android package files:

- `app/android/app/build.gradle.kts`
- `app/android/app/src/main/AndroidManifest.xml`
- `app/android/app/src/main/kotlin/com/spetrality/financecalculator/MainActivity.kt`

Release signing:

- `app/android/key.properties.template` exists.
- Do not commit or share real `key.properties`.
- Do not share upload keystore or passwords.

## Known Limitations / Not Yet Implemented

High priority limitations:

- No real Google login yet.
- No Firebase/cloud sync yet.
- No account deletion flow for server data because no server data exists yet.
- No AdMob ads yet.
- No Google Play Billing/remove-ads purchase yet.
- No real multilingual UI strings yet; only language preference is stored.
- No export/share PDF or CSV yet.
- No production privacy policy URL hosted yet.
- No Play Store listing assets/screenshots finalized yet.
- No signed release AAB created unless keystore is configured locally.
- No bank/package comparison database.
- No official legal/tax professional review yet.

Calculator limitations to remember:

- Calculations are estimates.
- Bank approval logic is not predicted.
- Credit card interest can differ due to daily interest, statement dates, fees, and issuer-specific rules.
- PTPTN actual account balances, arrears, rebates, salary deductions, campaigns, and restructures must be checked in the official portal.
- Home loan fees and exemptions must be rechecked before launch.

## Suggested Next Steps

Recommended sequence:

1. Do a full manual QA pass on Android phone.
2. Test creating and saving Personal Profile.
3. Test all calculators with realistic Malaysia examples.
4. Test Saved Scenarios and adding saved scenarios to Actual Loan Tracker.
5. Test editing actual loans month by month.
6. Re-check Malaysia rules/fees and update `MALAYSIA_RULES_REVIEW.md`.
7. Create app icon and Play Store screenshots.
8. Host privacy policy and terms pages on a website.
9. Decide whether to add AdMob first or release a no-ads MVP first.
10. Add Google Play Billing only when ready for remove-ads.
11. Add real Google login/cloud sync only after privacy, account deletion, and security design are ready.
12. Prepare signed release AAB for Play Console.

Good product improvements after MVP:

- Full BM and Chinese translations.
- Export/share results as PDF.
- Compare saved scenarios side-by-side.
- Add property purchase checklist.
- Add MRTA/MRTT, insurance, maintenance fee, quit rent, assessment, and sinking fund fields.
- Add refinancing calculator.
- Add early settlement / extra payment planner.
- Add reminders for actual loan updates.
- Add backup/sync with explicit consent.

## Important Product Principle

Keep the app beginner-friendly and legally safe:

- Explain finance terms in simple language.
- Let users edit assumptions.
- Avoid pretending to give loan approval predictions.
- Keep disclaimers visible but not scary.
- Do not collect or upload salary/financial data until the privacy and security model is ready.
- Treat all calculator results as planning estimates only.

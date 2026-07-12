# Malaysia Loan Calculator App - MVP Blueprint

## 1. Product Direction

Build a Malaysia-focused loan calculator hub, starting with a trustworthy home loan module.

The long-term app can include:

- Home loan calculator
- Islamic home financing mode
- Car loan calculator
- Personal loan calculator
- Credit card repayment calculator
- PTPTN loan repayment calculator
- Salary and affordability planner
- Overall ongoing-loans tracker
- Other Malaysia-specific finance tools

The first release started with home loans. The current build also includes beta calculators for car loan, personal loan, credit card payoff, PTPTN repayment, personal profile planning, and overall ongoing-loans tracking, with editable assumptions and conservative disclaimers.

## 2. Working Positioning

Beginner-friendly Malaysia home loan calculator that shows monthly installment, upfront cash needed, and the reason behind each fee.

The app should compete by being:

- Modern and easy to use
- Transparent about formulas and assumptions
- Updated for Malaysia rules and fees
- Useful for first-time buyers
- Stable when exporting or sharing results
- Free with non-blocking ads

## 3. Business Setup

Publisher/business: Spetrality Enterprise

Items to confirm:

- Exact SSM business spelling
- App brand name: Malaysia Loan & Finance Planner
- App package name: `com.spetrality.financecalculator`
- Support email
- Website or landing page domain
- Privacy policy URL
- Google Play developer account type
- AdMob account

Working name candidates:

- Malaysia Loan & Finance Planner: selected
- Loan Calculator Malaysia
- Financial Calculator Malaysia
- Smart Finance Malaysia
- Loan Calculator All-In-1
- Loan Calculator - Smart Finance
- Loan Calculator - Smart

Naming recommendation as of 30 June 2026:

- Selected name: `Malaysia Loan & Finance Planner`.
- `Loan Calculator Malaysia` and `Financial Calculator Malaysia` are clearest for search.
- `Smart Finance Malaysia` sounds more expandable beyond loans.
- `Loan Calculator All-In-1` is clear but generic and less polished.
- `Loan Calculator - Smart` is short but vague.

## 4. Monetization

MVP monetization:

- Free app
- AdMob ads
- One-time "Remove Ads" purchase through Google Play Billing

Rules:

- Ads must not cover inputs, buttons, results, tables, or export actions.
- No external payment link inside the Android app for removing ads.
- Paid removal should be simple and affordable.

Possible pricing to test later:

- RM4.90
- RM7.90
- RM9.90

Final price should be decided closer to launch.

## 5. MVP Screens

### 5.1 Home / Hub

Purpose: Show current and future calculators.

Current modules:

- Home Loan: active
- Car Loan: beta
- Personal Loan: beta
- Credit Card: beta
- PTPTN Loan: beta
- Personal Profile: beta, drawer
- Overall Loans: beta, drawer

Main actions:

- Start home loan calculation
- Remove ads
- Open Personal Profile from the hamburger drawer
- Open Overall Loans from the hamburger drawer

### 5.2 Home Loan Input

Purpose: Let users enter property and loan assumptions.

Inputs:

- Property price
- Down payment amount or percentage
- Loan margin percentage
- Loan amount
- Conventional or Islamic financing mode
- Interest/profit rate
- Tenure in years
- Buyer type
- First-time buyer toggle
- New project or subsale toggle
- Optional monthly gross income
- Optional existing monthly commitments
- Editable target DSR

Nice-to-have later:

- Bank name
- Lock-in period
- MRTA/MRTT amount
- Extra monthly payment

### 5.3 Result Summary

Purpose: Answer the user quickly.

Show:

- Estimated monthly installment
- Total loan amount
- Total interest over tenure
- Total upfront cash needed
- Loan-to-value percentage
- Estimated debt service ratio if income is provided
- Tenure comparison for affordability guidance

Actions:

- View fee breakdown
- View amortization
- Save scenario
- Share/export

### 5.4 Fee Breakdown

Purpose: Build trust by explaining the cash needed before purchase.

Include:

- Down payment
- MOT stamp duty
- Loan agreement stamp duty
- SPA legal fee estimate
- Loan legal fee estimate
- Valuation fee estimate
- Disbursement estimate
- MRTA/MRTT optional estimate
- Fire insurance optional estimate
- Buffer amount

Each fee should show:

- Amount
- Formula or basis
- Editable assumption if needed
- Source or "last reviewed" note

### 5.5 Amortization

Purpose: Show how the loan behaves over time.

MVP view:

- Monthly payment
- Total interest
- Remaining balance at selected year
- Simple year-by-year table

Later:

- Full monthly schedule
- Extra payment simulation
- Refinancing comparison

### 5.6 Saved Scenarios

Purpose: Help users compare properties.

Target release: v1 local-only, v1.1 cloud sync later.

Planned fields:

- Scenario name
- Property price
- Monthly installment
- Upfront cash needed
- Date saved

Implemented v1 local fields:

- Scenario name
- Created date
- Calculator type
- For home loan: property price, down payment percentage, interest/profit rate, tenure, SPA date, buyer type, purchase type, first residential home toggle, editable professional fee values, monthly installment, upfront cash, and total interest/profit estimate
- For car loan: vehicle price, down payment percentage, flat rate, tenure, upfront fee buffer, monthly installment, total interest, total repayment, and upfront cash
- For personal loan: loan amount, interest-rate method, interest rate, tenure, editable stamp duty rate, upfront fee buffer, monthly installment, total interest, total repayment, and estimated total cost
- For credit card: outstanding balance, finance charge rate, fixed monthly payment, optional new monthly spending, editable minimum-payment assumption, payoff time, minimum-payment-only comparison, total interest, total paid, and remaining balance if not cleared
- For PTPTN: outstanding balance, editable Ujrah/service charge rate, selectable reducing-balance or flat-rate method, target tenure, optional extra payment, monthly repayment, total service charge, total repayment, payoff time, and final payment

Local v1 data rules:

- Saved scenarios are stored on the user's device only.
- Optional salary profile is stored on the user's device only.
- Ongoing loan commitments are stored on the user's device only.
- No developer-side database, Google account, or cloud sync in v1.
- Users can open, compare summary cards, delete individual scenarios, or delete all local saved data including the salary profile and ongoing loans.
- Uninstalling the app may remove local saved scenarios, ongoing loans, and salary profile.

Later:

- Side-by-side comparison
- Export comparison PDF
- Notes and agent/contact fields
- Optional Google login and cloud sync

### 5.7 Settings

Purpose: Business, trust, and app controls.

Include:

- Remove ads
- Restore purchase
- Currency: MYR
- Language: English in v1, Bahasa Malaysia later
- Disclaimer
- Privacy policy link
- Contact support
- Formula/rules version
- Local data controls

### 5.8 Salary & Affordability Planner

Purpose: Let users personalize loan planning with their own income and expenses.

Navigation:

- This sits under the hamburger drawer as `Personal Profile`, not as a calculator card.
- The profile is treated as persistent user context rather than a one-off calculation.

Inputs:

- Gross monthly salary
- Editable EPF employee contribution rate
- Editable SOCSO employee estimate
- Editable EIS employee estimate
- Editable SOCSO/EIS wage ceiling
- Optional PCB/tax deduction amount
- Existing monthly commitments
- Monthly living expenses
- Target savings percentage
- Target DSR percentage
- Loan installment to evaluate
- Optional asset/property price
- Optional expected monthly rent/income
- Optional upkeep or investment expenses

Outputs:

- Estimated take-home pay
- EPF/SOCSO/EIS/PCB deduction estimates
- Remaining cash before and after evaluated loan
- Remaining cash after target savings
- Current DSR and DSR after evaluated loan
- Suggested maximum installment using both DSR and cashflow targets
- Cashflow fit status: Comfortable, Review, High pressure, or N/A
- Optional investment cashflow, gross yield, and net yield before tax

Compliance:

- This is cashflow and affordability guidance only.
- It must not claim to decide whether an investment is good or guaranteed.
- Salary profile saving is optional and local-only in v1.
- Users can delete the local salary profile from Local Data Controls.
- EPF, SOCSO, EIS, and PCB assumptions are editable because official contribution schedules, wage ceilings, tax status, and payroll treatment can vary.

### 5.9 Overall Loans

Purpose: Help users see ongoing loan commitments and remaining monthly cash.

Inputs:

- Saved Personal Profile
- Ongoing loan name
- Ongoing loan type
- Monthly payment
- Optional outstanding balance

Outputs:

- Estimated money left after take-home pay, other commitments, living expenses, and listed ongoing loans
- DSR including listed ongoing loans
- Remaining after savings target
- Total listed monthly loan payments
- Known outstanding balances when entered

Local data rules:

- Ongoing loans are separate from saved calculator scenarios.
- Saved scenarios are plans; ongoing loans are active obligations.
- Ongoing loans are local-only in v1 and are deleted from Local Data Controls.

## 6. Must-Have Calculators For MVP

### 6.1 Monthly Installment

Use standard reducing-balance amortization.

Outputs:

- Monthly payment
- Total repayment
- Total interest
- Balance over time

### 6.2 Upfront Cash Needed

Outputs:

- Total upfront cash
- Cash before loan
- Government/statutory costs
- Professional fees
- Optional insurance/protection costs

Implemented professional fee approach:

- The app pre-fills estimated SPA legal fee, loan legal fee, valuation fee, SST/service tax, and disbursement buffer.
- Users can edit those figures to match actual lawyer, bank, valuer, or developer package quotations.
- If the user has not edited the professional-fee fields, the app can refresh estimates from the current property price, loan amount, and purchase type.

Professional fee assumptions, last reviewed on 30 June 2026:

- SPA legal fee estimate uses the Solicitors' Remuneration Order 2023 scale: 1.25% on the first RM500,000, 1.0% on the next RM7,000,000, and 1.0% above RM7,500,000 as a conservative estimate, subject to the order's negotiation wording for very high values.
- Loan legal fee estimate uses the same current legal fee scale on the loan amount. Additional subsidiary/security instruments can vary by bank/lawyer and are not fixed in v1.
- HDA/new-project mode applies the SRO 2023 discounted scale: RM500 up to RM50,000, 75% up to RM250,000, 70% up to RM500,000, 65% up to RM1,000,000, and 50% above RM1,000,000.
- Valuation fee estimate uses the LPEPH capital valuation scale with a RM400 minimum.
- SST/service tax estimate uses 8% on the estimated professional fees, but remains editable because actual tax treatment depends on provider registration and invoice treatment.
- Disbursement buffer defaults to RM1,500 and is editable because search, registration, transport, printing, and bank panel charges vary.

Primary references checked:

- Solicitors' Remuneration Order 2023 via Malaysian Bar document mirror: `https://www.malaysianbar.org.my/cms/upload_files/document/Solicitors%20Remuneration%20Order%202023.pdf`
- LPEPH fees page: `https://lpeph.gov.my/fees`
- RMCD MySST service tax policy page: `https://mysst.customs.gov.my/TaxPolicy`
- RMCD professional services guide: `https://mysst.customs.gov.my/assets/document/industry%20guides/gi/guide%20on%20professional%20services%2020210921.pdf`

### 6.3 Stamp Duty

Include:

- MOT stamp duty
- Loan agreement stamp duty
- First-time buyer exemption mode

Important:

- Keep stamp duty logic configurable.
- Show source and last-reviewed date.
- Do not hide assumptions.

Implemented v1 assumptions, last reviewed on 30 June 2026:

- Standard Malaysian/PR residential transfer duty uses 1% on the first RM100,000, 2% on the next RM400,000, 3% on the next RM500,000, and 4% above RM1,000,000.
- Residential loan agreement stamp duty uses 0.5% of loan value.
- First residential home exemption is 100% on the instrument of transfer and loan agreement for Malaysian citizens buying a first residential home priced up to RM500,000, for SPA dates from 1 January 2026 to 31 December 2027.
- Foreign individual buyers, excluding Malaysian permanent residents, and foreign companies use 8% transfer duty for residential homes executed from 1 January 2026.

Primary references checked:

- Malaysia Ministry of Finance Budget 2026 tax measures: `https://belanjawan.mof.gov.my/pdf/belanjawan2026/ucapan/tax-measures.pdf`
- LHDN stamp duty overview: `https://www.hasil.gov.my/en/stamp-duty/`
- LHDN Budget 2020 appendix for property transfer duty bands: `https://phl.hasil.gov.my/pdf/pdfam/Budget_2020.pdf`
- LHDN appendix noting residential property loan agreement duty at 0.5%: `https://phl.hasil.gov.my/pdf/pdfam/Appendix2012.pdf`

### 6.4 First-Time Buyer Mode

Ask eligibility-style questions:

- Malaysian citizen?
- First residential home?
- Property price range?
- SPA date?
- New project or subsale?

Output should explain:

- Possible stamp duty exemption
- Possible housing loan interest tax relief
- SJKP/SJKP MADANI may be relevant

Avoid promising approval or exact eligibility.

## 7. Compliance And Trust

The app must clearly say:

- It is a calculator and educational tool.
- It is not a bank.
- It is not a lender.
- It does not provide financial advice.
- It does not guarantee loan approval.
- Estimates may differ from bank, lawyer, valuer, or government office calculations.

Need before Play Store launch:

- Privacy policy
- Terms/disclaimer page
- Financial features declaration
- AdMob policy compliance
- Google Play Billing setup for remove ads

Implemented draft in-app compliance screens:

- Privacy Notice
- Disclaimer
- Local Data Controls

These are product-draft screens and should be reviewed against the final data flows, privacy policy URL, and Malaysian PDPA obligations before public launch.

Future Google login / cloud sync guardrails:

- Use Google Sign-In only after a privacy policy URL is ready.
- Store each user's scenarios under their own authenticated user ID.
- Use Firestore security rules so users can only access their own records.
- Provide delete-account/delete-cloud-data flow.
- Do not allow developer staff to inspect identifiable salary or loan records unless clearly disclosed and consented.
- Prefer aggregate analytics for business insights.

Salary / affordability guardrails:

- Treat salary and debt commitments as sensitive financial information.
- Make salary optional.
- Explain why the app asks for salary before collection.
- Keep affordability output as guidance, not loan approval prediction.
- Update privacy notice, Google Play Data Safety, and any analytics consent before release.

Implemented v1 affordability behavior:

- Monthly income and existing monthly commitments are optional.
- Target DSR defaults to 40% and can be edited by the user.
- Current DSR is estimated as `(existing monthly commitments + estimated installment) / monthly gross income`.
- Tenure comparison shows 20, 25, 30, and 35-year installment/DSR options.
- Salary and commitment fields are not saved into local scenarios in this version.
- The app explains that affordability guidance is not a loan approval prediction.

Implemented v1 personal profile behavior:

- Personal Profile estimates take-home pay after editable EPF, SOCSO, EIS, and PCB/tax assumptions.
- Users can save an optional local salary profile on-device and delete it from Local Data Controls.
- Planner compares a loan installment against DSR target and remaining cashflow after living expenses and savings target.
- Optional investment view estimates monthly cashflow, gross yield, and net yield before tax.
- Output labels use cashflow fit status, not investment advice.
- Primary assumption references: KWSP mandatory contribution page, PERKESO contribution rate page, LHDN MyTax portal, and BNM responsible financing practices.

Implemented v1 overall loans behavior:

- Overall Loans screen is accessible from the hamburger drawer.
- Users can manually add ongoing loan commitments with type, monthly payment, and optional outstanding balance.
- Overall Loans combines the saved Personal Profile with ongoing loans to show monthly remaining cash and DSR.
- Local Data Controls deletes ongoing loans along with saved scenarios and the salary profile.

Implemented v1 Islamic financing behavior:

- Home loan module has a Conventional/Islamic selector.
- Islamic mode labels the rate as profit rate.
- Monthly installment is still a planning estimate using the same amortization-style calculation.
- The assumptions screen explains that actual Islamic product structures, ibra treatment, sale price, and bank terms may differ.

Future PTPTN module notes:

- PTPTN is now a separate education-loan repayment calculator, not mixed into the home-loan result.
- Initial inputs include outstanding balance, target repayment period, editable Ujrah/service-charge assumption, and optional extra monthly payment.
- PTPTN data should start local-only unless account sync is later added with consent.

Implemented beta non-home calculators:

- Car loan calculator uses a hire purchase flat-rate estimate and shows an effective reducing-balance equivalent for comparison.
- Personal loan calculator supports reducing-balance and flat-rate methods, plus an editable loan agreement stamp duty rate.
- Credit card payoff calculator uses a simplified monthly projection and compares the entered payment with a minimum-payment-only path.
- PTPTN calculator defaults to a reducing-balance Ujrah planning estimate and keeps flat-rate mode available for simplified statement matching.
- These beta calculators now support local saved scenarios and quick summary-card comparison.
- Saved scenarios can be promoted into Overall Loans so planned commitments can become active monthly commitments without retyping.
- They do not yet support advanced side-by-side comparison tables, export, bank-specific packages, campaigns, or account sync.

## 8. Technical Direction

Framework:

- Flutter

Initial target:

- Android / Google Play Store

Installed local tools:

- Android Studio
- Flutter SDK
- Android SDK
- Android emulator: LoanCalc_Pixel
- VS Code with Flutter/Dart extensions

Suggested architecture:

- Pure Dart calculation engine
- Flutter UI layer
- Local storage for saved scenarios
- Config file for Malaysia fee/rule assumptions
- Tests for every formula

Likely packages:

- `intl` for currency formatting
- `shared_preferences` for local saved scenarios
- `google_mobile_ads` for AdMob
- `in_app_purchase` for Google Play Billing

## 9. Build Sequence

### Step 1: Create Flutter Project

Create the app shell and verify it runs on emulator.

Status: done. The Flutter project lives in `app/`, uses package name `com.spetrality.financecalculator`, and has a basic Android app shell.

### Step 2: Build Calculation Engine

Add pure Dart functions for:

- Monthly installment
- Total interest
- Amortization summary
- Stamp duty
- Upfront cost breakdown

Add tests before building complex UI.

Status: done for the first version. The calculation engine now covers reducing-balance monthly installment, yearly amortization, Malaysia transfer stamp duty, loan agreement stamp duty, first-home exemption mode, foreign residential transfer duty, professional fee estimates, and upfront cash totals.

### Step 3: Build MVP UI

Screens:

- Home
- Input
- Result
- Fee breakdown
- Settings

Status: started. The Home Loan screen now accepts inputs and shows monthly installment, loan amount, down payment, upfront cash, stamp duty, editable professional fees, optional affordability guidance, Conventional/Islamic mode, fee breakdown, and amortization preview. Local saved scenarios, optional local salary profile, ongoing-loan commitments, draft policy screens, and an in-app Assumptions & Sources screen are implemented. Car, Personal Loan, Credit Card, PTPTN, Personal Profile, and Overall Loans beta screens are implemented with editable assumptions. The latest calculator pass adds car-loan effective-rate visibility, personal-loan method selection and stamp duty, credit-card minimum-payment comparison, PTPTN reducing-balance Ujrah mode, and saved-scenario promotion into Overall Loans. Next UI work should improve editing ergonomics, comparison flows, and visual identity.

### Step 4: Add Ads

Use test ads first.

### Step 5: Add Remove Ads

Use Google Play Billing test product first.

### Step 6: Prepare Store Requirements

Create:

- App icon
- Screenshots
- Description
- Privacy policy
- Disclaimer
- Financial declaration answers

### Step 7: Closed Testing

Test with a small group before public launch.

## 10. Out Of Scope For MVP

Do not build yet:

- Bank rate scraper
- User accounts
- Website payment
- Cloud sync
- AI chatbot
- Complex PDF reports
- iOS version

These can come after the first stable Play Store release.

## 11. Immediate Next Decision

Next build decision:

1. Add app icon and Play Store-ready privacy policy URL before ads/billing.
2. Add more user-friendly validation messages and source-link handling.
3. Prepare Play Store screenshots once the visual identity is chosen.
4. Decide app name and visual identity.

Already decided:

- Package name: `com.spetrality.financecalculator`
- v1 language: English only
- Saved scenarios: local-only in v1, Google sync later
- App name: Malaysia Loan & Finance Planner

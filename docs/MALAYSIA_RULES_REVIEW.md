# Malaysia Loan Rules Review

Last reviewed: 30 June 2026

This file tracks the assumptions used by the calculator app. The app should keep law-backed estimates visible but editable because actual bank quotes, statement cycles, legal invoices, promotions, account status, and borrower profiles can differ.

## Home Loan

- MOT transfer duty: tiered estimate at 1% on the first RM100,000, 2% on the next RM400,000, 3% on the next RM500,000, and 4% above RM1,000,000.
- Loan agreement stamp duty: planning estimate at 0.5% of loan value.
- First residential home exemption: app estimates full exemption for eligible Malaysian citizens buying a first residential property priced up to RM500,000 for SPA dates from 1 January 2026 to 31 December 2027.
- Foreign residential buyer duty: app estimates 8% transfer duty from 1 January 2026.
- Legal fees: app uses the Solicitors Remuneration Order 2023 scale as an editable estimate.
- Valuation fees: app uses the LPEPH capital valuation scale with an editable result.

## Car Loan

- Malaysia hire purchase products commonly quote flat rates, so the app keeps the flat-rate installment calculation.
- The app now also shows an estimated effective reducing-balance annual rate so users can compare the real financing cost more clearly.
- Insurance, road tax, early settlement, rebates, dealer fees, and approval outcomes remain outside the v1 calculation.

## Personal Loan

- The app supports both reducing-balance and flat-rate methods because Malaysian personal loan offers can be quoted either way.
- Loan agreement stamp duty is shown as an editable percentage, defaulting to 0.5% as a planning assumption.
- Bank processing fees, campaigns, takaful/insurance, and disbursement treatment remain editable/user-entered.

## Credit Card

- The payoff calculator uses a simplified monthly finance-charge projection.
- Minimum-payment assumptions remain editable because issuers can set different repayment terms.
- The app now compares the entered monthly payment with a minimum-payment-only projection to show avoidable finance charges.
- Daily interest, statement cycles, late fees, annual fees, compounding details, and issuer-specific rules are not included in v1.

## PTPTN

- The app defaults to a reducing-balance Ujrah planning method and keeps flat-rate mode available for simplified statement matching.
- Ujrah rate, tenure, and extra monthly payment are editable.
- Users must verify actual account schedules, arrears, discounts, salary deductions, restructuring, and settlement treatment with the official PTPTN portal or statement.

## Personal Profile And Overall Loans

- EPF, SOCSO, EIS, PCB/tax, savings target, and DSR are editable assumptions.
- Overall Loans combines saved profile data with active monthly loan commitments stored locally on the device.
- Saved scenarios are planning snapshots; Overall Loans are active commitments. A saved scenario can now be promoted into Overall Loans.

## Primary References To Recheck Before Release

- LHDN stamp duty overview: https://www.hasil.gov.my/en/stamp-duty/
- LHDN stamp duty orders: https://www.hasil.gov.my/en/stamp-duty/stamp-duty-order/
- LHDN loan agreement duty appendix: https://phl.hasil.gov.my/pdf/pdfam/Appendix2012.pdf
- Solicitors Remuneration Order 2023: https://www.malaysianbar.org.my/cms/upload_files/document/Solicitors%20Remuneration%20Order%202023.pdf
- LPEPH fees page: https://lpeph.gov.my/fees
- RMCD MySST tax policy: https://mysst.customs.gov.my/TaxPolicy
- BNM responsible financing practices: https://www.bnm.gov.my/-/measures-to-promote-responsible-financing-practices
- KWSP mandatory contribution: https://www.kwsp.gov.my/en/employer/responsibilities/mandatory-contribution
- PERKESO contribution rates: https://www.perkeso.gov.my/en/rate-of-contribution.html
- PTPTN official portal: https://www.ptptn.gov.my/

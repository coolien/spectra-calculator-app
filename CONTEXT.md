# Spectra Calculator

A Malaysia-focused personal finance planning app. It answers one question in many
forms: *can I actually afford this?* — for a home, a car, a credit card, a personal
loan, or PTPTN repayment. It teaches while it calculates; the number is never the
whole answer.

Delivered as a Next.js PWA at `calculatorapp.spectramsia.com`, published to Google
Play as a TWA wrapping that same PWA.

## Language

**Profile**:
The user's own financial situation — income, commitments, savings, protection,
credit standing. The single source of truth every calculator reads its defaults from.
_Avoid_: account, user data

**Calculator**:
One financing question with its own inputs and result (home, car, personal, credit
card, PTPTN, faraid).
_Avoid_: tool, module

**Engine**:
The deterministic code that turns calculator inputs into money figures. Lives in
`web/src/lib/finance/`. Contains no UI and no judgment.
_Avoid_: logic, service

**DSR** (Debt Service Ratio):
Monthly commitments divided by income, as a percentage. **In this codebase DSR is
computed on _net_ income** (`profile-engine.ts`), which is stricter than the gross
basis most Malaysian banks quote. **This is undecided, not agreed** — it was found in
the code, not chosen. Resolve before launch.
_Avoid_: debt ratio, affordability ratio

**Flat rate**:
Interest charged on the original principal for the whole tenure, and *not* interchangeable
with a reducing-balance rate. **Legacy only** — the Hire-Purchase (Amendment) Act 2026
abolished flat rates for agreements signed from 1 June 2026, which now use EIR on a
reducing balance. Agreements before that date keep the old treatment, so both paths must
stay in the code.
_Avoid_: fixed rate ("fixed" now means fixed-vs-variable EIR, a different axis)

**Reducing balance**:
Interest charged on the outstanding balance, recalculated each period. Housing and
personal loans work this way.
_Avoid_: amortised rate

**EIR** (Effective Interest Rate):
The reducing-balance rate equivalent to a given flat rate. What makes a flat-rate car
loan comparable to a housing loan.

**Rule of 78**:
The statutory early-settlement rebate formula, `k(k+1) / n(n+1)`. Applies to legacy
hire purchase agreements.

**Reality check**:
A teaching view that shows what a financing choice actually costs over its life,
rather than just the monthly instalment.
_Avoid_: summary, breakdown

**Cloud sync**:
Optional, consented copying of the user's profile and saved scenarios to Supabase so
they carry across devices. Never required to use a calculator. See ADR-0005.
_Avoid_: backup, account sync

**Literacy content**:
Original written material teaching Malaysian personal finance, published at its own
URL. Distinct from in-app helper text.
_Avoid_: articles, blog, content

## Boundaries

- The app gives **education, not financial advice**. It never recommends a specific
  bank or product.
- It must never collect NRIC, bank account numbers, card numbers, OTPs, payslips, or
  loan documents.
- Every calculator works fully offline and without an account.

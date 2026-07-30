# Rate Audit — 30 July 2026

Audit of every policy value in `web/src/lib/finance/malaysia-2026-config.json` against
primary and reputable secondary sources, per ADR-0006.

**Headline: no wrong rates found.** Every value checked matched its source. The findings
below are about *structure* — values that are correct today but unsourced, approximated,
or missing a dimension.

## VERIFIED

| Value | In config | Source |
| --- | --- | --- |
| MOT stamp duty tiers | 1% / 2% / 3% / 4% at 100k / 500k / 1m boundaries | LHDN schedule, corroborated across guides |
| Foreign buyer MOT | 8% flat | Budget 2026 |
| Loan agreement stamp duty | 0.5% | LHDN |
| First-home exemption | 100% MOT + loan agreement, up to RM500,000 | Budget 2026, extended to 31 Dec 2027 |
| Housing loan interest relief | RM7,000 ≤500k; RM5,000 500–750k; 3 consecutive YAs | Budget 2026 / LHDN, SPA between 1 Jan 2025–31 Dec 2027 |
| EPF employee rate | 11% | KWSP statutory rate, under 60 |
| SOCSO employee | 0.5%, ceiling RM6,000 | PERKESO, ceiling raised from RM5,000 on 1 Oct 2024 |
| EIS employee | 0.2%, ceiling RM6,000 | PERKESO |
| Credit card finance charge cap | 18% p.a. | BNM — max 1.5%/month |
| Credit card tiers | 15% / 17% / 18% | BNM tiered pricing structure, still in force |
| Credit card minimum payment | 5%, floor RM50 | BNM (raised from 3%) |
| Credit card min income | RM24,000 p.a. | BNM credit card guidelines |
| PTPTN ujrah | 1% p.a. | PTPTN |
| PTPTN discounts | 15% full settlement / 10% partial or salary deduction / 10% consistent | PTPTN 2026 incentives |
| HP Act effective date | 1 June 2026, grace to 31 Mar 2027 | Hire-Purchase (Amendment) Act 2026 |

The HP EIR caps (fixed 17% ≤5y / 16% >5y, variable 17%) are cited in
`SPEC-Car-Loan-2026.md` to BNM's consumer guide via Business Today and The Edge. The test
suite independently reproduces the official guide's published EIR example. Treated as
verified, but see UNVERIFIED-1 — I could not confirm the caps from BNM's own page directly.

## UNVERIFIED — needs a source or a visible "estimate" label

~~**UNVERIFIED-1 — HP EIR caps not confirmed at primary source.**~~
**RESOLVED — VERIFIED 30 Jul 2026** against `HP Consumer Guide_EN_2026.pdf` p.6 (text
extracted with `pdftotext -layout`):

> "The EIR is capped at 17% p.a. for loans with tenures of up to 5 years and 16% p.a. for
> loans with tenures of more than 5 years" (fixed rate) · "The EIR is capped at 17% p.a.
> for all loan tenures as per the existing Hire-Purchase (Term Charges) Regulations 2005"
> (variable rate)

Config matches exactly: `fixed: [{maxTenureMonths: 60, capPercent: 17}, {maxTenureMonths:
null, capPercent: 16}]`, `variable: [{maxTenureMonths: null, capPercent: 17}]`.

The guide also confirms `legislationEffectiveDate: '1 June 2026'` and
`providerGracePeriodEnd: '31 March 2027'`, and states the previous maximum flat rate was
10% p.a. — the caps are its EIR conversion, tenure-dependent. Note the guide says the 17%
threshold "is subject to periodic review by the authorities", so this needs re-checking.

**UNVERIFIED-2 — `personalLoan.flatToEirApprox = 1.88`.**
A multiplier converting flat rate to EIR. This is a rule of thumb, not a statutory or
derivable constant — true EIR depends on tenure. Not attributable to any source.
*Recommendation:* compute EIR properly per tenure as the car loan engine already does, or
label the output an approximation in the UI.

**UNVERIFIED-3 — legal fee scale and valuation fee bands.**
`legalFeeScaleSRO2023` (min RM500, 25% max negotiable discount, disbursements
RM1,000–1,500) and `valuationFeeScale` (min RM50) come from the Solicitors' Remuneration
Order. Not independently confirmed here. Check the SRO text.

**UNVERIFIED-4 — indicative financing rates.**
`sbrIndicative 3%`, `spreadRange 0.85–1.2%`, `typicalRate 4%`,
`islamic.ceilingProfitRateIndicative 10%`. These are market observations, not rules — they
move with OPR and by bank. They are named "indicative", which is honest, but they must be
visibly editable and dated in the UI.

**UNVERIFIED-5 — DSR benchmark bands.**
`≤40% comfortable / 40–60% bank-dependent / >60% high risk` is a reasonable industry
convention, not a BNM rule. Fine to keep — but it should not be presented as a regulation.

## Defects found

**DEFECT-1 — EPF rate ignored age.** *(fixed 30 Jul 2026)*
Config held a flat 11%; the statutory rate drops to **5.5% at 60**. Net income — and every
DSR and affordability verdict downstream — was wrong for users aged 60+.
Fix: added `epfEmployeeRateFromAge60: 0.055` and `epfReducedRateFromAge: 60` to config,
plus `epfEmployeeRateForAge()`. `netMonthlyIncome()` now accepts `age`, and
`profile-engine` passes it. Unknown age keeps the under-60 rate.
Covered by `EPF employee rate halves at 60 and lifts net income`.

**DEFECT-2 — DSR verdict banded on net income.** *(fixed 30 Jul 2026)*
`calculateDSR` already returned both `dsrNet` and `dsrGross`, but chose its verdict band
using **net**, while Malaysian banks assess DSR on **gross**. The app was stricter than any
bank and would tell people they could not afford something they would be approved for.
Fix: band on `dsrGross`, add `verdictBasis: 'gross'` to the result, and score the
`affordability` pillar on gross. `dsrNet` remains exposed as the honest cash-flow figure —
it just no longer drives the verdict.
Covered by `DSR verdict bands on gross income, the basis banks assess`.

*Remaining UI work:* both numbers are now available, so the interface should show which
basis it is quoting rather than a bare "DSR".

**DEFECT-3 — stale copy about flat rates.** *(fixed 30 Jul 2026)*
`/about` stated Malaysian car financing is charged on a flat rate. That has been false
since 1 June 2026. Corrected to describe the EIR/reducing-balance regime with the legacy
carve-out. `CONTEXT.md` carried the same error and was corrected.

## Not audited

`insurance` and `epfWithdrawal` config blocks exist only in `docs/archive/` and are not in
the live config (ADR-0002). Audit them if those features get built.

RPGT and faraid rules were not reviewed in this pass.

## Method note

Values were checked against BNM, KWSP, PERKESO, LHDN and PTPTN publications where
reachable, and against multiple independent secondary sources otherwise. Several results
came from SEO-driven calculator sites that are effectively competitors; those were used
only for corroboration, never as a sole source. Nothing in this table rests on recall
alone — anything I could not source is listed as UNVERIFIED rather than assumed correct.

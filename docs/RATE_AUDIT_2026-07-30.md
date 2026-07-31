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
| ~~PTPTN discounts~~ | **RETRACTED — see DISPUTED-1** | — |
| HP Act effective date | 1 June 2026, grace to 31 Mar 2027 | Hire-Purchase (Amendment) Act 2026 |

The HP EIR caps (fixed 17% ≤5y / 16% >5y, variable 17%) are cited in
`SPEC-Car-Loan-2026.md` to BNM's consumer guide via Business Today and The Edge. The test
suite independently reproduces the official guide's published EIR example. Treated as
verified, but see UNVERIFIED-1 — I could not confirm the caps from BNM's own page directly.

## DISPUTED — highest priority

> **RESOLVED 31 Jul 2026 — confirmed a defect, and fixed.** The owner supplied a capture of
> `ptptn.gov.my/DiskaunPTPTN/`. It states **"Tempoh Diskaun : 14 Oktober 2023 – 31 Mac
> 2024"** — the scheme expired over two years ago. The tiers were also mapped wrongly in
> config: the real scheme was **10%** full settlement, **10%** for paying ≥50% of the
> balance, and **15%** for salary deduction / direct debit. Config had the 15% on full
> settlement, overstating it by half against a scheme that no longer existed.
>
> Fixed: `discountsActive: false`, `discounts2026: []`, the expired scheme retained under
> `expiredDiscountScheme` for explanation only, and `settlementWithDiscount()` now returns a
> zero discount with a note. The PTPTN calculator reads "None currently offered" and warns
> that settling costs the full balance. Pinned by
> `PTPTN settlement quotes no discount, because none is currently offered`.
>
> The original finding is kept below, unedited, as the record of how it was caught.

**DISPUTED-1 — `ptptn.discounts2026` contradicted by PTPTN itself. BLOCKING.**

*Added 30 Jul 2026, correcting this document's own first pass.*

Config carries `discounts2026: [15% full settlement, 10% partial/salary deduction, 10%
consistent scheduled]`, and the first version of this audit marked those **VERIFIED**. That
was wrong. It rested on secondary sources — finance blogs and calculator sites — not on
PTPTN.

PTPTN's own official accounts state repeatedly, in reply to borrowers:

> "Buat masa ini tiada diskaun bagi bayaran balik pinjaman PTPTN berdasarkan Belanjawan
> 2026. Sekiranya ada pada masa akan datang, hebahan akan dilakukan melalui laman web rasmi
> serta saluran media baharu PTPTN."

Sources: [@PTPTNOfficial on X](https://x.com/PTPTNOfficial/status/2020662177112486330),
and the same statement on Threads
([1](https://www.threads.com/@ptptnofficial/post/DWf8A2ukX3V/),
[2](https://www.threads.com/@ptptnofficial/post/DUUnWCgkdGc/)).

`ptptn.gov.my/DiskaunPTPTN/` returns HTTP 403 to automated fetch, so the authoritative page
could not be read. It must be opened in a browser.

**Why this matters more than anything else in this document:** the live calculator shows a
user a settlement saving that may not exist. Someone could pay off a PTPTN loan early
expecting a 15% discount and receive nothing. That is real money, and it is exactly the
harm this audit exists to prevent.

**Not changed unilaterally.** The evidence is strong but not complete — a standing
SG-PTPTN salary-deduction incentive may exist independently of Budget 2026, which would
explain the secondary sources without vindicating the config. Silently zeroing a financial
figure on partial evidence would be its own kind of wrong.

**Required next step, in order:**
1. Open `ptptn.gov.my/DiskaunPTPTN/` in a browser and read what is actually offered today.
2. If no discount applies, remove or zero `discounts2026` and ship it as a correction.
3. If a discount applies but is not Budget-2026-derived, keep it and fix its provenance and
   label.
4. Until resolved, no PTPTN article may be published (see `docs/CONTENT_PIPELINE.md`).

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

**UNVERIFIED-3 — legal fee scale and valuation fee bands.** *(partly closed 30 Jul 2026)*
The **SRO 2023 scale itself is now corroborated**: 1.25% on the first RM500,000, 1% on the
next RM7,000,000, RM500 minimum, 25% maximum negotiable discount — matching config exactly,
per two independent Malaysian law firms
([JY Ko](https://jykolaw.com/legal-fees-solicitors-remuneration-order-2023-a-comprehensive-guide/),
[Nor Chambers](https://norchambers.com.my/2024/01/11/legal-fees/)). Worth noting several
ranking competitor calculators still use the superseded SRO 2005 scale (1.0% / 0.8%) and
therefore understate legal fees.

Still unverified: the RM1,000–1,500 **disbursements** range and the **valuation fee scale**.
Label both as estimates until sourced.

**UNVERIFIED-6 — car loan tenure and margin caps.**
`carLoan.tenureCaps` (9 years new / 7 used) and `carLoan.marginOfFinanceMax` (90%) were not
covered in the first pass. Source before any article quotes them.

**UNVERIFIED-7 — personal loan flat/Rule-78 abolition date.**
`personalLoan.flatAndRuleOf78AbolishedFrom: "2027-01-01"`. Secondary reporting supports a
1 Jan 2027 transition deadline for personal financing under a revised BNM policy document —
note this is **separate from the Hire-Purchase Act 2026**, and the two are widely conflated.
The BNM policy document itself must be obtained. Blocking for any personal loan article.

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

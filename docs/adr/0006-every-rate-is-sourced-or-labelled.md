# Every rate is either sourced or visibly labelled an estimate

Passing tests prove the maths is internally consistent; they say nothing about whether
the *rates* are right. Code that computes perfectly from a wrong stamp-duty band is
confidently wrong, which is more dangerous than a crash because the user acts on it.

Every policy value in `malaysia-2026-config.json` must carry a primary source (BNM,
LHDN, PTPTN, KWSP, the Hire-Purchase Act, Budget documents) and an effective date.
`HP Consumer Guide_EN_2026.pdf` is the anchor for car loans — the test suite already
reproduces its published EIR example.

Anything that cannot be sourced is marked `UNVERIFIED` and shown in the UI as an
estimate. It is never presented as fact and never silently guessed.

## Consequences

Rates need re-checking each Budget cycle. The config is the single place they live —
hardcoding a policy value anywhere else is a defect.

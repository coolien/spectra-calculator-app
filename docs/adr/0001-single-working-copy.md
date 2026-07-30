# One working copy, named "Loan Calculator App"

Two clones of `coolien/spectra-calculator-app` existed: `S/Calculator` (newest, with the
2026 engine work) and `Codex/Loan Calculator App` (3 commits behind). Work landed in the
first while the second was assumed to be the project, so features appeared to go missing.

We collapsed to a single working copy at `Desktop\Claude x Codex\S\Loan Calculator App`.
The old `S\Loan Calculator App` folder held only a stray `web/.next` build cache and was
deleted to free the name.

`Desktop\Codex\Loan Calculator App` is retained for now but is stale and must not be
worked in. Its only unique content — a `spectra Reference/` folder of 25 screenshots —
was copied across. Delete it once that is confirmed.

## Consequences

The 2026 engine commits (`56a8fe4`, `6c6a323`) exist **only on this disk** — they are
ahead of `origin/main` and unpushed. Push before relying on any backup.

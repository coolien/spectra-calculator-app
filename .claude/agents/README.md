# Spectra Calculator — agent team

Six specialist agents scoped to this repo. They live in `.claude/agents/` and are available to Claude Code whenever you work inside `Calculator/`.

| Agent | Owns | Reach for it when |
| --- | --- | --- |
| `malaysia-rules-auditor` | Correctness of Malaysian rules, rates, thresholds | A rate appears in code; new budget/tax year; "is this number still right?" |
| `calc-engine-verifier` | Deterministic math + tests in `spectra-2026-engine/` | Any engine change; a wrong-number report; before release |
| `literacy-content-writer` | User-facing copy, Learn content, BM translation | New screen text; jargon-heavy copy; explaining a result |
| `pwa-quality-engineer` | Build, service worker, offline, speed, deploy | Stale installed PWA; slow on Android; before Cloudflare Pages deploy |
| `spectra-design-reviewer` | Brand fidelity, mobile UX, accessibility | New or restyled screen; unreadable results; input flow drop-off |
| `privacy-compliance-reviewer` | PDPA, Supabase RLS, ads/analytics, legal copy | Anything that stores, syncs, logs, or transmits user data |
| `search-demand-researcher` | Picking what to write | Before any article — finds the real question and proves a calculator answers it |
| `article-writer` | Drafting one article, engine-grounded | After a topic is approved `WRITE`. Drafts only, never publishes |
| `article-publish-gate` | The last check before live | After **you** have read and approved a draft |

The last three are the Stage 2 content pipeline — see [docs/CONTENT_PIPELINE.md](../../docs/CONTENT_PIPELINE.md).

## How to use them

Ask for one by name:

```bash
claude "Use malaysia-rules-auditor to check every rate in spectra-2026-engine against the 2026 rules."
```

Or run several in parallel when the work is independent — e.g. design review and privacy review on the same PR.

## Suggested sequence for a new calculator

1. `/grill-me` — pin the spec down before coding (installed at `~/.claude/skills/grill-me/`).
2. `malaysia-rules-auditor` — confirm the rules and get them into `malaysia-2026-config.json`, not hardcoded.
3. Build the engine, then `calc-engine-verifier` — worked examples and edge cases must pass.
4. `literacy-content-writer` — copy and the "what this means for you" explainer.
5. `spectra-design-reviewer` — 360px mobile, contrast, focus, dark mode.
6. `privacy-compliance-reviewer` + `pwa-quality-engineer` — the pre-release gate.

## Principles baked into all six

- Calculations are deterministic code, never model judgment. Undefined logic is `BLOCKING`, never invented.
- Education, not financial advice. No product or bank recommendations.
- Never collect NRIC, bank account, card numbers, OTPs, payslips, or loan documents.
- Every calculator works offline and without an account; cloud sync is optional.
- Findings cite `file:line` and a real measurement or command output — no unverified claims.

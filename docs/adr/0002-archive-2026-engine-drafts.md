# The 2026 engine drafts are archived, not deleted

`spectra-2026-engine/` looked like duplicated code but was not. Nothing in `web/src`,
`web/tests`, or `web/scripts` imports it — it was a staging folder of drafts, and the
live code in `web/src/lib/finance/` is the adapted production version. The two had
diverged substantially (250 lines in `car-loan-engine.ts`, 160 in `profile-engine.ts`,
472 in `malaysia-2026-config.json`, mostly stripped documentation).

Moved untouched to `docs/archive/spectra-2026-engine/` (344 KB, 28 items) and gitignored.
Deleting it was rejected: it holds the only copy of the seven `SPEC-*.md` files, the
design prototypes, and the build order.

## Consequences

Two config blocks exist only in the archive and are absent from the live config:
`insurance` and `epfWithdrawal`. If those features get built, the rules are there.

Being gitignored, the archive is **not backed up by pushing**. It exists on this disk only.

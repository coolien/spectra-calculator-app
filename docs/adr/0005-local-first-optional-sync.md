# Local-first; cloud sync is promoted but never required

Cloud sync is the feature that makes users return, so it is heavily promoted. It is
still **optional**. Every calculator works fully with no account and no network.

Sign-in exists only to carry a profile across devices.

## Considered Options

Requiring an account was rejected on three grounds: a crawler cannot sign in, so a
signup wall would re-trigger the AdSense content rejection; every stored financial
profile is PDPA liability that scales with account count; and the codebase already
implements the optional path (`LegalConsentGate`, per-user `user_consents` rows).

## Consequences

`finance_profiles` holds salary, EPF balance, commitments, and CTOS band. That is
sensitive personal financial data under PDPA even though no NRIC, bank account, card
number, OTP, payslip, or loan document is ever collected — the deletion path across
`app_snapshots`, `user_consents`, and `profiles` must keep working.

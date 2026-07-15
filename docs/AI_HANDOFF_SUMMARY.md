# Spectra Calculator PWA - AI Handoff Summary

Last updated: 15 July 2026

## Product

Spectra is a Malaysia-focused personal finance planning PWA operated by
Spectrality Enterprise. The active product is the Next.js app in `web/`. The
older Flutter app in `app/` is reference code and is not the production target.

- Live app: `https://calculatorapp.spectramsia.com`
- GitHub: `coolien/spectra-calculator-app`
- Production branch: `main`
- Supabase project: `gmluepisjslxowncdxba`
- Hosting: Cloudflare Pages, automatically deployed from GitHub
- Current live release before this handoff update: `7f9edbc`

## Current Architecture

- Next.js 16 static-export PWA
- React 19 and TypeScript
- Generated service worker with commit-specific cache names
- Local-first browser persistence
- Optional Supabase passwordless email authentication and cloud snapshots
- Row Level Security restricts cloud records to `auth.uid() = user_id`
- Cloudflare serves the custom domain and triggers builds from `main`

Important files:

- `web/src/components/SpectraApp.tsx` - app navigation and state composition
- `web/src/lib/calculators.ts` - all financial and Faraid calculations
- `web/src/lib/i18n.ts` - English, BM, Chinese, and Tamil translations
- `web/src/hooks/useCloudSync.ts` - Supabase session and snapshot syncing
- `web/src/lib/local-store.ts` - local persistence
- `web/scripts/prepare-pwa.mjs` - build marker and service-worker generation
- `docs/supabase/migrations/20260714_nextjs_cloud_sync.sql` - production schema

## Features Live

- Home loan calculator
- Car hire-purchase calculator
- Personal loan calculator with reducing-balance and flat-rate methods
- Credit-card payoff calculator
- PTPTN/Ujrah calculator
- Faraid inheritance calculator for core direct heirs
- Personal salary and affordability profile
- Up to 15 separate salary profiles
- Saved calculator scenarios
- Side-by-side scenario comparison
- Active-loan tracking and payoff projections
- Optional Supabase cloud backup and restore
- Validated user data export and restore
- Light/dark appearance and selectable theme colours
- Installable Spectra ring PWA icon
- First-use Terms and Privacy consent gate
- English, casual Bahasa Malaysia, Chinese, and Tamil interface
- Placeholder RM88.88 Remove Ads screen; payment is not enabled

## Data And Privacy

The app works without an account. Local data remains in the browser. When a
user signs in, the app syncs a versioned snapshot to Supabase. Current synced
data includes profiles, calculator drafts, saved scenarios, active loans,
preferences, language, and consent metadata.

Never collect NRIC, OTPs, card numbers, banking passwords, payslips, or official
loan documents. The client must only use the Supabase publishable key. Never put
the service-role key in the web bundle, GitHub, or Cloudflare.

## PWA Updating

`npm run build` runs `scripts/prepare-pwa.mjs`, which creates:

- `web/public/sw.js`
- `web/public/spectra_build.json`

Production uses the Cloudflare/GitHub commit SHA as the cache version. Local
development uses a timestamped `dev-*` cache version so an old service worker
does not hide uncommitted changes. The app asks an updated service worker to
activate and reloads when its controller changes.

To verify a deployment, confirm the live build ID and service worker contain
the pushed commit SHA:

```powershell
Invoke-WebRequest -UseBasicParsing `
  https://calculatorapp.spectramsia.com/spectra_build.json
```

## Development And Verification

```powershell
cd "C:\Users\khoom\Desktop\Codex\Loan Calculator App\web"
npm ci
npm test
npm run typecheck
npm run build
```

The Node test suite covers calculator formulas, validation, Faraid allocation,
dynamic currency translations, and all supported language families. Add a
regression test whenever calculator or translation behavior changes.

## Deployment

1. Run tests, typecheck, and production build.
2. Commit only intended files; do not add local design references accidentally.
3. Push `main` to `origin`.
4. Wait until `spectra_build.json` reports the new commit.
5. Verify `/`, `/manifest.webmanifest`, `/sw.js`, and install icons return 200.

Untracked design/reference files at the repository root are intentionally not
part of normal releases unless the owner explicitly requests them.

## External Work Still Required

These cannot be completed only in code:

- Google AdSense approval and ad-unit IDs
- A payment provider and merchant approval for Remove Ads
- Legal review of Terms, Privacy Notice, PDPA position, and financial disclaimers
- Professional verification of Malaysia fee assumptions and Faraid scope
- A production backup/retention decision before users depend on cloud storage

Do not show real ads or accept payment until the relevant accounts, consent
flow, privacy wording, and production credentials are ready.

## Product Direction

Keep Spectra beginner-friendly, local-first, and honest about estimates. Prefer
plain language, editable assumptions, and direct comparisons. Do not imply bank
approval, legal advice, tax advice, Syariah rulings, or guaranteed outcomes.

Good future features after reliability work:

- Export individual results as PDF
- Extra-payment and early-settlement planner
- Refinancing comparison
- Property ownership cost planner
- Reminders to refresh active-loan balances
- Dedicated legal pages on `spectramsia.com`

# Spectra Calculator PWA - AI Handoff Summary

Last updated: 20 July 2026

## Read This First

Spectra is a Malaysia-focused personal finance planning PWA operated by
Spectrality Enterprise. The production target is the Next.js app in `web/`.
The older Flutter app in `app/` is reference material only and must not be
treated as the current production source.

Keep all project data, credentials, screenshots, prompts, user data, and
deployment information private. Never place secrets in this file, GitHub, the
client bundle, or a public deployment.

## Product And Accounts

- Product name: Spectra
- Company: Spectrality Enterprise
- Live calculator PWA: https://calculatorapp.spectramsia.com
- Company website: https://spectramsia.com
- Public legal hub: https://spectramsia.com/legal
- GitHub repository: `coolien/spectra-calculator-app`
- GitHub production branch: `main`
- Supabase project ref: `gmluepisjslxowncdxba`
- Supabase URL: `https://gmluepisjslxowncdxba.supabase.co`
- Hosting: Cloudflare Pages, connected to GitHub `main`
- DNS/domain provider: Cloudflare, zone `spectramsia.com`

The original project/repository and Supabase project were replaced during the
account migration. Use the `coolien` GitHub repository and the
`gmluepisjslxowncdxba` Supabase project for all future work.

## Current Git State

Current branch is `main`. The latest tracked production commits are:

- `5178177` Use canonical legal page URL
- `fe98cfd` Publish Spectra legal and privacy hub
- `6b73f63` Record AdSense publisher connection
- `bf3a99e` Clarify AdSense root domain setup
- `2aa4c96` Prepare policy-safe AdSense integration
- `1b2724a` Add home loan payoff planning
- `194053e` Add private PDF result export
- `056a9cf` Restore v2 home dashboard layout
- `8c96668` Fix translated settings alignment and refresh app icon
- `bbae6b8` Add backup restore and calculator safeguards
- `7f9edbc` Add casual multilingual interface

There are unrelated, intentionally untracked design/reference files at the
repository root. Do not delete, stage, or commit them unless explicitly asked:

- `CODEX_REDESIGN_PROMPT.md`
- `Spectra Brand Guideline.pdf`
- `Spectra Redesign v2.dc.html`
- `spectra Reference/`

## Technology

- Next.js `16.2.10`
- React `19.2.7`
- TypeScript `5.9.3`
- Supabase JS `2.110.5`
- Lucide React `1.24.0`
- Static export hosted on Cloudflare Pages
- Local-first browser storage
- Optional passwordless Supabase email authentication
- Generated service worker for PWA caching and updates
- Row Level Security for user-owned Supabase rows

Important source files:

- `web/src/components/SpectraApp.tsx`: app state, navigation, persistence, and consent gate
- `web/src/lib/app-model.ts`: app state and data types
- `web/src/lib/calculators.ts`: calculator formulas and Faraid allocation logic
- `web/src/components/calculators/`: calculator schemas and screens
- `web/src/lib/i18n.ts`: translations and language options
- `web/src/hooks/useCloudSync.ts`: Supabase session and sync controller
- `web/src/lib/cloud-sync.ts`: cloud payload validation, merge, export, and deletion
- `web/src/lib/supabase-client.ts`: public Supabase client setup
- `web/src/components/app-shell/ThemeProvider.tsx`: light/dark mode and accent presets
- `web/src/components/screens/SettingsScreen.tsx`: main Settings page
- `web/src/components/screens/AccountScreen.tsx`: sign-in, cloud sync, export, restore, deletion
- `web/src/components/screens/AppIconScreen.tsx`: current static icon preview
- `web/src/components/LegalConsentGate.tsx`: first-use terms/privacy consent
- `web/scripts/prepare-pwa.mjs`: build ID, cache name, and service-worker generation
- `web/src/pwa/sw.template.js`: service-worker source
- `web/public/manifest.webmanifest`: PWA metadata and icons
- `workers/spectra-legal.js`: Cloudflare Worker for the root legal route

## Features Currently In The App

- Home loan calculator
- Car hire-purchase calculator
- Personal loan calculator with reducing-balance and flat-rate methods
- Credit-card payoff calculator
- PTPTN/Ujrah calculator
- Faraid inheritance calculator for supported core direct heirs
- Personal salary and affordability profile
- Up to 15 named salary profiles
- Saved calculator scenarios
- Side-by-side scenario comparison
- Active-loan tracking and payoff projections
- PDF result export
- Optional Supabase cloud backup and restore
- JSON data export and restore
- Light/dark appearance
- Seven selectable interface accent themes
- Installable Spectra rainbow-ring PWA icon
- First-use Terms and Privacy consent gate
- English, casual Bahasa Malaysia, Chinese, and Tamil interface
- RM88.88 Remove Ads preview; payment is not enabled

## Navigation And Settings

The app has four bottom tabs: Home, Calculators, Saved, and Settings. The
top bar has the Spectra logo centered and the personal profile icon on the
right. Pressing the profile icon opens the personal profile; pressing it again
returns to Home.

The Settings page is a mobile-first, vertically scrollable screen with three
groups: Appearance, Account, and More.

### Appearance

- Light/Dark segmented control
- App icon preview row showing the fixed rainbow ring
- Card background darkness slider from 0% to 70%; current code uses this as
  the gradient overlay/scrim value, so consider renaming the label if changing
  the UX
- Compact theme swatch grid: Spectrum, Modern, Coral, Amber, Jade, Azure,
  and Violet

Theme state is stored locally in `spectra_theme` with `mode`, `accentKey`, and
`scrim`. It is a device preference and is not part of the cloud payload.
ThemeProvider applies CSS custom properties for page background, card,
border, text, muted text, chips, accent, contrast, and gradients.

Current accent presets:

- Spectrum: `#146356`, multicolour ring/gradient
- Modern: `#15141A`
- Coral: `#D43E50`
- Amber: `#B76B00`
- Jade: `#168365`
- Azure: `#315EC9`
- Violet: `#7540BC`

### Account

Personal profile shows `Set up` or `Not set` and opens a profile form with:

- Gross monthly salary
- EPF rate
- PCB/tax
- Living expenses
- Existing commitments
- Target DSR
- Estimated take-home pay and room left
- Optional, not-yet-configured investment view

Account and cloud sync shows one of these states:

- Cloud setup pending
- Signed out with passwordless magic-link email login
- Signed in with cloud sync status and last sync time
- Syncing
- Needs attention/error

The signed-in account screen supports:

- Sync now
- Sign out
- Delete cloud backup, with confirmation
- Export my Spectra data
- Restore Spectra backup from JSON

Local-first behavior is intentional. Spectra must remain usable without an
account. Cloud sync is optional and only becomes active after the user accepts
the legal notice and signs in.

The cloud payload includes language, calculator forms, last calculator,
personal profile, salary profiles, saved scenarios, and active loans. It does
not include the local theme preference.

### Language

The language detail page offers four options:

- English
- Bahasa Malaysia
- Chinese
- Tamil

Changing language should update the entire interface immediately. The current
language is saved in app state and may be included in cloud sync.

### More

Legal & privacy opens the in-app legal summary with expandable sections for:

- Calculator disclaimer
- Terms of use
- Privacy notice
- Advertising
- Changes and consent

It links to the full legal hub at:

`https://spectramsia.com/legal#calculator-privacy`

Remove Ads opens the RM88.88 preview page. It must remain clearly labelled as
planned/preview until payment is actually connected. The current buttons only
show an informational alert; they do not process payment.

About Spectra opens `https://spectramsia.com/` in a new tab and shows an
external-link icon. The Settings footer says Developed by Spectrality
Enterprise.

## Data, Privacy, And Security

Local app data is stored in the browser under the app state key
`spectra_app_state_v2`. The app also stores legal acceptance locally under
`spectra_legal_consent` and the theme under `spectra_theme`.

The first-use consent gate records the legal consent version and timestamp. The
current consent version is defined in `LegalConsentGate.tsx`. If the legal or
data practices materially change, increment the consent version so users review
the notice again.

Supabase tables/migrations are under `docs/supabase/`. The cloud design uses:

- `profiles`
- `user_consents`
- `app_snapshots`
- RLS policies limiting access to the authenticated user

The client may use only the Supabase publishable key. Never expose a service
role key in the app, GitHub, Cloudflare Pages, logs, screenshots, or this file.

Do not ask users to enter or upload NRIC numbers, OTPs, card numbers, banking
passwords, payslips, identity documents, medical information, or official loan
documents.

## Legal Hub And Cloudflare Worker

The full legal page source is:

`web/public/legal/index.html`

It currently contains English and Bahasa Malaysia versions covering:

- Website privacy notice
- Spectra Calculator privacy notice
- Local-first storage and optional cloud sync
- Supabase and Cloudflare processing
- Terms of use
- Cookies and advertising
- Data access, export, and deletion
- Financial and Faraid disclaimer
- Contact details and updates

The public canonical page is:

`https://spectramsia.com/legal`

The calculator-hosted source page is:

`https://calculatorapp.spectramsia.com/legal/`

Cloudflare Worker `spectra-legal` is deployed at:

`https://spectra-legal.spectramsia.workers.dev`

Its route is `spectramsia.com/legal*`. It proxies the root-domain legal path
to the calculator-hosted legal source so there is one maintained copy. Do not
create a second independent legal page unless explicitly required.

The existing root company website and root `ads.txt` route must remain intact.

## AdSense Status

Publisher ID:

`pub-5926336244150639`

Root ads.txt is live and must remain exactly:

`google.com, pub-5926336244150639, DIRECT, f08c47fec0942fa0`

AdSense site setup uses the root domain `spectramsia.com`, not the ordinary
calculator subdomain as a separate site. The current reported status on 20 July
2026 is:

- Approval status: `Getting ready`
- Ads.txt status: `Authorized`
- Site: `spectramsia.com`

Google AdSense European regulations consent messaging is already active and
published for `spectramsia.com`, with English plus 31 additional languages.

A US state regulations consent message was started but is not complete. The
draft selected `spectramsia.com`, but Google blocked publication because the
site is missing a logo. Do not assume the US message is live. The remaining
task is to add the Spectra ring logo to the AdSense site profile, return to the
US states draft, verify the site selection and settings, then publish it.

The code is intentionally fail-closed for advertising:

- `NEXT_PUBLIC_ADSENSE_CLIENT` must be a valid publisher client ID
- `NEXT_PUBLIC_ADSENSE_HOME_SLOT` must be a numeric ad slot
- `NEXT_PUBLIC_ADSENSE_ENABLED` must equal `true`
- The AdSense script and ad slot render only when all three conditions pass

The repository example keeps ads disabled:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_ENABLED=false
```

Do not enable real ads until Google approval, the required consent messaging,
the legal copy, and the real ad-unit ID are ready. Do not accept Remove Ads
payments until a payment provider, entitlement storage, refund process, and
legal terms are ready.

## PWA Updating And Cache Behavior

`npm run build` runs `web/scripts/prepare-pwa.mjs` before the Next.js build. It
generates:

- `web/public/sw.js`
- `web/public/spectra_build.json`

Production cache names use the Cloudflare/GitHub commit SHA. Local development
uses a timestamped `dev-*` cache. The service worker removes old `spectra-next-*`
caches, uses network-first behavior for versioned app files, and updates the
active controller so devices can move to the newest release.

After deployment, verify:

```powershell
Invoke-WebRequest -UseBasicParsing https://calculatorapp.spectramsia.com/spectra_build.json
Invoke-WebRequest -UseBasicParsing https://calculatorapp.spectramsia.com/manifest.webmanifest
Invoke-WebRequest -UseBasicParsing https://calculatorapp.spectramsia.com/sw.js
```

Also verify the live root routes:

```powershell
Invoke-WebRequest -UseBasicParsing https://spectramsia.com/legal
Invoke-WebRequest -UseBasicParsing https://spectramsia.com/ads.txt
Invoke-WebRequest -UseBasicParsing https://spectramsia.com/
```

Do not change service-worker cache rules casually. A stale PWA install was a
previous production problem, so every release must have a new build marker and
must be checked on both desktop and mobile.

## Branding And Future Play Store Path

The canonical brand is the Spectra rainbow ring without text. Current web
assets include:

- `web/public/icons/spectra-brand-v2-192.png`
- `web/public/icons/spectra-brand-v2-512.png`
- `web/public/icons/spectra-brand-v2-maskable-192.png`
- `web/public/icons/spectra-brand-v2-maskable-512.png`
- `web/public/spectra-brand-v2-favicon.png`
- `web/src/components/ui/RingLogo.tsx`

There are two different concepts:

1. Runtime interface theme: can change immediately with CSS variables and
   React state. This is suitable for the Settings theme swatches.
2. Installed launcher icon: normally comes from the static PWA manifest and
   should remain the stable rainbow ring for all users.

Do not promise that selecting Amber, Jade, or another theme changes an already
installed PWA launcher icon. Browser and operating-system icon caching makes
per-user dynamic PWA icons unreliable.

For a future brand-wide icon release:

1. Update the canonical ring artwork.
2. Generate versioned 192px, 512px, maskable, favicon, and Apple icon assets.
3. Update `manifest.webmanifest`.
4. Update Next.js metadata icons in `web/src/app/layout.tsx`.
5. Update the service-worker app-shell asset list.
6. Bump/deploy the build cache version.
7. Test fresh PWA installation on Android, iOS, Chrome, Edge, and desktop.

When Play Store distribution becomes a priority, keep the PWA as the primary
source of the product and package it as a Trusted Web Activity, likely using
Bubblewrap/Android Browser Helper. The Android wrapper will have its own static
adaptive launcher icon, splash icon, package name, signing identity, and Play
Store listing assets. A new launcher icon for Play Store users is delivered by
an Android app update, not by changing a website setting.

Use one private brand-assets source to generate both PWA assets and Android
adaptive-icon assets. Keep the Android wrapper thin and pointed at the live
PWA. Website content and calculator fixes should continue deploying through
Cloudflare Pages.

## Development Commands

From the `web` directory:

```powershell
npm ci
npm test
npm run typecheck
npm run build
```

The latest completed verification before this handoff included:

- All 19 Node tests passing
- TypeScript typecheck passing
- Next.js production build passing
- `git diff --check` passing
- Legal page HTML/content checks passing
- Public legal route returning HTTP 200
- Root `ads.txt` returning HTTP 200 with the exact publisher record
- Existing company homepage remaining HTTP 200

## Deployment Workflow

1. Inspect the current worktree and preserve unrelated user files.
2. Run tests, typecheck, and production build.
3. Commit only intended source/documentation files.
4. Push `main` to `origin` when publication is explicitly requested.
5. Wait for Cloudflare Pages deployment.
6. Verify the new commit in `spectra_build.json`.
7. Verify the PWA, manifest, service worker, icons, legal route, ads.txt, and
   mobile layout.
8. Check that old service-worker caches are removed after a refresh.

Never use destructive Git commands to remove user work. Never stage the
untracked design/reference files without explicit instruction.

## Remaining Priorities

Immediate:

- Finish the AdSense US state message by adding the Spectra site logo and
  publishing the draft.
- Wait for the AdSense `Getting ready` review to resolve.
- Do not enable ad serving before approval and consent verification.
- Confirm the production Cloudflare Pages environment values when the real
  AdSense ad slot is created.

Next product work:

- Improve and verify all Settings translations, especially Tamil and Chinese
  native labels.
- Consider renaming the card-darkness slider to match its actual scrim behavior.
- Continue mobile-first UI/UX refinement against `Spectra Redesign v2.dc.html`
  and the existing design notes.
- Add stronger calculator regression coverage before changing formulas.
- Add a proper payment provider and purchase entitlement system before making
  RM88.88 functional.
- Decide on production Supabase backup/retention and account-deletion handling
  before significant user growth.
- Have a Malaysian privacy lawyer review the legal hub and have qualified
  professionals review financial and Faraid assumptions.
- Later, prepare the Trusted Web Activity/Play Store wrapper after the PWA is
  stable.

## Product Principles

Keep Spectra beginner-friendly, local-first, casual, and honest about limits.
Prefer editable assumptions and plain-language explanations. Never imply bank
approval, legal advice, tax advice, investment advice, Syariah rulings, or
guaranteed financial outcomes.

# Spectra Calculator App

Spectra Calculator is a Malaysia-focused finance planning Progressive Web App.
The active web/PWA build is now Next.js, with the earlier Flutter app kept in
`app/` as a reference while the product is PWA-first.

## App

- Next.js PWA: `web/`
- Flutter reference app: `app/`
- PWA target domain: `calculatorapp.spectramsia.com`
- Supabase project ref: `gmluepisjslxowncdxba`
- Brand guide: `docs/Spectra Brand Guideline.pdf`

## Local Development

```powershell
cd web
npm install
npm run dev
```

## Production Web Build

```powershell
cd web
npm ci
npm run typecheck
npm run build
```

Deploy `web/out` to Cloudflare Pages.

The Next build generates `public/sw.js` and `public/spectra_build.json` before
export so installed PWAs move to the newest cache after each deployment.

## Supabase

Run these SQL files in Supabase SQL Editor:

1. `docs/supabase/schema.sql`
2. `docs/supabase/rls_policies.sql`

More setup notes are in `docs/SUPABASE_SETUP.md`.

## Safety

Cloud sync is optional. The app should not collect NRIC, bank account numbers,
card numbers, OTPs, payslips, or official loan documents.

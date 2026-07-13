# Cloudflare Pages Setup For Spectra Calculator

Target URL:

```text
https://calculatorapp.spectramsia.com
```

Repository:

```text
coolien/spectra-calculator-app
```

## 1. Create Pages Project

In Cloudflare dashboard:

1. Go to Workers & Pages.
2. Create application.
3. Choose Pages.
4. Connect to Git.
5. Select `coolien/spectra-calculator-app`.

## 2. Build Settings

Framework preset:

```text
None
```

Root directory:

```text
web
```

Build command:

```bash
npm ci && npm run typecheck && npm run build
```

Build output directory:

```text
out
```

The Next.js build is a static export. `npm run build` runs
`scripts/prepare-pwa.mjs` first, which writes `sw.js` and
`spectra_build.json` with the Cloudflare commit id so installed devices move to
the newest app cache after deployment.

## 3. Environment Variables

Optional future cloud-sync variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Use only the public Supabase publishable key. Do not use the service role key.

## 4. Custom Domain

Add custom domain:

```text
calculatorapp.spectramsia.com
```

Cloudflare should create the DNS record automatically because the zone is under
Cloudflare.

## 5. Verify

After deployment:

- Open `https://calculatorapp.spectramsia.com`.
- Confirm the page title/app bar shows `Spectra`.
- Confirm `https://calculatorapp.spectramsia.com/manifest.webmanifest` returns the
  Spectra manifest.
- Confirm `https://calculatorapp.spectramsia.com/sw.js`
  returns HTTP 200.
- In Chrome DevTools > Application, confirm the active service worker is
  `sw.js`.
- Confirm `https://calculatorapp.spectramsia.com/spectra_build.json` returns
  the current build id. The custom service worker uses this generated build id
  in its cache name so devices move to the newest deployed bundle after refresh.

## 6. Supabase Auth URLs

In Supabase Auth settings, add:

```text
https://calculatorapp.spectramsia.com
```

as a Site URL / allowed redirect URL before public testing.

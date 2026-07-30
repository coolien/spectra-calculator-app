# Play Store ships as a TWA, not the Flutter app

The repo carries two implementations: the Next.js PWA in `web/` (current, six
calculators, all 2026 engine work) and a Flutter app in `app/` (last touched
2026-07-13, three calculators, none of the 2026 work).

Play Store delivery will be a **Trusted Web Activity wrapping the PWA**. The Flutter
source stays in the repo as a dormant fallback but receives no further work.

## Considered Options

Rebuilding Flutter to parity was rejected. It would mean re-implementing every
Malaysian financing rule in Dart and maintaining two versions of the same loan maths
forever — two chances to be wrong about the Hire-Purchase Act, with no way for a user
to tell which one misled them.

## Consequences

- Requires `assetlinks.json` served from `calculatorapp.spectramsia.com` and a
  Bubblewrap build.
- The PWA must stay genuinely offline-capable — a TWA that fails without network reads
  as a thin wrapper at review.
- One codebase now serves app, website, SEO, and ads simultaneously.

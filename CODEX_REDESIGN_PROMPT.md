# Spectra Calculator PWA — Redesign Implementation Prompt

Paste this whole document to Codex as the task brief. It describes the target design (built and approved as an HTML/React mockup) to implement in the real Next.js app at `web/`.

## Context

The current Next.js app (`web/src/components/SpectraApp.tsx`) is a single monolithic component mixing layout, form state, calculator switching, rendering, localization, and localStorage persistence for 6 calculators: Home Loan, Car Loan, Personal Loan, Credit Card Payoff, PTPTN Loan, and Faraid Inheritance.

A high-fidelity mobile mockup of the redesigned UX has been approved. Your job is to **rebuild the app's architecture and UI to match this mockup**, splitting the monolith into proper components while preserving all existing calculation logic in `web/src/lib/calculators.ts`.

## 1. Information architecture — 4-tab shell

Replace the current long single-scroll home page with a persistent bottom tab bar (4 tabs), each a top-level route/view:

1. **Home** — greeting, an optional "Monthly snapshot" hero card (take-home pay + DSR used, only shown once a Personal Profile exists; otherwise a "Set up your profile" prompt card), a "Continue where you left off" card linking to the last-used calculator, and a 3-column icon grid linking to all 6 calculators (max 6 items, "See all" links to the Calculators tab).
2. **Calculators** — a flat list of all 6 calculators as full-width row cards (icon, name, one-line description, chevron). This is the primary place users pick a calculator — do not duplicate long calculator content on Home.
3. **Saved** — two sections:
   - **Salary profiles**: horizontally-scrollable cards for up to **15** named income scenarios (e.g. "Just me", "With spouse", "Client — Aiman"). Each shows take-home pay and a suggested max loan installment. This is explicitly for testing "what if I earned X" — separate from the real Personal Profile, and useful both for a household with multiple earners and for insurance/loan agents modeling multiple clients. Include a visible "+ Add (n/15)" action and a trailing "+ New profile" tile. Tapping either opens the **Add Salary Profile** screen (see below).
   - **Loan scenarios**: previously-saved calculator results as row cards (calculator icon, label, computed result, saved-when), with a delete affordance and a "+ Compare selected" action for multi-select comparison (comparison UI can be a follow-up; stub the button for now).
4. **Settings** — grouped into cards, NOT a long flat list:
   - **Appearance**: Light/Dark segmented toggle (see theming below).
   - **App icon + Theme colour** card: a live preview swatch, a "Card background darkness" slider (0–70%, default 38%), and a 4-column grid of 7 theme-colour swatches (see Theming below). Tapping "App icon" opens a dedicated picker page showing the same ring mark rendered in all 7 theme colours — selecting one sets the app-wide accent (app icon and in-app theme colour are the same underlying setting, not independent).
   - **Account card**: Personal profile, Account & cloud sync (shows "Not signed in" / "Signed in as …"), Language (shows current language).
   - **Legal card**: Legal & privacy (single entry point that expands to disclaimer/terms/data — do not list them as separate top-level rows), Remove ads, About Spectra.
   - Footer: "Developed by Spectrality Enterprise".

## 2. Top bar (shared across all screens)

- Always show the **Spectra logo mark + wordmark centered**, regardless of screen — never let it be pushed off-center by back buttons or titles.
- Left slot: back chevron button (only on detail/drill-in screens); otherwise empty spacer of the same width so the center stays balanced.
- Right slot: a profile icon button that always opens the Personal Profile screen (not Settings — Settings lives only in the bottom tab bar).
- The logo mark is a **ring** (prism mark): an SVG circle, stroke width = 1/4 of its diameter, no fill, colored with a gradient using the currently selected theme colour (see Theming — the ring uses the same gradient stops as the selected accent preset, and defaults to the full 5-hue "Spectrum" rainbow).
- Wordmark "Spectra" set in Bricolage Grotesque (fallback: a bold geometric sans), weight 700.

## 3. Calculator screens — replace the long flat form

For **every** calculator (Home Loan is the flagship reference, apply the same pattern to Car Loan, Personal Loan, Credit Card, PTPTN):

- Break the form into **numbered collapsible steps** (accordion cards), not one long scroll of fields:
  1. The primary/required inputs (e.g. for Home Loan: property price, down payment %, interest rate, tenure) — **open by default**.
  2. Secondary inputs (buyer status, property type, first-home toggle for Home Loan) — **collapsed by default**, header shows a live one-line summary of current selections (e.g. "Citizen · Subsale") so users don't need to open it to confirm their choices.
  3. Optional inputs (affordability check / income) — collapsed by default, labeled "Optional" with a pill badge.
- Each step header shows a numbered chip (1/2/3), the step title, and (when collapsed) a compact summary + chevron that rotates on expand.
- Faraid keeps its existing disclaimer banner at the very top of the screen, above step 1, unconditionally visible (not collapsible) — Faraid estimates are for planning only and must always show: "confirm final shares with a certified Faraid officer or the Syariah court."
- **Sticky bottom result bar** (persists while scrolling the form): shows the primary result value + label on the left (e.g. "Monthly installment / RM 1,992"), a secondary result on the right (e.g. "Upfront cash / RM 76,709"), and a row of 3 actions: Save (bookmark icon), Reset (undo/refresh icon), and a full-width primary "Calculate"/"Recalculate" button in the accent colour. This replaces the old pattern of a full-page inline result block requiring scroll-to-see.
- Full breakdown / amortization tables remain below the steps in the scrollable area (as today), just visually restyled to match cards.

## 4. Personal Profile & Add Salary Profile screens

- Personal Profile also uses the collapsible-accordion pattern: **Income & deductions** (open by default), **Cashflow plan**, **Investment view (optional)** — each card header shows a live summary (e.g. "RM 5,000", "40% DSR").
- Sticky bottom bar shows take-home pay + room left before DSR target, and a "Save profile" button.
- **New**: Add Salary Profile is a separate lightweight screen (not the Personal Profile) reachable from Saved → Salary profiles → "+ Add" or "+ New profile": Profile name (free text, e.g. "Wife", "Client — Aiman"), optional quick-label chips (Spouse / Child / Parent / Client), gross monthly salary, existing commitments, target DSR. Sticky "Save profile" button at bottom. Enforce a cap of 15 profiles; show "n of 15 used" in the subtitle.

## 5. Theming system

### Light / Dark mode
A Settings toggle switches every screen between a light and dark token set. Implement as design tokens (e.g. CSS variables or a theme context), not hardcoded hex — every background, card, border, and text color in the app must reference the active theme:

```
light: { pageBg:'#FAF9F5', card:'#FFFFFF', border:'#E7E3D8', text:'#14231D', textSecondary:'#6B7566', textMuted:'#8A8A7A', chip:'#F0EEE4', segment:'#EFEBDD' }
dark:  { pageBg:'#12181A', card:'#1B2420', border:'#2B3730', text:'#F3F1E8', textSecondary:'#A9B3AC', textMuted:'#7C877E', chip:'#233029', segment:'#233029' }
```

### Theme colour (accent) — driven by the Spectra brand guideline
The brand system (attached separately as "Spectra Brand Guideline.pdf") defines five signature hues sharing one lightness/chroma, meant to be used as gradients "like light, never paint":

- Coral `#FF5D6C`, Amber `#FFB443`, Jade `#35C79A`, Azure `#4C82F7`, Violet `#A667F5`
- Canvas `#F7F4EF`, Surface `#FFFFFF`, Ink `#15141A`, Ink Soft `#6B6874`, Hairline `#E7E1D8`
- Signature gradient: `linear-gradient(135deg, #FF5D6C, #FFB443, #35C79A, #4C82F7, #A667F5)`
- Display font: Bricolage Grotesque (500/700/800). Body/UI font: Hanken Grotesk (400/500/600/700). (The mockup used Sora/Manrope as stand-ins — prefer the brand's actual Bricolage Grotesque / Hanken Grotesk pairing in the real app if licensing/loading is available, otherwise keep Sora/Manrope.)

Implement **7 selectable theme-colour presets**, changeable in Settings and shared by the app icon picker (picking one updates both):

1. **Spectrum** (default) — solid accent stays the existing brand green `#146356` for buttons/text (do not change default look), but hero/gradient surfaces (Home snapshot card, Remove-ads promo card, the logo ring) use the full 5-stop rainbow gradient.
2. **Modern** — monochrome: accent `#15141A`, gradient black→dark grey.
3. **Coral** — accent `#FF5D6C`-family, gradient light-coral → coral.
4. **Amber** — accent `#FFB443`-family.
5. **Jade** — accent `#35C79A`-family.
6. **Azure** — accent `#4C82F7`-family.
7. **Violet** — accent `#A667F5`-family.

Rule: **only the accent-colored elements change** (primary buttons, active segmented-control states, the logo ring, the hero gradient cards, links/icons that use the brand color) — card backgrounds, borders, and text stay neutral/white per the current light/dark theme. Do not recolor the whole app per swatch.

### Card background darkness slider
The two full-bleed gradient hero cards (Home "Monthly snapshot", Settings "Remove ads" promo) must overlay a black scrim on top of the gradient so white text stays legible regardless of how bright the selected theme colour is. Make the scrim opacity a user-adjustable slider in Settings (0–70%, default 38%), applied as `linear-gradient(rgba(0,0,0,X), rgba(0,0,0,X)), <accent-gradient>`.

### App icon picker
A dedicated Settings sub-page titled "App icon": a grid of all 7 theme-colour presets, each rendered as the same ring mark (not a separate icon style), colored with that preset's two gradient stops via an SVG `linearGradient` with `gradientUnits="userSpaceOnUse"` (important: without this attribute the gradient corrupts to a solid color when x1/y1/x2/y2 use absolute viewBox units). Selecting a swatch here sets the same underlying accent state as the Theme colour picker in the main Settings screen.

## 6. Language

Replace any old inline EN/BM toggle pill with a proper **Language** settings page listing all 4 target languages as full rows (flag/glyph, English name, native name, checkmark on the active one): English, Bahasa Malaysia, Chinese (中文), Tamil (தமிழ்). English is the only fully translated language at launch — the other three show a "planned after v1" note per row until translated. Selecting a row should apply immediately (no separate "Save" step).

## 7. Account & cloud sync — cloud-only (no local-only mode)

Per product decision, **remove the "local-only" storage mode entirely** — this is a free, ad-supported app and needs an account system to sync data and support future growth. The Account & Sync settings screen should be sign-in-first:
- "Sign in to Spectra" card with Sign in / Create account segmented toggle, Email + Password fields, primary "Continue" button.
- A short "Why an account?" explainer: free app, cloud sync protects your data across devices, calculators improve over time. Explicitly warn: never enter NRIC, card numbers, OTPs, or official loan documents.
- Wire this to Supabase auth (email/password to start) per the existing plan to "prepare Supabase account/profile sync." Until Supabase is wired up, this can be a non-functional UI shell behind a feature flag — but do not ship a "local-only" toggle.

## 8. Remove ads

New Settings entry "Remove ads" (single row, with a "Go ad-free" call-to-action label) linking to a page with: a gradient promo card (uses the accent-gradient-with-scrim treatment) advertising a one-time RM 9.90 purchase to remove ads forever, and a "Restore purchase" link below. Wire to Google Play Billing / App Store equivalent per platform when available; stub the purchase button until then.

## 9. Component architecture (address the monolith problem)

Split `SpectraApp.tsx` into:
- `app-shell/` — `TabBar.tsx`, `TopBar.tsx` (with the centered logo mark + profile button), `ThemeProvider.tsx` (light/dark + accent context), `AppIconPicker` state hookup.
- `screens/` — `HomeScreen.tsx`, `CalculatorsScreen.tsx`, `SavedScreen.tsx`, `SettingsScreen.tsx`, `LanguageScreen.tsx`, `AccountScreen.tsx`, `RemoveAdsScreen.tsx`, `AppIconScreen.tsx`, `PersonalProfileScreen.tsx`, `AddSalaryProfileScreen.tsx`.
- `calculators/` — one folder per calculator (`home-loan/`, `car-loan/`, `personal-loan/`, `credit-card/`, `ptptn/`, `faraid/`), each with its own `Form.tsx` (the accordion steps), `Result.tsx` (sticky bar + breakdown), and a `schema.ts` describing its fields (label, type, unit, default, validation) so the accordion/field rendering can be data-driven and shared via a generic `<CalculatorStep>` / `<Field>` component rather than hand-rolled per calculator.
- `ui/` — reusable primitives: `AccordionCard`, `StickyResultBar`, `SegmentedControl`, `Toggle`, `MetricCard` (the small stat tiles), `Slider`, `ThemeSwatchGrid`, `RingLogo` (the SVG ring mark, accepts a `stops` prop).
- Keep all math in `web/src/lib/calculators.ts` untouched — only the presentation layer changes. Move field/label copy that's currently inline into per-calculator `schema.ts` + `web/src/lib/i18n.ts` entries.

## 10. Constraints (unchanged from original handoff)

- Keep Next.js static export working for Cloudflare Pages (`npm run build` → `out/`).
- Do not delete the Flutter `app/` reference folder.
- Run `npm run typecheck` and `npm run build` before considering any step done.
- Mobile-first; no interactive element under 44px tall.

## Reference

A working HTML/React mockup of this exact design (all screens, theming, and interactions described above) exists and should be used as the visual and interaction source of truth — match spacing, corner radii (~18-20px cards, ~13px inputs, 100px pills), type scale (Sora/Manrope weights and sizes as used there), and the exact copy/microcopy shown in it.

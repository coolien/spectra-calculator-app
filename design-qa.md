# Spectra Home Design QA

Target: `Spectra Redesign v2.dc.html`

Viewport and state: 390 x 844, light mode, Spectrum accent, completed personal profile.

## Comparison

- Shared shell matches the v2 55px top bar, centered 26px ring lockup, compact profile control, and fixed four-tab navigation.
- Home content follows the v2 order: greeting, monthly snapshot, continue card, calculator grid.
- Monthly snapshot values are vertically stacked as specified by v2. The card is 350 x 218px and all four content blocks remain inside its bounds.
- The snapshot paragraph uses its full 314px content width and wraps to two readable lines without clipping.
- Sora is used for display and control text; Manrope is used for body and supporting text.
- Active Loans remains available from Saved and no longer interrupts the v2 Home feed.
- Document width and scroll width are both 390px. No horizontal overflow is present.

## Findings

No P0, P1, or P2 visual issues remain in the tested Home state.

The Next.js development indicator appears only during local development and is absent from production builds.

final result: passed

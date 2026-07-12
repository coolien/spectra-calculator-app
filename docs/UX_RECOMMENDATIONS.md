# UX Recommendations

Last updated: 30 Jun 2026

## Current UX Direction

The app should feel like a personal finance planner, not just a list of calculators. Users should be able to set up their personal baseline once, then make faster loan decisions from that baseline.

## Changes Implemented From This UX Pass

1. Moved salary from calculator grid to `Personal Profile`.
   - Reason: Salary, expenses, savings target, and DSR target are persistent user context.
   - Better mental model: profile first, calculator second.

2. Added hamburger drawer navigation.
   - Drawer now holds persistent areas: Personal Profile, Overall Loans, Saved Scenarios, Settings.
   - Home screen can stay focused on loan tools.

3. Added `Overall Loans`.
   - Reason: users may already have multiple commitments and need to know monthly cash remaining.
   - Saved scenarios remain planning snapshots; ongoing loans represent active commitments.

4. Added a `Personal workspace` panel on home.
   - This nudges users toward setting up profile and ongoing loans before comparing new financing.

## Next UI/UX Opportunities

1. Add a first-run onboarding path.
   - Ask for salary profile, monthly expenses, savings target, and existing loans in a calm step-by-step flow.
   - Keep skip available.

2. Add a dashboard summary card.
   - Show take-home pay, total monthly debt, DSR, money left, and savings-target status.
   - This can become the main “financially smart” landing state after profile setup.

3. Add scenario-to-ongoing-loan conversion.
   - A saved calculator scenario should be convertible into an ongoing loan commitment.
   - This reduces re-entry when a user actually takes the loan.

4. Add comparison mode.
   - Compare two or three saved scenarios by monthly payment, upfront cash, total interest/profit, and remaining monthly cash after profile.

5. Add “decision guardrails”.
   - Examples: emergency buffer warning, high DSR warning, negative cashflow warning, editable rate-stress test, and “what if salary drops 10%”.

6. Improve data confidence.
   - Let users mark values as estimated or confirmed.
   - Use this to show confidence in the result without pretending to give advice.

## Accessibility And Trust Notes

- Keep all financial guidance framed as planning support, not approval prediction or investment advice.
- Keep salary and ongoing-loan data local-only until cloud sync has explicit consent, policy updates, and delete-account controls.
- Watch long labels on small screens; calculator inputs should stay readable and not force users to decode abbreviations.

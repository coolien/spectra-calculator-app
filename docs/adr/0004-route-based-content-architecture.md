# Every calculator and article gets a real URL

AdSense rejected the site for "Low value content". The cause is architectural, not
editorial: the whole app is a single route (`web/src/app/page.tsx`) with client-side tab
switching, so the static export produces only `index.html` and `legal/index.html`. To a
crawler the site is two pages, and no calculator or Learn topic has a URL. The Learn
corpus is also thin — roughly 1,300 words across all categories.

We are moving to real routes: `/car-loan`, `/home-loan`, `/personal-loan`,
`/credit-card`, `/ptptn`, `/faraid`, and `/learn/<slug>` per article, statically exported
as genuine HTML.

Staged: Learn routes first (that is what the ad review judges), calculator routes after.

## Consequences

- The app shell moves from tab state to routing; deep links and back-button behaviour
  become real requirements.
- Needs 8–12 substantial original articles. Thin or bulk-generated filler fails the same
  review, so this is a genuine writing commitment.
- Unlocks SEO and AI-answer citation, which is the same work — not a separate project.

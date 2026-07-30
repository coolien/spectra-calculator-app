# AdSense "Low Value Content" — Recovery Plan

Status: **do not request another review yet.** Nothing about the crawlable site has
changed since the rejection. Re-requesting now spends a review and returns the same result.

## Diagnosis

The rejection is architectural, not editorial.

**1. The site is two pages to a crawler.** The whole app is one route
(`web/src/app/page.tsx`) with client-side tab switching. Static export produces:

```
web/out/index.html          ← all six calculators, Learn, profile
web/out/legal/index.html
web/out/404.html
web/out/_not-found.html
```

No calculator has a URL. No lesson has a URL. Googlebot renders JS but indexes *URLs* —
content with no address cannot be a search result, and to a policy reviewer the site
reads as a bare tool with nothing behind it.

**2. The content is thin even in absolute terms.** `learn-content.json` holds 18 lessons
across 5 categories totalling **~1,300 words** — about 72 words per lesson. Google's
minimum-content bar is not met by a corpus that fits on two printed pages.

**3. Publisher-credibility pages are missing.** There is a Privacy and Terms page. There
is no About and no Contact. Reviewers look for these.

**4. No SEO surface at all.** No `robots.txt`, no `sitemap.xml`, and site-wide metadata is
a generic `title: 'Spectra'` — every page would share one title and description.

## Fix, in order

### Stage 1 — Make content addressable

Add real routes, statically exported:

| Route | Content |
| --- | --- |
| `/learn` | Index of all lessons by category |
| `/learn/<slug>` | One lesson per URL — 18 pages |
| `/about` | Who publishes this, why, what the methodology is |
| `/contact` | A real contact route |

Keep the calculators in the app shell for now. Learn routes are what the review judges.

### Stage 2 — Make the content substantial

Expand the 18 stubs into genuine articles, **800+ words each**, targeting 8–12 finished
before re-review. The existing 18 topics are a good skeleton — they're the right questions,
just answered in one line each.

Each article needs, at minimum:
- A real Malaysian worked example with RM figures
- What the rule actually is, with its source and effective date (see ADR-0006)
- What the reader should do differently, without recommending a product
- A link into the calculator that does the maths

**This is the expensive part and it cannot be shortcut.** Bulk-generated filler fails the
same review — Google's spam policy names scaled content abuse explicitly. Write these
yourself or commission them. I can research, structure, fact-check, and edit, but the
substance and the Malaysian lived detail should be yours; that detail is also the only
thing here a competitor can't copy.

### Stage 3 — Technical SEO / AIO

- `sitemap.xml` generated at build from the route list
- `robots.txt` allowing crawl, pointing at the sitemap
- Per-page `generateMetadata()` — unique title, description, canonical, OpenGraph
- JSON-LD: `Article` on lessons, `FAQPage` where the lesson is Q&A, `BreadcrumbList`
- This is the same work that gets you cited by AI answer engines. Not a separate project.

### Stage 4 — Ad placement (only after approval)

- No ad adjacent to a calculator result — a user must never confuse an ad with their number
- No ad above the fold on an article before any content
- Ads must not shift layout (reserve height)
- Respect consent state before any ad script loads

## Re-review checklist

Do not click "I have fixed the issues" until every line is true:

- [ ] `/learn/<slug>` returns real HTML for every lesson (view source with JS disabled)
- [ ] 8+ articles at 800+ words, each with a Malaysian worked example
- [ ] `/about` and `/contact` live and reachable from every page
- [ ] Privacy and Terms reachable from every page (the Cloudflare worker already serves
      `spectramsia.com/legal*` — verify it still resolves)
- [ ] `sitemap.xml` submitted in Search Console, pages showing as indexed
- [ ] Every page has a unique title and description
- [ ] Site works with JS disabled well enough to show article text

## Honest expectation

The first rejection is common and recoverable. What gets sites permanently stuck is
re-requesting review repeatedly without changing the crawlable surface. Expect several
weeks: Stage 1 is days of engineering, Stage 2 is weeks of writing, then indexing needs
time before the review sees anything different.

Ad revenue on a Malaysian finance calculator will be modest at first. The same work —
real URLs, real content — is what makes the app findable at all, which is the larger prize.

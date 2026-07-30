# Content Pipeline — Stage 2

How a Learn article goes from "someone searched this" to live, with the owner as the gate.

## The loop

```
search-demand-researcher   →  picks the question, proves a calculator answers it
        ↓  WRITE
article-writer             →  runs the engine, drafts to docs/drafts/<slug>.md
        ↓  draft
malaysia-rules-auditor     →  every rate sourced + dated  (existing agent)
        ↓
        YOU READ IT                      ← the gate. Nothing skips this.
        ↓  approved
article-publish-gate       →  re-verifies, flips EXPANDED_LESSONS, builds
        ↓
      commit + push        →  Cloudflare Pages deploys
```

One edit publishes: adding the slug to `EXPANDED_LESSONS` in `web/src/lib/learn.ts` removes
the `noindex` and adds the URL to `sitemap.xml`. Until then the page exists but is withheld
from search.

## Running it

Pick a topic:

```bash
claude "Use search-demand-researcher to find the 5 highest-value questions we can answer that the current top results get wrong."
```

Draft one:

```bash
claude "Use article-writer for <topic>. Run the engine for the worked example. Draft only — do not publish."
```

After you have read and approved it:

```bash
claude "Use article-publish-gate for <slug>. I have read and approved the draft."
```

To run the research + draft step on a schedule, use `/loop` or `/schedule`. **Only automate
up to the draft.** The gate stays manual — that is the point of it.

## What makes these rank, and what makes them a liability

**The advantage is the numbers.** Every article contains figures computed by a tested
engine under the current Malaysian rules. Competing pages have generic prose, pre-2026 car
loan rules, and rates with no date. That gap is real and defensible, and it is what gets a
page cited by an AI answer as well as ranked.

**The liability is volume without substance.** Google's scaled content abuse policy targets
many pages with little original value — and personal finance is YMYL, held to a higher bar
because bad advice does real damage. A site that jumps from 5 pages to 50 in a fortnight
fits that pattern even when each page is fine.

So the pipeline is deliberately built to make *quality* the bottleneck, not throughput.

## On publishing daily

Daily is achievable for a stretch and it is the wrong target on its own. Two reasons, both
practical rather than cautious:

1. **You have ~18 strong topics**, growing as calculators grow. Daily publishing exhausts
   genuine questions in under three weeks, and what comes after is variations — which is
   precisely the content-farm signature.
2. **Indexing lags publishing.** Google needs days to weeks per page. Publishing faster
   than you get indexed does not accelerate ranking; it just enlarges the crawl surface.

Suggested ramp:

| Phase | Cadence | Goal |
| --- | --- | --- |
| Weeks 1–4 | 2–3 / week | Reach 8–12 articles, request AdSense review |
| Weeks 5–12 | 2 / week | Reach ~30, watch Search Console for what actually ranks |
| After | 1 / week + updates | Depth over count; refresh each Budget cycle |

If you want daily, the honest version is: **draft daily, publish when a draft earns it.**
The research and drafting can run every day — that costs nothing and builds a queue. The
gate is what protects the domain.

## What nobody should promise you

Nobody can guarantee a #1 ranking, and any tool or agency that does is selling something.
What is controllable: answer a real question better than the current top result, prove it
with numbers only you can compute, get the rules right and dated, and be technically
crawlable. Do that repeatedly and rankings follow — over months, not days.

## Standing rules

- Never publish a rate the audit lists as `UNVERIFIED` without labelling it an estimate
- Never invent a Malaysian anecdote, statistic or testimonial
- Never recommend a bank, product or package — education, not advice
- Never publish a rewording of an article already live
- Re-verify every published article after each Budget cycle; rules move, articles don't

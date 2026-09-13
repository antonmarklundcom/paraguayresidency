# Competitive SEO/AI-visibility analysis: movetoparaguay.com vs paraguayresidencyguide.com

Research date: 2026-09-13. Method: robots.txt/sitemap scan, a targeted 19-page sample crawl
(service pages + a spread of blog posts, raw HTML fetch — no JS rendering needed, site is
server-rendered), and live SERP testing (Google blocked automated search with a CAPTCHA; Bing
used as a proxy — directionally reliable, not a Google-verified number).

## Verdict: not a 1:1 parity fight

movetoparaguay.com is an agency-scale operation: **162 blog posts** + 7 service pages
(immigration, residency, permanent-residency, tax-residency, citizenship, company-formation) +
4 business-vertical pages (agroindustrial, corporate, data-centers, mining) + an interactive
residency-cost calculator, all replicated across **4 languages** (en/es/ru/br) with correct
hreflang. `paraguayresidencyguide.com` currently has **7 public blog posts**
(`content/guide/blog/*.mdx`).

Live SERP testing confirms the gap: movetoparaguay.com ranked #1 organic in 3 of 5 test queries
and was cited in Bing's AI overview boxes; paraguayresidencyguide.com did not appear in any of
the 5 queries. The niche is crowded beyond just this one competitor — paraguaysimply.com,
paraguayresidencia.com, paraguaypathways.com, liberation.travel and residencypy.com also
out-rank us.

**Recommendation:** don't chase content-volume parity against a 4-language, 170+-page
operation — that doesn't fit `guide`'s positioning anyway (plan.md §11.3: a low-ticket paid
guide + insider content brand, not an agency). Instead: close the structured-data gap (cheap,
mechanical), copy the extraction-friendly page structure, and write a small number of
Tier-1 articles at the exact queries we're currently invisible for.

## 1. Structured-data gap

Current pipeline (`src/lib/article-page.tsx`, `src/components/Faq.tsx`, `src/lib/metadata.ts`)
emits: `Article` (every blog post), `FAQPage` (only when frontmatter has `faq` items),
`Organization` (site-wide).

Every sampled movetoparaguay.com page — service pages and blog posts alike — emits a much
larger graph in one pass: `Organization` + `ProfessionalService` + `PostalAddress` +
`ContactPoint` (a real NAP block) + `Person` (an author entity, site-wide) + `BreadcrumbList` +
`WebSite`+`SearchAction` (sitelinks searchbox eligibility) + `FAQPage` on most (not all) pages.
Notably absent from *their* pages too: `HowTo` — despite many step-by-step guides, they never
use it. Chasing `HowTo` isn't the real differentiator.

Concrete gaps worth closing:
- **`BreadcrumbList`** — trivial; we already render `Breadcrumbs` visually, just not paired
  with JSON-LD.
- **`Person`/author entity** — the real E-E-A-T gap. Their posts link a named author's LinkedIn
  profile with 3–12 on-page author-signal mentions per post. We have zero author byline
  anywhere. Even a simple "Reviewed by [name]" with `Person` schema would help.
- **`ProfessionalService`/`ContactPoint`/`PostalAddress`** — lower priority for `guide` (sells a
  PDF, not an in-person service); fits `residency` (the hub) or `investorpass` better if pursued.

## 2. Depth/format pattern worth copying

Their service pages (`/en/residency`, `/en/permanent-residency`, `/en/tax-residency`) all follow
one template, in this order:

1. **"[Topic] at a glance"** — a compact summary box in the first screen, answering the core
   question before any narrative.
2. An **honest-caveat / "the mistake that costs people two extra years"** section — candid,
   non-salesy framing (close to our own brand voice — see
   `content/guide/blog/mistakes-we-see-every-month.mdx`).
3. A **comparison table** of routes/options.
4. A **numbered step-by-step process**.
5. A **cost table for the current year**.
6. **Who this is/isn't for.**
7. **FAQ**, phrased as literal reader questions.
8. Related articles + CTA.

Their blog H2s are phrased as full reader questions verbatim ("How do you apostille documents
for Paraguay residency step by step?") — a direct match to "People Also Ask" phrasing, and
exactly the shape an AI answer engine extracts a paragraph from. Our current H2s are topical
rather than question-form — a cheap, mechanical change with real AI-extraction upside. They also
close posts with a **"Key Takeaways"** bulleted summary.

**Don't copy:** one sampled post claims "0% tax on foreign income" in its meta description —
exactly the kind of unhedged claim `content/shared/facts.ts` / `<Fact k>` exists to prevent us
from making, and it's also less accurate than "territorial tax, hedged." Don't chase them into
that.

## 3. Topic gap list, ranked

**Tier 1 — high-intent, on-brand, cheap to write without fabrication:**
1. **Paraguay residency cost breakdown (current year)** as its own page with a cost table — we
   have `real-cost-of-living-in-paraguay.mdx` (general living costs) but no dedicated *residency
   filing cost* breakdown. This is the #1-ranking query in the live test.
2. **Paraguay residency scam / how to avoid it** — direct topic gap, fits the guide's
   honest/insider voice, cheap to write (pattern-recognition content, no figures needed).
3. **Apostille and document legalization by country** — touched inside
   `documents-you-need-for-paraguay-residency.mdx` but they have a full dedicated ~1,900-word
   page. Worth its own article to target the query directly.
4. **Digital nomad / remote worker angle** — topic gap entirely; fits `frontier`'s audience more
   than `guide`'s — flag cross-brand.

**Tier 2 — real gap, more research-dependent (needs `<Fact k>` hedging, figures contested):**
5. **US-specific tax angle** (bona fide residence test, double taxation) — high value if the
   reader base skews American, but every claim needs hedging; don't rush without the lawyer's
   sign-off status on the relevant `facts.ts` entries.
6. **Healthcare/hospitals** — real gap, lower priority since it's adjacent to residency rather
   than core to it.

**Tier 3 — skip:** company-formation/business-vertical pages (agroindustrial, mining, data
centers) and citizenship-by-naturalization content are agency/investor-services territory, not
`guide` territory (plan.md is explicit: `guide` sells a PDF + insider membership, not filing
services) — leave those to `investorpass`/`residency` if pursued at all.

## Bottom line

1. Add `BreadcrumbList` + a lightweight author/reviewer byline with `Person` schema — a
   half-day change with real E-E-A-T upside.
2. Restructure new and existing posts to lead with a direct-answer summary box and
   question-form H2s.
3. Write the 3–4 Tier-1 articles above rather than trying to match 162 posts.

Raw sample-crawl data (19 pages) is not committed here; re-run if needed against
`https://movetoparaguay.com/en` (site is server-rendered, no headless browser required).

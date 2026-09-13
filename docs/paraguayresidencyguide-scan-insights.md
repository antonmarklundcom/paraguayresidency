# paraguayresidencyguide.com (old WordPress site) — full scan insights

Full crawl of the live `paraguayresidencyguide.com` on 2026-09-12 (it had been returning
503 on a lapsed domain/hosting payment; confirmed back up before this scan). Raw data is
`docs/paraguayresidencyguide-scan-report.json` in this repo (47 pages, one JSON object per
URL: title, metaDescription, canonical, h1s, h2s, og:*, ldJson, wordCount,
outgoingInternalLinks). This file is the human-readable summary; see
`docs/guide-redirects.md` for the resulting URL-by-URL redirect decisions and
`content/guide/blog/*.mdx` for the ported posts.

## Site structure

WordPress on Hostinger, sitemap at `/wp-sitemap.xml` → sub-sitemaps for posts, pages,
`nxt_builder` template parts (skipped — internal theme-builder artifacts, not real pages),
and a `category` taxonomy (`uncategorized`, `visa`, `residency`, `lifestyle` — all four are
140-word boilerplate archive pages with no unique content).

47 total URLs crawled. Roughly 35 are real, roughly 12 are exact duplicates or
leftover WordPress theme-demo pages (see below).

## SEO/technical signal — the one finding that matters most

**The site has zero `<meta name="description">` tags, zero Open Graph tags, and zero
JSON-LD structured data anywhere, on every single page checked** (verified against raw
HTML, not just the crawler's parse — confirmed on the homepage and `/paraguay-visa-guide/`
directly). The only on-page SEO signal is the `<title>` tag and body content (H1/H2 +
prose). There is nothing to "preserve" beyond content and URLs — the new site's existing
metadata pipeline (`siteMetadata()`, per-post `description` frontmatter, ≤160-char limit
enforced by `tests/content.test.ts`) already exceeds what the old site ever had.

## Real content (ported or redirected per docs/guide-redirects.md)

13 blog posts (flat WP permalinks, no `/blog/` prefix): `5000-deposit`,
`cedula-power-of-attorney`, `paraguay-visa-guide`, `step-by-step`,
`health-insurance-paraguay`, `requirements-residency-paraguay`, `paraguay-visa`,
`is-paraguay-safe`, `paraguayan-citizenship`, `banks-paraguay`, `schools-paraguay`,
`retire-in-paraguay`, `paraguay-sim-card`.

Plus real pages: `/faq/`, `/pricing/`, `/residency/temporary/`, `/residency/permanent/`,
`/residency/investment/`.

`paraguay-visa/` and `paraguay-visa-guide/` are near-duplicate content on the old site
itself (2,989 vs 1,945 words, same topic) — likely unintentional keyword cannibalization
there, not something to replicate as two pages here.

## Duplicate / test pages found (no unique content, safe to skip)

- `/prices/` = exact duplicate of `/pricing/`
- `/faq2/` = exact duplicate of `/faq/`
- `/information-2/` = duplicate stub of `/information/`
- `/thank-you-contact/` = duplicate of `/thank-you/`
- `/td/`, `/ht/`, `/paraguayresidency495/` = three separate test/duplicate copies of
  `/residency/temporary/` (identical H1 "Temporary Residency In Paraguay", identical
  2,355-word count) — old-site cruft, not distinct content
- `/residency/` (the residency index) duplicates the `/pricing/` page's content verbatim
  (same H2 "Price for Paraguay Residency") — looks like a template bug on the old site,
  not intentional distinct content

## Unedited WordPress theme-demo pages (never real content, no SEO value)

These return HTTP 200 but are leftover copy from the site's page-builder theme (reads as a
health/wellness clinic demo, and separately a SaaS-careers demo) — never edited into real
content for this business:

- `/about/` — H2s include "The story of the doctor behind their unwavering commitment to
  healing & helping others" and "Our team is well-equipped to provide comprehensive care"
- `/team/` — H1 "Our Leadership", H2s "Collaborates with team leaders in the workflow",
  "Trusted by thousand Businesses" — generic corporate-team theme demo
- `/home-2/`, `/home-page-1-enigmaexplore/` — H1 "Detailed diagnostic of your body to
  approach wellbeing" (medical-clinic theme demo homepage)
- `/blog-2-enigmaexplore/`, `/blog-page-2-pixesaas/` — theme demo blog-listing templates
- `/career-details-page-pixesaas/`, `/career-page-2-pixesaas/` — theme demo careers/jobs
  pages, entirely unrelated to this business ("Ui/Ux And Product Designer", "Career with
  PixeSaaS")
- `/404-error-3-pixesaas/` — the theme's demo 404 page

## The pricing/business-model finding

`/pricing/` (and its duplicates) describe a real 3-tier concierge filing service:

- **Residency Essentials — $495 USD** — document review, appointment management, a
  personal guide to accompany you to government offices, certified translations,
  WhatsApp/email support. Excludes government/Interpol fees (noted as "about $370 USD",
  paid directly by the client).
- **Residency Complete — $695 USD, "Most Popular"** — everything in Essentials, plus RUC
  registration with SET, priority processing, bank recommendations, a housing/cost-of-
  living guide.
- **Residency Investor — $2,950 USD** — everything in Complete, plus full company
  formation (EAS), a business plan, a professional website "to meet economic substance
  requirements," business banking assistance, initial tax-optimization consultation.

All three tiers carried "Discounted prices during March 2026" copy — time-sensitive
marketing language, not evergreen fact, which is one more reason this wasn't copied
verbatim even before the scope decision below.

**This is a different business model from what `guide` sells today.** Per `plan.md` §1,
`guide` (`paraguayresidencyguide.com`) is "the low-ticket entry — a paid digital guide
(PDF + updates) Anton runs alone," selling `guide-entry` ($7) and `guide-insider`
(recurring) products — not a done-for-you filing service. The old site's concierge-service
content conceptually resembles what `plan.md` describes for the `residency` hub brand
(`paraguayresidency.co.uk`) far more than it resembles `guide`'s current content-product
model.

**Decision (Anton, 2026-09-12): do not resell the old $495/$695/$2,950 packages.** The
goal is preserving SEO rankings/traffic, not reviving that commercial offer. Every old URL
whose only content was the pricing/service pitch redirects to a neutral equivalent (see
`docs/guide-redirects.md`) rather than being recreated. If Anton later decides the
concierge-service content genuinely belongs on the `residency` hub instead, that's a
separate, deliberate decision — not something this scan should force by default.

## Content gaps filled (10 new posts in `content/guide/blog/`)

Genuine topics the old site ranked for with no equivalent anywhere in `content/guide/*`
(checked against blog posts and the gated `content/guide/members/*` tree): visa entry
(`paraguay-visa-guide`), safety (`is-paraguay-safe`), citizenship-by-naturalization
(`paraguayan-citizenship`), schools/education (`schools-paraguay`), retirement
(`retire-in-paraguay`), SIM cards (`paraguay-sim-card`), health insurance
(`health-insurance-paraguay`), a public requirements overview
(`requirements-residency-paraguay` — the full gated version already exists at
`content/guide/members/getting-started/the-routes-compared.mdx`), a public step-by-step
overview (`step-by-step` — full gated detail already exists at
`content/guide/members/costs-and-timeline/timeline-week-by-week.mdx`), and two
regulatory-update posts (`5000-deposit`, `cedula-power-of-attorney` — kept **public**, not
routed through the gated `content/guide/updates/` hub, which is `noindex: true` and would
lose all SEO value).

`banks-paraguay` was **not** duplicated as a new file — the new site already has a more
current, dedicated post on the same topic (`opening-a-bank-account-in-paraguay.mdx`);
redirected there instead.

Every legal/financial figure in the new posts uses an existing `<Fact k>` key from
`content/shared/facts.ts` or a `[VERIFY]`-hedged sentence — see the PR description
(antonmarklundcom/paraguayresidency#29) for the full list of `[VERIFY]` items needing
Anton's sign-off before they read as settled facts.

## Other findings

- The old site's own navigation links to `/temporary-residency/`, which returns HTTP 503
  and does not appear in its own sitemap — a broken internal link on the old site itself,
  not something worth replicating.
- No competitive-scan work is included here — a separate prompt was written (not run in
  this repo) to crawl `movetoparaguay.com/en` and compare its SEO/AI-visibility signals
  against this repo's `guide` content; that's a distinct task from this port.

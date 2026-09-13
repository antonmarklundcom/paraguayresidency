# paraguayresidencyguide.com (old WordPress site) → `guide` brand: redirect map

Source: full crawl of the live `paraguayresidencyguide.com` on 2026-09-12 (47 URLs from
its `wp-sitemap.xml`; raw data in `site-scan-report.json`, generated locally, not
committed here). Every URL the old site's sitemap listed is accounted for below —
complete, not sampled. Follows the same pattern as `docs/flytta-redirects.md`: this file
is the data, not the redirect logic — wiring it into `src/middleware.ts` /
`src/sites/registry.ts` as real 301s is a separate later phase, same as flytta's.

**Scope decision (Anton, 2026-09-12):** the old site sold a 3-tier concierge filing
service ($495 / $695 / $2,950 — "Residency Essentials / Complete / Investor"). The
`guide` brand does not sell that service (it sells a $7 guide + Insider subscription per
plan.md §1) and Anton does not want to resurrect those packages or prices. Every old URL
whose only content was that pricing/service pitch redirects to a neutral page (home or
the nearest genuinely-informational equivalent) rather than to a recreated pricing page.
The goal here is preserving indexed URLs' link equity and informational-content ranking,
not reviving the old commercial offer.

## Real content — ported to new blog posts

These 11 posts/pages had genuine word count and topical value. Content was drafted fresh
in `content/guide/blog/*.mdx` using the old page as the starting reference (per Anton's
direction to "start with the same content ... then edit later") — not copy-pasted
verbatim, and with every legal/financial figure rendered through `<Fact k>` (existing
keys) or hedged with a `[VERIFY]` note rather than stated as a bare number, per
`content/shared/facts.ts` and the `residency-guide-international` skill's anti-fabrication
rule.

| Old URL | New URL | Note |
|---|---|---|
| `/paraguay-visa-guide/` | `/blog/paraguay-visa-guide` | Kept as the canonical visa-entry post. |
| `/paraguay-visa/` | `/blog/paraguay-visa-guide` | Near-duplicate of the above on the old site itself (two separate visa pages, likely unintentional cannibalization there) — consolidated into one post here rather than reproduced twice. |
| `/step-by-step/` | `/blog/step-by-step` | Old page was a very long (3,060-word) full checklist with a government-fee table; new post is a public overview (fees, page-locked step tables and forms live behind `/insider` per the `guide-insider` product, not on a public page). |
| `/health-insurance-paraguay/` | `/blog/health-insurance-paraguay` | Genuine content gap on the new site — ported. |
| `/requirements-residency-paraguay/` | `/blog/requirements-residency-paraguay` | Public overview comparing the three routes; full route detail already exists gated at `content/guide/members/getting-started/the-routes-compared.mdx` — this new post is the public teaser version of that topic, not a duplicate of it. |
| `/is-paraguay-safe/` | `/blog/is-paraguay-safe` | Genuine content gap — ported. |
| `/paraguayan-citizenship/` | `/blog/paraguayan-citizenship` | Genuine content gap (naturalization, the step after residency) — ported. |
| `/banks-paraguay/` | `/blog/opening-a-bank-account-in-paraguay` | New site already has a dedicated, more current post on this exact topic — redirected there instead of creating a duplicate. |
| `/schools-paraguay/` | `/blog/schools-paraguay` | Genuine content gap (family/education angle) — ported. |
| `/retire-in-paraguay/` | `/blog/retire-in-paraguay` | Genuine content gap (retiree persona) — ported. |
| `/paraguay-sim-card/` | `/blog/paraguay-sim-card` | Minor but real, practical search topic — ported. |
| `/5000-deposit/` | `/blog/5000-deposit` | Regulatory-update content. Public post, not `content/guide/updates/` — that hub is gated (`requireTier('entry')`, `noindex: true`) and would lose all SEO value; a public post preserves it. |
| `/cedula-power-of-attorney/` | `/blog/cedula-power-of-attorney` | Same reasoning as `5000-deposit` — public post, not the gated updates hub. |

## Duplicate/test pages on the old site — redirect to their real counterpart

| Old URL | New URL | Why |
|---|---|---|
| `/prices/` | `/` | Exact duplicate of `/pricing/` on the old site; pricing itself is out of scope (see Scope decision above). |
| `/faq2/` | `/` | Exact duplicate of `/faq/`; FAQ content folded into the homepage's own FAQ section rather than a standalone route (the `guide` brand has no dedicated `/faq` page — see below). |
| `/information-2/` | `/` | Duplicate stub of `/information/` (99-word boilerplate page, no real content). |
| `/thank-you-contact/` | `/thank-you` | Duplicate of `/thank-you/`; new site's route is `/thank-you`. |
| `/td/`, `/ht/`, `/paraguayresidency495/` | `/blog/requirements-residency-paraguay` | All three are old test/duplicate copies of the `/residency/temporary/` service page (identical H1, identical word count) — not real distinct content. Redirected to the nearest public informational equivalent rather than recreated. |

## Service / pricing pages — out of scope per Anton's direction, redirect to home

| Old URL | New URL | Why |
|---|---|---|
| `/pricing/` | `/` | The $495/$695/$2,950 package table — not being recreated (Scope decision above). |
| `/residency/` | `/` | Old page duplicated the pricing content verbatim (same H2, "Price for Paraguay Residency") — appears to be a template bug on the old site itself, not distinct content. |
| `/residency/temporary/` | `/blog/requirements-residency-paraguay` | Described the Essentials-tier service; the informational "what temporary residency requires" angle survives in the new overview post instead. |
| `/residency/permanent/` | `/blog/requirements-residency-paraguay` | Same reasoning. |
| `/residency/investment/` | `/blog/requirements-residency-paraguay` | Same reasoning; investment-route detail belongs to `paraguayinvestorpass.com` (`investorpass` brand) per plan.md §1, not `guide`. |
| `/apply/` | `/contact` | Old "apply for our service" CTA page; closest live equivalent without reviving the service pitch is the general contact route. |
| `/checklist/` | `/blog/step-by-step` | Old page was a 99-word stub (likely a gated lead-magnet placeholder, no real body content) — nearest real content is the new step-by-step overview. |

## Structural / low-content pages

| Old URL | New URL | Why |
|---|---|---|
| `/` | `/` | Home, same role. |
| `/about/` | `/about` | Route exists on the new site; note the OLD page's content was itself unedited theme-demo copy ("the story of the doctor behind their commitment to healing") — a leftover WordPress template, not real "About" content. Nothing to port. |
| `/team/` | `/about` | Same finding — old `/team/` is unedited medical-clinic theme demo copy ("Our Leadership", "skilled medical staff"), not real content. No dedicated `/team` route on the new site; folded into `/about`. |
| `/contact/` | `/contact` | Route exists, direct match. |
| `/faq/` | `/` | No dedicated `/faq` route on the `guide` brand (FAQ lives inline on `/` and `/insider` via `FAQ_ITEMS`). Worth a light content pass: a couple of the old FAQ's genuinely useful Q&As (e.g. "can I do this myself") are similar in spirit to what's already in `FAQ_ITEMS` on `src/app/sites/guide/page.tsx` — no new file needed, flagged here for Anton to eyeball rather than merged automatically. |
| `/guide/` | `/` | Old page was itself a soft bridge/landing stub for the (now-primary) site; redirects to home. |
| `/information/` | `/` | 99-word stub, no real content to preserve. |
| `/thank-you/` | `/thank-you` | Route exists, direct match. |
| `/blog/` | `/blog` | Route exists, direct match. |

## Not carried over — no redirect needed (never real, indexable content)

These returned 200 but are unedited WordPress theme-demo templates (a health/wellness
clinic demo theme, by the page copy) or thin taxonomy archives with no unique content —
none of them were ever genuinely "the site" and none carry meaningful search equity worth
preserving with a redirect:

- `/home-2/`, `/home-page-1-enigmaexplore/` — leftover theme demo homepage ("Detailed
  diagnostic of your body to approach wellbeing").
- `/blog-2-enigmaexplore/`, `/blog-page-2-pixesaas/` — leftover theme demo blog-listing
  templates.
- `/career-details-page-pixesaas/`, `/career-page-2-pixesaas/` — leftover theme demo
  careers/jobs templates, unrelated to this business.
- `/404-error-3-pixesaas/` — the theme's demo 404 page.
- `/category/uncategorized/`, `/category/visa/`, `/category/residency/`,
  `/category/lifestyle/` — thin taxonomy archive pages, 140 words each, all identical
  boilerplate, no unique content.

## SEO/technical notes for the record

- The old site has **zero** `<meta name="description">` tags, zero Open Graph tags, and
  zero JSON-LD structured data anywhere, on every page checked. There is no metadata
  pattern to "preserve" beyond title tags and body content — the new site's existing
  metadata pipeline (`siteMetadata()`, per-post `description` frontmatter) already exceeds
  what the old site had.
- The old site's internal nav links to `/temporary-residency/`, which does not exist in
  its own sitemap or return 200 — a broken link on the old site itself, not something to
  replicate.

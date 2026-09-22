# Old-site SEO audit & migration — paraguayresidencyguide.com

Audit of the live WordPress site at `paraguayresidencyguide.com` (the `guide` brand's
domain, per `plan.md` §11.3 and `CLAUDE.md`'s domain table), crawled 2026-09-12 after it
came back from a 503 caused by a lapsed domain/hosting payment. `guide` is "the low-ticket
entry" — a paid digital guide (`guide-entry`, $7) plus an `Insider` subscription
(`guide-insider`), run by Anton alone, not a lawyer/agency site (plan.md §1). Findings
below are filtered through that lens: WordPress-agency-site fixes that don't apply to a
Next.js/MDX content-and-membership site (e.g. "add category archive pages", "add a staff
bios page") are deliberately left out.

**Methodology and its limits.** This is a content/technical crawl (47 URLs, from the
site's own `wp-sitemap.xml`) plus manual raw-HTML inspection — title, meta tags, headings,
JSON-LD, word count, internal links. **No keyword-ranking or traffic data was captured** —
this audit did not have Google Search Console, Google Analytics, or any third-party rank
tracker access to the old site. Anywhere a ranking or traffic claim would normally go,
this document says **"not measured"** rather than estimate one. Raw crawl data:
`docs/paraguayresidencyguide-scan-report.json` (already in this repo, from the companion
content-migration PR referenced below).

**Related work already in flight:**
[PR #29](https://github.com/antonmarklundcom/paraguayresidency/pull/29) (open, not yet
merged as of this audit) already acts on most of this audit's content and redirect
findings — it ports 10 new `content/guide/blog/*.mdx` posts and adds
`docs/guide-redirects.md` (the full old-URL → new-URL map). This document either
references that work directly or flags where this audit's recommendation differs from it.

## 1. What the old site got right / is worth preserving

No ranking or traffic figures are available (see Methodology), so "worth preserving" here
means: real, substantive content the old site had that a naive migration could lose if
the domain's DNS moves to the new app without a content/redirect plan.

- **A genuine base of long-form, topical content**, not a thin/parking site: 13 blog posts
  and several service-description pages with real word counts (630–3,525 words), covering
  concrete, specific residency-adjacent topics (visa entry, safety, citizenship,
  banks, schools, retirement, SIM cards, health insurance, step-by-step process,
  requirements by residency type, two regulatory-update posts). Losing these URLs outright
  (a bare domain move with no redirects) would be the single biggest avoidable SEO loss in
  this migration.
- **Two genuinely time-sensitive regulatory-update posts** (`/5000-deposit/` — the $5,000
  bank-deposit requirement no longer applies — and `/cedula-power-of-attorney/` — a change
  to cédula-collection power-of-attorney practice). These read as the kind of "what
  changed" content that attracts links and repeat visits in this niche; worth keeping
  public and indexed, not moving behind a paywall.
- **A working, if thin, FAQ page** (`/faq/`, 1,209 words) with real Q&A content, not just
  boilerplate.
- **Clean, descriptive URL slugs** on the real content pages (`/is-paraguay-safe/`,
  `/retire-in-paraguay/`, `/schools-paraguay/`) — keyword-aligned and human-readable,
  worth keeping as the target slugs on the new site (see §3).

## 2. What was broken or weak — most useful part of this audit

**Technical SEO — the single biggest finding:** the site has **zero**
`<meta name="description">` tags, **zero** Open Graph tags, and **zero** JSON-LD
structured data anywhere, verified against raw HTML on multiple pages including the
homepage and `/paraguay-visa-guide/`. There is no SEO plugin output at all (no Yoast/
RankMath signature, no `<meta name="generator">` beyond bare "WordPress 7.0.4"). This
means:
- Every search-result snippet for this site was Google's own auto-generated excerpt, not
  a controlled meta description — a real, fixable loss of click-through-rate control.
- No FAQPage, Article, or Organization structured data means the site was invisible to
  any rich-result surface (FAQ rich snippets, Article cards) and to LLM answer engines
  that weight structured data as an authority/extraction signal.
- **This is a net-positive migration opportunity, not just a gap to patch**: the new
  Next.js/MDX pipeline already generates a per-post `description` frontmatter field
  (enforced ≤160 chars by `tests/content.test.ts`) — every ported post already exceeds the
  old site's metadata by default. The action item is adding JSON-LD (Article/FAQPage) to
  the `guide` blog template, which the old site never had at all, not "restoring" anything.

**Content duplication / cannibalization:**
- `/paraguay-visa/` (2,989 words) and `/paraguay-visa-guide/` (1,945 words) are
  near-duplicate content on the same topic — classic self-cannibalization, splitting
  whatever ranking signal either page could have built alone.
- `/pricing/` and `/prices/` are exact duplicates. `/faq/` and `/faq2/` are exact
  duplicates. `/information/` and `/information-2/` are exact duplicates.
- `/td/`, `/ht/`, and `/paraguayresidency495/` are three separate copies of
  `/residency/temporary/` (identical H1, identical 2,355-word count) — apparent leftover
  test/draft pages that were never cleaned up and stayed indexed.
- `/residency/` (the residency index page) duplicates `/pricing/`'s content verbatim (same
  H2, "Price for Paraguay Residency") — this reads as a template bug on the old site, not
  an intentional page.

**Indexed non-content (theme-demo cruft that was never edited into real content):**
`/about/` and `/team/` are leftover page-builder theme copy from what appears to be a
health/wellness-clinic demo template ("the story of the doctor behind their unwavering
commitment to healing," "Our team is well-equipped to provide comprehensive care," "Our
Leadership" / "Trusted by thousand Businesses"), never replaced with real About/Team
content. `/home-2/`, `/home-page-1-enigmaexplore/`, `/blog-2-enigmaexplore/`,
`/blog-page-2-pixesaas/`, `/career-details-page-pixesaas/`, `/career-page-2-pixesaas/`,
and `/404-error-3-pixesaas/` are all similarly unedited theme-demo pages (careers/jobs
templates entirely unrelated to this business, a second demo homepage, a demo 404 page).
None of these carry real content or search value; carrying them into a redirect map as if
they were real pages would be wasted effort.

**Thin taxonomy archives:** `/category/uncategorized/`, `/category/visa/`,
`/category/residency/`, `/category/lifestyle/` are all identical 140-word boilerplate
archive pages with no unique content — standard WordPress category-archive thinness, not
worth replicating in a system (this MDX pipeline) that has no category-archive concept to
begin with.

**A broken internal link on the old site itself:** the site's own navigation links to
`/temporary-residency/`, which returns HTTP 503 and does not appear in the site's own
sitemap — dead weight in its own nav, not something to carry over.

**Stale, time-sensitive commercial copy:** the pricing tiers (`/pricing/`, `/prices/`)
all carried "Discounted prices during March 2026" language baked into evergreen-looking
service pages — a maintenance liability (the copy silently goes wrong once that month
passes) independent of whether those packages get ported at all (see §3).

## 3. Migration action items

### 3a. Content to port

Cross-checked against the current `content/guide/blog/*.mdx` file list on `main` (7 posts:
`do-you-need-a-lawyer-for-paraguay-residency`, `documents-you-need-for-paraguay-residency`,
`how-long-paraguay-residency-actually-takes`, `is-paraguay-residency-worth-it`,
`mistakes-we-see-every-month`, `opening-a-bank-account-in-paraguay`,
`real-cost-of-living-in-paraguay`) — none of these overlap with the old site's topics
closely enough to already cover them.

**Already addressed by [PR #29](https://github.com/antonmarklundcom/paraguayresidency/pull/29)
(open, pending merge)** — not re-listed as outstanding work here, only flagged so this
audit doesn't duplicate it: `paraguay-visa-guide`, `is-paraguay-safe`,
`paraguayan-citizenship`, `schools-paraguay`, `retire-in-paraguay`, `paraguay-sim-card`,
`health-insurance-paraguay`, `requirements-residency-paraguay`, `step-by-step`,
`5000-deposit`, `cedula-power-of-attorney` — 10 new public posts, plus a decision to
redirect `banks-paraguay` to the existing `opening-a-bank-account-in-paraguay.mdx` instead
of duplicating it, and `paraguay-visa` to the consolidated `paraguay-visa-guide` post.

**Explicitly not recommended for porting:** the `/pricing/`, `/prices/`, `/residency/`,
`/residency/temporary/`, `/residency/permanent/`, `/residency/investment/`, and `/apply/`
pages, which describe a $495/$695/$2,950 concierge filing-service model. `guide` sells a
$7 guide + Insider subscription, a different business model (plan.md §1) — this was a
deliberate decision by Anton (2026-09-12, recorded in PR #29's description), not an
oversight of this audit. If that service content is ever wanted, it more plausibly belongs
on the `residency` hub brand (`paraguayresidency.co.uk`), which is a separate decision for
Anton to make deliberately, not something either this audit or PR #29 should force.

**Not recommended for porting at all** (no unique content — see §2): the duplicate pages,
the theme-demo pages, and the taxonomy archives.

### 3b. Redirects needed

A lost 301 map is one of the most common sources of migration SEO loss, and this old site
has 47 indexed URLs that need a disposition once `paraguayresidencyguide.com`'s DNS points
at this app. **The full URL-by-URL map already exists:** `docs/guide-redirects.md` (added
by PR #29), which classifies every one of the 47 crawled URLs into "ported to a new blog
post," "redirect to an existing equivalent," "redirect to a neutral page (pricing/service
pages, out of scope per §3a)," or "no redirect needed (theme-demo cruft, never real
content)." That file is the authoritative redirect map — this audit does not duplicate it,
only confirms its completeness (47/47 crawled URLs accounted for) and flags that, per this
repo's established pattern (`docs/flytta-redirects.md`), the map still needs to be wired
into `src/proxy.ts` / `src/sites/registry.ts` as real 301s before the domain cutover —
that wiring is not yet implemented for the `guide` brand (or for `flytta`), and is a
separate, later phase in both cases.

### 3c. Structured data / technical patterns worth carrying over

**None, from the old site itself** — it had zero JSON-LD, zero meta descriptions, zero OG
tags (§2), so there is nothing to "carry over" from it in this category. The action item
is additive, not a migration of an existing pattern:

- Add `Article` (or `BlogPosting`) JSON-LD to the `guide` blog post template
  (`src/app/sites/guide/blog/[slug]/page.tsx`) — no existing JSON-LD convention was found
  anywhere in `src/app/sites/` to reuse (see the FAQPage note below), so this would be a
  new, first convention for the app rather than an extension of an existing one.
- Add `FAQPage` JSON-LD wherever a post's `faq` frontmatter array is already populated
  (every post in `content/guide/blog/*.mdx` already carries 2 FAQ entries in frontmatter —
  the data exists, it's just not currently emitted as structured data anywhere). Verified
  directly (not assumed): `grep -rl "ld+json" src/app/sites/` returns **no matches
  anywhere in the codebase**, including `src/app/sites/guide/blog/[slug]/page.tsx` and
  `src/app/sites/guide/insider/page.tsx` — despite `plan.md`'s own S14 changelog entry
  claiming "Product+Offer JSON-LD" was added for `/insider`. That's a real discrepancy
  between the plan log and the current code worth flagging to Anton directly, not
  something this audit can resolve on its own (either the changelog entry describes work
  that was reverted/never merged, or JSON-LD is emitted in a way this grep didn't catch —
  worth a direct look before starting the FAQPage work below, so both get fixed together
  rather than assuming a pattern exists to copy).
- Consolidate the old site's `/paraguay-visa/` vs `/paraguay-visa-guide/` cannibalization
  lesson going forward: before adding a new `guide` blog post, grep existing slugs/titles
  for topic overlap first (PR #29 did this — it consolidated both old visa pages into one
  new post rather than porting both).

## Open questions for Anton

- Should the concierge-service content (`/pricing/`, `/residency/temporary/` etc.) be
  rebuilt on the `residency` hub brand instead of discarded outright? This audit takes no
  position beyond flagging it as a deliberate decision, not an oversight.
- `plan.md`'s S14 log entry says "Product+Offer JSON-LD" was added for `/insider`, but no
  JSON-LD exists anywhere in `src/app/sites/` today (verified by grep, §3c) — worth
  Anton or whoever picks up the JSON-LD work confirming which is stale, the changelog or
  the code, before relying on either.

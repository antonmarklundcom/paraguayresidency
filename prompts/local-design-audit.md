# Local session: live design audit, competitor comparison, redesign plan, image shot list

Run this in a **local** Claude Code session on Anton's PC (Opus, never Fable, per
`.claude/skills/fable-cost-guardrail/SKILL.md`). It runs locally because the cloud
environment's network policy blocks the live domains and `*.cloudfront.net`, where
Higgsfield results are hosted.

---

You are auditing and redesigning the seven brand sites in `antonmarklundcom/paraguayresidency`
(one Next.js app, brands keyed by `SiteKey`). Read `CLAUDE.md`, `plan.md` §1 and §9,
`KNOWN-ISSUES.md` and `docs/design/homepage-directions-prompts.md` first. The goal is the best-converting
residency design in the Paraguay niche: more WhatsApp conversations and form leads on the hub and
language brands, more $7 guide sales on `guide`, more investor leads on `investorpass`.

## 0. Setup
1. `git fetch origin && git checkout main && git pull`, then `npm ci`.
2. `npm i -D playwright` only if it isn't installed already, then `npx playwright install chromium`.
3. Start the app with `npm run dev -- -p 3100`. Every brand renders locally at `http://localhost:3100/?site=<key>`.

## 1. Is production running the current design?
Anton says he "still sees the old pinkish design". The "Arrival" design (full-bleed photo hero, glass
trust card, bento route tiles) is on `main` since #61, #67 and #68.
- Screenshot every live domain (table in `CLAUDE.md`), both the homepage and one article, at 1440×900
  and 390×844. Screenshot the same pages locally with `?site=`.
- Compare them. If live differs from local, production is behind `main`: say so and tell Anton to press
  **Redeploy** in hPanel or turn on auto-deploy from `main` (`docs/runbook.md` §Deploy). Also check for
  a stale CDN or browser cache (look at `x-cache` / `age` headers).
- Note: the `guide` theme is terracotta on cream with a peach (`#fbe7dc`) sales band. That is the current
  design, not the old one, and it is probably the "pinkish" look Anton means. Flag it for a palette change.

## 2. Competitor benchmark
Use Playwright to capture the homepage, the pricing or services page and the contact page of the top
Paraguay-residency competitors ranking for "paraguay residency", "residencia paraguay" and
"paraguay permanent residency". Start with `docs/seo-competitor-analysis-movetoparaguay.md` and add 4–6
more you find in the SERP. For each competitor, record: hero promise, trust signals (real faces,
reviews, counts, credentials, office photos, video), price transparency, primary CTA (WhatsApp, form or
call), and mobile sticky CTA. Save the screenshots to `docs/audit/design-2026-10/competitors/`.

## 3. Audit our pages
Cover all seven homepages plus `guide`'s sales block, one article, `/contact`, the route finder and
`/pricing` (hub). Score each on: first-screen clarity, trust, CTA visibility, mobile layout, contrast
(axe via `@axe-core/playwright`), and LCP (Lighthouse mobile ≥ 0.90 is the bar, per `src/styles/fonts.css`).
Findings already known from the cloud session on 2026-09-28 (verify them, don't just copy them):
- Hero photos and tiles are shared across brands. The hub reuses the investorpass hero; `residenciaes`
  and `flytta` reuse the guide terrace. The brands read as clones.
- All seven homepages use the same template (hero, glass card, 4-tile bento). Only the palette and
  display font differ.
- The team is shown as initials (AM / YA / DD). There are no real photos, reviews, Google rating,
  case counts or credentials anywhere. This is the biggest trust gap in a niche where people
  pay strangers abroad.
- The guide sales block shows a disabled "Checkout opens shortly" button, so the $7 product cannot be bought.
- Guide "Latest articles" cards have empty image areas and look broken.
- The 12 chapter cards are identical beige boxes, and there's dead space under the bento.

## 4. Deliverable: `docs/design/redesign-plan-2026-10.md`
- An executive summary: the 10 changes that most increase leads and sales, ranked by impact ÷ effort.
- Per brand: the target palette (fix the guide's peach), hero promise, trust block, and section order.
  Keep the brands visually distinct from each other.
- Components to build or change (a trust bar with real photos and review count, a testimonials section
  with country flags, a price table, a WhatsApp-first sticky CTA on mobile, and article cards with images).
- Before/after mockups of the top 3 changes as quick local HTML prototypes or annotated screenshots.
- Rules: no legal or financial numbers in JSX (use `<Fact k>`), `npm run verify:i18n` must stay green, and
  no schema, auth, API, payment or quiz-scoring changes (`CLAUDE.md`).

## 5. Image shot list (DO NOT GENERATE)
Write `docs/design/image-shotlist-2026-10.md`. It needs one unique hero plus a 4-tile set per brand
(7 × 5 = 35 slots), 12 guide chapter images (the `{/* IMAGE: … */}` slots in `content/guide/members/`),
and an OG image per brand. For each slot give: id, brand, page, ratio, resolution (2k heroes, 1k tiles),
prompt, negative notes (Paraguay is landlocked and flat, so no sea and no mountains; Asunción
architecture, lapacho/jacaranda, red earth), `alt_en/es/pt/sv`, and an estimated credit cost with a total.
Follow the `higgsfield-image-pipeline` and `higgsfield-web-imagery` skills for model choice and style consistency.
**Do not call any Higgsfield generate tool.** Anton will say "Generate image" when he wants them made.
After that, run the `higgsfield-image-pipeline` / `webimg-pipeline` flow: download, convert to webp at
2400/1200, add each image to `docs/imagery-manifest.json`, and swap the ids on the homepages.

## 6. Implement (only after Anton approves the plan)
Work on a branch with one PR per brand group. Run `npm run verify` before every push. Add before/after
screenshots to each PR description. Don't create a PR until Anton asks.

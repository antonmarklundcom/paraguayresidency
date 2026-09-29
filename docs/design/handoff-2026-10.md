# Handoff: design overhaul 2026-10 (stopped 2026-09-28 for the usage limit)

Read this first, then `docs/design/overhaul-2026-10-plan.md` and `docs/design/w5-brief.md`.

## Done and merged (branch `design/overhaul-2026-10`, PR to `main`)

- **Research**: `docs/audit/2026-10/site-audit.md` (Playwright/axe/Lighthouse, live + local), `competitors.md`,
  `seo-gap.md` (ranked page plan per market). Re-run the audit with the commands at the top of site-audit.md.
- **W6 SEO content, ~84 new pages**: pt +25 (new `negocios` and `cidades` hubs), es +20 (new `por-pais` hub and
  nationality selector, 4 nationality pages retargeted), hub +9 articles + `/residency/citizenship`,
  investorpass +5, frontier +8, flytta +5. About 50 new facts in `content/shared/facts.ts` (sourced, unverified).
- **W4 design system**: fluid tokens, 7 no-pink themes (`npm run check:contrast`, 119 pairs AA), `content/shared/proof.ts`
  (all empty; components hide until Anton fills it), TrustBar, Testimonials, PriceTable, AfterYouMessage, Guarantee,
  TeamSection, OfficeStrip, MobileWhatsAppBar, ArticleCards v2, guide sales parts, a PhotoHero with 3 layouts and a
  `video` prop. The showcase is `/dev/components` (dev only).
- **Media**: 65 site images (a unique hero + 4 tiles per brand, guide cover + 11 chapters, 18 hub images) in
  `public/images/arrival/` and `docs/imagery-manifest.json`; 7 Seedance hero loops in `public/videos/`
  (`docs/design/video-2026-10.md`).
- **Fixes**: HTML cache capped at 10 min (the ES homepage was unstyled from a year-long CDN cache), the document
  checklist crash, and `.claude/` kept out of lint, tsc and git.

## Status update 2026-09-29

Done and on `main`: PR #78 (overhaul), #80 (217 article images + `src/lib/article-images.json`), #81 (W5 per-brand
homepages, pricing, about, contact for all seven brands, shared article template, hub index page, brand-hero OG
images, AVIF for every hero and tile). CI Lighthouse mobile on #81: 0.94-0.99 on nine of ten pages (frontier
home 0.89 in CI, 0.95 locally; treat as noise). The content-consistency items (suace 24 months, off-plan, renewing
vs converting, frontier Interpol) are fixed.

## Still to do

1. **Dutch brand `emigreren`** on `emigrerennaarparaguay.nl` (aliases `woneninparaguay.nl`). Plan: `docs/design/nl-brand-plan.md`.
   Needs an Opus foundation session first (new SiteKey enum migration, `nl` locale, registry, theme), then Sonnet builders for pages and articles.
2. **Swedish domain**: connect `flyttatillparaguay.se`; check every domain resolves.
3. **Keyword data**: Anton will attach Google Keyword Planner CSVs per market. Cluster, map to pages, write the next content wave.
4. **Guide client JS** (only if a real Lighthouse regression shows up); per-brand `hreflang` is not needed (brands are not translations).

## Only Anton can do these

- **DNS**: `paraguayresidency.co.uk` and `paraguayinvestorpass.com` have no zone on Hostinger's nameservers;
  `vidanoparaguai.com` and `flyttatillparaguay.se` are NXDOMAIN. Also attach them to the Node app with SSL.
- **Env in hPanel**: `NEXT_PUBLIC_WHATSAPP_NUMBER` (no WhatsApp link exists anywhere today), email provider + CRM
  (`/api/health` shows email `console`, CRM `off`), Plausible (not loading), and Stripe live keys (the guide can't be bought;
  live shows "$49" while the plan says $7, so check the `products` row).
- **Purge the Hostinger CDN** after the deploy of this PR, or better, move DNS to Cloudflare (`docs/design/video-2026-10.md`).
- **Real data in `content/shared/proof.ts`**: team photos, residencies filed, Google Business Profile rating + URL,
  years, reviews with permission, office address and photos, and guarantee wording. Real photos to shoot:
  `docs/design/image-shotlist-2026-10.md` §6.
- **Prices** (`pricing.*` facts via `/admin/facts`). Market: temporary + cédula USD 1,500–2,300 (Brazil anchors at
  600–999), permanent ~1,900, Investor Pass 5,500–6,000 (`docs/audit/2026-10/competitors.md` §4).
- **Sign-off** on ~101 facts (`npm run facts:report` → `docs/facts-verification.md`), and the writer questions
  listed in the merge commits (`git log --merges design/overhaul-2026-10`).
- Make the repository private (the paid guide chapters are public on GitHub).

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

## Not finished: continue here

1. **W5 per-brand recomposition (the biggest remaining item).** Four builders were stopped mid-work. Their branches
   are local only (not pushed):
   - `worktree-agent-a8b9ef662abc9027f`: W5-A hub + guide, 2 clean commits (hub homepage, guide sales letter started)
   - `worktree-agent-a0362dfc0ff3eb94e`: W5-B investorpass + frontier, 1 commit + 1 WIP commit
   - `worktree-agent-a18cf2f46c8a1f544`: W5-C es + pt, 1 commit + 1 WIP commit
   - `worktree-agent-afd185b20ce47ea87`: W5-D flytta + shared templates (article template, `src/lib/article-images.ts`,
     hub index pages, per-brand OG routes, footer language switch, schema helper), 1 WIP commit
   For each: check it out (or read its diff against `design/overhaul-2026-10`), finish the brief in `docs/design/w5-brief.md`,
   run `npm run verify`, screenshot at 1440/390 and merge it into a new branch. The WIP commits are unverified.
   Merge W5-D first (shared templates), then the brand builders. Expect `common.json` conflicts (keys namespaced
   `w5a…w5d`) and `src/lib/hub-images.ts` (take the version on `design/overhaul-2026-10`; it already points every hub at
   its new image).
2. **Article images, 217 generated and reviewed, not yet on the site.** Records: `docs/design/article-image-slots-2026-10.json`
   (key `<site>/<hub>/<slug>` → id, prompt, alt en/es/pt/sv) and `docs/design/article-image-jobs-2026-10.json` (job ids
   + result urls; 224 and 316 were regenerated; for 316 take the job `2f0db8fd-6d2c-4fcd-acd4-0bb1bc51dd4c`, whose url
   is not recorded yet: `jobs_wait` it). Source PNGs may still be in `%TEMP%\pyimg\a-<index>.png` (index = the `i` field);
   otherwise re-download from the urls (they are cloudfront, no regeneration needed). Convert with
   `npx -y github:antonmarklundcom/webimg convert <png> --name <id> --alt "<alt_en>" --widths 480,800,1200 --out public/images/arrival --public-path /images/arrival`
   (delete `public/images/arrival/manifest.json` afterwards), add manifest rows (`"set": "overhaul-2026-10", "kind": "article"`,
   the 4 alts), then fill `src/lib/article-images.json` (created by W5-D) with `{ key: id }`. Budget: AVIF 800 ≈ 30–60 KB.
3. **Performance**: Lighthouse mobile is 0.80–0.82 on hub/guide (live guide 0.53). The LCP is the hero photo. Switch the
   homepages to the new AVIF heroes (W5 does this), and check the guide's client JS.
4. **Content consistency** flagged by writers, fixed in the W5-B WIP but unverified: suace.status "24 months", the
   off-plan purchase in the real-estate deep dive, "renewing-and-converting-to-permanent" vs Res. 0283/2026, and the
   frontier Interpol-myth story vs `fees.interpol_certificate`.
5. **Keyword data**: Anton will attach Google Keyword Planner CSVs. Cluster them by intent per market, map each
   cluster to an existing page (and note whether it ranks) or to a new page, and re-rank `docs/audit/2026-10/seo-gap.md`.
   Then write the next content wave (same rules as W6: `<Fact>` only, native language, answer-first template).

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

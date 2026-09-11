# Phase S21 — SEO surfaces. SONNET session. Spawned by S20, runs in parallel with S22 and S23.

Read ONLY: this file, `plan.md` §1, §4 (§4.7 and §4.12), §14 (intro, path note, §14.5), the phase table and §9
index, `docs/log/o19.md` and `docs/log/s20.md`, `docs/platform.md` §1, `docs/improvement-report.md` §1 items
13, 15 and 21. Execute plan §14.5 under §4. Build nothing outside it.

Owns (brand folders are under `src/app/(<locale>)/sites/<key>/` since O19):
- New index `page.tsx` files: `residency/guides/` and `guides/[hub]/`, `investorpass/insights/`,
  `frontier/stories/`, `residenciaes/guias/` + hub indexes, `residenciapt/guias/` + hub indexes,
  `flytta/guider/`, `flytta/stader/`
- `feed.xml/route.ts` per brand, `src/lib/rss.ts` (new), `src/lib/seo-files.ts`
- `src/sites/registry.ts` — nav/footer STRING AND ARRAY VALUES only, shape unchanged
- `frontier/{routes,tax,why-paraguay}/page.tsx` (JSON-LD only), `residenciaes/**` pages (the WhatsApp link only)
- `src/i18n/messages/*/common.json` (additive keys, all four locales at once), `docs/log/s21.md`, `plan.md` §9 line

HARD LIMITS (§4.7): no `src/lib` file other than `seo-files.ts` and the new `rss.ts`; no `src/app/api`,
middleware, schema, `src/components` edits beyond an additive optional prop if `siteMetadata` needs
`<link rel="alternate">`. Do not touch article bodies or frontmatter (S23 and S20 own those). Do not touch the
pricing, contact, insider or quiz files (S22's).

Budget: one session, ≤ 90 min. Open the PR the turn the exit criteria pass.

Phase rules:
- Branch `phase/s21` off latest `main`. WIP commit every 30 min. `git merge main` before opening the PR — main
  wins on conflict, re-apply yours (§4.12).
- Index pages read through the existing content query layer (`src/content/**`, `getPages`), never the filesystem
  directly; locale-correct copy, `CollectionPage` JSON-LD, breadcrumbs, added to `staticPaths` and sitemaps.
- Same-shaped units (7 brands × index): build one exemplar (hub), then fan out the rest as parallel Sonnet
  subagents per `fable-directs-sonnet-builds`; one verify, one PR.
- RSS: valid RSS 2.0 (check with a validator script under `tests/`), absolute URLs via `siteOrigin(key)`.
- Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.5 exit line — every brand has an index + feed in its sitemap, nav values added, frontier
`Service` JSON-LD, ES WhatsApp, verify green, PR merged green, `docs/log/s21.md` + §9 line.

## After this phase
Spawn nothing. End with the phase report.

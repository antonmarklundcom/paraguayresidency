# paraguayresidency — full-site audit, 2026-09-21

Audited commit `cf3b48b` (origin/main, "docs: six standalone homepage redesign prompts…", #47) in a
detached worktree. 253 URLs across 7 brands, each crawled at 1440×900, 768×1024 and 390×844
(759 page loads) with Playwright + axe-core, plus a production-build (`next start`) pass at 390 for
performance and production-only console errors. Findings: 32 (2 critical, 9 high, 13 medium, 8 low).
No application code was changed; everything is under `docs/audit/2026-09-21/`.

## 1. Verdict

Fix these three first. **(1) F-001/F-002: the design system's type scale does not exist.** Tailwind v4
compiles all 214 `text-[var(--text-*)]` classes to `color:` rather than `font-size:`, so every heading
on all seven brands is 17px regular (the same as body copy), and because that bogus `color` rule wins
over `text-[var(--accent-fg)]`, every primary button on every brand has dark text on a dark accent
(2.08–3.16:1, 720 axe failures on 197 pages). It is one mechanical codemod, it clears most of the
contrast report, and until it lands every design or CRO judgement is made against pages that are not
rendering as designed. Doing it first matters for that reason alone. **(2) F-003/F-004/F-005: the
legal-figure rule is broken on the pages that matter most.** Homepages print "Two years, then
permanent" and "Ten-year card" next to the hedged, unverified `<Fact>` for the same thing, the
permanent-residency `<title>` says "10-Year Card", and wherever a hedge is spliced into a sentence the
copy stops being grammatical ("carries a minimum-presence rule applies"; "la permanente lleva existe
una regla") or falls back to English on the es/pt/sv brands. This is the plan's one non-negotiable
content rule, and it is also a credibility problem for a service that asks for trust. **(3) F-006 +
F-008/F-009: pages that could convert or rank are disconnected.** 39 sitemap pages (the whole
Investor Pass /insights section, frontier /stories, the residency /guides hubs) have no internal
link. The Investor Pass homepage has no CTA above the fold. Service pages put their only action at the
bottom of 6–9 phone screens, and two frontier pages have none at all. Each fix is small and mostly
config or composition.

`npm run verify`: **green** on a clean tree (typecheck, lint, 624 tests passed / 10 skipped, verify:i18n
"189 common keys × 4 locales, 39 brand keys × 7 brands", build OK, 2 Turbopack warnings → F-026).
The first run was red only because `tests/repo-hygiene.test.ts` rejects untracked files and this
audit folder was untracked (F-027). Moved aside and re-run → exit 0.

**Scope note.** The crawl found 253 URLs (more than 150), so the hard signals cover all 253, but the
design/CRO review (step 3) covers the 7 homepages plus the top 3 pages per brand (28 pages; list in the
appendix).

## 2. All findings

| ID | Severity | Category | Brand | What | Effort |
|---|---|---|---|---|---|
| F-001 | critical | design | all | Every `text-[var(--text-*)]` Tailwind class compiles to `color:` instead of `font-size:`, so no brand has a type scale: every H1, H2, eyebrow, button and body… | M |
| F-002 | critical | a11y | all | The primary CTA / submit button text fails WCAG contrast on all seven brands (2.08:1 to 3.16:1), because the broken `text-[var(--text-sm)]` rule (a later `color:`… | S |
| F-003 | high | repo-rule | residency, frontier, investorpass, residenciaes, flytta | Legal figures are hard-coded in JSX/MDX, bypassing <Fact>, and they contradict the unverified facts the same pages render hedged: "Two years, then permanent",… | S |
| F-004 | high | content | all | Sentences were written around a fact’s short `display` value, but the page renders the long `hedged` clause, so the copy becomes ungrammatical on every brand. | M |
| F-005 | high | content | residenciaes, residenciapt, flytta, frontier | Facts without an es/pt/sv string render English on the Spanish, Portuguese and Swedish brands, and the cost-of-living facts’ English text is Brazil-specific ("Rio or… | S |
| F-006 | high | seo | residency, investorpass, frontier, flytta | 39 sitemap-listed content pages have zero internal links: the whole Investor Pass /insights section, the whole frontier /stories section, the residency /guides hubs… | S |
| F-007 | high | bug | flytta | <Disclaimer> renders a <p>, MDX wraps its multi-line children in another <p>, and the invalid nesting throws a hydration error on 8 flytta articles, in dev and in the… | S |
| F-008 | high | cro | investorpass | The Investor Pass homepage has no call to action above the fold at 390 or 1440: the hero is a centred eyebrow, one-line H1 and paragraph, then an empty dark band; the… | S |
| F-009 | high | cro | all | Inner pages give the reader one action, at the very bottom: service pages have a single CTA (the lead form) after 6-9 screens of copy, frontier /routes and… | M |
| F-010 | high | cro | all | Nothing establishes who files these cases before the ask: no named person, role, licence, firm, registration number, photo, review or case count appears on any page;… | M |
| F-011 | high | cro | residency, frontier, residenciaes, residenciapt, flytta | The pricing pages contain no price, range or even "from" figure; each of five route blocks repeats the same "Service fee: a fixed service fee quoted on your call"… | M |
| F-012 | medium | design | all | `--space-10` (26 files) and `--space-5` (1 file) are used but never defined, so every `mt-[var(--space-10)]` / `gap-…` using them collapses to 0. | S |
| F-013 | medium | design | all | There is no mobile menu: all 5-6 nav links wrap into 3-4 rows next to the logo, so the header is 97-169px tall at 390 (up to 20% of the first screen) before any content. | M |
| F-014 | medium | cro | frontier, residenciaes, residenciapt, flytta | The closing section stacks five competing actions — Route Finder button, "talk to us" button, a WhatsApp text link, a 5-7 field lead form and a separate 3-field… | S |
| F-015 | medium | cro | all | No form says what happens after submit, and the forms ask for more than they need: the service form shows 7 fields with only email required, the Investor Pass form 9… | S |
| F-016 | medium | bug | all | Every 404, including notFound() inside a brand route, serves Next’s default unbranded English page ("404: This page could not be found.") with no nav, no brand and no… | M |
| F-017 | medium | bug | guide | The runtime price fallback is 4900 cents ($49) while the seed default and the locked plan decision are 700 ($7), so whenever the product row is missing the sales page… | S |
| F-018 | medium | a11y | all | Header and footer links are 22px tall at 390, below the 24px WCAG 2.2 AA minimum and the 44px target the brief asks for, on every page. | S |
| F-019 | medium | seo | residency, investorpass, frontier, residenciaes, residenciapt, flytta | Every content hub has a one-word <title> (5-18 characters) and a 21-34 character meta description, on 22 indexable hub pages. | S |
| F-020 | medium | seo | residency, frontier, guide, investorpass | Indexable pages on sibling English domains share identical titles, H1s and body paragraphs, which invites search engines to pick one and drop the others. | M |
| F-021 | medium | design | residency, frontier, residenciaes, residenciapt, flytta | Five of the seven brands are the same page with a different accent colour: identical split hero with a bordered aside card, "Who this is for" paragraph, three-card… | L |
| F-022 | medium | design | residency, investorpass, guide, frontier, residenciaes, residenciapt, flytta | The bento grid’s first tile is a double-height feature slot, but every page fills it with one line of text, leaving a large empty white box; investorpass’s four… | S |
| F-023 | medium | a11y | all | Listing and process pages jump from the H1 straight to H3 card/step titles with no H2. | S |
| F-024 | medium | content | investorpass, residency, frontier | Hedging is so dense that answers read as evasions: on the Investor Pass homepage the FAQ "Is the minimum investment fixed?" answers with a referral to another page,… | M |
| F-025 | low | content | residency, investorpass, guide, frontier | The English unsubscribe note says "one click, all three brands" — there are seven. | S |
| F-026 | low | perf | all | The production build warns that a dynamic path join makes Turbopack trace the whole project into the server output. | S |
| F-027 | low | bug | all | Running `npm run dev` rewrites the tracked next-env.d.ts (./.next/types -> ./.next/dev/types), and the repo-hygiene test fails on any untracked file, so `npm run… | S |
| F-028 | low | bug | all | Next 16 logs that the middleware file convention is deprecated in favour of proxy. | S |
| F-029 | low | seo | flytta, frontier, guide, investorpass | A handful of in-body cross-brand links lack rel="noopener" while the footer versions carry it; conversely rel="noopener" is set on same-tab links where it has no effect. | S |
| F-030 | low | a11y | frontier | A horizontally scrollable region on frontier /process cannot be reached by keyboard. | S |
| F-031 | low | seo | all | Static sitemap entries use `lastModified: new Date()`, so every fetch claims every static page changed today. | S |
| F-032 | low | design | guide | The guide hero’s eyebrow repeats the H1 almost verbatim ("THE PARAGUAY RESIDENCY GUIDE WE WISH EXISTED." above "The Paraguay residency guide we wish existed before we… | S |

## 3. Findings in full

### Critical (2)

#### F-001 — Every `text-[var(--text-*)]` Tailwind class compiles to `color:` instead of `font-size:`, so no brand has a type scale: every H1, H2, eyebrow, button and body paragraph renders at the inherited 17px.

- **Category / brand / effort:** design · all · M
- **Where:** every page (253 URLs)
- **File:** `src/components/primitives.tsx:53 (+213 more occurrences in 86 files under src/)`
- **Evidence:** Compiled dev CSS (src_app_globals_*.css, lines 1149-1175): `.text-\[var\(--text-4xl\)\] { color: var(--text-4xl); }`, same for text-sm/lg/xl/2xl/3xl/xs and the `[&_h2]:text-[var(--text-2xl)]` prose variant. Design probe (28 key pages x 390/1440): H1 computed font-size 17px / weight 400 on 56 of 56 page-views; body paragraph also 17px. Tailwind 4.3.3 treats an untyped `var()` in `text-[...]` as a colour. Present since the O1 scaffold (e31ff4e). `grep -rhoE "text-\[var\(--text-[a-z0-9]+\)\]" src | wc -l` = 214 in 86 files.
- **Fix:** Replace every `text-[var(--text-X)]` with the typed form `text-(length:--text-X)` (or `text-[length:var(--text-X)]`), including the `[&_h2]:`/`[&_h3]:` variants in primitives.tsx Prose. Mechanical codemod across src/. Then add a vitest that builds (or reads the built) CSS and asserts `.text-(length:--text-4xl)` produces `font-size`, so a regression fails verify. Re-screenshot all brands at 390 afterwards: a 3.25rem H1 at 390 will wrap differently.
- **Risk:** Every page changes appearance at once. Headings grow 1.5-3x, so long H1s (e.g. flytta article titles) may wrap to 4+ lines or overflow at 390; hero heights and fold content change; Lighthouse/LCP element may shift to the H1. Needs a full visual re-review, not just verify.

#### F-002 — The primary CTA / submit button text fails WCAG contrast on all seven brands (2.08:1 to 3.16:1), because the broken `text-[var(--text-sm)]` rule (a later `color:` declaration with an invalid value) overrides `text-[var(--accent-fg)]` and the text falls back to the inherited body colour.

- **Category / brand / effort:** a11y · all · S
- **Where:** 197 pages (every page with a primary button or submit)
- **File:** `src/components/Button.tsx; src/components/LeadFormFields.tsx; src/components/NewsletterFormFields.tsx (all combine text-[var(--accent-fg)] with text-[var(--text-sm)])`
- **Evidence:** axe color-contrast (serious): 720 nodes on 197 pages. Pairs measured: flytta #131a24 on #0b4f8a = 2.08 (51 pages); investorpass #f3f1ec on #c9a227 = 2.14 (18); residenciapt #10241b on #006b3c = 2.45 (23); frontier #16211d on #1d6b52 = 2.58 (18); residenciaes #241c12 on #c1121f = 2.69 (23); residency #16181c on #1d6b4f = 2.76 (34); guide #211a12 on #b4471f = 3.16 (30). Theme files declare the intended pairs (white on accent; #14171c on gold for investorpass). Visible in shots/*/home-mobile-fold.png: dark text on dark green/blue/red buttons.
- **Fix:** Fixed by the codemod in F-001 (once `text-sm` stops emitting `color`, `--accent-fg` applies). Re-run axe after F-001; expected result is zero color-contrast nodes on buttons. No theme change needed.
- **Risk:** None beyond F-001; this is the same change. If F-001 is done partially, buttons that still carry the broken class stay illegible.

### High (9)

#### F-003 — Legal figures are hard-coded in JSX/MDX, bypassing <Fact>, and they contradict the unverified facts the same pages render hedged: "Two years, then permanent", "Ten-year card", a "10-Year Card" SEO title, "2 år", a 90-day filing timeline, and a "valid for only 90 days" police-clearance claim.

- **Category / brand / effort:** repo-rule · residency, frontier, investorpass, residenciaes, flytta · S
- **Where:** http://localhost:3000/ ; http://localhost:3000/residency/permanent-residency ; http://frontier.localhost:3000/ ; http://investorpass.localhost:3000/investor-pass/vs-standard-residency ; http://residenciaes.localhost:3000/ ; http://flytta.localhost:3000/guider/residency-tidslinje-och-kostnad ; http://frontier.localhost:3000/stories/american-first-90-days ; http://localhost:3000/guides/documents/what-you-need-to-apply ; http://flytta.localhost:3000/
- **File:** `src/app/(en)/sites/residency/page.tsx:29,34 ; src/app/(en)/sites/residency/residency/permanent-residency/page.tsx:11 ; src/app/(en)/sites/frontier/page.tsx:34 ; src/app/(en)/sites/investorpass/investor-pass/vs-standard-residency/page.tsx:88,95 ; src/app/(es)/sites/residenciaes/page.tsx:31 ; content/flytta/guider/residency-tidslinje-och-kostnad.mdx:72-76 ; content/frontier/stories/american-first-90-days.mdx:2,11-14 ; content/residency/documents/what-you-need-to-apply.mdx:96 ; src/app/(sv)/sites/flytta/page.tsx:58`
- **Evidence:** facts.ts: temporary.duration verified:false (hedged "a fixed initial term…"), yet 4 files print "Two years, then permanent" / "Dos años, y después permanente" and flytta prints "2 år". investorpass.validity_years verified:false (hedged "we confirm the exact term in writing"), yet the permanent-residency <title> is "Permanent Residency in Paraguay — the 10-Year Card" and two cards say "Ten-year card". residency.timeline note: "No verified processing estimate supplied", yet a frontier story title/FAQ promises "first 90 days". documents.police_certificate_validity note: "No verified validity window", yet what-you-need-to-apply says clearances are "valid for only 90 days". The residency homepage shows "Two years, then permanent." in a card and, lower down, the hedged <Fact k="temporary.duration"> in the same page.
- **Fix:** Replace each literal with the matching <Fact k> (temporary.duration, investorpass.validity_years, residency.timeline, documents.police_certificate_validity) or rewrite the sentence so it carries no figure (e.g. card body "The standard first step, then permanent"). Rename the permanent-residency title to drop "10-Year". Rename/re-slug the frontier story only if Anton wants; otherwise rewrite the title as "An American’s first months filing…" and keep the slug (no redirect needed). Add a test that fails on the known literal patterns ("two years, then permanent", "ten-year", "10-year") in src/app and content/.
- **Risk:** Changing the frontier story title changes its <title>/H1 (SEO continuity is fine because the slug stays). If Anton has in fact verified any of these figures, the right fix is flipping verified:true in facts.ts instead — ask before rewriting copy.

#### F-004 — Sentences were written around a fact’s short `display` value, but the page renders the long `hedged` clause, so the copy becomes ungrammatical on every brand.

- **Category / brand / effort:** content · all · M
- **Where:** http://localhost:3000/ ; http://frontier.localhost:3000/ ; http://residenciaes.localhost:3000/ ; http://flytta.localhost:3000/ ; http://investorpass.localhost:3000/investor-pass/requirements
- **File:** `src/app/(en)/sites/residency/page.tsx:154 ; src/app/(en)/sites/frontier/page.tsx:174 ; src/app/(es)/sites/residenciaes/page.tsx:156 ; src/app/(sv)/sites/flytta/page.tsx:176 ; src/app/(en)/sites/investorpass/investor-pass/requirements/page.tsx ; content/frontier/stories/the-presence-rules-nobody-explains.mdx:34`
- **Evidence:** Rendered text: residency home "Permanent residency carries a minimum-presence rule applies — we tell you exactly what it means for your travel pattern — we explain exactly what that means…"; residenciaes home "La permanente lleva existe una regla de presencia mínima — te decimos … — te explicamos exactamente…"; residenciaes "Si eres nacional del Mercosur, hay la nacionalidad Mercosur puede simplificar…"; flytta home "Permanent uppehållstillstånd har a minimum-presence rule applies…" (also English, see F-005); investorpass /requirements "Every route needs a qualifying investment that starts from a qualifying investment amount we confirm on your call." Visible in shots/residenciaes/home-desktop.png and shots/investorpass/investor-pass__requirements-mobile-fold.png.
- **Fix:** Two-part: (1) rewrite each host sentence so the fact is a complete clause on its own ("Permanent residency comes with a presence rule: <Fact/>."), and (2) change the convention in facts.ts so `hedged` and `display` are grammatically interchangeable (both noun phrases, or both full clauses) and document it at the top of facts.ts. A unit test can render each fact’s hedged and display strings into a fixed frame to catch mismatches. Do NOT add numbers to hedged text.
- **Risk:** Copy-only, but touches the facts registry wording that the launch review (F7) verifies; keep keys stable so /admin/facts and data-fact attributes still match.

#### F-005 — Facts without an es/pt/sv string render English on the Spanish, Portuguese and Swedish brands, and the cost-of-living facts’ English text is Brazil-specific ("Rio or São Paulo"), so it appears on the Spanish-market page and on the American-market frontier story.

- **Category / brand / effort:** content · residenciaes, residenciapt, flytta, frontier · S
- **Where:** http://flytta.localhost:3000/ (and 7 flytta articles) ; http://residenciapt.localhost:3000/investor-pass ; http://residenciapt.localhost:3000/guias/impostos/impostos-no-paraguai-e-a-sua-declaracao-no-brasil ; http://residenciaes.localhost:3000/guias/comparativas/paraguay-vs-espana ; http://frontier.localhost:3000/stories/cost-of-living-reality-check
- **File:** `content/shared/facts.ts (hedged maps for permanent.presence_rule, tax.territorial_rate, investorpass.min_investment_usd, costofliving.overview/rent/groceries)`
- **Evidence:** Crawl (desktop text nodes): flytta 7 pages "a minimum-presence rule applies — we tell you exactly what it means for your travel pattern" (span[data-fact=permanent.presence_rule]); residenciapt 3 pages same, 3 pages "a low flat rate on Paraguay-sourced income under a territorial system…", /investor-pass "from a qualifying investment amount we confirm on your call"; residenciaes /guias/comparativas/paraguay-vs-espana "noticeably lower than Rio or São Paulo for most people…"; frontier cost-of-living story renders the same Rio/São Paulo sentence to a US audience. facts.ts locales missing: permanent.presence_rule pt,sv; tax.territorial_rate pt,sv; investorpass.min_investment_usd pt,sv; costofliving.* es,sv (and their `en` is written for Brazilians). The English fallback is documented as deliberate in facts.ts (LocalizedText), and verify:i18n does not scan facts, which is why the gate is green.
- **Fix:** Add pt/sv (and es where missing) hedged strings for the facts actually rendered on those brands; rewrite costofliving.* `en` to be market-neutral and move the Brazil comparison into the `pt` string. Extend scripts/verify-i18n.ts to fail when a <Fact k> used on a non-en brand has no string for that brand’s locale (keep the runtime fallback as a safety net).
- **Risk:** Copy-only. The new gate could fail on facts used only on EN pages if it is not scoped to where each key is used; scope it by scanning usages per brand folder.

#### F-006 — 39 sitemap-listed content pages have zero internal links: the whole Investor Pass /insights section, the whole frontier /stories section, the residency /guides hubs and most of their articles, and the flytta /guider and /stader index pages.

- **Category / brand / effort:** seo · residency, investorpass, frontier, flytta · S
- **Where:** http://investorpass.localhost:3000/insights (+8 articles) ; http://frontier.localhost:3000/stories (+10) ; http://localhost:3000/guides, /guides/comparisons, /guides/documents, /guides/living-in-paraguay, /guides/taxes (+7 articles) ; http://flytta.localhost:3000/guider ; http://flytta.localhost:3000/stader
- **File:** `src/sites/registry.ts (nav/footer for residency, investorpass, frontier, flytta)`
- **Evidence:** Breadth-first crawl from each homepage (same-host links, depth 4) reached 176 of the 215 sitemap URLs; the 39 remaining are reachable only from sitemap.xml. Post-crawl check of every crawled page’s <a href>: no page on investorpass links to /insights*, none on frontier to /stories*, none on flytta to /guider or /stader, and the only residency link into /guides is /process -> /guides/documents/what-you-need-to-apply. Homepage href lists (curl) contain no /insights, /stories or /guides. See enumeration-detail.json.
- **Fix:** Add the hub to each brand’s registry nav or footer (residency "Guides" -> /guides, investorpass "Insights" -> /insights, frontier "Stories" -> /stories, flytta "Guider" -> /guider and "Städer" -> /stader), plus a "Latest articles" block on each homepage and a related-articles block on each service page. Registry nav is config, not middleware.
- **Risk:** Nav gets one more item, which worsens F-013 (mobile nav wraps) unless F-013 lands first or the link goes in the footer. verify:i18n will require the new label keys in every locale.

#### F-007 — <Disclaimer> renders a <p>, MDX wraps its multi-line children in another <p>, and the invalid nesting throws a hydration error on 8 flytta articles, in dev and in the production build.

- **Category / brand / effort:** bug · flytta · S
- **Where:** http://flytta.localhost:3000/guider/driva-bolag-fran-paraguay (+7: paraguay-vs-alternativen, permanent-vs-temporar-residency, residency-krav-och-dokument, sjukvard-och-forsakring, skattehemvist-och-183-dagarsregeln, skattesystemet-i-paraguay-10-10-10, ta-med-pengar-och-vaxla)
- **File:** `src/components/Disclaimer.tsx:10`
- **Evidence:** Dev console (all 3 viewports, 8 pages): "In HTML, <p> cannot be a descendant of <p>. This will cause a hydration error." + uncaught "Error: Hydration failed because the server rendered HTML didn't match the client". Production (next start): uncaught "Minified React error #418 (HTML)" on the same 8 pages. Server HTML contains `<p class="not-prose mt-[var(--space-6)] …"><p>`. All 8 articles use a multi-paragraph <Disclaimer> block.
- **Fix:** Change the wrapper in Disclaimer.tsx from <p> to <div role="note"> (or <aside>) with the same classes. No MDX edits needed.
- **Risk:** Minimal. Spacing inside the box may change slightly because the inner <p> gets prose margins; check one article.

#### F-008 — The Investor Pass homepage has no call to action above the fold at 390 or 1440: the hero is a centred eyebrow, one-line H1 and paragraph, then an empty dark band; the first actionable element is the inquiry form roughly 9 screens down on mobile.

- **Category / brand / effort:** cro · investorpass · S
- **Where:** http://investorpass.localhost:3000/
- **File:** `src/app/(en)/sites/investorpass/page.tsx`
- **Evidence:** Design probe: fold CTAs = [] at 390x844 and 1440x900; 5 CTAs on the page, 9 of 11 mobile screen-heights contain none; the form starts after the FAQ. shots/investorpass/home-mobile-fold.png and home-desktop.png (the hero ends with ~180px of empty dark background before the aside text).
- **Fix:** Add the brand’s two actions to the hero (primary "See if you qualify" anchoring to the form, secondary "Book a call"), matching the SplitHero pattern the other brands use, and repeat the primary after the routes grid and the FAQ.
- **Risk:** Page composition only; the form itself (shared conversion machinery) is untouched.

#### F-009 — Inner pages give the reader one action, at the very bottom: service pages have a single CTA (the lead form) after 6-9 screens of copy, frontier /routes and /why-paraguay have none at all, and no brand has a sticky or repeated CTA.

- **Category / brand / effort:** cro · all · M
- **Where:** every service page, e.g. http://localhost:3000/residency/temporary-residency ; http://frontier.localhost:3000/routes ; http://frontier.localhost:3000/why-paraguay
- **File:** `src/app/(en)/sites/residency/_lib/ServicePage.tsx and the per-brand equivalents; src/app/(en)/sites/frontier/routes/page.tsx; src/app/(en)/sites/frontier/why-paraguay/page.tsx`
- **Evidence:** Design probe at 390: residency /residency/temporary-residency 1 CTA, 8 of 9 screens without one; investorpass /requirements and /investment-routes 1 CTA, 8/9; residenciaes /residencia/temporal 9/10; residenciapt /residencia/temporaria 9/10; flytta /uppehallstillstand 8/9; frontier /routes 0 CTAs (6/6 screens), /why-paraguay 0 CTAs (5/5). No position:fixed/sticky element on any probed page.
- **Fix:** Add a compact CTA block (primary + secondary) after the first section and before the FAQ on every service page template; add a mobile-only sticky bottom bar with the primary action on service and pricing pages (shared component in src/components, reading the brand’s primary href/label from the registry). Give frontier /routes and /why-paraguay the same closing CTA the homepage has.
- **Risk:** A sticky bar can cover the cookie/consent UI or the form submit on short phones; hide it while the lead form is in view. Must not touch LeadForm internals.

#### F-010 — Nothing establishes who files these cases before the ask: no named person, role, licence, firm, registration number, photo, review or case count appears on any page; the "Who files your case" box says only "the same team … every week in Asunción".

- **Category / brand / effort:** cro · all · M
- **Where:** every homepage and every /about page
- **File:** `src/app/(en)/sites/*/about/page.tsx, src/app/(es)/sites/residenciaes/nosotros/page.tsx, src/app/(pt)/sites/residenciapt/sobre/page.tsx, src/app/(sv)/sites/flytta/var-historia/page.tsx`
- **Evidence:** Probe text search on 28 key pages for lawyer/abogado/advogado/advokat/attorney/licensed/registered/named team: zero hits on any service or homepage except generic "team in Asunción". shots/residency/residency__temporary-residency-desktop.png "Who files your case" box; terms pages state "We are a residency filing service, not a law firm". flytta /var-historia is the only first-person page (Anton’s story) and it is not referenced above any form on the other brands.
- **Fix:** Anton to supply real, verifiable trust facts (names and roles of the Asunción team, any registration, number of cases filed if true, real client quotes with permission). Then add a trust strip under each hero and a named "who files your case" block beside each form. Do not invent names, counts or testimonials.
- **Risk:** Owner-blocked on real information; publishing unverifiable claims is worse than the current silence.

#### F-011 — The pricing pages contain no price, range or even "from" figure; each of five route blocks repeats the same "Service fee: a fixed service fee quoted on your call" line and the same government-fees paragraph, so the page answers the cost objection with five copies of "ask us".

- **Category / brand / effort:** cro · residency, frontier, residenciaes, residenciapt, flytta · M
- **Where:** http://localhost:3000/pricing ; http://frontier.localhost:3000/pricing ; http://residenciaes.localhost:3000/precios ; http://residenciapt.localhost:3000/precos ; http://flytta.localhost:3000/priser
- **File:** `src/app/(en)/sites/residency/pricing/page.tsx (and brand equivalents); content/shared/facts.ts pricing.* (all verified:false)`
- **Evidence:** shots/residency/pricing-desktop.png: 5 blocks, each with identical "What it never covers" and "What you pay the state" paragraphs (exact-duplicate paragraph check: 3 paragraphs repeated 5x on the page). pricing.temporary/permanent/cedula/tax_residency/family are all verified:false in facts.ts, so <Fact> correctly renders the hedge. Mobile page height 7,950px.
- **Fix:** Owner step first: get the pricing.* facts verified so real numbers render. Independently of that, collapse the repeated paragraphs into one "What every fee covers / never covers" section above a compact per-route table (route, what is included, fee = <Fact>), and add one primary CTA per route row. No invented numbers.
- **Risk:** The layout change is safe; the numbers depend on Anton and his legal partner.

### Medium (13)

#### F-012 — `--space-10` (26 files) and `--space-5` (1 file) are used but never defined, so every `mt-[var(--space-10)]` / `gap-…` using them collapses to 0.

- **Category / brand / effort:** design · all · S
- **Where:** e.g. http://residenciaes.localhost:3000/ (closing CTA block); 26 files
- **File:** `src/styles/tokens.css (defines --space-1..4,6,8,12,16,20,24 only); usages e.g. src/app/(es)/sites/residenciaes/page.tsx:195`
- **Evidence:** Script comparing var(--x) usages in src/ against custom properties defined in tokens.css, themes/*.css and globals.css: only --space-10 and --space-5 are undefined. Measured on residenciaes home at 1440: the closing "Descubre tu ruta" buttons end at y=5845.6 and the "Cuéntanos tu caso" heading starts at y=5845.6 (0px gap) — screenshot evidence/es-cta-gap.png.
- **Fix:** Add `--space-5: 1.25rem;` and `--space-10: 2.5rem;` to src/styles/tokens.css (matching the existing 0.25rem step), and add a test that every var(--*) used in src/ is defined in the token/theme CSS.
- **Risk:** Adds spacing where there was none in 26 files; pages get slightly taller. Harmless.

#### F-013 — There is no mobile menu: all 5-6 nav links wrap into 3-4 rows next to the logo, so the header is 97-169px tall at 390 (up to 20% of the first screen) before any content.

- **Category / brand / effort:** design · all · M
- **Where:** every page at 390px
- **File:** `src/components/Nav.tsx:17`
- **Evidence:** Design probe header height at 390: residency/investorpass/frontier/residenciaes/flytta 133px, residenciapt 169px, guide 97px. At 1440 the same header is 61px. shots/residenciapt/home-mobile-fold.png shows four rows of links. Nav links are 22px tall (see F-018).
- **Fix:** Below the md breakpoint render the logo plus a menu button (a <details>/<summary> disclosure works without client JS) with the primary CTA visible; keep the inline list from md up.
- **Risk:** Shared component across all brands; keyboard and screen-reader behaviour of the disclosure must be checked. No routing impact.

#### F-014 — The closing section stacks five competing actions — Route Finder button, "talk to us" button, a WhatsApp text link, a 5-7 field lead form and a separate 3-field WhatsApp form side by side — with two identical "Enviar"/"Skicka" buttons.

- **Category / brand / effort:** cro · frontier, residenciaes, residenciapt, flytta · S
- **Where:** http://frontier.localhost:3000/ ; http://residenciaes.localhost:3000/ ; http://residenciapt.localhost:3000/ ; http://flytta.localhost:3000/ (and each /contact)
- **File:** `src/app/(es)/sites/residenciaes/page.tsx:176-205 (same block in frontier, residenciapt, flytta page.tsx and contact/page.tsx)`
- **Evidence:** Design probe: homepage CTAs frontier 9 (6 distinct targets), residenciaes 9 (6), residenciapt 9 (6), flytta 15 (11); /contact on es/pt shows two "Enviar" submits in one viewport. shots/residenciaes/home-desktop.png bottom section.
- **Fix:** Pick one primary per screen: keep the lead form as the primary, turn the WhatsApp form into a single "Prefer WhatsApp?" link (the whatsappHref helper already exists), and drop the duplicate buttons above the form. On /contact keep one form.
- **Risk:** Removing the WhatsApp form removes a lead path some visitors may prefer; keep the wa.me link so the channel survives. LeadForm internals untouched.

#### F-015 — No form says what happens after submit, and the forms ask for more than they need: the service form shows 7 fields with only email required, the Investor Pass form 9 fields (4 of them selects) with only email required.

- **Category / brand / effort:** cro · all · S
- **Where:** every page with a LeadForm or NewsletterForm
- **File:** `src/components/LeadForm.tsx, src/components/LeadFormFields.tsx (shared conversion machinery)`
- **Evidence:** Probe: text next to every submit button is empty on all 28 key pages. Field sets: name,email*,phone,whatsapp,nationality,country,message (34 pages); + investmentRange,investmentRoute (5 investorpass pages); es/pt/flytta homepage variant name,email*,phone,whatsapp,message.
- **Fix:** Add one line under each submit, per locale, e.g. "A person replies within one working day with your route and next step. No spam." — only if the reply time is true (ask Anton). Consider hiding phone and WhatsApp behind a single "Phone or WhatsApp (optional)" field. This is copy + field layout in shared conversion machinery, so it needs Opus/owner review per plan §6.
- **Risk:** LeadFormFields is shared across every brand and is off-limits to Sonnet phases; the lead schema must keep accepting the old field names.

#### F-016 — Every 404, including notFound() inside a brand route, serves Next’s default unbranded English page ("404: This page could not be found.") with no nav, no brand and no <html lang>; the four branded not-found.tsx files never render.

- **Category / brand / effort:** bug · all · M
- **Where:** http://localhost:3000/no-such-page ; http://flytta.localhost:3000/guider/finns-inte ; http://localhost:3000/guides/taxes/no-such-article
- **File:** `src/app/(en)/not-found.tsx, src/app/(es)/not-found.tsx, src/app/(pt)/not-found.tsx, src/app/(sv)/not-found.tsx (never used); no src/app/global-not-found.tsx`
- **Evidence:** Production server: GET /no-such-page-xyz on localhost, residenciaes.localhost and flytta.localhost -> 404, <title>404: This page could not be found.</title>, <html id="__next_error__"> without lang, `next-error-h1`. Same for /guides/taxes/no-such-article (in-segment notFound) and flytta /guider/finns-inte. With multiple root layouts (one per locale group), Next needs app/global-not-found.tsx for unmatched URLs.
- **Fix:** Add src/app/global-not-found.tsx that reads the x-site header (set by middleware) and renders SiteShell + NotFoundBody for that brand with the right <html lang>; confirm whether in-segment notFound() then uses the group not-found.tsx and fix whichever path still falls through.
- **Risk:** global-not-found renders outside the normal layout tree, so the header read and theme attribute must be done there; test all seven hosts.

#### F-017 — The runtime price fallback is 4900 cents ($49) while the seed default and the locked plan decision are 700 ($7), so whenever the product row is missing the sales page (and checkout amount) show $49.

- **Category / brand / effort:** bug · guide · S
- **Where:** http://guide.localhost:3000/ (price block "$49, once")
- **File:** `src/lib/purchases.ts:55-58 ; scripts/seed.ts:105`
- **Evidence:** purchases.ts: `process.env.GUIDE_PRICE_CENTS ?? '4900'`; seed.ts: `positiveInt('GUIDE_PRICE_CENTS', 700)`; plan.md:490 "~~Guide price: $49 default~~ Decided 2026-09-07: $7". With no DATABASE_URL the guide homepage renders "$49, once" (shots/guide/home-desktop.png). With a seeded DB the product row wins, so production is only affected if the row is missing or unreadable.
- **Fix:** Change the fallback in purchases.ts to 700 to match seed.ts and plan §1.5 (or read one shared constant used by both). Add a test asserting fallbackPriceCents() === seed default.
- **Risk:** Payments territory (CLAUDE.md: Sonnet phases do not touch payments) — needs Opus or a supervised session. A one-constant change, but it alters what checkout charges when the DB is down.

#### F-018 — Header and footer links are 22px tall at 390, below the 24px WCAG 2.2 AA minimum and the 44px target the brief asks for, on every page.

- **Category / brand / effort:** a11y · all · S
- **Where:** every page at 390px (footer and header links)
- **File:** `src/components/Footer.tsx ; src/components/Nav.tsx`
- **Evidence:** Mobile tap-target scan (non-inline interactive elements): footer sibling links "Paraguay Residency" 148x22 (209 pages), "Paraguay Investor Pass" 170x22 (165), "Paraguay Residency Guide" 197x22 (144); "Contact"/"About"/"Privacy"/"Terms" 44-58x22 (122 pages each); breadcrumb "Home" 46x28 (80). Quiz radio inputs are 13x13 but wrapped in a clickable <label>, so they are not counted as a defect.
- **Fix:** Give nav/footer links `py-3` (or min-h-11 inline-flex items-center) at small breakpoints, and increase footer list gap so targets do not overlap.
- **Risk:** Footer gets taller on mobile; no functional risk.

#### F-019 — Every content hub has a one-word <title> (5-18 characters) and a 21-34 character meta description, on 22 indexable hub pages.

- **Category / brand / effort:** seo · residency, investorpass, frontier, residenciaes, residenciapt, flytta · S
- **Where:** http://localhost:3000/guides (title "Guides", 6 chars) ; /guides/taxes ("Taxes", 5) ; http://residenciaes.localhost:3000/guias ("Guias", 5) ; http://investorpass.localhost:3000/insights ("Insights", 8) ; http://frontier.localhost:3000/stories ("Stories", 7) ; http://flytta.localhost:3000/guider ("Guider", 6) ; /stader ("Städer", 6)
- **File:** `src/app/(en)/sites/residency/guides/page.tsx, guides/[hub]/page.tsx and the brand equivalents (es guias, pt guias, investorpass insights, frontier stories, flytta guider/stader)`
- **Evidence:** Metadata crawl: residency /guides 6, /guides/comparisons 11, /documents 9, /living-in-paraguay 18, /taxes 5; residenciaes /guias 5 … /vivir-en-paraguay 17; residenciapt /guias 5 … 17; investorpass /insights 8; frontier /stories 7; flytta /guider 6, /stader 6. Descriptions on the hub pages: 21-34 chars (e.g. residency /guides/taxes 21).
- **Fix:** Give each hub a descriptive title and 120-155 char description via siteMetadata (e.g. "Paraguay Residency Guides — Documents, Taxes & Living Costs"). Titles go through the brand locale.
- **Risk:** None; metadata only.

#### F-020 — Indexable pages on sibling English domains share identical titles, H1s and body paragraphs, which invites search engines to pick one and drop the others.

- **Category / brand / effort:** seo · residency, frontier, guide, investorpass · M
- **Where:** http://localhost:3000/route-finder vs http://frontier.localhost:3000/route-finder vs http://guide.localhost:3000/route-finder ; http://localhost:3000/pricing vs http://frontier.localhost:3000/pricing ; http://localhost:3000/guide vs http://frontier.localhost:3000/guide ; /process pages on residency, frontier, investorpass
- **File:** `src/lib/conversion-pages.tsx (route-finder metadata); src/app/(en)/sites/frontier/pricing/page.tsx; src/app/(en)/sites/frontier/guide/page.tsx; src/components/ProcessTimeline.tsx`
- **Evidence:** Identical <title> + H1 on /route-finder for residency, frontier and guide ("Route Finder — which Paraguay residency route fits you" / "Which route is right for you?"); frontier /pricing and residency /pricing share the H1 "A fixed service fee, with separate costs explained before you commit" and 7+ identical paragraphs; frontier /guide and residency /guide share title and description verbatim; ProcessTimeline step paragraphs appear verbatim on 16 pages across residency, frontier and investorpass. (Legal pages, confirm/unsubscribe and route-finder/result are also duplicated but are noindex or boilerplate — see not-fixed list.)
- **Fix:** Give each brand’s route-finder its own title/H1 in its voice (frontier: plan-B framing), rewrite frontier /pricing and /guide intros for the US/expat audience, and let ProcessTimeline take brand-specific step copy (or canonical frontier/residency duplicates to one brand if Anton prefers). Content work, no routing change.
- **Risk:** Low. Changing route-finder metadata touches conversion-pages.tsx, which is shared conversion machinery; keep the quiz untouched.

#### F-021 — Five of the seven brands are the same page with a different accent colour: identical split hero with a bordered aside card, "Who this is for" paragraph, three-card bento, "How it runs", tinted "Why Paraguay" band, FAQ and dual-form footer, in the same order and spacing.

- **Category / brand / effort:** design · residency, frontier, residenciaes, residenciapt, flytta · L
- **Where:** the five homepages
- **File:** `src/app/(en)/sites/residency/page.tsx, src/app/(en)/sites/frontier/page.tsx, src/app/(es)/sites/residenciaes/page.tsx, src/app/(pt)/sites/residenciapt/page.tsx, src/app/(sv)/sites/flytta/page.tsx`
- **Evidence:** shots/{residency,frontier,residenciaes,residenciapt,flytta}/home-desktop.png side by side: same section sequence and grid; only --accent (#1d6b4f, #1d6b52, #c1121f, #006b3c, #0b4f8a) and the header wordmark differ. Residency (#1d6b4f) and frontier (#1d6b52) accents differ by one hex step. Plan §1.8 promises "bespoke per brand". With the type scale broken (F-001) the display fonts do not show either, removing the one other differentiator.
- **Fix:** After F-001 lands, re-evaluate: give frontier a different accent family (not a green one hex away from the hub), and give each brand at least one signature section (flytta: Anton’s story first; residenciapt: cost-of-living/Brazil tax block first; frontier: plan-B comparison table). docs/design-prompts.md already holds redesign prompts for the EN brands.
- **Risk:** Design work across five brands; do it after the global fixes so reviews are against the real type scale.

#### F-022 — The bento grid’s first tile is a double-height feature slot, but every page fills it with one line of text, leaving a large empty white box; investorpass’s four routes leave "Tourism" orphaned alone on a second row.

- **Category / brand / effort:** design · residency, investorpass, guide, frontier, residenciaes, residenciapt, flytta · S
- **Where:** every homepage; http://guide.localhost:3000/ "What’s inside"
- **File:** `src/components/primitives.tsx (Bento)`
- **Evidence:** shots/residenciaes/home-desktop.png "Residencia temporal" card ~2x the height of its content; shots/guide/home-desktop.png "Chapter 1 Why Paraguay (and why not)" card is ~300px tall with two lines; shots/investorpass/home-desktop.png "Real estate" large empty card and "Tourism" alone on row 2; same on frontier and flytta.
- **Fix:** Either give the first tile real content (a short list, a stat, an image) or make Bento equal-height when items are text-only; for 4 items use a 2x2 grid.
- **Risk:** Shared component; check all brands after the change.

#### F-023 — Listing and process pages jump from the H1 straight to H3 card/step titles with no H2.

- **Category / brand / effort:** a11y · all · S
- **Where:** 25 listing pages, e.g. http://localhost:3000/guides, http://guide.localhost:3000/blog, http://frontier.localhost:3000/process, http://residenciaes.localhost:3000/proceso
- **File:** `src/components/Card.tsx (card titles hard-coded as h3); src/components/ProcessTimeline.tsx`
- **Evidence:** axe heading-order (moderate) on 25 pages, all 7 brands; heading outline: "h1->h3: Paraguay vs. Panama residency…" (residency /guides/comparisons), "h1->h3: 1. The call" (residency, frontier /process), "h1->h3: Do you still need a bank deposit…" (guide /blog).
- **Fix:** Let Card and ProcessTimeline take a heading level prop (default 3) and pass 2 where the list sits directly under the H1, or add a visually-hidden H2 for the list.
- **Risk:** Minimal; visual unchanged if styles key off classes not tags.

#### F-024 — Hedging is so dense that answers read as evasions: on the Investor Pass homepage the FAQ "Is the minimum investment fixed?" answers with a referral to another page, every route card says "the current minimum confirmed on your call", and every timeline step ends in a variant of "confirmed before you travel / on your call".

- **Category / brand / effort:** content · investorpass, residency, frontier · M
- **Where:** http://investorpass.localhost:3000/ ; http://localhost:3000/residency/temporary-residency
- **File:** `src/app/(en)/sites/investorpass/page.tsx ; src/components/ProcessTimeline.tsx`
- **Evidence:** shots/investorpass/home-desktop.png: the four route cards, "What the Investor Pass is", "Timeline" and two FAQ answers all defer to "your call"; ProcessTimeline "Timing:" lines on 16 pages are all deferrals. This is a consequence of unverified facts (correct per §1.10), but the surrounding copy repeats the deferral instead of saying it once.
- **Fix:** Say the hedge once per page, in one clearly labelled box ("Why we do not print thresholds yet"), and let the rest of the copy describe what the reader does and gets. No numbers added.
- **Risk:** Copy review needed so no sentence implies a figure the facts registry has not verified.

### Low (8)

#### F-025 — The English unsubscribe note says "one click, all three brands" — there are seven.

- **Category / brand / effort:** content · residency, investorpass, guide, frontier · S
- **Where:** http://localhost:3000/unsubscribe (and the three other EN brands)
- **File:** `src/i18n/messages/en/common.json:128`
- **Evidence:** Rendered on 4 EN /unsubscribe pages: "This removes the address from every list we run, not just Paraguay Frontier's — one click, all three brands." The es/pt/sv strings already say "todas las marcas" / "todas as marcas" / "alla varumärken".
- **Fix:** Change to "…one click, every brand." (en only).
- **Risk:** None.

#### F-026 — The production build warns that a dynamic path join makes Turbopack trace the whole project into the server output.

- **Category / brand / effort:** perf · all · S
- **Where:** n/a (build output)
- **File:** `src/lib/download-policy.ts:110`
- **Evidence:** npm run verify build log: "Warning: Dynamic filesystem access causes tracing of the whole project … leads to all source files (including the public folder) to be deployed as part of the server code", import traces via members/resources download route, api/download/[token] and CheckoutButton -> purchases.ts (so every service page pulls download-policy into its server graph).
- **Fix:** Scope the join (`path.join(privateRoot(), /*turbopackIgnore: true*/ normalize(fileKey))`) or move the resolve behind a function only the two download routes import, then confirm the warning is gone and that .next/standalone does not contain src/ or private/ unless intended.
- **Risk:** Download routes must still find private/ in the standalone deploy (see the O2 known issue on PRIVATE_DIR); re-test a download after the change.

#### F-027 — Running `npm run dev` rewrites the tracked next-env.d.ts (./.next/types -> ./.next/dev/types), and the repo-hygiene test fails on any untracked file, so `npm run verify` goes red after a dev session or while an audit folder like this one is uncommitted.

- **Category / brand / effort:** bug · all · S
- **Where:** n/a (developer workflow)
- **File:** `next-env.d.ts ; tests/repo-hygiene.test.ts:50`
- **Evidence:** After dev: `git diff next-env.d.ts` shows the two import lines switched to .next/dev/types. First verify run in this audit failed only in tests/repo-hygiene.test.ts ("has no unexpected untracked files") listing docs/audit/2026-09-21/*; with the folder moved aside verify passed (624 tests, i18n OK, build OK).
- **Fix:** Commit docs/audit output when it is accepted (or add docs/audit/ to the hygiene allow-list); add next-env.d.ts to .gitignore as Next recommends, or accept the churn.
- **Risk:** Ignoring next-env.d.ts means CI must generate it before typecheck (next build does).

#### F-028 — Next 16 logs that the middleware file convention is deprecated in favour of proxy.

- **Category / brand / effort:** bug · all · S
- **Where:** n/a (dev server log)
- **File:** `src/proxy.ts`
- **Evidence:** Dev server start: "⚠ The \"middleware\" file convention is deprecated. Please use \"proxy\" instead."
- **Fix:** Migrated to src/proxy.ts with the named proxy export; function body and config.matcher are unchanged. Proxy runs on Node.js; no explicit runtime setting existed to remove. File-location documentation now points to src/proxy.ts.
- **Risk:** Middleware is a protected boundary (host resolution, x-site sanitising, rate limit). Must go through Opus review with the spoof and resolve tests.

#### F-029 — A handful of in-body cross-brand links lack rel="noopener" while the footer versions carry it; conversely rel="noopener" is set on same-tab links where it has no effect.

- **Category / brand / effort:** seo · flytta, frontier, guide, investorpass · S
- **Where:** e.g. http://investorpass.localhost:3000/ -> https://paraguayresidency.co.uk ; http://guide.localhost:3000/ -> https://paraguayinvestorpass.com/contact
- **File:** `src/app/(en)/sites/investorpass/page.tsx ; src/app/(en)/sites/guide/page.tsx ; src/app/(en)/sites/frontier/page.tsx ; src/app/(sv)/sites/flytta/page.tsx`
- **Evidence:** Crawl: investorpass -> paraguayresidency.co.uk rel=null (5 links, 2 pages); guide -> paraguayinvestorpass.com/contact rel=null; frontier -> paraguayinvestorpass.com rel=null; flytta -> paraguayinvestorpass.com rel=null (bento card). All cross-brand links point at hosts in src/sites/registry.ts; no link points at an unowned domain.
- **Fix:** Route all sibling links through one helper (siteOrigin + a SiblingLink component) with a consistent rel policy; noopener only matters with target=_blank, so decide whether sibling links open in a new tab and apply rel accordingly.
- **Risk:** None.

#### F-030 — A horizontally scrollable region on frontier /process cannot be reached by keyboard.

- **Category / brand / effort:** a11y · frontier · S
- **Where:** http://frontier.localhost:3000/process
- **File:** `src/app/(en)/sites/frontier/process/page.tsx`
- **Evidence:** axe scrollable-region-focusable (serious), 1 node: `.mt-[var(--space-6)]` on frontier /process.
- **Fix:** Add tabIndex={0}, role="region" and an aria-label to the scroll container.
- **Risk:** None.

#### F-031 — Static sitemap entries use `lastModified: new Date()`, so every fetch claims every static page changed today.

- **Category / brand / effort:** seo · all · S
- **Where:** every /sitemap.xml
- **File:** `src/lib/seo-files.ts:170`
- **Evidence:** buildSitemap(): `const now = new Date(); … lastModified: now` for staticPaths.
- **Fix:** Omit lastModified for static paths, or set it from the page file’s git date at build time.
- **Risk:** None.

#### F-032 — The guide hero’s eyebrow repeats the H1 almost verbatim ("THE PARAGUAY RESIDENCY GUIDE WE WISH EXISTED." above "The Paraguay residency guide we wish existed before we did it ourselves."), and the price is not visible until the sixth screen.

- **Category / brand / effort:** design · guide · S
- **Where:** http://guide.localhost:3000/
- **File:** `src/app/(en)/sites/guide/page.tsx`
- **Evidence:** shots/guide/home-mobile-fold.png; probe: first price element ("$49, once" without DB) sits below the chapters grid.
- **Fix:** Use the eyebrow for audience or price ("$7 · PDF + 12 months of updates" once the price question in F-017 is settled) and keep the H1 as is.
- **Risk:** None.


## 4. Batches

Ordered so that nothing in batch N depends on batch N+1. Each is one PR.

**Batch 1 — Make the design system render (F-001, F-002, F-012).** Codemod
`text-[var(--text-X)]` → `text-(length:--text-X)` across `src/` (86 files, className strings only),
add `--space-5` / `--space-10` to `src/styles/tokens.css`, and add two tests: compiled CSS emits
`font-size` for the text tokens, and every `var(--*)` used in `src/` is defined. Then re-screenshot all
brands at 390/768/1440 and re-run axe. *Boundaries:* the codemod edits className strings in
`src/components/LeadFormFields.tsx`, `NewsletterFormFields.tsx`, `MagicLinkFormFields.tsx`,
`CheckoutButtonClient.tsx` and `src/features/quiz/*` — shared conversion machinery, the checkout button
(payments) and the quiz UI (quiz scoring lives there). **Call it out in the PR:** the change is
className-only, with no logic, props or server actions touched, and a reviewer should confirm that by
diff. No schema, auth, API route or middleware change.

**Batch 2 — Correctness bugs, no protected boundary (F-007, F-016, F-023, F-025, F-030, F-031).**
`Disclaimer.tsx` <p>→<div role="note">; new `src/app/global-not-found.tsx` that renders the brand shell
from `x-site` (read-only use of the header the middleware sets, middleware itself unchanged); heading
level prop on `Card.tsx`/`ProcessTimeline.tsx`; `en/common.json` unsubscribe string; frontier /process
scroll region; `seo-files.ts` lastModified. *Boundaries:* none crossed. global-not-found reads a header
that middleware owns; it must not change how that header is set.

**Batch 3 — Facts and copy integrity (F-003, F-004, F-005, F-024).** Replace the literal figures with
`<Fact>` or figure-free wording, rewrite the host sentences around facts so both `hedged` and `display`
read correctly, add es/pt/sv hedged strings and a market-neutral `en` for `costofliving.*` in
`content/shared/facts.ts`, extend `scripts/verify-i18n.ts` to fail on a `<Fact>` used on a brand whose
locale the fact lacks, and add a literal-pattern test. *Boundaries:* none of the protected ones, but
`facts.ts` is the legal register the launch review verifies. **Anton or his legal partner should
approve the wording**, and if any figure is actually verified, flip `verified: true` instead of
rewriting. Independent of batches 1–2, so it can run in parallel if needed.

**Batch 4 — Navigation, tap targets and discoverability (F-013, F-018, F-006, F-019, F-029).**
Mobile menu disclosure in `Nav.tsx`, 44px link targets in `Nav.tsx`/`Footer.tsx`, then add the hub links
(Guides / Insights / Stories / Guider / Städer) to the `nav`/`footer` fields in `src/sites/registry.ts`
with new i18n keys, give hub pages real titles/descriptions, and route sibling links through one helper.
Depends on batch 1 because the menu has to be reviewed at the real type scale. *Boundaries:*
`registry.ts` is also the host→brand map that middleware reads. **Only the `nav`/`footer` fields
change**, and `hosts`, `canonicalHost`, `locale`, `theme`, `crm` and `siblings` must stay untouched
(the existing registry tests guard this).

**Batch 5 — Conversion composition (F-008, F-009, F-014, F-022, F-011 layout, F-020 copy, F-032).**
Hero CTAs on the Investor Pass homepage, a mid-page CTA block plus a mobile sticky CTA on service and
pricing pages, a single-form closing section on the es/pt/flytta/frontier homepages and /contact,
equal-height Bento, the pricing page restructured into one shared "covers / never covers" section and a
per-route table (fees still via `<Fact>`), and brand-specific intros for the duplicated
route-finder/pricing/guide pages. Depends on batches 1 and 4 (sticky bar and CTA placement are judged
against the fixed type scale and the new header). *Boundaries:* `<LeadForm>` is placed and removed,
never edited. Route-finder metadata lives in `src/lib/conversion-pages.tsx` (shared conversion
machinery), so **metadata strings only**, and the quiz is not touched.

**Batch 6 — Protected-boundary items, Opus or supervised session only (F-017, F-015, F-026, F-028,
F-027).** Guide price fallback 4900→700 in `src/lib/purchases.ts` (**payments**); form micro-copy
and optional-field consolidation in `LeadFormFields.tsx` (**shared conversion machinery**; the lead
schema must keep accepting old field names); scoped path join in `src/lib/download-policy.ts`
(**paid-download path**: re-test a download from the standalone build); `middleware.ts` →
`proxy.ts` codemod (**middleware**: run the spoof/resolve tests); hygiene allow-list for
`docs/audit/`. Each item is independent; they share a batch only because each needs the same review
level.

**Owner-blocked, not a PR yet:** F-010 (real team/credential facts), F-011 numbers (verify
`pricing.*` facts), F-021 (per-brand redesign, L, after batches 1 and 5, using `docs/design-prompts.md`).

## 5. Not fixed, on purpose

- **Legal pages (/privacy, /terms) share near-identical paragraphs across the four EN brands**
  (Jaccard 0.82–0.88). This is boilerplate describing one operator, and differentiating it adds legal
  review cost for no ranking value.
- **/confirm, /unsubscribe, /route-finder/result, /thank-you, /login, /account, /members/*, /admin/*
  have short titles, duplicate titles or no inbound links.** All carry `noindex` (verified in the crawl)
  and are reached from emails, redirects or forms by design. Filesystem-only routes minus
  sitemap+crawl = exactly these plus /blocked and /dev/kitchen-sink, which are blocked in production.
- **/investor-pass on residency, /pase-inversor on residenciaes and /investor-pass on residenciapt are
  crawlable but not in the sitemap.** They are deliberate noindex bridges (`seo-files.ts` comment,
  plan §6.6), and the crawl confirmed `noindex, follow`.
- **flytta cost-of-living estimates (USD/m², rent, budgets) are written in prose, not via `<Fact>`.**
  This is already tracked (KNOWN-ISSUES S13 #2, a documented decision).
- **Guide "14-day refund" and "12 months of updates" are bare numbers.** These are the business's own
  commercial terms, not residency law or fees, so they are outside the §1.10 register.
- **Spanish "183 días" and Swedish 183-dagarsregeln are bare numbers.** They are foreign tax rules,
  hedged in prose toward an adviser, per the S13 convention that `<Fact>` carries Paraguay figures only.
- **Route Finder radio inputs are 13×13px.** Each sits inside a full-width clickable `<label>`, so the
  real target is large.
- **An unlabeled `website` input appears on 65 pages.** It is the honeypot (zero-height, off-screen),
  and labelling it would defeat it.
- **Raw fact keys are rendered as text on /dev/kitchen-sink.** It is a dev-only route, blocked in
  production (`resolve.ts`), and listing keys is its purpose. No raw i18n key rendered on any real page.
- **The guide's "Checkout opens shortly" button.** This is the expected no-Stripe-key path (KNOWN-ISSUES
  S5 / FREE_ACCESS_MODE), and it was not re-tested with keys.
- **No hreflang between brands.** This is a locked decision in plan §1.3 (brands are not translations of each
  other).
- **Sibling footers link only to the three EN funnel brands, and nothing links to frontier, residenciaes,
  residenciapt or flytta.** This follows the plan §1.2 funnel design, so changing it is a strategy
  decision for Anton, not a defect. It is flagged here because it also means those four brands get no
  link equity from the others.
- **Already tracked, not re-reported:** LeadForm hydration TBT (KNOWN-ISSUES S4/S10), the report-only
  CSP and Plausible allowance (O18), the per-IP limits and the webhook-route limit (O18), FREE_ACCESS_MODE
  (temporary), `output: standalone` vs `next start` (O2; the warning reproduced here), the admin
  `entry` grant expiry (O17), and the Lemon Squeezy/Stripe live-purchase gaps (O2/O9/S5).

## Appendix A — Hard-signal summary

| Signal | Result |
|---|---|
| HTTP status | 250 of 253 URLs returned 200. `/blocked` returned 404, which is intentional (it is the rewrite target and calls `notFound()`). www→apex 301 and unknown-host→hub 301 were checked on the production server. |
| Console errors/warnings | Dev: 48 errors from the flytta `<p>`-in-`<p>` hydration pair on 8 pages (F-007), plus the intentional /blocked 404. Production: 0 console messages; React #418 on the same 8 pages. No warnings anywhere else. |
| Uncaught exceptions | 8 pages (F-007) |
| Failed requests | None (besides the intentional `/blocked` 404) |
| Horizontal overflow | None at any viewport (note: measured with the type scale broken; re-check after F-001) |
| axe | color-contrast 720 nodes/197 pages (F-002); heading-order 25 pages (F-023); scrollable-region-focusable 1 (F-030); region/landmark/document-title only on /dev/kitchen-sink and /blocked |
| H1 count | Exactly one H1 on every real page (the kitchen sink has 14, which is dev-only) |
| Images | The site ships zero `<img>` elements (OG images are generated), so no alt issues |
| Unlabelled controls | Only the honeypot |
| Tap targets <44px at 390 | Header/footer/breadcrumb links on every page (F-018) |
| `<html lang>` | Matches the registry on every brand: en ×4, es, pt-BR, sv; og:locale en_US/es_ES/pt_BR/sv_SE |
| Canonical | Present and correct on every indexable page. Members pages redirect to /login and canonicalise there, which is correct. |
| JSON-LD | Every block parses (Organization, BreadcrumbList, Article, FAQPage, CollectionPage, Service, Product) |
| Cross-brand hosts | Every cross-brand link points at a host in `src/sites/registry.ts`. External links go to government sources only (gov.uk, travel.state.gov, migraciones.gov.py, …). |
| Tier gating | Every gate goes through `requireTier()` → `entitlementFor()`, so none reads `users.tier` directly. `users.tier` is read only for display in /admin/members and in the reconcile job, which is correct. |
| Perf (production, 390, localhost, unthrottled) | LCP p50 60ms / p90 108ms, CLS 0 on every page, transfer p50 306KB / p90 429KB, 39 requests p50, exactly 1 render-blocking request (the global CSS) on every page. Absolute LCP is not field-representative; use for relative comparison only. |

## Appendix B — Step 3 page set and 390px fold notes

Reviewed from the captured screenshots plus a computed-style probe (`evidence/probe.json`).

| Brand | Pages | Above the fold at 390 |
|---|---|---|
| residency | /, /residency/temporary-residency, /pricing, /book | Header takes 133px and the letter-spaced eyebrow is visually louder than the 17px H1, so the H1 reads as a caption. Value proposition and both CTAs are visible (the primary is illegible, F-002). The audience ("who this is for") is only on screen 2. |
| investorpass | /, /investor-pass/requirements, /investor-pass/investment-routes, /contact | No CTA in the fold (F-008). The hero ends in an empty dark band. |
| guide | /, /blog, /about, /insider | The eyebrow repeats the H1. Both CTAs are visible, but there is no price until screen 6, which is the one fact a $7 impulse buyer needs. |
| frontier | /, /routes, /why-paraguay, /pricing | CTAs are visible, but the audience (Americans/expats) is named only in the `<title>`, not on the page. /routes and /why-paraguay have no CTA at all (F-009). |
| residenciaes | /, /residencia/temporal, /precios, /contact | CTAs are visible, but nothing in the fold tells a Spaniard it is for them except the euro mention in the aside card. |
| residenciapt | /, /residencia/temporaria, /precos, /contact | The header is 169px, with four rows of nav (F-013). "para brasileiros" is stated. The secondary CTA wraps below the primary. |
| flytta | /, /uppehallstillstand, /priser, /kostnader | The personal-story angle ("Vi flyttade till Paraguay") is in the fold. The stats row renders "≈ 40 %", "7 dagar" and "0" in the same 17px as their labels, so it reads as a broken table. |

## Appendix C — Method and deviations

- **Environment.** Windows 11, Node **24.19** (the brief says Node 22; `engines` is `>=22`), a temporary detached worktree (removed after the audit) at
  `C:\Claude 1\paraguayresidency-audit` so your local branch checkout was not touched. `npm ci` completed.
  **`cp .env.example .env` was blocked by a local permission rule**, so the app ran with no `.env` at all,
  which is equivalent to the brief's "leave every value empty".
- **axe-core.** Instead of `npm i -D @axe-core/playwright` (which would modify `package.json`), axe-core
  was installed in a scratch folder and injected with `page.addScriptTag`. The rules run were wcag2a/aa,
  wcag21a/aa, wcag22aa and best-practice.
- **Enumeration** (`urls.json`, `enumeration-detail.json`): 215 sitemap URLs + BFS crawl (same host, depth 4)
  + filesystem routes → 253 unique. The dev server listed its routes under `/sites/<key>/…`, which were
  mapped back to public paths.
- **Screenshots** (`shots/<brand>/<route>-<viewport>.png`, plus `-mobile-fold.png` for the first
  390×844 screen) were taken from the **dev** server, so the round "N" badge bottom-left is the Next.js
  dev indicator, not the site.
- **Unconfirmed / not tested:** live checkout, Stripe/Lemon Squeezy, lead submission (no DB), and
  Lighthouse scores (not re-run; KNOWN-ISSUES S4/S10 cover them). Overflow at 390 must be re-checked
  after F-001, because larger headings are the most likely new overflow source.
- **Date.** The folder is dated 2026-09-21, the day the audit started. The crawl finished after midnight.

# Design overhaul 2026-10: trust first, no pink, distinct brands

Branch `design/overhaul-2026-10`, one PR, **not merged** (a merge to `main` deploys to production;
Anton reviews first). Brief: `prompts/local-design-audit.md` plus Anton's additions of 2026-09-28:
generate images with Higgsfield (GPT Image 2.5 Sunburst, medium/high), think about video, improve the
site overall, do SEO properly, add pages, and give the Spanish and Portuguese brands the most love.

Goal: **sell more Paraguay residencies than anyone in the niche, in every language market.**

## 0. Who runs what

| Workstream | Runs on | Where | Output |
|---|---|---|---|
| W1 Audit, live + local, all 7 brands (Playwright, axe, Lighthouse) | Opus subagent | main tree, read-only on `src/` | `scripts/audit/`, `docs/audit/2026-10/site-audit.md` |
| W2 Competitor benchmark + SEO gap per market | Opus subagent | `docs/audit/2026-10/` only | `competitors.md`, `seo-gap.md` |
| W3 Images (Higgsfield → webimg → manifest) | director session | main tree | `public/images/arrival/`, `docs/imagery-manifest.json` |
| W4 Design system + shared components (foundation) | Opus builder | worktree | tokens, themes, `proof.ts`, components, contrast script |
| W5 Homepage + template recomposition, one per brand | Opus builders ×4 (hub+guide, investorpass+frontier, es+pt, sv) | worktrees, after W4 merges | per-brand pages |
| W6 SEO content: new pages per market, ES and PT first | Opus writers | worktrees, after W2 | MDX in `content/<brand>/` |
| W7 Review, verify, screenshots, PR | director session | branch | PR with before/after for all 7 |

No Fable anywhere (`.claude/skills/fable-cost-guardrail/SKILL.md`). Hard rules from `CLAUDE.md` apply to
every builder: no changes to `src/db/schema.ts`, auth, API routes, `src/proxy.ts`, payments/checkout or
quiz scoring (if a design needs one, write it up as an ask for Anton); every legal/financial number
through `<Fact k>`; every string through i18n with `npm run verify:i18n` green; **no invented
testimonials, ratings, case counts, press logos or credentials**; Lighthouse mobile ≥ 0.90; axe clean.

## 1. Art direction

The live site reads "pinkish, cheap, template". Three causes: peach/terracotta tints (`--accent-soft`
`#fbe7dc` on guide, `#f3e2d6` on frontier), syrupy golden-hour photos with pink lapacho, and seven brands
built from one hero + glass card + four bento tiles.

The new direction: **premium, calm and specific.** Ink, paper and one metal (brass/gold) on the English
brands, and a local colour per language brand. Photography is cooler, true-to-life daylight, documentary,
with the subject off-centre so type can breathe. Proof (real people, a fixed price, the process) sits at or
just below the fold. No pink, peach or rose tint on any brand, in CSS or in a photo.

### 1.1 Palettes (exact tokens; W4 checks every text/background pair for WCAG AA with a script)

| Brand | bg | surface-alt | fg | accent (buttons, links) | second colour (decorative) | Display face (kept, perf-tested) |
|---|---|---|---|---|---|---|
| residency (hub) | `#f6f4ef` paper | `#ebe7de` | `#101b2a` ink navy | `#12304f` navy | brass `#8c6a22` text-safe / `#c8a24a` on dark | Newsreader 500 |
| investorpass | `#0b0d10` | `#1a1f26` | `#efe9dc` ivory | `#c9a54a` gold (dark text on it) | hairline `#2a3038` | Instrument Serif 400 |
| guide | `#faf8f3` paper white | `#f0ede4` | `#15181b` ink | `#1f4a36` deep forest | brass `#8a6a22` / `#b8923f` | Fraunces 500 |
| frontier | `#f4f1ea` newsprint | `#e8e3d7` sand | `#1b1a17` | `#9a3412` red earth | charcoal rules, mono labels | Inter Tight 600 |
| residenciaes | `#fbfaf6` whitewash | `#eef2ef` | `#16201f` | `#0e5563` deep teal | olive `#5d6b2f` | Fraunces 500 |
| residenciapt | `#f6f8f3` | `#e7efe4` | `#0f2118` | `#0b6b3a` green | ipê yellow `#e0b12f` (dark text only) | Bricolage 600 |
| flytta | `#f7f8f7` | `#eaeef0` | `#121a22` | `#1d4e89` lake blue | birch `#d9c7a3` | Inter Tight 600 |

`--accent-soft` is always a cool or neutral tint of the accent, never warm. WhatsApp actions use one shared
`--wa: #0b7a43` with white text on every brand, so the primary action looks the same everywhere.

### 1.2 Tokens

- **Fluid type scale** `--step--1 … --step-6` (clamp, 360→1440 px), with the old `--text-*` names kept as
  aliases so no component breaks.
- **Spacing**: the existing scale plus `--space-section: clamp(4rem, 3rem + 5vw, 8rem)` and
  `--space-gutter: clamp(1.25rem, 0.9rem + 1.5vw, 2rem)`.
- **Elevation** `--elev-0 … --elev-3` (hairline border, soft, raised, overlay).
- **Motion** `--dur-1 120ms`, `--dur-2 200ms`, `--dur-3 320ms`, `--dur-4 560ms`, `--ease-out`,
  `--ease-in-out`. Everything is 0 under `prefers-reduced-motion`.

## 2. Components (W4, in `src/components/`)

Every proof component reads `content/shared/proof.ts` and **renders nothing when its data is empty**.
The file ships with every field `null`/`[]` so the site never shows a fake value.

- `TrustBar`: team faces (real photos only), "N residencies filed", Google rating with a link, years, each
  item independent.
- `Testimonials`: quote, first name + initial, country flag, route, month, source; data-driven.
- `PriceTable`: one row per route, with fee and government costs from `<Fact>` (hedged until Anton verifies
  `pricing.*`), and what's included / not included.
- `AfterYouMessage`: a timeline of what happens in the first hour, day, week and month after you message us.
- `Guarantee`: renders only from `proof.guarantee` (the service guarantee is Anton's decision); the
  guide's 14-day refund is already approved copy (plan §11.3).
- `TeamSection`: photo slots, name, role, languages. It falls back to the current typographic initials
  treatment and never uses stock faces.
- `OfficeStrip`: real office/Asunción photos from `proof.office.photos`; hidden when empty.
- `MobileWhatsAppBar`: sticky bottom bar on phones, with pre-typed text in the brand's language and a
  Plausible event.
- `ArticleCards` v2: image-led, with an image per hub/category (never an empty grey box).
- Guide sales-page parts: `BookMockup` (CSS 3D book using the generated cover art, with real HTML text on
  it), `TocPreview`, `SamplePages`, `ForWhom` (for / not for), guide FAQ, and a `ServiceUpsell` band.

## 3. Layouts per brand (W5): no two alike

- **Hub `paraguayresidency.co.uk`: authority.** Split hero on paper (H1 left, the colonnade photo right,
  cropped tall), a trust bar directly under it, the route price table, "what happens after you message
  us", team, guarantee, UK-specific block (ACRO, FCDO apostille, HMRC), FAQ and guides.
- **Investor Pass: dark editorial.** Full-bleed blue-hour photo, big serif type, gold hairlines, the four
  routes as a numbered index (I–IV) with photos, "private consultation" CTA, and the investment facts as a
  spec sheet.
- **Frontier: plain-talk story.** A newsprint single column with a narrow sidebar, "The catch" call-outs,
  Q&A blocks, red-earth pull quotes, and a US/CA/AU document path.
- **residenciaes: local voice, Spain + LatAm.** Plaza/café hero and a "¿De dónde eres?" nationality picker
  leading to per-country pages (España, Argentina, Colombia, México, Venezuela, Chile, Perú, Uruguay),
  with prices in euros and the Mercosur route up front.
- **residenciapt: a life-first magazine.** "Vida no Paraguai": a magazine-style home that leads with life
  (custo de vida numbers, fronteira, negócios, escola, saúde) and turns every section into the residency
  CTA. Prices in reais, with Mercosul up front.
- **flytta: Anton's letter.** A first-person, journal-style home ("Vi flyttade…") with a "Vår resa" timeline,
  the moving-boxes hero, prices in kronor, and Skatteverket → cédula steps.
- **Guide: long-form sales letter.** Book mockup above the fold, the offer, table of contents, sample
  pages, who it's for and not for, FAQ, a 14-day refund, and the "Want it done for you?" upsell.

The contact, pricing, about and article templates are redone per brand in the same pass. Every article
gets a hero image, a byline with a reviewer, the summary box, a sticky "Ask us on WhatsApp" rail on
desktop, and a route CTA at the end.

## 4. SEO and new pages (W6)

Ranked by W2's `seo-gap.md`. Targets: **~25 new pages on residenciapt, ~20 on residenciaes**, ~10 on the
hub, ~8 on frontier, ~5 each on flytta and investorpass. Priorities:

- **Programmatic nationality pages** (ES: por país; PT: brasileiros by state or city of origin where it's
  real; hub: UK/IE/AU/CA/ZA/DE/NL).
- **City pages** (Asunción, Ciudad del Este, Encarnación, Pedro Juan Caballero, Hernandarias, San
  Bernardino…), with cost-of-living figures in prose as hedged 2026 estimates, as flytta does.
- **Money pages** per route with a price table and FAQ + `Service`/`Offer` JSON-LD, and
  `Organization`/`ProfessionalService` on each homepage (Google rating only once it's real).
- **Technical**: whatever W1 finds (titles, descriptions, canonicals, orphan pages, schema,
  image sitemap entries for the new images).
- Brands stay non-translations (plan §1.3): no hreflang between them unless W2 makes a concrete case.

## 5. Images (W3): generated now, per Anton 2026-09-28

GPT Image 2.5 Sunburst. Heroes use high/2k (2.75 credits each), tiles and chapters medium/1k (0.5 each).
The job ledger is `docs/design/image-jobs-2026-10.json`; converted files and alt text in four languages go
in `docs/imagery-manifest.json`. Every brand gets a **unique hero + 4 tiles**, the guide gets cover art
and 11 chapter images, and every article hub gets a category image. Real photos Anton must shoot himself
(team portraits, the office, the migraciones queue, a cédula in hand) are never generated. They are
listed in `docs/design/image-shotlist-2026-10.md`.

### 5.1 Video ideas (not generated yet; each needs Anton's go)

1. **Hero loops (6–8 s, muted, desktop only, poster = the hero still)**: the colonnade walk (hub),
   blue-hour traffic on the avenue (investorpass), dust drifting on the red-earth road (frontier). They load
   after LCP so Lighthouse holds.
2. **"What happens after you message us" in 30 seconds**: a vertical explainer with the real team voice for
   Reels/TikTok/WhatsApp Status, one per language.
3. **Anton to camera** (real, not generated): "Why we moved to Paraguay", 60 s, for flytta and the hub about
   page. This is the single strongest trust asset missing.
4. **Cédula day** (real): a client, with written permission, picking up the cédula. This is proof no
   competitor can fake.

## 6. Conversion plumbing (from W1; fixed or written up as asks)

WhatsApp number + pre-typed text per brand, lead form success, the guide buy button (still "Checkout
opens shortly" until Stripe live keys: Anton), route finder next step, Plausible events. Anything that
touches API routes, checkout or scoring becomes an ask in the PR, not a change.

## 7. What only Anton can supply

Team photos, real reviews or a Google Business Profile link, the residencies-filed count, years in
business, fixed prices per route (`pricing.*` facts), the service guarantee wording (if any), Stripe live
keys, the WhatsApp number per brand, office address and photos, lawyer/escribano credentials he may
publish, and permission to use any client story.

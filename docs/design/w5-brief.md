# W5 brief: per-brand recomposition (read with overhaul-2026-10-plan.md)

You are one of four W5 builders. Each builder owns two brands (or shared templates) and works in its own
git worktree. **First command in your worktree: `git merge --ff-only design/overhaul-2026-10`** (worktrees start
on an old `main`). Commit on your worktree branch in logical steps. Do not push, open a PR or switch branches.
The director merges.

## Read first

`CLAUDE.md` (hard rules), `docs/design/overhaul-2026-10-plan.md` §1–§3, `docs/audit/2026-10/site-audit.md`
(P0/P1 list + "Design observations"), `docs/audit/2026-10/competitors.md` §6–§7 (what they have that we don't,
where we beat them), `docs/audit/2026-10/seo-gap.md` §0b (on-page fixes), `docs/log/design-uplift.md`, and the
dev showcase `src/app/(en)/dev/components` plus `docs/audit/2026-10/w4-components/*.jpg` (what the W4 components
look like on every theme).

## Hard rules (non-negotiable)

- Don't touch `src/db/schema.ts`, auth, API routes, `src/proxy.ts`, payments/checkout (`CheckoutButton*`, the
  checkout route) or quiz scoring. If a design needs one, write the ask into your final report.
- No legal or financial number in JSX/MDX: `<Fact k>` only. Our service prices are the `pricing.*` facts (hedged).
- **Never invent** testimonials, reviews, ratings, case counts, years, press logos, credentials, a guarantee,
  or a reply-time promise beyond the existing copy. Proof comes only from `content/shared/proof.ts` (empty
  today), so the proof components render nothing and your layouts must still look complete without them.
- Copy: brand pages keep their copy inline in the brand's own page files, in the brand's language, as the
  existing brand pages do. Shared components get strings from `common.json`, which must stay identical in key
  set across `en/es/pt/sv`. **Avoid new `common.json` or brand-JSON keys unless a shared component needs one.**
  If you must add keys, put them under a new top-level object named for your builder (`w5a`, `w5b`, `w5c`,
  `w5d`) so the merge is mechanical. `npm run verify:i18n` must pass.
- Voice: plan §11 per brand. Plain, specific, no "unlock", "seamless", "world-class". No "tax-free" / "imposto
  zero" / "noll skatt". Say what takes time.
- Performance: Lighthouse mobile ≥ 0.90 is the target (base is 0.80–0.82 on this machine; the LCP is the hero
  photo). Use the new heroes, which have AVIF + WebP at 1200/2400 and are far lighter than the old ones. Keep
  pages server components, and add no new client JS beyond what's already there. One H1 per page.
- Accessibility: axe clean. Visible focus, 44 px targets, alt text from the manifest (`arrivalImage(id, locale)`).

## Components (W4, all exported from `@/components`)

`PhotoHero {image, eyebrow?, title, sub, actions, trust?, locale, focus?, layout: 'overlay'|'split'|'editorial-dark', video?: {id, loop?}}`
· `TrustBar {site}` · `Testimonials {site, limit?, tone?}` · `PriceTable {site, routes?, title?, intro?, tone?, id?}`
· `AfterYouMessage {site, tone?}` · `Guarantee {site, tone?}` · `TeamSection {site, tone?}` · `OfficeStrip {site, tone?}`
· `MobileWhatsAppBar {site}` (already mounted in the shell) · `ArticleCards {site, title, articles:{title, href,
description?, eyebrow?, image?, hub?}[], more?, tone?}` · `IntentTiles` · `Steps` · `Reasons` · `LeadPanel` ·
`Faq` · guide: `BookMockup`, `TocPreview`, `SamplePages`, `ForWhom`, `ServiceUpsell` · `SectionKit` helpers.
Read each file before use; don't fork a component. If a component needs a new variant, add it compatibly.

## Media (in `public/images/arrival/`, rows in `docs/imagery-manifest.json` with `"set": "overhaul-2026-10"`)

Use **only your brand's own** hero and tiles; no brand shares a photo any more.

- residency: hero `residency-hero-asuncion-colonnade`; tiles `residency-tile-route-finder-map`, `-temporary-documents`, `-permanent-colonial-door`, `-investor-tower`
- investorpass: hero `investorpass-hero-business-district-blue-hour`; tiles `investorpass-tile-residential-lobby-dusk` (real estate), `-agro-silos-blue-hour` (productive), `-private-meeting-room` (financial), `-river-lodge-dusk` (tourism)
- guide: hero `guide-hero-reading-desk-asuncion`; cover `guide-cover-art-river-topography`; tiles `guide-tile-red-earth-paths-palm`, `-apostille-checklist-desk`, `-calculator-cocido-notebook`, `-terere-street-cafe`; chapters `guide-chapter-*` (11)
- frontier: hero `frontier-hero-red-earth-ranch-gate`; tiles `frontier-tile-airport-bench-bag`, `-fence-pasture-cattle`, `-small-town-veranda-street`, `-laptop-veranda-terere`
- residenciaes: hero `residenciaes-hero-cafe-arcade-plaza`; tiles `residenciaes-tile-esquina-centro-historico`, `-pasaporte-apostilla`, `-llaves-puerta-colonial`, `-terminal-omnibus-viajeros`
- residenciapt: hero `residenciapt-hero-family-veranda-terere`; tiles `residenciapt-tile-bifurcacao-estrada-terra`, `-ponte-rio-fronteira`, `-documentos-terere-mesa`, `-feira-ciudad-del-este`
- flytta: hero `flytta-hero-veranda-moving-boxes`; tiles `flytta-tile-kompass-anteckningsbok`, `-pass-dokumentmapp`, `-matkasse-marknad-asuncion`, `-par-veranda-skymning`
- Hub/category images `<brand>-hub-*` are for ArticleCards and hub index pages (W5-D wires `src/lib/hub-images.ts`).
- **Hero video**: pass `video={{ id: '<the brand hero id>' }}` to `PhotoHero` on each brand homepage; the hub uses
  `video={{ id: 'residency-hero-asuncion-colonnade', loop: false }}`. Files in `public/videos/`; see
  `docs/design/video-2026-10.md`. It never loads on phones.

## What every builder delivers for its brands

1. **Homepage recomposition** in the layout the plan assigns (§3). Distinct from every other brand: different
   section order, hero layout, rhythm and type scale use. Above or right after the fold: the promise, the
   primary WhatsApp action (the guide's is buying), and proof (the fixed-fee PriceTable, "what happens after
   you message us", the team). One clear action per screen.
2. **Pricing, about and contact pages** for your brands rebuilt with the new components (PriceTable, TeamSection,
   Guarantee, AfterYouMessage, TrustBar, OfficeStrip). Contact is WhatsApp first, with the lead form second.
3. **Internal links to the new SEO pages** your brand received in W6 (see `git log --merges` and `content/<brand>/`):
   homepage article blocks, the nationality selector (`/guias/por-pais` on ES), the city pages (PT `cidades`), the
   UK pages on the hub, and so on.
4. **Screenshots** at 1440 and 390, before (from `docs/audit/2026-10/shots/` where they exist) and after, for home,
   pricing, about and contact, into `docs/audit/2026-10/after/<brand>-<page>-<width>.jpg` (JPEG q70, full page).
   Look at them critically and iterate until the page would beat the best competitor side by side.
5. `npm run verify` green, and Lighthouse mobile on your homepages from a production build (`npm run build && npm
   start -- -p <your port>`, with the brand selected by `?site=`). Report the numbers.

Final reply, 25 lines at most: branch, commits, pages changed, Lighthouse numbers, anything left as an ask for Anton.

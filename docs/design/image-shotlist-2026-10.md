# Image shot list: design overhaul 2026-10

Anton asked on 2026-09-28 for the images to be generated in this session (GPT Image 2.5 Sunburst, medium/high).
The generated set is recorded in `docs/imagery-manifest.json` (rows with `"set": "overhaul-2026-10"`: files,
`alt_en/es/pt/sv`, ratio, px, model, job id) and the job ledger with rejects is in
`docs/design/image-jobs-2026-10.json`. This file is the human-readable index plus the slots that are **not**
generated: the real photos only Anton can take, and the next batches.

Rules applied to every prompt: Paraguay is landlocked and flat (no sea, beach, mountains or hills on the
horizon); red earth, mango, palms, yellow lapacho, jacaranda, Spanish-colonial and modernist Asunción; no
text, letters, signage, logos, flags or watermarks; **no pink**, including pink lapacho; no generated face
presented as staff, a client or a reviewer; no generated cédula, certificate or office presented as ours.

## 1. Generated: heroes (16:9, high, 2k, 2.75 credits each)

| id | brand | page | mood |
|---|---|---|---|
| `residency-hero-asuncion-colonnade` | hub | home | authority: a colonial colonnade, a navy blazer, a document folder |
| `investorpass-hero-business-district-blue-hour` | investorpass | home | dark editorial: towers and the avenue at blue hour |
| `guide-hero-reading-desk-asuncion` | guide | home/sales letter | studious: an oak desk, a blank open book, tereré |
| `frontier-hero-red-earth-ranch-gate` | frontier | home | plain talk: a red-earth road, a pickup, a gate, Chaco palms |
| `residenciaes-hero-cafe-arcade-plaza` | residenciaes | home | sociable: café under a colonial arcade, teal shutters |
| `residenciapt-hero-family-veranda-terere` | residenciapt | home | life first: a family, a veranda, tereré, red-earth garden |
| `flytta-hero-veranda-moving-boxes` | flytta | home | the move: moving boxes, a birch chair, a yellow lapacho |
| `guide-cover-art-river-topography` (2:3) | guide | BookMockup cover | gold and forest line drawing of a river over flat land |

## 2. Generated: tiles (4:5, medium, 1k, 0.5 each), four per brand, no photo shared

- **residency**: `route-finder-map`, `temporary-documents`, `permanent-colonial-door`, `investor-tower`
- **investorpass**: `residential-lobby-dusk` (real estate), `agro-silos-blue-hour` (productive business),
  `private-meeting-room` (financial instruments), `river-lodge-dusk` (tourism)
- **guide**: `red-earth-paths-palm`, `apostille-checklist-desk`, `calculator-cocido-notebook`, `terere-street-cafe`
- **frontier**: `airport-bench-bag`, `fence-pasture-cattle`, `small-town-veranda-street`, `laptop-veranda-terere`
- **residenciaes**: `esquina-centro-historico`, `pasaporte-apostilla`, `llaves-puerta-colonial`, `terminal-omnibus-viajeros`
- **residenciapt**: `bifurcacao-estrada-terra`, `ponte-rio-fronteira`, `documentos-terere-mesa`, `feira-ciudad-del-este`
- **flytta**: `kompass-anteckningsbok`, `pass-dokumentmapp`, `matkasse-marknad-asuncion`, `par-veranda-skymning`

(Each id is `<brand>-tile-<name>`.)

## 3. Generated: guide chapter images (16:9, medium, 1k): the `{/* IMAGE: … */}` slots

| chapter file | id | note |
|---|---|---|
| after-approval/banking | `guide-chapter-bank-account-signing` | |
| after-approval/cedula-and-ruc | `guide-chapter-cedula-wallet` | a card face down in a wallet; **the real "cédula in hand" is Anton's shot (§6)** |
| after-approval/family | `guide-chapter-family-leafy-street` | |
| after-approval/taxes-for-residents | `guide-chapter-accountant-tax-review` | |
| costs-and-timeline/real-costs | `guide-chapter-budget-worksheet-costs` | |
| costs-and-timeline/timeline-week-by-week | `guide-chapter-planner-document-folders` | a planner instead of the migraciones queue, which is Anton's shot |
| getting-started/documents-by-nationality | `guide-chapter-documents-name-check` | |
| getting-started/why-paraguay-and-why-not | `guide-chapter-costanera-skyline` | |
| next-steps/checklists | `guide-chapter-checklist-binder` | |
| next-steps/investor-pass-overview | `guide-chapter-business-district-avenue` | |
| next-steps/mistakes-we-see-monthly | `guide-chapter-calendar-circled-dates` | |

## 4. Generated: article-hub category images (3:2, medium, 1k), used by ArticleCards v2 and article heroes

residency: `hub-comparisons-park-paths`, `hub-documents-apostille-desk`, `hub-living-costanera-morning`,
`hub-taxes-desk-lamp` · investorpass: `hub-insights-terrace-night` · guide: `hub-blog-reader-plaza`,
`hub-updates-asuncion-rooftops-morning` · frontier: `hub-stories-couple-red-earth-road` · residenciaes:
`hub-comparativas-cafe-terere`, `hub-documentos-escribania-sello`, `hub-impuestos-oficina-casa`,
`hub-vivir-calle-barrio` · residenciapt: `hub-comparativos-chimarrao-terere`, `hub-documentos-pasta-apostila`,
`hub-impostos-escritorio-ciudad-del-este`, `hub-morar-rua-ipe-amarelo` · flytta: `hub-guider-anteckningar-veranda`,
`hub-stader-asuncion-flygbild`.

## 5. OG images

One per brand, cropped from the brand's hero to 1200×630 by the OG route (no extra generation, so the social
card always matches the page). Per-article OG uses the article's hub image.

## 6. Real photos only Anton can supply (never generated)

These are the trust assets no competitor can fake. Each has a slot in `content/shared/proof.ts`; the
component stays hidden until the file exists.

| shot | where it goes | how |
|---|---|---|
| Team portraits: Anton, Yanina, Diana | TeamSection, TrustBar, article bylines | window light, plain wall, shoulders up, same framing for all three; landscape 3:2 and square crops |
| The office (outside with the street, inside at a desk) | OfficeStrip, contact pages, Google Business Profile | daytime, door and sign visible, one wide + one detail |
| The team at work with a client (with permission) | hub about, homepages | hands and documents in focus, faces optional |
| The migraciones queue / building (outside) | process pages, guide timeline chapter | early morning, no identifiable faces |
| A cédula in hand (a client's, with written permission, number covered) | cédula pages, guide chapter 6 | thumb over the number and photo |
| Anton to camera, 60 s: "Why we moved to Paraguay" | flytta home, hub about | phone on a tripod, window light, lapel mic |
| Client video testimonials (with permission) | Testimonials (source: video) | 30–60 s, "what we were worried about → what happened" |
| Screenshot of the Google Business Profile rating | TrustBar (only with the live profile URL) | from the real profile |

## 7. Next batches (planned, not yet generated)

- **Per-article images** for all ~160 existing articles and every new SEO page (W6): 3:2, medium, 1k, 0.5 each.
  Prompt = the article's subject in the brand's style tail. Estimated ~240 images ≈ 120 credits.
- **Nationality and city pages**: one image per new city page (Asunción, Ciudad del Este, Encarnación, Luque,
  San Bernardino, Villarrica, Pedro Juan Caballero, Hernandarias), shared across brands only when the
  locale differs. ≈ 8 × 0.5.
- **Video (needs Anton's go)**: 6–8 s muted hero loops for the hub, investorpass and frontier (image-to-video
  from the accepted heroes, desktop only, poster = still, loaded after LCP).

## 8. Cost

First set: 7 heroes + cover at high 2k (8 × 2.75 = 22) and 61 medium 1k jobs, which are 57 accepted plus
4 rejects (61 × 0.5 = 30.5), so **52.5 credits**, checked against the Higgsfield ledger at the end of the session
(see `_notes` in the manifest). Balance before: 4,366 credits.

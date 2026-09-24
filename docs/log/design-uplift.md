# Design uplift — 2026-09-24 (interactive session, Anton's request)

"The design looks a bit semi done." What changed:

- **Typography**: one self-hosted display face per brand, a single static
  weight, Latin subset, about 20 KB (`public/fonts`, `src/styles/fonts.css`):
  residency Newsreader 500, investorpass Instrument Serif 400, guide and
  residenciaes Fraunces 500, frontier and flytta Inter Tight 600, residenciapt
  Bricolage Grotesque 600. Body text is the system stack. Each brand layout
  preloads only its own file (`src/lib/fonts.ts`; not from SiteShell, because
  the root not-found renders a hub shell inside every page). Measured with the
  Lighthouse gate: variable files plus an Inter body font dropped mobile
  performance below 0.90, because every font byte fetched before the hero
  photo paints counts against LCP. `next/font` was tried and rejected: its
  preloads are app-wide, so every brand fetched all six files.
- **Hero v2**: taller, larger type, an entrance animation (motion-safe), and a
  glass trust card with the team initials and three reassurance lines
  (`heroTrust(site)`).
- **Tiles v2**: an editorial bento on desktop (a feature tile two rows tall),
  numbered, with a round arrow button; still a swipe row on mobile.
- **Header**: sticky, translucent, one CTA button per brand (`SiteConfig.cta`
  in the registry, label `home.ctaPrimary`).
- **Arrival homepages for es / pt / sv** (they were still text-in-boxes), plus
  the hub: `PhotoHero` with a proof line, `IntentTiles`, new `Steps`,
  `Reasons` (facts still through `<Fact>`), `TeamStrip` (now i18n),
  `ArticleCards`, and `LeadPanel` (pitch left, form card right, WhatsApp behind
  the disclosure). Every fact key the old pages rendered is still rendered.
- **Localised alt text**: `alt_es`, `alt_pt`, `alt_sv` in
  `docs/imagery-manifest.json`; `arrivalImage(id, locale)` throws on a missing one.
- **No pink anywhere**: the residenciaes accent moved from red to Mediterranean
  teal `#0e5563`. Team avatars and the "why Paraguay" cards no longer use tinted
  circles. The base rule applying display weight and tracking now matches
  the class token exactly, where before it also hit prose wrappers.
- **flytta**: the broken `StatRow` on the homepage is gone.
- **frontier hero 1200w re-encoded** (WebP q58 from the 2400 source, 128 KB →
  94 KB, no visible difference at 100%): it is the LCP image on frontier and
  residenciapt, and the heaviest hero by far. Locally frontier now matches
  `main` (0.90, LCP 3.6 s vs 3.7 s); CI had it at 0.88.

Open: see KNOWN-ISSUES "hero photos are shared across brands".

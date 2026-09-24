# Design uplift — 2026-09-24 (interactive session, Anton's request)

"The design looks a bit semi done." What changed:

- **Typography**: self-hosted variable fonts from `@fontsource*` packages (no
  build-time network). Per brand: residency Newsreader, investorpass Instrument
  Serif, guide and residenciaes Fraunces, frontier and flytta Inter Tight,
  residenciapt Bricolage Grotesque; Inter body everywhere. Weight and tracking
  are theme tokens (`--display-weight`, `--display-tracking`).
- **Header**: sticky, translucent, one CTA button per brand (`SiteConfig.cta`
  in the registry, label `home.ctaPrimary`).
- **Arrival homepages for es / pt / sv** (they were still text-in-boxes), plus
  the hub: `PhotoHero` with a proof line, `IntentTiles`, new `Steps`,
  `Reasons` (facts still through `<Fact>`), `TeamStrip` (now i18n),
  `ArticleCards`, and `LeadPanel` (pitch left, form card right, WhatsApp behind
  the disclosure). Every fact key the old pages rendered is still rendered.
- **Localised alt text**: `alt_es`, `alt_pt`, `alt_sv` in
  `docs/imagery-manifest.json`; `arrivalImage(id, locale)` throws on a missing one.
- **residenciaes palette**: red accent (read as an error state, pink tints) moved
  to wine `#8a1e32`.
- **flytta**: the broken `StatRow` on the homepage is gone.

Open: see KNOWN-ISSUES "hero photos are shared across brands".

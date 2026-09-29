# Dutch drafts for `emigreren` (emigrerennaarparaguay.nl)

30 native-Dutch article drafts, the Dutch fact strings and the image prompts, written 2026-09-29/30 while the Opus
foundation (new SiteKey, `nl` locale) was being built. Drafts live here, outside `content/`, so they cannot break the build.

| Folder | What |
|---|---|
| `a-emigratie/` | 10 articles: emigration, lifestyle, cities, property |
| `b-papieren/` | 10 articles: permits, cedula, apostille, VOG, timeline, family, Investor Pass |
| `c-geld/` | 10 articles: BRP, tax, AOW, banking, healthcare, business, and the factual page about the VPRO series |
| `d-assets/` | `facts-nl.json` (61 Dutch fact strings), `image-prompts-nl.md` (for Higgsfield, run by Anton) |

## Steps after the foundation merges (SiteKey `emigreren`, `nl` locale)
1. Merge `d-assets/facts-nl.json` into `content/shared/facts.ts` (`display`/`hedged` plain strings become `{en, nl}` maps; add `title.nl`). Then `npm run verify:i18n`.
2. Move `a-…`, `b-…`, `c-…` articles to `content/emigreren/gidsen/` (city pieces have `hub: steden`); drop the `# REVIEW:` comment lines only after review.
3. Resolve `NEEDED-FACTS.md` in each folder: add the facts with official sources (the source URLs were found by search, not fetched: re-check them), then replace hedged wording.
4. Publish gate: accountant review for tax, BRP, AOW and pension articles; legal review (trademark, tone) for `wakker-in-paraguay-serie-en-emigreren`; a native Dutch proofread of everything.
5. Generate the images from `d-assets/image-prompts-nl.md`, convert with webimg, add manifest rows, map them in `src/lib/article-images.json` and `src/lib/hub-images.ts`.

## Rules the drafts follow
No "belastingvrij"; figures only through `<Fact>`; nothing invented (no testimonials, counts, guarantee); the series title is used only descriptively on the one factual page, never as a brand.

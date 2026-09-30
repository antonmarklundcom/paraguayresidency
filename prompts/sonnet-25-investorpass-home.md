# S25-IP — Investor Pass homepage redesign ("decision memo")

Model: **Sonnet 5.5, effort high.** Subagents, if any: Sonnet or Opus only, never Fable
(`.claude/skills/fable-cost-guardrail/SKILL.md`). One PR. Do not spawn a next phase.

## Read first

1. `CLAUDE.md`, `plan.md` §1 (locked decisions) and the §9 phase index, the open items in `KNOWN-ISSUES.md`.
2. The design: `docs/design/investorpass-home.dc.html`. It is a Claude Design canvas with two frames: "Home —
   desktop · 1440" and "Home — mobile · 390". Dashed chips (`USD —`, `— wks`, `DD · MM · 2026`, `+595 — — —`) are
   placeholders, never live copy. The `<script type="text/x-dc">` block at the end holds the list data (routes,
   documents, FAQ, "in writing" items).
3. What exists now: `src/app/(en)/sites/investorpass/page.tsx` (current home), `_lib/RouteIndex.tsx`,
   `src/styles/themes/investorpass.css` (dark + gold today), `src/styles/fonts.css`, `src/lib/fonts.ts`,
   `src/sites/registry.ts` (investorpass entry), `src/i18n/messages/en/investorpass.json`, `content/shared/facts.ts`
   (every `investorpass.*` fact), `src/components/*`.

## Decision (Anton, 2026-09-30)

The Investor Pass brand switches from dark + gold to the design's white + teal "decision memo" look. This replaces
the overhaul-plan choice for this one brand; record it in the §9 entry. No other brand changes.

## Scope — what you change

1. **Theme tokens** — rewrite `[data-theme='investorpass']` in `src/styles/themes/investorpass.css` from the design:
   bg `#FFFFFF`, fg `#0F1A1E`, text-muted `#4B575D` / `#2B363B`, borders `#C9D1D5` (strong rule `#0F1A1E`),
   surface `#F2F4F5`, accent `#0A4A57`, accent hover `#06323B`, accent-fg `#FFFFFF`. Update the comment.
   `npm run check:contrast` must pass.
2. **Font** — display face Schibsted Grotesk, ONE static weight (600), Latin subset woff2, self-hosted in
   `public/fonts/schibsted-grotesk-600.woff2` (take it from the `@fontsource/schibsted-grotesk` npm package or the
   Google Fonts CSS API; do not add a runtime dependency; the CSP only allows `font-src 'self'`). Add the
   `@font-face` and a metric-matched `Schibsted Grotesk Fallback` (Arial, with ascent/descent/size-adjust overrides —
   compute them, e.g. with `@capsizecss/metrics` run once, or copy the method next/font uses) in
   `src/styles/fonts.css`; add a `--font-schibsted` variable wherever the other `--font-*` variables are defined;
   set `BRAND_FONT.investorpass = 'schibsted-grotesk-600'`. Remove Instrument Serif's `@font-face`, variable and file
   only if no other brand references it (grep first). Body text stays the system stack. The design's IBM Plex Mono
   labels use the system monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`): no second
   web font, the per-brand font budget is one file.
3. **Homepage** — rebuild `src/app/(en)/sites/investorpass/page.tsx` to match both frames, section by section:
   memo header strip (Subject / Prepared by / Status / Rules last reviewed) → hero (eyebrow "Decision memo ·
   Investor Pass 2026", H1, lede, two buttons, three check lines) with the qualifier card → §01 Routes comparison
   table (desktop table, mobile stacked cards) → §02 Timeline (standard vs Investor Pass bars) → §03 In writing →
   §04 Documents by route → §05 Agents & family offices → §06 FAQ → §07 Qualification form → footer.
   Put page-only components in `src/app/(en)/sites/investorpass/_lib/`. Follow the existing page's pattern for copy
   (inline strings vs `t()`); `npm run verify:i18n` must stay green.
4. **Header and footer look** for this brand only. `Nav` and `Footer` are shared by all brands: express the memo
   styling (hairline rule under the header, "PY·IP" mark in a teal box, mono small-caps labels) through
   `[data-theme='investorpass']` CSS or an optional prop that defaults to today's behaviour. The other six brands
   must render exactly as before. You may change the investorpass `nav` entries and their labels in the registry and
   `messages/en/investorpass.json`; on the homepage the design's anchors (#routes, #timeline, …) are fine, but from
   inner pages nav items must go to real pages (`/investor-pass/investment-routes`, `/investor-pass/process`,
   `/investor-pass/for-agents`, `/insights`, `/contact`). Keep `/insights` reachable from the header or footer.
5. Inner investorpass pages inherit the new tokens automatically. Open every one (list the folder) at 390 and 1440
   and fix anything the new palette or font breaks (hard-coded dark backgrounds, gold-only styles, hero overlays).

## Hard rules

- **Off limits (Sonnet phase, plan §6):** schema, auth, API routes, `src/proxy.ts`/middleware, payments, quiz scoring
  and questions (`src/features/quiz/*` logic), `src/lib/leads.ts`, `src/lib/lead-schema.ts`, server actions.
- **Qualifier:** reuse the existing quiz. Embed `<Quiz site="investorpass" />` in the hero card, restyled with CSS
  only. If it cannot sit in the hero without changing quiz logic or hurting LCP, render the design's card with the
  first question's options as links to `/route-finder` and put the real quiz there. Never reimplement the quiz. The
  card title states the real number of questions, not "6" unless it is 6.
- **Qualification form (§07):** use the existing lead form component (`LeadPanel` / `LeadForm`) with the fields it
  already supports. If a field the design shows (capital band, nationality) needs a lead-schema change, leave it out
  and list it in the PR as an Opus follow-up. WhatsApp links use the existing WhatsApp/brand-contact helpers; never
  hard-code or invent a number.
- **Numbers:** no legal or financial number in JSX (`tests/no-bare-legal-figures.test.ts`). Every threshold,
  duration, fee and date comes from `<Fact k>` (or the facts API the current page uses), which already renders the
  hedged text for unverified facts. Map the routes table to `investorpass.route_real_estate_usd`,
  `route_business_usd`, `route_financial_usd`, `route_tourism_usd`, `min_investment_usd`, `timeline`,
  `cie_documents`, etc. Where no fact exists, write words ("confirmed in writing for your case"), never a dash, never
  "USD —". "Rules last reviewed" = the latest `sourced.checkedOn` across `investorpass.*` facts, computed at build
  time, formatted with the site locale.
- **Proof:** no invented testimonials, counts, logos or credentials. Keep the existing real-data components
  (`TeamStrip`/`TeamSection`, `CaseSnapshots`, `Testimonials`) that hide themselves while `content/shared/proof.ts`
  is empty — place them after §03, styled to the memo look. Real people are the biggest trust gap on this page.
- **SEO:** keep `generateMetadata`, the `serviceOfferJsonLd` JSON-LD and FAQ structured data, and a compact
  "Insights" block (existing `ArticleCards`) above the footer for internal links. Metadata gate tests must pass.
- **No legal-advice claims:** keep the design's footer disclaimer ("general, not legal advice; approval is decided
  by the authority, not by us").
- **Performance:** mobile Lighthouse ≥ 0.90 on the investorpass home (`tests/lighthouse.mjs`). The design has no hero
  photo; drop `PhotoHero` from the home unless it scores better with it. No new client JS beyond what the quiz
  already ships.
- **Accessibility:** AA contrast, 44 px targets, visible focus, the routes table is a real `<table>` on desktop with a
  caption; the timeline has a text alternative.

## Verify

1. `npm run verify` green (typecheck, lint, tests, i18n, contrast, build).
2. `npm run dev`, then Playwright (Chromium is preinstalled; never run `playwright install`) screenshots of
   `http://investorpass.localhost:3000/` at 1440 and 390, side by side with the design frames. Fix visible gaps.
3. Before/after screenshots of the other six brand homes at 390 and 1440: they must be unchanged.
4. `node tests/lighthouse.mjs` (or the CI job) on the investorpass home: ≥ 0.90 mobile.
5. Re-read your own diff adversarially for bare numbers, placeholder dashes, and styles leaking to other brands.

## Deliver

- Branch from `main`, one PR titled "S25-IP: Investor Pass homepage — decision memo redesign". Attach the
  screenshots in the PR body. List Opus follow-ups (lead fields) and any facts that need Anton's sign-off.
- §9 index line in `plan.md` plus `docs/log/s25-ip.md` (what now exists, the theme decision, where to look first).
- End with a short report: what changed, what was left out and why, screenshots.

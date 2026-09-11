# Phase S22 — Funnel fixes. SONNET session. Spawned by S20, runs in parallel with S21 and S23.

Read ONLY: this file, `plan.md` §1, §4 (§4.7, §4.11, §4.12), §14 (intro, path note, §14.6), §7 (the pricing and
testimonial rows), the phase table and §9 index, `docs/log/o19.md` and `docs/log/s20.md`, `docs/route-finder.md`,
`docs/improvement-report.md` §1 items 16–18, 21–22. Execute plan §14.6 under §4. Build nothing outside it.

Owns (brand folders are under `src/app/(<locale>)/sites/<key>/` since O19):
- `src/features/quiz/questions.ts` — the `ROUTE_DESTINATIONS` table ONLY (`scoring.ts` stays closed)
- The five pricing pages: `residency/pricing`, `residenciaes/precios`, `residenciapt/precos`, `flytta/priser`,
  `frontier/pricing`; `guide/insider/page.tsx` (the FAQ price line only)
- Every brand's service pages (add the trust/process block; no other copy changes) and the contact pages of
  `residenciaes`, `residenciapt`, `frontier`, `flytta` (place O19's short WhatsApp variant)
- `src/components/ProcessTimeline.tsx` (new, additive, exported from `src/components/index.ts`)
- `content/shared/facts.ts` (new `pricing.*` keys, `verified:false`, per-locale hedged display)
- `src/i18n/messages/*/common.json` (additive), `docs/route-finder.md`, `tests/quiz-*.test.ts` (additive),
  `docs/log/s22.md`, `plan.md` §9 line

HARD LIMITS (§4.7): no `src/lib`, no `src/app/api`, no schema, no middleware, no `scoring.ts`, no `LeadForm*`
edits (use O19's `variant="whatsapp"` as shipped). §4.11: NO price, fee, threshold or timeline appears as a
literal — every figure is a `<Fact>` key Anton fills in `/admin/facts`. Testimonials stay hidden (§7). Do not
touch article indexes, feeds or registry nav (S21's) or MDX bodies (S23's).

Budget: one session, ≤ 90 min. Open the PR the turn the exit criteria pass.

Phase rules:
- Branch `phase/s22` off latest `main`. WIP commit every 30 min. `git merge main` before the PR; main wins.
- Quiz first: the per-site destination map with a test per brand proving a `temporary`/`permanent` result stays
  on-brand and `investor-pass` crosses to `paraguayinvestorpass.com`.
- Pricing pages sell the shape of the fee (covers / never covers / state fees vs ours / how quoting works);
  the `<Fact>` hedged display reads "quoted on your call" in each locale until Anton verifies a figure.
- `ProcessTimeline` renders durations only through existing `<Fact>` timeline keys; steps are copy.
- Same-shaped units (5 pricing pages, ~25 service pages): exemplar first, then parallel Sonnet subagents per
  `fable-directs-sonnet-builds`; one verify, one PR.
- Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.6 exit line — on-brand quiz results with tests, five fact-driven pricing pages, timeline on every
service page, short WhatsApp form on the four brands, live price in the Insider FAQ, verify green, PR merged
green, `docs/log/s22.md` + §9 line.

## After this phase
Spawn nothing. End with the phase report, which lists the new `pricing.*` fact keys Anton must fill in
`/admin/facts` (a §7 item).

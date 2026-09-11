# Phase S23 — Content depth. SONNET session. Spawned by S20, runs in parallel with S21 and S22. Fan-out phase.

Read ONLY: this file, `plan.md` §1, §4 (§4.7, §4.11, §4.12), §11 (voice per brand), §14 (intro + §14.7), the
phase table and §9 index, `docs/log/s20.md` (the length bar), `docs/guide-outline.md`, `content/shared/facts.ts`
(the key allowlist), and `docs/improvement-report.md` §1 items 19–20. Execute plan §14.7 under §4.

Owns:
- BODIES of `content/**/*.mdx` — frontmatter `title`/`description` are S20's and must not change; you may add
  `related` entries and `updated` dates if the schema has them
- New MDX files under existing hubs only: `content/residency/documents/` (4 nationality articles),
  `content/frontier/stories/` (2), each with frontmatter that passes S20's ≤60/≤155 bar
- `docs/guide-outline.md`, `docs/log/s23.md`, `plan.md` §9 line

HARD LIMITS (§4.7, §4.11): nothing under `src/`; no new fact keys without the per-locale hedged text; no
figure, fee, threshold, timeline or tax rate as a literal — `<Fact k>` or nothing; no new hubs or routes (an
article goes where a route already renders it; check `contentHref` in `src/lib/site-pages.tsx` read-only).
Voice per §11: no "unlock/seamless/world-class", no "tax-free", no "imposto zero"; hedge law as §1.10 says.

Budget: one session, ≤ 90 min. Open the PR the turn the exit criteria pass.

Phase rules:
- Branch `phase/s23` off latest `main`. WIP commit every 30 min. `git merge main` before the PR; main wins.
- Paid content first (member lessons, Insider updates, the deep dive), then the five public stubs, then the six
  pillar articles — so a partial session still improves what buyers paid for.
- Fan-out per `fable-directs-sonnet-builds`: one exemplar per shape (one lesson, one stub expansion, one
  nationality article) written and audited by you, then parallel Sonnet subagents for the rest, each briefed with:
  the exact fact-key allowlist, the frontmatter schema, the `/guides/<hub>/<slug>` (or brand-equivalent) link
  rule, the word bar, and "no new frontmatter titles". One central audit (word counts, `<Fact>` keys valid,
  `related` targets exist, no forbidden words) before the PR; `npm run verify` once at the end.
- Anonymised worked cases in the Insider material are illustrative and say so; no real client details.
- Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.7 exit line — no public article < 600 words, no member lesson < 700, deep dive and updates
1000–1500, six new pillar articles, `content.test.ts` + `content-links.test.ts` green, verify green, PR merged
green, `docs/log/s23.md` + §9 line.

## After this phase
Spawn nothing. End with the phase report: what was expanded (counts before/after), and restate that S6 waits
on Anton's §7 items, that S15 runs after O19 (already merged), and that F7 is opened by Anton after S15.

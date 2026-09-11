# Phase S20 — Quality gates & repo hygiene. SONNET session. Spawned by O19. Runs ALONE before S21–S23.

Read ONLY: this file, `plan.md` §1, §4, §14 (intro + §14.4), the phase table and §9 index, the O19 log entry, and
`docs/improvement-report.md` §1 items 14 and 23–25. Execute plan §14.4 under §4. Build nothing outside it.

Owns:
- `tests/**`, `.github/**`, `.nvmrc`, `package.json` (`engines` and `@types/node` lines only)
- `content/**/*.mdx` FRONTMATTER ONLY (title/description trims for the 12 files over the ≤60/≤155 bar)
- `docs/log/**` (new), `docs/known-issues-archive.md` (new), `plan.md` §9 and §4.10, `KNOWN-ISSUES.md`,
  `CLAUDE.md` (the orientation-read sentence and the "Read plan.md" line)

HARD LIMITS (plan §4.7): nothing under `src/` except tests; no article bodies; no schema; no dependency upgrades
beyond `@types/node`. The docs split moves text verbatim — you do not rewrite history.

Budget: one session, ≤ 60 min. Open the PR the turn the exit criteria pass.

Phase rules:
- Branch `phase/s20` off latest `main`. WIP commit every 30 min.
- Order: (1) tighten `content.test.ts` and trim the 12 files, (2) CI jobs, (3) engines, (4) new pure tests,
  (5) the docs split last (it is the largest diff; keep it in its own commit).
- The Lighthouse CI job uses O19's `tests/lighthouse.mjs`, runs against `next start` after the build, is
  `continue-on-error: true` with a dated comment saying S6/S15 flips it to blocking after two weeks of green.
- Migration-drift job: `npx drizzle-kit generate` then `git status --porcelain drizzle/` must be empty.
- Docs split: `docs/log/<phase-id-lowercase>.md` per §9 entry (o1, o2, f8, o9, s3, …, o19), content verbatim;
  §9 becomes one line per phase: `| <id> | <date> | <PR link or branch> | docs/log/<id>.md |`. Archive every
  `CLEARED`/`FIXED` `KNOWN-ISSUES.md` entry verbatim. Target `wc -l plan.md` < 700.
- ≥ 12 new tests. Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.4 exit line — verify green under the tighter bar, four new CI jobs ran on this PR, `plan.md` < 700
lines, PR merged green, `docs/log/s20.md` + the §9 index line.

## After this phase
Gates as always (PR merged green, exit checklist, pre-handoff audit, log committed). Then spawn S21, S22 and S23
at once: three claude-code-remote `create_session` calls, inherit environment and permission mode (never `plan`),
`model` = Sonnet (never Fable, §4.8), `prompt` exactly `Read prompts/<file> in this repo and execute it.` for
`sonnet-21-seo-surfaces.md`, `sonnet-22-funnel-fixes.md`, `sonnet-23-content-depth.md`. Then end with the phase
report.

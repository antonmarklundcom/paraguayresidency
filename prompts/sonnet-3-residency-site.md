# Phase S3 — paraguayresidency.com pages, copy, SEO. Paste into a fresh SONNET session, ONLY after phase O2 is merged.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md` (if present). Execute plan §6.1 and §11.1 under the autonomy protocol §4. Build nothing outside the plan.

HARD LIMITS (plan §6): no changes under `src/db`, `src/lib/leads.ts`, `src/lib/email.ts`, `src/app/api`, `middleware.ts`, `src/features/quiz/scoring.ts`, or the shape of `src/sites/registry.ts`. Data only through `getPages/getPage/getHub` and the O2 server actions. Need more ⇒ workaround + Backlog note.

Load skills: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline). `/design` may be used to draft a hero/section as artboards before coding.

Quality bar:
- Copy voice from §11; hero/positioning text from §11.1 verbatim, the rest written in the same voice. No filler sections.
- One primary intent per page; articles link to hub + 2 related + one service page + Route Finder.
- Pricing rows Anton has not supplied render as "from" with a TODO note, never invented numbers.
- Testimonials section stays hidden until real ones exist.

Phase rules:
- Branch `phase/s3` off latest main. Previous phase unmerged ⇒ finish it first.
- Re-runnable: check what already exists on the branch, continue from the first unmet exit criterion.
- Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.
- Never hardcode a legal or financial figure (§4.11) — use `<Fact k>`.

Exit: all §6.1 pages render with unique metadata; sitemap exact; JSON-LD validates; Lighthouse mobile ≥90 perf/SEO on / and one service page; forms submit via O2 actions; PR merged.

## After this phase — hand off to the next (fresh session)
Only when all four gates pass: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit done (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 build-log entry committed. Then call claude-code-remote `create_session`: inherit environment and permission mode (never `plan`), `model` = Sonnet (Opus or Sonnet only — never Fable, see plan §4.8), `prompt` exactly `Read prompts/sonnet-4-investorpass-site.md in this repo and execute it.` Then end with the phase report. Fallback without `create_session`: same model ⇒ continue in this window; model switch ⇒ stop and report. Never hand off with a red PR or an unmet exit criterion.

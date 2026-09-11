# Phase O17 — Money & auth correctness. Paste into a fresh OPUS window. First phase of the F10 improvement plan.

Read ONLY: this file, `plan.md` §1, §4, §14 (intro + §14.1), the phase table and the §9 index, `docs/platform.md`,
`docs/improvement-report.md` §1 items 1–6 and 10, and `KNOWN-ISSUES.md`'s FREE_ACCESS_MODE entry. Do not read the
rest of the build log. Execute plan §14.1 under the autonomy protocol §4. Build nothing outside it.

Owns (the only paths you may create or modify, plus the §4 append-only exceptions):
- `src/lib/{webhooks,signing,auth,member-auth,lemonsqueezy,subscriptions,purchases,entitlements,member-admin,download-policy}.ts`
- `src/lib/rate-limit.ts` (new), `src/app/api/**`, `src/app/sites/guide/members/resources/[slug]/download/route.ts`
- `tests/**`, `.env.example`, `docs/platform.md`, `KNOWN-ISSUES.md`, `plan.md` §9

HARD LIMITS: `src/db/schema.ts` and `drizzle/` are FINAL — no migration. No page, copy or component changes.
`src/middleware.ts` and `next.config.ts` are O18's. If a fix seems to need a column, write the columnless
version (§14.1 names one for every item) and put the column idea in Backlog.

Budget: one session, ≤ 90 min. When the exit criteria pass, open the PR that turn.

Phase rules:
- Branch `phase/o17` off latest `main`. WIP commit every 30 min.
- Load skills: `claude-api` is NOT needed; load `nextjs-deploy-hostinger` only for the one-Node-process assumption.
- Do the three P0s first (webhook retry, weak secret, FREE_ACCESS_MODE order id), each with its test, each its
  own commit, so a partial session still ships them.
- Verify the Lemon Squeezy retry semantics against their webhook docs before choosing the idempotency key; write
  what you found in a comment above `lemonSqueezyEventId`.
- `next build` and `npm run verify` must pass with an EMPTY `.env` — the weak-secret refusal is request-time.
- Every behaviour you change gets a test in the same commit. ≥ 15 new tests total.
- Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.1 exit line — verify green, every item has a named test, `docs/platform.md` updated (≤ 15 lines),
PR merged green, §9 entry (5–10 lines: what changed, the LS retry finding, anything O18 must know).

## After this phase
Gates: PR merged green; exit checklist; pre-handoff audit (one re-run of verify on main + one adversarial re-read
of the merged diff, findings fixed in one follow-up commit); §9 entry committed. Then spawn O18: one
claude-code-remote `create_session`, inherit environment and permission mode (never `plan`), `model` = Opus
(never Fable, §4.8), `prompt` exactly `Read prompts/opus-18-abuse-and-ops-hardening.md in this repo and execute it.`
Then end with the phase report.

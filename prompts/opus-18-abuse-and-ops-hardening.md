# Phase O18 — Abuse & ops hardening. OPUS session. Spawned by O17.

Read ONLY: this file, `plan.md` §1, §4, §14 (intro + §14.2), the phase table and §9 index, `docs/log/o17.md` or
the O17 entry in §9, `docs/improvement-report.md` §1 items 7–10 and 23, and `src/lib/rate-limit.ts` (O17's).
Execute plan §14.2 under §4. Build nothing outside it.

Owns:
- `src/lib/{rate-limit,leads,email,form-guard}.ts`, `src/app/actions/**`, `src/app/admin/actions.ts`
- `src/app/api/{subscribe,auth,checkout,health}/**`, `src/middleware.ts`, `src/sites/resolve.ts`, `next.config.ts`
- `tests/**`, `docs/runbook.md` (create only if S6/PR #13 is still unmerged — S6's version wins on merge; keep
  yours to the health/limits section so the merge is additive), `KNOWN-ISSUES.md`, `plan.md` §9

HARD LIMITS: no schema, no page/copy changes, no change to O17's webhook or entitlement logic beyond calling
`take()`. The lead pipeline rule from CLAUDE.md is the point of item 2: an integration OR database failure never
fails a form.

Budget: one session, ≤ 75 min. Open the PR the turn the exit criteria pass.

Phase rules:
- Branch `phase/o18` off latest `main`. WIP commit every 30 min.
- Limits are per plan §14.2 item 1 exactly; the IP is the first `x-forwarded-for` hop, else the socket. Behind
  Hostinger's proxy that header is set — say so in `docs/runbook.md`'s health section.
- Console email mode must be visibly degraded in production (`/api/health`, `sendEmail` result), never silent.
- HSTS only when `NODE_ENV === 'production'`; the report-only CSP must allow Plausible's script and be
  documented in `next.config.ts` so S6/S15 can flip it to enforcing after a week of clean reports.
- `tests/abuse.mjs` runs against `next start` and is NOT wired into CI (S20 decides what goes into CI).
- ≥ 10 new tests. Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.2 exit line — verify green, the abuse script shows 429s, headers present on `/` and `/admin`,
PR merged green, §9 entry.

## After this phase
Gates as in `prompts/opus-17-money-and-auth-correctness.md`. Then spawn O19: `create_session`, inherit environment
and permission mode (never `plan`), `model` = Opus, `prompt` exactly
`Read prompts/opus-19-rendering-and-leadform-perf.md in this repo and execute it.` Then end with the phase report.

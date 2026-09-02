# Phase O2 — Conversion core. Paste into a fresh OPUS session, ONLY after phase O1 is merged.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md` (if present). Execute plan §5.2 under the autonomy protocol §4. Build nothing outside the plan.

Load skills: `vendercrm-lead-capture`, `nodejs-mysql-hostinger-stack` §2.

Traps:
- Local DB row is the source of truth; CRM and email are fire-and-forget with status on the row. Never let a CRM outage fail a form.
- Stripe webhook: verify signature, be idempotent on `stripe_session_id`, and never trust the success URL alone.
- Download endpoint streams from `private/`, never from `public/`.
- Quiz scoring is a pure function with tests for all three outcomes.
- Admin is reachable on the hub host only — enforce in middleware, test it.

Phase rules:
- Branch `phase/o2` off latest main. Previous phase unmerged ⇒ finish it first.
- Re-runnable: check what already exists on the branch, continue from the first unmet exit criterion.
- Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.
- Never hardcode a legal or financial figure (§4.11) — use `<Fact k>`.

Exit: `npm run verify` green; every form variant stores a row and logs CRM+email; Stripe test purchase → paid order → download works, limits enforced; quiz yields three documented outcomes; admin blocked on non-hub hosts; PR merged.

## After this phase — hand off to the next (fresh session)
Only when all four gates pass: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit done (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 build-log entry committed. Then call claude-code-remote `create_session`: inherit environment and permission mode (never `plan`), `model` = Sonnet (Opus or Sonnet only — never Fable, see plan §4.8), `prompt` exactly `Read prompts/sonnet-3-residency-site.md in this repo and execute it.` Then end with the phase report. Fallback without `create_session`: same model ⇒ continue in this window; model switch ⇒ stop and report. Never hand off with a red PR or an unmet exit criterion.

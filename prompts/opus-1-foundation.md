# Phase O1 — Foundation. Paste into a fresh OPUS session.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md` (if present). Execute plan §2 and §5.1 under the autonomy protocol §4. Build nothing outside the plan.

Load skills: `nodejs-mysql-hostinger-stack`, `nextjs-national-lead-gen`, `nextjs-deploy-hostinger` (env/DB init sections only).

Traps:
- The host→site resolver in `middleware.ts` is the foundation of the whole product. Unit-test it (www, apex, unknown host, `*.localhost`, direct `/_sites/…` must 404).
- `metadataBase` must come from the site registry per request, never from one env var.
- Write the COMPLETE schema (§2) now, including `orders`, `download_tokens`, `subscribers`, even though O2 uses them. Schema is never retrofitted.
- i18n from the first commit; `verify:i18n` must fail on a missing key.
- Three themes must look different in `/_dev/kitchen-sink`; do not spend effort on final page design — S3–S5 own that.

Phase rules:
- Branch `phase/o1` off latest main. Previous phase unmerged ⇒ finish it first.
- Re-runnable: check what already exists on the branch, continue from the first unmet exit criterion.
- Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.
- Never hardcode a legal or financial figure (§4.11) — use `<Fact k>`.

Exit: `npm run verify` green; three `*.localhost:3000` hosts render distinct themed placeholders with correct canonical hosts; redirect/404 tests pass; seed idempotent; PR merged.

## After this phase — hand off to the next (fresh session)
Only when all four gates pass: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit done (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 build-log entry committed. Then call claude-code-remote `create_session`: inherit environment and permission mode (never `plan`), `model` = Opus (Opus or Sonnet only — never Fable, see plan §4.8), `prompt` exactly `Read prompts/opus-2-conversion-core.md in this repo and execute it.` Then end with the phase report. Fallback without `create_session`: same model ⇒ continue in this window; model switch ⇒ stop and report. Never hand off with a red PR or an unmet exit criterion.

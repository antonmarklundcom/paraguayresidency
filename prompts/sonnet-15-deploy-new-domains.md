# Phase S15 — Deploy the four new domains, member platform go-live, retire the two repos. Paste into a fresh SONNET session, ONLY after S10, S11, S12, S13 AND S14 are all merged.

Read `plan.md` FIRST, in full — plus §9 build log (S6's entry says which hosting path was chosen), `KNOWN-ISSUES.md`, `docs/runbook.md`, `docs/platform.md`, `docs/flytta-redirects.md`. Execute plan §6.10 under the autonomy protocol §4. Build nothing outside the plan.

Load skills: `nextjs-deploy-hostinger`, `higgsfield-web-imagery`, `higgsfield-image-pipeline`, `webimg-pipeline`.

Traps:
- Same slot or Caddy config as S6 — never a second app or slot (§1.7). Eight new hostnames (four apex + www), SSL on all, `/api/health` per host before anything else.
- `scripts/import-pararesi.ts --dry-run` FIRST against `PARARESI_DATABASE_URL`; compare counts with Anton's expectations in the §7 row; only then the real run. It is idempotent, so a re-run is safe; a wrong mapping is not — stop per §4.4 if counts look wrong.
- Lemon Squeezy live webhook: register the URL, set the live secret, then trigger a test event from the LS dashboard and confirm a `webhook_events` row. Never leave the test-mode secret in production.
- The flytta 301 map is data in the registry (`redirects` on the `flytta` entry), not new middleware logic; if the registry has no such field, the smallest additive change adding it is allowed in THIS phase only, with a resolver test.
- Retiring the repos means a README pointer in each; archiving on GitHub is Anton's click — put it in the report, do not attempt it.
- Imagery only through the skills' pipeline; alt text from MDX/registry, never hand-typed.

Phase rules:
- Branch `phase/s15` (the claim branch already exists on origin — use it, off latest main). Re-runnable: continue from the first unmet criterion.
- Missing credentials degrade per §4.5 and land in `KNOWN-ISSUES.md` with the exact step to finish; stop only per §4.4.

Exit: seven domains live with SSL and healthy; one real pararesi Insider and one entry buyer log in via magic link on paraguayinvestorguide.com and see the right tier; flytta old URLs 301; Search Console verified ×7 with sitemaps; analytics ids set; hero + 2 images per new brand; runbook covers seven domains and the LS webhook; PR merged.

## After this phase — STOP and report
Gates as always: PR merged green, exit checklist, pre-handoff audit, §9 entry committed. Then do NOT spawn anything. End with a footer report to Anton: what is live, what is still open from §7, and this exact line for him to paste into a window he opens himself on Fable: `Read prompts/fable-7-launch-review.md in this repo and execute it.` (plan §4.8: Fable phases are never spawned.)

# Phase S15 — Deploy the four new domains, member platform go-live, retire the two repos. Paste into a fresh SONNET session, ONLY after S10, S11, S12, S13, S14 AND S6 are all merged.

Read `plan.md` FIRST, in full — plus §9 build log (S6's entry says which hosting path was chosen), `KNOWN-ISSUES.md`, `docs/runbook.md`, `docs/platform.md`, `docs/flytta-redirects.md`. Execute plan §6.10 (as amended by F9) under the autonomy protocol §4. Build nothing outside the plan.

Domains are the seven in plan §12.2 and nothing else. The four to attach here: `paraguayfrontier.com`, `residenciaparaguay.es`, `vidanoparaguai.com`, `flyttatillparaguay.se`. The three S6 attached: `paraguayresidency.co.uk` (hub, `/admin`), `paraguayinvestorpass.com`, `paraguayresidencyguide.com` (the only selling brand; `/login`, `/members`, both webhooks).

Load skills: `nextjs-deploy-hostinger`, `higgsfield-web-imagery`, `higgsfield-image-pipeline`, `webimg-pipeline`.

Traps:
- Same slot or Caddy config as S6 — never a second app or slot (§1.7). Eight new hostnames (four apex + www), SSL on all, `/api/health` per host before anything else.
- **pararesi is a verification, not a migration (plan §1.13, §6.10.3).** pararesi was never deployed, so the expected source is empty. If `PARARESI_DATABASE_URL` (or a dump) is provided: `npm run import:pararesi -- --dry-run` first; zero rows = finding confirmed, write it in §9 and move on. Non-zero rows = real buyers exist: set `PARARESI_AMOUNT_UNIT` explicitly (KNOWN-ISSUES, O9), compare counts with Anton's, then the real run; stop per §4.4 if counts look wrong. If no database is provided, record "no pararesi data, Insider launched new" and move on. Either way prove the member platform with fresh test buyers (one LS test-mode Insider, one Stripe entry purchase), each requesting a magic link on `paraguayresidencyguide.com` and seeing the right tier.
- Lemon Squeezy live webhook: register the URL on `paraguayresidencyguide.com`, set the live secret, then trigger a test event from the LS dashboard and confirm a `webhook_events` row. Never leave the test-mode secret in production.
- The flytta 301 map is data in the registry (`redirects` on the `flytta` entry), not new middleware logic; if the registry has no such field, the smallest additive change adding it is allowed in THIS phase only, with a resolver test.
- Retiring the repos means a README pointer in each; archiving on GitHub is Anton's click — put it in the report, do not attempt it.
- Imagery only through the skills' pipeline; alt text from MDX/registry, never hand-typed.

Phase rules:
- Branch `phase/s15` (the claim branch already exists on origin — use it, off latest main). Re-runnable: continue from the first unmet criterion.
- Missing credentials degrade per §4.5 and land in `KNOWN-ISSUES.md` with the exact step to finish; stop only per §4.4.

Exit: seven domains live with SSL and healthy; a test Insider and a test entry buyer log in via magic link on `paraguayresidencyguide.com` and see the right tier (imported pararesi members too, if any existed); flytta old URLs 301; Search Console verified ×7 with sitemaps; analytics ids set; hero + 2 images per new brand; runbook covers seven domains and the LS webhook; PR merged.

## After this phase — STOP and report
Gates as always: PR merged green, exit checklist, pre-handoff audit, §9 entry committed. Then do NOT spawn anything. End with a footer report to Anton: what is live, what is still open from §7, and this exact line for him to paste into a window he opens himself on Fable: `Read prompts/fable-7-launch-review.md in this repo and execute it.` (plan §4.8: Fable phases are never spawned.)

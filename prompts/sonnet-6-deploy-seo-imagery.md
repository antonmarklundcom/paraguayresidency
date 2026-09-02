# Phase S6 — Deploy, domains, analytics, imagery. Paste into a fresh SONNET session, ONLY after phase S5 is merged.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md`. Execute plan §6.4 under the autonomy protocol §4. Build nothing outside the plan.

HARD LIMITS (plan §6) still apply: no schema/auth/API/middleware changes. Config, env, DNS, hosting, imagery and docs only.

Load skills: `nextjs-deploy-hostinger` (all of it, before touching hosting), `higgsfield-web-imagery` (for §6.4 step 6).

Phase rules:
- Branch `phase/s6` off latest main. Previous phase unmerged ⇒ finish it first.
- Hosting per §1.7: ONE Hostinger Node slot with three domains attached is the first attempt. If hPanel cannot attach multiple custom domains to one Node app, do NOT create three slots — record the finding in §9, stop per §4.4 and ask Anton to confirm the VPS fallback (Caddy + PM2), then execute it.
- Give Anton one command per message when SSH steps are needed (deploy skill rule).
- Set every §7 env var that exists; missing ones degrade per §4.5 and go in the report.
- Imagery: hero + 2 section images per site through the imagery skill's slot pipeline; alt text from content, never typed by hand.
- Write `docs/runbook.md` (deploy, DB password rotation trap, add a fourth domain, add an article).

Exit: three domains live with SSL on apex and www; `/api/health` OK on each host; Search Console verified and sitemaps submitted; one live Stripe purchase + refund done; runbook committed; PR merged.

## After this phase — STOP (do not spawn anything)
The next phase, F7, runs on Fable 5.1 and is opened by Anton himself (plan §1.9, §4.8). Never call `create_session` for it. End with the closing report: live URLs for all three sites; hosting outcome (slot or VPS); the §7 items still open, numbered, with exactly what Anton must do for each; and the single line he pastes into a Fable window: `Read prompts/fable-7-launch-review.md in this repo and execute it.`

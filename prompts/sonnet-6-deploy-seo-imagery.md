# Phase S6 — Deploy, domains, analytics, imagery. Paste into a fresh SONNET session, ONLY after phase S5 is merged.

> **F9 amendment (2026-09-07) — read before re-running.** The three domains are now `paraguayresidency.co.uk` (hub, `/admin`), `paraguayinvestorpass.com` and `paraguayresidencyguide.com` (plan §12.2) — not the `.com`, `.com.py` and `investorguide` hosts this prompt and your branch's docs were written for. Anton does not own those. Before anything else: merge latest `main` into `phase/s6` (S16, the domain sweep, must already be merged — if `src/sites/registry.ts` on `main` still says `paraguayresidency.com`, stop and tell Anton to run S16 first), then replace every old host in `docs/runbook.md` and `docs/decisions-needed.md` with the new ones (the Stripe live webhook is `https://paraguayresidencyguide.com/api/stripe/webhook`; the sending domain for Resend/SMTP is `paraguayresidency.co.uk`). Everything below still applies with those names. You no longer spawn S10–S14 — S16 does (plan §4.12, amended). Your handoff is: PR merged green, §9 entry, then a report; S15 is spawned by the content lane's claim rule once you and S10–S14 have all merged.


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

## After this phase — hand off to the parallel content lane (five fresh sessions)
Only when all four gates pass (PR merged green; exit checklist; pre-handoff audit — re-run `npm run verify`, adversarially re-read your merged diff, fix findings; §9 entry committed). Then call claude-code-remote `create_session` FIVE times, one per phase, per plan §4.12: inherit environment and permission mode (never `plan`), `model` = Sonnet (never Fable, plan §4.8), `prompt` exactly `Read prompts/sonnet-10-frontier-site.md in this repo and execute it.`, then the same for `sonnet-11-residenciaes-site.md`, `sonnet-12-residenciapt-site.md`, `sonnet-13-flytta-site.md`, `sonnet-14-guide-members.md`. F7 is NOT next — S15 reports that to Anton later. End with the closing report: live URLs for the three sites; hosting outcome (slot or VPS); the §7 items still open, numbered, with exactly what Anton must do for each. Fallback without `create_session`: stop and report the five lines for Anton to paste. Never hand off with a red PR.

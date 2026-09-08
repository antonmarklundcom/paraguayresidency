# Phase S13 — flyttatillparaguay.se port + pages (Swedish). Paste into a fresh SONNET session, ONLY after phase S16 (the domain sweep) is merged. S6 may still be open — it is owner-blocked and does not gate you (plan §4.12, amended F9). Runs in parallel with S10–S12, S14.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md`. Execute plan §6.8, §11.8 and §12.4 (content part) under the autonomy protocol §4 and the parallel-lane rules in §4.12. Build nothing outside the plan.

Attach `antonmarklundcom/flyttatillparaguay` read-only via `add_repo`. Port from it; never push to it. Its existing copy (`content/site.ts`, `plan.md`, the MDX drafts) wins over §11.8 wherever it exists.

HARD LIMITS (plan §4.7, §6): no changes under `src/db`, `src/lib/{leads,email,entitlements,member-auth,stripe,lemonsqueezy}.ts`, `src/app/api`, `src/middleware.ts`, `src/features/quiz/scoring.ts`, or the shape of `src/sites/registry.ts` (filling the `flytta` entry — nav, footer, WhatsApp, author — is fine). You own `src/app/sites/flytta/`, `content/flytta/`, `src/i18n/messages/sv/flytta.json`, `src/styles/themes/flytta.css`, `docs/flytta-redirects.md`. The ported `<StatRow>` and `<Disclaimer>` go into `src/components` as new files (additive; register them in the MDX component map with a one-line change).

Load skills: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline).

Quality bar:
- Swedish throughout; slugs in Swedish, shared routes keep English paths (§1.3). Money SEK first, then USD, only through `<Fact>` and `formatMoney`. Swedish exit-tax rules hedged as "stäm av med en skatterådgivare".
- Personal-story voice; first person plural allowed here only. Guide upsell allowed — the Guide is `paraguayresidencyguide.com` ("Paraguay Residency Guide") and the hub is `paraguayresidency.co.uk` (F9); link through `siteOrigin()`, never a typed domain.
- Port `content/guider/` and `content/stader/` onto the pipeline (`cluster` → `hub`, keep `relatedSlugs`, `faq[]`); every ported file must render. Write enough new articles for 8 total plus 2 new city pages.
- `docs/flytta-redirects.md`: every public URL the old site served → new path. Complete, not sampled.
- Lead form variant `consultation`, `site=flytta`.

Phase rules:
- Branch `phase/s13` off latest main (S16 merged). Re-runnable. Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4. Never hardcode a legal or financial figure (§4.11).

Exit: S3's bar; `lang="sv"`; every ported MDX renders; redirect map complete; leads tagged `site=flytta`; PR merged.

## After this phase — hand off
Gates: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 entry committed. Then apply the S15 claim rule (§4.12, amended F9): if S10–S14 are all merged and no `phase/s15` branch exists on origin, push an empty `phase/s15` branch (the claim). Then check whether S6 (PR #13, `phase/s6`) has merged. If it has, call claude-code-remote `create_session` (inherit environment and permission mode, never `plan`; `model` = Sonnet — never Fable, plan §4.8; `prompt` exactly `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.`). If S6 is still open, spawn nothing and end with a report telling Anton that S15 is claimed and waits on S6, and that once S6 merges he pastes `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.` into a fresh Sonnet window. If the claim branch already existed, someone else claimed it — end with the phase report. Never hand off with a red PR.

# Phase S10 — paraguayfrontier.com pages, copy, SEO. Paste into a fresh SONNET session, ONLY after phase S16 (the domain sweep) is merged. S6 may still be open — it is owner-blocked and does not gate you (plan §4.12, amended F9). Runs in parallel with S11–S14.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md`. Execute plan §6.5 and §11.5 under the autonomy protocol §4 and the parallel-lane rules in §4.12. Build nothing outside the plan.

HARD LIMITS (plan §4.7, §6): no changes under `src/db`, `src/lib/{leads,email,entitlements,member-auth,stripe,lemonsqueezy}.ts`, `src/app/api`, `src/middleware.ts`, `src/features/quiz/scoring.ts`, or the shape of `src/sites/registry.ts` (filling the `frontier` entry's nav/footer is fine). You own `src/app/sites/frontier/`, `content/frontier/`, `src/i18n/messages/en/frontier.json`, `src/styles/themes/frontier.css`. Shared files: smallest additive change, rebase before merge.

Load skills: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline). `/design` may draft the hero as artboards before coding.

Quality bar:
- Voice from §11.5: skeptical, practical, second person. The brand never says "tax-free"; every tax sentence renders `<Fact k="tax.foreign_income_treatment">` or `tax.territorial_rate`.
- Theme: warm, wide, editorial; one earth-tone accent; big type; not a prepper aesthetic.
- `/routes` links to the hub's service pages and the Investor Pass sibling rather than restating them; `/guide` is a bridge to `paraguayresidencyguide.com` (the "Paraguay Residency Guide" — read the name and host from the registry, never type a domain), not a copy. Sibling links to the hub go through `siteOrigin('residency')`, which is `paraguayresidency.co.uk` since F9.
- Lead form variant `consultation`, `site=frontier`; Guide is the "not ready yet" exit.
- Six `/stories/[slug]` articles per §6.5, 900–1400 words, one intent, internal links to the supporting page + the Route Finder.

Phase rules:
- Branch `phase/s10` off latest main (S16 merged). Re-runnable: continue from the first unmet exit criterion.
- Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4. Never hardcode a legal or financial figure (§4.11).

Exit: S3's bar (unique titles ≤60 / descriptions ≤155, sitemap exact, JSON-LD valid, no `<Fact>` bypassed, Lighthouse mobile ≥90 on `/` and `/tax`); leads tagged `site=frontier`; PR merged.

## After this phase — hand off
Gates: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 entry committed. Then apply the S15 claim rule (§4.12, amended F9): if S10–S14 are all merged and no `phase/s15` branch exists on origin, push an empty `phase/s15` branch (the claim). Then check whether S6 (PR #13, `phase/s6`) has merged. If it has, call claude-code-remote `create_session` (inherit environment and permission mode, never `plan`; `model` = Sonnet — never Fable, plan §4.8; `prompt` exactly `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.`). If S6 is still open, spawn nothing and end with a report telling Anton that S15 is claimed and waits on S6, and that once S6 merges he pastes `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.` into a fresh Sonnet window. If the claim branch already existed, someone else claimed it — end with the phase report. Never hand off with a red PR.

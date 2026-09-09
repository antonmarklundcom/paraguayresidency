# Phase S12 — vidanoparaguai.com ("Vida no Paraguai") pages, copy, SEO (Brazilian Portuguese). Paste into a fresh SONNET session, ONLY after phase S16 (the domain sweep) is merged. S6 may still be open — it is owner-blocked and does not gate you (plan §4.12, amended F9). Runs in parallel with S10, S11, S13, S14.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md`. Execute plan §6.7 and §11.7 under the autonomy protocol §4 and the parallel-lane rules in §4.12. Build nothing outside the plan.

HARD LIMITS (plan §4.7, §6): no changes under `src/db`, `src/lib/{leads,email,entitlements,member-auth,stripe,lemonsqueezy}.ts`, `src/app/api`, `src/middleware.ts`, `src/features/quiz/scoring.ts`, or the shape of `src/sites/registry.ts` (filling the `residenciapt` entry is fine). You own `src/app/sites/residenciapt/`, `content/residenciapt/`, `src/i18n/messages/pt/residenciapt.json`, `src/styles/themes/residenciapt.css`. `messages/pt/common.json` is complete (O9) — one-line additive fixes only.

Load skills: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline).

Quality bar:
- Brazilian Portuguese throughout (`você`). Slugs in Portuguese; shared routes keep English paths (§1.3). `lang` comes from the registry.
- Voice from §11.7 (rewritten by F9 — read it before the page list): the brand is **Vida no Paraguai**, "a life in Paraguay"; residency is the product that starts it and every page, including the living-cost and border pages, ends in a residency CTA. Speaking to a neighbour, never promising "imposto zero" (not even negated in a heading). Money in BRL first, then USD, PYG, only through `<Fact>` and `formatMoney`.
- S16 already put the hero, meta and tagline strings from §11.7 into `messages/pt/residenciapt.json` and the registry `name`. Use them; do not rewrite them. The `morar-no-paraguai` hub leads with at least 3 of the 8 articles; `/custo-de-vida` is a standing page (§6.7).
- Distinct content: `/mercosul` renders `<Fact k="mercosur.residency_route">`; Brazilian tax consequences hedged as "confirme com seu contador"; one article on the border region (Ciudad del Este / Foz).
- No Guide upsell (§1.11); newsletter soft exit. `/investor-pass` is a bridge to the English brand (`paraguayinvestorpass.com`, via `siteOrigin('investorpass')`) and says so. The hub sibling is `paraguayresidency.co.uk` (F9); never type a domain that is not in the registry.
- Lead form variants `consultation` and `contact`, `site=residenciapt`. Eight `/guias/[hub]/[slug]` articles minimum across the hubs in §6.7.

Phase rules:
- Branch `phase/s12` off latest main (S16 merged). Re-runnable. Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4. Never hardcode a legal or financial figure (§4.11).

Exit: S3's bar; `lang="pt-BR"`; no English UI string visible (crawl + grep as S11); leads tagged `site=residenciapt`; PR merged.

## After this phase — hand off
Gates: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 entry committed. Then apply the S15 claim rule (§4.12, amended F9): if S10–S14 are all merged and no `phase/s15` branch exists on origin, push an empty `phase/s15` branch (the claim). Then check whether S6 (PR #13, `phase/s6`) has merged. If it has, call claude-code-remote `create_session` (inherit environment and permission mode, never `plan`; `model` = Sonnet — never Fable, plan §4.8; `prompt` exactly `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.`). If S6 is still open, spawn nothing and end with a report telling Anton that S15 is claimed and waits on S6, and that once S6 merges he pastes `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.` into a fresh Sonnet window. If the claim branch already existed, someone else claimed it — end with the phase report. Never hand off with a red PR.

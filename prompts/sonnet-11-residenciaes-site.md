# Phase S11 — residenciaparaguay.es pages, copy, SEO (Spanish). Paste into a fresh SONNET session, ONLY after phase S6 is merged. Runs in parallel with S10, S12–S14.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md`. Execute plan §6.6 and §11.6 under the autonomy protocol §4 and the parallel-lane rules in §4.12. Build nothing outside the plan.

HARD LIMITS (plan §4.7, §6): no changes under `src/db`, `src/lib/{leads,email,entitlements,member-auth,stripe,lemonsqueezy}.ts`, `src/app/api`, `src/middleware.ts`, `src/features/quiz/scoring.ts`, or the shape of `src/sites/registry.ts` (filling the `residenciaes` entry is fine). You own `src/app/sites/residenciaes/`, `content/residenciaes/`, `src/i18n/messages/es/residenciaes.json`, `src/styles/themes/residenciaes.css`. `messages/es/common.json` exists and is complete (O9) — fix a wrong translation there only as a one-line additive change, never a restructure.

Load skills: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline).

Quality bar:
- Spanish throughout, Spain register, `tú`. Slugs in Spanish; the shared routes keep their English paths (§1.3). `lang="es"` comes from the registry — do not set it by hand.
- Voice from §11.6. Money in EUR first, PYG second, only through `<Fact>` and `formatMoney`.
- Distinct content, not a hub translation: `/mercosur` and every Mercosur mention render `<Fact k="mercosur.residency_route">`; Spain's 183-day / centre-of-interests rules are hedged as "confírmalo con tu asesor".
- No Guide upsell (§1.11); the newsletter is the soft exit. `/pase-inversor` is a bridge to the English Investor Pass brand and says so.
- Lead form variants `consultation` and `contact`, `site=residenciaes`. Eight `/guias/[hub]/[slug]` articles minimum across the four hubs in §6.6.

Phase rules:
- Branch `phase/s11` off latest main (S6 merged). Re-runnable. Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4. Never hardcode a legal or financial figure (§4.11).

Exit: S3's bar; no English UI string visible on any page (crawl every route and grep the HTML for the English `common.json` values); leads tagged `site=residenciaes`; PR merged.

## After this phase — hand off
Gates: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 entry committed. Then apply the S15 claim rule (§4.12): if S10–S14 are all merged and no `phase/s15` branch exists on origin, push an empty `phase/s15` branch, then call claude-code-remote `create_session` (inherit environment and permission mode, never `plan`; `model` = Sonnet — never Fable, plan §4.8; `prompt` exactly `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.`). Otherwise end with the phase report. Never hand off with a red PR.

# paraguayresidency — project rules

One Next.js app serving seven brands, keyed by `SiteKey`: `residency` (the hub — services, and the only host with `/admin`), `investorpass`, `guide` (the only brand that sells), `frontier`, `residenciaes` (es), `residenciapt` (pt-BR), `flytta` (sv). Read `plan.md` before any work; §1 decisions are locked, §9 is the build log. §14 is the F10 improvement plan (O17–O19 Opus, then S20–S23 Sonnet); `docs/improvement-report.md` is its evidence.

## Domains — CONFIRMED BY ANTON 2026-09-07. Do not infer a domain from a brand name.

Anton owns exactly these, and nothing else for this project:

| Domain | Brand |
|---|---|
| `paraguayresidencyguide.com` | `guide` |
| `paraguayinvestorpass.com` | `investorpass` — brand name "Paraguay Investor Pass" |
| `paraguayfrontier.com` | `frontier` |
| `residenciaparaguay.es` | `residenciaes` |
| `vidanoparaguai.com` | `residenciapt` — brand name "Vida no Paraguai" |
| `flyttatillparaguay.se` | `flytta` |
| `paraguayresidency.co.uk` | `residency` — **the hub** (decided F9); `/admin`, unknown-host redirect target |

He does **NOT** own `paraguayresidency.com` (and it is not buyable), `paraguayinvestorguide.com`,
`residencianoparaguay.com` or `paraguayinvestorpass.com.py`. **Decided by F9 (2026-09-07, plan §1.11,
§12.2): the hub `residency` runs on `paraguayresidency.co.uk`**; `guide` is "Paraguay Residency Guide"
on `paraguayresidencyguide.com`; `residenciapt` is "Vida no Paraguai" on `vidanoparaguai.com`. The
registry named the wrong ones until **phase S16 (2026-09-09) swept it** to the domains above
(`prompts/sonnet-16-domain-sweep.md`, plan §6.11). A domain is three lines per brand in
`src/sites/registry.ts` and costs nothing; a `SiteKey` is a MySQL enum on nine tables and costs a
migration.

- Host → site resolution lives in `src/middleware.ts` (NOT the repo root — Next ignores it there when `src/` exists) + `src/sites/registry.ts` + `src/sites/resolve.ts`. Adding a domain = registry entry + `src/app/sites/<key>/`. Never a second app.
- One locale per brand, set in the registry. No silent English fallback: `npm run verify:i18n` fails on a key missing from any locale or any brand file.
- No legal or financial number in JSX/MDX. Use `<Fact k>` backed by `content/shared/facts.ts` with verification state (per-locale, `en` required).
- Tiers are `none | entry | insider`. `users.tier` is a CACHE — the truth is `effectiveTier()` in `src/lib/entitlements.ts`, computed from `purchases` + `subscriptions`. Never gate on the column. See `docs/platform.md`.
- Stripe sells one-time products, Lemon Squeezy sells subscriptions, `products.provider` routes the checkout. Both webhooks write `webhook_events` before doing anything.
- Leads: local DB row first, CRM/email fire-and-forget. Never let an integration failure fail a form.
- Sonnet phases do not touch schema, auth, API routes, middleware, payments or quiz scoring (plan §6).
- Models: build phases, subagents, spawned sessions and triggers run on Opus or Sonnet only. Fable runs only in windows Anton opens himself; see `.claude/skills/fable-cost-guardrail/SKILL.md`.
- Deploy per the `nextjs-deploy-hostinger` skill; one hosting slot for all domains (plan §1.7).
- The schema is FINAL as of O9 — every column S10–S15 needs already exists. Do not retrofit `src/db/schema.ts`.

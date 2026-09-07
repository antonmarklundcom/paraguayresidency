# paraguayresidency — project rules

One Next.js app serving seven brands: `residency` paraguayresidency.com (hub), `investorpass` paraguayinvestorpass.com.py, `guide` paraguayinvestorguide.com (the only brand that sells), `frontier` paraguayfrontier.com, `residenciaes` residenciaparaguay.es (es), `residenciapt` residencianoparaguay.com (pt-BR), `flytta` flyttatillparaguay.se (sv). Read `plan.md` before any work; §1 decisions are locked, §9 is the build log.

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

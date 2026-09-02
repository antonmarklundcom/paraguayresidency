# paraguayresidency — project rules

One Next.js app serving three brands: paraguayresidency.com (hub), paraguayinvestorpass.com.py (Investor Pass), paraguayinvestorguide.com (paid guide). Read `plan.md` before any work; §1 decisions are locked, §9 is the build log.

- Host → site resolution lives in `middleware.ts` + `src/sites/registry.ts`. Adding a domain = registry entry + `src/app/_sites/<key>/`. Never a second app.
- No legal or financial number in JSX/MDX. Use `<Fact k>` backed by `content/shared/facts.ts` with verification state.
- Leads: local DB row first, CRM/email fire-and-forget. Never let an integration failure fail a form.
- Sonnet phases do not touch schema, auth, API routes, middleware, payments or quiz scoring (plan §6).
- Models: build phases, subagents, spawned sessions and triggers run on Opus or Sonnet only. Fable runs only in windows Anton opens himself; see `.claude/skills/fable-cost-guardrail/SKILL.md`.
- Deploy per the `nextjs-deploy-hostinger` skill; one hosting slot for all domains (plan §1.7).

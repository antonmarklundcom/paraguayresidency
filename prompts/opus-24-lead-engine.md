# Phase O24 — Lead engine, attribution, launch readiness. OPUS session (effort: high). Anton pastes this.

Paste into a fresh Opus 5.5 window: `Read prompts/opus-24-lead-engine.md in this repo and execute it.`

Goal: traffic that trusts the sites and becomes service clients. Every visitor who messages on WhatsApp or submits a
form must reach a person, be traceable to the page that produced them, and nothing may fail silently. The paid guide
and Stripe are NOT in scope this week (leave `FREE_ACCESS_MODE` as is).

## State when you start (2026-09-29) and how to work alongside Sonnet

You may start now, in parallel with the Sonnet builders. Already merged to `main`: PR #87 (WhatsApp bar names the page,
shared `NextSteps` block), PR #89 (28 new intent pages), PR #90 (metadata/structured-data/link-graph test gates, related
guides, breadcrumbs). Still running or to come: A2 (price presentation + trust components, touches `PriceTable`,
`proof.ts`-driven components, service/pricing pages) and a final speed + visual QA sweep. Always `git fetch` and branch
from the latest `origin/main`; rebase before each PR. Do not edit files those builders own (components under
`src/components/{PriceTable,TrustBar,Testimonials,TeamSection,OfficeStrip,Guarantee}*`, `content/**`).

**Step 0 — double-check the Sonnet work before building on it (30–45 min, use a Sonnet-medium subagent for the read-through,
you judge the findings):**
- `NextSteps`, `WhatsApp*`, `MobileBar`: does every WhatsApp click path work with JS off and with the number unset?
  Does `WhatsAppClickTracker` post anything the lead kinds in item 2 can consume? Reconcile with your item 2 contract.
- The new gates in `tests/seo-*.test.ts` and `tests/helpers/render-pages.ts`: do they run in CI time, without a database?
- `src/lib/metadata.ts` Organization/LocalBusiness JSON-LD: nothing invented, address/rating only from `proof.ts`.
- Run the seven-host smoke in a built app yourself; list anything broken as issues to fix in your items.
Write findings to `docs/log/o24.md` "Step 0" and fix what falls inside your ownership; report the rest.

**CI warning:** GitHub Actions has been unreliable this session — the Sonnet PRs showed no check runs, and one run hung on
`npm ci` for 30+ minutes. Do not merge on a red check. If Actions does not start or hangs, run the full
`npm run verify` locally on the merge result, say so in the PR body, and merge; never skip a test. Retry a stuck run once
(re-run API), never with an empty commit. Tell Anton at the end if Actions needs attention (budget/minutes).

Sonnet sessions run on the front-end side (WhatsApp bar, "what happens next" blocks, price
presentation, trust surfaces, metadata/JSON-LD/link gates, speed, visual QA). Do not touch those files; you own the
server, data and ops side below. Rebase on `main` before each PR and after each merge.

Read first: `CLAUDE.md`, `plan.md` §1 and §9 index, `KNOWN-ISSUES.md` (open items), `docs/log/whatsapp-first.md`,
`docs/log/o17.md`, `docs/log/o18.md`, `docs/platform.md`, `docs/decisions-needed.md`, `docs/verify-later.md`.

## Model and effort rules (guardrail v2)

You run on Opus 5.5, effort high. You may spawn subagents with the Agent tool on **Opus or Sonnet only, never Fable**,
at effort low or medium, choosing the cheapest that fits:
- Sonnet, low: mechanical work (tests for existing behaviour, redirects tables, docs, smoke scripts).
- Sonnet, medium: admin views on top of an existing query layer, sitemap/robots tests.
- Opus, medium: anything touching `src/lib/leads.ts`, API routes, `src/proxy.ts`, CSP, logging, the schema.
Payments/auth/middleware/schema code is written by you or an Opus subagent, never Sonnet. Give every subagent an
explicit file list it owns; work in `isolation: "worktree"` when two agents could touch the same file.

## The ten items (in this order; ship in small PRs, one per item or per pair)

1. **Lead pipeline hardening.** Local DB row first, then CRM and email fire-and-forget through a retry queue with
   backoff (a `lead_deliveries` style record, or the existing tables if they already carry status). A failed CRM or
   email never fails the form. Add lead-delivery health to `/api/health` (last success, count failed in 24 h, oldest
   undelivered) and a scripted retry endpoint/CLI. Test with a failing CRM and a failing mail transport.
2. **WhatsApp-first lead capture as its own lead kind.** One field (phone, plus optional name), with source page,
   brand, article slug and A/B variant attached. Works with JavaScript off. Wire the existing
   `WhatsAppClickTracker`. The Sonnet session builds the visible bar and links; you build the server action, the
   `leads.kind` value and the tracking beacon it posts to. Publish the contract in `docs/conversion-core.md`
   (field names) before the Sonnet session needs them.
3. **Attribution and reporting.** Persist UTM, referrer, landing page, brand and first-touch on every lead and send
   them to VenderCRM. Add an `/admin` (hub only) view: leads by brand, page, source, kind, with last-7/30-day counts
   and a CSV export. Use existing attribution helpers in `src/lib/attribution.ts`.
4. **Launch-readiness screen in `/admin`.** One page listing: missing env vars (email, CRM, WhatsApp number,
   Plausible, DB), empty `content/shared/proof.ts` fields, facts `verified:false` count, per-domain DNS/HTTPS
   reachability (a server-side fetch of `/api/health` per registry host with a timeout), and last successful lead
   delivery. Read-only, no secrets displayed.
5. **Host cutover and redirects.** Turn `docs/flytta-redirects.md` into 301s, `www` → apex for all seven hosts,
   unknown-host → hub, and a `scripts/smoke-hosts.mjs` that curls every host (health, robots, sitemap, one page,
   `lang`, redirects) and fails loudly. Tests for the redirect table.
6. **Sitemap and robots correctness per host.** Tests that only the hub serves `/admin`, no host lists another
   brand's URLs, every sitemap URL returns 200 in a built app, `robots.txt` points at the host's own sitemap, AI
   crawler rules and `llms.txt` are per host. Coordinate with the Sonnet metadata gate: you own routes/tests for
   robots and sitemap files; it owns per-page metadata.
7. **Dutch brand foundation.** Follow `docs/design/nl-brand-plan.md`: new `SiteKey` `emigreren` (nl,
   `emigrerennaarparaguay.nl`, alias `woneninparaguay.nl`), the enum migration on every table that carries `site`,
   `nl` locale, registry entry, theme, `verify:i18n` covering `nl`, an `nl` shell with home/contact/pricing stubs
   ready for Sonnet builders. Start it only after items 1–3 are merged. **Write the migration file but do not apply
   it**, and list it in `docs/db-work-later.md` (see below).
8. **Structured logging and error reporting.** `pino`-style JSON logs with request id, host, route, and lead id
   where relevant; a pluggable sink (env-driven; console when unset); server actions and API routes report
   unhandled errors; an admin-visible recent-errors count in the readiness screen. Never log lead PII beyond ids.
9. **CSP enforcing and abuse tests in CI.** Move the CSP from report-only to enforcing after checking
   `/api/csp-report` handling and every page type in a built app (Plausible, WhatsApp, fonts, video). Wire
   `tests/abuse.mjs` into a CI job that boots the built app with no database (skip DB-dependent cases cleanly).
   Keep CI minutes low (see the `budgeted-runner-deploy` skill): one job, cache npm, no matrix.
10. **A/B hook into a real experiment.** Server-side (cookie) assignment for the hero CTA test, variant stored on
    every lead, a variant readout in the `/admin` attribution view with counts and a plain "not enough data yet" rule
    below a sample threshold. No statistics claims.

## Database rule (important)

The schema is FINAL per `CLAUDE.md` except where an item above genuinely needs a column or enum value
(items 1, 2, 3, 7). Prefer existing columns/JSON fields. Where a migration is unavoidable: generate it with
`drizzle-kit`, commit the migration and schema change, keep `npm run verify` green with no database, and **never run
it against a real database**. Record every one in `docs/db-work-later.md`: what, why, the migration file, what to
run (per `docs/runbook.md`; `npm run db:push` or `drizzle-kit migrate`, whichever the runbook names), what breaks if it is not run, and whether the code degrades safely without it. Anton does
the database work later from that file. Code must not crash on a production DB that has not been migrated yet
(feature-detect or guard, degrade to the old behaviour).

## Facts and claims log

Any number, law, timeline, price, guarantee, response-time promise or legal claim you write into copy, tests or
config goes into `docs/verify-later.md` under "Added by Opus O24": the text, file and line, and what Anton must
confirm. Do not invent figures; use a `<Fact>` key with `verified:false` and a source, or omit the number.

## Working agreement

- Branch `phase/o24-<item>` off latest `main`; one PR per item (or pair); PR body lists what changed, how it was
  tested, DB work needed (yes/no), and facts added.
- `npm run verify` green before every push. Do not skip, disable or quarantine a test.
- You create the PRs **and merge them yourself** (squash) once CI is green and there is no conflict; use the GitHub
  MCP tools (there is no `gh`). Then update `main` locally and continue. If CI is red, fix root cause and push; a
  red base you did not cause is ported, not waited on (see the PR rules in your system prompt).
- After each merge add a line to `plan.md` §9 and a short `docs/log/o24.md` entry (what shipped, tests, follow-ups).
- Do not touch Stripe/Lemon Squeezy code, the guide's paid content or its pricing.

## Exit

All ten items merged with `npm run verify` green on `main`; `docs/log/o24.md`, `plan.md` §9, `docs/db-work-later.md`
and `docs/verify-later.md` current; a final report to Anton: what shipped, what needs him (DB migrations to run,
env vars, DNS), and anything deferred with the reason. Report DB work at the very top.

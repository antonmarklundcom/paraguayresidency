# Improvement report — F10 (Fable 5.1, window opened by Anton, 2026-09-11)

State when this was written: every content phase has merged (S3–S5, S10–S14, S16). `npm run verify`
is green on `main` (typecheck, lint, 322 tests, i18n, build). Nothing is live: S6 (PR #13) waits on
hosting, DNS, live Stripe and the imagery CDN allowlist; S15 and F7 wait on S6. The build has
114 pages and 101 MDX files across seven brands.

Method: four read-only audits run as Opus/Sonnet subagents (money/auth/security, SEO/perf/i18n,
funnel/content, engineering hygiene), then every P0/P1 finding re-read by Fable in the source
before it was accepted. The decisions are in `plan.md` §14; this file is the evidence and the
reasoning. Phase ids: O17, O18, O19 (Opus, sequential, first) then S20 (Sonnet, sequential) then
S21, S22, S23 (Sonnet, parallel). S6 → S15 → F7 stay as planned after them.

## 1. What is wrong, ranked

### P0 — would lose money or hand out access (→ O17)

1. **A failed webhook is marked processed, so the retry is a no-op.** `src/lib/webhooks.ts:73-86`
   sets `processedAt` unconditionally, including on the error path. A MySQL blip during
   `checkout.session.completed` answers 500, Stripe retries, we answer `duplicate:true` 200, and the
   buyer is charged with no purchase row, no account, no download. No test covers it.
2. **A missing `SESSION_SECRET` in production yields a forgeable admin session.**
   `src/lib/signing.ts:16-21` falls back to a public literal in any `NODE_ENV`; `login()` refuses to
   mint a session without a strong secret but `currentAdmin()` accepts one sealed with the fallback.
   The same key backs member sessions, magic links and unsubscribe tokens. `.env.example` ships it
   empty and §4.5 makes empty look normal.
3. **`FREE_ACCESS_MODE` works exactly once.** `src/app/api/checkout/route.ts:121` passes the constant
   `providerOrderId:'free-access-mode'`; `purchases_provider_order_uq` is `(provider, providerOrderId)`,
   so the second free buyer gets an uncaught `ER_DUP_ENTRY` 500. It is also an unauthenticated
   "create an account and email a sign-in link to any address" endpoint with no rate limit.

### P1 — fix before real traffic (→ O17, O18)

4. **Lemon Squeezy idempotency collapses recurring events.** `lemonSqueezyEventId` is
   `<event>:<data.id>`; for `subscription_updated` the id is the subscription id, so only the first
   update is ever processed and `effectiveTier` drifts. `order_refunded` is ignored entirely.
5. **Admin tier grants do nothing.** `grantTierUntil` writes `users.tier`, every gate reads
   `effectiveTier()`, and the nightly reconcile overwrites the column. The success message is false.
6. **Two concurrent deliveries of one event both fulfil.** No claim step between insert and handler;
   `fulfilCheckout` has no transaction. Two download tokens and two receipts, or a 500 loop.
7. **No rate limit** on admin login (unlimited bcrypt guesses, CPU DoS on one Node process),
   `/api/subscribe` (re-sends confirmation on every call — inbox bombing), checkout, lead forms. The
   magic-link limiter can be wiped with `attempts.clear()` by spraying 5000 emails.
8. **A database fault loses the lead.** `createLead` re-throws before `deliverLead`; a reachable-but-
   failing MySQL drops the lead and shows the visitor an exception. The no-DB branch already does the
   right thing; the error branch does not.
9. **Console email mode logs full bodies** — magic links (live credentials) and lead PII into the
   Hostinger log, while `sendEmail` reports `ok:true`.
10. `effectiveTier` grants `entry` to a subscription that never paid; member resource downloads
    ignore drip; client-supplied `x-site` survives on passthrough routes; no security headers.

### Performance and SEO (→ O19, S20, S21)

11. **Every page renders per request** because the root layout reads a header for `<html lang>`.
    Site layouts themselves are static, so per-locale route groups with a hardcoded `lang` restore
    static generation for the whole marketing tree without touching middleware. This is the single
    biggest lever for TTFB and crawl budget and it is now cheap: every content phase has merged, so
    the folder move collides with nobody.
12. **`<LeadForm>` hydration costs 760 ms TBT** on every page that embeds it (three phases measured
    0.81–0.86 mobile perf against a ≥0.90 bar). It ships the 276-line country list to the client and
    is never code-split. It is shared conversion machinery, so it is an Opus fix.
13. **Six of seven brands have no article index page** — only `[slug]` routes. No crawlable listing,
    every article has one inbound link. No RSS anywhere.
14. **The SEO length test is looser than the plan's bar** (≤70/≤160 vs ≤60/≤155); 10 titles and
    2 descriptions exceed the real bar today. Three phases found this by hand after CI was green.
15. `frontier`'s three service-style pages emit no `Service` JSON-LD; `residenciapt`'s sitemap
    silently omits `/investor-pass` where `residenciaes` documents the same exclusion.

### Funnel and content (→ S22, S23, and Anton)

16. **The quiz bounces ES/PT/SV visitors to the English hub.** `ROUTE_DESTINATIONS` in
    `src/features/quiz/questions.ts` hardcodes temporary/permanent results to `residency`. Most
    visitors score one of those two. Mid-funnel, in the wrong language.
17. **The hub `/pricing` shows "from USD —"** on every row. The highest-ticket brand has no anchor.
    Real numbers are Anton's (§7); the page can already sell what a fixed fee covers and how quoting
    works, and render the figures through `<Fact>` keys Anton fills in `/admin/facts`.
18. **Zero trust elements anywhere**: testimonials hidden until real ones exist (right), no named
    team, no case study, no process timeline on service pages.
19. **Paid content is the thinnest content on the site.** Member lessons run 170–230 words; the
    flagship "this month's deep dive" Insider is sold on is 226 words. Free articles run 900–1100.
    This is a refund and churn risk, not an SEO one.
20. Five public articles are ~100-word stubs whose titles promise a comparison
    (`is-paraguay-residency-worth-it`, `what-the-investor-pass-is`, `sa-gar-flytten-till`,
    `rutas-de-residencia`, `rotas-de-residencia-…`).
21. `residenciaes` is the only service brand without WhatsApp click-to-chat; `residenciapt` has no
    nav path to `/precos` or `/investor-pass`; `residenciaes`'s differentiators (`/mercosur`,
    `/pase-inversor`) are not in nav or footer; the Insider FAQ hardcodes "$7".
22. Lead forms ask 7–8 fields everywhere; no short WhatsApp-first variant for the LatAm brands.

### Engineering hygiene (→ S20)

23. No `npm audit`, no Dependabot, no Lighthouse job, no migration-drift check in CI. No `engines`
    pin; `@types/node ^20` on a Node 22 runtime.
24. `plan.md` is 1363 lines (141 KB), 725 of them build log; `KNOWN-ISSUES.md` is 405 lines with
    the cleared entries still inline. Every fresh session pays to read both.
25. `subscriptions.ts`, `member-content.ts`, `member-admin.ts`, `metadata.ts`, `subscribers.ts`
    have no direct tests; every existing test is a pure function — no webhook route, no
    `fulfilCheckout` idempotency, no rate limiter, no lead DB-failure path.

### What is solid (no phase needed)

Canonicals, OG images, robots, noindex placement, JSON-LD on articles/FAQ/breadcrumbs/organization,
i18n completeness (168 common keys × 4 locales, 39 brand keys × 7 brands, zero leaks), path-traversal
handling in downloads, Stripe signature verification, the download-token claim, zero broken nav or
footer links across seven brands, `<Fact>` discipline (one incidental "$7" in the whole tree), voice
discipline, the guide sales page and thank-you upsell, env documentation (41 used vars, all
documented), a 4.5 MB repo with no committed screenshots.

## 2. Decisions (Fable, F10) — the reasoning behind plan §14

- **Correctness before anything visible.** O17 and O18 go first because P0 1–3 lose money silently
  and P1 7 is a one-line DoS on a single Node process. They touch payments, auth, middleware and
  `src/lib` — Opus by §4.7, and sequential because O18's limiter wraps O17's routes.
- **Static rendering is worth the folder move now.** O19 moves `src/app/sites/<key>/` under
  `src/app/(<locale>)/sites/<key>/`. URLs, middleware rewrites and file ownership rules are
  unchanged (route groups do not appear in paths). Every later prompt names the new location.
- **The LeadForm rework rides in O19**, not a Sonnet phase: it is shared conversion machinery and its
  fix (server-rendered form that works without JS, lazy hydration, no client country list, Plausible
  events) is the same kind of work as the rendering change.
- **No schema change.** Every fix above is expressible without a migration (webhook claim = in-process
  per-key lock + `SELECT … FOR UPDATE`; admin grant = a real `subscriptions`/`purchases` row; rate
  limits = in-process, acceptable on one process and reset on deploy). CLAUDE.md's "schema is FINAL"
  holds.
- **Sonnet phases fill shapes that exist.** S20 tightens gates and splits the docs; S21 adds index
  pages, RSS, nav values and JSON-LD; S22 fixes the funnel with data changes and copy; S23 writes
  words. None touches `src/lib`, `src/app/api`, middleware, schema or `scoring.ts` — `questions.ts`
  is explicitly opened to S22 for its destination table only.
- **S20 runs before the parallel three** because it rewrites frontmatter (title trims) and the §9
  log format; running it concurrently with S23's body rewrites invites the one conflict class the
  method forbids.
- **Prices and testimonials are Anton's, not a phase's.** S22 builds the pricing page so that the
  numbers are `<Fact>` keys Anton fills in `/admin/facts`; testimonials stay hidden until §7 delivers
  them. No phase invents a figure (§1.10).
- **Design uplift is a later, separate track.** `docs/design-prompts.md` gives Anton one Claude
  Design prompt per brand. Once he picks canvases, one Sonnet phase per brand ports them (Backlog
  "S24+"); nothing in S20–S23 waits on that.
- **S6 → S15 → F7 are unchanged** and still gated on Anton's §7 items. They can run as soon as he
  clears hosting, DNS, Stripe live and the `*.cloudfront.net` allowlist — before or after S20–S23;
  the only ordering rule is that S15 runs after O19 merges (it deploys the moved tree).

## 3. What only Anton can do (unchanged from §7, restated because it gates everything visible)

Hosting slot + attach seven domains (or the VPS fallback), DNS, `SESSION_SECRET` and every real env
value, Stripe live keys + one real purchase and refund, Lemon Squeezy live keys, Search Console ×7,
the `*.cloudfront.net` allowlist for imagery, real package prices for `/pricing` (typed into
`/admin/facts` after S22), the real Guide PDF, testimonials with consent, lawyer verification of
`facts.ts`. And, new: pick a canvas per brand from `docs/design-prompts.md` when he wants the uplift.

## 4. Expected cost and order

| Phase | Model | ≈ session | Runs |
|---|---|---|---|
| O17 money & auth correctness | Opus | 60–90 min | first; Anton pastes |
| O18 abuse & ops hardening | Opus | 45–75 min | spawned by O17 |
| O19 rendering & LeadForm performance | Opus | 60–90 min | spawned by O18 |
| S20 quality gates & repo hygiene | Sonnet | 45–60 min | spawned by O19 |
| S21 SEO surfaces | Sonnet | 60–90 min | spawned by S20, parallel |
| S22 funnel fixes | Sonnet | 60–90 min | spawned by S20, parallel |
| S23 content depth (fan-out) | Sonnet | 60–90 min | spawned by S20, parallel |

Three Opus + four Sonnet sessions. Fable: this window only. F7 stays the launch review.

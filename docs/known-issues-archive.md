# Known issues archive

## CLEARED in O17 — the P0s and P1s of `docs/improvement-report.md` §1.1–1.6

Items 1–6 are fixed on `phase/o17`, plus the two halves of item 10 that are
O17's: the webhook retry, the claim before processing, the production
weak-secret refusal, the Lemon Squeezy idempotency key and `order_refunded`,
admin grants as rows, the `FREE_ACCESS_MODE` order id, never-paid
subscriptions, and the resource download's drip gate. Items 7–9, and item 10's
`x-site` spoof and security headers, are O18's.

## CLEARED in O2 — migrate + seed ran against a real MySQL

O1 deferred "schema migrated on a local/remote MySQL and seed idempotent (run
twice)" because the container had no MySQL and no Docker. O2 found `apt-get`
could install MariaDB 10.11 locally and ran it:

```
npx drizzle-kit migrate     # applied drizzle/0000_green_lord_hawal.sql cleanly
npm run db:seed             # created admin, product, 7 facts
npm run db:seed             # "already present" / upserted — nothing inserted twice
```

Row counts after two runs were exactly the expected 1 / 1 / 7, and
`/api/health` reported `db: "ok"`. The whole O2 exit checklist then ran against
that database.

One fix came out of it: `npm run db:seed` is now
`tsx --env-file-if-exists=.env scripts/seed.ts`. `tsx` does not read `.env` on
its own (a named trap in the `nextjs-deploy-hostinger` skill), so the old
script reported "DATABASE_URL is not set" even with a correct `.env` present.

Still open for S6: the same run against the **Hostinger** MySQL, over Remote
MySQL with the deploy IP whitelisted.

## CLEARED in O2 — `private/guide-placeholder.pdf` now exists

`scripts/seed.ts` defaults `products.file_key` to `guide-placeholder.pdf`. O2
needed the file to prove the download path end to end, so it ships a one-page
stand-in now rather than waiting for S5. S5 replaces it with the outline
placeholder (plan §6.3); Anton supplies the real PDF (plan §7). `.gitignore`
now allows only the README and the placeholder out of `private/`, so a real
guide PDF dropped in there can never be committed by accident (plan §12).

## O2 — no rate limit on the public endpoints — **CLEARED in O18**

> Superseded by "CLEARED in O18 — the public endpoints are rate limited" at the
> end of this file. Kept for the reasoning; the per-IP middleware limit it asks
> for now exists.

The honeypot and the signed timing token stop bots; they do not stop someone
deliberately hammering `/api/subscribe` or a lead form from one address. The
CRM rate-limits at 60/min per site and answers 429, which we log. A per-IP
limit in middleware is worth adding before the sites carry paid traffic —
Backlog, not a launch blocker.

## O9 — no rate limit on the public endpoints (narrowed) — **CLEARED in O18**

> Superseded by "CLEARED in O18 — the public endpoints are rate limited" at the
> end of this file.

O2's note stands for `/api/subscribe` and the lead forms. `POST /api/auth/magic`
is now rate limited in-memory (5 per 15 minutes per email and per IP), which is
correct on one Node process but resets on every deploy and does not survive a
move to more than one process. Worth revisiting with the same per-IP middleware
limit O2 put in Backlog.

## CLEARED in S16 — the brand↔domain map was wrong; F9 (2026-09-07) decided the fix, S16 (2026-09-09) applied it

S16 swept `src/sites/registry.ts`, `.env.example`, `src/lib/email.ts`, the page copy and tests below
to the domains in the "Reality" column: hub → `paraguayresidency.co.uk`, `guide` →
`paraguayresidencyguide.com` ("Paraguay Residency Guide"), `investorpass` → `paraguayinvestorpass.com`,
`residenciapt` → `vidanoparaguai.com` ("Vida no Paraguai"). The grep for every old host/name in
`prompts/sonnet-16-domain-sweep.md` came back empty (outside `plan.md`'s history and the two prompt
files it deliberately keeps as-is).

Confirmed by Anton on 2026-09-07, after O9 and S3–S5 had already merged. F8 locked §1.11 / §12.2 on
domains he does not own.

| Brand | Code says | Reality |
|---|---|---|
| `residency` (the hub) | paraguayresidency.com | **not owned, not buyable — no domain at all** |
| `guide` | paraguayinvestorguide.com | `paraguayresidencyguide.com` |
| `investorpass` | paraguayinvestorpass.com.py | `paraguayinvestorpass.com` |
| `residenciapt` | residencianoparaguay.com | `vidanoparaguai.com`, renamed **Vida no Paraguai** |
| `frontier`, `residenciaes`, `flytta` | — | correct |
| — | (absent from the plan) | **`paraguayresidency.co.uk` is owned** — hub candidate, or a UK brand |

The hub is the one that is not a typo: it is the primary SEO surface, the only host serving
`/admin`, and the redirect target for any unknown host. S3 built 17 pages and 8 articles for it.
Resolving that is a business decision, which is why it is a Fable phase and not a sweep.

**Nothing else may run first.** S10–S14 write footer cross-links and article text naming sibling
domains, so starting them now means fixing five brands' content instead of one registry file.
S6's PR #13 is open and unmerged; S10–S15 have not started. That is the correct place to be paused.

**F9 decided (plan §1.11, §12.2):** the hub is `paraguayresidency.co.uk`; `guide` is
`paraguayresidencyguide.com` as "Paraguay Residency Guide"; `investorpass` is the `.com`;
`residenciapt` is `vidanoparaguai.com` as "Vida no Paraguai". No SiteKey changes. The sweep is
phase S16 (`prompts/sonnet-16-domain-sweep.md`, plan §6.11), which Anton pastes into a Sonnet
window; S16 then spawns S10–S14. S6 is re-run by Anton after S16 with the amendment at the top of
its prompt. S16 retitles this entry "CLEARED" when its grep comes back empty.

Cost of the fix, once F9 decides: domains are three lines per brand in `src/sites/registry.ts` plus
three page files, ~6 test files and two docs. **No schema change** — `SiteKey`s are unaffected as
long as F9 changes only what a key points at. Renaming or removing a key WOULD be a migration,
because `siteEnum` mirrors `SITE_KEYS` on nine tables.

## FIXED in S14 — a latent "use server" export bug in `src/app/actions/lead.ts`, surfaced by the new member routes

`src/app/actions/lead.ts` (O2) exported two plain objects — `initialLeadState` and
`initialSubscribeState` — from a `'use server'` module, alongside its actual server actions. Next's
own rule is that a `'use server'` file may export **only async functions**; the objects are
`useActionState` seed values, not actions. This was already wrong when O2 wrote it, but `npm run
build` never caught it and every page rendered fine — until S14 added a third `'use server'` file
(`src/app/sites/guide/members/[module]/[lesson]/actions.ts`, the lesson "mark complete" action).
Turbopack's chunk graph changed enough that the pre-existing violation started throwing at request
time only: `Error: A "use server" file can only export async functions, found object`, a 500 on
every page in the chunk, every time. Build-time (`next build`) still shows nothing wrong — the
failure is `next start` / the standalone server actually evaluating the chunk — so this could not
have been caught by `npm run verify` alone; it took clicking "Mark complete" against a real
database to reproduce.

**Fix:** moved the two `const` objects (and their `LeadFormState`/`SubscribeFormState` interfaces)
out of `lead.ts` into a new plain module, `src/app/actions/lead-state.ts` (no `'use server'`).
`lead.ts` now exports only its two async actions; `LeadFormFields.tsx` and
`NewsletterFormFields.tsx` import the initial state from the new file and the actions from the old
one. No behavioural change to `createLead`/`subscribe`/the CRM pipeline — `leads.ts` itself was not
touched, and this was flagged as necessary rather than optional because S14's own exit criterion
("mark complete" working) could not pass with the platform in this state. `npm run verify` and a
Playwright-driven click-through against a real MariaDB both confirm the fix; 322 existing tests
still pass unchanged.

**Lesson for later phases:** a `'use server'` file's export shape is not checked by `next build` in
this Next 16 / Turbopack setup — only exercised at runtime, and only once something changes how
that specific chunk gets bundled. Grep for `'use server'` files and confirm every top-level export
is an `async function` before assuming a green `npm run verify` proves server actions work.

## CLEARED in O18 — the public endpoints are rate limited

Closes the O2 entry ("no rate limit on the public endpoints") and the narrowed
O9 one. Every limit now goes through O17's `src/lib/rate-limit.ts` and is listed
in one table, `LIMITS`, with `docs/runbook.md` describing each: admin login
5/15 min per IP **and** email with a fixed ~250 ms failure delay, `/api/subscribe`
3/hour per address and 20/hour per IP, `/api/checkout` 10/hour per IP, the lead
actions 10/hour per IP, `/api/auth/magic` 5/15 min per email **and** IP, and a
coarse 120/min per IP over every `POST /api/*` in `src/middleware.ts`. A pending
newsletter address is mailed at most once an hour, which is the actual
inbox-bombing fix.

What is NOT cleared, and stays as O2 and O9 wrote it: the limiter is one `Map`
in one Node process. A deploy resets every window and a second process would
double every limit. That is acceptable for abuse friction and is why nothing in
this file is used as an entitlement; the DB-backed answer is the `rate_limits`
table in the plan's Backlog, and it is only worth building if the app is ever
scaled past one process.


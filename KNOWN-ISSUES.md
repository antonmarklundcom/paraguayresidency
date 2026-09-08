# Known issues

Non-blocking findings. Each entry names the phase that found it and, where it
matters, the phase that should clear it.

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

## O1/O2 — `/pricing` and `/about` are still not built

O2 filled `/route-finder`, `/route-finder/result`, `/contact` (all three
brands), `/book` (hub) and the guide's `/thank-you`, `/confirm`,
`/unsubscribe`. The nav and footer in `src/sites/registry.ts` still point at
`/pricing` and `/about`, which S3–S5 build. Not a bug — noted so nobody
re-diagnoses it as a routing fault.

The pages O2 shipped are conversion machinery in plain brand styling; their
bodies live in `src/lib/conversion-pages.tsx`. S3–S5 are expected to restyle
them inside their brand. The wiring (`LeadForm`, `Quiz`, the server actions)
is off-limits to Sonnet phases (plan §6).

## CLEARED in O2 — `private/guide-placeholder.pdf` now exists

`scripts/seed.ts` defaults `products.file_key` to `guide-placeholder.pdf`. O2
needed the file to prove the download path end to end, so it ships a one-page
stand-in now rather than waiting for S5. S5 replaces it with the outline
placeholder (plan §6.3); Anton supplies the real PDF (plan §7). `.gitignore`
now allows only the README and the placeholder out of `private/`, so a real
guide PDF dropped in there can never be committed by accident (plan §12).

## O1 — themes use system/serif font stacks, not `next/font`

Plan §5.1.5 allows up to two `next/font` typefaces per theme. O1 ships CSS font
stacks (`--display-font`, `--body-font`) so the token plumbing is in place
without committing to a typeface the design phases have not chosen yet. S3–S5
swap in `next/font` faces by redefining those two variables per theme — no
component changes needed.

## O2 — `output: 'standalone'` moves the working directory

`next.config.ts` sets `output: 'standalone'`, and the standalone server runs
with its cwd inside `.next/standalone/`. Anything resolved from
`process.cwd()` is therefore wrong in exactly the environment that matters.
This bit the download endpoint during O2 verification: `private/` was not
found and every download answered 503.

Fixed in `privateRoot()` (`src/lib/download-policy.ts`), which now honours an
explicit `PRIVATE_DIR`, then tries `<cwd>/private`, then the repo root as seen
from `.next/standalone/`. **S6 must still copy `private/`, `public/` and
`.next/static` into the release next to `server.js`** — the standalone bundle
does not include them — or set `PRIVATE_DIR` to wherever the files live.

O2 verified behaviour against `next start`. Whether the Hostinger slot runs
`next start` or `node .next/standalone/server.js` is S6's call; if it is the
latter, re-run the download check after the first deploy.

## O2 — Stripe was exercised with a locally-signed webhook, not a live test purchase

There is no Stripe test key in this environment, so O2 could not click through
the hosted Checkout page. Everything on our side of that boundary was verified
end to end against a real database: a correctly signed
`checkout.session.completed` produces a paid order, a download token and a
purchase email; a replay is idempotent; a bad or missing signature is refused
with 400; an unpaid session is ignored; the 5th download succeeds and the 6th
is refused; expired, unknown and refunded cases all answer correctly.

**What is left for whoever has the keys (S6, or Anton earlier):** set
`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_GUIDE_PRICE_ID`, point
`stripe listen --forward-to localhost:3000/api/stripe/webhook` at the app, and
buy the guide once with test card `4242 4242 4242 4242`. The plan already
schedules the live purchase and refund for S6.

## O2 — no rate limit on the public endpoints

The honeypot and the signed timing token stop bots; they do not stop someone
deliberately hammering `/api/subscribe` or a lead form from one address. The
CRM rate-limits at 60/min per site and answers 429, which we log. A per-IP
limit in middleware is worth adding before the sites carry paid traffic —
Backlog, not a launch blocker.

## O9 — pages render per request now, because `<html lang>` is per host

`src/app/layout.tsx` reads the `x-site` header to set `<html lang>`. It has to
happen there: `<html>` exists only in the root layout, while a brand's language
is a property of the host (plan §1.3). Reading a header makes the whole tree
dynamic, so every page route that used to prerender (`○`) is now server-rendered
on demand (`ƒ`). Sitemaps, robots and the OG images are unaffected.

For this app that is a real but modest cost — one always-on Node process, no
build-time database, MDX read from disk — and it buys correct `lang` on the
Spanish, Portuguese and Swedish brands, which matters more for SEO than TTFB
does at launch traffic.

**If S6 wants static generation back**, the fix is multiple root layouts: one
route group per locale (`src/app/(en)/`, `(es)/`, `(pt)/`, `(sv)/`) with each
brand's folder moved under the group for its locale, and each group's
`layout.tsx` hardcoding its own `lang`. Next allows this when the top level of
`app/` contains only route groups. It was **not** done in O9 because it moves
`src/app/sites/<key>/` — the path every S3–S15 prompt and plan §4.12 names — and
that churn is not worth paying before there are real Core Web Vitals numbers to
weigh it against.

## O9 — `purchases.amount_cents` from pararesi is not yet confirmed

pararesi's column is `purchases.amount_usd int`, and its name does not say
whether a $7 order is stored as `7` or `700`. Being wrong by 100× would be the
worst import bug available, so `scripts/import-pararesi.ts` never guesses
silently: `PARARESI_AMOUNT_UNIT=cents|dollars` forces the reading, and the
default heuristic (under 100 = dollars) reports every row it applied to in the
`--dry-run` warnings.

**S15 must run `npm run import:pararesi -- --dry-run` against the real database
and set `PARARESI_AMOUNT_UNIT` explicitly before the real run.** The dry run
prints the answer: a $7 tripwire showing `700` means cents.

## O9 — Lemon Squeezy was exercised with a locally-signed webhook, not a live sale

Exactly the same position O2 left Stripe in, and for the same reason: there is
no Lemon Squeezy store or key in this environment. Everything on our side of
that boundary is verified end to end against a real MariaDB — a correctly
signed `subscription_created` creates the member, the subscription row, the
provider-customer link and the `insider` tier; `cancelled` keeps access to the
end of the paid period; `expired` decays to `entry`; `resumed` restores; a
replay is a 200 no-op; a bad signature is 401.

**What is left for whoever has the keys (S15, or Anton earlier):** set
`LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`,
`LEMONSQUEEZY_INSIDER_VARIANT_ID` and `LEMONSQUEEZY_WEBHOOK_SECRET`, re-run
`npm run db:seed` (the Insider product activates itself once the variant id is
set), point the LS webhook at `/api/lemonsqueezy/webhook`, and buy the
membership once in test mode.

## O9 — `/insider` is referenced but not built

`requireTier('insider', …)` redirects an under-tiered member to `/insider`,
which S14 builds (plan §6.9). Until then that path 404s on the guide brand. It
is only reachable by a member who is signed in and tries to open Insider-only
content, and O9 ships no such content, so nothing can reach it yet.

## O9 — no rate limit on the public endpoints (still open, narrowed)

O2's note stands for `/api/subscribe` and the lead forms. `POST /api/auth/magic`
is now rate limited in-memory (5 per 15 minutes per email and per IP), which is
correct on one Node process but resets on every deploy and does not survive a
move to more than one process. Worth revisiting with the same per-IP middleware
limit O2 put in Backlog.

## S5 — Stripe was exercised with a locally-signed webhook, not a live test purchase from the sales page

Same position O2 and O9 left Stripe/Lemon Squeezy in, for the same reason: there is no
`STRIPE_SECRET_KEY` in this environment, so the hosted Checkout page cannot actually be opened
from `paraguayinvestorguide.com`'s new sales page. Everything on our side of that boundary is
verified end to end against a real MariaDB: the price renders correctly from the live `products`
row ($7.00 in this run), `CheckoutButton` correctly reports `enabled: false` and shows "Checkout
opens shortly" rather than opening a checkout that cannot complete (plan §4.5), the Product+Offer
JSON-LD carries the same live price, and the existing signed-webhook fixture tests (unchanged by
this phase) still cover `checkout.session.completed` → paid purchase → download token → email.

**What is left for whoever has the keys (S6, or Anton earlier):** set `STRIPE_SECRET_KEY` /
`STRIPE_WEBHOOK_SECRET` / `STRIPE_GUIDE_PRICE_ID`, then buy the guide once from
`paraguayinvestorguide.com`'s live sales page with test card `4242 4242 4242 4242` and confirm
`/thank-you` resolves the download link. The plan already schedules the live purchase and refund
for S6.

## S4 — Lighthouse mobile perf on pages that embed `<LeadForm>` scores below the plan's ≥90 bar in this build container

Re-running S3's own exit check in this session's fresh container (`npx lighthouse`
against Chromium at `/opt/pw-browsers`, mobile preset, default throttling)
gives `paraguayresidency.com`'s home page (no lead form) 0.90 performance, but
`/residency/temporary-residency` (has `<LeadForm>`, S3's own merged page) comes
back at 0.84 — below the bar S3's PR claimed. Investor Pass's home page (which
embeds `<LeadForm>` inline, per plan §6.2) scores 0.81 for the same reason:
`total-blocking-time` (760ms) is the only failing sub-metric; LCP, CLS and
Speed Index are all perfect. `LeadFormFields.tsx` is a `'use client'` component
(server actions, `useActionState`) shared by every brand's every form — its
hydration cost is a platform-wide characteristic from O1/O2, not something S3
or S4 introduced, and it is off-limits to Sonnet phases to rework (plan §4.7,
§6: shared conversion machinery). SEO scores 1.0 on every page checked. Most
likely explanation is measurement-method variance between this container's
Lighthouse CLI run and whatever S3 used, not a real regression — but it means
neither S3's nor S4's ≥90 perf claim reproduces here for any page carrying a
lead form. Left for S6 (which owns the deploy + imagery + performance pass) or
Anton to re-measure against the real hosting target rather than re-litigated
here.

## BLOCKER — the brand↔domain map is wrong; DECIDED by F9 (2026-09-07), S16 executes it before S10–S15

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

## O9 — pararesi appears never to have been deployed

Its own plan marks Phase 8 (deploy) "⛔ Owner-blocked, not started" — no Hostinger slot, no domain,
no live Lemon Squeezy store, and its `.env.example` still has `APP_URL=http://localhost:3000`.

If that is right, §1.13's "existing subscribers stay there" and §12.3's member/purchase/subscription
import are pointed at an empty database: there is nothing to migrate, and Insider is a new product
launch rather than a cutover. O9's import script is written, tested and idempotent either way, so
this costs nothing — but **S15 should re-scope its "real run" from a migration to a verification**,
and Anton should confirm before anyone plans around live pararesi subscribers.

**Folded in by F9:** plan §1.13, §6.10.3, §7 and §12.3 now say verification, expected zero rows,
import only if the dry run finds any. The Insider tier is a new product launch. Anton's one-word
confirmation is a §7 row; S15 is correct under either answer.

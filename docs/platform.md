# The platform — tiers, providers, brands

Written in O9 (plan §5.4). This is the file to read before touching anything
under `src/lib/entitlements.ts`, `src/lib/member-auth.ts`, `src/lib/purchases.ts`,
`src/lib/subscriptions.ts` or `src/db/schema.ts`. **Sonnet phases may not edit
any of them (plan §4.7).**

## 1. Seven brands, one app

| Domain | SiteKey | Locale | Money | Sells |
|---|---|---|---|---|
| paraguayresidency.com | `residency` | en | USD | — (the hub; also hosts `/admin`) |
| paraguayinvestorpass.com.py | `investorpass` | en | USD | — |
| paraguayinvestorguide.com | `guide` | en | USD | `guide-entry`, `guide-insider` |
| paraguayfrontier.com | `frontier` | en | USD | — |
| residenciaparaguay.es | `residenciaes` | es | EUR, PYG | — |
| residencianoparaguay.com | `residenciapt` | pt-BR | BRL, USD, PYG | — |
| flyttatillparaguay.se | `flytta` | sv | SEK, USD | — |

A brand is a row in `src/sites/registry.ts` plus a folder under
`src/app/sites/<key>/`. The host decides the brand; `src/middleware.ts` rewrites
into the folder and 404s any direct `/sites/...` request, so every page has
exactly one public URL.

### Adding the eighth domain

1. Add the `SiteKey` to the union **and** to `SITE_KEYS`, in the same order.
2. Add the same key, in the same position, to `siteEnum` in `src/db/schema.ts`,
   and generate a migration — the `site` column is an enum, so a brand MySQL has
   never heard of makes every insert for it fail at runtime.
   `tests/schema-sites.test.ts` fails until the two lists match.
3. Add the registry entry: apex + `www.` + `<key>.localhost` hosts, the apex as
   `canonicalHost` and as `crm.source`, a `locale`, `currencies`, `theme`,
   siblings, and `products` only if it sells something.
4. Add `src/styles/themes/<key>.css` and import it in `src/app/globals.css`.
5. Add `src/i18n/messages/<locale>/<key>.json` with the same key set as the
   other brand files, and a locale folder with a complete `common.json` if the
   locale is new. `npm run verify:i18n` fails until both are true.
6. Add the folder `src/app/sites/<key>/` (layout, page, not-found, sitemap,
   opengraph-image) and at least one MDX file under `content/<key>/`.
7. Add the brand to `staticPaths` in `src/lib/seo-files.ts` and to
   `contentHref` in `src/lib/site-pages.tsx` — both are exhaustive switches, so
   TypeScript will tell you.

## 2. Tiers

The vocabulary is `none | entry | insider` and it is the same on every brand
(plan §1.12).

- **`entry`** — a one-time low-ticket purchase. The $7 Guide today.
- **`insider`** — the recurring membership.
- High-ticket residency and Investor Pass work is a **service, not a tier**. It
  is a lead. Nothing is ever gated on it.

`insider` outranks `entry` outranks `none`. Content carries `min_tier` of
`entry` or `insider` — `none` is not a floor anything can require.

### `users.tier` is a cache

The truth is `effectiveTier()` in `src/lib/entitlements.ts`, computed from
`purchases` + `subscriptions` on every request. The column is a denormalised
copy for the admin list and for queries, written by every webhook and by
`scripts/reconcile-tiers.ts`. **Never gate access on the column.**

The rules, in order:

1. `insider` while any subscription is `active`, `past_due` or `paused`.
2. `insider` while a `cancelled` or `expired` subscription is still inside
   `ends_at` (or `current_period_end`) **plus a 3-day grace**. A cancellation is
   not an end date: someone who cancels on day 2 keeps the month they paid for.
3. Otherwise `entry` if they ever paid for anything — including a lapsed
   Insider, who decays to `entry` and **not** to `none`, because they keep what
   they bought.
4. Otherwise `none`.

A refunded purchase grants nothing, and `markRefunded()` recomputes the tier
immediately rather than waiting for the nightly job.

### Drip

`modules.drip_days` and `lessons.drip_days` are offsets from `firstEntitledAt`
— the member's earliest paid row, so someone who returns after a year does not
restart at lesson one. `isUnlocked()` requires **both** the tier and the drip.

### Reconcile

`npm run reconcile:tiers` recomputes every member's cached tier and records the
run in `cron_runs`. Webhooks are the fast path and they are not reliable enough
to be the only path — a delivery can be lost, and a subscription can lapse with
no event at all. Run it nightly.

## 3. Two providers, one set of tables

`products.provider` decides the checkout (plan §1.13):

| | Stripe | Lemon Squeezy |
|---|---|---|
| Sells | one-time products | subscriptions |
| Checkout | `createCheckoutSession` (`src/lib/stripe.ts`) | `createLemonSqueezyCheckout` (`src/lib/lemonsqueezy.ts`) |
| Webhook | `/api/stripe/webhook` | `/api/lemonsqueezy/webhook` |
| Signature | `Stripe-Signature`, HMAC over `t.payload` | `X-Signature`, HMAC over the raw body |
| Writes | `purchases` | `purchases` and `subscriptions` |

Neither uses an SDK. Both are `fetch` plus a pure signature function, so the
tests build their own fixture and `npm run verify` needs no key and no network.

### Both webhooks follow the same four steps

1. Read the **raw** body. The signature covers the exact bytes sent.
2. Verify the signature **before parsing**. A bad one is 400/401 and nothing is
   stored.
3. Insert `webhook_events` **before doing any work**. A duplicate that was
   already processed answers 200 and does nothing. A duplicate that was *not*
   processed — the previous attempt failed — runs again, because a lost retry
   would drop a real purchase for good.
4. Handle inline, mark the event processed, answer 200. A 500 is reserved for
   faults worth retrying.

The Lemon Squeezy idempotency key is `<event_name>:<resource id>`; LS does not
send a delivery id on every event.

### After any paid event

`fulfilCheckout()` (one-time) or `handleLemonSqueezyEvent()` (recurring) will:
find or create the `users` row by email, link `provider_customers`, write the
purchase or subscription, then call `refreshUserTier()` — which recomputes the
cache from the rows rather than setting it from the event. A buyer gets the
receipt plus a sign-in link; a new Insider also gets a welcome email, once, on
the transition into the tier.

### Missing keys never block (plan §4.5)

No `LEMONSQUEEZY_*` ⇒ `guide-insider` is seeded **inactive**, the checkout
answers 503 `checkout-unavailable`, and the button renders "Insider opens
shortly". The same for Stripe. Nothing crashes and nothing half-completes.

## 4. Member auth

Passwordless (plan §1.15). A $7 buyer never sets a password: the email a
processor gives us is the identity, and a signed single-use link is the
credential.

- `POST /api/auth/magic` — rate limited, **always 200**. Anything else makes it
  an oracle for "does this address have a membership".
- `GET /api/auth/magic/[token]` — 30-minute TTL, single use. The watermark is
  `users.last_login_at`: a link issued before the last successful sign-in is
  spent, so nothing has to be stored or cleaned up.
- `GET /api/auth/logout`.

The member session is a **different cookie with a different secret** from the
admin session. A member cookie unseals to nothing when read as an admin one, and
`requireRole` rejects the empty session; the admin login separately refuses any
non-staff role. `tests/member-session.test.ts` asserts all of it.

`/login` and `/members` are mounted **only** on brands whose registry entry
lists `products`. On the other six the resolver returns `blocked` — a 404, not a
redirect, because a redirect would advertise a member area that does not exist.

## 5. Member content

Bodies are MDX on disk (plan §1.14); the database holds only what needs
querying — ordering, `min_tier`, drip offsets, progress.

- Lessons: `content/<site>/members/<module>/<lesson>.mdx`
- Updates: `content/<site>/updates/<slug>.mdx`

`members` and `updates` are **reserved hubs** in `src/content/index.ts`.
`getPages()` skips them and `getPage()` refuses them, so member content is never
walked into a sitemap or served at a public URL by guessing a path. It is read
by `content_path`, after a tier check, in a server component only.

## 6. Locales

One locale per brand, set in the registry (plan §1.3). There is no `/es/` path
prefix and no runtime switch — the host decides the language.

`messagesFor(site)` loads `messages/<locale>/common.json` plus the brand's own
file. **There is no silent English fallback**: a key missing from `es` renders
the key in development and nothing in production, and `npm run verify:i18n`
refuses to let that reach a build. It enforces three things:

1. every locale's `common.json` has exactly `en`'s key set;
2. all seven brand files have the same key set as each other;
3. every literal key referenced in `src/` or `content/` resolves.

Content and service slugs are written in the brand's locale; the shared
conversion and legal routes keep their English paths on every brand
(`/route-finder`, `/contact`, `/login`, `/members`, `/privacy`, …) so O2's
wiring and the cross-brand deep links never change.

`src/lib/money.ts` formats minor units per locale and knows PYG has none —
50,000 guaraníes is `50_000`, not `5_000_000`.

## 7. Facts

Unchanged rule (plan §1.10): no legal or financial number is written in JSX or
MDX. `content/shared/facts.ts` carries `display` and `hedged`, now per locale
with `en` required, and `<Fact k="…" site={site}/>` picks the brand's language.
MDX gets `site` bound for it, so an author writes only `<Fact k="…" />`.

Unlike the i18n layer, facts **do** fall back to English: a fact is a legal
statement, and a correct English sentence beats a blank space.

## 8. Rendering note

`src/app/layout.tsx` reads the `x-site` header to set `<html lang>`, because
`<html>` exists only in the root layout while the language is a property of the
host. That makes every page render per request. If static generation is wanted
back, the fix is multiple root layouts — one route group per locale
(`src/app/(en)/`, `(es)/`, …) with the site folders moved under them. That
changes the paths every S3–S15 prompt names, so it was left for S6 to weigh
against real Core Web Vitals numbers. See `KNOWN-ISSUES.md`.

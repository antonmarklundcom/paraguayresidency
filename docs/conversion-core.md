# Conversion core (O2, updated in O9) — how a lead, a purchase and a subscriber flow

Written for whoever touches this next. Plan §5.2 is the spec; this is the map.
O9 renamed `orders` to `purchases`, added a second payment provider and gave
buyers an account — the member platform itself is documented in
`docs/platform.md`, which this file assumes you have not read yet only for the
parts below.

## Leads

```
<LeadForm variant=…>            server: i18n labels + a signed timestamp
  └ <LeadFormFields>            client: useActionState
      └ submitLeadAction        server action — holds every secret
          └ createLead()        src/lib/leads.ts
              1. form guard     honeypot (silent) + signed timing token
              2. zod validate   src/lib/lead-schema.ts
              3. dedupe key     sha256(site|phone digits|hour)   [O9]
              4. INSERT leads   ← the source of truth
              5. lead_events    'created'
              6. CRM push       fire-and-forget, status onto leads.crm_status
              7. emails         notification to Anton + auto-reply
```

**The rule that outranks the others:** step 3 is the source of truth. Steps 5
and 6 record their outcome on the row and in `lead_events`; neither can fail
the visitor's submission (plan §1.6). A CRM outage produces
`crm_status='failed'` and a **Retry** button in `/admin/leads`, never an error
page. `tests/leads-flow.test.ts` asserts this against a CRM that refuses
connections and one that answers 500.

`crm_status` values: `sent`, `failed` (a real rejection — retry it),
`pending` (nothing was attempted yet: the CRM is unconfigured, or the lead
carries no phone, which the CRM requires as the contact identity).

### Attribution and double submits (O9, ported from flytta — plan §5.4.7)

`leads.utm` holds **last touch** — the query string on the page they submitted
from. `leads.attribution` holds **first touch** — the utm set, landing path,
referrer and first-seen from the `vc_attr` cookie, i.e. the session that
actually earned the lead. The CRM contact is credited to first touch. The
cookie is visitor-controlled, so `parseAttribution` is an allowlist with a
length cap and treats anything malformed as no attribution.

`leads.dedupe_key` is `sha256(site|phone digits|hour bucket)` behind a unique
index. A second click inside the window collapses onto the first lead, records
`duplicate.suppressed` on it in `lead_events`, and shows the visitor the same
success state. The **site** is in the key because the same person enquiring on
two brands is two leads for two teams. A lead with no usable phone gets a NULL
key and is never merged with anything.

### Delivery queue (O24, item 1)

Steps 6 and 7 above are now **first attempts**, not the only ones. Right
after the lead row, `createLead` opens one `lead_deliveries` row per channel
(`crm`, `notify`, `autoreply` — the last only when the visitor gave an email)
in `pending`, then attempts each and records the outcome
(`src/lib/lead-delivery-policy.ts`):

| Outcome | Row becomes | Next |
|---|---|---|
| delivered | `sent` | done |
| CRM 5xx, timeout, refused; mail transport error | `failed` | retried after 1, 5, 30, 120, 360, 1440 min |
| 7th failure, or a 4xx the CRM will always answer (not 408/429) | `dead` | shown in `/admin/leads`; the per-lead Retry still works |
| CRM or mail not configured, no phone | `skipped` | replayed only on request (`includeSkipped`) |

The queue runs from three places, all calling `runLeadDeliveryQueue()`:
`POST /api/leads/deliveries` with `Authorization: Bearer $LEAD_QUEUE_SECRET`
(an hPanel cron every 5 minutes, `docs/runbook.md`), `npm run leads:retry`
(which calls that endpoint), and the **Run queue now** button on
`/admin/leads`. Each run is a `cron_runs` row (`job = 'lead-deliveries'`).
A `pending` row older than 10 minutes means a request died mid-delivery and is
picked up too. `/api/health` → `leads` reports last success, failures in 24 h,
gave-ups and the oldest undelivered lead; `backlog: true` (over an hour) sets
`degraded`.

**Before migration 0002 runs** there is no `lead_deliveries` table.
`src/lib/db-features.ts` probes `information_schema` (cached; a "no" for a
minute), and every queue function returns quietly: the form path is exactly
O18's, the queue re-pushes `crm_status = 'failed'` leads of the last 7 days,
and health reads `leads.crm_status` (`queue: "legacy"`).

### WhatsApp-first capture — the contract (O24, item 2)

A one-field lead: the visitor leaves a WhatsApp number (and optionally a
name) and the team writes to them first. It is `leads.kind = 'whatsapp'`.
The visible form is `<LeadForm variant="whatsapp" pagePath={…} />` (Sonnet's
side: bar, links, placement); it posts to the same server actions as every
lead form, so it works with JavaScript off (`submitLeadFormAction` redirects
back with `?lead=ok`).

Field names the form posts (FormData):

| Field | Required | Notes |
|---|---|---|
| `site` | yes | SiteKey, hidden |
| `kind` | yes | `whatsapp`, hidden |
| `whatsapp` | yes | the number; `00` becomes `+`. `phone` is accepted instead |
| `name` | no | |
| `message` | no | one line |
| `pagePath` | yes | the public path the form sits on, hidden |
| `articleSlug` | no | hidden; if absent the server derives it from `pagePath` (last segment of a path two or more deep) |
| `ts` (signed timestamp), `website` (honeypot, empty) | yes | the usual form guard (`src/lib/form-guard.ts`) |

Never posted, always attached by the server: brand (`site` → registry), the
first-touch attribution (`vc_attr` cookie), the last-touch UTM, and the A/B
variants the visitor was **shown** (`abx_<experiment>` cookies,
`src/lib/experiments.ts`). All of it lands on `leads.attribution`
(`article_slug`, `experiments`) and goes to VenderCRM as fields
(`landing_page`, `first_seen`, `article_slug`, `ab_variants`, `brand`, `kind`).
No email is asked for, so no auto-reply is sent; the team notification is.

Before migration 0002 the row is stored as `kind = 'contact'` with
`attribution.lead_kind = 'whatsapp'`; `effectiveLeadKind()` and the admin
filters read both forms, so nothing is lost across the switch.

**The click beacon.** A tap on any `wa.me` link is not a lead (the
conversation happens in WhatsApp), but it is the signal of which page started
one. `WhatsAppClickTracker` posts `{"type":"whatsapp_click","path","placement"}`
with `navigator.sendBeacon` to `POST /api/track`. The server adds brand, slug,
exposed variant and first-touch source and stores a `site_events` row (no IP,
no user agent, no id); it always answers 204 and is limited to 60 per 10
minutes per IP. With JavaScript off the link still works and simply is not
counted.

## Purchases (was `orders` — renamed in O9)

```
CheckoutButton → POST /api/checkout → routes on products.provider   [O9]
   provider=stripe                  → Stripe Checkout session
                                    → purchases row, 'pending'      (attribution only)
   provider=lemonsqueezy            → LS hosted checkout URL
Stripe → POST /api/stripe/webhook   → signature verified
LS     → POST /api/lemonsqueezy/…   → signature verified
                                    → webhook_events FIRST          [O9]
                                    → purchases.status = 'paid'
                                    → users row + provider_customers [O9]
                                    → refreshUserTier()             [O9]
                                    → download_tokens row (72h, 5 downloads)
                                    → purchase email + sign-in link [O9]
visitor → /thank-you?session_id=…   → looks the purchase UP; never grants on the URL
        → GET /api/download/[token] → streams from private/
```

Four things here are deliberate:

- **The success URL proves nothing.** `/thank-you` looks up a purchase the
  webhook already marked paid. If the webhook is late or was missed, it asks
  Stripe directly — a server-to-server answer — and fulfils on that.
- **Both webhooks write `webhook_events` before doing anything else**, and are
  idempotent on the provider's checkout id. A replay of a *processed* event is
  a 200 no-op; a replay of one whose handler *failed* runs again, because a
  lost retry would drop a real purchase for good.
- **The counter is claimed with a conditional UPDATE.** Two parallel requests
  on the last download cannot both win.
- **The buyer gets an account.** The same `users` row carries the Insider
  membership, so the receipt goes out with a magic-link sign-in
  (plan §1.5, §1.15). See `docs/platform.md`.

The one behavioural change to O2's Stripe flow is the table it writes and the
account it creates. Every O2 test still passes.

## Subscribers

`POST /api/subscribe` (or `subscribeAction`) → `pending` + a random
`confirm_token` → confirmation email → `/confirm?token=` → `confirmed`.

Unsubscribe is stateless: `/unsubscribe?u=<signed email>`. Because the address
is signed rather than looked up, the link works from any email we have ever
sent — including a purchase receipt for an address that never joined a list.
Every template carries one.

## Admin

`/admin/*` exists on the hub host only. That is enforced in
`src/proxy.ts` (via `resolveRequest`), not in the pages — a valid session
cookie still 404s on the other six brands, and
`tests/admin-guard.test.ts` asserts it for every host in the registry.

Screens: `/admin/leads`, `/admin/purchases` (with a subscriptions table),
`/admin/members` (tier, expiry, provider ids, last login, and a **grant tier
until** support action), `/admin/facts`. The grant is the only thing allowed to
make `users.tier` disagree with the purchase rows on purpose, so it goes
through `entitlements.ts` and is logged to `lead_events` as
`admin.grant_tier`.

Two guards, both needed:

- `requireAdminPage()` (`src/app/admin/guard.ts`) decides what is *rendered*.
- `requireRole()` (`src/lib/auth.ts`) decides what may be *written*, and runs
  inside every server action and the CSV route handler. A redirect is not an
  authorisation check.

`/admin/facts` records **who** verified a figure and **when**. It does not
change what the sites render — `content/shared/facts.ts` still decides that,
and flipping a `verified` flag stays a reviewed edit in a PR (plan §1.10).

## Degrading without credentials (plan §4.5)

| Missing | Behaviour |
|---|---|
| `DATABASE_URL` | Forms still deliver by email; the failure is loud in the log. Admin lists say so plainly. |
| `VENDERCRM_*` | Leads are stored locally, `crm_status` stays `pending`, the `crm` delivery row is `skipped`. |
| `LEAD_QUEUE_SECRET` | `/api/leads/deliveries` answers 503; the queue runs only from `/admin/leads`. |
| Migration 0002 not applied | Leads, WhatsApp leads and admin all work on the old schema (see "Delivery queue"); clicks are not stored. |
| `RESEND_API_KEY` / SMTP | Messages are logged to the console in full. |
| `STRIPE_SECRET_KEY` | The buy button renders "Checkout opens shortly". |
| `STRIPE_WEBHOOK_SECRET` | The webhook refuses every delivery with 503 rather than trusting an unsigned one. |
| `LEMONSQUEEZY_API_KEY` / `_STORE_ID` | The Insider button renders "Insider opens shortly"; the checkout answers 503. |
| `LEMONSQUEEZY_INSIDER_VARIANT_ID` | `guide-insider` is seeded **inactive**, same behaviour as above. |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | The LS webhook refuses every delivery with 503. |
| `MEMBER_SESSION_SECRET` | Derived from `SESSION_SECRET` with a distinct purpose — still unforgeable from the admin side. |
| `PARARESI_DATABASE_URL` | `npm run import:pararesi` refuses to start; nothing else is affected. |
| `NEXT_PUBLIC_BOOKING_URL` | `/book` renders the consultation form instead of an embed. |
| `SESSION_SECRET` | Admin login refuses rather than minting a forgeable cookie. |

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
`src/middleware.ts` (via `resolveRequest`), not in the pages — a valid session
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
| `VENDERCRM_*` | Leads are stored locally, `crm_status` stays `pending`. |
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

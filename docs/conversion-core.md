# Conversion core (phase O2) — how a lead, an order and a subscriber flow

Written for whoever touches this next. Plan §5.2 is the spec; this is the map.

## Leads

```
<LeadForm variant=…>            server: i18n labels + a signed timestamp
  └ <LeadFormFields>            client: useActionState
      └ submitLeadAction        server action — holds every secret
          └ createLead()        src/lib/leads.ts
              1. form guard     honeypot (silent) + signed timing token
              2. zod validate   src/lib/lead-schema.ts
              3. INSERT leads   ← the source of truth
              4. lead_events    'created'
              5. CRM push       fire-and-forget, status onto leads.crm_status
              6. emails         notification to Anton + auto-reply
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

## Orders

```
CheckoutButton → POST /api/checkout → Stripe Checkout session
                                    → orders row, status 'pending'   (attribution only)
Stripe → POST /api/stripe/webhook   → signature verified
                                    → orders.status = 'paid'
                                    → download_tokens row (72h, 5 downloads)
                                    → purchase email with the link
visitor → /thank-you?session_id=…   → looks the order UP; never grants on the URL
        → GET /api/download/[token] → streams from private/
```

Three things here are deliberate:

- **The success URL proves nothing.** `/thank-you` looks up an order the
  webhook already marked paid. If the webhook is late or was missed, it asks
  Stripe directly — a server-to-server answer — and fulfils on that.
- **The webhook is idempotent on `stripe_session_id`.** Stripe retries for
  days; a replay finds the order already `paid` and returns without minting a
  second token or sending a second email.
- **The counter is claimed with a conditional UPDATE.** Two parallel requests
  on the last download cannot both win.

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
cookie still 404s on the other two brands, and
`tests/admin-guard.test.ts` asserts it for every host in the registry.

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
| `NEXT_PUBLIC_BOOKING_URL` | `/book` renders the consultation form instead of an embed. |
| `SESSION_SECRET` | Admin login refuses rather than minting a forgeable cookie. |

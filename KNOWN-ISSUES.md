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

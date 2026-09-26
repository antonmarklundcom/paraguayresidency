# Decisions and access needed from Anton

What no session can do without Anton's accounts. Rewritten 2026-09-22 from
S6's original list (PR #13) against what was actually live that day. Steps
are in `docs/runbook.md` "Deploy".

## 0. New on 2026-09-26 (answer-engine and content run)

1. **Sign off the figures.** `docs/facts-verification.md` lists all 49 facts, what each shows, its
   source and every page it appears on. 36 are live with a source; set `verified: true` +
   `verifiedBy`/`verifiedOn` on each you have checked, or delete a fact's `sourced` block to pull it.
2. **Our own prices.** `pricing.temporary`, `pricing.permanent`, `pricing.cedula`,
   `pricing.tax_residency`, `pricing.family` in `content/shared/facts.ts` are still hedged. A
   "from USD X all-in" price converts far better than "on request".
3. **Team credibility.** Real photos of Anton, Yanina and Diana, a one-line role for each
   (`src/content/team.ts`, `role`), LinkedIn or other profile URLs (`sameAs`). These feed the bylines
   and the Person JSON-LD on every article.
4. **The guide PDF.** `npm run guide:pdf` builds it (67 pages) into `private/`, which is git-ignored.
   Upload `private/the-paraguay-residency-guide.pdf` to the server's `private/` folder and set
   `GUIDE_FILE_KEY=the-paraguay-residency-guide.pdf`, or host it and set `GUIDE_FILE_URL`.
5. **Make the repository private.** It is public, so the member-area chapters (the paid guide's
   text) are readable on GitHub. GitHub → Settings → General → Danger zone → Change visibility.
6. **Images.** Generated images cannot be downloaded into this cloud environment until
   `*.cloudfront.net` is in the environment's allowed domains (cloud environment menu → Edit →
   Network access). The chapter image slots are marked `{/* IMAGE: … */}` in the member chapters.
7. **Search Console and Bing Webmaster Tools** for every live domain (ChatGPT search runs on Bing),
   submit `/sitemap.xml`. Each domain also serves `/llms.txt`.
8. **Google Business Profile** in Asunción and a steady flow of real client reviews.

## 1. Ship what is merged (hPanel)

Merges to `main` do not reach the live site by themselves. On 2026-09-22
paraguayresidencyguide.com was still missing #60 (named team on About) and
#61 (Arrival homepage). Press Redeploy on the Node.js app in hPanel, or turn on
auto-deploy from `main`. If the app's entry point is
`.next/standalone/server.js`, change it to `npm start` (standalone was removed
2026-09-22).

## 2. Production env vars (hPanel → Environment Variables, then Redeploy)

`/api/health` on the live guide reported `"email":"console"` and
`"crm":"off"` on 2026-09-22:

- **Email**: `RESEND_API_KEY` (or the three `SMTP_*` vars). Until this is set,
  production sends nothing: no receipts, no sign-in links, no lead
  notifications.
- **VenderCRM**: the CRM vars in `.env.example`, so leads reach the pipeline.
  Leads are still stored in the local DB meanwhile.
- **Plausible**: `NEXT_PUBLIC_PLAUSIBLE_ENABLED=true`, after adding one
  Plausible site per domain.

## 3. Domains (registrar + hPanel)

Public DNS on 2026-09-22:

| Domain | State |
|---|---|
| paraguayresidencyguide.com | Live on this app |
| paraguayfrontier.com | Resolves, but still serves the old WordPress site |
| paraguayinvestorpass.com | No DNS at all (no nameservers) |
| residenciaenparaguay.es | No DNS at all |
| vidanoparaguai.com | No DNS at all |
| flyttatillparaguay.se | No DNS at all |
| paraguayresidency.co.uk (hub) | No DNS at all |

Confirm each registration is active, point it at Hostinger and attach it to
the same Node.js app (never a second slot). The hub matters most: it is the
unknown-host redirect target and the only host with `/admin`.

## 4. Payments

- **Stripe live keys** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, webhook
  endpoint `/api/stripe/webhook` on the guide host), then one real purchase and
  refund. Setting the key also switches off `FREE_ACCESS_MODE`, which gives the
  guide away free until then; a session then deletes that code path
  (`KNOWN-ISSUES.md`).
- **Lemon Squeezy** (Insider subscription): live keys and one real sale; so
  far it has only been tested with locally signed webhooks.

## 5. Facts

Legal and price facts in `content/shared/facts.ts` are `verified: false`, so
pages show "Not yet confirmed against the current official source" instead of
numbers. Someone has to check each against the official source and set
`verified` with a date. No lawyer is involved; site copy must not mention one.

## 6. Search Console

Add each live domain as a property (DNS TXT), submit `/sitemap.xml`.

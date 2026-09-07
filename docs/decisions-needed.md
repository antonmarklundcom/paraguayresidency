# Decisions / access needed from Anton

Per the autonomy protocol (plan §4.4): everything build-shaped in this phase
is done; these items are physical-world actions or credentials only Anton can
provide, and none has a graceful fallback that lets the exit criteria pass
without them.

## S6 — Deploy, domains, analytics, imagery (2026-09-07)

This session has no Hostinger login/SSH, no DNS registrar access, no Stripe
live keys, and no Google Search Console access — S6's remaining exit criteria
are physically blocked on these, not on missing code:

1. **Hosting.** Try attaching `paraguayresidency.com`, `paraguayinvestorpass.com.py`
   and `paraguayinvestorguide.com` to one Hostinger Node.js app (`docs/runbook.md`
   → Deploy → first choice). Report back here (or just tell the next session)
   whether hPanel accepted all three custom domains on one app. If it refuses
   more than one, use the VPS + Caddy + PM2 fallback in the same runbook
   section instead — do not create three separate Node slots (plan §1.7).
2. **Env vars.** Set every var in `.env.example` that has a real value in
   hPanel's Environment Variables screen (`DATABASE_URL`, `SESSION_SECRET`,
   `SEED_ADMIN_*`, `STRIPE_*`, `VENDERCRM_*`, `RESEND_API_KEY` or `SMTP_*`,
   `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_PLAUSIBLE_ENABLED=true` if
   Plausible is wanted at launch). Anything left unset degrades gracefully
   per plan §4.5 — nothing here blocks a deploy, but Stripe/CRM/email will not
   actually work until set.
3. **DNS.** Point apex + `www` for all three domains at whatever hPanel (or
   the VPS's Caddy) needs. SSL is automatic in both paths once DNS resolves.
4. **Stripe live.** Create/confirm the live product + price, set
   `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_GUIDE_PRICE_ID` in
   hPanel, register the live webhook endpoint
   (`https://paraguayinvestorguide.com/api/stripe/webhook`), then buy the
   Guide once for real from the live sales page and refund it from the
   Stripe dashboard. This is the one exit-criterion item that genuinely
   cannot be scripted — it needs a real card and a real Stripe account.
5. **Search Console.** Add all three domains as properties, verify (DNS TXT
   is simplest once DNS is already pointed here), submit each domain's
   `/sitemap.xml`.
6. **Imagery CDN allowlist.** `higgsfield-image-pipeline` Rule 2: this cloud
   environment's network policy returns 403 for `*.cloudfront.net` (confirmed
   via `curl "$HTTPS_PROXY/__agentproxy/status"` — `connect_rejected` /
   "policy denial"), so Higgsfield-generated images cannot be downloaded back
   into the repo here. No credits were spent generating images nobody could
   fetch. Fix once, applies to every future session and repo: claude.ai/code
   → environment selector → edit the environment → Network access: Custom →
   Allowed domains → add `*.cloudfront.net` → save, and make it the default
   environment. Docs: https://code.claude.com/docs/en/cloud-environments#access-levels.
   Once set, the next session (or this one, resumed) generates hero + 2
   section images per site through Higgsfield per `higgsfield-web-imagery`
   and places them via the `webimg-pipeline`/`higgsfield-image-pipeline`
   scripted flow — no manual download round-trip needed.

What's already committed on `phase/s6` without waiting on any of the above:
`src/lib/analytics.tsx` (env-gated Plausible, wired into the root layout, no
API key needed — just flip `NEXT_PUBLIC_PLAUSIBLE_ENABLED=true` once ready);
removed `output: 'standalone'` from `next.config.ts` (Next 16 warns it does
not work with `next start`, and neither real deploy path runs `server.js`
directly — see `KNOWN-ISSUES.md`); `docs/runbook.md` (deploy, domain, article
and DB-password-rotation procedures).

**S6 will not merge, and will not spawn S10–S14, until item 1 (hosting) and
item 4 (live Stripe purchase + refund) are done** — those are named in the
phase's own exit checklist and plan §4.12 gates the parallel content lane on
S6's PR being merged green. Whoever completes items 1–5 above should re-run
S6 (`Read prompts/sonnet-6-deploy-seo-imagery.md in this repo and execute it.`
in a fresh Sonnet session, or resume this one) to verify `/api/health` on each
live host, merge the PR, and spawn the five parallel phases.

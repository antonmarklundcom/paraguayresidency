# Runbook — health, rate limits, security headers

> **Scope note (O18).** S6 (`phase/s6`, PR #13 — deploy, DNS, Stripe live) is
> still open and its branch carries a fuller `docs/runbook.md`: deploy, adding a
> domain, adding an article, the DB-password rotation trap. When S6 merges,
> **S6's sections win** and these three are appended to them — this file was
> deliberately kept to what O18 built so the merge is a concatenation, not an
> argument. Design reference is `plan.md`; project law is `CLAUDE.md`.

## Health check

`GET /api/health`, on every host, no auth, never cached:

```json
{
  "ok": true,
  "degraded": false,
  "site": "residency",
  "host": "paraguayresidency.co.uk",
  "db": "ok",
  "secret": "ok",
  "email": "resend",
  "crm": "on",
  "time": "2026-09-11T12:00:00.000Z"
}
```

| Field | Good | What a bad value means |
|---|---|---|
| `degraded` | `false` | `true` if any of `db`, `secret` or (in production) `email` is unhealthy. The one field to alert on. |
| `site` | the brand for that host | A wrong brand means the host is missing from `src/sites/registry.ts` — it fell back to the hub. |
| `host` | the domain you asked for | Read from `x-forwarded-host`, else `host`. |
| `db` | `"ok"` | `"down"`: `DATABASE_URL` unset or wrong, or MySQL unreachable. Forms still accept and still reach the CRM and your inbox (plan §1.6), but nothing is being **stored** — fix it before you lose a day of leads. |
| `secret` | `"ok"` | `"weak"`: `SESSION_SECRET` missing or under 32 chars. In production every session, magic link, unsubscribe link and download token refuses to sign, so `/admin` and `/members` are down. Set a 32+ char secret and redeploy. |
| `email` | `"resend"` or `"smtp"` | `"console"` in production means **nothing is being delivered**: no confirmation mail, no receipt, no sign-in link, no lead notification. Set `RESEND_API_KEY` (or the three `SMTP_*` vars) and redeploy. |
| `crm` | `"on"` | `"off"`: VenderCRM is not configured. Leads are still stored and still emailed; `leads.crm_status` stays `pending`, so `/admin/leads` → Retry replays them once the key is set. |

**The IP behind Hostinger's proxy.** Everything that limits per IP reads the
first hop of `x-forwarded-for`, falling back to `x-real-ip` and then to a single
`unknown` bucket (`clientIp` in `src/lib/rate-limit.ts`). Hostinger's managed
Node.js hosting and the Caddy VPS fallback both set `x-forwarded-for`, so the
value is the visitor rather than the proxy. If a deploy ever lands somewhere
that does *not* set it, every visitor shares the `unknown` bucket and the limits
below become global instead of per person — `curl -s /api/health` will look
perfectly healthy, so the symptom to recognise is "everyone is getting `Too many
attempts`". The header is client-supplied and therefore spoofable, which is fine
for a limiter (a spoofer only splits their own bucket) and is why it is never
used as an identity.

## Rate limits

All of them live in one table, `LIMITS` in `src/lib/rate-limit.ts`. They are a
fixed window over an in-process `Map`: correct while the app is ONE Node process
on one hosting slot (plan §1.7). Two honest costs — a deploy resets every
window, and a second process would double every limit. Neither grants anything,
so neither is a security boundary; if the app is ever scaled to two processes,
see the `rate_limits` table in the plan's Backlog.

| Surface | Limit | Key | What the caller sees |
|---|---|---|---|
| Admin login (`loginAction`) | 5 / 15 min | IP **and** email, both counted | `Too many attempts…` in the form. Every failure also pauses a fixed ~250 ms. A successful login clears both counters. |
| `POST /api/subscribe` + the newsletter action | 3 / hour per address, 20 / hour per IP | email, IP | `429` with `retry-after`. |
| Confirmation **re-send** | 1 / hour per address per brand | brand + email | `200` and the normal "check your inbox" — the address is already pending and already has the link. This is the inbox-bombing fix, not a refusal. |
| `POST /api/checkout` | 10 / hour | IP | `429`, before any Stripe or Lemon Squeezy call. |
| Free-access mode (temporary) | 5 / hour | IP | `429`. |
| Lead forms (`submitLeadAction`) | 10 / hour | IP | The limit message inside the form. |
| `POST /api/auth/magic` | 5 / 15 min | email **and** IP, both counted | **`200`, always** — a `429` here would tell a prober which addresses exist. The refusal is in the server log (`[member-auth] magic link rate limited`); what is stopped is the mail, not the answer. |
| Every `POST /api/*` | 120 / min | IP | `429` from `src/middleware.ts`, under every per-route limit above. |

**Checking them on a live deploy:** `node tests/abuse.mjs https://<host>` drives
each surface 30× and prints what it got. It needs no database and no
credentials, and it is deliberately not in CI — it spends real windows in the
real process, so run it after a deploy, not on every push. Running it against
production **will** put that server's limiter into the refusing state for one
window for the probe's own address and IP; it never touches anyone else's.

## Security headers

Set in `next.config.ts` (`headers()`), so they cover static assets too — the
middleware matcher deliberately skips `_next/static`.

Everywhere: `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, a minimal `Permissions-Policy`,
`X-Frame-Options: DENY`, and — **in production only** — HSTS with a two-year
`max-age` and `preload`. HSTS is environment-gated on purpose: a browser that
sees it on a `*.localhost` dev host refuses plain HTTP there for two years.

CSP comes in two flavours:

- **The public tree gets `Content-Security-Policy-Report-Only`**, allowing
  Plausible. Report-only first because these are the pages carrying the
  analytics script, the per-brand fonts and MDX content, so the first real
  violation should arrive as a report rather than as a blank page on a live
  brand. **Flipping it to enforcing is one header name** — change
  `'Content-Security-Policy-Report-Only'` to `'Content-Security-Policy'` in
  `next.config.ts`. Do it after a week of clean reports; that is S6's or S15's
  call, and the comment above `PUBLIC_CSP` says the same thing.

  **Read this before doing it:** the policy carries no `report-uri` / `report-to`
  directive, so today the reports go to each visitor's own browser console and
  nowhere else — there is no week of reports to be clean. Whoever flips the
  header must first give the policy somewhere to report to (a collector route,
  or a hosted endpoint) and actually watch it, or else browse every brand's
  templates in a real browser with the console open and accept that as the
  evidence. O18 left this open deliberately rather than adding a half-built
  collector; it is in `KNOWN-ISSUES.md`.
- **`/admin` and `/members` get an enforcing `Content-Security-Policy`** with
  `frame-ancestors 'none'` and no third-party origins at all. They carry exactly
  one CSP header, so a violation there is a real block rather than a report.

`script-src` keeps `'unsafe-inline'` and `'unsafe-eval'`. That is Next's App
Router requirement, not a preference — the framework ships an inline bootstrap
and inline flight data on every page. Tightening it means a per-request nonce,
which makes every page dynamic, which is exactly what O19 is undoing. Revisit it
with O19's rendering work, not before.

**`x-site` is ours.** `src/middleware.ts` deletes any client-supplied `x-site`
before setting its own, on every branch. `src/lib/current-site.ts` trusts that
header to name the brand, so without the strip a request to a shared `/api/*`
route on an unrecognised host could choose its own brand.

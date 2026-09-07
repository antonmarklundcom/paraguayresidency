# Runbook — deploy, DB password rotation, adding a domain, adding an article

One Next.js app, seven brands (`CLAUDE.md`, plan §1–§2). This file is the
operational reference; `plan.md` is the design reference.

## Deploy

**First choice — Hostinger managed Node.js app (plan §1.7):**

1. hPanel → Websites → Add Website → Node.js Apps → Import Git Repository →
   authorize GitHub → `antonmarklundcom/paraguayresidency`, branch `main`.
2. Framework auto-detects Next.js. Build command `npm run build`, start command
   `npm start`. This runs `next start` against the full `.next` build output
   from the repo root — the cwd never moves, so `private/` resolves correctly
   with no extra steps (`next.config.ts` does NOT set `output: 'standalone'` —
   S6 removed it; see `KNOWN-ISSUES.md`).
3. Add every env var from `.env.example` that has a real value (§7 of
   `plan.md`) in hPanel's Environment Variables screen — never commit secrets.
4. Attempt to attach all three (later, all seven) custom domains to this one
   app in hPanel's domain mapping screen. If hPanel refuses more than one
   custom domain per Node app, STOP — do not create a second/third slot (plan
   §1.7 forbids it) — and move to the VPS fallback below.
5. Map DNS for each domain: A/AAAA (or CNAME, per hPanel's instructions) at
   apex and `www`; SSL issues automatically once DNS resolves.
6. Redeploy after any env var change — hPanel does not hot-reload them.

**Fallback — Hostinger KVM VPS + Caddy + PM2 (plan §1.7):**

Only if step 4 above fails. One app process, N hostnames, automatic SSL via
Caddy's on-demand TLS. Same commands as the managed path — no separate
release packaging needed since `output: 'standalone'` was removed in S6.

```
npm ci
npm run build
pm2 start npm --name paraguayresidency -- start
```

Caddyfile (one block per domain that shares this app):

```
paraguayresidency.com, www.paraguayresidency.com,
paraguayinvestorpass.com.py, www.paraguayinvestorpass.com.py,
paraguayinvestorguide.com, www.paraguayinvestorguide.com {
    reverse_proxy localhost:3000
}
```

`www` → apex redirects are handled by `src/middleware.ts`, not Caddy — every
host above must reach the app, not redirect at the edge.

## Adding a fourth (or eighth) domain

The registry is the only place a domain is "known" (plan §2):

1. Add a `SiteConfig` entry to `src/sites/registry.ts`: `key`, `hosts` (apex +
   `www.` + `<key>.localhost`), `canonicalHost`, `locale`, `theme`, nav/footer,
   `crm.source`, `siblings`. This is schema-off-limits territory only in the
   sense that the *shape* of `SiteConfig` is frozen (plan §4.7) — adding a new
   entry of the existing shape is exactly what O9/S10–S15 already did four
   times.
2. Add `src/app/sites/<key>/layout.tsx` (copy an existing one, swap the `site`
   prop) and its page tree.
3. Add `src/styles/themes/<key>.css` (accent, font variables).
4. Add `messages/<locale>/<key>.json` (and the shared locale's `common.json`
   if the locale is new) — `npm run verify:i18n` fails the build if anything
   is missing.
5. `siteEnum` in `src/db/schema.ts` and `SITE_KEYS` must gain the key together
   — a test (`tests/site-keys.test.ts`) checks they match.
6. Attach the domain in hPanel (or the Caddyfile, VPS path) and add its DNS
   records, same as the deploy steps above.
7. Analytics: nothing to configure per-domain if using Plausible —
   `NEXT_PUBLIC_PLAUSIBLE_ENABLED=true` turns tracking on for every brand at
   once, keyed by each brand's own `canonicalHost` (`src/lib/analytics.tsx`).
8. Search Console: add the domain as a new property, verify (DNS TXT is
   simplest for a domain already pointed at this app), submit
   `https://<domain>/sitemap.xml`.

## Adding an article

MDX lives under `content/<site>/<hub>/<slug>.mdx` with zod-validated
frontmatter (`title`, `description`, `site`, `hub`, `publishedAt`,
`updatedAt`, `faq[]` — see `src/lib/content.ts`). Add the file, run
`npm run verify` (catches frontmatter/schema errors and dead `<Fact>` keys),
and the page renders at `/guides/<hub>/<slug>` (or the brand's equivalent hub
path) with no code change. Never hardcode a legal/financial number in the MDX
body — add it to `content/shared/facts.ts` first and render it with
`<Fact k="…"/>` (plan §1.10, §4.11).

## The DB password rotation trap (plan §1.7, `nextjs-deploy-hostinger` skill §6a)

The live app's `DATABASE_URL` in hPanel already has whatever password existed
when the database was first provisioned. If that MySQL user's password is
changed later (e.g. to enable Remote MySQL for a local script), **the live
app's env var is now stale** and the site crashes with a generic
"Application error" page — the runtime logs show the failing query, not the
credential mismatch.

Before changing the DB password:
1. Note the current `DATABASE_URL` value in hPanel → Environment Variables.
2. Change the password.
3. Update the hPanel env var to match.
4. **Redeploy** — restarting the app is not enough, env var changes require a
   fresh deploy to take effect.

## Health checks

`GET /api/health` on every host returns `{ site, host, db }`. `db: "down"`
with everything else healthy means `DATABASE_URL` is unset or wrong for that
environment — check hPanel env vars before anything else.

# Hostinger process cap — HTML-first plan (2026-10-02)

Status: **PLAN ONLY. Nothing here is implemented.** Waiting on Anton's answers (§9).
Read-only research against `main` (e1843e5). No secrets in this file.

## 0. Two things to settle before anything else

**0.1 The domain list does not match this repo's host table.** `CLAUDE.md` says Anton owns exactly seven
domains for this project and `src/sites/registry.ts` serves exactly those. Seven of the fourteen domains in the
request are in neither: `woneninparaguay.nl`, `wakkerinparaguay.nl`, `emigrerennaarparaguay.nl`,
`permanentresidencyparaguay.com`, `paraguayresidency.uk`, `paraguayhq.com`, `paraguayimmigrationlawyer.com`
(only the three `.nl` ones appear in the repo, in `docs/design/nl-brand-plan.md`). Per the rules, this plan
**does not add any of them to the registry**. §3 lists them as "outside the repo — Anton to confirm ownership,
and to approve amending the CLAUDE.md table" with a recommended handling (almost all are zero-Node 301s).

**0.2 Node shape: you said 2 domains on 1 app; the "one app each, nothing parked" wording was the prompt's.**
Both are fine; §6.1 compares them. Short version: the evidence says the cost is per hostname, not per app.
`paraguayresidencyguide.com` + `paraguayfrontier.com` on one app = 2 hostnames (4 with `www.`), expected
2–4 copies × 6 threads ≈ 12–24 threads. That is a ~90 % cut from today and may be enough. Frontier does not
actually need Node (§4), so the leanest option is one app, one hostname. Test B (§7) decides.

## 1. What this repo serves today (check 1)

One Next.js app; `src/proxy.ts` → `resolveRequest` maps Host → `SiteKey` → internal rewrite to
`/sites/<key>/…`. All seven brands are hostnames of the same app (plan §1.7, `docs/runbook.md` deploy step 4:
"attach all seven domains to this one app"). I cannot see hPanel from the cloud, so "parked alias vs. real"
below is from the repo/runbook; your measurement (guide app with many parked domains) is the live truth.

| Domain | SiteKey | Lang / market | Pages* | Unique content? | `www.` | Today |
|---|---|---|---|---|---|---|
| paraguayresidency.co.uk | `residency` (hub) | en · UK/intl, done-for-you services | 24 | Yes: service + document pages (32 MDX) | 301→apex | Node alias; only host with `/admin` |
| paraguayinvestorpass.com | `investorpass` | en · investors, agents | 17 | Yes: investor-pass routes (17 MDX); overlaps hub topically | 301→apex | Node alias |
| paraguayresidencyguide.com | `guide` | en · DIY buyers | 20 | Yes: blog 45 MDX + members; **only brand that sells** (Stripe/LS, `/login`, `/members`) | 301→apex | Node alias; plus old WordPress URL 301s (`redirects.ts`) |
| paraguayfrontier.com | `frontier` | en · "frontier"/stories angle | 18 | Partly: 23 MDX; closest to hub/guide topically | 301→apex | Node alias |
| residenciaenparaguay.es | `residenciaes` | es · Spain/LatAm | 22 | Yes: 51 MDX, own slugs | 301→apex | Node alias |
| vidanoparaguai.com | `residenciapt` | pt-BR · Brazil | 23 | Yes: 41 MDX | 301→apex | Node alias |
| flyttatillparaguay.se | `flytta` | sv · Sweden | 20 | Yes: 50 MDX; old-app 301s (`redirects.ts`) | 301→apex | Node alias |

\*page.tsx files per brand folder, not URLs. No brand is static today; none is a pure redirect.
Exact-duplicate check (paragraphs ≥140 chars, MDX + TSX, all brands): **2** shared paragraphs, both
boilerplate. Verbatim copying is not the risk; topical overlap between the four English brands is (§5).

## 2. Where Host is read, and what breaks if Node sees ONE hostname (check 2)

| Where | What it does | One-hostname impact |
|---|---|---|
| `src/proxy.ts:~120` `x-forwarded-host ?? host` → `resolveRequest` | brand, www→apex, legacy 301s, `/admin` hub-only, `/login` `/members` only on selling brands | Node can only ever resolve its own brand(s). Other brands' hosts reach Node only if aliased — which is what we are removing. Unknown host → 301 to hub apex (a stale alias lands on the static hub; fine). |
| `src/sites/resolve.ts` step 6 | `/admin` only when `site.key === HUB_SITE` | **Breaks:** if the hub goes static, `/admin` has no host. Needs a change (§6.3). |
| `src/lib/current-site.ts` | `x-site`, else host, else hub | Cross-origin lead POSTs arrive with Host = Node host, so the brand must come from `Origin`, not Host (§8). |
| `src/lib/metadata.ts`, `siteOrigin()` | canonical, OG, JSON-LD, sitemap URLs come from the **registry**, not the request | Unaffected. Canonicals stay correct in a static mirror. |
| `robots.txt`, `llms.txt`, `sitemap.ts` | per-brand via Host/rewrite | Baked at mirror time per brand; must be re-mirrored on content change. |
| `src/app/actions/lead.ts:144` `redirectFormResult` | compares `Referer` host to Host | Server actions are same-origin only: Next's Origin/Host check rejects a cross-origin action POST, and action IDs are per-build. **Static forms cannot use server actions** → new endpoint (§8). |
| `src/proxy.ts` `pageCookies` | sets `vc_attr` (first touch) and `ab_*` (A/B) on page GETs | No proxy on static → no cookies. Replace with ~20 lines of client JS that writes the same values into the form's hidden `utm`/`pagePath` fields. The only experiment (`hero_cta`, hub) must move client-side or be retired. |
| `next.config.ts headers()` | CSP, HSTS, X-Frame | Static host needs the same as `.htaccess` `Header set`. **`form-action 'self'` and `connect-src 'self'` must add the Node origin** or browsers block the cross-origin POST. |
| `src/lib/auth.ts`, member session | host-only cookies, `path=/admin` | Fine; only exist on the Node host. |
| `src/lib/email.ts` `confirmUrl`/`unsubscribeUrl` | `siteOrigin(site)/confirm?token=…` | Links point at the **static** host, which has no server. `/confirm`, `/unsubscribe`, `/route-finder/result` read `searchParams` server-side. They must become client pages calling a Node API (§4). |
| `src/lib/rate-limit.ts` | in-process `Map`, correct only for ONE process (documented) | Today's 10 orphan copies each hold their own counter, so every limit is already multiplied. Fewer copies fixes that as a side effect. |
| `/api/health`, `src/lib/readiness.ts` | admin readiness fetches `https://<host>/api/health` per brand | Static hosts do not answer it → publish a static `/health.txt` and change the probe, or accept "static" as a status. |
| hPanel cron → `curl …/api/leads/deliveries` on the hub URL | lead retry queue | Retarget to the Node host. |
| Stripe/LS success URLs, magic link, logout | `siteOrigin(site)` | Guide only; unaffected. |

## 3. Target serving, domain by domain (checks 1 and 5)

Recommended default = **Option C** (one Node app, one hostname). Options A/B in §6.1 only change the Node rows.

| Domain | Target | Lang/market angle | Keep as own site? | Order | Rollback |
|---|---|---|---|---|---|
| paraguayresidencyguide.com | **Node** (only app; sells; `/api/*`, `/admin`, members) | en DIY | Yes | stays; remove all parked aliases (step 1) | n/a |
| paraguayfrontier.com | Option C: **static**. Option A/B: Node | en, stories/frontier | **Decide** — closest to hub/guide; merge by 301 if you cannot name a distinct query set | 6 | re-attach alias in hPanel, DNS back |
| flyttatillparaguay.se | **static** (pilot) | sv | Yes, unique language | 2 (pilot) | as above |
| vidanoparaguai.com | **static** | pt-BR | Yes | 3 | as above |
| residenciaenparaguay.es | **static**; lives only here (propia.node copy removed separately, §5) | es | Yes | 4 | as above |
| paraguayinvestorpass.com | **static** | en, investors/agents | Yes if kept to investor-pass queries | 5 | as above |
| paraguayresidency.co.uk | **static** (hub) — last, because `/admin`, the cron and readiness move first | en UK | Yes | 7 | as above |

Outside the repo's host table (**Anton to confirm ownership, then amend CLAUDE.md**; none added to the registry):

| Domain | Recommendation | Why |
|---|---|---|
| paraguayresidency.uk | static 301 → `https://paraguayresidency.co.uk` | same brand, same market; two domains for one site is duplicate content |
| woneninparaguay.nl | static 301 → emigrerennaarparaguay.nl | alias per `nl-brand-plan.md` |
| emigrerennaarparaguay.nl | the NL brand. Not a `SiteKey`; a new one = migration on nine tables, and "schema FINAL as of O9" says no. Either a migration phase, or a static-only Dutch site posting leads with the existing `site` of the hub | exact-match commercial term |
| wakkerinparaguay.nl | **do not point at a sales site** (VPRO/NPO series name; `nl-brand-plan.md` flags passing-off). Leave unused or a neutral factual page after a Dutch IP check | legal risk |
| permanentresidencyparaguay.com | static 301 → hub `/residency/permanent-residency` unless Anton wants a distinct site | no content in repo |
| paraguayhq.com | static 301 → hub | no content in repo |
| paraguayimmigrationlawyer.com | static 301 → hub `/contact` | no content in repo; check any "lawyer" wording claim against the facts rules before building a page |

A 301-only domain on shared hosting is a few lines of `.htaccess`: zero Node, zero threads.

## 4. What must stay on Node vs. can be static (check 3)

**Static** (the whole public tree): home, services, guides/blog MDX (259 MDX files across brands), pricing, about,
privacy/terms, route-finder, sitemap, robots, llms.txt, feed.xml, OG image (a crawl saves the PNG).

**Needs a server** (the minimum on Node): `/api/*` (checkout, both webhooks, magic link, subscribe, leads queue,
download, health, track, csp-report), `/admin`, `/login`, `/members`, guide `thank-you` (reads searchParams),
and the **new** lead + form-token + confirm/unsubscribe endpoints (§8).

**Becomes client-side on static hosts:** `/confirm`, `/unsubscribe`, `/route-finder/result`, first-touch and A/B.
Unverified: whether route-finder scoring is pure TypeScript (`src/features/quiz`). If it is, the result page can
render from the query string in the browser; if not, it calls a Node endpoint.

**How to produce the HTML.** `output: 'export'` is not available: this app uses `proxy.ts`, `headers()`, server
actions and route handlers. So: build once, run `next start` locally, **crawl each brand's `sitemap.xml` with
that brand's Host header**, save HTML + `robots.txt` + `llms.txt` + `feed.xml` + OG images, and copy
`.next/static` → `_next/static` and `public/`. A `STATIC_MIRROR=1` build flag makes `LeadForm`,
`NewsletterForm` render a plain `<form method="post" action="<node>/api/lead">` instead of a server action.
Risk to test, not assume: client-side navigation requests `?_rsc=` payloads; on a static host those 404 and
Next falls back to a full page load. Mitigation order: set `prefetch={false}` on mirrored links, or mirror the
RSC payloads. `tests/csp-crawl.mjs` already crawls every sitemap URL in Chromium and is the acceptance test.
This is a deploy script run by you (no `.github/workflows`).

Node-side limit: ISR (`revalidate=600`) stops meaning anything for static brands. A content change = re-mirror
and re-upload that brand.

## 5. SEO: overlap, hreflang, canonical (check 5)

- Today there is **no hreflang anywhere** (`grep` finds none). Canonicals are self-referencing per page from the
  registry. Both are correct for separate domains and stay unchanged by static serving.
- **Distinct language/market:** `.es`, `-pt`, `.se` are distinct. They are not translations of each other
  (different slugs and angles), so blanket hreflang between them would be wrong. Add hreflang only for true
  page equivalents (e.g. temporary residency across hub / es / pt / sv), reciprocal, absolute URLs, `x-default` →
  hub, via a small table — a later, optional phase.
- **English set (hub, investorpass, guide, frontier):** four sites, one language, one country topic. Different
  intent (services / investors / DIY / stories) is defensible; frontier is the weak one. Rule: each EN brand owns
  a named query cluster; any page that targets another brand's cluster is 301ed or noindexed. No exact
  paragraph duplication exists today (2 boilerplate hits).
- **Domain duplicates:** `.uk` → `.co.uk` 301, never hreflang. `.nl` set: one canonical (`emigrerennaarparaguay.nl`),
  `woneninparaguay.nl` 301.
- **residenciaenparaguay.es** also exists in `propia.node` (`src/config/verticals.ts`, `src/content/residency/`).
  It stays only here. Do not copy any of those files in; propia.node removes its copy separately, and its host
  must then 301 or be dropped from that app so the two never serve the same domain.
- **Moving a host from Node to static must not change a URL.** Before each cutover: crawl old sitemap, crawl new
  mirror, diff the URL list (must be identical), and carry over `LEGACY_REDIRECTS` (flytta, guide) as `.htaccess`
  rules generated from `src/sites/redirects.ts` — never hand-typed.

## 6. Structure options

### 6.1 Node shape

| | Hostnames on Node | Expected copies (if launcher = one per hostname) | Slots | Notes |
|---|---|---|---|---|
| **A** one app, guide + frontier attached (your idea) | 2 (4 with `www.`) | 2–4 | 1 | Matches plan §1.7. Keeps frontier's sitemap/headers on Node. |
| **B** two apps, one domain each | 1 + 1 | 2 | 2 | Plan §1.7 said "never a second slot"; that was for 7 domains and no longer applies. Two env sets and two deploys of the same repo. |
| **C** one app, one hostname (guide) | 1 | 1 | 1 | Lowest. Frontier becomes static. **Recommended** unless frontier has a reason to be server-rendered. |

All three are one codebase; the registry already resolves by Host, so nothing in code differs.
Test B (§7) says whether the `www.` variants and aliases each cost a copy.

### 6.2 Leads from all HTML sites to Node
Yes, and it is the point of §8. Every form on a static site posts to the one Node host.

### 6.3 Admin
`/admin` is hub-only today. With the hub static it moves to the Node host: change resolve.ts step 6 to allow it on
the Node brand, update plan §2/§1.11, keep `robots` disallow. This touches the proxy/middleware, which CLAUDE.md
reserves for Opus-level phases or a supervised session; I will not do it as a Sonnet build phase.

## 7. Commands for you to run and paste back (read-only unless stated)

Run over SSH on br-asc-web1719. Replace nothing; none prints secrets (the env line filters to four names).

```bash
# 1. Who is running, how old, how many threads (one line per next-server)
ps -eo pid,ppid,nlwp,etimes,args | grep -E '[n]ext-server|[n]ext start' | sort -k4 -n

# 2. Per copy: working dir (which app), parent, threads, listening port, and launch env names only
for p in $(pgrep -f 'next-server'); do
  printf '%s cwd=%s ppid=%s threads=%s\n' "$p" "$(readlink /proc/$p/cwd)" \
    "$(awk '/^PPid/{print $2}' /proc/$p/status)" "$(ls /proc/$p/task | wc -l)"
  tr '\0' '\n' < /proc/$p/environ | grep -E '^(PORT|HOST|HOSTNAME|NODE_ENV)=' | tr '\n' ' '; echo
done

# 3. Do copies listen on different ports? (one port per alias would confirm the theory)
ss -ltnp 2>/dev/null | grep -i node

# 4. Total threads for the account, and per command
ps -u "$USER" -L --no-headers | wc -l
ps -u "$USER" -L -o comm= | sort | uniq -c | sort -rn | head

# 5. What is PID 1 of the orphans, and what launched them (one orphan pid from step 1)
ps -o pid,ppid,lstart,args -p <ORPHAN_PID>; ls -l /proc/<ORPHAN_PID>/exe

# 6. Which hostnames are attached to the guide app in hPanel (screenshot or list, incl. www)
```

**Test B (alias proof)**, using a throwaway Node app so nothing in production moves:
1. Deploy any tiny Node app (a `http.createServer` that logs `process.pid` and the `Host` header) on ONE hostname.
   After 20 min run command 1. Expect 1 copy.
2. Add ONE parked alias in hPanel, Redeploy, wait 20 min, run command 1 again. Expect 2 if the launcher is per
   hostname. Add a third, repeat.
3. Repeat with `www.` only attached. That tells us whether `www.` counts.
Paste the three outputs and the app's own log lines (they will show the duplicate startups and which Host each
copy answered). That is also the evidence for ticket #23157727.

**hPanel env vars (change, then Redeploy):** `UV_THREADPOOL_SIZE=2`, `NODE_OPTIONS=--v8-pool-size=1`.
Both are documented Node settings; the 11 → 6 figure is yours, so after the redeploy rerun command 2 and paste
the thread count. Cost: crypto work (bcrypt on `/admin` login is pure JS here, so it is unaffected; `scrypt`/`pbkdf2`
would use the pool) serialises across 2 threads. Fine for this traffic.

## 8. Lead path today, and the smallest change (check 4)

**Today:** form → server action `submitLeadAction` (`src/app/actions/lead.ts`) → `createLead` (`src/lib/leads.ts`):
**MySQL `leads` row first**, then VenderCRM push + two emails fire-and-forget, failures recorded and retried by
the delivery queue (cron every 5 min). Brand tag = `site` + registry `crm.source` (the domain). Guards: signed
render-timestamp (`MIN_FILL_MS` 2.5 s, 12 h max), honeypot `website`, 10/hour/IP, plus the proxy's 120/min on
`POST /api/*`. `POST /api/subscribe` exists for JSON callers but has no CORS and trusts `body.site`.

**Smallest change so static sites can post (needs Opus / supervised session: new API route, proxy-adjacent):**
1. `POST /api/lead` on the Node host. Accepts `application/x-www-form-urlencoded` (plain HTML form, works with JS off)
   and JSON; reuses `createLead` unchanged, so the DB-first / CRM-fire-and-forget rules hold.
2. **Brand from `Origin`/`Referer`, never from the body.** Look the origin up in the registry
   (`canonicalHost`); unknown origin → 403. The body `site` field is ignored or must match.
   No schema change: `leads.site` already holds the seven brands.
3. **CORS:** exact-match echo of an allowlisted origin only (no `*`), `OPTIONS` preflight, no credentials.
   Plain form POSTs do not need CORS but do need a redirect target: 303 back to the origin's own `/thank-you`.
4. **Spam guards for a page that cannot be signed at render time:** the signed timestamp is issued server-side
   today. For static pages the form fetches `GET /api/form-token` (CORS, `no-store`) on load, keeps the honeypot,
   and the existing `checkFormGuard` stays. Add a per-origin ceiling next to the per-IP one.
5. **Source tag:** `site`, plus `pagePath` and `utm` hidden fields (both already exist), plus first-touch written
   by client JS (§2). No new column.
6. Same for the newsletter (`/api/subscribe` gets the Origin rule) and a new `GET/POST /api/confirm` +
   `/api/unsubscribe` for the client-side confirm/unsubscribe pages.
7. CSP on every static host adds the Node origin to `form-action` and `connect-src`; verify with `tests/csp-crawl.mjs`.

## 9. Instrumentation and the orphan reaper (items 6 and 7) — design only

Per your "report first" rule none of this is written. Proposed, in `src/instrumentation.ts` (it exists; add
`register()` for `NEXT_RUNTIME === 'nodejs'`):

- **Startup line:** one JSON log: `pid`, `ppid`, `node`, `argv` basename, `cwd`, `uptime`, `startedAt`, `PORT`.
- **Hostnames seen:** a `globalThis` set filled by `noteHost(host)`; logged at first sight of each new host, and
  every 10 min as a summary (`hosts`, `requests`, `lastRequestAt`). Needs a one-line call in `src/proxy.ts`
  (and Next may evaluate proxy and instrumentation in separate module graphs, so the set lives on `globalThis`;
  verified by a test before it is trusted). Touching `proxy.ts` is the part that needs your OK.
- **Orphan reaper, conservative:** every 30 s, exit if ALL hold: `process.ppid` changed since boot or equals 1,
  no request for 120 s, **and** a sibling with a newer start time exists (sibling pidfiles under
  `~/.cache/next-instances/<app>/<pid>`, stale files pruned by `process.kill(pid, 0)`). The newest copy is never
  reaped, so the reaper cannot take the site down. Caveat: if the orphans were PPID 1 from birth, "parent
  changed" is unusable, which is why the sibling rule is the real safeguard. The reaper logs `reaping pid=… idle=…`
  before exiting.
- **SIGTERM:** `process.on('SIGTERM')` logs, then `setTimeout(() => process.exit(0), 10_000).unref()` as the hard
  deadline, and exits at once if nothing is in flight. Next installs its own handler; this runs alongside it and
  only adds the deadline. Test locally with `kill -TERM`.
- All three are off-by-default behind `INSTANCE_REAPER=1` so a deploy cannot surprise you.

Your existing `~/reap.sh` cron stays until Test B and this have run for a week. Do not remove it first.

## 10. Migration order and rollback

0. **No-risk now:** env vars (§7); run commands 1–5 and Test B; paste results.
1. Decide §9 questions. If Test B shows aliases cost copies: detach every alias that is not staying on Node.
2. Instrumentation + reaper behind a flag (§9). Verify with `npm run verify`.
3. Lead/form-token/confirm endpoints + CORS (§8). Verified with `tests/abuse.mjs` and a cross-origin test.
4. Mirror script + `STATIC_MIRROR` forms; acceptance = URL-list diff + `csp-crawl.mjs` + a real lead from the staging
   static copy landing in `leads` with the right `site`.
5. Cutover order: flytta (pilot) → residenciapt → residenciaes → investorpass → frontier (if static) → hub.
   Per brand: lower DNS TTL to 300 s a day ahead; upload mirror to a new static website; test on its temporary
   hostname; switch the A record; **then** remove the alias from the Node app; watch `ps` and Search Console for
   7 days.
6. Move `/admin`, the delivery-queue cron and readiness probe to the Node host **before** the hub cutover.

**Rollback (any brand):** re-attach the domain to the Node app in hPanel and point DNS back (TTL is 300 s, so about
5 minutes). The Node code never loses the ability to serve any brand: the static mirror is additive and the
registry entries stay. Keep the previous mirror directory for 30 days. If leads break, the old server-action forms
still work on the Node host and the delivery queue replays anything stored.

## 11. Questions for Anton (answers unblock implementation)

1. **Node shape:** A (one app, guide + frontier), B (two apps) or C (one app, one hostname, frontier static)? I recommend C, then A.
2. **Frontier:** keep as its own brand (give it its own query cluster) or 301 to the hub/guide?
3. **The seven out-of-table domains:** confirm you own them, and approve amending the CLAUDE.md domain table
   (or tell me to leave them out). `.nl` brand: migration phase, or static-only?
4. **Admin location:** OK to move `/admin` to the Node host (touches `resolve.ts`)? Or keep the hub on Node (then
   hub + guide = two Node hostnames)?
5. **Who implements §8–§9:** an Opus phase or a supervised session, since they touch API routes and `proxy.ts`
   (CLAUDE.md: Sonnet phases do not).
6. Paste the §7 output and the Test B results.

# Site audit, live and local, all seven brands (2026-09-28)

**How to re-run.** Start the dev server (`npm run dev -- -p 3100`), then run:

```
node scripts/audit/site-audit.mjs      # crawl, SEO fields, schema, links, axe, screenshots (about 20 min)
node scripts/audit/conversion.mjs      # WhatsApp, lead form, guide buy button, Route Finder, Plausible
node scripts/audit/lighthouse.mjs      # Lighthouse mobile on the live homepages and one article per brand
node scripts/audit/analyze.mjs --json  # summary table and raw/summary.json
```

Every script takes `--brands=a,b`. `site-audit.mjs` and `conversion.mjs` also take `--modes=live|local`. No npm script was added. `@axe-core/playwright` was missing, so it is now a devDependency (`package.json` and `package-lock.json` changed). These scripts never submit a live form, and they never type into a checkout.

**Scope.** The crawl covered 365 page loads: 109 live pages on the three domains that resolve, and 256 local pages on the seven brands. That includes pages linked from the crawl that no sitemap lists. It checked 452 unique internal links, images and sibling-domain links, and ran axe (WCAG 2.0–2.2 A/AA) on every page. It took 169 screenshots in `shots/`. Local means `next dev` on this branch's working tree between 16:41 and 16:59 -03, when HEAD was `ca30682` (origin/main `af85f9f` plus docs). Other sessions merged after that, for example `5a04c2d`, the pt-BR W6-A guides. There was no `.env`, so the local database, email, CRM and Plausible were all off. For the local run only, the dev server got a dummy WhatsApp number, `595000000000` (shown as …0000), so the WhatsApp templates render the way they would in production. Local brands were served on `<key>.localhost:3100`, which the registry maps. The `?site=` override is read per request with no cookie (`src/sites/resolve.ts`), so it is lost on the first click.

Raw data: `raw/<brand>-<live|local>.json`, `raw/conversion.json`, `raw/summary.json`, `lighthouse/*.json`.

---

## 1. Executive summary: top 10 issues

| # | Sev | Issue |
|---|---|---|
| 1 | **P0** | **4 of the 7 production domains do not resolve.** Those are the hub `paraguayresidency.co.uk`, `paraguayinvestorpass.com`, `vidanoparaguai.com` and `flyttatillparaguay.se`. All four are registered and delegated to Hostinger's `dns-parking.com` nameservers, but those nameservers hold no zone for them. For the .co.uk and investorpass.com domains the nameservers answer REFUSED (a "lame delegation"). For vidanoparaguai.com and the .se domain they answer NXDOMAIN. So 4 of 7 brands, 145 of 253 sitemap URLs and the only `/admin` are offline. Fix: add each domain to the Node.js hosting slot in hPanel (plan §1.7), which creates the DNS zone and the SSL certificate. |
| 2 | **P0** | **Nobody is told about a lead, and nobody can see one.** `/api/health` on all three live hosts reports `"email":"console","crm":"off","degraded":true`. Leads are stored in MySQL (`db: ok`), but no notification email goes out and nothing reaches VenderCRM. The only place to read leads is `/admin`, which exists only on the hub, and the hub is the domain that does not resolve (`/admin` returns 404 on the spokes). The same console-only email means newsletter confirmations and member magic links are never delivered either. |
| 3 | **P0** | **The guide cannot be bought.** On the live `paraguayresidencyguide.com` the price block says **"$49, once"**, but the control under it is a non-clickable "Checkout opens shortly". Stripe is not configured and FREE_ACCESS_MODE is off. `/insider` shows "$9/mo" and "Insider opens shortly". The shown price of $49 also contradicts the plan and the code default of $7 (`DEFAULT_GUIDE_PRICE_CENTS = 700`; the local fallback renders "$7, once"). The `products` row on live most likely holds 4900, so this needs a decision. |
| 4 | **P0** | **The Spanish homepage is a blank error screen.** The Hostinger CDN (`server: hcdn`, `x-hcdn-cache-status: HIT`) serves `residenciaenparaguay.es/` HTML that is 3.3 to 4.0 days old (`Age: 288760–348402`). That HTML points at `/_next/static/chunks/*.js/.css` files a later deploy deleted, so they return 404 as `text/plain`, and the page shows Next's "This page couldn't load" (`shots/residenciaes-home-live-390.jpg`). It happened on 3 of 3 fresh requests. During the crawl `/familia`, `/nosotros` and `/residencia/cedula` also loaded dead chunks, and `curl` found the same on `/contact` once. The cause is `Cache-Control: s-maxage=300, stale-while-revalidate=31535700` combined with an edge cache that is never purged on deploy. |
| 5 | **P1** | **There is no WhatsApp anywhere on live.** `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset, so the floating button, the hero buttons, the contact-page button and the "continue on WhatsApp" link after a form are all silently omitted, on every page of the three live brands. The code calls WhatsApp "the main contact channel (no booked calls)". Locally, with a number set, it works on all 7 brands at 1440 and 390, and the pre-typed text is in each brand's language. |
| 6 | **P1** | **The document checklist tool crashes on every brand, live and local.** `src/components/DocumentChecklist.tsx` is `'use client'` and renders the server-only `<LeadForm>`, which uses `node:crypto` and `Buffer.toString('base64url')`. In the browser it throws `Unknown encoding: base64url` and the page becomes "This page couldn't load". The crash is confirmed on live frontier `/documents/checklist` and live es `/documentos/lista`, and locally on all four brands that have the tool. These URLs are in the sitemaps and the nav, and they render with no title, no `lang` and no canonical. |
| 7 | **P1** | **There is no analytics on live.** `NEXT_PUBLIC_PLAUSIBLE_ENABLED` is unset. The live check intercepted requests to plausible.io and found no script, 0 pageview events and no `whatsapp_click`. None of the conversion events built in #69–#70 are being recorded. |
| 8 | **P1** | **Every live page links to domains that are offline.** The footer's "Also from…" column, the About copy ("We run paraguayresidency.co.uk") and the guide's "Rather have it done for you?" link all point at the hub and investorpass domains, which are the dead ones from issue 1. That is 2–3 dead links on 100% of live pages: 37 of 37 on guide, 24 of 25 on frontier, 43 of 47 on es. |
| 9 | **P1** | **The pricing pages have no prices.** Five brands use the same template ("There is no self-service calculator… quoted on your call"). The es `/precios` meta description promises "cifras reales … hasta que se publiquen aquí". The previous audit flagged this as F-011 and it is still open. The pricing pages are also the brands' only commercial-intent pages. |
| 10 | **P1** | **The seven brands are clones in a warm peach/pink wash.** They share one template and three hero photos, trust avatars that are initials ("AM YA DD") instead of faces, a team shown as a three-name bullet list, and contact, article, about and quiz pages set in a narrow left column with the right ~45% empty at 1440. See §8. |

Also P1: live guide homepage mobile performance **53** (LCP 5.9 s, TBT 0.9 s). See §6.

---

## 2. Is production behind `main`?

**The origin server is current with main. Part of the CDN edge is not.**

- `origin/main` is `af85f9f` (2026-09-28 15:46 -03, #77, docs only). The last commit that changed the site is `d689708` (#76, 2026-09-26 15:34 -03).
- `/api/health` exposes only `time` and no commit or build ID, so the deployed SHA cannot be read. Adding `commit` to it would be cheap.
- On the three domains that resolve, the live and local sitemaps are identical (guide 37 = 37, frontier 25 = 25, es 46 = 46). No path exists on only one side. Titles, H1s and descriptions are identical on 106 of the 109 live/local path pairs. Content from #74 (`/llms.txt`) and #76 (24 new articles, the guide sales block) is live.
- The 3 pairs that differ are es `/`, `/familia` and `/nosotros`. On live they render the error screen because of the stale edge cache in issue 4, which serves HTML from a build about 4 days old. A visitor on those URLs sees **no** version of main at all.
- The live hub, investorpass, pt and sv brands cannot be compared because their domains do not resolve.

---

## 3. Per-brand tables

The live columns cover only the three domains that resolve. The local columns come from `next dev` with the dummy WhatsApp number. "Sibling" means a link to another brand's domain.

### residency (hub), paraguayresidency.co.uk

| | Live | Local |
|---|---|---|
| Pages / statuses | **DNS: domain does not resolve** (REFUSED at `cosmos/nova.dns-parking.com`) | 40 (39 sitemap + `/investor-pass`, noindex bridge) · 200×40, but `/documents/checklist` crashes client-side |
| SEO fields | n/a | titles ≤60 on all pages; description, canonical and `lang` missing only on the crashed checklist |
| Thin (<300 words) | n/a | hubs `/guides` 33, `/guides/comparisons` 74, `/guides/taxes` 106, `/guides/living-in-paraguay` 121, `/guide` 93, `/about` 255 (plus contact/legal/quiz) |
| Schema | n/a | Organization + ProfessionalService + WebSite on every page, FAQPage 25, BreadcrumbList 34, Article on 19/19 articles, Service on the 5 service pages |
| Broken links / images | n/a | 0 internal / 0 images; siblings investorpass, pt, sv linked from 39/40 pages (dead on live) |
| axe (rule×page) | n/a | serious 41: color-contrast on 39 pages (the WhatsApp green, §7), plus document-title and html-has-lang on the crashed checklist |
| Lighthouse | not run (DNS) | not run |

### investorpass, paraguayinvestorpass.com

| | Live | Local |
|---|---|---|
| Pages / statuses | **DNS: does not resolve** (REFUSED at `aurora/nebula.dns-parking.com`) | 20 · 200×20 |
| SEO fields | n/a | clean: no long or duplicate titles, no missing descriptions or canonicals |
| Thin | n/a | `/insights` 276, `/about` 222 (plus contact/legal/quiz) |
| Schema | n/a | Organization, ProfessionalService, WebSite, FAQPage 14, BreadcrumbList 15, Article 8/8, Service 6 |
| Broken | n/a | 0 internal / 0 images; hub links on all 20 pages (dead on live) |
| axe | n/a | serious 20: color-contrast (the WhatsApp green) |
| Lighthouse | not run (DNS) | not run |

### guide, paraguayresidencyguide.com

| | Live | Local |
|---|---|---|
| Pages / statuses | 37 · 200×37 | 37 · 200×37 |
| SEO fields | `/insider` title 72 characters; `/refunds` description 69 characters | same |
| Thin | `/about` 220, `/refunds` 150 (plus contact/legal/quiz) | same |
| Schema | Organization + WebSite on all pages, Product on `/` and `/insider`, FAQPage 30, BreadcrumbList 29, Article 28/28. No LocalBusiness, which is correct for a publisher | same |
| Broken | 0 internal / 0 images; **hub and investorpass links dead on 37/37 pages** | same links |
| axe | serious 1: color-contrast, 3 nodes (eyebrow `.tracking-[0.2em]` on `/`) | serious 37 (the WhatsApp green) |
| Lighthouse (mobile) | `/` **53** / 96 / 100 / 100 · article 99 / 100 / 100 / 100 | — |
| Health | `degraded:true`, email console, crm off, db ok | db down (no .env) |

### frontier, paraguayfrontier.com

| | Live | Local |
|---|---|---|
| Pages / statuses | 25 · 200×25, but **`/documents/checklist` crashes** | same |
| SEO fields | description, canonical and `lang` missing only on the crashed checklist | same |
| Thin | `/guide` 103, `/about` 224 (plus contact/legal/quiz) | same |
| Schema | Organization, ProfessionalService, WebSite, FAQPage 13, BreadcrumbList 19, Article 11/11, Service 3 | same |
| Broken | 0 internal / 0 images; **hub and investorpass links dead on 24/25 pages** | same |
| axe | serious 2 (the crashed checklist page) | serious 26 (the WhatsApp green plus the checklist) |
| Lighthouse | `/` 81 / 100 / 100 / 100 · article 87 / 100 / 100 / 100 | — |

### residenciaes, residenciaenparaguay.es

| | Live | Local |
|---|---|---|
| Pages / statuses | 47 (46 + `/pase-inversor`, noindex) · 200×47, but **`/`, `/familia`, `/nosotros` render the error screen** (dead chunks) and **`/documentos/lista` crashes** (checklist bug) | 47 · 200×47; only `/documentos/lista` crashes |
| SEO fields | on the 4 broken pages: title, description, canonical and `lang` all empty; `/precios` title 72 and description **197**; `/residencia/permanente` title 63 | home title 69, `/precios` 72 / 197, `/residencia/permanente` 63 |
| Thin | `/guias` 34, `/guias/impuestos` 164, `/guias/vivir-en-paraguay` 172, `/guias/comparativas` 227 (plus the error pages at 13 words) | same hubs, and `/nosotros` 240 |
| Schema | Organization, ProfessionalService, WebSite, FAQPage 31, BreadcrumbList 39, Article 26/26, Service 4 | same |
| Broken | 0 internal / 0 images; **hub and investorpass links dead on 43 pages**; 5 pages loaded 404 chunks | same sibling links |
| axe | serious 9: document-title and html-has-lang ×4 (error pages), **target-size** on `/residencia/cedula` (23 nodes) | serious 48 (the WhatsApp green plus the checklist) |
| Lighthouse | `/` 88 / 96 / 100 / 96, **measured on the broken stale page** · article 73 / 100 / 100 / 100 | — |

### residenciapt, vidanoparaguai.com

| | Live | Local |
|---|---|---|
| Pages / statuses | **DNS: NXDOMAIN** at `ns1/ns2.dns-parking.com` | 32 (31 + `/investor-pass`, noindex) · 200×32; `/documentos/lista` crashes |
| SEO fields | n/a | clean apart from the crashed checklist; `lang="pt-BR"` |
| Thin | n/a | hubs `/guias` 34, `/guias/impostos` 42, `/guias/comparativos` 81, `/guias/documentos` 114, `/guias/morar-no-paraguai` 176; `/sobre` 270 |
| Schema | n/a | Organization, ProfessionalService, WebSite, FAQPage 17, BreadcrumbList 26, Article 10/10, Service 6 |
| Broken | n/a | 0 internal / 0 images; hub and investorpass links on 31 pages |
| axe | n/a | serious 33 (the WhatsApp green plus the checklist) |

### flytta, flyttatillparaguay.se

| | Live | Local |
|---|---|---|
| Pages / statuses | **DNS: NXDOMAIN** (the .se delegation points at `dns-parking.com`, which has no zone) | 55 · 200×55 |
| SEO fields | n/a | **5 titles over 60**: `/skatt` 73, `/uppehallstillstand` 72, `/process` 67, `/route-finder` 66, `/guide` 64; one short title (`/guider/vad-du-inte-flyr-ifran` 22) |
| Thin / orphan | n/a | `/stader` 236, `/guide` 64; **`/guide` is in the sitemap but no page links to it** |
| Schema | n/a | Organization, ProfessionalService, WebSite, FAQPage 45, BreadcrumbList 50, Article 40/40, Service 4 |
| Broken | n/a | 0 internal / 0 images; hub link on 55 pages |
| axe | n/a | serious 55 (the WhatsApp green) |

---

## 4. Every broken or missing item, by severity

**P0: blocks money (leads or sales impossible or invisible)**

1. The domains `paraguayresidency.co.uk`, `paraguayinvestorpass.com`, `vidanoparaguai.com` and `flyttatillparaguay.se` do not resolve. The zone is missing at Hostinger for each (see issue 1).
2. Live email is `console` and the CRM is `off` on every host. Lead notifications, newsletter double opt-in, receipts and magic links are never sent.
3. `/admin` is unreachable: it lives on the hub, which does not resolve. Stored leads cannot be read.
4. The guide checkout is disabled ("Checkout opens shortly"), so no sale is possible. Insider is disabled too.
5. The es homepage renders "This page couldn't load" because the stale CDN HTML points at deleted chunks. `/familia`, `/nosotros`, `/residencia/cedula` and `/contact` are hit intermittently. Fix: purge the hcdn cache on every deploy, or send `no-store` or a short `stale-while-revalidate` for HTML (Next's `expireTime`), or keep old chunks across deploys.

**P1: costs trust, conversion or ranking**

6. No WhatsApp number is set on live. The main contact channel is absent on 100% of live pages.
7. The document checklist crashes because a client component renders the server-only `LeadForm` (`src/components/DocumentChecklist.tsx:5,149`). It affects residency, frontier, es and pt.
8. Plausible is not enabled on live, so there are no pageviews and no conversion events.
9. Every live page links to 2–3 sibling domains that are offline.
10. The guide shows $49 on live against $7 in the plan and code. Confirm which is intended, then fix the `products` row or the plan.
11. Pricing pages carry no figures on 5 brands (residency, frontier, es, pt, sv).
12. Live guide `/` mobile performance is 53: LCP 5.9 s with a 2.2 s element render delay on the hero image, TBT 0.9 s, 4.0 s of main-thread work, about 424 KiB of oversized tile images (800w tiles in ~300px slots) and about 340 KiB of unused JS in two shared chunks.
13. Thin hub pages that are indexed: `/guides` (33 words), `/guias` (34, es and pt), pt `/guias/impostos` 42, `/guias/comparativos` 81, residency `/guides/comparisons` 74, and others (§5).
14. Clone design across the brands; see §8.
15. es `/residencia/cedula` fails WCAG 2.2 target-size on 23 nodes (live).

**P2: polish**

16. The WhatsApp green `#1f8f4e` with white text is 4.11:1, below the 4.5:1 AA minimum. As soon as the number is set, every page on every brand fails axe color-contrast (that is the 20–55 "serious" per brand locally). Darken it to about `#197a42`.
17. Titles over 60 characters (9 pages: guide `/insider`; es `/`, `/precios`, `/residencia/permanente`; 5 flytta pages) and the es `/precios` description at 197 characters.
18. The WhatsApp pre-typed text lowercases proper nouns inside sentences, for example "…about paraguay cédula de identidad processing." (hub service pages), "…no paraguai." (pt) and "…i paraguay." (sv).
19. On the dark theme, the Investor Pass quiz's unchecked radio buttons render as filled white dots, so every option looks selected (`shots/investorpass-route-finder-local-1440.jpg`).
20. No `hreflang` anywhere. Fine for single-language domains, but the es, pt and sv service pages and the hub equivalents could declare each other.
21. flytta `/guide` is in the sitemap with no inbound link.
22. Every phone field uses a real-looking placeholder, `+595 981 123 456`.
23. Locally, with no database, `/insider` renders "$7/mo" because it falls back to the guide price rather than `INSIDER_PRICE_CENTS`. This only shows without a database.
24. The guide homepage eyebrow `.tracking-[0.2em]` fails color-contrast (3 nodes, live).
25. `/api/health` has no build or commit field, so "what is deployed" cannot be answered from outside.

---

## 5. SEO technical issues across brands

| Check | Result |
|---|---|
| Duplicate titles | None within a brand or across brands (the only live "duplicate" is the empty title on the four es error pages). |
| Titles over 60 characters | 9 pages (P2 item 17). None under 25 except one flytta article. |
| Descriptions over 160 or missing | One over 160 (es `/precios`, 197). Missing only on crashed or error pages (checklists, es live `/`, `/familia`, `/nosotros`). |
| Canonicals | Present and self-referencing on every page that renders. Missing only on the crashed and error pages. Local canonicals already point at the production domains. |
| noindex surprises | None in any sitemap. The only noindex pages are the intended bridges: hub `/investor-pass`, es `/pase-inversor`, pt `/investor-pass`, plus `/route-finder/result`. |
| Wrong `lang` | Only on the error pages, which have no `lang`. Otherwise `en`, `es`, `pt-BR` and `sv` are correct. |
| Thin pages (<300 words) | Content hubs are the real problem: residency `/guides` 33, `/guides/comparisons` 74, `/guides/taxes` 106, `/guides/living-in-paraguay` 121; es `/guias` 34, `/guias/impuestos` 164, `/guias/vivir-en-paraguay` 172; pt `/guias` 34, `/guias/impostos` 42, `/guias/comparativos` 81, `/guias/documentos` 114; investorpass `/insights` 276; flytta `/stader` 236. Also `/guide` bridge pages at 64–103 words and About pages at 220–270. Contact, legal and quiz pages are short by design. |
| Orphans | Pages not in a sitemap: only the noindex bridges. Pages in a sitemap with no inbound link: flytta `/guide`. Every article has at least one in-body inbound link, so F-006 is fixed. |
| Schema | Organization + WebSite on every page of every brand. ProfessionalService (a LocalBusiness subtype) on the six service brands. FAQPage on 13–45 pages per brand. BreadcrumbList and Article on 100% of articles. Service on service pages. Product on the guide sales pages. No JSON-LD block failed to parse. Missing: `Offer`/`price` on the service pricing pages (there are no prices), and `Person` for the named team. |
| robots.txt / sitemap / llms.txt | Correct per host on the three live domains (sitemap and host lines point at the right origin, AI crawlers are named). `www` → apex and `http` → `https` both return 301. An unknown path returns a real 404. |
| hreflang | None (P2 item 20). |
| The four dead domains | 145 sitemap URLs cannot be crawled. If they were ever indexed, each day offline costs rankings. |

---

## 6. Lighthouse, mobile (live)

These are single runs with Lighthouse 13.5, the default mobile emulation and simulated throttling. Lighthouse warned that this machine's CPU is slower than it expects, so read performance as ±10. JSON reports are in `lighthouse/`.

| Brand | Page | Perf | A11y | SEO | BP | LCP | TBT | CLS | LCP element |
|---|---|---|---|---|---|---|---|---|---|
| guide | `/` | **53** | 96 | 100 | 100 | 5.9 s | 901 ms | 0 | hero `<img>` (terrace, fetchpriority high), render delay 2.2 s |
| guide | `/blog/paraguay-residency-cost` | 99 | 100 | 100 | 100 | 1.7 s | 100 ms | 0 | article H1 |
| frontier | `/` | 81 | 100 | 100 | 100 | 4.9 s | 101 ms | 0 | hero `<img>` (red-earth road) |
| frontier | `/stories/american-first-90-days` | 87 | 100 | 100 | 100 | 3.6 s | 181 ms | 0 | article dek `<p>` |
| residenciaes | `/` | 88\* | 96 | 100 | 96 | 2.9 s | 311 ms | 0 | `<li>` text (\*measured on the broken stale page, JS never ran) |
| residenciaes | `/guias/documentos/como-obtener-…` | 73 | 100 | 100 | 100 | 4.4 s | 467 ms | 0 | article dek `<p>` |
| residency, investorpass, residenciapt, flytta | both | not run | | | | | | | the domains do not resolve |

The common drag is about 250–340 KiB of unused JS in two shared chunks on every page, and 800-wide bento tile images where the slots are about 300px, which Lighthouse estimates at 350–420 KiB of savings on the homepages.

---

## 7. Conversion plumbing (checked by hand with Playwright)

| Brand | Side | WhatsApp FAB 1440 / 390 | Number | Pre-typed text | Lead form (/contact) | Submission | Route Finder |
|---|---|---|---|---|---|---|---|
| residency | local | yes / yes | …0000 (dummy) | English | contact: name, email\*, phone\*, message | **OK**: "Got it. A person reads every one…", `?lead=ok`, offers "Continue on WhatsApp" | 6 questions → "Aim straight at permanent residency": lead form + FAB |
| investorpass | local | yes / yes | …0000 | English ("…the Paraguay Investor Pass") | investor_inquiry: 7 fields | OK | same, reaches result |
| guide | local | yes / yes | …0000 | English | contact | OK | reaches result, lead form |
| frontier | local | yes / yes | …0000 | English | contact | OK | reaches result |
| residenciaes | local | yes / yes | …0000 | **Spanish** | contact | OK ("Recibido…") | "Ve directo a la residencia permanente" |
| residenciapt | local | yes / yes | …0000 | **Portuguese** | contact | OK ("Recebido…") | reaches result |
| flytta | local | yes / yes | …0000 | **Swedish** | contact | OK ("Tack, den kom fram…") | reaches result |
| guide | **live** | **no / no** | none (env unset) | — | renders; enhanced client form mounts | **not tested, needs Anton's OK** | 6 questions → result, lead form only (no WhatsApp) |
| frontier | **live** | **no / no** | none | — | renders | **not tested, needs Anton's OK** | reaches result, lead form only |
| residenciaes | **live** | **no / no** | none | — | renders (at 20:07 UTC; the homepage was broken at the same time) | **not tested, needs Anton's OK** | reaches result, lead form only |
| residency, investorpass, residenciapt, flytta | **live** | — | — | — | — | — | the domains do not resolve |

- **Client validation:** there is none. The form is `noValidate`, and an invalid email posts straight to the server action, whose errors are server-side. On live that POST was intercepted and **aborted in the browser**, so nothing reached production. It showed the endpoint: a Next server action, `POST /contact` with a `next-action` header and multipart body, on all three live brands.
- **Local submissions:** 9 fake leads ("Audit Test", audit-test@example.com, +1 202 555 0100) went to the local dev server. There is no database there, so the dev log printed `lead not stored, delivering anyway` and a console email, and nothing was sent anywhere.
- **Guide buy button:** on live, "$49, once" with a `<span>` reading "Checkout opens shortly", which is not clickable. `/insider` shows "$9/mo" with "Insider opens shortly". There was nothing to click, so no Stripe page exists to open and **no sale is possible**. Locally it shows "$7, once" and the same span.
- **Plausible (live, intercepted and answered locally):** no `plausible.io/js/script.js` on any live page, 0 pageview events, and no WhatsApp link to click, so no `whatsapp_click`. Locally Plausible is off by environment.
- **Next steps on the result page:** "Read the <route> page", "Have someone check this" (which goes to the form), the lead form, and the floating WhatsApp button when a number is set. There is no `/book` link, by design ("no booked calls").

---

## 8. Design observations (1440 and 390 screenshots)

These are my honest reading of `shots/*-home-*`, `*-contact-*`, `*-pricing-*`, `*-article-*`, `*-about-*` and `*-route-finder-*`.

- **Seven brands, one page.** Every homepage has the same structure:
  - a full-bleed dusk photo, a left-aligned serif or grotesk H1, one line of copy, and two buttons (the brand CTA plus a white "Message us on WhatsApp");
  - a glass card at the bottom right with three initials avatars and three ticks;
  - a five-tile bento grid ("Where are you starting?" / "What are you looking for?");
  - a numbered four-step row, three "Why Paraguay" cards, a team strip, an FAQ accordion, three article cards, a closing form and the same footer.

  Only the accent colour, the display font and the photo change. Only three hero photos exist. The jacaranda terrace appears on guide, es and sv, the river at dusk on the hub and investorpass, and the red-earth road on frontier and pt. Anyone who lands on two brands sees the network at once. Investor Pass (navy and gold) is the only one that reads as its own brand.
- **Cheap or templated signals:**
  - "AM · YA · DD" initials in circles instead of faces, in both the hero card and the team strip. It looks like placeholder UI on a service that sells trust.
  - About pages list the team as three bullet points with no photo, role, licence or history.
  - Contact, article, about, pricing and quiz pages all sit in a ~560px left column with the right ~45% of a 1440 screen empty, which reads as unfinished rather than airy.
  - The guide "book" is a flat orange CSS rectangle.
  - The pricing pages are paragraphs of text with no number, table or example.
  - Nav and body text in pale grey at about 12–13px looks timid on desktop.
  - The disabled quiz "Next" buttons are washed-out pastels: salmon on guide, dusty pink on frontier.
- **Pinkish:**
  - The guide is the worst case: a cream page, peach chapter cards, a salmon-pink sales band (`#f9e3dc`) and orange CTAs.
  - The frontier pages sit on a pink-beige background, and es on a warm cream.
  - All hero photos are graded sunset orange and pink, with jacaranda purple in three of them.
  - The hub (sage) and pt (mint) are calmer and look more premium.
- **Mobile (390):** the header is now a proper "Menu" toggle (F-013 is fixed). The hero fills the whole first screen, so the trust card and every proof point fall below the fold. The floating WhatsApp button sits on top of the card's last tick line on every brand.
- **Broken states a visitor sees today:**
  - the es homepage error screen (`shots/residenciaes-home-live-390.jpg`);
  - the checklist error screens (`shots/*-checklist-*`);
  - the guide's "Checkout opens shortly" under a $49 price.

---

## 9. What could not be tested

- **Live crawl, Lighthouse and conversion checks** for residency (the hub), investorpass, residenciapt and flytta, because their domains do not resolve. Whether Hostinger already has these domains attached to the app could not be checked from here: probing the server IP with a forced Host header was refused by this session's permission policy. It needs a look in hPanel.
- **Live lead submission:** not tested, because it needs Anton's OK. It would create a real lead, although with email off no mail would go out.
- **Live checkout / Stripe:** the button is disabled, so there was nothing to click.
- **Plausible custom events on live:** there is no script and no WhatsApp link, so there was no event to observe.
- **Local runtime:** no `.env`, so no database, email, CRM or Plausible. WhatsApp used a dummy number. The local side is `next dev`, not a production build, so console output and timing are dev-mode. Lighthouse was run only on live.

## 10. Files

- Scripts: `scripts/audit/brands.mjs`, `site-audit.mjs`, `conversion.mjs`, `lighthouse.mjs`, `analyze.mjs`
- Data: `docs/audit/2026-10/raw/*.json`, `docs/audit/2026-10/lighthouse/*.json`
- Screenshots (JPEG q70): `docs/audit/2026-10/shots/<brand>-<template>-<live|local>-<1440|390>.jpg`, plus `*-route-result-*-390.jpg` and `*-lead-success-local-1440.jpg`. There are 169 files (36 MB). **`.gitignore:154` ignores `docs/audit/*/shots/`**, so they exist only on this machine unless they are committed with `git add -f`.
- `npm run verify` note: `tests/repo-hygiene.test.ts` fails on untracked files, so it stays red until these files are committed.

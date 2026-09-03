# Paraguay Residency Group — one Next.js app, three domains

**Repo:** antonmarklundcom/paraguayresidency · **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind + Drizzle + MySQL, per `nodejs-mysql-hostinger-stack` · **Method:** `phased-autonomous-build` · **Model rule:** `.claude/skills/fable-cost-guardrail/SKILL.md` (v2, Fable 5.1)

| Phase | Model | Prompt file | Plan sections | How it starts |
|---|---|---|---|---|
| F0 | Fable 5.1 (done, this conversation) | — | this plan | Anton opened it |
| O1 | Opus | `prompts/opus-1-foundation.md` | §2, §5.1 | Anton pastes one line in a fresh Opus window |
| O2 | Opus | `prompts/opus-2-conversion-core.md` | §5.2 | spawned by O1 |
| S3 | Sonnet | `prompts/sonnet-3-residency-site.md` | §6.1, §11.1 | spawned by O2 |
| S4 | Sonnet | `prompts/sonnet-4-investorpass-site.md` | §6.2, §11.2 | spawned by S3 |
| S5 | Sonnet | `prompts/sonnet-5-guide-site.md` | §6.3, §11.3 | spawned by S4 |
| S6 | Sonnet | `prompts/sonnet-6-deploy-seo-imagery.md` | §6.4 | spawned by S5 |
| F7 | Fable 5.1 (approved by Anton, see §1.9) | `prompts/fable-7-launch-review.md` | §5.3 | **Anton opens it manually** — S6 never spawns it |

Total automated build: 2 Opus + 4 Sonnet sessions. Fable touches the two ends only (plan, launch review).

---

## 1. Decisions already made — do not re-litigate

1. **Three domains, one app, one repo, one database, one hosting slot.** Domains are rows in a site registry; adding a fourth domain is a config entry plus a page folder, never a new app.
2. **The three brands and their roles in one funnel:**
   - `paraguayresidency.com` — **the hub.** High-ticket done-for-you residency services (temporary → permanent residency, cédula, RUC/tax residency, family). Primary SEO surface. Lead form + consultation booking.
   - `paraguayinvestorpass.com.py` — **the premium spoke.** Investor Pass (direct permanent residency by investment, launched April 2026). Dedicated brand because it targets a different searcher (investors, family offices, migration agents) and a different ticket size. Same lead pipeline, tagged `site=investorpass`.
   - `paraguayinvestorguide.com` — **the low-ticket entry.** A paid digital guide (PDF + updates) Anton runs alone. Buyers are nurtured toward the two service brands. Also the newsletter home.
   - Funnel direction: Guide (~$49) → Residency service ($$) → Investor Pass ($$$). Every brand links to the other two in the footer; the Guide upsells the services on its thank-you page; the service sites offer the Guide as the "not ready yet" exit.
3. **Language:** English is the only shipped locale at launch. All UI strings and copy go through an i18n layer from the first commit (`en` shipped; `es`, `de`, `pt` keys reserved). URLs are English on all three domains (`/investor-pass`, not `/pase-inversor`).
4. **Content lives in the repo as MDX** (`content/<site>/…`), not in an admin CMS. Anton and Claude edit content via PRs. Leads, orders, subscribers live in MySQL. A minimal `/admin` (leads + orders list, email/password login, `admin` role) exists on the hub domain only.
5. **Payments for the Guide:** Stripe Checkout (hosted page) + webhook → order row → signed download link + email. No cart, no accounts. Price is an env value, default `4900` cents (confirm in §8).
6. **Leads:** one `leads` table with a `site` column. Every form posts to VenderCRM via `vendercrm-lead-capture` AND stores locally (local store is the source of truth if CRM is down). Email notification via Resend (or Hostinger SMTP fallback).
7. **Hosting decision is deferred to phase S6 with a hard rule:** the app is host-agnostic (Node server, `output: 'standalone'` optional, no Vercel-only APIs). First choice: one Hostinger Node.js slot with all three domains attached. If hPanel cannot attach multiple custom domains to one Node app, fallback is a Hostinger KVM VPS running the same app behind Caddy (automatic SSL, unlimited hostnames). Never three slots.
8. **Design:** bespoke per brand but one component library. Shared tokens (spacing, type scale, radius, motion) + a per-site theme (accent, display font, imagery mood). Patterns from `nextjs-national-lead-gen` §4: Residency = split-screen hero + bento "routes" grid; Investor Pass = big-type editorial, dark-first, one gold-ish accent; Guide = single long-form sales page, warm light theme, big-type. Visual drafts may be produced with `/design` (see §12) — those drafts are input, the Next.js components are the deliverable.
9. **Fable 5.1 usage approved for this project:** F0 (this plan, including §11 key copy) and F7 (launch review, opened manually by Anton). No other phase, subagent, spawned session, or automation runs on Fable. This approval is recorded here per guardrail v2 §"Approved Fable work".
10. **Legal figures are not copy-pasted from the web.** Every number about investment thresholds, fees, timelines and residency validity is rendered from `content/shared/facts.ts` and each entry carries a `verifiedBy`/`verifiedOn` field. Until Anton's legal partner verifies an entry, the page shows "from USD X — confirm current thresholds on your call" style wording, never a bare number.

## 2. Roles & object model

**Roles** (`users.role` enum, day one): `admin | editor`. Only `admin` exists at launch. `editor` reserved for a future content person; no owner-type roles needed (nothing user-owned).

**Sites** (code constant, not a DB table, but mirrored as the `site` enum on data rows):

```ts
// src/sites/registry.ts
export type SiteKey = 'residency' | 'investorpass' | 'guide';
export interface SiteConfig {
  key: SiteKey;
  hosts: string[];              // ['paraguayresidency.com','www.paraguayresidency.com','residency.localhost']
  canonicalHost: string;        // apex; www 301s here
  name: string; tagline: string;
  locale: 'en';                 // default; per-site later
  theme: 'residency' | 'investorpass' | 'guide';  // maps to CSS variable set
  nav: NavItem[]; footer: FooterSpec;
  analytics?: { plausibleDomain?: string; gtmId?: string };
  crm: { source: string };      // VenderCRM source tag
  siblings: SiteKey[];          // cross-links in footer
}
```

**Tables** (all created in O1, `src/db/schema.ts`; identifiers English; `site` enum column wherever a row belongs to a brand):

| table | purpose | key columns |
|---|---|---|
| `users` | admin login | `id, email, password_hash, role enum(admin,editor), created_at` |
| `leads` | every form submission from any site | `id, site enum, kind enum(consultation,investor_inquiry,contact,quiz), name, email, phone, whatsapp, country, nationality, message, quiz_answers json, quiz_result varchar, page_path, utm json, crm_status enum(pending,sent,failed), crm_response json, created_at` |
| `lead_events` | audit trail | `id, lead_id, type, payload json, created_at` |
| `subscribers` | newsletter (Guide brand primarily, any site may post) | `id, site, email, name, source, status enum(pending,confirmed,unsubscribed), confirm_token, created_at, confirmed_at` |
| `products` | the Guide (one row now; editions later) | `id, slug, name, price_cents, currency, stripe_price_id, file_key, version, active` |
| `orders` | Stripe checkout results | `id, product_id, email, name, stripe_session_id uniq, stripe_payment_intent, amount_cents, currency, status enum(pending,paid,refunded), site, utm json, created_at, paid_at` |
| `download_tokens` | signed delivery | `id, order_id, token uniq, expires_at, downloads, max_downloads` |
| `facts_verification` | optional mirror of `facts.ts` verification state for the admin view | `key, verified_by, verified_on, note` |

**Routing model** (the multi-domain core, O1):

```
middleware.ts       host header → SiteKey (registry lookup) → rewrite to /_sites/<key>/<path>
                    www.* → 301 apex · unknown host → 301 https://paraguayresidency.com
                    sets request header x-site; local dev via *.localhost or ?site= override
src/app/_sites/[site]/layout.tsx   theme class + nav/footer from registry
src/app/_sites/[site]/(pages)…     each brand's routes; shared components in src/components
src/app/_sites/[site]/sitemap.ts   per-host sitemap, urls from that site's content only
src/app/_sites/[site]/robots.ts
src/app/api/…                      shared endpoints (leads, checkout, stripe webhook, subscribe)
src/app/admin/…                    hub domain only (middleware blocks admin on other hosts)
```

Direct requests to `/_sites/...` are 404'd by middleware so every page has exactly one public URL. Each page's `generateMetadata` sets `metadataBase` from the site's canonical host, so canonicals, OG URLs and sitemaps are per-domain with no cross-domain duplicates.

## 3. Feature scope

**Core (O1–S6):**
- Multi-domain routing, per-site theming, i18n layer, MDX content pipeline with typed frontmatter (title, description, site, hub, publishedAt, updatedAt, faq[]).
- Shared lead form component (variants: consultation, investor inquiry, contact) → DB + VenderCRM + email.
- **Residency Route Finder** quiz (5–7 questions: nationality, goal, timeline, budget, family, tax motive) → result page recommends Temporary/Permanent/Investor Pass and routes to the right brand's form. Shared across all three sites; the strongest cross-brand link.
- Guide: sales page, Stripe Checkout, webhook, delivery page, download endpoint, purchase email, thank-you upsell.
- Newsletter double opt-in.
- Admin: login, leads table with filters, orders table, resend-download action.
- SEO: per-site sitemap/robots/canonicals, JSON-LD (Organization, Service, FAQPage, Article, Product+Offer, BreadcrumbList), Core Web Vitals baseline.
- Imagery via `higgsfield-web-imagery` (S6).

**Approved extras (chained):** (a) WhatsApp click-to-chat on the two service brands — trivial, ship in S3/S4. (b) Consultation booking = Cal.com embed link if `NEXT_PUBLIC_BOOKING_URL` set, otherwise the form — ship in O2.

**Backlog (§10):** Spanish locale, Investor Pass ROI calculator, guide editions/upsells, affiliate program, editor role UI.

## 4. Autonomy protocol

1. Work until the phase's exit criteria all pass; never ask permission for in-plan work.
2. One PR per phase: branch `phase/<id>` off latest `main`; create, watch, merge when green. A red build is always this session's own work. Never start on top of an unmerged previous phase.
3. Minor non-blocking issues → `KNOWN-ISSUES.md`, keep building.
4. Stop and ask ONLY for: a missing credential with no graceful fallback, or a bad-foundation decision (schema shape, routing model, money math) where guessing wrong forces a rewrite. Everything else: choose reasonably, record it in §9, continue.
5. Missing env values never block: document in `.env.example`, degrade gracefully (CRM off → local store only; Stripe off → "coming soon" button; email off → log to console).
6. Every prompt is re-runnable: check what exists on the branch first, continue from the first unmet exit criterion.
7. Model-B (Sonnet) hard limits: no schema, auth, middleware/routing, payment or CRM logic changes. Page data access only through the query/action layer O1–O2 built. Need something? Workaround + Backlog note.
8. **Model cost guardrail (v2, Fable 5.1):** build phases, subagents, spawned sessions, workflows and triggers run on Opus or Sonnet only. Fable runs only in windows Anton opens himself. The only Fable phase in this plan (F7) is approved in §1.9 and is never spawned: the S6 handoff ends with a report telling Anton to open it. Any session that thinks it needs Fable elsewhere stops and asks Anton with the reason.
9. **Phase handoff** — hand off only when four gates pass: PR merged green; exit checklist passed; pre-handoff audit done (re-run `npm run build` + `npm run verify`, adversarially re-read your own merged diff, fix findings); §9 build-log entry committed. Then spawn the next phase as a NEW session via claude-code-remote `create_session`: inherit environment and permission mode (never `plan`), `model` per the phase table (Opus or Sonnet only), `prompt` exactly `Read prompts/<next-file>.md in this repo and execute it.` Then end with the phase report. Fallback when `create_session` is unavailable: continue in the same window if the next phase uses the same model; stop and report at a model switch.
10. **Build log:** before merging, append a dated 5–10 line entry to §9 — phase id + PR link, what now exists, decisions/deviations, where the next phase should look first. Fresh sessions orient from `plan.md` + §9 + `KNOWN-ISSUES.md` only.
11. **Facts rule (§1.10):** no session ever hardcodes a legal/financial number in JSX or MDX. Add it to `content/shared/facts.ts` with `verified: false` and render through `<Fact k="…"/>`.

## 5. Model-A phases (Opus)

### 5.1 Phase O1 — Foundation (multi-domain skeleton, schema, theming, i18n, content pipeline)

Load skills: `nodejs-mysql-hostinger-stack`, `nextjs-national-lead-gen`, `nextjs-deploy-hostinger` (§ env and DB init only).

Tasks:
1. `npx create-next-app@latest` (App Router, TS, Tailwind, `src/`), add `drizzle-orm mysql2 drizzle-kit tsx zod iron-session bcryptjs next-mdx-remote` (or `@next/mdx` + `gray-matter`; pick one, record in §9). `.env.example` with every var in §7.
2. `src/sites/registry.ts` + `middleware.ts` exactly per §2 routing model. Include `*.localhost` dev hosts and `?site=` override (dev only). Unit-test the host→site resolver (`npm run test`, Vitest).
3. Complete schema (§2) in `src/db/schema.ts`; `drizzle-kit generate`; `scripts/seed.ts` (admin user from env, the Guide product row, facts mirror). Idempotent upserts.
4. `src/i18n/` — `t(site, key)` with `messages/en/<site>.json` + `messages/en/common.json`. Missing key → key string in dev, empty in prod, plus a `npm run verify:i18n` that fails on missing keys referenced in code.
5. Theming: `src/styles/tokens.css` (shared) + `themes/{residency,investorpass,guide}.css` (CSS variables: `--accent`, `--bg`, `--fg`, `--display-font`, …). `next/font` for two typefaces per theme max. Layout applies `data-theme=<key>`.
6. Shared components: `Container, Section, Heading, Button, Card, Bento, SplitHero, EditorialHero, FAQ (with FAQPage JSON-LD), Breadcrumbs (+JSON-LD), Prose, Footer (siblings cross-links), Nav`. Storybook not required; a `/_dev/kitchen-sink` route (dev only) rendering all components in all three themes.
7. Content pipeline: `content/<site>/<hub>/<slug>.mdx` with zod-validated frontmatter; `getPages(site)`, `getPage(site, slugPath)`, `getHub(site, hub)`. `<Fact k>` MDX component. One placeholder MDX per site so routing renders.
8. `content/shared/facts.ts`: keys for `investorpass.min_investment_usd`, `investorpass.launch_date`, `investorpass.validity_years`, `permanent.presence_rule`, `temporary.duration`, `cedula.timeline`, `tax.territorial_rate` — all `verified: false`, with `source` URLs from §11.4 and display text that hedges.
9. Per-site `layout.tsx`, `not-found.tsx`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` (text-only, themed). `generateMetadata` helper `siteMetadata(site, {title, description, path})` that sets `metadataBase`, canonical, OG.
10. Health route `/api/health` returning `{site, host, db: ok|down}`.
11. `npm run verify` = typecheck + lint + tests + `verify:i18n` + build.

Exit: `npm run verify` green; hitting `http://residency.localhost:3000`, `investorpass.localhost:3000`, `guide.localhost:3000` renders three differently themed placeholder homes with correct `<link rel=canonical>` hosts; `/_sites/residency` direct request 404s; `www.` and unknown host redirect tests pass; schema migrated on a local/remote MySQL and seed idempotent (run twice); PR merged.

### 5.2 Phase O2 — Conversion core (leads, CRM, quiz, checkout, newsletter, admin)

Load skills: `vendercrm-lead-capture`, `nodejs-mysql-hostinger-stack` §2, `claude-api` is NOT needed.

Tasks:
1. `src/lib/leads.ts`: `createLead(input)` — zod-validated, honeypot + timing check, stores row, enqueues CRM push (`sendToVenderCrm`) and email (`notifyLead`), both fire-and-forget with status recorded on the row; retry endpoint for admin.
2. Server action + `<LeadForm variant=…>` component: consultation (residency), investor inquiry (investorpass: adds investment range + route select), contact (all), quiz-result (hidden fields). Country/nationality select from a static ISO list. WhatsApp field optional. Success state in-place, plus `?lead=ok` for analytics.
3. **Route Finder quiz**: `src/features/quiz/` — questions in `messages/en/common.json`, scoring in `scoring.ts` (pure, unit-tested), result page `/route-finder/result?r=…` per site with the recommended route, its facts, and the right CTA (deep-link to the sibling site when the route belongs elsewhere). Persist answers on the lead when the user submits from the result page.
4. Guide checkout: `POST /api/checkout` → Stripe Checkout session (price from `products`), success → `/thank-you?session_id=`; `POST /api/stripe/webhook` verifies signature, upserts order `paid`, creates `download_tokens` (72h, 5 downloads), sends purchase email with link. `GET /api/download/[token]` streams the file from `private/` (not `public/`) or from an S3-compatible bucket if `GUIDE_FILE_URL` is set. Thank-you page shows the link AND the upsell to a consultation.
5. Newsletter: `POST /api/subscribe` → pending + confirm email → `/confirm?token=` → confirmed. Unsubscribe link in every email.
6. Email: `src/lib/email.ts` with Resend if `RESEND_API_KEY` else SMTP if configured else console. Templates: lead notification (to Anton), lead auto-reply, purchase, subscribe confirm.
7. Admin (hub host only): `/admin/login` (iron-session, bcrypt), `/admin/leads` (filter by site/kind/date, CSV export), `/admin/orders` (resend link), `/admin/facts` (mark verified — writes `facts_verification`). `requireRole` server-side on every action.
8. Tests: quiz scoring, lead validation, webhook signature handling (Stripe CLI fixture), download token expiry/limits, admin auth guard.

Exit: `npm run verify` green; end-to-end locally: submit each form variant → row + (mocked) CRM call + email log; Stripe test-mode purchase → paid order → download works, 6th download rejected, expired token rejected; quiz produces the three route outcomes for documented answer sets; admin cannot be reached on non-hub hosts; PR merged.

### 5.3 Phase F7 — Launch review (Fable 5.1, Anton opens manually)

Scope is review + inline fixes only, no new features: read every public page of the three sites as a first-time visitor; check the funnel (guide → residency → investor pass) actually cross-links as §1.2 says; tighten hero/positioning copy where Sonnet's fill diverged from §11; verify every `<Fact>` still hedges unless marked verified; run Lighthouse on the three homes and the guide sales page; fix small findings inline; put anything larger in Backlog. Output: a short launch report with the §7 items still open.

## 6. Model-B phases (Sonnet)

Hard limits for all Sonnet phases: no changes under `src/db`, `src/lib/leads.ts`, `src/lib/email.ts`, `src/app/api`, `middleware.ts`, `src/sites/registry.ts` shape (adding nav items/copy inside the registry is fine), `src/features/quiz/scoring.ts`. Page data access through `getPages/getPage/getHub` and the server actions from O2. Skills to load in every Sonnet phase: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline), `web-design-system` if present in the skill list, otherwise the tokens in `src/styles`.

### 6.1 Phase S3 — paraguayresidency.com (hub)

Pages (all under `src/app/_sites/residency/`), one primary intent each:

```
/                                  hero (split) · who it's for · 3 routes bento (Temporary / Permanent / Investor Pass→sibling) · process timeline · why Paraguay (facts) · testimonials placeholder · FAQ · CTA
/residency/temporary-residency     service page + FAQ + form (consultation)
/residency/permanent-residency     service page (incl. "after temporary" path)
/residency/cedula                  cédula de identidad process
/residency/tax-residency           RUC, territorial tax, who it suits (hedged facts)
/residency/family                  spouse/children/dependents
/investor-pass                     short bridge page → paraguayinvestorpass.com.py (canonical there; this page is a teaser, noindex if thin)
/route-finder, /route-finder/result  the quiz (from O2)
/pricing                           packages table (Anton fills real prices; placeholder rows marked TODO → shown as "from" with a note until filled)
/process                           step-by-step timeline with documents checklist
/about, /contact, /book (booking embed or form)
/guides/[hub]/[slug]               content hub: hubs = documents, living-in-paraguay, taxes, comparisons ("Paraguay vs Uruguay residency", "Paraguay vs Panama")
/guide                             bridge → paraguayinvestorguide.com (soft CTA)
/privacy, /terms
```

Content to write in this phase: 8 MDX articles minimum (2 per hub), each 900–1400 words, one intent, internal links to hub + 2 related + the relevant service page. Copy from §11.1 for hero/positioning; everything else Sonnet writes in the same voice.

Exit: all pages render with unique titles ≤60 / descriptions ≤155; sitemap lists exactly these; JSON-LD validates (Organization sitewide, Service on service pages, FAQPage, BreadcrumbList, Article); no `<Fact>` bypassed; Lighthouse mobile ≥90 perf/SEO on `/` and one service page; forms submit through O2 actions; PR merged.

### 6.2 Phase S4 — paraguayinvestorpass.com.py

```
/                                  editorial hero (dark, big type) · what the Investor Pass is (hedged facts) · 4 investment routes grid · who qualifies · timeline · "why go direct to permanent" · investor inquiry form
/investor-pass/requirements
/investor-pass/investment-routes   real estate · productive business · financial instruments · tourism (each with a hedged threshold Fact)
/investor-pass/process
/investor-pass/vs-standard-residency   comparison page (links to hub's routes)
/investor-pass/for-agents          B2B page for migration agents / advisors (referral inquiry)
/route-finder(/result)             shared quiz
/insights/[slug]                   6 articles: program explainer, real-estate route deep-dive, tax angle, family inclusion, timeline expectations, Investor Pass vs Uruguay/Panama investment residency
/about, /contact, /privacy, /terms
```

Exit: same bar as S3; Product/Service + Offer JSON-LD on `/`; every investment figure via `<Fact>`; inquiry form tags `site=investorpass`; PR merged.

### 6.3 Phase S5 — paraguayinvestorguide.com

```
/                                  long-form sales page: promise · who it's for · what's inside (chapters) · sample pages · author/credibility · price + Stripe button · guarantee · FAQ · newsletter fallback
/thank-you                         download link + upsell (consultation on hub, inquiry on investorpass)
/confirm, /unsubscribe             newsletter flows (from O2)
/blog/[slug]                       6 articles: cost of living, bank account, timeline realities, mistakes, documents, "do you need a lawyer"
/about, /contact, /privacy, /terms, /refunds
```

Guide content itself (the PDF) is NOT built here: S5 ships `private/guide-placeholder.pdf` and a `docs/guide-outline.md` (chapter outline from §11.3). Anton supplies the real PDF (§7).

Exit: sales page Lighthouse ≥90; Stripe test purchase from the live page works end-to-end; Product + Offer JSON-LD; PR merged.

### 6.4 Phase S6 — Deploy, domains, analytics, imagery

Load: `nextjs-deploy-hostinger`, `higgsfield-web-imagery`.

1. Hosting per §1.7: try one Hostinger Node slot + attach all three domains. Record the outcome in §9. If multi-domain attach is impossible → VPS path (Caddyfile with the three hosts, PM2, `npm run build && npm start`), record.
2. Env vars from §7 set in hosting; `NEXT_PUBLIC_SITE_HOSTS` not needed (registry is code) but `APP_ORIGIN_FALLBACK` is.
3. DNS: apex + www for each domain; www → apex handled by middleware; SSL on all six hostnames.
4. Stripe live webhook endpoint registered; test one real purchase and refund.
5. Analytics per site (Plausible or GA4 id from registry); Search Console property for each domain; submit sitemaps.
6. Imagery: hero + 2 section images per site through Higgsfield, per the imagery skill's slot workflow; alt text from MDX/registry, never hand-typed.
7. `docs/runbook.md`: how to deploy, rotate DB password (the known trap), add a fourth domain, add an article.

Exit: three domains live with SSL; `/api/health` OK on each host; Search Console verified; one live Stripe purchase + refund done; PR merged; STOP footer report to Anton, telling him F7 is next and he opens it.

## 7. Human-inputs checklist

| Item | First needed | Notes |
|---|---|---|
| MySQL database + Remote MySQL whitelist (Hostinger) | O1 exit | per deploy skill §6a |
| VenderCRM tenant key + `source` tags for 3 sites | O2 | degrades to local-only |
| Resend API key (or SMTP) + sending domain DNS | O2 | degrades to console |
| Stripe account, product/price, webhook secret (test then live) | O2 test / S6 live | |
| Booking URL (Cal.com/Calendly) | O2 | optional; form fallback |
| Real packages & prices for `/pricing` (hub) | S3 | shown as TODO "from" until filled |
| Legal verification of `facts.ts` entries (lawyer partner) | before F7 | until then facts render hedged |
| The Guide PDF (real file) + author bio + photo | S5/S6 | placeholder ships |
| Testimonials (real, with consent) | S3 | section hidden until provided |
| Hosting choice confirmation if hPanel can't multi-domain | S6 | plan says VPS fallback |
| Domain DNS access for all three domains | S6 | |
| Analytics choice (Plausible vs GA4) | S6 | default Plausible |

## 8. Open business questions (parked)

1. Guide price: $49 default. $29 sells more, $79 signals more; decide before S6 live.
2. Is `paraguayinvestorpass.com.py` the canonical Investor Pass brand, or should a `.com` be acquired and the `.com.py` redirect? (.com.py is fine for EN searchers but odd for a non-Paraguay audience.)
3. Referral fee structure for the `/for-agents` page.
4. Whether the hub should show prices at all (skill says transparency wins; Paraguayan legal partners often prefer "on request").
5. Second locale priority: Spanish (LatAm investors) vs German (largest EU cohort in Paraguay).

## 9. Build log & handoff

**2026-09-03 — Orchestration mode (Fable, window opened by Anton).** Anton asked Fable to manage the build instead of pasting phase prompts himself. Phases O1–S6 run as Opus/Sonnet subagents spawned from Anton's Fable window (guardrail v2 'Inside a Fable window' clause). Each phase still gets its own `phase/<id>` branch and PR, merged only when the `verify` GitHub Actions check is green. Phases do NOT call `create_session`; Fable reviews each merged PR briefly and starts the next phase. F7 stays manual.

**2026-09-03 — O1 Foundation** — PR: https://github.com/antonmarklundcom/paraguayresidency/pull/2

What now exists: Next 16 + React 19 + Tailwind 4 app on TS. `src/sites/registry.ts` (three brands, hosts, nav/footer, CRM source, siblings) and the pure resolver `src/sites/resolve.ts` driving `src/middleware.ts`; all three `*.localhost:3000` hosts render distinct themed placeholder homes with their own canonical host, sitemap and robots. Complete 8-table schema + generated migration SQL + idempotent `scripts/seed.ts`. i18n layer with `verify:i18n` failing on missing/drifted keys. Tokens + three CSS themes, shared component set, `/dev/kitchen-sink`. MDX content pipeline with zod frontmatter, one placeholder article per brand, `<Fact k>` rendering hedged wording for all seven facts. `/api/health` reports `db: down` gracefully. `npm run verify` (typecheck + lint + 43 tests + i18n + build) is green and needs no database or network.

Decisions and deviations:
- Route folder is `src/app/sites/<key>/`, not `_sites` — an underscore folder is private in the App Router and cannot be a rewrite target. Direct `/sites/...` requests are still 404'd by middleware, so each page keeps exactly one public URL.
- `middleware.ts` must live at `src/middleware.ts`. At the repo root it is silently ignored when `src/` exists (found by curling the hosts; everything 404'd). A test asserts the placement.
- `robots.ts` is only honoured at the app root, so robots is a shared route handler `src/app/robots.txt/route.ts` that resolves the brand from the host; `/robots.txt` is a middleware passthrough. `sitemap.ts` nests fine and stays per-site.
- MDX via `next-mdx-remote/rsc` (plan §5.1.1 asked for a choice); `output: 'standalone'` and `agentRules: false` in `next.config.ts` (Next 16 was rewriting this repo's CLAUDE.md on every dev start).
- Deferred: migrating and seeding against a real MySQL — no MySQL and no Docker in the build container. Exact commands and expected row counts are in `KNOWN-ISSUES.md`; S6 or Anton clears it.

Where O2 looks first: `src/db/schema.ts` (leads, lead_events, subscribers, products, orders, download_tokens are all already there — do not retrofit), `src/lib/current-site.ts` for the request's brand, `src/sites/resolve.ts` if a new shared `/api/...` path needs passthrough, `src/i18n/messages/en/*` for every user-facing string, and `content/shared/facts.ts` before writing any figure.

## 10. Backlog

- Spanish locale (`es`) for all three sites; German for hub.
- Investor Pass ROI / rental-yield calculator.
- Guide editions (Spanish edition, Investor edition) as extra `products` rows.
- Affiliate/referral tracking for agents.
- `editor` role UI.
- Blog RSS per site.

## 11. Key copy & SEO structure (Fable-written; Sonnet keeps the voice)

Voice for all three: plain, specific, unhurried. No "unlock", "seamless", "world-class". Second person. Short sentences. Admit what takes time. Every claim about law is hedged until verified (§1.10).

### 11.1 paraguayresidency.com

- **Primary keyword cluster:** paraguay residency, paraguay permanent residency, paraguay temporary residency, paraguay residency requirements, paraguay cedula, paraguay tax residency, move to paraguay.
- **Hero H1:** "Paraguay residency, handled end to end."
- **Sub:** "Temporary residency, permanent residency and your cédula, prepared by people who do this every week in Asunción. You show up for the appointments. We do the rest."
- **Three value points:** "One fixed fee per route, quoted before you commit." · "Document checklist tailored to your nationality, not a generic PDF." · "We tell you when the standard route is wrong for you and point you to the Investor Pass or to waiting."
- **Route bento titles:** Temporary residency ("The standard first step. Two years, then permanent.") · Permanent residency ("Ten-year card. Presence rules apply — ask us.") · Investor Pass ("Straight to permanent, with a qualifying investment. Separate brand, same team.")
- **Meta title:** "Paraguay Residency Services — Temporary, Permanent & Cédula" · **Meta description:** "Done-for-you Paraguay residency. Fixed fees, nationality-specific checklists, appointments in Asunción. Find your route in 2 minutes."
- **Internal linking rule:** every article → its hub + the one service page it supports + the Route Finder.

### 11.2 paraguayinvestorpass.com.py

- **Keyword cluster:** paraguay investor pass, paraguay residency by investment, paraguay golden visa, paraguay permanent residency investment, invest in paraguay residency.
- **Hero H1:** "Permanent residency in Paraguay, in one step."
- **Sub:** "The Investor Pass lets qualifying investors skip temporary residency entirely. We structure the investment, file the application and stay with you until the permanent card is in your hand."
- **Three value points:** "Four qualifying routes — real estate, productive business, financial instruments, tourism — we tell you which one fits your capital and your goals." · "Investment thresholds and program rules are new and still moving; we quote the current figures on your call, not from a stale web page." · "Nothing is filed until you have seen the full cost, timeline and exit options in writing."
- **Meta title:** "Paraguay Investor Pass — Direct Permanent Residency by Investment" · **Meta description:** "Skip temporary residency. The Paraguay Investor Pass (2026) grants permanent residency to qualifying investors. Routes, requirements, timeline and a straight answer on whether you qualify."
- **Comparison page angle:** "Investor Pass vs standard residency: the Pass buys time, not a different outcome. Here is when the time is worth the money."

### 11.3 paraguayinvestorguide.com

- **Keyword cluster:** paraguay residency guide, how to get paraguay residency, paraguay residency cost, moving to paraguay guide, paraguay residency step by step.
- **Hero H1:** "The Paraguay residency guide we wish existed before we did it ourselves."
- **Sub:** "Every step, document, cost and mistake, written down once, kept current. Read it in an evening. Decide with real numbers."
- **Offer:** "Instant PDF · free updates for 12 months · 14-day refund, no questions."
- **Chapter outline (also `docs/guide-outline.md`):** 1 Why Paraguay (and why not) · 2 The routes compared · 3 Documents, apostilles, translations by nationality · 4 Costs, real ones · 5 Timeline week by week · 6 Cédula and RUC · 7 Banking · 8 Taxes for residents · 9 Family · 10 Investor Pass overview · 11 Mistakes we see monthly · 12 Checklists.
- **Meta title:** "Paraguay Residency Guide (2026) — Steps, Costs, Documents" · **Meta description:** "The complete Paraguay residency guide: routes compared, documents by nationality, real costs, week-by-week timeline. Instant PDF, 12 months of updates."
- **Thank-you upsell:** "Want it done for you? Book a 20-minute call with the team that wrote this." → hub `/book`.

### 11.4 Facts sources to seed `facts.ts` (all `verified: false` until the lawyer signs off)

Investor Pass launch and framing: Fragomen — https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html · Immigrant Invest — https://immigrantinvest.com/insider/paraguay-investor-pass/ · Yahoo Finance — https://finance.yahoo.com/economy/policy/articles/paraguay-offers-direct-permanent-residency-152937040.html. Public sources disagree on the minimum (USD 70k, 150k and 200k all appear). That disagreement is exactly why §1.10 exists. The canonical source to obtain is the resolution text itself (cited as Resolución 0283/2026 by one source).

## 12. Tooling notes for build sessions

- `/design` (the built-in Claude Design canvas skill) works inside Claude Code in this repo. Use it in S3–S5 to draft a hero or a bento section as artboards before coding; the canvas is a draft, the React component is the deliverable. `DesignSync` can push a component library to a Claude Design project; not required for this build.
- Imagery only via `higgsfield-web-imagery`; never hand-place files.
- Never commit `.env`, the real guide PDF, or Stripe keys.

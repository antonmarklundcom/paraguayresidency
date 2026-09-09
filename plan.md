# Paraguay Residency Group — one Next.js app, seven domains

**Repo:** antonmarklundcom/paraguayresidency · **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind + Drizzle + MySQL, per `nodejs-mysql-hostinger-stack` · **Method:** `phased-autonomous-build` · **Model rule:** `.claude/skills/fable-cost-guardrail/SKILL.md` (v2, Fable 5.1)

| Phase | Model | Prompt file | Plan sections | How it starts |
|---|---|---|---|---|
| F0 | Fable 5.1 (done) | — | this plan | Anton opened it |
| O1 | Opus (done, PR #2) | `prompts/opus-1-foundation.md` | §2, §5.1 | Anton pasted one line in a fresh Opus window |
| O2 | Opus (done, PR #4) | `prompts/opus-2-conversion-core.md` | §5.2 | spawned by O1 |
| F8 | Fable 5.1 (done 2026-09-07, approved §1.9) | `prompts/fable-8-platform-consolidation-plan.md` | §12 | Anton opened it manually; it spawned nothing |
| O9 | Opus (done, PR #7) | `prompts/opus-9-consolidation-foundation.md` | §1.11–§1.15, §2, §5.4, §12 | Anton pasted one line in a fresh Opus window — ran BEFORE S3; **last schema-shaping phase** |
| S3 | Sonnet | `prompts/sonnet-3-residency-site.md` | §6.1, §11.1 | spawned by O9 |
| S4 | Sonnet | `prompts/sonnet-4-investorpass-site.md` | §6.2, §11.2 | spawned by S3 |
| S5 | Sonnet | `prompts/sonnet-5-guide-site.md` | §6.3, §11.3 | spawned by S4 |
| S6 | Sonnet (PR #13 open, owner-blocked) | `prompts/sonnet-6-deploy-seo-imagery.md` | §6.4 | spawned by S5; goes live with the three original brands on their real domains. Blocked on Anton (hosting, DNS, Stripe live — `docs/decisions-needed.md` on `phase/s6`); he re-runs it after S16 |
| F9 | Fable 5.1 (done 2026-09-07, approved §1.9) | `prompts/fable-9-domain-rebrand-replan.md` | §1.11, §11.1–§11.3, §11.7, §12.2, §6.11 | Anton opened it manually; it spawned nothing |
| S16 | Sonnet | `prompts/sonnet-16-domain-sweep.md` | §6.11 | **Anton pastes one line in a fresh Sonnet window** — the domain sweep; nothing brand-shaped runs before it merges |
| S10 | Sonnet | `prompts/sonnet-10-frontier-site.md` | §6.5, §11.5 | spawned by S16, in parallel with S11–S14 |
| S11 | Sonnet | `prompts/sonnet-11-residenciaes-site.md` | §6.6, §11.6 | spawned by S16, parallel |
| S12 | Sonnet | `prompts/sonnet-12-residenciapt-site.md` | §6.7, §11.7 | spawned by S16, parallel |
| S13 | Sonnet | `prompts/sonnet-13-flytta-site.md` | §6.8, §11.8 | spawned by S16, parallel |
| S14 | Sonnet | `prompts/sonnet-14-guide-members.md` | §6.9 | spawned by S16, parallel |
| S15 | Sonnet | `prompts/sonnet-15-deploy-new-domains.md` | §6.10 | spawned by whichever of S10–S14 merges last, **and only if S6 has merged** (claim rule in §4.12); otherwise Anton pastes it after S6 |
| F7 | Fable 5.1 (approved by Anton, see §1.9) | `prompts/fable-7-launch-review.md` | §5.3 | **Anton opens it manually** — S15 never spawns it |

Total automated build: 3 Opus + 11 Sonnet sessions. Fable touches the plan ends and the two replans only (F0; F8 and F9 as mid-build replans opened by Anton; F7 at the end). Neither replan spawned anything. **Chain as of F9:** S16 (Anton pastes) → S10–S14 in parallel (spawned by S16) → S15 (claim rule, needs S6 merged) → F7 (Anton opens). S6 sits beside that chain: it is owner-blocked on hosting, DNS and Stripe live, and Anton re-runs it whenever those are done; S15 is the only phase that waits on it. S10–S14 run in parallel per `phased-autonomous-build`'s two-lane pattern: one sequential Opus foundation lane (O9), then content phases that each own their own files.

---

## 1. Decisions already made — do not re-litigate

1. **Seven domains, one app, one repo, one database, one hosting slot.** Domains are rows in a site registry; adding a domain is a config entry plus a page folder, never a new app. The three launch brands are below; the four consolidated brands (2026-09-07, F8) are in §1.11. `realestateinparaguay` stays its own app (real estate, not residency).
2. **The three brands and their roles in one funnel:**
   - `paraguayresidency.co.uk` (domain decided F9, see §1.11) — **the hub.** High-ticket done-for-you residency services (temporary → permanent residency, cédula, RUC/tax residency, family). Primary English service surface, `/admin` host, redirect target for unknown hosts. Lead form + consultation booking.
   - `paraguayinvestorpass.com` — **the premium spoke.** Brand name "Paraguay Investor Pass". Investor Pass (direct permanent residency by investment, launched April 2026). Dedicated brand because it targets a different searcher (investors, family offices, migration agents) and a different ticket size. Same lead pipeline, tagged `site=investorpass`.
   - `paraguayresidencyguide.com` — **the low-ticket entry.** Brand name "Paraguay Residency Guide". A paid digital guide (PDF + updates) Anton runs alone. Buyers are nurtured toward the two service brands. Also the newsletter home, and the only brand that sells.
   - Funnel direction: Guide ($7) → Residency service ($$) → Investor Pass ($$$). Every brand links to the other two in the footer; the Guide upsells the services on its thank-you page; the service sites offer the Guide as the "not ready yet" exit.
3. **Language:** every brand has exactly one locale, set in the registry (`en` for residency, investorpass, guide, frontier; `es` for residenciaes; `pt` for residenciapt; `sv` for flytta). All UI strings go through the i18n layer; a shipped locale must be complete (`verify:i18n` fails on any missing key per locale). Brands are not translations of each other, so no `hreflang` between them. **URL rule (amended 2026-09-07):** content and service slugs are written in the brand's locale (`/residencia/temporal` on the `.es` brand, `/investor-pass` on the English brands). The shared conversion and legal routes keep their English paths on every brand — `/route-finder`, `/route-finder/result`, `/contact`, `/book`, `/confirm`, `/unsubscribe`, `/thank-you`, `/login`, `/members`, `/privacy`, `/terms` — so O2's wiring and cross-brand deep links never change. Localizing those paths is Backlog.
4. **Content lives in the repo as MDX** (`content/<site>/…`), not in an admin CMS. Anton and Claude edit content via PRs. Leads, orders, subscribers live in MySQL. A minimal `/admin` (leads + orders list, email/password login, `admin` role) exists on the hub domain only.
5. **Payments:** the Guide's $7 entry product sells through Stripe Checkout (hosted page) + webhook → `purchases` row → signed download link + email; no cart. Price is an env value, default `700` cents / $7 (confirmed 2026-09-07 — the low-ticket entry price, deliberately matched to the tripwire price point pararesi was testing, so the Guide brand absorbs that product line rather than needing a separate domain). Since F8, buyers also get a member account (magic-link login, no password) because the same `users` table carries the Insider membership — see §1.12–§1.13.
6. **Leads:** one `leads` table with a `site` column. Every form posts to VenderCRM via `vendercrm-lead-capture` AND stores locally (local store is the source of truth if CRM is down). Email notification via Resend (or Hostinger SMTP fallback).
7. **Hosting decision is deferred to phase S6 with a hard rule:** the app is host-agnostic (Node server, `output: 'standalone'` optional, no Vercel-only APIs). First choice: one Hostinger Node.js slot with all three domains attached. If hPanel cannot attach multiple custom domains to one Node app, fallback is a Hostinger KVM VPS running the same app behind Caddy (automatic SSL, unlimited hostnames). Never three slots.
8. **Design:** bespoke per brand but one component library. Shared tokens (spacing, type scale, radius, motion) + a per-site theme (accent, display font, imagery mood). Patterns from `nextjs-national-lead-gen` §4: Residency = split-screen hero + bento "routes" grid; Investor Pass = big-type editorial, dark-first, one gold-ish accent; Guide = single long-form sales page, warm light theme, big-type. Visual drafts may be produced with `/design` (see §12) — those drafts are input, the Next.js components are the deliverable.
9. **Fable 5.1 usage approved for this project:** F0 (this plan, including §11 key copy), F7 (launch review, opened manually by Anton), and **F8 (2026-09-07 approval)** — finalizing the §12 platform-consolidation proposal into locked decisions, naming the remaining SiteKeys, writing key copy for any new brand needing distinct positioning, and writing the next Opus/Sonnet phase's prompt file(s) per `prompts/fable-8-platform-consolidation-plan.md`. F8 is spec/planning work, never spawned, and never spawns another Fable phase. **F9 (2026-09-07 approval)** — re-planning the brand↔domain map after Anton confirmed which domains he actually owns, rewriting the §11 copy for the renamed brands, and updating the S10–S15 prompt files, per `prompts/fable-9-domain-rebrand-replan.md`. Same terms: Anton opens it himself, it spawns nothing. No other phase, subagent, spawned session, or automation runs on Fable. These approvals are recorded here per guardrail v2 §"Approved Fable work".
10. **Legal figures are not copy-pasted from the web.** Every number about investment thresholds, fees, timelines and residency validity is rendered from `content/shared/facts.ts` and each entry carries a `verifiedBy`/`verifiedOn` field. Until Anton's legal partner verifies an entry, the page shows "from USD X — confirm current thresholds on your call" style wording, never a bare number. On non-English brands the hedged text is written in the brand's locale (`facts.ts` carries per-locale `display`/`hedged` with `en` required and the others falling back to `en`).
11. **The four consolidated brands (decided 2026-09-07, F8; domains corrected by F9):** `paraguayfrontier.com` → SiteKey `frontier` (en, plan-B/lifestyle angle for Americans and expats, §11.5) · `residenciaparaguay.es` → `residenciaes` (es, Spain first then Spanish-speaking LatAm, §11.6) · `vidanoparaguai.com` → `residenciapt` (pt-BR, brand name **Vida no Paraguai**, Brazil, §11.7) · `flyttatillparaguay.se` → `flytta` (sv, Anton's personal-story brand, §11.8). All four are lead-gen spokes for the same service team, tagged by `site`. The `flyttatillparaguay` repo is ported into this app (§12.4) and retired in S15; `pararesi` sells through `guide` (§1.12) and is retired after its data is imported. ES and PT brands do not upsell the English Guide; their soft exit is the newsletter until a localized edition exists (Backlog).

    **Amended 2026-09-07 — the domains F8 assumed are not the domains Anton owns.** Confirmed by him
    after O9 and S3–S5 had merged. He owns: `paraguayresidencyguide.com` (the `guide` brand),
    `paraguayinvestorpass.com` (the `.com`, not the `.com.py` — this closes §8.2),
    `paraguayfrontier.com`, `residenciaparaguay.es`, `vidanoparaguai.com` (the Brazil brand, renamed
    **Vida no Paraguai**) and `flyttatillparaguay.se`. He does **not** own
    `paraguayresidency.com` — the hub — and it is not available to buy, nor
    `paraguayinvestorguide.com` or `residencianoparaguay.com`. He DOES own
    **`paraguayresidency.co.uk`**, which no version of this plan had recorded — the only
    `paraguayresidency`-branded domain available to the project, and therefore the leading hub
    candidate, against the objection that a `.co.uk` is geo-targeted to the UK. Changing a domain is
    free (three lines per brand in the registry); changing a `SiteKey` is a migration, because
    `siteEnum` mirrors `SITE_KEYS` on nine tables.

    **Decided 2026-09-07 (F9) — the hub runs on `paraguayresidency.co.uk`. Locked.** The corrected
    map is §12.2; the registry sweep is phase S16 (§6.11) and nothing brand-shaped runs before it
    merges. Why this and not the alternatives:

    - *Every SiteKey keeps its meaning and every owned domain maps one-to-one to a brand.* Seven
      keys, seven domains, no migration, no purchase, no phase deleted. S3's 17 pages and 8 articles
      stay exactly what they are; only what `residency` points at changes.
    - *The ccTLD cost is real, and bounded.* Google treats `.co.uk` as UK-targeted and Search
      Console cannot override that for a ccTLD, so the hub will rank harder than a `.com` would for
      a searcher in the US, Canada or Australia. But those three searchers are exactly the audience
      §11.5 already gives to `paraguayfrontier.com`, a `.com`, and the informational long tail that
      the hub's articles chase is the kind of query where ccTLDs do rank worldwide. The hub keeps its
      global positioning (§11.1 is unchanged in voice and H1); it simply gains a UK boost for a
      cohort §11.5 names anyway, and loses some US reach that `frontier` is built to carry. The
      Guide's `.com` now literally matches its own keyword cluster, which it never did before.
    - *Promoting `paraguayfrontier.com` to hub* (option 2) would have given up the one brand name
      that says what the company does, put "Paraguay Frontier" in every sibling's footer as "the
      service team", and left `.co.uk` idle or needing a new content phase to fill. It trades the
      brand for the TLD; the TLD is the cheaper thing to be wrong about.
    - *Running the hub on the Guide domain* (option 3) puts `/admin`, `/login` and `/members` on the
      one selling domain and mixes a $7 product with high-ticket services on one host. Rejected.
    - *Buying a domain* (option 1) is the only alternative that keeps a `.com`, and it is still
      available later: if Anton ever acquires a global residency `.com`, the move is three registry
      lines plus a 301 from `.co.uk`, with the usual temporary ranking dip of a domain move
      (Backlog, §10). Nothing decided here forecloses it.
    - *A UK spoke as an eighth brand* is not needed while the hub itself is the UK-domain brand; if a
      distinct UK-only positioning ever earns its own phase it would want its own domain, so it is
      moot for now.

    Consequences: `HUB_SITE` stays `residency`; `/admin` lives on `paraguayresidency.co.uk` only; the
    unknown-host redirect and `APP_ORIGIN_FALLBACK` target `https://paraguayresidency.co.uk`; the CRM
    source tag for the hub is `paraguayresidency.co.uk`; the sending address default becomes
    `hello@paraguayresidency.co.uk` (Anton's DNS for that domain must carry the Resend/SMTP records,
    §7). `paraguayinvestorpass.com.py` is **not** registered and not held (§8.2).
12. **One product-tier vocabulary for the whole platform:** `none | entry | insider`. `entry` = a one-time low-ticket purchase (the $7 Guide today; pararesi's tripwire maps here). `insider` = the recurring membership (pararesi's Insider), sold through the `guide` brand. High-ticket residency and Investor Pass work is a **service, not a tier** — it is a lead, never an entitlement, and nothing is gated on it. Member content carries `min_tier enum(entry, insider)`; `entry` outranks `none`, `insider` outranks `entry`. `users.tier` is a denormalized cache; the truth is `src/lib/entitlements.ts` computed from `purchases` + `subscriptions` (Insider decays to `entry` 3 days after a cancelled or expired subscription ends, and to `entry` not `none` because the buyer keeps what they bought).
13. **Two payment providers, one set of tables.** Stripe handles one-time products (built in O2); Lemon Squeezy handles subscriptions (built and proven in pararesi's code). **Amended F9:** pararesi was never deployed — its own plan marks deploy "owner-blocked, not started", it has no domain, no live store and no live database — so there are, on the evidence, no existing subscribers to keep anywhere. The Insider tier is therefore a **new product launch**, not a cutover; S15's import step is a verification that the pararesi database is empty (or an import if it is not — same idempotent script either way, §6.10.3). Anton confirms with one word before S15; the plan is correct under either answer. `products.provider` decides the checkout per product; both webhooks write `webhook_events` first, then `purchases`/`subscriptions`, then the user's tier. No forced migration of anyone's buyers; unifying to one processor is revisited when both carry real volume (Backlog).
14. **Member content bodies live in MDX** (`content/<site>/members/<module>/<lesson>.mdx`), consistent with §1.4. The database holds only what needs querying: module/lesson metadata, ordering, `min_tier`, drip offsets and per-user progress. pararesi's DB-backed lesson and blog bodies are exported to MDX by the O9 import script.
15. **Member auth is a passwordless magic link** (signed token via `src/lib/signing.ts`, emailed, exchanged for a separate `member` iron-session cookie). Staff keep the password login on `/admin`. A $7 buyer never sets a password; the email a processor gives us is the identity.

## 2. Roles & object model

**Roles** (`users.role` enum): `admin | editor | member`. `admin` is the only staff role at launch; `editor` reserved. `member` (added in O9) is every buyer; members own their `lesson_progress` and nothing else. What a member may see is a **tier** (§1.12), not a role.

**Sites** (code constant, not a DB table, but mirrored as the `site` enum on data rows):

```ts
// src/sites/registry.ts
export type SiteKey =
  | 'residency' | 'investorpass' | 'guide'                    // O1
  | 'frontier' | 'residenciaes' | 'residenciapt' | 'flytta';  // O9
export type Locale = 'en' | 'es' | 'pt' | 'sv';               // src/i18n, O9
export interface SiteConfig {
  key: SiteKey;
  hosts: string[];              // ['paraguayresidency.co.uk','www.paraguayresidency.co.uk','residency.localhost']
  canonicalHost: string;        // apex; www 301s here
  name: string; tagline: string;
  locale: Locale;               // exactly one per brand (§1.3); drives <html lang>, messages/<locale>/, money formatting
  currencies: string[];         // display order for money facts: ['USD'] · ['EUR','PYG'] · ['BRL','USD','PYG'] · ['SEK','USD']
  theme: SiteKey;               // maps to CSS variable set
  products?: string[];          // product slugs sold on this brand (guide: ['guide-entry','guide-insider']); absent = lead-gen only
  nav: NavItem[]; footer: FooterSpec;
  analytics?: { plausibleDomain?: string; gtmId?: string };
  crm: { source: string };      // VenderCRM source tag
  siblings: SiteKey[];          // cross-links in footer
}
```

**Tables** (`src/db/schema.ts`; identifiers English; `site` enum column wherever a row belongs to a brand; the `site` enum mirrors `SITE_KEYS` and a test keeps them in sync). O1 created the first eight; O9 generalizes `users`/`products`/`orders` and adds the member platform. **O9 is the last schema-shaping phase** — S10–S15 never touch this file.

| table | purpose | key columns |
|---|---|---|
| `users` | staff login AND members | `id, email uniq, password_hash null (staff only), role enum(admin,editor,member), tier enum(none,entry,insider) (cache — truth is entitlements.ts), tier_expires_at null, home_site enum(site) null, created_at, last_login_at` |
| `provider_customers` | a user's id at each processor | `id, user_id, provider enum(stripe,lemonsqueezy), provider_customer_id, uniq(provider, provider_customer_id)` |
| `leads` | every form submission from any site | `id, site enum, kind enum(consultation,investor_inquiry,contact,quiz), name, email, phone, whatsapp, country, nationality, message, quiz_answers json, quiz_result varchar, page_path, utm json, attribution json (first-touch: utm, landing path, referrer, first seen — ported from flytta in O9), crm_status enum(pending,sent,failed), crm_response json, created_at` |
| `lead_events` | audit trail | `id, lead_id, type, payload json, created_at` |
| `subscribers` | newsletter (any site may post) | `id, site, email, name, source, status enum(pending,confirmed,unsubscribed), confirm_token, created_at, confirmed_at` |
| `products` | everything sold on any brand | `id, slug uniq, site, name, tier enum(entry,insider), kind enum(one_time,subscription), provider enum(stripe,lemonsqueezy), provider_price_id, price_cents, currency, interval enum(month,year) null, file_key null, version, active` |
| `purchases` (was `orders`) | one-time checkouts from either provider | `id, site, product_id, user_id null, email, name, provider, provider_order_id, provider_checkout_id (the Stripe session id), amount_cents, currency, status enum(pending,paid,refunded), utm json, raw json, created_at, paid_at; uniq(provider, provider_order_id)` |
| `subscriptions` | recurring memberships | `id, site, product_id, user_id, provider, provider_subscription_id, status enum(active,past_due,cancelled,expired,paused), current_period_end, cancelled_at null, ends_at null, raw json, created_at, updated_at; uniq(provider, provider_subscription_id)` |
| `download_tokens` | signed delivery | `id, purchase_id, token uniq, expires_at, downloads, max_downloads` |
| `webhook_events` | idempotency log for both providers | `id, provider, provider_event_id, type, payload json, received_at, processed_at null, error null; uniq(provider, provider_event_id)` |
| `cron_runs` | nightly tier reconcile + any future job | `id, job, started_at, finished_at null, ok, note` |
| `modules` | course sections | `id, site enum null (null = every brand), slug, title, sort, min_tier enum(entry,insider), drip_days int, active; uniq(site, slug)` |
| `lessons` | lesson metadata; body is MDX (§1.14) | `id, module_id, slug, title, sort, min_tier, drip_days, content_path, active; uniq(module_id, slug)` |
| `lesson_progress` | per-member completion | `user_id, lesson_id, completed_at; pk(user_id, lesson_id)` |
| `resources` | member downloads (streamed from `private/`) | `id, site null, slug, title, file_key, min_tier, sort` |
| `updates_posts` | member-only changelog / updates feed | `id, site null, slug, title, min_tier, published_at, content_path` |
| `facts_verification` | mirror of `facts.ts` verification state for the admin view | `key, verified_by, verified_on, note` |

Not imported from pararesi (decided F8): `blogPosts` (→ MDX under `content/guide/blog/`), `leads`/`leadTokens` (its lead-magnet signups → `subscribers` with `source='pararesi-import'`), `leadEmails` (sequenced nurture → Backlog).

**Routing model** (the multi-domain core, O1):

```
middleware.ts       host header → SiteKey (registry lookup) → rewrite to /_sites/<key>/<path>
                    www.* → 301 apex · unknown host → 301 https://paraguayresidency.co.uk (HUB_SITE's canonical host)
                    sets request header x-site; local dev via *.localhost or ?site= override
src/app/_sites/[site]/layout.tsx   theme class + nav/footer from registry
src/app/_sites/[site]/(pages)…     each brand's routes; shared components in src/components
src/app/_sites/[site]/sitemap.ts   per-host sitemap, urls from that site's content only
src/app/_sites/[site]/robots.ts
src/app/api/…                      shared endpoints (leads, checkout, stripe webhook, subscribe)
src/app/admin/…                    hub domain only (middleware blocks admin on other hosts)
src/app/api/lemonsqueezy/webhook   O9; sibling of the Stripe webhook, same webhook_events log
/login, /members/…                 O9 lib + S14 pages; mounted only on brands whose registry entry lists products
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

**Platform (O9–S15, decided F8):**
- Four more brands as registry entries + page folders (§1.11), each with its own locale, theme and content; the shared Route Finder, forms and newsletter run on all seven hosts.
- Member platform on the `guide` brand: magic-link login, `entry`/`insider` tiers (§1.12), drip-gated modules/lessons with MDX bodies, resources, updates feed, Lemon Squeezy subscriptions beside Stripe one-time purchases (§1.13).
- Import scripts for pararesi (members, purchases, subscriptions, lessons → MDX) and the flytta content port; both source repos retired in S15.

**Approved extras (chained):** (a) WhatsApp click-to-chat on the two service brands — trivial, ship in S3/S4. (b) Consultation booking = Cal.com embed link if `NEXT_PUBLIC_BOOKING_URL` set, otherwise the form — ship in O2.

**Backlog (§10):** Spanish locale, Investor Pass ROI calculator, guide editions/upsells, affiliate program, editor role UI.

## 4. Autonomy protocol

1. Work until the phase's exit criteria all pass; never ask permission for in-plan work.
2. One PR per phase: branch `phase/<id>` off latest `main`; create, watch, merge when green. A red build is always this session's own work. Never start on top of an unmerged previous phase.
3. Minor non-blocking issues → `KNOWN-ISSUES.md`, keep building.
4. Stop and ask ONLY for: a missing credential with no graceful fallback, or a bad-foundation decision (schema shape, routing model, money math) where guessing wrong forces a rewrite. Everything else: choose reasonably, record it in §9, continue.
5. Missing env values never block: document in `.env.example`, degrade gracefully (CRM off → local store only; Stripe off → "coming soon" button; email off → log to console).
6. Every prompt is re-runnable: check what exists on the branch first, continue from the first unmet exit criterion.
7. Model-B (Sonnet) hard limits: no schema, auth, middleware/routing, payment, entitlement or CRM logic changes (`src/db`, `src/lib/leads.ts`, `src/lib/email.ts`, `src/lib/entitlements.ts`, `src/lib/member-auth.ts`, `src/lib/stripe.ts`, `src/lib/lemonsqueezy.ts`, `src/app/api`, `src/middleware.ts`, the shape of `src/sites/registry.ts`, `scoring.ts`). Page data access only through the query/action layer O1, O2 and O9 built. Need something? Workaround + Backlog note.
8. **Model cost guardrail (v2, Fable 5.1):** build phases, subagents, spawned sessions, workflows and triggers run on Opus or Sonnet only. Fable runs only in windows Anton opens himself. The Fable phases in this plan (F7, F8, F9) are approved in §1.9 and are never spawned: F8 and F9 were opened by Anton and each ended with a report telling him which Sonnet/Opus line to paste next; the S15 handoff ends with a report telling Anton to open F7. Any session that thinks it needs Fable elsewhere stops and asks Anton with the reason.
9. **Phase handoff** — hand off only when four gates pass: PR merged green; exit checklist passed; pre-handoff audit done (re-run `npm run build` + `npm run verify`, adversarially re-read your own merged diff, fix findings); §9 build-log entry committed. Then spawn the next phase as a NEW session via claude-code-remote `create_session`: inherit environment and permission mode (never `plan`), `model` per the phase table (Opus or Sonnet only), `prompt` exactly `Read prompts/<next-file>.md in this repo and execute it.` Then end with the phase report. Fallback when `create_session` is unavailable: continue in the same window if the next phase uses the same model; stop and report at a model switch.
10. **Build log:** before merging, append a dated 5–10 line entry to §9 — phase id + PR link, what now exists, decisions/deviations, where the next phase should look first. Fresh sessions orient from `plan.md` + §9 + `KNOWN-ISSUES.md` only.
11. **Facts rule (§1.10):** no session ever hardcodes a legal/financial number in JSX or MDX. Add it to `content/shared/facts.ts` with `verified: false` and render through `<Fact k="…"/>`. On a non-English brand, add that locale's `display`/`hedged` text to the same entry; never a second facts file.
12. **Parallel content lane (S10–S14):** gated on **S16 merged** (amended F9 — it was S6, but S6 is owner-blocked on hosting and DNS and the content phases do not depend on a deploy). S16's handoff spawns all five at once, each on its own `phase/<id>` branch off the same `main`, each owning only `src/app/sites/<key>/`, `content/<key>/`, `src/i18n/messages/<locale>/<key>.json`, `src/styles/themes/<key>.css` and its own MDX (S14 owns `src/app/sites/guide/{login,members,insider,account}/` and `content/guide/members/`). A phase that must touch a shared file (`common.json`, a shared component) makes the smallest additive change and rebases before merging; conflicts are that phase's to resolve. **S15 claim rule:** after your PR merges, list the five PRs; if all of S10–S14 are merged and no `phase/s15` branch exists on origin, push an empty `phase/s15` branch first (the claim). Then, **only if S6 (PR #13) has also merged**, spawn S15 per §4.9; if S6 is still open, do not spawn — end with a report saying S15 is claimed and waits on S6, and that Anton pastes `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.` into a fresh Sonnet window once S6 merges. If the branch already exists, someone else claimed it — end with your report.

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

Scope is review + inline fixes only, no new features: read every public page of the seven sites as a first-time visitor (the four non-English or non-hub brands included); check the funnel (guide → residency → investor pass) actually cross-links as §1.2 says and that the member area gates on tier as §1.12 says; tighten hero/positioning copy where Sonnet's fill diverged from §11; verify every `<Fact>` still hedges unless marked verified; run Lighthouse on the three homes and the guide sales page; fix small findings inline; put anything larger in Backlog. Output: a short launch report with the §7 items still open.

### 5.4 Phase O9 — Consolidation foundation (SiteKeys, locales, schema merge, entitlements, both providers)

Runs after O2 and **before S3**, so every content phase, old and new, builds on one final foundation and the production database receives one schema at go-live instead of a migration of live purchase rows. This is the last schema-shaping phase. It builds no pages beyond one themed placeholder home per new brand.

Load skills: `nodejs-mysql-hostinger-stack`, `vendercrm-lead-capture`, `wp-to-native-admin` (§ auth + role-gating patterns only). The session must attach `antonmarklundcom/pararesi` and `antonmarklundcom/flyttatillparaguay` read-only (`add_repo`) — it reads them, it never pushes to them.

Tasks:
1. **Registry + resolver.** `SiteKey` union and `SITE_KEYS` gain `frontier`, `residenciaes`, `residenciapt`, `flytta` (§1.11); `SiteConfig` gains `locale: Locale`, `currencies`, `products?` (§2). Four entries: hosts = apex + `www.` + `<key>.localhost`; `canonicalHost` = apex; `crm.source` = apex; siblings: frontier → residency, investorpass, guide · residenciaes → residency, investorpass · residenciapt → residency, investorpass · flytta → residency, guide; nav/footer minimal (home, contact, privacy, terms — the content phases fill them). `theme` per key with a minimal `src/styles/themes/<key>.css` (distinct accent + font, nothing more). Extend `tests/resolve.test.ts` for the eight new hosts and the www redirects. Update `siteEnum` in `src/db/schema.ts` and add a test asserting it equals `SITE_KEYS`.
2. **Locale becomes real.** `LOCALES = ['en','es','pt','sv']`; `messagesFor(site)` loads `messages/<site.locale>/common.json` + `<site>.json`; no silent fallback to `en` in production — instead `verify:i18n` fails when any key referenced in code is missing from any shipped locale's `common.json` or from a site's own file. O9 writes complete `es`, `pt` (Brazilian) and `sv` `common.json` translations (nav, footer, forms, errors, the Route Finder questions and result copy, newsletter, legal links) and a minimal `<site>.json` per new brand (name, tagline, placeholder home). `<html lang>` and `Intl` formatting from the site locale; `formatMoney(cents, currency, locale)` in `src/lib/money.ts`. `facts.ts`: `display` and `hedged` become `string | { en: string; es?; pt?; sv? }`, `<Fact>` picks the site locale and falls back to `en`; add `mercosur.residency_route` (hedged, `verified: false`, for §11.6–§11.7) and `tax.foreign_income_treatment` (hedged, for §11.5). Existing tests keep passing.
3. **Schema merge** exactly per the §2 table: widen `users`; add `provider_customers`, `subscriptions`, `webhook_events`, `cron_runs`, `modules`, `lessons`, `lesson_progress`, `resources`, `updates_posts`; generalize `products`; rename `orders` → `purchases` with provider columns and `download_tokens.order_id` → `purchase_id`; widen `leads.site` and add `leads.attribution`. Generate the migration with drizzle-kit (write the rename statements by hand in the generated SQL if the generator emits drop+create — never lose rows). Seed: `guide-entry` (site guide, entry, one_time, stripe, `GUIDE_PRICE_CENTS` default 700, file_key = the guide PDF) and `guide-insider` (site guide, insider, subscription, lemonsqueezy, `INSIDER_PRICE_CENTS` + `INSIDER_INTERVAL` from env, `LEMONSQUEEZY_INSIDER_VARIANT_ID`). Seed stays idempotent.
4. **Entitlements.** `src/lib/entitlements.ts`: `TIERS = ['none','entry','insider']`, `tierRank`, `effectiveTier(user, subscriptions, purchases, now)` — `insider` while a subscription is `active`/`past_due`/`paused`, or `cancelled`/`expired` with `ends_at` (or `current_period_end`) + 3 days grace still ahead; otherwise `entry` if any paid `entry` or `insider` purchase/subscription ever existed; otherwise `none`. `hasTier(tier, minTier)`, `isDripped(lesson, firstEntitledAt, now)`, `requireTier(minTier)` for server components (redirects to `/login` when anonymous, to the product's sales path when under-tiered), `reconcileTiers()` used by `scripts/reconcile-tiers.ts` (writes `cron_runs`). Pure functions, table-driven tests for decay, grace, upgrade, and drip.
5. **Member auth.** `src/lib/member-auth.ts`: request magic link (`POST /api/auth/magic`, rate-limited, always 200), verify (`GET /api/auth/magic/[token]` → sets the `member` iron-session cookie, separate name and secret from the admin session, `last_login_at`), `GET /api/auth/logout`. `/login` page body in `src/lib/conversion-pages.tsx` (S14 restyles it). Only brands whose registry entry lists `products` mount `/login` and `/members`; middleware 404s them elsewhere, with a test.
6. **Payments, both providers.** `POST /api/checkout` takes `{ product: slug }` and routes on `products.provider`: Stripe → the existing session flow (now writing `purchases`); Lemon Squeezy → `src/lib/lemonsqueezy.ts` creates a checkout via the LS API with `custom_data { site, product, email? }` and returns its URL. `POST /api/lemonsqueezy/webhook`: verify `X-Signature` (HMAC-SHA256 over the raw body with `LEMONSQUEEZY_WEBHOOK_SECRET`; pure function + fixture test like the Stripe one), insert `webhook_events` first (duplicate ⇒ 200, no-op), then handle `order_created` → `purchases`, `subscription_created|updated|cancelled|resumed|expired|paused|unpaused|payment_success|payment_failed` → `subscriptions` upsert, then find-or-create the `users` row by email (`role member`, `home_site`), `provider_customers`, recompute and store `tier`. Stripe's webhook does the same for its side. After any paid event: the existing purchase email plus a magic-link line; Insider gets a welcome email. Missing keys degrade per §4.5 (LS off ⇒ Insider button says "coming soon").
7. **Leads reconcile (§12.4).** Read flytta's `lib/vendercrm.ts` and `app/api/lead/route.ts`; port into `src/lib/leads.ts` what O2 lacks — first-touch attribution cookie (utm, landing path, referrer, first seen) stored on `leads.attribution`, idempotency by phone hash within a window so a double submit does not create a second CRM contact. Keep O2's signed-timestamp + honeypot guard. Tests for both additions. Nothing from flytta replaces O2's flow; it augments it.
8. **Import scripts.** `scripts/import-pararesi.ts` (`PARARESI_DATABASE_URL`, MySQL, same Drizzle stack): users → `users` (`member`, `home_site guide`, tier map `guide→entry`, `insider→insider`), `purchases`/`subscriptions` → same tables with `provider lemonsqueezy` and pararesi's LS ids, `lessonProgress` → `lesson_progress`, `modules`/`lessons`/`resources`/`updatesPosts` → rows with `site guide` and bodies written to `content/guide/members/<module>/<lesson>.mdx` and `content/guide/updates/<slug>.mdx`, `blogPosts` → `content/guide/blog/<slug>.mdx` with zod-valid frontmatter, pararesi `leads` → `subscribers` (`source pararesi-import`, keep their confirmed state). `--dry-run` prints counts; idempotent on provider ids and slugs; a fixture test runs it against a tiny in-memory copy of pararesi's shape. `scripts/reconcile-tiers.ts` from task 4.
9. **Admin.** `/admin/orders` becomes `/admin/purchases` with a subscriptions tab; new `/admin/members` (email, tier, expiry, provider ids, last login, a "grant tier until" support action written through `entitlements.ts` and logged). `requireRole` unchanged.
10. **Docs and hygiene.** `docs/platform.md` (tiers, providers, entitlement rules, how a brand lists a product, how to add the eighth domain); update `docs/conversion-core.md`; `.env.example` gains every new var (§7); `CLAUDE.md` first line says seven brands and lists the new keys; one placeholder MDX + home per new brand so all seven hosts render; `KNOWN-ISSUES.md` for anything deferred.

Exit: `npm run verify` green with the new tests (resolver ×8 hosts, `siteEnum`=`SITE_KEYS`, i18n completeness for four locales, entitlements table, LS signature fixture, checkout routing, leads attribution + idempotency, import dry-run fixture); seven `*.localhost:3000` hosts render distinctly themed placeholders with the right `lang` and canonical host; migration applied to a real MySQL from the O2 state without losing seeded rows, seed idempotent (two products); Stripe test purchase still works end to end and lands in `purchases`; LS webhook fixture → `subscriptions` row → user `insider`; `/login` and `/members` 404 on non-product brands; `/admin/members` lists the LS fixture user; PR merged.

## 6. Model-B phases (Sonnet)

Hard limits for all Sonnet phases: the §4.7 list — no changes under `src/db`, `src/lib/leads.ts`, `src/lib/email.ts`, `src/lib/entitlements.ts`, `src/lib/member-auth.ts`, `src/lib/stripe.ts`, `src/lib/lemonsqueezy.ts`, `src/app/api`, `src/middleware.ts`, `src/sites/registry.ts` shape (adding nav items/copy inside the registry is fine), `src/features/quiz/scoring.ts`. Page data access through `getPages/getPage/getHub`, the O2 server actions and the O9 member queries. Skills to load in every Sonnet phase: `nextjs-national-lead-gen` (§3 checklist, §4 restraint baseline), `web-design-system` if present in the skill list, otherwise the tokens in `src/styles`.

### 6.1 Phase S3 — the hub (`residency`; domain `paraguayresidency.co.uk` since F9)

Pages (all under `src/app/_sites/residency/`), one primary intent each:

```
/                                  hero (split) · who it's for · 3 routes bento (Temporary / Permanent / Investor Pass→sibling) · process timeline · why Paraguay (facts) · testimonials placeholder · FAQ · CTA
/residency/temporary-residency     service page + FAQ + form (consultation)
/residency/permanent-residency     service page (incl. "after temporary" path)
/residency/cedula                  cédula de identidad process
/residency/tax-residency           RUC, territorial tax, who it suits (hedged facts)
/residency/family                  spouse/children/dependents
/investor-pass                     short bridge page → paraguayinvestorpass.com (canonical there; this page is a teaser, noindex if thin)
/route-finder, /route-finder/result  the quiz (from O2)
/pricing                           packages table (Anton fills real prices; placeholder rows marked TODO → shown as "from" with a note until filled)
/process                           step-by-step timeline with documents checklist
/about, /contact, /book (booking embed or form)
/guides/[hub]/[slug]               content hub: hubs = documents, living-in-paraguay, taxes, comparisons ("Paraguay vs Uruguay residency", "Paraguay vs Panama")
/guide                             bridge → paraguayresidencyguide.com (soft CTA)
/privacy, /terms
```

Content to write in this phase: 8 MDX articles minimum (2 per hub), each 900–1400 words, one intent, internal links to hub + 2 related + the relevant service page. Copy from §11.1 for hero/positioning; everything else Sonnet writes in the same voice.

Exit: all pages render with unique titles ≤60 / descriptions ≤155; sitemap lists exactly these; JSON-LD validates (Organization sitewide, Service on service pages, FAQPage, BreadcrumbList, Article); no `<Fact>` bypassed; Lighthouse mobile ≥90 perf/SEO on `/` and one service page; forms submit through O2 actions; PR merged.

### 6.2 Phase S4 — paraguayinvestorpass.com (`investorpass`; the `.com`, corrected by F9)

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

### 6.3 Phase S5 — paraguayresidencyguide.com (`guide`; domain and brand name corrected by F9)

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

Exit: three domains live with SSL; `/api/health` OK on each host; Search Console verified; one live Stripe purchase + refund done; PR merged. Handoff: spawn S10, S11, S12, S13 and S14 at once per §4.12 (five `create_session` calls, Sonnet), then the phase report. F7 is not next yet — S15 reports that.

### 6.5 Phase S10 — paraguayfrontier.com (`frontier`, en)

Voice and copy anchor: §11.5. Theme: warm, wide, editorial — big type over landscape imagery, one earth-tone accent; not a prepper aesthetic. Lead form variant `consultation` tagged `site=frontier`; the Guide is the "not ready yet" exit.

```
/                         hero · "plan B, honestly" section · routes compared (Temporary / Permanent / Investor Pass→sibling) · territorial tax explained (hedged) · presence rules straight · process · FAQ · form
/why-paraguay             the frontier argument: cost, land, tax, stability — with the counter-arguments
/routes                   the three routes for people who may never live here full-time; links to hub service pages
/tax                      territorial tax, RUC, what it does and does not cover (every figure a <Fact>)
/process                  timeline + documents by nationality (US, CA, UK, AU, EU)
/pricing                  "from" table mirroring the hub's, marked TODO until Anton fills it
/route-finder(/result)    shared quiz
/stories/[slug]           6 articles: an American's first 90 days · land and farms as a foreigner · banking as a new resident · the presence rules nobody explains · healthcare and insurance · Paraguay vs Panama vs Uruguay vs Mexico for a plan B
/guide                    bridge → paraguayresidencyguide.com
/about, /contact, /privacy, /terms
```

Exit: S3's bar (titles, descriptions, sitemap, JSON-LD, `<Fact>`, Lighthouse ≥90 on `/` and `/tax`); leads tagged `site=frontier`; PR merged.

### 6.6 Phase S11 — residenciaparaguay.es (`residenciaes`, es)

Voice and copy anchor: §11.6. Spanish throughout (Spain register, `tú`); URLs in Spanish except the shared routes (§1.3). Prices and money facts in EUR first, PYG second. Distinct content: the Mercosur route (hedged `<Fact k="mercosur.residency_route">`) for Argentine, Uruguayan and other Mercosur nationals; the Spain exit angle (183 days, centre of interests — hedged, "confirm with your asesor"). No Guide upsell; the newsletter is the soft exit. Lead form variants `consultation` and `contact` tagged `site=residenciaes`.

```
/                                 hero split · para quién · 3 rutas bento · proceso · por qué Paraguay (facts) · FAQ · formulario
/residencia/temporal, /residencia/permanente, /residencia/cedula, /residencia-fiscal, /familia
/mercosur                         la vía Mercosur: quién califica y qué simplifica (hedged)
/pase-inversor                    bridge → paraguayinvestorpass.com (EN; say so)
/proceso, /precios, /nosotros
/route-finder(/result), /contact  shared
/guias/[hub]/[slug]               hubs: documentos · vivir-en-paraguay · impuestos · comparativas — 8 articles min (Paraguay vs Andorra, vs Portugal, vs Uruguay among them)
/privacy, /terms
```

Exit: S3's bar; `lang="es"`; no English UI string visible on any page (`verify:i18n` proves `common.json` is complete, a page crawl proves the rest); leads tagged `site=residenciaes`; PR merged.

### 6.7 Phase S12 — vidanoparaguai.com (`residenciapt`, pt-BR, brand "Vida no Paraguai")

Voice and copy anchor: §11.7 (rewritten by F9 — the brand is "life in Paraguay", and residency is the product that starts it; read the angle before the page list). Brazilian Portuguese throughout; URLs in Portuguese except shared routes. Money facts in BRL first, USD, PYG. Distinct content: the Mercosur route for Brazilians (hedged), tax framing against the Brazilian declaration (hedged, no "imposto zero"), the border-region angle (Ciudad del Este / Foz), and — new with the brand name — the living side: cost of living, safety, business and agro, schooling, healthcare. Every "life" page ends in a residency CTA; the brand sells residency, not tourism. The `morar-no-paraguai` hub is the lead hub and carries at least 3 of the 8 articles. No Guide upsell; newsletter soft exit. Leads tagged `site=residenciapt`.

```
/                                 hero split · para quem · 3 rotas bento · processo · por que o Paraguai (facts) · FAQ · formulário
/residencia/temporaria, /residencia/permanente, /residencia/cedula, /residencia-fiscal, /familia
/mercosul                         a rota Mercosul para brasileiros (hedged)
/investor-pass                    bridge → paraguayinvestorpass.com (EN; say so)
/custo-de-vida                    the living-cost page the brand name promises (every figure a <Fact>, BRL first)
/processo, /precos, /sobre
/route-finder(/result), /contact  shared
/guias/[hub]/[slug]               hubs: documentos · morar-no-paraguai · impostos · comparativos — 8 articles min (Paraguai vs Uruguai, vs Portugal, fronteira among them)
/privacy, /terms
```

Exit: S3's bar; `lang="pt-BR"`; no English UI string visible; leads tagged `site=residenciapt`; PR merged.

### 6.8 Phase S13 — flyttatillparaguay.se (`flytta`, sv)

Voice and copy anchor: §11.8, **but the existing repo comes first**: attach `antonmarklundcom/flyttatillparaguay` read-only and port `content/site.ts` (nav, footer, WhatsApp, author) into the `flytta` registry entry, `content/guider/` and `content/stader/` into `content/flytta/guider/` and `content/flytta/stader/` (same frontmatter pipeline; map `cluster` → `hub`, keep `relatedSlugs`, `faq[]`), and its `<StatRow>`/`<Disclaimer>` MDX components into `src/components` as shared components. Swedish throughout; URLs in Swedish except shared routes; money in SEK first, USD. Personal-story brand: first person plural is allowed here and nowhere else. Guide upsell allowed (Swedes read English). Leads tagged `site=flytta`.

```
/                                 story-led hero · vad vi gjorde · vägarna (Temporary / Permanent / Investor Pass→sibling) · kostnader · vanliga frågor · formulär
/uppehallstillstand, /skatt, /kostnader, /familj
/stader/[slug]                    ported city pages + 2 new
/guider/[slug]                    ported guides + enough new for 8 articles total
/var-historia                     the personal story page
/process, /priser
/route-finder(/result), /contact, /guide (bridge), /privacy, /terms
```

Also produce `docs/flytta-redirects.md`: every public URL the old site served → its new path (S15 turns it into 301s).

Exit: S3's bar; `lang="sv"`; every ported MDX renders; redirect map complete; leads tagged `site=flytta`; PR merged.

### 6.9 Phase S14 — Guide member area + Insider (`guide`, en)

Pages only — auth, tiers, checkout and webhooks are O9's and off-limits (§4.7). Data through O9's member queries and `requireTier`. Owns `src/app/sites/guide/{login,members,insider,account}/`, `content/guide/members/` (bodies the import wrote, plus any new lesson Anton's outline needs), and the S5 sales page's Insider section.

```
/insider                          long-form sales page for the recurring tier: what changes monthly, updates feed preview, resources, price from products, LS checkout button via /api/checkout, FAQ, refund policy
/login                            restyle the O9 body; "check your email" state
/members                          dashboard: tier badge, modules in order with drip state (locked / unlocks on date / open), continue-where-you-left
/members/[module]/[lesson]        MDX body, prev/next, mark complete (O9 action), under-tier → upgrade card, not-yet-dripped → date
/members/updates, /members/resources
/account                          email, tier, expiry, "manage subscription" → LS customer portal URL from O9 lib, logout
/thank-you                        extend: entry buyers see "your login link is in your inbox" + Insider upsell
```

Exit: `npm run verify` green; with the O9 fixture users: `none` sees `/insider` and `/login` only, `entry` sees entry modules and an upgrade card on insider ones, `insider` sees everything with drip dates honoured; Lighthouse ≥90 on `/insider`; Product + Offer JSON-LD on `/insider`; PR merged.

### 6.10 Phase S15 — Deploy the four new domains, member platform go-live, retire the two repos

Load: `nextjs-deploy-hostinger`, `higgsfield-web-imagery`. Starts only when S10–S14 are all merged (§4.12).

1. Attach `paraguayfrontier.com`, `residenciaparaguay.es`, `vidanoparaguai.com`, `flyttatillparaguay.se` (+ www) to the same slot or Caddy config S6 chose; DNS, SSL on all eight new hostnames; `/api/health` per host.
2. Env: Lemon Squeezy live API key, store id, Insider variant id, webhook secret; register the live LS webhook; `INSIDER_PRICE_CENTS`/`INSIDER_INTERVAL` as Anton set them.
3. **Verification, not migration (amended F9, §1.13).** pararesi was never deployed, so the expected outcome is an empty source. If Anton provides `PARARESI_DATABASE_URL` (or a dump), run `scripts/import-pararesi.ts --dry-run`: zero rows confirms the finding and the step is done; non-zero rows means real buyers exist after all — set `PARARESI_AMOUNT_UNIT`, review the counts with Anton, then the real run, exactly as O9 specified. If he provides no database, record "no pararesi data, Insider launched new" in §9 and move on. Either way, verify the member platform with a fresh test buyer instead of an imported one: one Lemon Squeezy test-mode Insider purchase and one Stripe entry purchase, each requesting a magic link on paraguayresidencyguide.com and seeing the right tier.
4. flytta cutover: 301 map from `docs/flytta-redirects.md` into the registry's per-site redirects (a data entry, not middleware logic), point `flyttatillparaguay.se` DNS at the app, confirm the old URLs 301.
5. Search Console for four domains, sitemaps submitted; analytics ids in the registry.
6. Imagery: hero + 2 section images for each of the four brands through Higgsfield; alt text from MDX/registry.
7. Retire: README pointer + "archived, superseded by paraguayresidency" note in `pararesi` and `flyttatillparaguay` (Anton archives on GitHub); `docs/runbook.md` updated for seven domains and the LS webhook.

Exit: seven domains live with SSL and healthy; a test Insider and a test entry buyer log in and are correctly tiered (imported pararesi members too, if any existed); flytta old URLs 301; Search Console ×7; PR merged; STOP footer report to Anton telling him F7 is next and he opens it.

### 6.11 Phase S16 — Domain sweep (Sonnet; Anton pastes it; runs before S10–S14)

The mechanical half of F9. Everything below is a rename of what a key *points at*; no `SiteKey` changes, no schema, no new pages. Delta-spec is `prompts/sonnet-16-domain-sweep.md`; the authoritative map is §12.2 and the copy is §11.3 and §11.7.

1. `src/sites/registry.ts`: `residency` hosts → `paraguayresidency.co.uk` + `www.` (keep `residency.localhost` and `localhost`), `canonicalHost` and `crm.source` to match; `investorpass` → `paraguayinvestorpass.com`; `guide` → `paraguayresidencyguide.com` and `name: 'Paraguay Residency Guide'`; `residenciapt` → `vidanoparaguai.com` and `name: 'Vida no Paraguai'`. Fix the doc comments that quote the old hosts (the `siteOrigin` docstring, the `SiteConfig.hosts` example).
2. `.env.example` (`APP_ORIGIN_FALLBACK`, `EMAIL_FROM`) and the `EMAIL_FROM` default in `src/lib/email.ts` → `paraguayresidency.co.uk`.
3. Page copy that names a sibling domain or the old Guide name: `src/app/sites/guide/{page,about/page,blog/page,refunds/page}.tsx`, `src/app/sites/investorpass/{page,about/page,investor-pass/vs-standard-residency/page}.tsx`, `src/app/sites/residency/investor-pass/page.tsx` (comment), `content/guide/blog/do-you-need-a-lawyer-for-paraguay-residency.mdx`. Prefer `siteOrigin('<key>')` / the registry `name` over a new literal wherever the file already imports them; a literal is acceptable in prose.
4. `src/i18n/messages/pt/residenciapt.json`: the seven Vida no Paraguai strings exactly as §11.7 gives them (`site.tagline`, `home.metaTitle`, `home.metaDescription`, `home.h1`, `home.sub`, `contact.metaTitle`, `book.metaTitle`). Every other locale file is untouched.
5. Tests that hardcode a host: `tests/resolve.test.ts` (including the per-brand apex table near the end), `tests/admin-guard.test.ts`, `tests/leads-flow.test.ts`, `tests/checkout-routing.test.ts`, `tests/crm-and-signing.test.ts`, `tests/member-session.test.ts`. Add one assertion: an unknown production host 301s to `https://paraguayresidency.co.uk/`.
6. Docs: the brand table in `docs/platform.md`; the heading of `docs/guide-outline.md`; the header lines of `prompts/sonnet-3`, `-4`, `-5` (historical, header only); the F9 blocker entry in `KNOWN-ISSUES.md` becomes "CLEARED in S16"; `CLAUDE.md` drops the sentence saying the registry still names the wrong domains.
7. Do not touch `plan.md` §9 history, `prompts/fable-*`, or any `src/app/sites/<key>/` folder beyond the files in step 3.

Exit: `grep -rn` (excluding `node_modules`, `.next`, `.git`, `plan.md`, `prompts/fable-*`) for `paraguayresidency.com`, `paraguayinvestorpass.com.py`, `paraguayinvestorguide.com`, `residencianoparaguay.com`, `Paraguay Investor Guide` and `Residência no Paraguai` returns nothing; `npm run verify` green; the seven `*.localhost:3000` hosts still render and `curl -sI -H 'Host: nothing.example' :3000/` in production mode 301s to the `.co.uk`; one PR. Handoff: spawn S10, S11, S12, S13 and S14 at once per §4.12 (five `create_session` calls, Sonnet), then a report to Anton that also restates the S6 items still on him (`docs/decisions-needed.md` on `phase/s6`, with the corrected domains).

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
| Domain DNS access for `paraguayresidency.co.uk`, `paraguayinvestorpass.com`, `paraguayresidencyguide.com` — plus Resend/SMTP sending records on `paraguayresidency.co.uk` | S6 | |
| Analytics choice (Plausible vs GA4) | S6 | default Plausible |
| Lemon Squeezy test store: API key, store id, Insider variant id, webhook secret | O9 | degrades to "coming soon" on the Insider button |
| Insider price + interval (`INSIDER_PRICE_CENTS`, `INSIDER_INTERVAL`) | O9 seed | env; pararesi's current price is the default Anton should set |
| pararesi database read access (`PARARESI_DATABASE_URL`) or a dump — **or Anton's one-word confirmation that pararesi never went live** | S15 verification run (§6.10.3) | import is idempotent; expected result is zero rows |
| Lemon Squeezy live keys + live webhook | S15 | |
| DNS access for the four new domains | S15 | |
| flyttatillparaguay.se current hosting + list of live URLs | S13 (map) / S15 (cutover) | |
| Which LatAm cohorts the `.es` brand should name beside Spain | S11 | default: Spain first, Argentina second, others in passing |

## 8. Open business questions (parked)

1. ~~Guide price: $49 default. $29 sells more, $79 signals more; decide before S6 live.~~ **Decided 2026-09-07: $7.** Matches the tripwire price point, positions the Guide as the platform's shared low-ticket entry product (see §1.5, §1.12).
2. ~~Is `paraguayinvestorpass.com.py` the canonical Investor Pass brand, or should a `.com` be acquired and the `.com.py` redirect?~~ **Closed 2026-09-07 (F9):** Anton owns `paraguayinvestorpass.com`; it is the canonical brand domain. The `.com.py` is not owned and not worth registering: nobody searches a `.com.py`, and holding it would cost a NIC.py registration for a redirect no one follows. A defensive registration is Backlog-optional (§10), not a plan item.
3. Referral fee structure for the `/for-agents` page.
4. Whether the hub should show prices at all (skill says transparency wins; Paraguayan legal partners often prefer "on request").
5. ~~Second locale priority: Spanish (LatAm investors) vs German (largest EU cohort in Paraguay).~~ Overtaken by F8: `es`, `pt`, `sv` ship as their own brands (§1.11). German stays Backlog.
6. Insider membership: monthly or yearly, and at what price? Env-driven, so nothing blocks; Anton sets it before S15's live run.

## 9. Build log & handoff

**2026-09-03 — Orchestration mode (Fable, window opened by Anton).** ~~Phases O1–S6 run as Opus/Sonnet subagents spawned from Anton's Fable window; phases do NOT call `create_session`; Fable reviews each merged PR and starts the next phase.~~ **Superseded 2026-09-07 (F8):** this contradicted §4.9 and left O2 unsure whether to hand off. The standing rule is §4.9 — each phase spawns the next on Opus/Sonnet via `create_session` after its four gates pass; the two exceptions are the phases Anton starts himself (O9 now; F7 at the end). A Fable window is never needed to advance the chain. Each phase still gets its own `phase/<id>` branch and PR, merged only when the `verify` check is green.

**2026-09-03 — O1 Foundation** — PR: https://github.com/antonmarklundcom/paraguayresidency/pull/2

What now exists: Next 16 + React 19 + Tailwind 4 app on TS. `src/sites/registry.ts` (three brands, hosts, nav/footer, CRM source, siblings) and the pure resolver `src/sites/resolve.ts` driving `src/middleware.ts`; all three `*.localhost:3000` hosts render distinct themed placeholder homes with their own canonical host, sitemap and robots. Complete 8-table schema + generated migration SQL + idempotent `scripts/seed.ts`. i18n layer with `verify:i18n` failing on missing/drifted keys. Tokens + three CSS themes, shared component set, `/dev/kitchen-sink`. MDX content pipeline with zod frontmatter, one placeholder article per brand, `<Fact k>` rendering hedged wording for all seven facts. `/api/health` reports `db: down` gracefully. `npm run verify` (typecheck + lint + 43 tests + i18n + build) is green and needs no database or network.

Decisions and deviations:
- Route folder is `src/app/sites/<key>/`, not `_sites` — an underscore folder is private in the App Router and cannot be a rewrite target. Direct `/sites/...` requests are still 404'd by middleware, so each page keeps exactly one public URL.
- `middleware.ts` must live at `src/middleware.ts`. At the repo root it is silently ignored when `src/` exists (found by curling the hosts; everything 404'd). A test asserts the placement.
- `robots.ts` is only honoured at the app root, so robots is a shared route handler `src/app/robots.txt/route.ts` that resolves the brand from the host; `/robots.txt` is a middleware passthrough. `sitemap.ts` nests fine and stays per-site.
- MDX via `next-mdx-remote/rsc` (plan §5.1.1 asked for a choice); `output: 'standalone'` and `agentRules: false` in `next.config.ts` (Next 16 was rewriting this repo's CLAUDE.md on every dev start).
- Deferred: migrating and seeding against a real MySQL — no MySQL and no Docker in the build container. Exact commands and expected row counts are in `KNOWN-ISSUES.md`; S6 or Anton clears it.

Where O2 looks first: `src/db/schema.ts` (leads, lead_events, subscribers, products, orders, download_tokens are all already there — do not retrofit), `src/lib/current-site.ts` for the request's brand, `src/sites/resolve.ts` if a new shared `/api/...` path needs passthrough, `src/i18n/messages/en/*` for every user-facing string, and `content/shared/facts.ts` before writing any figure.

**2026-09-07 — O2 Conversion core** — PRs: https://github.com/antonmarklundcom/paraguayresidency/pull/4 and the audit fix https://github.com/antonmarklundcom/paraguayresidency/pull/5 (unsubscribe now honours the brand the page promised)

What now exists: the whole conversion path, verified end to end against a real
MySQL. `createLead()` (`src/lib/leads.ts`) is the single funnel every form on
every brand takes — signed-timestamp + honeypot guard, zod validation, the
`leads` row first, then a fire-and-forget VenderCRM push and two emails whose
outcome lands on `leads.crm_status` and in `lead_events`. `<LeadForm>` ships
four variants through one server action. The Route Finder (`src/features/quiz/`,
pure `scoring.ts`) runs on all three hosts and deep-links across brands.
Stripe Checkout, a signature-verified idempotent webhook, 72h/5-download tokens
and a `private/`-only streaming endpoint. Double opt-in newsletter with a
stateless signed unsubscribe. Resend → SMTP → console email. Admin on the hub
host only: login, leads (filters + CSV), orders (resend link), facts
(verification audit). 146 tests; `npm run verify` green.

Decisions and deviations:
- No `stripe` npm package. Two REST calls over `fetch`, and signature
  verification written against the documented scheme — so it is a pure
  function that tests with a locally-built fixture, no key and no SDK.
- Investor-inquiry extras (investment range, preferred route) go onto
  `leads.message`, not new columns. O1 froze the schema; a form field must
  never need a migration.
- O2 shipped `/contact` on all three brands and `/book` on the hub, ahead of
  S3–S5, so the nav stops 404ing and every form variant has a live page. The
  bodies are in `src/lib/conversion-pages.tsx` for S3–S5 to restyle; the wiring
  is off-limits to them (§6).
- `crm_status` stays `pending` when the CRM is merely unconfigured or the lead
  has no phone (the CRM requires one as the contact identity); `failed` means a
  real rejection worth retrying.
- Two bugs found by running it rather than reading it: `tsx` does not load
  `.env` (so `db:seed` never saw `DATABASE_URL`), and `output: 'standalone'`
  moves the cwd (so `private/` was not found and downloads 503'd). Both fixed;
  the standalone one is a warning for S6 in `KNOWN-ISSUES.md`.
- Cleared two O1 deferrals: migrate + seed now proven idempotent against a real
  database, and `private/guide-placeholder.pdf` ships. MariaDB installs with
  `apt-get` in the build container, so later phases can run their exit checks
  against a real database too.
- O2 did not spawn S3 — correctly, as it turned out: the handoff rule was
  contradictory (fixed above) and O9 now runs before S3 anyway.

Where S3 looks first: `src/lib/conversion-pages.tsx` and
`src/components/LeadForm.tsx` for how to drop a form onto a page,
`src/features/quiz/Quiz.tsx` for the Route Finder, `src/i18n/messages/en/*` for
every string, `docs/conversion-core.md` for the data flow and
`docs/route-finder.md` for the scoring. Do not edit `scoring.ts`, `leads.ts`,
`email.ts`, `src/app/api/*` or `src/middleware.ts` (§6).

**2026-09-07 — F8 Platform consolidation (Fable 5.1, window opened by Anton, approved §1.9)** — branch `claude/fable-8-platform-consolidation-3bk756`

What now exists: the §12 proposal is decided and folded into the locked sections. §1 gains 1.11–1.15 (the four brands and their SiteKeys `frontier`, `residenciaes`, `residenciapt`, `flytta`; the platform tier vocabulary `none|entry|insider` with service work explicitly not a tier; Stripe for one-time + Lemon Squeezy for subscriptions in one set of tables; member content bodies in MDX; passwordless member auth) and an amended 1.3 (one locale per brand, localized content slugs, shared routes keep English paths). §2 has the merged schema table — `orders` becomes `purchases`, `users` carries members, plus `provider_customers`, `subscriptions`, `webhook_events`, `cron_runs`, `modules`, `lessons`, `lesson_progress`, `resources`, `updates_posts`. §5.4 specifies O9; §6.5–§6.10 specify S10–S15; §11.5–§11.8 carry key copy for the four brands; §4.12 defines the parallel lane and the S15 claim rule. `prompts/opus-9-consolidation-foundation.md` and `prompts/sonnet-10…15` are written.

Decisions and deviations:
- O9 runs before S3, not after S6: Sonnet phases may not touch schema, and the alternative was migrating live purchase rows after launch. Cost is one Opus session before the three original brands ship.
- The Opus prompt is numbered 9, not 3 as the F8 brief suggested — phase ids are sequential across the table and 3 is taken by S3.
- ES and PT brands are distinct positioning (Mercosur route, Spain/Brazil tax exit angles), not translations of the hub, and do not upsell the English Guide.
- pararesi's `blogPosts`, `leads`/`leadTokens` and `leadEmails` are not imported as tables (MDX, subscribers, Backlog respectively).
- Nothing was spawned. Anton opens O9 himself. O9 then spawns S3 per §4.9; the 2026-09-03 orchestration entry is superseded.

Where O9 looks first: §2 (the table is the contract), §5.4, §1.12–§1.15, `src/sites/registry.ts`, `src/db/schema.ts`, `src/i18n/index.ts`, `src/lib/orders.ts` + `src/lib/stripe.ts` (what `purchases` replaces), `src/lib/signing.ts` (reuse for magic links), and in the attached repos only `pararesi/src/db/schema.ts`, `pararesi/docs/02-architecture.md`, `flyttatillparaguay/lib/vendercrm.ts`, `flyttatillparaguay/app/api/lead/route.ts`.

**2026-09-07 — O9 Consolidation foundation** — PR: https://github.com/antonmarklundcom/paraguayresidency/pull/7

What now exists: one foundation for all seven brands. `frontier`,
`residenciaes`, `residenciapt` and `flytta` are registry entries with their own
hosts, theme, currencies and locale; all seven `*.localhost:3000` hosts render
distinct themed placeholders with the right `<html lang>` and canonical host.
Locale is real — complete `es`, `pt-BR` and `sv` translations of all 157 common
keys, `verify:i18n` comparing every locale against `en` and all seven brand
files against each other, and no silent English fallback anywhere.

**The §2 schema is complete and this was the last phase allowed to shape it.**
The columns that exist now, so S3–S15 never ask:

- `users` — id, email uniq, password_hash **null**, name, role(admin,editor,**member**), tier(none,entry,insider), tier_expires_at, home_site, created_at, last_login_at, updated_at
- `provider_customers` — id, user_id, provider(stripe,lemonsqueezy), provider_customer_id, uniq(provider, provider_customer_id)
- `leads` — everything O2 had, plus **attribution json** and **dedupe_key uniq**
- `products` — id, slug uniq, **site**, name, **tier**(entry,insider), **kind**(one_time,subscription), **provider**, **provider_price_id** (was stripe_price_id), price_cents, currency, **interval**, file_key, version, active
- `purchases` (was `orders`) — id, site, product_id, **user_id**, email, name, **provider**, **provider_order_id**, **provider_checkout_id**, amount_cents, currency, status, utm, **raw**, created_at, paid_at
- `subscriptions` — id, site, product_id, user_id, provider, provider_subscription_id, status(active,past_due,cancelled,expired,paused), current_period_end, cancelled_at, ends_at, raw, created_at, updated_at
- `download_tokens` — **purchase_id** (was order_id), token, expires_at, downloads, max_downloads
- `webhook_events` — provider, provider_event_id, type, payload, received_at, processed_at, error, uniq(provider, provider_event_id)
- `cron_runs` — job, started_at, finished_at, ok, note
- `modules` / `lessons` — site null = every brand, slug, title, sort, min_tier, drip_days, content_path, active
- `lesson_progress` — pk(user_id, lesson_id), completed_at
- `resources` / `updates_posts` — site, slug, title, min_tier, file_key / published_at + content_path
- `leads`, `lead_events`, `subscribers`, `facts_verification` — unchanged from O1/O2 apart from the `site` enum, which now carries all seven keys

Also shipped: `src/lib/entitlements.ts` (pure tier maths, 3-day grace, decay to
`entry` not `none`, drip), `src/lib/member-auth.ts` (magic link on a separate
cookie and secret), both payment providers behind one `/api/checkout`, the
Lemon Squeezy webhook, `/admin/purchases` with subscriptions and
`/admin/members` with a logged grant action, `scripts/reconcile-tiers.ts`,
`scripts/import-pararesi.ts` with `--dry-run` and a fixture test, and
first-touch attribution plus phone-hash dedupe on leads. 313 tests;
`npm run verify` green with no database and no network.

Decisions and deviations:
- The `orders` → `purchases` migration is hand-edited. drizzle-kit emitted
  `DROP TABLE orders` plus a fresh `CREATE TABLE purchases`, which would have
  deleted every paid order; it is `RENAME TABLE` and `CHANGE COLUMN` instead,
  the same for `download_tokens.order_id` and `products.stripe_price_id`, and
  the O2 product is re-slugged `guide-entry` with an `UPDATE` so purchases keep
  their `product_id`. `tests/migration.test.ts` stops that being regenerated
  away. Proven on a real MariaDB seeded at the O2 state: every row, id, amount,
  status, UTM, bcrypt hash and Stripe price id survived.
- `<html lang>` is resolved from the `x-site` header in the root layout, which
  makes every page dynamic. Correct language on three non-English brands was
  judged worth more than prerendering at launch traffic; the route-group fix is
  written out in `KNOWN-ISSUES.md` for S6.
- `members` and `updates` are reserved hubs in `src/content/index.ts`. Member
  MDX lives in the same tree as marketing MDX, so without that it would have
  been walked into the sitemap and served at a public URL.
- `src/lib/entitlements.ts` deliberately does NOT import `server-only` (the two
  CLI scripts use it); `requireTier` imports `member-auth` lazily so the guard
  stays where cookies actually are.
- Two bugs found by running it rather than reading it: drizzle wraps the mysql2
  error, so the duplicate-key check never matched and every retried webhook
  delivery answered 500; and quoting a boolean in generated frontmatter made
  `draft: 'true'` a string the schema rejects.
- pararesi's `amount_usd` unit is genuinely ambiguous in the column name. It is
  never guessed silently — `PARARESI_AMOUNT_UNIT` forces it and the dry run
  warns on every row the heuristic decided. S15 must set it explicitly.

Where S3 looks first: `docs/platform.md` for tiers, providers and how a brand
lists a product; `src/lib/conversion-pages.tsx` and `src/components/LeadForm.tsx`
for dropping a form on a page; `src/i18n/messages/en/residency.json` for every
string; `content/shared/facts.ts` before writing any figure. The schema is
final — do not touch `src/db/schema.ts`, `src/lib/entitlements.ts`,
`src/lib/member-auth.ts`, `src/lib/purchases.ts`, `src/lib/subscriptions.ts`,
`src/app/api/*` or `src/middleware.ts` (plan §4.7).

**2026-09-07 — S3 paraguayresidency.com (hub)** — PR: https://github.com/antonmarklundcom/paraguayresidency/pull/8

What now exists: every §6.1 page. Home is a full rebuild (split hero with the
exact §11.1 copy, who-it's-for, a three-route bento, a process summary, a
hedged "why Paraguay" facts section, FAQ, closing CTA — testimonials
deliberately omitted, not stubbed, per plan §7). Five service pages
(`/residency/{temporary-residency,permanent-residency,cedula,tax-residency,family}`)
share one new component, `src/app/sites/residency/_lib/ServicePage.tsx`
(breadcrumbs, intro, body, Service JSON-LD, FAQ, the O2 consultation form, an
optional WhatsApp link) — residency-only, not exported from `src/lib`. `/pricing`
renders every route as "from USD —" with a TODO title until Anton supplies real
figures (plan §7, never an invented number). `/process`, `/about` are new.
`/investor-pass` and `/guide` are short, honest bridge pages to the sibling
brands — `/investor-pass` is `noindex` (thin, canonical lives on
paraguayinvestorpass.com.py) and excluded from the sitemap; `/guide` is normal
content and included. `/privacy` and `/terms` are generic bodies in a new
shared `src/lib/legal-pages.tsx` (brand name interpolated) — S4/S5/S10–S15
should reuse this rather than rewriting it per brand. 8 MDX articles across
the four hubs (documents ×2, living-in-paraguay ×2, taxes ×2, comparisons ×2),
each 900–1400 words, every legal/financial claim through `<Fact>`, each with 2
related links plus one hub-appropriate service page plus the Route Finder —
`src/lib/article-page.tsx` gained optional `relatedLinks`/`serviceLink` props
for this (additive, other brands' article routes are unaffected if they pass
nothing). Sitemap (`seo-files.ts` `staticPaths.residency`) lists exactly the
15 static routes plus the 8 content pages — 23 URLs, verified against the live
`/sitemap.xml`. WhatsApp click-to-chat (`src/lib/whatsapp.ts`, plan §3b) is
wired into the service pages and the home CTA, gated on
`NEXT_PUBLIC_WHATSAPP_NUMBER` and invisible until Anton sets it.

Decisions and deviations:
- Page copy for residency-only routes is hardcoded JSX, not routed through
  `t(site, key)`. `verify:i18n` rule 2 requires identical key sets across all
  seven brand `.json` files specifically because a *shared* component calls
  `t(runtimeSite, key)` — these pages hardcode `site="residency"` and are
  never rendered for another brand, so the parity rule's own stated rationale
  doesn't apply, and mirroring ~40 new keys × 7 brands of unused placeholder
  copy would have been pure overhead. The four genuinely shared i18n
  surfaces (Nav, Footer, `<LeadForm>`, `<FAQ>`, the Route Finder) are
  untouched and still route through `t()`. The one small registry-adjacent
  addition is `nav.family`, added to all four `common.json` locale files
  (footer link), which the plan explicitly allows (§6: "adding nav items/copy
  inside the registry is fine").
- `serviceJsonLd()` added to `src/lib/metadata.ts` next to `organizationJsonLd`
  — the plan's exit criteria names Service JSON-LD but O1 never built it.
- Verified against a real MariaDB (same pattern as O2/O9): migrated, seeded,
  `npm run verify` green, then `npm run build` + `npm start` + Lighthouse
  (mobile, simulated throttling) on `/` (perf 0.96, SEO 1.0) and
  `/residency/temporary-residency` (perf 0.93, SEO 1.0) — both clear the ≥90
  bar with no imagery yet (S6 adds it).
- Caught in the pre-handoff audit, not by the build: three MDX articles
  (written by parallel subagents each scoped to one hub, working from the
  `related` frontmatter graph but not from each other's link text) linked to
  sibling articles at `/documents/...`, `/taxes/...` etc. instead of
  `/guides/documents/...` — a 404 in production. Fixed in the five affected
  links; a full-repo grep for the pattern found no others. Anyone using
  multiple parallel subagents for MDX content should grep for bare
  `](/​<hub>/...)` links afterward — subagents scoped to their own hub have no
  visibility into the site's actual URL prefix convention for *other* hubs.

Where S4 looks first: `src/lib/legal-pages.tsx` (privacy/terms, reuse as-is)
and `src/lib/whatsapp.ts` (reuse as-is) are brand-agnostic. `src/app/sites/
residency/_lib/ServicePage.tsx` is NOT shared — investorpass's service pages
have a different shape (dark editorial, investment routes, no cédula/family
equivalents) and should get their own equivalent under `src/app/sites/
investorpass/_lib/` rather than importing this one. `src/lib/article-page.tsx`'s
new `relatedLinks`/`serviceLink` props are available for `/insights/[slug]`.

**2026-09-07 — S4 paraguayinvestorpass.com.py** — PR: (opened this session)

What now exists: every §6.2 page. Home is a full rebuild (editorial hero,
what-the-Pass-is with three hedged facts, a four-route bento linking to
`/investor-pass/investment-routes#<route>`, who-qualifies, timeline,
why-go-direct-to-permanent, FAQ, an inline investor-inquiry form) plus
Service+Offer JSON-LD (`serviceOfferJsonLd`, new in `src/lib/metadata.ts`,
additive next to `serviceJsonLd`). `src/app/sites/investorpass/_lib/ServicePage.tsx`
is the dark-editorial equivalent of the hub's `ServicePage` (deliberately not
shared, per O9's note) — used by `/investor-pass/{requirements,process,for-agents}`
and `/investor-pass/investment-routes`; `/investor-pass/vs-standard-residency`
is bespoke (links out to the hub's four service pages via `siteOrigin('residency')`,
does not duplicate their content, per the plan's explicit instruction).
`/investor-pass/for-agents` is new scope beyond a literal re-read of §6.2's
page list but was already named in the phase table's page tree; it uses the
`contact` lead variant (a referral inquiry is not a personal investment
amount, so `investor_inquiry`'s range/route fields didn't fit). `/about`,
`/privacy`, `/terms` are new — privacy/terms reuse `src/lib/legal-pages.tsx`
as-is (S3's note). Four new hedged facts
(`investorpass.route_{real_estate,business,financial,tourism}_usd`) back the
investment-routes page and the home bento, since the generic
`investorpass.min_investment_usd` doesn't cover per-route figures. 5 new
`/insights/[slug]` articles (real estate deep-dive, taxes, family inclusion,
timeline expectations, vs Uruguay/Panama) join the existing placeholder for 6
total, each 900–1400 words, cross-linked in a small related-articles cluster,
every legal/financial claim through `<Fact>`; the insights route now computes
`relatedLinks`/`serviceLink` (→ investment-routes) like the hub's article page
does. `seo-files.ts`'s `investorpass` sitemap entry lists the 11 new static
routes; content routes are picked up automatically via `getPages`. Two new
shared nav labels (`nav.vsStandard`, `nav.forAgents`) added to all four
locales' `common.json` (footer links only, per §4.9's "adding nav items/copy
inside the registry is fine").

Decisions and deviations:
- The 5 new insight articles were fanned out to parallel subagents (same
  pattern S3 used for its MDX, and the one that produced S3's bad-link bug) —
  this time each agent was given the exact route inventory
  (`/investor-pass/investment-routes`, `/requirements`, `/process`,
  `/route-finder`, `/contact`) up front rather than inferring it, and every
  internal link was grep-checked against real routes before merging; no
  dangling links found.
- Verified against a real MariaDB (same pattern as O2/O9/S3): migrated,
  seeded (13 facts mirrored, confirming the 4 new fact keys registered),
  `npm run verify` green, then `next build` + `next start` + curl-based checks
  for every new route (200, unique title ≤60/description ≤155, sitemap
  matches exactly, Service+Offer/FAQPage/BreadcrumbList JSON-LD present, every
  `<Fact>` renders `data-verified="false"`, lead forms carry `site=investorpass`
  and the right `kind`).
- Lighthouse mobile perf on any page carrying `<LeadForm>` (a `'use client'`
  component) does not reproduce S3's claimed ≥90 in this container — see
  `KNOWN-ISSUES.md`. Re-tested against S3's own already-merged
  `/residency/temporary-residency` and got 0.84, so this is a pre-existing,
  platform-wide, off-limits-to-Sonnet characteristic (or a measurement-method
  difference), not an S4 regression. SEO is 1.0 on every page checked.
- One stale-build false alarm during self-verification: an intermediate edit
  left `.next` serving a cached page with a duplicate `Organization` JSON-LD
  block until `rm -rf .next && npm run build`. No code defect; noted here only
  because a later phase hitting the same "extra JSON-LD block" symptom should
  rebuild clean before hunting for a phantom duplicate render.

Where S5 looks first: `src/app/sites/investorpass/_lib/ServicePage.tsx` is
Investor-Pass-only, not reusable for the Guide's different shape (long-form
sales page, no cédula/routes structure) — S5 needs its own equivalent, same as
S4 needed its own rather than reusing S3's. `src/lib/legal-pages.tsx` and
`src/lib/whatsapp.ts` remain brand-agnostic and reusable as-is.

**2026-09-07 — S5 paraguayinvestorguide.com** — PR: (opened this session)

What now exists: every §6.3 page. Home is a full rebuild — long-form sales
page (promise, who it's for, a 12-chapter "what's inside" bento at `#inside`,
a sample-page excerpt, author/credibility, price + `<CheckoutButton>` +
guarantee at `#price`, FAQ, newsletter fallback) reading the live price off
the `products` row and carrying `productOfferJsonLd` (new, additive in
`src/lib/metadata.ts`) with the real $7 price — unlike `serviceOfferJsonLd`,
the Guide's price is a locked business decision (§1.5), not an unverified
legal figure, so it is not hedged. `/blog` is a new index (the registry nav
already pointed at it); `/blog/[slug]` gained `relatedLinks`/`serviceLink`
(→ `#price`) the same way S4 wired `/insights/[slug]`. Six new articles join
the existing placeholder for 7 total (cost of living, banking, timeline
realities, mistakes, documents, "do you need a lawyer"), each cross-linked
to 2 related posts plus the Route Finder, every legal/financial claim through
`<Fact>`. `/about` and `/refunds` (14-day, no-questions) are new. `/privacy`
reuses `src/lib/legal-pages.tsx` as-is; `/terms` does not — the shared
`TermsPage` describes filing government applications for a fee, which is
false for a $7 digital product, so it gets its own `GuideTermsPage`/
`guideTermsMetadata` in the same file (still one shared shape, just not the
wrong one). `docs/guide-outline.md` and `private/guide-placeholder.pdf`
already existed (shipped ahead of schedule, apparently by S4's session) and
needed no changes. `seo-files.ts`'s `guide` sitemap entry gained `/about`,
`/refunds`, `/blog`.

Decisions and deviations:
- Verified against a real MariaDB (same pattern as every prior phase):
  migrated, seeded (product row confirms $7.00/USD), `npm run verify` green,
  then `next build` + `next start` + curl checks on every route (200, unique
  title, sitemap lists exactly the 8 static + 7 content URLs, Product +
  Organization + FAQPage + Article JSON-LD present, every `<Fact>` renders
  `data-verified="false"`), then Lighthouse mobile: `/` perf 0.91 / SEO 1.0,
  a blog article perf 0.96 / SEO 1.0 — both clear the ≥90 bar.
- Stripe was exercised the same way O2 and O9 left it: no key in this
  environment, so no live test-mode purchase from the page. `CheckoutButton`
  correctly reports `enabled: false` and the existing signed-webhook fixture
  tests (untouched) cover the rest end to end. Logged in `KNOWN-ISSUES.md`
  for S6, which already owns the live Stripe purchase + refund.
- The hero and "what's inside" anchor (`#inside`, `#price`) match the
  registry's existing `nav.whatsInside` → `/#inside` link exactly — that nav
  entry was already in place from O9/S4, unused until this phase.

Where S6 looks first: `docs/runbook.md` (S6 to write) needs the Stripe live
purchase against this page's live checkout button; `KNOWN-ISSUES.md`'s S5
entry has the exact env vars still needed.

**2026-09-07 — F9 Domain reality re-plan (Fable 5.1, window opened by Anton, approved §1.9)** — branch `claude/fable-domain-rebrand-replan-cyyn7r`

What now exists: the brand↔domain map is re-decided on the seven domains Anton
owns (§1.11, §12.2). The hub runs on `paraguayresidency.co.uk`; the reasoning
and the rejected options are in §1.11 so nobody re-opens it. `guide` is
`paraguayresidencyguide.com` under the name "Paraguay Residency Guide" (§11.3
reconciles registry, product and page titles); `investorpass` is the `.com`
(§11.2, §8.2 closed); `residenciapt` is `vidanoparaguai.com` under the name
"Vida no Paraguai" with §11.7 rewritten from a residency brand into a
life-in-Paraguay brand that sells residency, including the exact pt-BR
strings S16 copies into the i18n file. §6.11 specifies S16, the Sonnet sweep
that swaps every old host in the registry, three brands' pages, six test
files, the i18n file and the docs. Prompt files `sonnet-10` … `-15` are
rewritten for the new domains and the new chain; `sonnet-6` carries an
amendment for its re-run; `sonnet-16-domain-sweep.md` is new. `CLAUDE.md`
and `KNOWN-ISSUES.md` record the decision.

Decisions and deviations:
- No SiteKey changes, no schema, no domain purchase. Every decision changes
  only what a key points at, so the sweep is a Sonnet phase.
- The parallel lane (S10–S14) is now gated on S16, not S6 (§4.12). S6 is
  owner-blocked indefinitely on hosting, DNS and Stripe live, and the content
  phases do not depend on a deploy. S15 still waits on S6, through an added
  condition in the claim rule.
- pararesi's never-deployed state is folded into §1.13, §6.10.3, §7, §12.3 as
  "verification, expected zero rows; import if not" — correct under either
  answer, so it did not need to block on Anton.
- `paraguayinvestorpass.com.py` is not registered and not held.
- Nothing was spawned. Anton pastes the S16 line himself.

Where S16 looks first: §6.11 (the file list is exhaustive as of this commit;
the grep in its exit criterion is the real test), §12.2 for the map, §11.7
for the pt-BR strings, §11.3 for the Guide names. Where S6's re-run looks
first: the amendment at the top of `prompts/sonnet-6-deploy-seo-imagery.md`.

**2026-09-09 — S16 Domain sweep** — branch `phase/s16`

What now exists: `src/sites/registry.ts`, `.env.example` and `src/lib/email.ts`
point at the domains Anton owns — `residency` → `paraguayresidency.co.uk`,
`investorpass` → `paraguayinvestorpass.com`, `guide` →
`paraguayresidencyguide.com` ("Paraguay Residency Guide"), `residenciapt` →
`vidanoparaguai.com` ("Vida no Paraguai"). All prose/anchor-text mentions of
the old domains in `src/app/sites/guide/*`, `src/app/sites/investorpass/*`,
`src/app/sites/residency/investor-pass/page.tsx` and one Guide blog MDX are
updated, preferring `siteOrigin('<key>')` over new literals where a file
already imports it. `pt/residenciapt.json` carries the seven §11.7 strings
verbatim (title 55 chars, description 145 — both under the limit).
`tests/resolve.test.ts` (+ admin-guard, leads-flow, checkout-routing,
crm-and-signing, member-session) assert the new hosts; added an explicit
"unknown host → 301 `https://paraguayresidency.co.uk/`" case alongside the
existing dynamic one. `npm run verify` is green (typecheck, lint, 190+ tests,
i18n, build).

Decisions and deviations:
- The exit grep (plan §6.11) is clean except three places the prompt's own
  filter didn't anticipate and which are correct left alone: `CLAUDE.md`'s
  "He does NOT own paraguayresidency.com…" sentence (documents what Anton
  does *not* own — flipping it would make it false), `KNOWN-ISSUES.md`'s
  already-historical entries describing what O2 actually tested against at
  the time, and `prompts/sonnet-16-domain-sweep.md` itself (this file), which
  necessarily quotes the old domains as its own spec. Treated the same as the
  `plan.md`/`sonnet-6`/`fable-*` exemptions the prompt already lists.
- `src/app/sites/guide/page.tsx` needed one added import (`siteOrigin`) that
  a literal-domain edit turned into a real reference — caught by `tsc`, not
  by the domain grep.
- `KNOWN-ISSUES.md`'s "BLOCKER — brand↔domain map" entry is retitled
  "CLEARED in S16" with a short note on what changed, per §6.11 step 6.

Where S10–S14 look first: their own prompt files are unchanged by this
phase (only header lines on S3–S5 changed); the registry's `hosts` /
`canonicalHost` / `name` for their brand are now final — do not re-litigate
domains, only build the content §6.5–§6.9 and §11.5–§11.8 specify.

## 10. Backlog

- German brand or locale for the hub (Spanish, Portuguese and Swedish ship as brands, §1.11).
- Localize the shared route paths (`/contact` → `/contacto`) through a per-site path map (§1.3).
- Unify to one payment provider once Stripe and Lemon Squeezy both carry real volume (§1.13).
- Sequenced nurture emails (pararesi's `leadEmails` concept) as `lead_nurture_steps`.
- Investor Pass ROI / rental-yield calculator.
- Guide editions (Spanish, Portuguese, Investor edition) as extra `products` rows; until then ES/PT brands have no entry product.
- Affiliate/referral tracking for agents.
- `editor` role UI.
- Blog RSS per site.
- **Hub on a global `.com`.** If a residency-named `.com` ever becomes available to Anton, move `residency` to it (three registry lines) and 301 `paraguayresidency.co.uk` → it; expect the usual temporary ranking dip of a domain move. Until then the `.co.uk` hub stands (§1.11).
- Defensive registration of `paraguayinvestorpass.com.py` (optional, §8.2).
- Hub UK tilt for F7: the hub stays global in voice, but `/process` and one documents article should name the UK issuers a British applicant deals with, hedged as everything else; a small win the `.co.uk` hands us for free.

## 11. Key copy & SEO structure (Fable-written; Sonnet keeps the voice)

Voice for all three: plain, specific, unhurried. No "unlock", "seamless", "world-class". Second person. Short sentences. Admit what takes time. Every claim about law is hedged until verified (§1.10).

### 11.1 paraguayresidency.co.uk (`residency`, en — the hub; domain decided F9)

- **Positioning note (F9):** the domain is a `.co.uk`, the brand is not a UK brand. Voice, H1 and the service pages stay global; a British reader should feel at home and an American should not feel excluded. The US/CA/AU plan-B angle belongs to `frontier` (§11.5), not here.
- **Primary keyword cluster:** paraguay residency, paraguay permanent residency, paraguay temporary residency, paraguay residency requirements, paraguay cedula, paraguay tax residency, move to paraguay, paraguay residency uk, move to paraguay from the uk.
- **Hero H1:** "Paraguay residency, handled end to end."
- **Sub:** "Temporary residency, permanent residency and your cédula, prepared by people who do this every week in Asunción. You show up for the appointments. We do the rest."
- **Three value points:** "One fixed fee per route, quoted before you commit." · "Document checklist tailored to your nationality, not a generic PDF." · "We tell you when the standard route is wrong for you and point you to the Investor Pass or to waiting."
- **Route bento titles:** Temporary residency ("The standard first step. Two years, then permanent.") · Permanent residency ("Ten-year card. Presence rules apply — ask us.") · Investor Pass ("Straight to permanent, with a qualifying investment. Separate brand, same team.")
- **Meta title:** "Paraguay Residency Services — Temporary, Permanent & Cédula" · **Meta description:** "Done-for-you Paraguay residency. Fixed fees, nationality-specific checklists, appointments in Asunción. Find your route in 2 minutes."
- **Internal linking rule:** every article → its hub + the one service page it supports + the Route Finder.

### 11.2 paraguayinvestorpass.com (`investorpass`, en — brand name "Paraguay Investor Pass", confirmed F9)

- **Keyword cluster:** paraguay investor pass, paraguay residency by investment, paraguay golden visa, paraguay permanent residency investment, invest in paraguay residency.
- **Hero H1:** "Permanent residency in Paraguay, in one step."
- **Sub:** "The Investor Pass lets qualifying investors skip temporary residency entirely. We structure the investment, file the application and stay with you until the permanent card is in your hand."
- **Three value points:** "Four qualifying routes — real estate, productive business, financial instruments, tourism — we tell you which one fits your capital and your goals." · "Investment thresholds and program rules are new and still moving; we quote the current figures on your call, not from a stale web page." · "Nothing is filed until you have seen the full cost, timeline and exit options in writing."
- **Meta title:** "Paraguay Investor Pass — Direct Permanent Residency by Investment" · **Meta description:** "Skip temporary residency. The Paraguay Investor Pass (2026) grants permanent residency to qualifying investors. Routes, requirements, timeline and a straight answer on whether you qualify."
- **Comparison page angle:** "Investor Pass vs standard residency: the Pass buys time, not a different outcome. Here is when the time is worth the money."

### 11.3 paraguayresidencyguide.com (`guide`, en — brand name "Paraguay Residency Guide", reconciled F9)

- **Names, reconciled:** the brand is **Paraguay Residency Guide** (registry `name`, page titles, `docs/guide-outline.md`); the product is **The Paraguay Residency Guide** (`products.name`, already seeded); the membership is **Paraguay Residency Insider** (already seeded). "Paraguay Investor Guide" was F8's domain-driven placeholder and is retired everywhere by S16 — the domain now matches the keyword cluster below, which it never did.
- **Keyword cluster:** paraguay residency guide, how to get paraguay residency, paraguay residency cost, moving to paraguay guide, paraguay residency step by step.
- **Hero H1:** "The Paraguay residency guide we wish existed before we did it ourselves."
- **Sub:** "Every step, document, cost and mistake, written down once, kept current. Read it in an evening. Decide with real numbers."
- **Offer:** "Instant PDF · free updates for 12 months · 14-day refund, no questions."
- **Chapter outline (also `docs/guide-outline.md`):** 1 Why Paraguay (and why not) · 2 The routes compared · 3 Documents, apostilles, translations by nationality · 4 Costs, real ones · 5 Timeline week by week · 6 Cédula and RUC · 7 Banking · 8 Taxes for residents · 9 Family · 10 Investor Pass overview · 11 Mistakes we see monthly · 12 Checklists.
- **Meta title:** "Paraguay Residency Guide (2026) — Steps, Costs, Documents" · **Meta description:** "The complete Paraguay residency guide: routes compared, documents by nationality, real costs, week-by-week timeline. Instant PDF, 12 months of updates."
- **Thank-you upsell:** "Want it done for you? Book a 20-minute call with the team that wrote this." → hub `/book`.

### 11.4 Facts sources to seed `facts.ts` (all `verified: false` until the lawyer signs off)

Investor Pass launch and framing: Fragomen — https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html · Immigrant Invest — https://immigrantinvest.com/insider/paraguay-investor-pass/ · Yahoo Finance — https://finance.yahoo.com/economy/policy/articles/paraguay-offers-direct-permanent-residency-152937040.html. Public sources disagree on the minimum (USD 70k, 150k and 200k all appear). That disagreement is exactly why §1.10 exists. The canonical source to obtain is the resolution text itself (cited as Resolución 0283/2026 by one source).

### 11.5 paraguayfrontier.com (`frontier`, en)

- **Audience and angle:** Americans, Canadians, Britons, Australians who want optionality — a second residency and tax ID held in reserve, land or a small business maybe, full-time relocation maybe never. Skeptical, practical voice; the reader has seen the "Paraguay golden visa" hype and wants the catch stated.
- **Keyword cluster:** paraguay plan b residency, second residency paraguay, paraguay residency for americans, move to paraguay from the us, paraguay territorial tax, paraguay expat residency, easiest permanent residency.
- **Hero H1:** "A second residency you can actually get."
- **Sub:** "Paraguay grants permanent residency without a million-dollar investment, a points test or a decade of waiting. We handle the paperwork in Asunción. You decide how much of your life to move here."
- **Three value points:** "Plan B first: a residency card and a tax ID you can hold in reserve, with the presence rules explained honestly." · "Territorial tax means foreign income is generally outside Paraguay's reach — we say exactly what that does and does not cover." · "Land, a business, or nothing at all: the routes compared for people who may never live here full-time."
- **Meta title:** "Paraguay Residency for Americans & Expats — Your Plan B, Handled" · **Meta description:** "Second residency in Paraguay: low thresholds, territorial tax, a permanent card. Routes compared, presence rules stated plainly, done-for-you filing in Asunción."
- **Rule:** every tax sentence renders `<Fact k="tax.foreign_income_treatment">` or `tax.territorial_rate`; the brand never says "tax-free".

### 11.6 residenciaparaguay.es (`residenciaes`, es)

- **Audience and angle:** Spain first (the TLD), Spanish-speaking Latin America second (Argentina above all). Motives: fiscal pressure, cost of living, no language barrier, retirees and autónomos. Distinct from the hub: the Mercosur route for LatAm nationals, and the Spain tax-exit angle, both hedged.
- **Keyword cluster:** residencia en paraguay, residencia paraguay españoles, vivir en paraguay, residencia permanente paraguay, impuestos paraguay residencia, cédula paraguaya extranjeros, emigrar a paraguay, residencia mercosur paraguay.
- **Hero H1:** "Residencia en Paraguay, sin vueltas."
- **Sub:** "Residencia temporal, permanente y cédula, tramitadas por un equipo que lo hace cada semana en Asunción. Tú vienes a las citas. Nosotros hacemos el resto."
- **Three value points:** "Un honorario fijo por trámite, cotizado en euros antes de que te comprometas." · "Lista de documentos según tu nacionalidad: apostillas, traducciones y plazos reales, no un PDF genérico." · "Si Paraguay no te conviene, fiscalmente o de otra forma, te lo decimos en la primera llamada."
- **Meta title:** "Residencia en Paraguay para Españoles — Temporal, Permanente y Cédula" · **Meta description:** "Trámite de residencia en Paraguay llave en mano. Honorarios fijos en euros, documentos según tu nacionalidad, citas en Asunción. Descubre tu ruta en 2 minutos."
- **Rule:** the Mercosur page and every Mercosur mention render `<Fact k="mercosur.residency_route">`; Spain's 183-day and centre-of-interests rules are hedged as "confírmalo con tu asesor".

### 11.7 vidanoparaguai.com (`residenciapt`, pt-BR — brand "Vida no Paraguai", rewritten F9)

Anton's brief, verbatim: *"For brand go Vida no Paraguai and sell residency in paraguay in portugese focus on brazil."*

- **Audience and angle:** Brazilians who are thinking about a life in Paraguay, not only a document — the largest foreign community in the country, mostly across the border and in the agro belt. Motives: cost of living, tax, a business or land, proximity (Foz / Ciudad del Este, Pedro Juan), Mercosur, a calmer pace. The brand name is the promise ("a life in Paraguay"); residency is the product that starts it and every page ends there. It speaks to a neighbour, plainly, in `você`. It never promises "imposto zero", never sells Paraguay as a paradise, and says out loud what is worse than Brazil (healthcare outside Asunción, bureaucracy, roads) so the rest is believed.
- **Keyword cluster:** vida no paraguai, morar no paraguai, como morar no paraguai, custo de vida no paraguai, residência no paraguai, residência permanente paraguai, brasileiro no paraguai, cédula paraguaia, residência mercosul paraguai, abrir empresa no paraguai, impostos no paraguai.
- **Hero H1:** "Morar no Paraguai começa pela residência. Nós cuidamos dela."
- **Sub:** "Residência temporária, permanente e cédula para brasileiros, com um time que faz isso toda semana em Assunção. E o que ninguém explica direito: custo de vida, negócios, fronteira e o que muda na sua declaração no Brasil. Você comparece às consultas. Nós fazemos o resto."
- **Three value points:** "Brasileiro tem o Mercosul a favor. Explicamos o que o acordo simplifica de verdade e o que continua igual." · "Honorário fixo por rota, cotado em reais ou dólares antes de você decidir, e a lista de documentos do seu caso, não um PDF genérico." · "Imposto territorial, RUC e a sua declaração no Brasil, explicados com clareza. Sem promessa de imposto zero, e com um 'confirme com seu contador' onde ele é necessário."
- **Meta title:** "Vida no Paraguai — Residência e Cédula para Brasileiros" · **Meta description:** "Morar no Paraguai: residência, cédula, rota Mercosul, custo de vida e impostos para brasileiros, sem promessa de imposto zero. Descubra sua rota."
- **Registry and i18n values (S16 copies these verbatim into `src/i18n/messages/pt/residenciapt.json`):** `name` = `Vida no Paraguai` · `site.tagline` = "Morar no Paraguai começa pela residência." · `home.metaTitle` = the meta title above · `home.metaDescription` = the meta description above · `home.h1` = the H1 above · `home.sub` = the sub above · `contact.metaTitle` = "Contato — Vida no Paraguai" · `book.metaTitle` = "Agende uma conversa — Vida no Paraguai".
- **Content shape (S12):** the `morar-no-paraguai` hub leads (custo de vida, segurança, saúde e escola, fronteira — at least 3 of the 8 articles); `/custo-de-vida` is a standing page, every figure a `<Fact>` in BRL first. The residency pages are the same structure as §6.7's tree; the difference from the hub and from `residenciaes` is that the reader arrives thinking about a life and leaves with a route.
- **Rule:** `/mercosul` and every Mercosur mention render `<Fact k="mercosur.residency_route">` (unverified — hedge it); Brazilian tax consequences are hedged as "confirme com seu contador"; Paraguayan figures through `<Fact>` as everywhere; "imposto zero" never appears, not even negated in a heading.

### 11.8 flyttatillparaguay.se (`flytta`, sv)

- **Audience and angle:** Swedes weighing a move — tax on leaving, cost, climate, a plainer life. This is Anton's own story; first person plural is allowed here and nowhere else. **Where the old repo already has copy (`content/site.ts`, its `plan.md`), that copy wins; this block is the anchor where none exists.**
- **Keyword cluster:** flytta till paraguay, bo i paraguay, uppehållstillstånd paraguay, skatt paraguay, utvandra till paraguay, svenskar i paraguay, kostnader paraguay.
- **Hero H1:** "Vi flyttade till Paraguay. Så här gör du."
- **Sub:** "Uppehållstillstånd, cédula och skatt, förklarat av någon som gjort resan själv — och ett team i Asunción som sköter pappren åt dig."
- **Three value points:** "Hela vägen från Skatteverket till cédulan, steg för steg, utan skönmålning." · "Fast pris per väg, i kronor, innan du bestämmer dig." · "Ärligt om vad som tar tid, vad som kostar och när Paraguay inte är rätt val."
- **Meta title:** "Flytta till Paraguay — Uppehållstillstånd, Skatt och Vardag" · **Meta description:** "Så flyttar du till Paraguay: uppehållstillstånd, cédula, skatt och verkliga kostnader, från någon som gjort det. Hitta din väg på 2 minuter."
- **Rule:** Swedish exit-tax rules (utflyttning, väsentlig anknytning) are hedged as "stäm av med en skatterådgivare"; Paraguayan figures through `<Fact>` as everywhere.

## 12. Platform consolidation — decided 2026-09-07 (F8)

**Status:** locked. The decisions live in §1.11–§1.15, §1.3, §2; the work is §5.4 (O9) and §6.5–§6.10 (S10–S15). This section keeps only what a build session needs that is not already above: why, the source→target map, and the flytta port.

### 12.1 Why

Anton runs seven residency-adjacent domains across three repos. §1.1 already built this app to hold N domains through the registry. The stronger reason to consolidate is the buyer platform: `pararesi` independently built login + tiered membership + content drip on Lemon Squeezy, duplicating what the `guide` brand does on Stripe. One `users`/entitlement/drip system, one product-tier vocabulary (§1.12), and brands differ only in theme, locale and which products they list. `realestateinparaguay` is a different business and stays its own app.

### 12.2 Brand map

| Domain | SiteKey | Locale | Money | Products | Copy |
|---|---|---|---|---|---|
| paraguayresidency.co.uk | `residency` | en | USD | — (hub, services, `/admin`, unknown-host target) | §11.1 |
| paraguayinvestorpass.com | `investorpass` | en | USD | — | §11.2 |
| paraguayresidencyguide.com | `guide` | en | USD | `guide-entry` ($7, Stripe), `guide-insider` (recurring, Lemon Squeezy) | §11.3 |
| paraguayfrontier.com | `frontier` | en | USD | — (Guide upsell) | §11.5 |
| residenciaparaguay.es | `residenciaes` | es | EUR, PYG | — (newsletter exit) | §11.6 |
| vidanoparaguai.com | `residenciapt` | pt-BR | BRL, USD, PYG | — (newsletter exit) | §11.7 |
| flyttatillparaguay.se | `flytta` | sv | SEK, USD | — (Guide upsell) | §11.8 |

**Corrected 2026-09-07 (F9)** to the domains Anton actually owns (§1.11). Brand names: "Paraguay Residency" · "Paraguay Investor Pass" · "Paraguay Residency Guide" · "Paraguay Frontier" · "Residencia Paraguay" · "Vida no Paraguai" · "Flytta till Paraguay". Registry `name` values are these strings; the localhost dev hosts (`<key>.localhost`) are unchanged. Not owned and never to be referenced: `paraguayresidency.com`, `paraguayinvestorpass.com.py`, `paraguayinvestorguide.com`, `residencianoparaguay.com`.

### 12.3 pararesi → this app (O9 import script; S15 runs it as a verification — pararesi was probably never deployed, §1.13)

| pararesi | here | note |
|---|---|---|
| `users` | `users` (`role member`, `home_site guide`) | tier map `guide→entry`, `insider→insider`; LS customer id → `provider_customers` |
| `purchases`, `subscriptions` | same names | `provider lemonsqueezy`, `site guide`; `ls*` columns → `provider_*` |
| `webhookEvents`, `cronRuns` | `webhook_events`, `cron_runs` | as-is with `provider` |
| `modules`, `lessons`, `resources`, `updatesPosts` | same, `site guide` | bodies → MDX under `content/guide/members/` and `content/guide/updates/` (§1.14) |
| `lessonProgress` | `lesson_progress` | |
| `blogPosts` | `content/guide/blog/*.mdx` | not a table (§1.4) |
| `leads`, `leadTokens` | `subscribers` (`source pararesi-import`) | |
| `leadEmails` | — | Backlog: `lead_nurture_steps` |
| gating (`requireTier`, decay, 3-day grace) | `src/lib/entitlements.ts` | generalized over tiers, reads `site` |

### 12.4 flyttatillparaguay → this app (O9 for the lead logic, S13 for content, S15 for cutover)

- Lead capture: its honeypot, idempotency-by-phone-hash and first-touch attribution cookie are reconciled into `src/lib/leads.ts` (O9 task 7). O2's flow stays the spine; flytta's additions augment it. The CRM tag is `site=flytta`.
- Content: `content/guider/`, `content/stader/` → `content/flytta/…` on the existing pipeline; `cluster` → `hub`; `<StatRow>`/`<Disclaimer>` become shared components (S13).
- `content/site.ts` → the `flytta` registry entry (S13 fills nav/footer/WhatsApp/author; O9 creates the entry).
- Old URLs → `docs/flytta-redirects.md` (S13) → per-site 301 map in the registry (S15). Then the repo is retired.

### 12.5 Nothing left open for the plan

Every §12.6 question of the draft is answered above (Q1 §1.5/§1.12; Q2 §1.12; Q3 §1.11 + §1.3; Q4 §11.6–§11.7; Q5/Q6 the phase table and §5.4). The domain map was re-decided by F9 (§1.11, §12.2). What still needs Anton is in §7 (Lemon Squeezy keys, the pararesi yes/no, DNS for seven domains, flytta hosting) and §8.6 (Insider price and interval) — none of it blocks S16 or S10–S14.

## 13. Tooling notes for build sessions

- `/design` (the built-in Claude Design canvas skill) works inside Claude Code in this repo. Use it in S3–S5 to draft a hero or a bento section as artboards before coding; the canvas is a draft, the React component is the deliverable. `DesignSync` can push a component library to a Claude Design project; not required for this build.
- Imagery only via `higgsfield-web-imagery`; never hand-place files.
- Never commit `.env`, the real guide PDF, or Stripe keys.

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
| F10 | Fable 5.1 (done 2026-09-11, approved §1.9) | — (`docs/improvement-report.md`) | §14 | Anton opened it manually; it spawned nothing |
| O17 | Opus | `prompts/opus-17-money-and-auth-correctness.md` | §14.1 | **Anton pastes one line in a fresh Opus window** — first improvement phase |
| O18 | Opus | `prompts/opus-18-abuse-and-ops-hardening.md` | §14.2 | spawned by O17 |
| O19 | Opus | `prompts/opus-19-rendering-and-leadform-perf.md` | §14.3 | spawned by O18; **moves the brand folders** (§14.3) |
| S20 | Sonnet | `prompts/sonnet-20-quality-gates-and-repo-hygiene.md` | §14.4 | spawned by O19; runs alone before S21–S23 |
| S21 | Sonnet | `prompts/sonnet-21-seo-surfaces.md` | §14.5 | spawned by S20, in parallel with S22–S23 |
| S22 | Sonnet | `prompts/sonnet-22-funnel-fixes.md` | §14.6 | spawned by S20, parallel |
| S23 | Sonnet | `prompts/sonnet-23-content-depth.md` | §14.7 | spawned by S20, parallel; spawns nothing |

Total automated build: 6 Opus + 15 Sonnet sessions (F10 added O17–O19 and S20–S23, §14). **Chain as of F10:** O17 (Anton pastes) → O18 → O19 → S20 → S21 ∥ S22 ∥ S23 (each ends with a report, none spawns S6/S15). S6 → S15 → F7 stay gated on Anton's §7 items; S15 must run after O19 merges because it deploys the moved tree. Original total: 3 Opus + 11 Sonnet sessions. Fable touches the plan ends and the two replans only (F0; F8 and F9 as mid-build replans opened by Anton; F7 at the end). Neither replan spawned anything. **Chain as of F9:** S16 (Anton pastes) → S10–S14 in parallel (spawned by S16) → S15 (claim rule, needs S6 merged) → F7 (Anton opens). S6 sits beside that chain: it is owner-blocked on hosting, DNS and Stripe live, and Anton re-runs it whenever those are done; S15 is the only phase that waits on it. S10–S14 run in parallel per `phased-autonomous-build`'s two-lane pattern: one sequential Opus foundation lane (O9), then content phases that each own their own files.

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
9. **Fable 5.1 usage approved for this project:** F0 (this plan, including §11 key copy), F7 (launch review, opened manually by Anton), and **F8 (2026-09-07 approval)** — finalizing the §12 platform-consolidation proposal into locked decisions, naming the remaining SiteKeys, writing key copy for any new brand needing distinct positioning, and writing the next Opus/Sonnet phase's prompt file(s) per `prompts/fable-8-platform-consolidation-plan.md`. F8 is spec/planning work, never spawned, and never spawns another Fable phase. **F9 (2026-09-07 approval)** — re-planning the brand↔domain map after Anton confirmed which domains he actually owns, rewriting the §11 copy for the renamed brands, and updating the S10–S15 prompt files, per `prompts/fable-9-domain-rebrand-replan.md`. Same terms: Anton opens it himself, it spawns nothing. **F10 (2026-09-11 approval)** — the improvement review after the content lane merged: four Opus/Sonnet audits read by Fable, decisions written into §14, `docs/improvement-report.md`, the O17–S23 prompt files and `docs/design-prompts.md`. Same terms: Anton opened it himself, it spawned nothing. No other phase, subagent, spawned session, or automation runs on Fable. These approvals are recorded here per guardrail v2 §"Approved Fable work".
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
10. **Build log:** before merging, append a dated 5–10 line entry to §9 — phase id + PR link, what now exists, decisions/deviations, where the next phase should look first. Fresh sessions first read `plan.md`, its §9 phase index, and the open items in `KNOWN-ISSUES.md`; consult `docs/log/` for per-phase detail and `docs/known-issues-archive.md` for cleared-issues history.
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

- Orchestration | 2026-09-03 | PR not recorded | [docs/log/orchestration.md](docs/log/orchestration.md)
- O1 | 2026-09-03 | [PR #2](https://github.com/antonmarklundcom/paraguayresidency/pull/2) | [docs/log/o1.md](docs/log/o1.md)
- O2 | 2026-09-07 | [PR #4](https://github.com/antonmarklundcom/paraguayresidency/pull/4), [PR #5](https://github.com/antonmarklundcom/paraguayresidency/pull/5) | [docs/log/o2.md](docs/log/o2.md)
- F8 | 2026-09-07 | PR not recorded | [docs/log/f8.md](docs/log/f8.md)
- O9 | 2026-09-07 | [PR #7](https://github.com/antonmarklundcom/paraguayresidency/pull/7) | [docs/log/o9.md](docs/log/o9.md)
- S3 | 2026-09-07 | [PR #8](https://github.com/antonmarklundcom/paraguayresidency/pull/8) | [docs/log/s3.md](docs/log/s3.md)
- S4 | 2026-09-07 | PR not recorded | [docs/log/s4.md](docs/log/s4.md)
- S5 | 2026-09-07 | PR not recorded | [docs/log/s5.md](docs/log/s5.md)
- F9 | 2026-09-07 | PR not recorded | [docs/log/f9.md](docs/log/f9.md)
- S16 | 2026-09-09 | PR not recorded | [docs/log/s16.md](docs/log/s16.md)
- S14 | 2026-09-09 | PR not recorded | [docs/log/s14.md](docs/log/s14.md)
- S10 | 2026-09-09 | PR not recorded | [docs/log/s10.md](docs/log/s10.md)
- S11 | 2026-09-09 | PR not recorded | [docs/log/s11.md](docs/log/s11.md)
- S12 | 2026-09-09 | PR not recorded | [docs/log/s12.md](docs/log/s12.md)
- S13 | 2026-09-09 | [PR #21](https://github.com/antonmarklundcom/paraguayresidency/pull/21) | [docs/log/s13.md](docs/log/s13.md)
- F10 | 2026-09-11 | PR not recorded | [docs/log/f10.md](docs/log/f10.md)
- O17 | 2026-09-11 | [PR #26](https://github.com/antonmarklundcom/paraguayresidency/pull/26) | [docs/log/o17.md](docs/log/o17.md)
- O18 | 2026-09-11 | [PR #28](https://github.com/antonmarklundcom/paraguayresidency/pull/28) | [docs/log/o18.md](docs/log/o18.md)
- O19 | 2026-09-15 | [PR #32](https://github.com/antonmarklundcom/paraguayresidency/pull/32) | [docs/log/o19.md](docs/log/o19.md)
- S20 | 2026-09-15 | [PR #33](https://github.com/antonmarklundcom/paraguayresidency/pull/33) | [docs/log/s20.md](docs/log/s20.md)
- S21 | 2026-09-15 | [PR #39](https://github.com/antonmarklundcom/paraguayresidency/pull/39) | [docs/log/s21.md](docs/log/s21.md)
- S22 | 2026-09-15 | PR pending | [docs/log/s22.md](docs/log/s22.md)

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
- **Design uplift per brand (S24+, Sonnet, one phase per brand).** Anton runs `docs/design-prompts.md` in Claude Design, picks one canvas per brand; each phase ports one canvas into that brand's pages using the existing component library and tokens. Not started until he picks.
- DB-backed rate limits (`rate_limits` table) if the app ever runs on more than one Node process; O17's `src/lib/rate-limit.ts` is the one-process answer and O18 wires it everywhere. The same caveat covers `withEventLock` in `src/lib/webhooks.ts`: on two processes the lock stops helping and only `fulfilCheckout`'s conditional UPDATE holds (it does).
- **`resources.drip_days`** (O17). `modules` and `lessons` drip; `resources` has no offset column, so `resourceUnlocked()` uses a constant 0. The route already runs the full `isUnlocked()` gate, so adding the column is one constant in `download-policy.ts` plus a migration — not a route change.
- **`purchases.expires_at`** (O17). A dated `entry` grant in `/admin` is refused today because a purchase has no expiry; the workaround is a dated `insider` grant. Worth a column only if Anton actually sells time-limited entry access.
- **Live-MySQL webhook tests** (O17, also in `KNOWN-ISSUES.md`). The decisions are pure-tested; the SQL underneath them (`affectedRows` on a re-claim, `ER_DUP_ENTRY` on the checkout unique index) is not. O2 proved MariaDB installs in the build container.
- Structured logging + error reporting (pino → a hosted sink) before real traffic volume; O18 adds only the health-check signals.
- One shared `ServicePage` shell for the five per-brand copies (398 lines, same structure) — only if a structural fix has to be applied five times twice.
- WhatsApp-first single-field lead capture as its own `leads.kind` — O19 ships the short variant on the existing kinds.
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

## 14. Improvement plan — decided 2026-09-11 (F10)

Evidence and reasoning: `docs/improvement-report.md`. Order: O17 → O18 → O19 → S20 → (S21 ∥ S22 ∥ S23). All
Opus work first, all Sonnet work after, per Anton's instruction. Every phase runs under §4; the Sonnet hard
limits in §4.7 hold unchanged except where a phase below names one file it may open. No phase changes
`src/db/schema.ts` — the schema is FINAL (O9). S6 → S15 → F7 are untouched and remain gated on §7; S15 must
run after O19 merges.

**Path note (O19 onward):** brand folders move from `src/app/sites/<key>/` to
`src/app/(<locale>)/sites/<key>/` — `(en)` for residency, investorpass, guide, frontier; `(es)` residenciaes;
`(pt)` residenciapt; `(sv)` flytta. Route groups do not appear in URLs, so `src/middleware.ts` rewrites,
sitemaps, tests and every public path are unchanged. Wherever an older section says `src/app/sites/<key>/`,
read the new location after O19 has merged.

### 14.1 Phase O17 — Money & auth correctness (Opus)

Owns: `src/lib/{webhooks,signing,auth,member-auth,lemonsqueezy,subscriptions,purchases,entitlements,member-admin,download-policy}.ts`,
`src/app/api/**`, `src/app/(en)/sites/guide/members/resources/[slug]/download/route.ts` (still at
`src/app/sites/guide/...` when O17 runs), `src/app/api/health/**`, `tests/**`, `.env.example`, `docs/platform.md`.

1. **Webhook retries must retry.** `finishWebhookEvent(id, error)` on the error path writes `error` and leaves
   `processedAt` null, so the next delivery re-runs the handler. Both routes keep answering 500 on failure.
2. **Claim before processing, one fulfilment per event.** Single Node process: an in-process per-event-id lock
   around the handler in both webhook routes, plus `fulfilCheckout` marking a purchase paid inside a transaction
   (`SELECT … FOR UPDATE` on the checkout row, or an `UPDATE … WHERE status <> 'paid'` whose affected-row count
   gates the email/token side effects). Two concurrent deliveries → one purchase, one token, one email.
3. **Production refuses a weak secret.** When `NODE_ENV === 'production'` and `hasStrongSecret()` is false,
   `sessionOptions()`, `memberSessionOptions()`, `issueMagicToken` and every `signingSecret()` consumer throw a
   clear error; `next build` still passes with an empty `.env` (the check is at request time, not import time).
   `/api/health` reports `secret: "weak"|"ok"`. `.env.example` says so above `SESSION_SECRET`.
4. **Lemon Squeezy idempotency and refunds.** `lemonSqueezyEventId` uses `meta.webhook_id` when present, else
   `<event>:<id>:<sha256(rawBody)>`; verify against the LS webhook docs what a retry carries and record it in a
   comment. Handle `order_refunded` → `markRefunded`. `effectiveTier` grants `entry` only for a subscription that
   has had a paid period (Opus picks the field: `current_period_end`/status history — no new column).
5. **Admin grants are rows, not cache writes.** `grantTierUntil` inserts a real `subscriptions` (or zero-amount
   `purchases`) row with the right `ends_at`, then `refreshUserTier()`; the success message becomes true.
   `reconcileTiers` needs no exemption because the truth now carries the grant.
6. **`FREE_ACCESS_MODE`** passes `providerOrderId: checkoutId`, refuses to run when `STRIPE_SECRET_KEY` is set,
   and is limited per IP (5/hour) using a tiny `src/lib/rate-limit.ts` `take(key, max, windowMs)` over a `Map`
   with lazy eviction (never a global `clear()`). O18 reuses the module everywhere else.
7. Member resource downloads check `isUnlocked` (tier **and** drip), matching lessons.
8. Tests, all pure or against the in-memory fixtures the existing tests use: `finishWebhookEvent` semantics,
   duplicate-then-retry flow, `fulfilCheckout` idempotency and the already-paid branch, the LS event id for a
   retried `subscription_updated`, `order_refunded`, never-paid subscription → `none`, `grantTierUntil` visible to
   `effectiveTier`, production weak-secret refusal, free-mode second buyer succeeds. Target ≥ 15 new tests.

Exit: `npm run verify` green; every item above has a named test; `docs/platform.md` §3 (webhooks) and the tier
rules updated in ≤ 15 lines; PR merged; §9 entry. Handoff: spawn O18 (Opus).

### 14.2 Phase O18 — Abuse & ops hardening (Opus)

Owns: `src/lib/{rate-limit,leads,email,form-guard}.ts`, `src/app/actions/**`, `src/app/admin/actions.ts`,
`src/app/api/{subscribe,auth,checkout}/**`, `src/middleware.ts`, `src/sites/resolve.ts`, `next.config.ts`,
`src/app/api/health/**`, `tests/**`, `docs/runbook.md` (create if S6 has not merged; S6 keeps its own text on merge).

1. **Rate limits through O17's `take()`**: admin `loginAction` 5 per 15 min per IP+email with a fixed ~250 ms
   delay on failure; `/api/subscribe` 3 per hour per email and 20 per hour per IP (a pending address is NOT
   re-mailed on every call — one resend per hour); `/api/checkout` 10 per hour per IP; lead server actions 10 per
   hour per IP; `/api/auth/magic` keeps its limits but increments email **and** IP and drops `attempts.clear()`.
   Middleware applies a coarse 120/min per IP to `POST /api/*`. The IP is `x-forwarded-for`'s first hop when
   present. Everything answers 429 with a plain message the forms render.
2. **A lead is never lost.** `createLead` catches non-duplicate insert errors, logs, still calls `deliverLead`
   (CRM + notification email) and returns `{ok:true, stored:false}`; the visitor sees success. Test it.
3. **No credentials or PII in logs.** Console email mode logs subject + recipient only in production (full body
   stays in development); `/api/health` reports `email: "resend"|"smtp"|"console"`, `crm: on|off`,
   `secret` (from O17). `sendEmail` in console mode returns `ok:false, mode:'console'` in production so callers
   can surface it.
4. **Headers.** `next.config.ts` `headers()`: HSTS (only in production), `X-Content-Type-Options`,
   `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal, `frame-ancestors 'none'`
   via CSP for `/admin` and `/members`; a report-only CSP for the public tree that allows Plausible. Middleware
   deletes any client-supplied `x-site` before setting its own.
5. Tests: limiter windows and eviction, each limited route's 429, lead DB-failure path, header presence,
   `x-site` spoof. Target ≥ 10 new tests.

Exit: verify green; a scripted `tests/abuse.mjs` hits login/subscribe/magic 30× against `next start` and shows
429s (kept under `tests/`, not in CI); PR merged; §9 entry. Handoff: spawn O19 (Opus).

### 14.3 Phase O19 — Rendering & LeadForm performance (Opus)

Owns: everything under `src/app/` (the move), `src/lib/{site-shell,metadata,seo-files,site-pages,analytics}.ts(x)`,
`src/components/{LeadForm,LeadFormFields,NewsletterForm*,MagicLinkForm*,CheckoutButton*}.tsx`, `src/lib/countries.ts`,
`tests/**`, `docs/platform.md`, `CLAUDE.md` (the one path line), `plan.md` §4.12 (path note only).

1. **Route groups per locale.** Move `src/app/sites/<key>/` → `src/app/(<locale>)/sites/<key>/` per the path
   note. Each group gets its own root `layout.tsx` with a hardcoded `lang`, `globals.css` import and the theme
   plumbing the old root layout had; the old `src/app/layout.tsx` goes away (Next requires the top level to be
   route groups only). `admin`, `api`, `blocked`, `dev`, `robots.txt`, `not-found` live under `(en)` (or a
   `(shared)` group with `lang="en"`); each group has its own `not-found.tsx`. `currentSite()` stays for API and
   shared routes only.
2. **Static where possible.** After the move, `next build` must print `○` for every marketing page that reads
   no request-time data. Pages that read the live price (`guide` home, `/insider`) use `export const revalidate = 300`
   instead of `force-dynamic`; `next build` still passes with no database (`getProductBySlug` already falls back).
   Member, account, admin, route-finder result, thank-you and confirm pages stay `ƒ`.
3. **LeadForm.** Server-render a plain `<form action={serverAction}>` that submits without JavaScript (country
   `<select>` options rendered on the server — the client bundle no longer imports `COUNTRIES`); hydrate the
   enhancement (pending state, inline errors) lazily via `next/dynamic` when the form scrolls into view or receives
   focus. Add a `variant="whatsapp"` short form (name + WhatsApp number + one line) on the existing `contact`
   kind for the LatAm brands (S22 places it). Same treatment for `NewsletterFormFields` and `MagicLinkFormFields`.
4. **Events.** `src/lib/analytics.tsx` (from S6's branch if unmerged — port the file, S6 keeps its own on merge)
   exposes `track(name, props)` that no-ops without Plausible; fire `lead_submitted`, `newsletter_subscribed`,
   `checkout_started`, `quiz_completed`. No PII in props.
5. **Measure.** `tests/lighthouse.mjs` (Chromium at `/opt/pw-browsers`, mobile preset) runs the seven homes plus
   `/residency/temporary-residency`, investorpass `/`, frontier `/tax` and prints a table; commit the script, not
   the reports. Bar: perf ≥ 0.90 on every one of them in this container.
6. Update `docs/platform.md` "Adding the eighth domain", the CLAUDE.md line on host → site resolution, and §4.12's
   file-ownership paths to the new location. `tests/resolve.test.ts` and any test that asserts the old folder
   must still pass unchanged where it tests URLs, and be updated where it tests file placement.

Exit: verify green; build output shows ≥ 80 % of `src/app/(…)/sites/**` page routes as `○`; Lighthouse table
committed to the §9 entry; all seven `*.localhost:3000` hosts render with the right `<html lang>`; PR merged.
Handoff: spawn S20 (Sonnet).

### 14.4 Phase S20 — Quality gates & repo hygiene (Sonnet, sequential)

Owns: `tests/**`, `.github/**`, `package.json` (`engines`, `@types/node` only), `.nvmrc`, `content/**/*.mdx`
**frontmatter only** (title/description trims), `docs/log/**` (new), `docs/known-issues-archive.md` (new),
`plan.md` §9 and `KNOWN-ISSUES.md` (the split), `CLAUDE.md` (two lines).

1. `tests/content.test.ts` enforces title ≤ 60 and description ≤ 155 (the plan's bar); trim the 12 offending
   files (10 titles, 2 descriptions) without changing their slugs or meaning.
2. A test that every `.tsx` page under a non-`en` brand group passes `site=` to `<Fact>` (the S11 trap), and a
   repo-root stray-file check (no untracked files outside the known set after a build).
3. CI: `npm audit --omit=dev --audit-level=high`; `.github/dependabot.yml` (npm, weekly, grouped minor/patch);
   a migration-drift job (`drizzle-kit generate` must produce no new file; fail if it does); a Lighthouse job
   running O19's `tests/lighthouse.mjs` against `next start` on PRs, uploading the table as an artifact
   (non-blocking the first two weeks — mark it `continue-on-error` and say so in the workflow comment).
4. `package.json` `"engines": {"node": ">=22"}`, `.nvmrc` `22`, `@types/node` → `^22`.
5. Pure tests for `metadata.ts` (canonical, OG, JSON-LD shapes), `whatsapp.ts`, `thank-you.ts`, `subscribers.ts`
   token shape; ≥ 12 new tests.
6. **Docs split.** Move every §9 phase entry into `docs/log/<phase>.md` (one file per phase, content verbatim),
   leave §9 as a one-line-per-phase index (id, date, PR, log path). Move every `CLEARED`/`FIXED` entry of
   `KNOWN-ISSUES.md` to `docs/known-issues-archive.md`; the root file keeps only open items. Update §4.10 and the
   orientation-read sentence in CLAUDE.md to point at the index + per-phase logs. Target: `plan.md` < 700 lines.

Exit: verify green with the tighter bar; CI has the four new jobs and they run on this PR; `plan.md` < 700
lines; PR merged. Handoff: spawn S21, S22 and S23 at once (three `create_session` calls, Sonnet).

### 14.5 Phase S21 — SEO surfaces (Sonnet, parallel with S22–S23)

Owns: new index `page.tsx` files for every article hub (`residency/guides` + `/guides/[hub]`,
`investorpass/insights`, `frontier/stories`, `residenciaes/guias` + hub indexes, `residenciapt/guias` + hub
indexes, `flytta/guider`, `flytta/stader`), a `feed.xml/route.ts` per brand, `src/lib/seo-files.ts`,
`src/lib/rss.ts` (new), `src/sites/registry.ts` **string/array values only** (nav/footer items), the three
frontier pages `routes`, `tax`, `why-paraguay`, and `residenciaes`'s pages for the WhatsApp link.

1. Index pages: list every published article with title, description, date, hub; breadcrumbs; `CollectionPage`
   JSON-LD; in the brand's locale; added to `staticPaths` and the sitemap. Hub-level indexes on the multi-hub
   brands (`/guides/documents` etc.).
2. RSS 2.0 per brand at `/feed.xml` (articles only, absolute URLs from the registry), `<link rel="alternate">`
   in the brand layout via `siteMetadata` if that needs a one-line additive prop.
3. Nav/footer values: `residenciapt` gets `/precos` and `/investor-pass`; `residenciaes` gets `/mercosur` and
   `/pase-inversor`. Both brands' article indexes in the footer. i18n: reuse existing `nav.*` keys; add a key to
   all four `common.json` only if none fits.
4. `frontier`'s three service-style pages emit `Service` JSON-LD like the other brands' `ServicePage`s.
5. `residenciapt`'s `/investor-pass` sitemap exclusion gets the same explanatory comment `residenciaes` has.
6. WhatsApp click-to-chat on `residenciaes` (contact page, service pages, home) via `whatsappHref`, Spanish
   prefilled message.

Exit: every brand has a crawlable article index and a feed; `staticPaths` and sitemaps list them; verify
green; PR merged; §9 index line + `docs/log/s21.md`. Spawns nothing.

### 14.6 Phase S22 — Funnel fixes (Sonnet, parallel)

Owns: `src/features/quiz/questions.ts` (**the `ROUTE_DESTINATIONS` table only** — `scoring.ts` stays closed),
`src/app/(en)/sites/residency/pricing/**`, `src/app/(en)/sites/guide/insider/page.tsx`, the service pages of
every brand (a trust/process block), `content/shared/facts.ts` (new `pricing.*` keys), the contact pages of
`residenciaes`, `residenciapt`, `frontier`, `flytta` (the short WhatsApp variant from O19),
`src/components/ProcessTimeline.tsx` (new, additive), `src/i18n/messages/*/common.json` (additive keys only).

1. **Quiz destinations per site.** `ROUTE_DESTINATIONS` becomes a per-`SiteKey` map: each brand's own
   temporary/permanent page when it has one, the hub only for `residency`-less brands (`guide`); `investor-pass`
   keeps crossing to `paraguayinvestorpass.com` by design. `docs/route-finder.md` updated; a test per brand.
2. **Hub `/pricing`.** Rebuild as "what a fixed fee covers, what it never covers, how quoting works, what you
   pay the state vs. us", per route. Every figure is a `<Fact k="pricing.<route>">` seeded `verified:false` with a
   hedged display ("quoted on your call"); Anton types the real numbers in `/admin/facts` (§7). Same treatment
   on `residenciaes` `/precios`, `residenciapt` `/precos`, `flytta` `/priser`, `frontier` `/pricing` — one key set,
   per-locale `display`.
3. **Trust and process.** A `ProcessTimeline` component (steps, "who does what", typical durations through
   existing `<Fact>` timeline keys) on every brand's service pages; an honest "who files your case" block using
   the copy that exists (the Asunción team, the weekly cadence); testimonials stay hidden until §7.
4. **Short WhatsApp form** (O19's variant) beside the full form on the four non-hub service brands' contact
   pages and home CTAs.
5. `/insider` FAQ reads the live Guide price via `formatPrice` instead of "$7".

Exit: quiz on each brand lands on-brand (tests); five pricing pages render through facts; timeline on every
service page; verify green; PR merged; log. Spawns nothing.

### 14.7 Phase S23 — Content depth (Sonnet, parallel, fan-out)

Owns: **bodies only** of `content/**/*.mdx` (frontmatter titles/descriptions were trimmed by S20 — do not
change them), new MDX files under existing hubs, `docs/guide-outline.md`.

1. Expand the five ~100-word public stubs to 900–1200 words each, delivering the comparison their titles
   promise (`is-paraguay-residency-worth-it`, `what-the-investor-pass-is`, `sa-gar-flytten-till`,
   `rutas-de-residencia`, `rotas-de-residencia-temporaria-permanente-mercosul`).
2. **Paid content first.** Every lesson under `content/guide/members/` to 700–1200 words; the three Insider
   updates and the deep dive to 1000–1500 with a worked case (anonymised, hedged, every figure a `<Fact>`).
   This is the product people pay for; it must out-depth the free blog.
3. Nationality pillar articles under the hub's `documents` hub: British, American, German, South African
   applicants (apostille chain, police certificate issuer, translation needs — hedged, no figures outside
   `<Fact>`); two under `frontier/stories` (US, Canada). The `.co.uk` UK tilt from §10 lands here.
4. Fan-out per `fable-directs-sonnet-builds`: brief each subagent with the fact-key allowlist, the frontmatter
   schema, the `related` link rule and the S20 length bar; one audit pass (word counts, `<Fact>` keys, links)
   before the PR.

Exit: no public article under 600 words, no member lesson under 700; six new pillar articles; every new file
passes `content.test.ts` and `content-links.test.ts`; verify green; PR merged; log. Spawns nothing. The
closing report restates the §7 items that gate S6 and that S15 runs after O19.

# Phase F9 — Domain reality re-plan. Paste into a fresh FABLE 5.1 window that Anton opens himself.

**Never spawned. Never spawns another Fable phase.** Approved by Anton on 2026-09-07 and recorded in
plan.md §1.9 — see the fable-cost-guardrail skill, "Approved Fable work". This is spec and key-copy
work: decide the brand↔domain map, rewrite the affected §11 copy blocks, and update the S10–S15
prompt files. Write no application code beyond what a delta-spec needs; the sweep is a Sonnet phase
you specify, not work you do.

Read `plan.md` in full first, plus §9 (build log) and `KNOWN-ISSUES.md`.

## 1. What happened

F8 locked a seven-brand map in §1.11 / §12.2 on the assumption that Anton owned seven specific
domains. On 2026-09-07, after O9 and S3–S5 had already merged, he confirmed the real list. Three
were wrong and one brand has no domain at all.

**What Anton actually owns:**

| Domain | Brand it should serve | Plan currently says |
|---|---|---|
| `paraguayresidencyguide.com` | `guide` — the $7 Guide + Insider membership | ~~paraguayinvestorguide.com~~ (not owned) |
| `paraguayinvestorpass.com` | `investorpass` — brand name confirmed **"Paraguay Investor Pass"** | ~~paraguayinvestorpass.com.py~~ (he owns the `.com`) |
| `paraguayfrontier.com` | `frontier` | ✅ correct |
| `residenciaparaguay.es` | `residenciaes` | ✅ correct |
| `vidanoparaguai.com` | `residenciapt` — brand name **"Vida no Paraguai"** | ~~residencianoparaguay.com~~ (not owned) |
| `flyttatillparaguay.se` | `flytta` | ✅ correct |
| `paraguayresidency.co.uk` | **unassigned — see below** | not in the plan at all |

**`paraguayresidency.com` is NOT owned and is not available to buy.** That is the `residency`
brand — the hub. This is the decision this phase exists for.

**`paraguayresidency.co.uk` is owned and was missing from every version of the plan.** Anton
surfaced it after the list above. It is the only `paraguayresidency`-branded domain he has, which
makes it the obvious hub candidate — but `.co.uk` is a ccTLD that Google geo-targets to the United
Kingdom, and the hub is meant to be the global English service brand (§1.2), so using it as the hub
trades brand fit against international reach. Weigh that honestly. It is also a legitimate eighth
brand — a UK-market spoke, the way `frontier` serves Americans — and appending a SiteKey is free
(§3). Ask Anton which he wants if the answer is not clear from the funnel.

Anton's brief for the Brazil brand, verbatim: *"For brand go Vida no Paraguai and sell residency in
paraguay in portugese focus on brazil."* Note the name means "Life in Paraguay", which is broader
than §11.7's current "Residência no Paraguai" framing — the positioning needs rewriting, not just
a find-and-replace.

## 2. The decision this phase owns

**The hub has no domain.** Today `residency` is: the primary SEO surface; the only host serving
`/admin` (leads, purchases, members); `HUB_SITE`, the redirect target for any unknown host; and the
brand every other brand's footer links to. S3 already built and merged 17 pages and 8 MDX articles
for it.

Options seen so far — weigh them, pick one, record why:

0. **Use `paraguayresidency.co.uk` as the hub.** Zero cost, right brand name, already owned. The
   objection is the ccTLD geo-signal — decide whether that actually hurts a business whose
   customers are worldwide and whose traffic will be long-tail informational, or whether it is a
   theoretical worry.
1. **Buy a different residency domain** (`paraguayresidency.com.py`, `residencyparaguay.com`,
   `paraguay-residency.com`, …). Cheapest in rework; Anton must agree to register it.
2. **Promote `paraguayfrontier.com` to be the hub** and drop `frontier` as a separate brand.
   Seven brands become six, S10 disappears. Costs the §11.5 plan-B positioning, or merges it into
   the hub's.
3. **Run the hub on `paraguayresidencyguide.com`** alongside the guide. One domain, two jobs.
   Cheapest in money; muddies a $7 product with high-ticket services and puts `/admin` on the
   selling domain.
4. **Restructure the brand map** — something better than the above, given six real domains and the
   funnel in §1.2. You have latitude here; that is why this is a Fable phase.

Whatever you choose, `/admin` must live on exactly one host and the "unknown host → redirect here"
target must be a domain that exists.

## 3. Constraints — read before deciding

- **Domains are free to change.** `hosts`, `canonicalHost` and `crm.source` are three lines per
  brand in `src/sites/registry.ts`. No database impact.
- **SiteKeys are NOT free.** `siteEnum` in `src/db/schema.ts` mirrors `SITE_KEYS` and is a MySQL
  `enum` column on `leads`, `subscribers`, `products`, `purchases`, `subscriptions`, `modules`,
  `lessons`, `resources` and `updates_posts`. **Appending** a key is free. **Renaming or removing**
  one is a migration. O9 proved the `RENAME TABLE` / `CHANGE COLUMN` pattern preserves every row
  (see `tests/migration.test.ts`), so it is doable — but it must be a deliberate, specified step,
  not a side effect. Prefer keeping the existing keys and only changing what a key *points at*.
- **The schema is otherwise FINAL as of O9.** Do not propose new columns. Every column S10–S15
  needs already exists; the §9 O9 entry lists them.
- **Brand names, taglines and all copy are free to change** — they live in
  `src/i18n/messages/<locale>/<key>.json` and §11.
- **Locked and still true:** one app / one repo / one hosting slot (§1.1, §1.7); one locale per
  brand (§1.3); the tier vocabulary `none|entry|insider` (§1.12); Stripe one-time + Lemon Squeezy
  subscriptions (§1.13); MDX member bodies (§1.14); magic-link member auth (§1.15). Do not
  re-litigate these.

## 4. Also fold in: two findings from the build

1. **pararesi was never deployed.** Its own plan marks Phase 8 (deploy) "⛔ Owner-blocked, not
   started" — no Hostinger slot, no domain, no live Lemon Squeezy store. So §1.13's "existing
   subscribers stay there" and §12.3's member/purchase/subscription import are probably importing
   an empty database. O9's import script is written, tested and idempotent, so this costs nothing —
   but S15's "real run" should be re-scoped from a migration to a verification, and the Insider
   tier treated as a new product launch rather than a cutover. Confirm with Anton, then say so in
   the plan.
2. **§8.2 is answered.** "Is `paraguayinvestorpass.com.py` the canonical Investor Pass brand, or
   should a `.com` be acquired and the `.com.py` redirect?" — Anton owns the `.com`. Close the
   question; decide whether the `.com.py` is worth holding as a redirect.

## 5. Build state you are re-planning around

Merged on `main`: O1, O2, O9 (PR #7), S3 (PR #8 + audit #9), S4 (PR #10), S5 (PR #11, #12).
`npm run verify` is green — 321 tests.

Open and **not merged**: [PR #13](https://github.com/antonmarklundcom/paraguayresidency/pull/13),
phase S6 (deploy prep, Plausible, runbook). S6 stopped because it has no Hostinger/DNS/Stripe/Search
Console access, and it deliberately did **not** spawn S10–S14 — plan §4.12 gates the parallel lane
on S6 merging green. Its blockers are itemized in `docs/decisions-needed.md` on `phase/s6`.

**Not started:** S10, S11, S12, S13, S14, S15.

Wrong domains are already baked into merged content — `src/sites/registry.ts`, three page files
under `src/app/sites/*/`, ~6 test files, `docs/platform.md` and `plan.md` itself all name the old
hosts. Nothing catastrophic; it needs one deliberate sweep.

## 6. What to produce

1. **The decision on the hub**, with the reasoning, written into §1.11 and §12.2 as a locked
   decision. If it needs Anton to buy a domain, say exactly which and stop for his yes.
2. **The corrected brand map** — §1.11, §12.2, and the §2 registry contract — with the six real
   domains and whatever you decide for the hub.
3. **§11.7 rewritten** for **Vida no Paraguai** on `vidanoparaguai.com`: audience, angle, keyword
   cluster, H1, sub, three value points, meta title and description, and the hedging rule. Brazilian
   Portuguese. The Mercosur and Brazilian-tax hedging rules from the current §11.7 still apply —
   `<Fact k="mercosur.residency_route">` exists and is unverified.
4. **§11.3 updated** for the guide brand on `paraguayresidencyguide.com` — the registry `name` is
   still "Paraguay Investor Guide" and the seed already calls the product "The Paraguay Residency
   Guide". Reconcile them.
5. **§11.2 confirmed** — brand name "Paraguay Investor Pass", domain `paraguayinvestorpass.com`.
6. **§8.2 closed**, and the pararesi finding folded into §1.13 / §12.3 / §6.10.
7. **Updated prompt files** for every phase not yet run: `sonnet-10` … `sonnet-15`. If your hub
   decision drops or merges a brand, delete or rewrite that phase's file and fix the spawn chain in
   the phase table so no phase spawns one that no longer exists.
8. **A new Sonnet sweep phase** — call it S16 or fold it into S10 — specified as a delta-spec: swap
   every old domain in the registry, pages, tests and docs; update the brand names in the i18n
   files; re-run `npm run verify`; one PR. Say exactly which files. Do not do this work yourself.
9. **§9 build-log entry** for F9, and the phase table updated so the chain is correct end to end.
10. **A one-line STOP report** telling Anton which single line to paste next, and into which model's
    window. Per guardrail v2 §3, you spawn nothing.

## 7. Method

You are Fable in a window Anton opened. Per `fable-directs-sonnet-builds`: decide, write the spec
and the key copy yourself, and hand every mechanical edit to a Sonnet phase. Keep this phase small.
If something is genuinely Anton's call — buying a domain, dropping a market — stop and ask him in
the window rather than guessing. A wrong guess here costs five brand builds.

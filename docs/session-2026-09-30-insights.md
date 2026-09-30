# Session insights — 2026-09-30 (designs, domains, markets, what's left)

Handoff for the next chat. Read with `CLAUDE.md`, `plan.md` §1/§9, `KNOWN-ISSUES.md`,
`docs/design/handoff-2026-10.md` and `docs/design/nl-brand-plan.md`.

## 1. Anton's decisions and ideas from this chat

- **Keep the live paraguayresidencyguide.com design as it is for now.** The two guide design files
  ("red book" and the other book version) are parked.
- **Use the new "decision memo" design for paraguayinvestorpass.com as soon as possible.** It switches that
  brand from dark + gold to white + teal. Build prompt: `prompts/sonnet-25-investorpass-home.md`. Design file:
  `docs/design/investorpass-home.dc.html`.
- **Many designs are fine** as long as they don't cost speed. Each domain gets a design adapted to its
  market, language and audience.
- **One Dutch site as soon as possible**, not just a redirect. Plan: `docs/design/nl-brand-plan.md`
  (brand `emigreren`, canonical `emigrerennaarparaguay.nl`, alias `woneninparaguay.nl`).
- **Anton will connect the domains that aren't connected yet** (DNS on Hostinger).
- **New Claude Design homepages** were generated for paraguayresidency.co.uk (1a/1b), vidanoparaguai.com,
  residenciaenparaguay.es and emigrerennaarparaguay.nl from `docs/design-prompts-2026-09-30.md`. Anton
  has the design files. Each one still needs to be built (see §6).
- **The guide's offer should become a real value stack** (Hormozi, $100M Offers), not a "12-step PDF". That's a
  separate session: `docs/offer-session-prompt.md` (Fable 5.1 or Opus 5.5, in a window Anton opens).

## 2. Is one Node.js app for all domains a problem?

No. It's the intended architecture (plan §1.1).
- **Speed:** each brand loads only its own route code, its theme tokens (~1 KB) and ONE display font (~20 KB).
  Another brand's design never downloads, so more designs don't mean slower pages. Builds get longer, that's all.
- **Real costs:**
  - One Hostinger slot shares CPU and RAM across all domains, so a spike on one slows all.
  - One deploy covers everything, so a bad deploy takes all brands down. The CI gates are the protection.
  - Every custom design is code to maintain.
- **Rule:** share the plumbing (forms, leads, facts, checkout, SEO, admin); vary only the theme and the page
  composition per brand.
- **SEO:** sharing a server or IP is fine. Duplicate content and thin doorway sites are not. Unknown hosts 301
  to the hub (`src/sites/resolve.ts`, step 4), so parked domains never serve duplicate content. Keep it that way.
- **Adding a language or brand costs more than a design:**
  - a new `SiteKey`, which means a MySQL enum migration on every table with `site`,
  - a new locale, plus i18n files and facts in that language,
  - a new `(locale)` route group with its own root layout.
  That's an Opus foundation phase, then Sonnet content phases.
- **Best idea:** decide the NEXT languages (e.g. German) before the Dutch foundation runs, so ONE migration adds
  every new SiteKey at once instead of one migration per language.

## 3. Domains

### Brand domains (in the registry; `CLAUDE.md` table)

| Domain | Brand | Language / market | Hostinger status 2026-09-30 |
|---|---|---|---|
| paraguayresidency.co.uk | `residency`, the hub (service, /admin) | English, UK first | listed; earlier handoff said no DNS zone, check |
| paraguayinvestorpass.com | `investorpass` | English, global investors | listed; earlier handoff said no DNS zone, check |
| paraguayresidencyguide.com | `guide` (the only brand that sells) | English, global DIY | primary domain of the Hostinger slot |
| paraguayfrontier.com | `frontier` | English | connected |
| residenciaenparaguay.es | `residenciaes` | Spanish: Spain plus LatAm via the `por-pais` hub | connected. The domain is correct in the code; the registry **name** says "Residencia Paraguay", fix it to "Residencia en Paraguay" |
| vidanoparaguai.com | `residenciapt` | Brazilian Portuguese | NOT connected (Anton fixing) |
| flyttatillparaguay.se | `flytta` | Swedish | not in the parked list; the handoff said NXDOMAIN, check |

### Extra domains parked on the slot (not in the registry; they 301 to the hub today)

| Domain | Recommendation |
|---|---|
| emigrerennaarparaguay.nl | **Canonical of the new Dutch brand `emigreren`** (O24 item 7). Connected. |
| woneninparaguay.nl | Alias → 301 to emigrerennaarparaguay.nl (keeps the path). Not connected. |
| wakkerinparaguay.nl | **Do NOT use for sales.** "Wakker in Paraguay" is a VPRO/NPO documentary series (trademark/passing-off risk; see nl-brand-plan). Keep it redirecting or parked; ask a Dutch IP lawyer before any use. Not connected. |
| paraguayresidency.uk | 301 to the hub (same brand). Connected. |
| permanentresidencyparaguay.com | 301 to the hub (or later to a hub page about permanent residency). Connected. |
| paraguayhq.com | 301 to the hub. A possible future media/news brand; don't build a thin site. |
| paraguayimmigrationlawyer.com | 301 only. Never build a site on it unless a licensed Paraguayan abogado is really behind it ("lawyer" is a regulated claim). Connected. |

`CLAUDE.md` says Anton owns "exactly these, and nothing else". The Dutch foundation phase must add the .nl
domains to that table after Anton confirms ownership.

## 4. Countries and languages covered today

| Language | Brands | Countries it realistically reaches |
|---|---|---|
| English | residency (UK), guide, investorpass, frontier | US, UK, Canada, Australia, New Zealand, Ireland, South Africa, plus English-reading Europeans, Israelis, Indians, Gulf expats |
| Spanish | residenciaes | Spain; plus Argentina, Colombia, Venezuela, Mexico, Chile, Uruguay, Peru via the `por-pais` nationality pages (a .es domain signals Spain to LatAm readers) |
| Portuguese (BR) | residenciapt | Brazil; partly Portugal |
| Swedish | flytta | Sweden (Norwegians and Danes read it, but aren't targeted) |
| Dutch (planned) | emigreren | Netherlands, Flanders (Belgium) |

## 5. Top 20 markets to sell more Paraguay residencies (Claude's judgement — validate with Keyword Planner)

Ranking factors: size of the emigration interest in Paraguay, ability to pay a fixed fee, Paraguay's existing
communities, and ease of the residency route for that passport. This is informed judgement, not measured data:
confirm each market with Google Keyword Planner the way the NL market was checked (nl-brand-plan).

| # | Country | Language | Covered? | Note |
|---|---|---|---|---|
| 1 | United States | English | yes | largest paying English market; Investor Pass buyers |
| 2 | **Germany** | **German** | **NO: biggest gap** | huge "Auswandern nach Paraguay" scene, historic German communities (Hohenau, Colonia Independencia, Mennonite colonies) |
| 3 | Brazil | Portuguese | yes | neighbour, business owners, border families |
| 4 | Argentina | Spanish | partly (.es) | economic push factors; a LatAm-neutral Spanish domain would convert better |
| 5 | United Kingdom | English | yes (hub) | |
| 6 | **Austria** | **German** | **NO** | same German site, alias domain |
| 7 | **Switzerland** | **German / French** | **NO** | high ability to pay |
| 8 | Netherlands | Dutch | planned | keyword data exists |
| 9 | Canada | English / French | English yes | |
| 10 | Spain | Spanish | yes | |
| 11 | Australia | English | yes | |
| 12 | South Africa | English | yes | strong emigration interest; could deserve its own English landing pages |
| 13 | **Russia / Kazakhstan / Belarus** | **Russian** | **NO** | real demand, but sanctions, payments and compliance need care before building |
| 14 | **Ukraine** | **Ukrainian / Russian** | **NO** | |
| 15 | **France** | **French** | **NO** | second-largest EU language not covered |
| 16 | Belgium | Dutch / French | Dutch planned | |
| 17 | Sweden | Swedish | yes | |
| 18 | **Italy** | **Italian** | **NO** | Italian ancestry common in Paraguay |
| 19 | **Poland** | **Polish** | **NO** | smaller, cheaper to rank |
| 20 | **Taiwan** | **Traditional Chinese** | **NO** | Paraguay's diplomatic ties with Taiwan; niche, investor-heavy |

Also worth a look: Norway/Denmark (separate sites or not at all), Israel (English works), Colombia, Venezuela,
Mexico (Spanish covered), Japan/Korea (historic colonies, low emigration).

**Suggested order for new domains:**
1. German (one site; .de canonical, .at/.ch aliases) — decide before the Dutch migration so it goes into the
   same migration.
2. French (.fr).
3. A LatAm-neutral Spanish domain as an alias or second Spanish brand.
4. Italian.
5. Russian, only after a compliance and payments check.

Check domain availability yourself. Nothing here is registered.

## 6. What is left to code, and which model

| # | Work | Model | Status |
|---|---|---|---|
| 1 | **Investor Pass homepage redesign** (decision memo, white + teal) — `prompts/sonnet-25-investorpass-home.md` | Sonnet 5.5, high | NOT started |
| 2 | **Dutch brand foundation** (O24 item 7): SiteKey `emigreren`, enum migration (written, not applied; logged in `docs/db-work-later.md`), `nl` locale, registry, theme, `(nl)` route group, alias-host 301 for woneninparaguay.nl, CLAUDE.md domain table. Add German (and any other decided keys) in the same migration. | Opus 5.5, high | NOT started (`prompts/opus-24-lead-engine.md` item 7 already specs it) |
| 3 | Dutch pages + first ~30 articles per `docs/design/nl-brand-plan.md`, using the Claude Design NL homepage | Sonnet 5.5, high (pages) / medium (articles) | after #2 |
| 4 | Build the new Claude Design homepages: hub (co.uk), vidanoparaguai.com, residenciaenparaguay.es — theme + homepage only, same pattern as the S25-IP prompt | Sonnet 5.5, high, one PR per brand | Anton has the design files; write a prompt per brand modelled on S25-IP |
| 5 | Lead-form fields the Investor Pass design wants (capital band, nationality) if S25-IP can't use existing fields | Opus 5.5, medium | after #1 |
| 6 | Offer / value stack for the guide → then a new guide sales page, new products (Stripe/Lemon Squeezy rows and checkout wiring) | Offer session: Fable 5.1 or Opus 5.5 (Anton's window). Products/checkout: Opus. Page: Sonnet | after the offer session |
| 7 | Remove `FREE_ACCESS_MODE` once live Stripe keys are set (KNOWN-ISSUES) | Opus 5.5 | when Stripe is live |
| 8 | Next content wave from Keyword Planner CSVs per market | Sonnet 5.5, medium | when Anton attaches CSVs |
| 9 | Fix the registry name "Residencia Paraguay" → "Residencia en Paraguay" | Sonnet, low (trivial) | open |

## 7. Only Anton can do these (from this chat and `docs/design/handoff-2026-10.md`)

- Connect DNS: vidanoparaguai.com, woneninparaguay.nl (and check paraguayresidency.co.uk,
  paraguayinvestorpass.com and flyttatillparaguay.se resolve with SSL).
- Apply the pending migration `drizzle/0002_o24_lead_engine.sql` (steps in `docs/db-work-later.md`).
- hPanel env: `NEXT_PUBLIC_WHATSAPP_NUMBER`, email provider, CRM, Plausible, live Stripe keys.
- Real data in `content/shared/proof.ts`: team photos, office, reviews with permission, counts.
- Prices (`pricing.*` facts) and sign-off on unverified facts (`npm run facts:report`).
- Make the GitHub repository private (the paid guide chapters are public).
- Double-check wakkerinparaguay.nl with a Dutch IP lawyer before any use.

## 8. Design feedback (summary)

- **Investor Pass memo design: strongest.**
  - What works: the memo header with "Rules last reviewed", the qualifier in the hero, the routes table, the
    "one application instead of two" timeline, the agents and family offices section.
  - Fixes: never show "USD —" live (use facts or words); one web font only (mono → system); add real people;
    reconsider "we do not book sales calls" for the top capital bands.
- **Guide book designs:** nearly identical to each other; parked. Worth borrowing later: the sample page with a
  real table, and the contents list with dotted leaders.
- **Live guide site (screenshot):** "Free reading first" cards rendered solid black and the blog cards had large
  blank image areas. Check whether the images load.
- **Across all new designs:**
  - one signature interactive tool per brand that helps before it asks,
  - real faces and the office (fear of scams is the main objection),
  - "last verified" dates as a trust feature (facts already carry `sourced.checkedOn`),
  - copy written natively per market, never translated.

## 9. Model choices

- **Claude Design:** Opus 5.5 for first versions, Sonnet 5.5 for small tweaks.
- **Build phases:** Sonnet for theme/page/content work; Opus for schema, migrations, locale plumbing, API, lead
  schema, payments, middleware.
- **Fable:** only in windows Anton opens himself (the offer session). Never as a subagent or background run.

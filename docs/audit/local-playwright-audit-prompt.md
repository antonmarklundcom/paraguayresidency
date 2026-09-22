# Local full-site audit — run this on your own machine

A standalone prompt for a local Claude Code session. It crawls **every page of all seven brands** with
Playwright at three viewports, collects hard evidence (console errors, broken links, accessibility violations,
layout overflow, metadata, performance), reviews its own screenshots for design and CRO, and writes one ranked
report with a suggested fix per finding. **It fixes nothing** — you approve first.

## Why local

The audit needs the app *running*, so something has to serve it. Two options:

- **Local (this prompt).** You clone, `npm run dev`, and Claude drives a real Chromium against it.
- **Cloud session.** A Claude Code web session on this repo already has Chromium and Playwright installed
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), so it can run the identical audit with nothing installed on
  your machine. Same prompt, minus the clone step.

Either way you get the same report. Local is better if you want to poke at the screenshots afterwards.

## Before you paste the prompt

```bash
git clone https://github.com/antonmarklundcom/paraguayresidency.git
cd paraguayresidency
npm ci
cp .env.example .env        # leave every value empty — see below
```

**You do not need a database.** `src/db/index.ts` opens the pool lazily and `hasDatabase()` returns false with
no `DATABASE_URL`, so every marketing page renders. Only `/admin`, `/members`, `/login` and live checkout need
one; the guide's price falls back to `GUIDE_PRICE_CENTS`. Node 22. The dev server is `npm run dev` on
port 3000.

**Hosts.** One app serves seven brands off the request host, so the audit must hit subdomains, not paths.
Chromium resolves `*.localhost` to 127.0.0.1 with no hosts-file edit:

| URL | Brand | Locale |
|---|---|---|
| `http://localhost:3000` | `residency` (hub, has `/admin`) | en |
| `http://investorpass.localhost:3000` | `investorpass` | en |
| `http://guide.localhost:3000` | `guide` (the only brand that sells) | en |
| `http://frontier.localhost:3000` | `frontier` | en |
| `http://residenciaes.localhost:3000` | `residenciaes` | es |
| `http://residenciapt.localhost:3000` | `residenciapt` | pt-BR |
| `http://flytta.localhost:3000` | `flytta` | sv |

---

## The prompt — paste everything below into Claude Code, in the repo root

```
Audit every page of this repository's running app with Playwright, then write one ranked findings report.
Do NOT change any application code. The only files you create are under docs/audit/<today>/.

## What this app is

One Next.js app (App Router, TypeScript, Tailwind, Drizzle/MySQL) serving SEVEN brands off the request host.
src/middleware.ts resolves the Host header to a SiteKey via src/sites/registry.ts; pages live under
src/app/(<locale>)/sites/<key>/. Read CLAUDE.md and plan.md §1 before you start — §1 decisions are locked.
Read KNOWN-ISSUES.md too, and do not re-report anything already open there; instead note "already tracked".

Brands and their local hosts (port 3000):
  residency      http://localhost:3000              en   hub; owns /admin
  investorpass   http://investorpass.localhost:3000 en
  guide          http://guide.localhost:3000        en   the only brand with a checkout
  frontier       http://frontier.localhost:3000     en
  residenciaes   http://residenciaes.localhost:3000 es
  residenciapt   http://residenciapt.localhost:3000 pt-BR
  flytta         http://flytta.localhost:3000       sv

## Step 1 — get it running

Node 22. `npm ci`, then `cp .env.example .env` and leave the values empty. No database is required: getDb()
is lazy and hasDatabase() is false without DATABASE_URL, so every marketing page renders. /admin, /members,
/login and live checkout will fail without one — treat those as OUT OF SCOPE unless the failure is a crash
rather than a clean "no database" path.

Start `npm run dev` in the background, wait for it to compile, and confirm http://localhost:3000 returns 200
before crawling. Separately run `npm run verify` (typecheck + lint + test + verify:i18n + build) and record
its result in the report — a failing gate is itself a finding.

Install Playwright only if it is not already present. If the environment sets PLAYWRIGHT_BROWSERS_PATH,
Chromium is already installed — do NOT run `playwright install`.

## Step 2 — enumerate every page

Build the URL list from three sources, then dedupe:
  a) each brand's sitemap: fetch /sitemap.xml on every host above (each brand has its own sitemap.ts).
  b) a breadth-first crawl from each brand's homepage, following only same-host internal links, max depth 4.
  c) the filesystem: every page.tsx and page.mdx under src/app, mapped to its route.
Sources (c) minus (a)+(b) is itself a finding — a page that exists but nothing links to and no sitemap
lists is either orphaned or should be noindex on purpose.

Write the final list to docs/audit/<today>/urls.json with the brand each URL belongs to.

## Step 3 — crawl with Playwright

For EVERY url, at THREE viewports — 1440x900 desktop, 768x1024 tablet, 390x844 mobile — capture:

Hard signals (these are facts, report them with evidence):
  - HTTP status; any non-200 that is not an intentional 301/404 route
  - every console message of type error or warning, with the text
  - every failed network request (4xx/5xx/aborted), with the URL
  - any uncaught page exception
  - horizontal overflow: document.scrollWidth > document.clientWidth (a mobile killer, check 390 especially)
  - accessibility: run axe-core (npm i -D @axe-core/playwright) and record every violation with its
    impact, rule id and the offending selector
  - heading structure: count of h1, any skipped level
  - every <img> with a missing/empty/filename-shaped alt
  - every form control with no associated <label>
  - interactive elements smaller than 44x44 CSS px at the 390 viewport
  - metadata: <title> length, meta description length/presence, canonical, og:title/og:description/og:image,
    <html lang> vs the brand's registry locale, and whether any JSON-LD block fails JSON.parse
  - performance: LCP, CLS and total transferred bytes via the Performance API, plus the count of render-
    blocking requests
  - full-page screenshot at each viewport into docs/audit/<today>/shots/<brand>/<route>-<viewport>.png

Cross-brand signals (these matter more here than on a normal site — seven sibling domains can cannibalise
each other in search):
  - identical or near-identical H1s, meta titles, meta descriptions or body paragraphs appearing on more than
    one brand. Report each cluster with the URLs involved.
  - any internal link that crosses to a sibling brand without rel="noopener" or that points at a host not in
    src/sites/registry.ts (the registry is the only source of truth for domains — CLAUDE.md is explicit that
    several plausible-looking domains are NOT owned)
  - on the es / pt-BR / sv brands: any user-visible English string. Report the exact text and its selector.

Repo-rule signals (from CLAUDE.md — check the source, not just the DOM):
  - any legal or financial figure rendered as a bare number in JSX/MDX instead of <Fact k="..."/> backed by
    content/shared/facts.ts. Grep for currency symbols, "USD", "años", "years", percentages and digit-heavy
    strings inside src/app and content, and cross-check against the facts registry.
  - any page gating on the users.tier column instead of effectiveTier() from src/lib/entitlements.ts
  - any i18n key that resolves to a raw key string in the rendered DOM (a missed translation shows as the key)

## Step 4 — review your own screenshots for design and CRO

Read the screenshots you captured. For each brand's homepage and its two most important inner pages, judge:
  - Above the fold at 390px: is the value proposition, the audience and the primary action all visible
    without scrolling? Name what is missing.
  - Is there exactly ONE primary action per screen, or do competing CTAs split attention?
  - Is the primary CTA reachable at every scroll depth (sticky bar, repeated CTA) or does it disappear?
  - Trust: does anything on the page establish who files these cases, before the ask?
  - Forms: field count, whether every field is genuinely required, whether there is "what happens next"
    micro-copy under the submit button.
  - Objection handling: are the real objections (cost, timeline, presence rules, "is this a scam") answered
    on the page or buried?
  - Visual: type scale, rhythm, whether the seven brands are distinguishable or look like one template with
    different colours. Say plainly when a page looks unfinished or cheap, and why, in design terms.
Be specific and harsh. "Hero is weak" is useless; "the H1 is 20px at 390 and sits below a 180px empty band,
so the first thing a phone user sees is whitespace" is a finding.

## Step 5 — write the report

Create docs/audit/<today>/report.md and docs/audit/<today>/findings.json.

findings.json is an array of objects:
  { "id": "F-001", "severity": "critical|high|medium|low", "category": "bug|a11y|seo|perf|cro|design|content|
    repo-rule", "brand": "<siteKey or all>", "url": "...", "file": "src/...:line if known",
    "what": "one sentence, the defect", "evidence": "the console text / axe rule / measured value",
    "fix": "the concrete change, naming files and the approach", "effort": "S|M|L",
    "risk": "what could break if we do this" }

report.md must contain, in this order:
  1. A one-paragraph verdict: the three things most worth fixing first, and why those three.
  2. A table of every finding: id, severity, category, brand, one-line what, effort.
  3. The findings in full, grouped by severity, each with its evidence and its suggested fix.
  4. A "batches" section proposing how to group the fixes into 4–6 approvable chunks, each one a single PR's
     worth of work, ordered so that nothing in batch N depends on batch N+1. For each batch state which files
     it touches and whether it crosses any of the boundaries CLAUDE.md protects (schema, auth, API routes,
     middleware, payments, quiz scoring) — those need extra care and must be called out, not slipped in.
  5. An explicit "not fixed, on purpose" list: anything you found that you believe should be left alone,
     with the reason.

Rules for the whole job:
  - Verify before you report. If you cannot reproduce it, mark it "unconfirmed" and say what you tried.
  - No speculation dressed as fact. Every finding carries evidence.
  - Do not invent legal or financial numbers anywhere, including in suggested copy.
  - Do not edit application code, do not open a PR, do not commit anything outside docs/audit/.
  - If the crawl finds more than 150 URLs, audit all of them for the hard signals but limit the design/CRO
    review (step 4) to the homepages plus the top 3 pages per brand, and say so in the report.
```

---

## After the report

Read `report.md`, approve the batches you want, and hand them back to a Claude Code session one batch at a
time. One PR per batch, `npm run verify` green before each push. The batches that touch schema, auth, API
routes, middleware, payments or quiz scoring are Opus work per `plan.md` §6 — do not let a Sonnet phase
take those.

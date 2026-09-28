# Local session: full-site audit + best-in-niche redesign (Opus 5.5, effort high)

Paste everything below the line into a **local** Claude Code session on Opus 5.5 at effort high. Use
Opus, never Fable, and don't spawn Fable subagents
(`.claude/skills/fable-cost-guardrail/SKILL.md`). The session has to be local: this project's
cloud environment can't reach the live domains or Higgsfield's CDN.

---

You are the design and conversion lead for `antonmarklundcom/paraguayresidency`: one Next.js app
serving seven brands on seven domains (the table is in `CLAUDE.md`). Anton's goal: **sell the most
Paraguay residencies of anyone in the niche.** The hub (`paraguayresidency.co.uk`) and the language brands
(`residenciaenparaguay.es`, `vidanoparaguai.com`, `flyttatillparaguay.se`) sell the done-for-you service
through WhatsApp and the lead form. `paraguayinvestorpass.com` sells the investor route. `paraguayfrontier.com`
sells plan-B residency to Americans. `paraguayresidencyguide.com` sells the $7 guide and sends buyers on to
the service.

Anton's verdict on the current live design: **"still pinkish, quite cheap."** He dislikes the guide's
terracotta and peach palette (`src/styles/themes/guide.css`, where `--accent-soft: #fbe7dc` is the pink),
and the whole thing reads as a template, not the most trusted firm in Paraguay. Fix that.

## 0. Setup
```
git clone https://github.com/antonmarklundcom/paraguayresidency.git   # or cd into the existing clone
cd paraguayresidency
git checkout main && git pull
git checkout -b design/overhaul-2026-10
npm ci
npx playwright install chromium
npm run dev -- -p 3100          # each brand renders at http://localhost:3100/?site=<key>
```
Read these first, in order: `CLAUDE.md`, `plan.md` §1 and §9, `KNOWN-ISSUES.md`, `docs/conversion-core.md`,
`docs/design/homepage-directions-prompts.md`, `docs/imagery-manifest.json` and `src/styles/`
(`tokens.css`, `themes/*.css`, `fonts.css`).

Hard rules (from `CLAUDE.md`; they are not negotiable):
- Don't touch `src/db/schema.ts`, auth, API routes, `src/proxy.ts`, payments/checkout, or quiz scoring. If
  a design change seems to need any of them, write it up as an ask for Anton instead.
- No legal or financial number in JSX/MDX. Use `<Fact k>` from `content/shared/facts.ts`.
- Every string goes through i18n, and `npm run verify:i18n` must pass for every locale and brand.
- **Never invent testimonials, reviews, ratings, case counts, press logos or credentials.** Build the
  components so they render only when real data exists (a data file Anton fills in), and list what you
  need from him.
- **Do not call any Higgsfield generate tool.** Anton generates images only when he writes "Generate image".
  You write the shot list.
- Keep Lighthouse mobile performance ≥ 0.90 (see the note at the top of `fonts.css`) and keep axe clean.

## 1. Full-site audit (live + local, all 7 brands)
Write a Playwright script under `scripts/audit/` (it can be committed) that, for every brand:
1. Reads `https://<domain>/sitemap.xml` and visits **every URL** on the live site, plus the same paths
   locally with `?site=<key>`.
2. For each page, records: HTTP status; title and meta length; H1; canonical; hreflang; JSON-LD types;
   broken internal links and images; whether a WhatsApp link or lead form is present; console errors; and
   axe violations. Take 1440 and 390 screenshots of every template type: home, article, contact, pricing,
   route finder, checklist, about and legal.
3. Runs Lighthouse mobile on each homepage and on one article per brand.
4. Diffs live against local, so you can see whether production is behind `main`.

Then check the conversion plumbing by hand, on both local and live:
- Does the floating WhatsApp button show, and does it open the right number with pre-typed text in the
  brand's language?
- Does the lead form succeed?
- Does the guide's buy button do anything? "Checkout opens shortly" means no sale is possible.
- Does the route finder reach a result with a next step?
- Do Plausible events fire?

Output: `docs/audit/2026-10/site-audit.md`. It should hold a table per brand, every broken or missing
item with a severity (P0 blocks money, P1 costs trust or conversion, P2 polish), and the screenshots in
`docs/audit/2026-10/shots/`.

## 2. What's missing to win the niche (competitor benchmark)
Capture the homepages, pricing/services pages and contact pages of the 6–8 strongest competitors for
"paraguay residency", "paraguay permanent residency", "residencia paraguay", "residência paraguai" and
"flytta till paraguay". Start with `docs/seo-competitor-analysis-movetoparaguay.md`. For each competitor
and for us, score: hero promise, proof (real faces, video, reviews, Google rating, case count, years,
lawyer/escribano credentials, office photos), price transparency, guarantee, speed-to-contact, mobile CTA,
content depth, and the lead magnet. Write `docs/audit/2026-10/competitors.md`. It must include a
"what they have that we don't" list and a "where we can clearly beat them" list.

## 3. The design: make it the best in the niche
Principles:
- **Trust first.** People are wiring money to strangers in another country. Real people, a real office,
  real process and a fixed price have to appear above the fold or right after it.
- **One clear action per screen.** WhatsApp is the primary action everywhere except the guide.
- **Premium, calm, specific.** No pink, peach or rose tints on any brand. No generic stock feel.
- **The brands must not look like clones.** Today all seven share one template: a photo hero, a glass card
  and four bento tiles.

Deliver:
1. **A new design system.** Redo `tokens.css` with a real type scale (fluid clamp), spacing, elevation and
   a motion scale. Redo every `themes/*.css`, starting with **guide**, where the pink goes. Suggested
   direction: deep ink or forest with a warm brass or gold accent, and paper-white rather than peach.
   Choose better if the benchmark says so. Check every text/background pair for WCAG AA with a script.
2. **New or rebuilt components**, in `src/components/`:
   - a trust bar (team photos, "N residencies filed", Google rating; each one renders only when its data exists)
   - a testimonials section (quote, name, country flag, route, month; driven by a data file)
   - a fixed-price table per route, with the numbers coming from `<Fact>`
   - a "what happens after you message us" timeline
   - a guarantee/refund block
   - a team section with real photo slots
   - an office/Asunción proof strip
   - a mobile sticky WhatsApp bar
   - image-led article cards (no empty image boxes)
   - a proper sales page for the guide: a book mockup that isn't cheap, a table-of-contents preview,
     sample pages, a "who it's for / not for" block, a FAQ, and a clear upsell to the service
3. **Homepage recomposition per brand**, with a distinct layout for each:
   - the hub: an authority layout
   - investorpass: dark editorial
   - frontier: a plain-talk story layout
   - the language brands: local-voice layouts
   - the guide: a long-form sales letter
   Also redo the contact, pricing, about and article templates.
4. Put real-data placeholders in one file, `content/shared/proof.ts` (team, reviews, stats, office photos),
   with every field empty or `null` until Anton fills it in. Components hide when their data is missing.
   Never show fake values.

Before and after each brand, take screenshots at 1440 and 390 and look at them critically. Iterate until
the page would beat the best competitor side by side. Run `npm run verify` (typecheck, lint, tests, i18n,
build) before every commit, and Lighthouse on the changed homepages.

## 4. Images: shot list only
Write `docs/design/image-shotlist-2026-10.md`. It needs:
- a unique hero and a 4-tile set per brand, so no brand shares a photo
- guide chapter images (the `{/* IMAGE: … */}` slots in `content/guide/members/`)
- a book-cover and mockup render
- an OG image per brand
- the real photos Anton must shoot himself (team portraits, the office, the migraciones queue, a cédula
  in hand), kept separate from what AI may generate

For each slot give: id, brand, page, ratio, resolution (2k for heroes, 1k for tiles), the prompt, negative
notes (Paraguay is landlocked and flat, so no sea and no mountains; Asunción architecture, lapacho and
jacaranda, red earth), `alt_en/es/pt/sv`, and an estimated credit cost with a total. Follow the
`higgsfield-image-pipeline` and `higgsfield-web-imagery` skills. Don't generate anything.

## 5. Ship and report
- Commit in logical steps on `design/overhaul-2026-10`, push, and open **one PR** titled "Design overhaul:
  trust-first, no pink, distinct brands". Put before/after screenshots for all 7 brands in the body.
  **Do not merge.** A merge to `main` auto-deploys to production, so Anton reviews first.
- Finish with a report in chat, with these sections:
  1. **What I found**: the top P0/P1 issues across the site.
  2. **What I changed**: per brand, with the PR link.
  3. **What only Anton can supply**, as a checklist: team photos, real reviews or a Google Business
     Profile link, the case count, fixed prices per route, Stripe live keys for the guide, and the
     WhatsApp number per brand.
  4. **Next 10 moves to sell more residencies**, ranked by impact ÷ effort: design, content, SEO, ads,
     WhatsApp follow-up and partnerships.
  5. **The image shot list total**, with the reminder that images get made after "Generate image".

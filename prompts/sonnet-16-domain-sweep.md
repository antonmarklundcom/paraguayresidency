# Phase S16 — Domain sweep. Paste into a fresh SONNET session. Runs BEFORE S10–S14; S6 may still be open.

Read `plan.md` FIRST — §1.11 (the F9 decision), §12.2 (the map), §11.3 and §11.7 (the copy you transcribe), §6.11 (your task list, exhaustive as of the F9 commit) — plus §9 and `KNOWN-ISSUES.md`. Execute plan §6.11 under the autonomy protocol §4. Build nothing outside it: this phase renames what each `SiteKey` points at and nothing else.

HARD LIMITS (plan §4.7, §6): no `SiteKey` is added, renamed or removed; no change under `src/db`, `src/lib/{leads,entitlements,member-auth,stripe,lemonsqueezy}.ts`, `src/app/api`, `src/middleware.ts`, `src/sites/resolve.ts`, `src/features/quiz/scoring.ts`, and no change to the *shape* of `src/sites/registry.ts` — you edit string values in existing entries. The one `src/lib` file you may touch is `src/lib/email.ts`, and only its `EMAIL_FROM` default string. No new pages, no copy beyond the strings the plan hands you.

The map (plan §12.2). Old → new, brand name in brackets:

| SiteKey | old host | new host |
|---|---|---|
| `residency` | paraguayresidency.com | `paraguayresidency.co.uk` ("Paraguay Residency" — unchanged name) |
| `investorpass` | paraguayinvestorpass.com.py | `paraguayinvestorpass.com` ("Paraguay Investor Pass" — unchanged name) |
| `guide` | paraguayinvestorguide.com | `paraguayresidencyguide.com` (name **"Paraguay Residency Guide"**, was "Paraguay Investor Guide") |
| `residenciapt` | residencianoparaguay.com | `vidanoparaguai.com` (name **"Vida no Paraguai"**, was "Residência no Paraguai") |
| `frontier`, `residenciaes`, `flytta` | — | unchanged |

`<key>.localhost` and `localhost` dev hosts are unchanged. `HUB_SITE` stays `residency`.

Steps (plan §6.11, in this order):
1. `src/sites/registry.ts`: `hosts`, `canonicalHost`, `crm.source` for the four brands above; `name` for `guide` and `residenciapt`; the two doc comments quoting old hosts (`SiteConfig.hosts` example, `siteOrigin` docstring).
2. `.env.example` (`APP_ORIGIN_FALLBACK`, `EMAIL_FROM`) and the `EMAIL_FROM` default in `src/lib/email.ts` → `paraguayresidency.co.uk`.
3. Page copy: `src/app/sites/guide/{page,about/page,blog/page,refunds/page}.tsx`, `src/app/sites/investorpass/{page,about/page,investor-pass/vs-standard-residency/page}.tsx`, `src/app/sites/residency/investor-pass/page.tsx` (a comment), `content/guide/blog/do-you-need-a-lawyer-for-paraguay-residency.mdx`. Where a file already imports `siteOrigin` or the registry, use `siteOrigin('<key>')` / `sites.<key>.name` instead of a new literal; in prose a literal is fine. "Paraguay Investor Guide" → "Paraguay Residency Guide" everywhere.
4. `src/i18n/messages/pt/residenciapt.json`: replace exactly these seven values with the strings in plan §11.7's "Registry and i18n values" bullet — `site.tagline`, `home.metaTitle`, `home.metaDescription`, `home.h1`, `home.sub`, `contact.metaTitle`, `book.metaTitle`. Verbatim; no other key in any locale changes. Check the meta title is ≤60 and the description ≤155 characters after pasting.
5. Tests: `tests/resolve.test.ts` (every host literal, including the per-brand apex table near the end), `tests/admin-guard.test.ts`, `tests/leads-flow.test.ts`, `tests/checkout-routing.test.ts`, `tests/crm-and-signing.test.ts`, `tests/member-session.test.ts`. Add one assertion to `tests/resolve.test.ts`: an unknown production host redirects 301 to `https://paraguayresidency.co.uk/`.
6. Docs: the brand table in `docs/platform.md`; the heading of `docs/guide-outline.md`; the header lines only of `prompts/sonnet-3-residency-site.md`, `-4-investorpass-site.md`, `-5-guide-site.md`; in `KNOWN-ISSUES.md` retitle the "BLOCKER — the brand↔domain map is wrong" entry to "CLEARED in S16 — …" with two lines saying what changed; in `CLAUDE.md` replace the sentence "The registry still names the wrong ones — phase F9 fixes it, and no brand phase may run first" with one saying S16 swept the registry on this date.
7. Leave alone: `plan.md` §9 history, `prompts/fable-*`, `prompts/sonnet-6` (its amendment is deliberate), every `src/app/sites/<key>/` file not named in step 3, every `messages/<locale>/common.json`.

Verification (all of it, before the PR):
- `grep -rn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git -E "paraguayresidency\.com|paraguayinvestorpass\.com\.py|paraguayinvestorguide\.com|residencianoparaguay\.com|Paraguay Investor Guide|Residência no Paraguai" . | grep -v -E "^\./plan\.md|^\./prompts/fable-|^\./prompts/sonnet-6-"` prints nothing. (`plan.md` keeps the old names in its §9 history and struck-through lines on purpose.)
- `npm run verify` green (typecheck, lint, tests, `verify:i18n`, build).
- `npm run build && npm start` then: the seven `*.localhost:3000` hosts render; `curl -sI -H 'Host: guide.localhost' localhost:3000/` carries a canonical on `guide.localhost`; with `NODE_ENV=production` the resolver test proves `nothing.example` → 301 `https://paraguayresidency.co.uk/` (the test in step 5 is the proof; a live curl is a bonus).
- Re-read your own diff adversarially: every hunk is a host, a name, a comment or a test literal. Anything else is out of scope — revert it.

Phase rules:
- Branch `phase/s16` off latest `main`. One PR, title "Sweep the registry, pages, tests and docs to the domains Anton owns (phase S16)". Merge when the `verify` check is green. Re-runnable: continue from the first unmet criterion.
- Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4. Never hardcode a legal or financial figure (§4.11) — you should not be near one.

Exit: the grep is empty; `npm run verify` green; PR merged; §9 entry (5–10 lines: what changed, the grep result, anything you found that F9's file list missed).

## After this phase — hand off
Gates: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 entry committed. Then spawn the parallel content lane per plan §4.12 (amended F9 — it is gated on you, not on S6): five claude-code-remote `create_session` calls, one each for `prompts/sonnet-10-frontier-site.md`, `sonnet-11-residenciaes-site.md`, `sonnet-12-residenciapt-site.md`, `sonnet-13-flytta-site.md`, `sonnet-14-guide-members.md` — inherit environment and permission mode (never `plan`), `model` = Sonnet (never Fable, plan §4.8), `prompt` exactly `Read prompts/<file> in this repo and execute it.` Then end with the phase report to Anton, which must also restate that S6 (PR #13) is waiting on him — hosting, DNS for the three corrected domains, Stripe live, Search Console — per `docs/decisions-needed.md` on `phase/s6`, and that S6's re-run starts with the F9 amendment at the top of its prompt. Never hand off with a red PR.

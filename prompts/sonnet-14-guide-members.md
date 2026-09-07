# Phase S14 — Guide member area + Insider sales page. Paste into a fresh SONNET session, ONLY after phase S6 is merged. Runs in parallel with S10–S13.

Read `plan.md` FIRST, in full — plus §9 build log, `KNOWN-ISSUES.md` and `docs/platform.md`. Execute plan §6.9 under the autonomy protocol §4 and the parallel-lane rules in §4.12. Build nothing outside the plan.

HARD LIMITS (plan §4.7, §6): pages only. No changes under `src/db`, `src/lib/{leads,email,entitlements,member-auth,stripe,lemonsqueezy}.ts`, `src/app/api`, `src/middleware.ts`, or the registry shape. Tier checks only through O9's `requireTier` and member queries; checkout only through `POST /api/checkout` with the `guide-insider` slug; completion only through O9's server action. You own `src/app/sites/guide/{login,members,insider,account}/`, `content/guide/members/`, `content/guide/updates/`, the Insider section of the S5 sales page and the `/thank-you` extension.

Load skills: `nextjs-national-lead-gen` (§4 restraint baseline), `wp-to-native-admin` (portal UX patterns only — no auth code).

Quality bar:
- Voice from §11.3, warm light theme from S5. `/insider` is a long-form sales page: what changes monthly, updates-feed preview, resources, price read from `products` (never typed), LS checkout button, FAQ, refund policy. "Coming soon" state when the product is inactive.
- `/members` shows modules in order with three states — locked (under tier → upgrade card), unlocks-on-date (drip), open — exactly as `entitlements.ts` reports them; never re-implement the rules in the page.
- `/members/[module]/[lesson]`: MDX body, prev/next, mark complete; under-tier and not-yet-dripped never leak the body (check the server response, not just the UI).
- `/account`: tier, expiry, "manage subscription" via the LS portal URL from O9's lib, logout. `/thank-you`: entry buyers see "your login link is in your inbox" + Insider upsell.
- If the import left no lessons, write the module/lesson MDX from `docs/guide-outline.md` (§11.3 chapters) so the area is not empty.

Phase rules:
- Branch `phase/s14` off latest main (S6 merged). Re-runnable. Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4. Never hardcode a legal or financial figure (§4.11).

Exit: `npm run verify` green; with O9's fixture users — `none` reaches `/insider` and `/login` only, `entry` sees entry modules and upgrade cards on insider ones, `insider` sees everything with drip dates honoured; Lighthouse mobile ≥90 on `/insider`; Product + Offer JSON-LD on `/insider`; PR merged.

## After this phase — hand off
Gates: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 entry committed. Then apply the S15 claim rule (§4.12): if S10–S14 are all merged and no `phase/s15` branch exists on origin, push an empty `phase/s15` branch, then call claude-code-remote `create_session` (inherit environment and permission mode, never `plan`; `model` = Sonnet — never Fable, plan §4.8; `prompt` exactly `Read prompts/sonnet-15-deploy-new-domains.md in this repo and execute it.`). Otherwise end with the phase report. Never hand off with a red PR.

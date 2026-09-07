# Phase O9 — Consolidation foundation. Paste into a fresh OPUS session, ONLY after phase O2 is merged. Runs BEFORE S3.

Read `plan.md` FIRST, in full — plus §9 build log and `KNOWN-ISSUES.md`. Execute plan §5.4 under the autonomy protocol §4, against the contract in §2 (the tables) and §1.11–§1.15 (the locked decisions). Build nothing outside the plan: no brand pages, no member pages — one themed placeholder home per new brand is the only UI you ship.

Attach `antonmarklundcom/pararesi` and `antonmarklundcom/flyttatillparaguay` read-only via `add_repo`. You read four files there and nothing else: `pararesi/src/db/schema.ts`, `pararesi/docs/02-architecture.md`, `flyttatillparaguay/lib/vendercrm.ts`, `flyttatillparaguay/app/api/lead/route.ts`. Never push to either repo.

Load skills: `nodejs-mysql-hostinger-stack`, `vendercrm-lead-capture`, `wp-to-native-admin` (auth and role-gating patterns only), `nextjs-deploy-hostinger` (§ env and DB init only, for the migration run).

Traps:
- This is the LAST schema-shaping phase. Every column in the §2 table exists when you merge, even the ones only S14 uses. Nothing is retrofitted later.
- `orders` → `purchases` is a rename that keeps rows. If drizzle-kit emits drop+create, hand-edit the generated SQL to `RENAME TABLE` / `CHANGE COLUMN`. Prove it: migrate a database seeded at O2 state and count rows before and after.
- O2's Stripe flow and its 146 tests must still pass after the rename — the Stripe purchase writes `purchases` now, that is the only behavioural change on that side.
- `siteEnum` in `src/db/schema.ts` and `SITE_KEYS` in the registry must be identical; add the test that asserts it.
- `src/middleware.ts` (under `src/`, never the repo root); `/login` and `/members` exist only on brands whose registry entry lists `products`, everywhere else they 404 — test it.
- Both webhooks insert `webhook_events` BEFORE doing anything; a duplicate delivery returns 200 and does nothing. The Lemon Squeezy signature check is a pure function tested with a locally built fixture, like O2's Stripe one; no SDK.
- Entitlements are pure functions over rows; `users.tier` is a cache written after every webhook and by `scripts/reconcile-tiers.ts`, never the source of truth. Insider decays to `entry`, not `none` (§1.12).
- Member login is a magic link on a separate iron-session cookie (name and secret) from the admin session. A member session must never satisfy `requireRole('admin')`; test it.
- Locale: no silent `en` fallback in production. `verify:i18n` must fail on a missing `es`/`pt`/`sv` key. You write the three `common.json` translations yourself, completely (Brazilian Portuguese for `pt`).
- Facts: `display`/`hedged` become per-locale with `en` required; add `mercosur.residency_route` and `tax.foreign_income_treatment`, both `verified: false`, hedged in all four locales. No bare number anywhere (§4.11).
- The pararesi import writes lesson, update and blog bodies to MDX files (§1.14); it is idempotent on provider ids and slugs and has `--dry-run`. Test it against a tiny fixture of pararesi's shape, not against production.
- A real database is available: `apt-get install mariadb-server` works in the build container (O2 proved it). Run the migration and seed checks against it; do not defer them.
- Missing keys never block (§4.5): no Lemon Squeezy env ⇒ the Insider product seeds inactive and the checkout returns a "coming soon" response.

Phase rules:
- Branch `phase/o9` off latest main. O2 unmerged ⇒ stop, it must be merged first.
- Re-runnable: check what already exists on the branch, continue from the first unmet exit criterion.
- Minor issues → `KNOWN-ISSUES.md`; stop only per §4.4 (a schema-shape or money-math doubt qualifies — ask, do not guess).
- Update `CLAUDE.md`'s first line (seven brands, the four new keys), `.env.example` (every new var in §7), `docs/platform.md` (new), `docs/conversion-core.md` (purchases, both providers).

Exit (all of §5.4): `npm run verify` green with the new tests (resolver for the eight new hosts, `siteEnum` = `SITE_KEYS`, i18n completeness ×4 locales, entitlements table incl. decay/grace/drip, LS signature fixture, checkout routing by provider, leads attribution + phone-hash idempotency, member-vs-admin session isolation, import dry-run fixture); seven `*.localhost:3000` hosts render distinct themed placeholders with the right `lang` and canonical host; migration applied to a real MySQL from O2 state without losing rows and seed idempotent with two products; Stripe test purchase still works end to end and lands in `purchases`; LS webhook fixture → `subscriptions` row → user `insider` → `/admin/members` shows them; `/login`, `/members` 404 on the six lead-gen brands; PR merged.

## After this phase — hand off to the next (fresh session)
Only when all four gates pass: (1) PR merged green, (2) exit checklist passed, (3) pre-handoff audit done (re-run `npm run verify`, adversarially re-read your merged diff, fix findings), (4) §9 build-log entry committed — say explicitly in it which §2 columns exist now so S3–S15 never ask. Then call claude-code-remote `create_session`: inherit environment and permission mode (never `plan`), `model` = Sonnet (Opus or Sonnet only — never Fable, see plan §4.8), `prompt` exactly `Read prompts/sonnet-3-residency-site.md in this repo and execute it.` Then end with the phase report. Fallback without `create_session`: model switch ⇒ stop and report. Never hand off with a red PR or an unmet exit criterion.

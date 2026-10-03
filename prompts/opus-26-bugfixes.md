# O26 — bug fixes (Opus 5.5, effort medium, Sonnet 5.5 subagents for mechanical work)

Repo: `antonmarklundcom/paraguayresidency` only. Read `CLAUDE.md`, `KNOWN-ISSUES.md` (open items) and this file. Do not touch any other repository.

## Starting state (2026-10-03)

- Branch `claude/brave-pasteur-4qpfd6` (commit `0879188`) holds the free Spanish guide (`/guia-gratis`), the Spanish lead auto-reply, the propia handoff report and this prompt. **No PR exists for it yet.**
- `main` is at `b08f2fc`. Hostinger is **not** connected for auto-deploy: merging does not deploy; Anton presses Redeploy in hPanel.

## Step 0 — PR for the guide branch

Open a PR from `claude/brave-pasteur-4qpfd6` into `main` titled "residenciaes: free Spanish guide lead magnet + propia handoff". Body: what it adds (see its commit message), how it was verified (`npm run typecheck`, `lint`, `vitest`, `verify:i18n`, `build` all green), and that `/guia-gratis/leer` is soft-gated + noindex. Do not merge it yourself.

## Step 1 — bug-fix branch

Create `claude/o26-bugfixes` **from `claude/brave-pasteur-4qpfd6`** (bug 2 builds on its email changes) and open a second PR into `main` that says it is stacked on the first. Fix, each with a test:

1. **English messages on the es/pt/sv forms.** Zod messages in `src/lib/lead-schema.ts` (lines ~34-82), `RATE_LIMIT_MESSAGE` and `SUBSCRIBE_PENDING_MESSAGE` in `src/lib/rate-limit.ts` (~198, ~252), and the literals in `src/app/actions/lead.ts` (~136 "You are already on the list.", ~181 "Check your email address and try again."). Return message **keys** (or localise in the action using the form's `site`) and render via `t(site, …)`. New keys go in all four `src/i18n/messages/*/common.json` (verify:i18n enforces parity). Check every other public form/action for the same problem (newsletter, magic link, checkout email prompt, route finder).
2. **pt and sv auto-replies and email footers are English.** `src/lib/email-templates.ts`: `leadAutoReply` now has a Spanish branch (`leadAutoReplyEs`); add pt-BR and sv the same way and localise the footer "Unsubscribe" for pt/sv. Also check the subscriber confirmation email (`src/lib/subscribers.ts`) and any other email a pt/sv/es visitor can receive.
3. **`editor` role redirect loop.** `requireAdminPage()` (`src/app/(en)/admin/guard.ts:12`) sends a signed-in staff user without the role to `/admin/login`, and the login page (`src/app/(en)/admin/login/page.tsx:10`) sends any signed-in staff user back to `/admin/leads`. A signed-in user who lacks the role must get a 403 page, never the login page. (Editor *permissions* are designed in O27; here only break the loop.)
4. **Admin lockout by email spraying** (`KNOWN-ISSUES.md`, "An admin can be locked out…"). Login is limited per IP *and* per email, so anyone can keep Anton locked out. Change the scheme so a third party cannot lock out the real admin (e.g. count failures per (email, IP) pair plus a per-IP cap, and a slower global per-email backstop that never fully blocks), keep brute-force protection, update the KNOWN-ISSUES entry, and test both properties.
5. **Stale comments** that say `src/middleware.ts` (`src/app/(en)/admin/layout.tsx:21`, `src/lib/auth.ts:15`): the file is `src/proxy.ts`.
6. **Verify, don't assume:** the document-checklist crash from `docs/audit/2026-10/site-audit.md` issue 6 (`/documentos/lista`, `/documents/checklist`) should be fixed by #97. Prove it with a test or a local browser render; fix if not.
7. **VenderCRM skips leads without a phone** (`src/lib/vendercrm.ts:95`). Check (vendercrm-lead-capture skill, `docs/`) whether `/api/v1/leads` accepts email-only leads. If yes, send them; if no, make the skip visible as "skipped: no phone" in `/admin/leads` rather than a silent pending. Do not change form fields.

Out of scope: `FREE_ACCESS_MODE` (stays until Stripe live keys), schema changes (schema is FINAL), DNS/hPanel.

## How to work

- Opus does bugs 3, 4 and 7 itself (auth, rate limiting, CRM). Use **Sonnet 5.5 subagents** (never Fable) for the translations in bugs 1 and 2: give each one exact keys and target files, then review their output yourself. Spanish uses tú; pt-BR uses você; sv uses du.
- Before pushing: `npm run typecheck && npm run lint && npx vitest run && npm run verify:i18n && npm run build`. All green, or say exactly what failed.
- Commit per bug or small group; end commit messages with the attribution lines your session gives you.

## Report back to Anton

A short table: bug → fixed / verified / not changed (and why) → test name. Both PR links, merge order (guide PR first, then bug-fix PR), and a reminder that nothing is live until he merges and presses Redeploy in hPanel.

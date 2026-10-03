# O27 — admin CRM and staff accounts (Opus 5.5, effort high, Sonnet 5.5 subagents for UI/tests)

Repo: `antonmarklundcom/paraguayresidency` only. Read `CLAUDE.md`, `plan.md` §1, `docs/platform.md`, `KNOWN-ISSUES.md`. **Start after the O26 bug-fix PR is merged** (branch from fresh `main`); if it is not merged yet, branch from `claude/o26-bugfixes` and say so in the PR.

## Constraints that shape the design

- **The schema is FINAL** (`CLAUDE.md`). No new tables or columns. CRM state is stored as append-only rows in `lead_events` (`type varchar(60)`, `payload json`), e.g. `crm.status` `{status, by}`, `crm.note` `{text, by}`, `crm.assign` `{userId, by}`. Current state = latest event of each type. Users come from `users` (`role` is `admin | editor | member`).
- VenderCRM stays the external CRM. The admin CRM is for working leads day to day; keep the existing VenderCRM push and retry exactly as they are.
- `/admin` exists only on the hub host (`src/sites/resolve.ts` step 6). The hub domain does not resolve yet.

## Idea 1 — a real CRM inside `/admin`

1. **Lead detail page** `/admin/leads/[id]`: every field, quiz answers, attribution, page, brand, delivery status per channel, and the full `lead_events` timeline.
2. **Stages:** new → contacted → quoted → won / lost (lost needs a reason). Change from the detail page and inline from the list.
3. **Notes** with author and time; **owner** (assign to a staff user); "my leads" filter.
4. **List upgrades:** filter by stage, owner, brand, kind, date; sort by last activity; search by name/email/phone; counts per stage at the top. CSV export includes stage and owner.
5. Quick actions on the detail page: open WhatsApp (`wa.me` with the lead's number), mailto, copy phone.

## Idea 2 — staff accounts and access

1. **Roles:** `admin` = everything. `editor` = leads (view, stage, notes, assign to self), no members, purchases, facts, exports or staff screens. Enforce in every page **and** every server action/route (`requireRole`), not only in the nav.
2. **Staff screen** `/admin/staff` (admin only): invite by email (magic-link or set-password link; reuse the existing signing helpers), change role, deactivate. Never let the last admin demote or deactivate themselves.
3. **Admin while the hub is offline:** add an env flag (e.g. `ADMIN_EXTRA_HOSTS=paraguayresidencyguide.com`) that also serves `/admin` on the listed brand hosts; default empty = today's behaviour. Update `resolve.ts`, its tests, and the runbook. Keep `/admin` out of every sitemap and disallowed in robots.
4. Seed script still creates the first admin; document the flow in `docs/runbook.md`.

## How to work

- Opus designs the event model, authorisation and the host flag, and writes those itself. **Sonnet 5.5 subagents** (never Fable) can build list/detail UI and tests from your written spec; review everything they return.
- Tests: role matrix (admin/editor/member/anonymous × every admin page and action), stage/note/assign events, last-admin protection, host flag on/off.
- Before pushing: `npm run typecheck && npm run lint && npx vitest run && npm run verify:i18n && npm run build`.
- One PR (or two: CRM, staff) into `main`. Do not merge.

## Report back to Anton

What each role can do, screenshots or a short walkthrough of the lead page, the env var to set in hPanel for admin on the guide domain, PR link(s), and the reminder: merge, then Redeploy in hPanel.

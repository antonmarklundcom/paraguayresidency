# Phase O19 — Rendering & LeadForm performance. OPUS session. Spawned by O18. Last Opus phase; moves the brand folders.

Read ONLY: this file, `plan.md` §1, §4 (§4.12 especially), §14 (intro, path note, §14.3), the phase table and §9
index, the O17/O18 log entries, `docs/platform.md` §1, `docs/improvement-report.md` §1 items 11–12, and
`KNOWN-ISSUES.md` entries "O9 — pages render per request" and "S4 — Lighthouse mobile perf". Execute plan §14.3
under §4.

Owns:
- Everything under `src/app/` (this is the move phase — no other phase runs concurrently)
- `src/lib/{site-shell,metadata,seo-files,site-pages,analytics,countries}.ts(x)`
- `src/components/{LeadForm,LeadFormFields,NewsletterForm,NewsletterFormFields,MagicLinkForm,MagicLinkFormFields,CheckoutButton,CheckoutButtonClient}.tsx`
- `tests/**` (incl. new `tests/lighthouse.mjs`), `docs/platform.md`, `CLAUDE.md` (the host→site line only),
  `plan.md` §4.12 (paths only) and §9, `KNOWN-ISSUES.md`

HARD LIMITS: no schema; no change to `src/lib/leads.ts`, entitlements, webhooks, middleware logic (a matcher
tweak is allowed if a group needs it — with a test). No copy changes: you move pages, you do not rewrite them.
URLs must not change: `tests/resolve.test.ts` and every sitemap test pass unchanged on the URL side.

Budget: one session, ≤ 90 min. Open the PR the turn the exit criteria pass.

Phase rules:
- Branch `phase/o19` off latest `main`. Commit the folder move by itself first (`git mv`, no content edits) so
  the diff reviews as a rename, then the layouts, then the forms.
- Check `origin/phase/s6` for `src/lib/analytics.tsx` and port it if S6 is still unmerged; S6's copy wins on
  merge (keep the file identical apart from `track()`).
- Multiple root layouts: each `(locale)` group has `layout.tsx` (its own `<html lang>`, `globals.css`), its own
  `not-found.tsx`; the top level of `src/app/` holds only groups plus `favicon.ico`/`globals.css`. Verify with
  `next build` that no route lost its layout (every page still renders nav + footer on all seven hosts).
- Static target: `next build` output `○` for ≥ 80 % of the page routes under the groups. If a page is still `ƒ`,
  find the `headers()`/`cookies()` read that causes it and remove it or scope it to the pages that need it.
- Forms work with JavaScript disabled (curl a POST at the server action route via the rendered form is enough
  to prove the no-JS path; document how in the §9 entry). The client bundle for a service page must not contain
  the country list — prove it by grepping `.next/static` for one obscure country name.
- Lighthouse: `tests/lighthouse.mjs`, mobile preset, Chromium at `/opt/pw-browsers`; run once after the last
  code change; table into the §9 entry, no reports committed.
- ONE screenshot pass of ≤ 5 pages after the move, as a PR CI artifact or a local check — not committed.
- Re-runnable; minor issues → `KNOWN-ISSUES.md`; stop only per §4.4.

Exit: plan §14.3 exit line — verify green, ≥ 80 % static, Lighthouse ≥ 0.90 on the ten pages, seven hosts render
with the right `lang`, `docs/platform.md`/CLAUDE.md/§4.12 name the new paths, PR merged green, §9 entry.

## After this phase
Gates as in `prompts/opus-17-money-and-auth-correctness.md`. Then spawn S20: `create_session`, inherit environment
and permission mode (never `plan`), `model` = Sonnet, `prompt` exactly
`Read prompts/sonnet-20-quality-gates-and-repo-hygiene.md in this repo and execute it.` Then end with the phase
report, which must state that S15 (when Anton's §7 items are done) deploys the moved tree and that S6's branch will
need `git merge main` before it can merge.

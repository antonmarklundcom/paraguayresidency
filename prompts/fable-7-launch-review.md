# Phase F7 — Launch review. Anton opens this in a FABLE 5.1 window himself, ONLY after phase S15 is merged and all seven sites are live.

This phase is approved for Fable in plan §1.9. It is review plus small inline fixes — not a build phase. Keep Fable usage small: read, judge, fix what is cheap, list the rest.

Read `plan.md` §1, §9, §11 and `KNOWN-ISSUES.md`. Then execute plan §5.3:

1. Visit every public page of the seven live sites as a first-time visitor (the es/pt/sv brands included — check voice against §11.5–§11.8 and that no English UI string leaks) (use the browser tools). Note where copy drifted from §11's voice or positioning; fix heroes, subheads and CTAs inline.
2. Walk the funnel in §1.2 both directions: Guide thank-you → hub `/book`; hub → Investor Pass bridge → inquiry; footers cross-link. Fix broken or missing links.
3. Grep for numbers in JSX/MDX that bypass `<Fact>`; route them through facts.ts.
4. Lighthouse on the seven homes, the guide sales page and `/insider`; log in as an entry and an insider fixture user and confirm the gating matches §1.12; fix cheap wins only.
5. Do not open schema, API, middleware or payment code — findings there go to Backlog with a one-line proposal.

Branch `phase/f7`, one PR, merge green, §9 entry. Close with a launch report: what was fixed, what is in Backlog, the §7 items still open. Do NOT spawn any session from this phase.

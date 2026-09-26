# Answer-engine and content run — 2026-09-26 (interactive, Opus director + Sonnet/Opus subagents)

Anton's brief: sell more residencies from the sites, beat movetoparaguay.com in AI answers, depth in
English (guide `.com`, UK angle on the `.co.uk` hub) and Spanish (`.es`), write the real paid guide.

## Shipped
- **#74** `llms.txt` / `llms-full.txt` per host; robots.txt names the AI crawlers; Organization +
  WebSite + team `Person` JSON-LD graph; article template with short answer, takeaways, bylines,
  "Sources" list and Article author/reviewer/citation JSON-LD; GFM tables; `sourced` facts;
  `{{fact:key}}` tokens in frontmatter; 49 researched facts (36 published with source).
- **#75** Investor Pass at-a-glance table on its homepage; `npm run guide:pdf`.
- **#76** 19 UK-angle hub articles; the real 12-chapter guide (~19,500 words, 67 pages);
  10 new answer-first guide articles; CSS-drawn guide cover on the sales block.
- Later PRs in this run: guide blog rewrites, Spanish `.es` rewrites and new articles, facts report.

## Decisions (recorded in plan §1.10 and §11.1)
- Sourced figures render with citation before sign-off; `verified` still means signed off.
- Hub articles carry a UK angle; the guide `.com` carries global English depth.

## Research highlights (`docs/facts-verification.md`)
- Investor Pass = MIC Res. 0283/2026, four separate routes (USD 70k productive + 5 jobs, 150k
  tourism, 200k real estate not own home, 200k financial held 2 years). The site had one wrong minimum.
- DNM Res. 376/2026 (absence >1 year cancels temporary, >3 years permanent) and Res. 407/2026
  (from 6 July 2026 documented income/assets under one of 12 categories).
- Government fees are set in jornales and rose on 1 July 2026. The USD 5,000 deposit ended with Ley 6984/2022.
- All research came from search excerpts: the proxy blocked the .gov.py sites. Confidence is rated with that in mind.

## Facts the guide writer wanted but that do not exist yet
`costs.apostille_per_doc`, `costs.translation_per_page`, `documents.police_certificate_min_age`,
`tax.irp_threshold`, `tax.iva_rate`, `solvency.effective_date`. The chapters are written around them.

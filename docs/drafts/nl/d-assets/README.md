# Dutch brand assets (writer D)

- `facts-nl.json`: `{title.nl, display.nl, hedged.nl}` for 61 facts, keyed by fact key. Merge into `content/shared/facts.ts`
  by adding `nl` to each `title`/`display`/`hedged` map (and `'nl'` to `FactLocale`, an Opus foundation step).
  Numbers were machine-checked against the `en` display: same digits, Dutch thousands separators (G 117.077).
  Plain-string `display`/`hedged` (the `pricing.*` facts) become `{ en, nl }` maps when merged.
- `image-prompts-nl.md`: text-only Higgsfield prompts (1 hero, 4 tiles, 3 hub images). Nothing was generated.

Prefixes present in facts.ts within the requested scope: pricing, fees, temporary, permanent, documents, tax,
costofliving, cedula, suace, investorpass. There is no `process.*` prefix.

## NOT-DONE

- `fees.residency_brl`: a BRL-denominated fee for Brazilian readers. Whether a Dutch reader wants a euro figure
  instead is a judgment call, and a euro rate would be a new number.
- `tax.spain_treaty`: Spain-only treaty. Not relevant to the Dutch brand; a Netherlands-Paraguay treaty statement
  would be new legal content needing sources (`tax.double_tax_treaties` is translated and covers the point).
- Not in scope, no Dutch text written: the other prefixes (`citizenship`, `entry`, `uk`, `mercosur`, `residency`,
  `solvency`, `fx`, `property`, `driving`, `costs`, `business`, `wages`, `company`, `ips`, `socialsecurity`,
  `apostille`, `land`, `vehicles`, `customs`, `tourist`, `visa`). Later articles (BRP, AOW, health insurance) also
  need NEW Dutch-specific facts with sources; none exist yet and none were invented.
- Wording choices for review: "IVA" kept as the Paraguayan tax name and glossed "btw"; "honorarium" for service
  fee; "bewijs van goed gedrag" for police/criminal-record certificate; "cédula", "prórroga", "RUC", "DNM",
  "DNIT", "SUACE", "CIE" kept in Spanish as proper names.

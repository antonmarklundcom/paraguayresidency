# Dutch brand plan: `emigreren` (Emigreren naar Paraguay)

Status 2026-09-29. Read `CLAUDE.md` first. Foundation (new SiteKey, `nl` locale, registry, theme, route group) is an
Opus phase; everything below is the Sonnet content and page work that follows it.

## Domains

| Domain | Role |
|---|---|
| `emigrerennaarparaguay.nl` | canonical (Anton's decision pending; recommended: exact-match "emigreren naar paraguay", highest commercial CPC) |
| `woneninparaguay.nl` | alias to the canonical (`wonen in paraguay`) |
| `wakkerinparaguay.nl` | **do not point at the sales site.** "Wakker in Paraguay" is a VPRO/NPO documentary series (2026); a trademark or passing-off risk if used to sell. Ask a Dutch IP lawyer; check the Benelux register at boip.int. |

## Keyword evidence (Google Keyword Planner, Anton, 2026-09-29; monthly searches)

| Keyword | Worldwide | Netherlands | Read |
|---|---|---|---|
| wakker in paraguay | 12,100 | 12,100 | TV-driven spike, CPC ~0.10 SEK: viewers, not buyers |
| emigreren naar paraguay | 480 | 390 | core commercial term (CPC 5.7-21 SEK) |
| paraguay wonen | 8,100 | 210 | worldwide figure is mostly non-NL; NL demand is 210 |
| wonen in paraguay | 320 | 260 | lifestyle/cost intent |
| emigreren paraguay | - | 110 | variant |

Plan the page set around the four commercial terms. Capture the show's traffic with ONE factual article on the main
domain ("Wakker in Paraguay: wat de serie liet zien en wat emigreren echt vraagt") that describes the programme
without using its title as a brand, and route readers to the route finder and the fixed-fee price table.

## Voice and positioning

Native Dutch, plain and specific, no hype. The Dutch reader is asking: is it legal and safe, what does it cost, what
about tax and my pension (AOW), healthcare, leaving the BRP register, family, and how long does it take. Say what
takes time. No "belastingvrij". Every legal or financial number goes through `<Fact k>` (add `nl` display and hedged
text for the facts used); services and prices stay hedged until Anton verifies `pricing.*`.

## Pages (mirror the flytta structure, Dutch slugs)

Home (letter + PriceTable + steps + AfterYouMessage + team), `/prijzen`, `/over-ons`, `/contact` (WhatsApp first),
`/proces`, `/verblijfsvergunning`, `/belasting`, `/gezin`, `/kosten`, `/gidsen` (hub), `/steden` (hub),
route finder + result, privacy, terms, unsubscribe, confirm, feed, sitemap, OG image.

## First article wave (about 30, answer-first, each with FAQ; group under `gidsen`, `steden`)

Emigration basics: emigreren naar paraguay stap voor stap; wonen in paraguay: kosten per maand; is paraguay veilig;
paraguay of spanje/portugal/thailand; leven in paraguay als nederlander; het klimaat; taal (spaans en guarani);
alleenstaand en met kinderen; huisdieren meenemen.
Papers and route: tijdelijke verblijfsvergunning; permanente verblijfsvergunning; cedula aanvragen; apostille
Nederlandse documenten; VOG voor paraguay; Nederlandse geboorteakte legaliseren; wat kost het (tarieven staat vs onze
fee); hoe lang duurt het; Mercosur-route (niet voor NL) en Investor Pass uitgelegd.
Money and tax: uitschrijven uit de BRP; belasting bij emigratie (aanslag, uitstel, 30-dagen regel: verify with sources
before writing); AOW en pensioen in het buitenland; bankrekening in paraguay; DigiD en post; zorgverzekering en zorg;
bedrijf runnen vanuit paraguay; grond en huis kopen als buitenlander; valuta.
Factual media page: Wakker in Paraguay (see above).

Every article needs sources in the facts file and a `Fact` sign-off state; the tax and BRP articles need an
accountant review flag before publishing.

## Sales polish (this brand and `residenciapt`)

Both are conversion brands: WhatsApp button (needs `NEXT_PUBLIC_WHATSAPP_NUMBER`), PriceTable with fixed-fee wording,
"what happens after you message us", team, guarantee, mobile WhatsApp bar; proof components stay empty until Anton
supplies real data. Never invent reviews, counts, credentials or a guarantee.

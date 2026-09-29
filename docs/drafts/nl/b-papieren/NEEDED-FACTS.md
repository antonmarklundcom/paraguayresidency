# NEEDED-FACTS (writer B, b-papieren, 2026-09-30)

## A. Blocking for all 10 articles

Every existing key used has only `en`/`es`/`pt`/`sv` copy. Before publishing, add an `nl` display and `hedged` string (and extend `FactLocale`) for each key below, worded so the Dutch lead-in sentence still reads correctly. Keys used: `temporary.duration`, `temporary.presence_rule`, `temporary.precarious_status`, `permanent.presence_rule`, `permanent.change_window`, `documents.police_certificate_validity`, `solvency.requirement`, `solvency.deposit_abolished`, `residency.criminal_record_refusal`, `residency.timeline`, `cedula.timeline`, `apostille.since`, `costs.diy_total`, `fees.basis`, `fees.temporary_residency`, `fees.temporary_extension`, `fees.permanent_residency`, `fees.permanent_card_renewal`, `fees.radicacion_certificate`, `fees.overstay_fine`, `fees.police_certificate_py`, `fees.interpol_certificate`, `fees.cedula_first`, `pricing.temporary`, `pricing.permanent`, `pricing.cedula`, `pricing.family`, `pricing.investor_pass`, and all `investorpass.*` keys (`legal_instrument`, `cie_scope`, `resolution_history`, `launch_date`, `validity_years`, `min_investment_usd`, `route_business_usd`, `route_tourism_usd`, `route_real_estate_usd`, `route_financial_usd`, `productive_conditions`, `tourism_conditions`, `real_estate_evidence`, `financial_conditions`, `investment_status`, `cie_documents`, `foreign_documents`, `timeline`, `cie_issuing_term`).
Note: `investorpass.foreign_documents` is used in articles 4, 5, 6, 9 as the general "apostille then Spanish translation then legalise the translation" rule; it is Investor Pass wording. Consider a general fact (B2 below).

## B. New fact proposals (figures deliberately NOT stated in prose)

1. `nl.apostille_fee` : "The Dutch court fee for an apostille or legalisation is EUR 27 per document (2026)." Search result shows EUR 27 for 2026 (26 in 2025); confirm current figure. Sources: https://www.rechtspraak.nl/zelf-regelen/apostille-legalisatie ; https://www.rijksoverheid.nl/wetten-en-regelingen/productbeschrijvingen/legaliseren-van-een-nederlands-document-met-een-apostille
2. `documents.foreign_chain_general` : "Foreign public documents are apostilled or legalised, translated into Spanish by a registered translator, and the translation is itself apostilled or legalised" for the ordinary temporary/permanent route (not only Investor Pass). Source: DNM checklist https://migraciones.gov.py/residencia-temporal/
3. `nl.apostille_paraguay_treaty` : confirm the Netherlands did not object to Paraguay's accession (the existing `apostille.since` note mentions only Germany). Source: HCCH status table https://www.hcch.net/en/instruments/conventions/status-table/?cid=41
4. `nl.vog_route` : VOG via gemeente while registered in the BRP; directly to Justis (form + ID copy, by post/e-mail) once deregistered; paper original required because a digitally issued VOG cannot be legalised. Sources: https://www.nederlandwereldwijd.nl/verklaring/vog ; https://www.justis.nl/producten/verklaring-omtrent-het-gedrag
5. `nl.vog_fee` : Justis/gemeente VOG fee (natural persons). Source: https://www.justis.nl/producten/verklaring-omtrent-het-gedrag
6. `documents.civil_records_recency` : whether DNM requires a maximum age for birth and marriage certificates (not established). Source: DNM checklist https://migraciones.gov.py/residencia-temporal/ (asked in article 6 FAQ).
7. `entry.nl_visa` : entry rules for Dutch passport holders (visa/stay length) and proof-of-entry document. Source to find: https://www.nederlandwereldwijd.nl/landen/paraguay/reizen ; DNM. Not stated in prose.
8. `documents.minors_police_certificate` : age exemption for minors (the existing `documents.police_certificate_validity` note mentions under-14s exempt; needs its own fact) and parental-consent requirement for minors travelling/applying with one parent. Source: DNM checklist.
9. `family.unmarried_partner` : whether an unmarried or registered partner qualifies as dependent under Ley 6984/2022 and under the Investor Pass. Source: Ley 6984/2022 text (baselegal.com.py) and Res. 0283/2026.
10. `pricing.*` : approved service prices; until verified all articles render hedged text only.
11. Dutch translator register: Rbtv (Register beëdigde tolken en vertalers), https://www.bureaubtv.nl ; name and 1 UNVERIFIED wording only used in prose as "beëdigd vertaler in het Nederlandse register".

## C. Dutch-side procedure sources checked (2026-09-29/30, by web search)

- Apostille at any Dutch court; only for documents signed by a sworn official, translator or notary; requester need not be the holder, no power of attorney; same-day/next-day collection at some courts (prose hedged): https://www.rechtspraak.nl/zelf-regelen/apostille-legalisatie
- Rijksoverheid product description: https://www.rijksoverheid.nl/wetten-en-regelingen/productbeschrijvingen/legaliseren-van-een-nederlands-document-met-een-apostille
- VOG abroad, paper only, apostille by court, direct application to Justis when not in BRP: https://www.nederlandwereldwijd.nl/verklaring/vog ; https://niederlande.diplo.de/nl-nl/service/bzr-seite-1437020
- Not verified by fetch (search snippets only): all court fee, timing and postal details. Re-check before publish.

## D. Flags

- Article 3 says a Paraguayan police certificate and Interpol statement are needed for the cedula; supported by `fees.*` fact notes only, confirm on DNM/Policía Nacional pages.
- Article 5 says the VOG purpose should be stated as emigration; based on general Dutch practice, confirm with Justis.
- Article 10 asserts the other parent's consent is normally needed; confirm (see B8).
- The route-finder and pricing pages (`/route-finder`, `/prijzen`) must exist on the `emigreren` site before publish.

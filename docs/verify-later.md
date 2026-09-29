# Verify later — everything Anton must confirm before it is treated as true

One place for every claim, figure, price and assumption on the seven sites that nobody has signed off yet.
Tick a row when you have checked it against the source; change the text (or the `content/shared/facts.ts` entry)
if it is wrong. Build sessions **append** to sections F and G whenever they write a number, law, timeline,
guarantee or promise. Never delete a row; mark it `done <date>`.

How facts work: every legal or money figure is a `<Fact k="…">` backed by `content/shared/facts.ts`. To sign one off,
check the source, then set `verified: true`, `verifiedBy`, `verifiedOn` on the entry. To pull a figure off every page
at once, delete its `sourced` block. The exhaustive list, with every page a fact appears on and its full source
notes, is [`docs/facts-verification.md`](facts-verification.md); regenerate it with `npm run facts:report`.
Status on 2026-09-29: **0 verified, 87 published with a source, 14 hedged.**

Suggested order: A (prices, they decide conversion) → B → the "low"/"medium" confidence rows in C → the rest of C.

## A. Business inputs only Anton has (no source to look up)

| # | What | Where it goes | Why it matters |
|---|---|---|---|
| A1 | Service prices: temporary, permanent, cédula, tax residency, family, Investor Pass | `pricing.*` in `content/shared/facts.ts` (or `/admin/facts`) | Pages say "on request" until set. Market range from `docs/audit/2026-10/competitors.md` §4: temporary + cédula USD 1,500–2,300; permanent ~1,900; Investor Pass 5,500–6,000. |
| A2 | Guarantee wording (refund/keep-going policy) | `content/shared/proof.ts` → `guarantee` | Component hidden until filled. Must be something you will honour. |
| A3 | Response-time promise (e.g. "we reply within N hours") | new "what happens next" blocks; see section F | Any promise on the site must be true. |
| A4 | Residencies filed, years in business, Google rating/count/URL | `content/shared/proof.ts` → `stats` | Trust bar shows nothing until filled. Only numbers you can back with receipts. |
| A5 | Team: real photos, role line per person, languages, bio, profile URLs (`sameAs`) | `content/shared/proof.ts` → `team`, `src/content/team.ts` | Bylines, Person JSON-LD, team section. |
| A6 | Reviews with client permission | `content/shared/proof.ts` → `reviews` | Testimonials hidden until filled. |
| A7 | Office address, opening hours and photos; Google Business Profile in Asunción | `content/shared/proof.ts` → `office` | LocalBusiness JSON-LD and OfficeStrip. |
| A8 | WhatsApp number (and which brand/team member answers each language) | env `NEXT_PUBLIC_WHATSAPP_NUMBER` in hPanel | No WhatsApp link exists anywhere until set. |
| A9 | Referral fee structure for `/for-agents` | `plan.md` §8.3 | Parked business question. |
| A10 | Guide price shows "$49" live but plan says "$7" (parked, paid guide not this week) | `products` row / `pricing-defaults.ts` | Check before the guide goes on sale. |
| A11 | Confirm pararesi never went live (one word) | `plan.md` §7 | Lets the Insider import be skipped. |
| A12 | Which LatAm cohorts the `.es` brand names beside Spain | `plan.md` §7 | Default: Spain, Argentina, others in passing. |

## B / C. Facts register (generated from `content/shared/facts.ts`, 2026-09-29)

Full detail per fact: [`docs/facts-verification.md`](facts-verification.md) (search the key).

### B. Hedged: no figure shown yet (needs your number or approval)

| Fact | Key | Confidence | Pages | Source checked |
|---|---|---|---|---|
| Cost of living — typical rent range | `costofliving.rent` | low | 17 | — |
| Cost of living — groceries and eating out | `costofliving.groceries` | low | 7 | — |
| Temporary residency — service fee | `pricing.temporary` | — | 35 | — |
| Permanent residency — service fee | `pricing.permanent` | — | 10 | — |
| Cédula de identidad — service fee | `pricing.cedula` | — | 9 | — |
| Tax residency and RUC — service fee | `pricing.tax_residency` | — | 13 | — |
| Family filing — service fee | `pricing.family` | — | 6 | — |
| Residency application — processing window | `residency.timeline` | low | 22 | — |
| Tax residency and RUC — processing window | `tax.timeline` | low | 9 | — |
| Investor Pass — processing window | `investorpass.timeline` | low | 11 | — |
| DNM fee — Mercosur residency | `fees.mercosur_residency` | low | 22 | — |
| Typical all-in DIY cost — temporary residency | `costs.diy_total` | low | 14 | — |
| Tax residency certificate — requirements | `tax.residency_certificate` | low | 12 | — |
| Paraguayan driving licence for residents | `driving.resident_licence` | low | 1 | — |

### C. Published with a source, awaiting sign-off

| Fact | Key | Confidence | Pages | Source checked |
|---|---|---|---|---|
| Police certificate — recency and acceptance | `documents.police_certificate_validity` | medium | 48 | [DNM requisitos Residencia Temporal (Ley 6984/2022), 2025–26 checklist](https://migraciones.gov.py/residencia- |
| Investor Pass — minimum qualifying investment | `investorpass.min_investment_usd` | high | 20 | [MIC Resolución N.º 0283/2026 (Constancia de Inversionista Extranjero)](https://www.mic.gov.py/wp-content/uplo |
| Investor Pass — programme launch | `investorpass.launch_date` | medium | 8 | [MIC/DNM joint launch, 17 Apr 2026; Res. MIC 0283/2026](https://migraciones.gov.py/paraguay-investor-pass-nuev |
| Investor Pass — residency validity | `investorpass.validity_years` | medium | 12 | [Ley 6984/2022 (permanent = indefinite); DNM 'Renovación de Carnet Permanente'](https://migraciones.gov.py/ren |
| Permanent residency — presence requirement | `permanent.presence_rule` | high | 65 | [Ley 6984/2022, art. 55; Res. DNM 376/2026 (13 May 2026)](https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n |
| Temporary residency — duration | `temporary.duration` | high | 74 | [Ley 6984/2022; DNM Residencia Temporal and Cambio de categoría pages](https://migraciones.gov.py/residencia-t |
| Cédula — typical timeline | `cedula.timeline` | medium | 69 | [Policía Nacional, Dpto. de Identificaciones — cédula por primera vez a extranjeros](https://www.policianacion |
| Personal income tax — territorial rate | `tax.territorial_rate` | high | 49 | [Ley 6380/2019 (IRP), PwC Worldwide Tax Summaries](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de |
| Investor Pass — real estate route minimum | `investorpass.route_real_estate_usd` | high | 14 | [MIC Res. 0283/2026](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversio |
| Investor Pass — productive business route minimum | `investorpass.route_business_usd` | high | 11 | [MIC Res. 0283/2026](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversio |
| Investor Pass — financial instruments route minimum | `investorpass.route_financial_usd` | high | 10 | [MIC Res. 0283/2026](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversio |
| Investor Pass — tourism-sector route minimum | `investorpass.route_tourism_usd` | high | 10 | [MIC Res. 0283/2026](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversio |
| Mercosur nationals — simplified residency route | `mercosur.residency_route` | medium | 43 | [Acuerdo de Residencia Mercosur (2002), Leyes 3565/2008 y 3578/2008; DNM Residencia Temporaria/Permanente Merc |
| Foreign-source income under the territorial system | `tax.foreign_income_treatment` | high | 75 | [Ley 6380/2019, art. 6 (source rule)](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacio |
| Cost of living — general comparison | `costofliving.overview` | medium | 42 | [Numbeo, Asunción, updated Aug 2026](https://www.numbeo.com/cost-of-living/in/Asuncion) — checked 2026-09-26 |
| Government fees — how they are set | `fees.basis` | high | 28 | [Decreto 6225/2026; Res. DNM 478/2026](https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el- |
| DNM fee — temporary residency | `fees.temporary_residency` | high | 27 | [DNM aranceles from 1 Jul 2026 (Res. DNM 478/2026) — 25 jornales](https://migraciones.gov.py/aranceles-migrato |
| DNM fee — permanent residency (change of category) | `fees.permanent_residency` | medium | 15 | [DNM aranceles from 1 Jul 2026 — 25 jornales](https://migraciones.gov.py/residencia-permanente-para-el-cambio- |
| DNM fee — temporary residency extension (prórroga) | `fees.temporary_extension` | high | 7 | [Res. DNM 478/2026 (1 Jul 2026)](https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-j |
| DNM fee — permanent resident card renewal | `fees.permanent_card_renewal` | high | 9 | [Res. DNM 478/2026 (1 Jul 2026)](https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-j |
| Interpol (Paraguay) background certificate fee | `fees.interpol_certificate` | high | 26 | [Policía Nacional, Dpto. Interpol — 1 jornal from 1 Jul 2026](https://www.abc.com.py/nacionales/2026/07/01/cer |
| Paraguayan police record certificate fee (for cédula) | `fees.police_certificate_py` | medium | 31 | [Policía Nacional, Certificado de Antecedentes Policiales](https://www.policianacional.gov.py/identificaciones |
| Cédula — government fee, first issue | `fees.cedula_first` | medium | 28 | [Policía Nacional, Dpto. de Identificaciones](https://www.policianacional.gov.py/identificaciones/cedula-de-id |
| Temporary residency — presence requirement | `temporary.presence_rule` | high | 31 | [Ley 6984/2022, art. 55; Res. DNM 376/2026](https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migra |
| Proof of means — current rule | `solvency.requirement` | medium | 50 | [Res. DNM 407/2026 (applies to filings from 6 July 2026)](https://migraciones.gov.py/migraciones-actualiza-el- |
| The old USD 5,000 bank deposit | `solvency.deposit_abolished` | medium | 20 | [Ley 6984/2022 (repealed Ley 978/1996 regime); IMI Daily](https://www.imidaily.com/program-updates/paraguay-no |
| Investor Pass — legal instrument | `investorpass.legal_instrument` | high | 10 | [MIC Res. 0283/2026 (repeals Res. 1052/2025)](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.20 |
| SUACE investor route — current status | `suace.status` | medium | 3 | [SUACE requirements sheet (2025) + MIC Res. 0283/2026](https://suace.gov.py/wp-content/uploads/2025/09/REQUISI |
| IRP — personal income tax brackets | `tax.irp_brackets` | high | 10 | [Ley 6380/2019 (IRP); PwC WWTS](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-si |
| IRP — capital income rate | `tax.capital_income_rate` | high | 9 | [Ley 6380/2019 (IRP rentas del capital); PwC WWTS](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de |
| IRE — business income tax | `tax.ire_rate` | high | 14 | [Ley 6380/2019 (IRE)](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificaci |
| Dividend tax (IDU) | `tax.dividends` | high | 10 | [Ley 6380/2019 (IDU)](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificaci |
| IVA — value added tax rates | `tax.iva_rate` | high | 6 | [Ley 6380/2019 (IVA); La Nación, 17 Jul 2026](https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-mode |
| IRP — registration threshold for personal-services income | `tax.irp_threshold` | high | 5 | [DNIT — umbral IRP-RSP (Ley 6380/2019)](https://www.dnit.gov.py/web/portal-institucional/w/desde-el-ano-2020-e |
| IRE RESIMPLE — small sole-proprietor regime | `tax.resimple` | medium | 2 | [DNIT — IRE RESIMPLE](https://www.dnit.gov.py/en/web/portal-institucional/ire-resimple) — checked 2026-09-28 |
| EAS — simplified joint-stock company | `business.eas` | high | 1 | [Ley 6480/2020 (EAS); SUACE — preguntas frecuentes EAS](https://www.bacn.gov.py/leyes-paraguayas/9100/ley-n-64 |
| Temporary residency — 'residente precario' status while the file is processed | `temporary.precarious_status` | high | 2 | [DNM — Residencia Temporal (Ley 6984/2022); Agencia IP, 4 May 2026](https://migraciones.gov.py/residencia-temp |
| Reference rate for Brazilian real conversions | `fx.brl_reference_rate` | medium | 1 | [InfoMoney (dólar comercial, 25 Sep 2026); ABC Color cotizaciones (28 Sep 2026)](https://www.infomoney.com.br/ |
| DNM residency fee converted to Brazilian reais | `fees.residency_brl` | medium | 1 | [DNM aranceles from 1 Jul 2026 (Res. DNM 478/2026), converted at InfoMoney/ABC rates of 25–28 Sep 2026](https: |
| Multiple nationality — constitutional rule | `citizenship.multiple_nationality` | medium | 1 | [Constitución Nacional, art. 149; Ley 7052/2023 (BACN)](https://www.bacn.gov.py/leyes-paraguayas/11258/ley-n-7 |
| Spain–Paraguay double tax treaty — status and dates | `tax.spain_treaty` | high | 7 | [BOE-A-2024-15573 (BOE, 29 jul 2024); Ley paraguaya 7271/2024](https://www.boe.es/buscar/doc.php?id=BOE-A-2024 |
| Paraguay monthly minimum wage (private sector) | `wages.minimum_monthly` | high | 4 | [Decreto N.º 6225/2026 (reajuste del salario mínimo, desde el 1 jul 2026)](https://www.vouga.com.py/wp-content |
| EAS (simplified company) — how it is formed | `company.eas` | high | 2 | [MIC, EAS – Preguntas frecuentes (Ley 6480/2020, Decreto 3998/2020)](https://eas.mic.gov.py/Preguntas-frecuent |
| Border security zone — rural land and foreigners from neighbouring countries | `property.border_zone` | high | 3 | [Ley N.º 2532/2005 (zona de seguridad fronteriza), BACN](https://www.bacn.gov.py/leyes-paraguayas/4025/ley-n-2 |
| Impuesto inmobiliario — annual property tax | `property.annual_tax` | — | 1 | [ABC Color, 27 dic 2025 (Decreto 5181/2025); Ley 5513/2015](https://www.abc.com.py/economia/2025/12/27/ejecuti |
| IPS social security contributions (employees) | `ips.contributions` | high | 2 | [MTESS / IPS, régimen de aporte obrero-patronal (Ley 213/93)](https://www.mtess.gov.py/?p=7713) — checked 2026 |
| Spain–Paraguay social security agreement | `socialsecurity.spain_agreement` | high | 2 | [BOE-A-2006-1619 (Convenio de Seguridad Social España–Paraguay); BOE-A-2017-687](https://www.boe.es/buscar/doc |
| Apostille — Paraguay's membership | `apostille.since` | high | 11 | [HCCH status table / news (accession deposited 10 Dec 2013)](https://www.hcch.net/en/news-archive/details/?var |
| Naturalisation — residence required | `citizenship.years` | high | 19 | [Constitución Nacional, art. 148; Poder Judicial — Carta de Naturalización](https://www.pj.gov.py/contenido/46 |
| Border security zone — rural land owned by foreigners from neighbouring countries | `land.border_security_zone` | high | 3 | [Ley N.º 2532/2005, Zona de Seguridad Fronteriza (BACN, Congreso Nacional)](https://www.bacn.gov.py/leyes-para |
| Used vehicle imports — maximum age | `vehicles.used_import_age` | medium | 1 | [Ley N.º 4333/2011, modifica el art. 1 de la Ley 2018/2002 (BACN, Congreso Nacional)](https://www.bacn.gov.py/ |
| Cash carried across the border — declaration threshold | `customs.cash_declaration` | high | 1 | [DNIT (Aduanas), control de dinero no declarado; Ley 1015/1997](https://www.dnit.gov.py/en/web/portal-instituc |
| Brazilian tourists — length of stay in Paraguay | `tourist.brazilian_stay` | medium | 5 | [Prefeitura de Ponta Porã, Ingresso de brasileiros no Paraguai (orientação do Consulado do Brasil)](https://po |
| Cost of living — family of four | `costofliving.monthly_family` | medium | 11 | [Numbeo, Asunción, Aug 2026](https://www.numbeo.com/cost-of-living/in/Asuncion) — checked 2026-09-26 |
| Reference exchange rate used for USD conversions | `fx.reference_rate` | medium | 13 | [BCP reference rate / market 25 Sep 2026](https://www.bcp.gov.py/webapps/web/cotizacion/referencial-fluctuante |
| Paraguay's double-tax treaties | `tax.double_tax_treaties` | high | 8 | [DNIT — Convenios Internacionales (agreements to avoid double taxation)](https://www.dnit.gov.py/en/web/portal |
| Citizenship — multiple nationality | `citizenship.dual_nationality` | medium | 5 | [Constitución Nacional 1992, art. 149 (Constitute Project translation); Ley 7052/2023](https://www.constitutep |
| Citizenship — how a naturalised Paraguayan loses it | `citizenship.naturalized_loss` | high | 2 | [Constitución Nacional 1992, art. 150 (Constitute Project translation)](https://www.constituteproject.org/cons |
| Naturalisation — requirements and filing | `citizenship.naturalization_requirements` | high | 3 | [Poder Judicial — Carta de Naturalización (requisitos); Constitución Nacional, art. 148](https://www.pj.gov.py |
| Entry — visa exemption for US, Canadian, Australian and New Zealand tourists | `entry.visa_exemption_us_ca_au` | high | 3 | [DNM — Acuerdos de supresión de visas (updated January 2026); DNM news on Ley 7314](https://migraciones.gov.py |
| Venezuelan nationals — consular visa to enter Paraguay | `entry.venezuela_visa` | high | 1 | [DNM — requisitos de ingreso y residencia para ciudadanos venezolanos (Decreto 5278/2026)](https://migraciones |
| Cuban nationals — consular visa to enter Paraguay | `entry.cuba_visa` | high | 1 | [DNM — Información sobre visas (tabla de acuerdos de supresión de visas 2026); DNM Residencia Temporal](https: |
| Entry with a national ID card instead of a passport | `entry.id_card_countries` | high | 7 | [DNM — Requerimientos migratorios de ingreso y salida del Paraguay](https://migraciones.gov.py/entrada-y-salid |
| Temporary to permanent — filing window and late filing | `permanent.change_window` | high | 1 | [DNM — Residencia permanente para el cambio de categoría de residente temporal](https://migraciones.gov.py/res |
| Mercosur temporary residency — conversion deadline | `mercosur.conversion_deadline` | high | 8 | [DNM — Residencia Temporaria Mercosur y Residencia Permanente Mercosur](https://migraciones.gov.py/residencia- |
| DNM fine — expired stay | `fees.overstay_fine` | high | 1 | [DNM — cambio de categoría, aranceles desde el 1 de julio de 2026 (6 jornales)](https://migraciones.gov.py/res |
| DNM fee — certificado de radicación | `fees.radicacion_certificate` | high | 2 | [DNM — aranceles de residencia permanente desde el 1 de julio de 2026 (2 jornales)](https://migraciones.gov.py |
| Naturalisation — judicial fee | `fees.naturalization_judicial` | medium | 1 | [Poder Judicial — Carta de Naturalización (requisitos y tasa)](https://www.pj.gov.py/contenido/463-carta-de-na |
| Naturalised Paraguayans — loss of nationality | `citizenship.loss_rule` | high | 1 | [Constitución Nacional de 1992, art. 150](https://www.bacn.gov.py/constitucion-nacional-de-la-republica-del-pa |
| Naturalised Paraguayans — citizenship (political rights) | `citizenship.political_rights` | high | 1 | [Constitución Nacional de 1992, art. 152](https://www.bacn.gov.py/constitucion-nacional-de-la-republica-del-pa |
| Investor Pass — what the investor certificate (CIE) is | `investorpass.cie_scope` | high | 4 | [MIC Res. 0283/2026, art. 1 and Annex I art. 1(a); Ley 6984/2022, art. 46](https://www.mic.gov.py/wp-content/u |
| Investor Pass — issuing term for the CIE | `investorpass.cie_issuing_term` | high | 3 | [MIC Res. 0283/2026, art. 4](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de- |
| Investor Pass — which resolution is in force | `investorpass.resolution_history` | high | 3 | [MIC Res. 0283/2026, preamble and art. 7](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_C |
| Investor Pass — personal documents for the CIE | `investorpass.cie_documents` | high | 2 | [MIC Res. 0283/2026, Annex I art. 2](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Consta |
| Investor Pass — timing and valuation of the investment | `investorpass.investment_status` | high | 4 | [MIC Res. 0283/2026, Annex I art. 1(g) and (h)](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283. |
| Investor Pass — productive route conditions | `investorpass.productive_conditions` | high | 2 | [MIC Res. 0283/2026, Annex I arts. 1(c) and 3](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2 |
| Investor Pass — tourism route conditions | `investorpass.tourism_conditions` | high | 2 | [MIC Res. 0283/2026, Annex I arts. 1(f) and 4](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2 |
| Investor Pass — financial instruments route conditions | `investorpass.financial_conditions` | high | 4 | [MIC Res. 0283/2026, Annex I arts. 1(d) and 5](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2 |
| Investor Pass — real estate route evidence | `investorpass.real_estate_evidence` | high | 2 | [MIC Res. 0283/2026, Annex I arts. 1(e) and 6](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2 |
| Investor Pass — foreign documents | `investorpass.foreign_documents` | high | 3 | [MIC Res. 0283/2026, Annex I art. 7](https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Consta |
| Criminal record — grounds for refusing residency | `residency.criminal_record_refusal` | high | 1 | [Ley 6984/2022 de Migraciones, arts. 50 and 52](https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-m |
| UK State Pension in Paraguay — annual increases | `uk.state_pension_paraguay` | high | 5 | [GOV.UK — Countries where we pay an annual increase in the State Pension](https://www.gov.uk/government/public |
| UK voluntary National Insurance from abroad | `uk.voluntary_nic_abroad` | high | 1 | [GOV.UK — Voluntary National Insurance contributions for periods abroad from April 2026](https://www.gov.uk/go |
| UK–Paraguay double taxation agreement | `uk.paraguay_tax_treaty` | high | 5 | [HMRC Double Taxation Relief Manual, DT15200 (Paraguay)](https://www.gov.uk/hmrc-internal-manuals/double-taxat |
| Naturalisation — constitutional requirements | `citizenship.constitutional_requirements` | high | 2 | [Constitución Nacional (1992), art. 148, as published by the Embassy of Paraguay in Japan](https://embapar.jp/ |
| Indian nationals — Paraguayan entry visa | `visa.india_consular` | medium | 1 | [Government of India, MEA — visa facility for Indian nationals (as on 2 Feb 2026); Paraguayan consular visa re |
| Driving in Paraguay on a UK licence (visitors) | `driving.uk_licence_visitors` | high | 1 | [FCDO travel advice: Paraguay — safety and security (driving)](https://www.gov.uk/foreign-travel-advice/paragu |
## D. Content decisions flagged in earlier runs (check the wording)

| # | Item | Where | Note |
|---|---|---|---|
| D1 | SUACE investor route: "24 months" wording, off-plan property, renewing vs converting | `content/**` (see `git log --merges design/overhaul-2026-10`) | Fixed for consistency in the overhaul, but the underlying rule is unverified. Matches facts `investorpass.*`. |
| D2 | Interpol / police-certificate wording on frontier | `content/frontier/stories/interpol-and-the-police-certificate-myth.mdx` | Fixed for consistency; confirm against DNM. |
| D3 | 90-day validity window for the police certificate | fact `documents.police_certificate_validity` | Primary DNM checklist has no day count; the 90 days comes from agency guides. Confirm with the filing lawyer. |
| D4 | Hub articles adapted for UK readers (ACRO, FCDO, HMRC, UK State Pension, NI) | `content/residency/**`, facts `uk.*` | UK-specific rules must be checked against gov.uk. |
| D5 | Writer questions listed in the overhaul merge commits | `git log --merges design/overhaul-2026-10` | Open questions the content writers could not resolve. |
| D6 | Brazilian real conversion rates on the PT brand | facts `Reference rate for Brazilian real conversions`, `DNM residency fee converted to Brazilian reais` | Exchange rates go stale; re-check on launch day. |
| D7 | Cost-of-living ranges (rent, groceries, family of four) | facts `costofliving.*` | Low confidence, from Numbeo/expat sites. |

## E. Infrastructure to confirm (not copy, but the site is wrong until true)

| # | Item | Status on 2026-09-29 |
|---|---|---|
| E1 | DNS for all seven domains and attached to the one Node app with SSL | Only `paraguayresidencyguide.com` live. See `docs/decisions-needed.md` §3. |
| E2 | Email provider (Resend/SMTP) and VenderCRM env vars | `/api/health` showed email `console`, CRM `off`. |
| E3 | Plausible per domain | Not loading. |
| E4 | Search Console + Bing Webmaster for each domain, sitemap submitted | Not done. |
| E5 | Hostinger CDN purged after each deploy (or DNS moved to Cloudflare) | HTML cache capped at 10 min in code. |
| E6 | Repository made private (paid guide chapters are public on GitHub) | Open. |

## F. Added by the Sonnet front-end run (appended by the session)

_Nothing yet from other agents._ Each row: text · file:line · what to confirm.

### A1

- `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only) must be set in the host env, then Redeploy · env · until set, every WhatsApp button, the floating button and the phone bar are hidden and the contact page is offered instead.
- `NEXT_PUBLIC_REPLY_HOURS` (whole number of working hours, optional) · `src/lib/reply-window.ts:8` · unset, the block promises no number ("as soon as we can"). Set it only to a time the team can keep; the pages then say "We aim to answer within N working hours" in all four languages.
- "A person on our team reads your message and answers it, not a bot" (who replies) · `src/i18n/messages/{en,es,pt,sv}/common.json` `nextSteps.who.body` · confirm true (no auto-reply bot handles the first answer).
- "Nothing starts until you say yes in writing. If it is not a fit, we say so." · `nextSteps.3.body` · confirm; restates the existing `after.3.body` promise.
- "Government fees and document costs are listed separately." · `nextSteps.price.note` · confirm matches how quotes are written.
- Price line is the `pricing.*` fact chosen by page path (`priceKeyFor`, `src/lib/reply-window.ts`): hedged wording until Anton verifies each fee in `content/shared/facts.ts`; articles default to `pricing.temporary` unless the slug names another route.
- Page-aware WhatsApp text ("Hi, I was reading "{page}" ...") uses the page title, set on click by `WhatsAppClickTracker` · `whatsapp.prefillPage` · confirm the wording in es/pt/sv.

### B. SEO gates and structured data (S24-B)

| # | What | Where | Confirm |
|---|---|---|---|
| FB1 | Street address, Google Maps link, Google review rating and count, and public profile links (LinkedIn etc.) for Anton, Yanina and Diana. The Organization/LocalBusiness JSON-LD emits `streetAddress`, `hasMap`, `aggregateRating` and extra `sameAs` **only** once these are filled, and never before. | `content/shared/proof.ts` (`office`, `stats.googleRating`), `src/content/team.ts` (`sameAs`) | Supply the real values. Nothing is invented while they are null. Google does not show star snippets for a business rating its own site; the markup is still correct and matches the visible TrustBar. |
| FB2 | Page titles and descriptions edited to meet the length gate (titles at most 60 characters, descriptions 70 to 160). Wording is shorter, meaning unchanged: guide `/insider` and `/refunds`, investorpass `/pricing`, frontier `/pricing`, `/documents/checklist` and the banking story, residenciaes `/precios` and `/residencia/permanente`, flytta `/guide`, `/process`, `/route-finder`, `/skatt`, `/uppehallstillstand`. | the page files under `src/app/**/sites/*` | Skim the Spanish and Swedish rewrites. |
| FB3 | residenciapt hub `morar-no-paraguai` articles now end on the "Residência temporária" service link instead of `/custo-de-vida`, so every article links to a real service page. | `src/app/(pt)/sites/residenciapt/guias/[hub]/[slug]/page.tsx` | Confirm temporary residency is the CTA you want for the life-in-Paraguay hub. |
| FB4 | flytta `/guide` (the English guide bridge) is now linked from the end of `/process`, so it is no longer an orphan. | `src/app/(sv)/sites/flytta/process/page.tsx` | Confirm the guide bridge should be reachable from the main site. |

## G. Added by the Opus O24 run (appended by the session)

_Nothing yet._ Each row: text · file:line · what to confirm. Database work lives in `docs/db-work-later.md`.

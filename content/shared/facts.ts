/**
 * Every legal or financial figure on any of the three sites lives here
 * (plan §1.10 / §4.11). Nothing is written as a bare number in JSX or MDX.
 *
 * Until Anton's legal partner verifies an entry (`verified: true` plus
 * `verifiedBy`/`verifiedOn`), pages render `hedged` — wording that points the
 * reader at a written answer instead of quoting a figure we cannot stand behind.
 * Public sources disagree on the Investor Pass minimum (USD 70k / 150k / 200k
 * all appear), which is exactly why this file exists.
 */

/**
 * Copy for one locale, or a per-locale map. `en` is always required; a brand
 * whose locale is missing falls back to `en` (plan §5.4.2). The fallback is
 * deliberate and unlike the i18n layer's: a fact is a legal statement, and a
 * correct English sentence beats a blank space or a machine translation.
 */
export type LocalizedText = string | ({ en: string } & Partial<Record<FactLocale, string>>);

export type FactLocale = 'en' | 'es' | 'pt' | 'sv';

export interface Fact {
  /** Stable key used as `<Fact k="…" />`. */
  key: string;
  /** Short human label, e.g. for the admin verification screen. */
  label: string;
  /** The label in the reader's language, for an article's sources list. */
  title?: LocalizedText;
  /** The figure/claim as it should read ONCE verified. */
  display: LocalizedText;
  /** What renders while `verified` is false. Never contains a bare number. */
  hedged: LocalizedText;
  verified: boolean;
  verifiedBy?: string;
  verifiedOn?: string;
  /** Where the unverified value came from; the resolution text is the goal. */
  sources: string[];
  /**
   * Published from a cited source ahead of the owner's sign-off (Anton's
   * decision, 2026-09-26: answer engines cannot quote "confirm on your call",
   * so a figure with a named source and a checked date goes live). The page
   * shows `display` plus the citation; `verified` still means "signed off".
   * `docs/facts-verification.md` lists every sourced fact awaiting sign-off.
   */
  sourced?: { label: LocalizedText; url?: string; checkedOn: string };
  note?: string;
}

export const facts = {
  "documents.police_certificate_validity": {
    "key": "documents.police_certificate_validity",
    "label": "Police certificate — recency and acceptance",
    "title": {
      "en": "Police certificate — recency and acceptance",
      "es": "Certificado de antecedentes penales — vigencia y aceptación",
      "pt": "Certificado de antecedentes criminais — validade e aceitação",
      "sv": "Polisintyg — giltighetstid och godkännande"
    },
    "display": {
      "en": "issued no more than 90 days before you file, apostilled or legalised, from your country of origin (and from any country you lived in during the last 3 years)",
      "es": "emitido como máximo 90 días antes de presentar la solicitud, apostillado o legalizado, del país de origen (y de cualquier país donde hayas vivido en los últimos 3 años)",
      "pt": "emitida no máximo 90 dias antes do protocolo, apostilada ou legalizada, do país de origem (e de qualquer país onde você tenha morado nos últimos 3 anos)",
      "sv": "utfärdat högst 90 dagar innan du lämnar in ansökan, apostillerat eller legaliserat, från ursprungslandet (och från varje land du bott i under de senaste 3 åren)"
    },
    "hedged": {
      "en": "the applicable certificate recency window and acceptance conditions must be confirmed for your issuing country, route and filing stage",
      "es": "la vigencia y las condiciones de aceptación del certificado deben confirmarse según tu país emisor, tu ruta y la etapa de tu trámite",
      "pt": "a validade e as condições de aceitação da certidão devem ser confirmadas conforme seu país emissor, sua rota e a etapa do seu processo",
      "sv": "giltighetstiden och villkoren för godkännande av intyget måste bekräftas utifrån ditt utfärdande land, din väg och var i processen du befinner dig"
    },
    "verified": false,
    "sourced": {
      "label": "DNM requisitos Residencia Temporal (Ley 6984/2022), 2025–26 checklist",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/residencia-temporal/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-temporal/",
      "https://migraciones.gov.py/wp-content/uploads/2025/10/Residencia-Temporal-Ley-6984-1025.pdf",
      "https://paraguaysovereign.com/residency/police-certificate/",
      "https://moveparaguay.com/en/full-guide/"
    ],
    "note": "Research 2026-09-26 (medium confidence): The DNM checklist (primary) says the certificate must be original, 'vigente', apostilled/legalised, national/federal level, plus certificates from any country of residence in the last 3 years; under-14s exempt. It does NOT print a day count in the search snippets. The 90-day window (counted from issue date, not apostille date) comes from agency guides; some guides say 6 months for foreign certificates. Since late 2025 DNM/Interpol also verifies directly with the issuing country, which can add delay. Owner: confirm the 90-day practice with the filing lawyer before publishing; the 3-year prior-residence rule is primary-sourced."
  },
  "investorpass.min_investment_usd": {
    "key": "investorpass.min_investment_usd",
    "label": "Investor Pass — minimum qualifying investment",
    "title": {
      "en": "Investor Pass — minimum qualifying investment",
      "es": "Investor Pass — inversión mínima requerida",
      "pt": "Investor Pass — investimento mínimo exigido",
      "sv": "Investor Pass — lägsta godkända investering"
    },
    "display": {
      "en": "from USD 70,000 (productive business with at least 5 formal jobs); USD 150,000–200,000 on the passive routes",
      "es": "desde USD 70.000 (empresa productiva con al menos 5 empleos formales); entre USD 150.000 y 200.000 en las vías pasivas",
      "pt": "a partir de USD 70.000 (empresa produtiva com pelo menos 5 empregos formais); de USD 150.000 a 200.000 nas rotas passivas",
      "sv": "från USD 70 000 (produktivt företag med minst 5 formella anställningar); USD 150 000–200 000 för de passiva vägarna"
    },
    "hedged": {
      "en": "from a qualifying investment amount we confirm in writing for your case",
      "es": "desde un monto de inversión que confirmamos por escrito para tu caso",
      "pt": "a partir de um valor de investimento que confirmamos por escrito para o seu caso",
      "sv": "från ett investeringsbelopp som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC Resolución N.º 0283/2026 (Constancia de Inversionista Extranjero)",
      "checkedOn": "2026-09-26",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.rediex.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://cdn-www.lanacionpy.arcpublishing.com/negocios/2026/08/09/con-el-investor-pass-paraguay-busca-atraer-capital-extranjero-con-inversiones-desde-usd-70000/",
      "https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html"
    ],
    "note": "Research 2026-09-26 (high confidence): The old 70k/150k/200k 'conflict' is resolved: they are different routes under one resolution. 70k = productive (jobs + business plan); 150k = tourism; 200k = real estate and financial instruments. Consistent across MIC, REDIEX (gov) and La Nación. Primary PDF could not be fetched (proxy) — figures taken from MIC/REDIEX official news and search excerpts of the PDF. Pages that promise '70k with no jobs' are wrong; the 70k route requires jobs."
  },
  "investorpass.launch_date": {
    "key": "investorpass.launch_date",
    "label": "Investor Pass — programme launch",
    "title": {
      "en": "Investor Pass — programme launch",
      "es": "Investor Pass — lanzamiento del programa",
      "pt": "Investor Pass — lançamento do programa",
      "sv": "Investor Pass — programmets lansering"
    },
    "display": {
      "en": "launched on 17 April 2026 (Resolution 0283/2026, signed 21 April 2026)",
      "es": "lanzado el 17 de abril de 2026 (Resolución 0283/2026, firmada el 21 de abril de 2026)",
      "pt": "lançado em 17 de abril de 2026 (Resolução 0283/2026, assinada em 21 de abril de 2026)",
      "sv": "lanserat den 17 april 2026 (resolution 0283/2026, undertecknad den 21 april 2026)"
    },
    "hedged": "programme launch and current status confirmed in writing for your case",
    "verified": false,
    "sourced": {
      "label": "MIC/DNM joint launch, 17 Apr 2026; Res. MIC 0283/2026",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/paraguay-investor-pass-nueva-herramienta-para-facilitar-la-inversion-extranjera-en-el-pais/"
    },
    "sources": [
      "https://migraciones.gov.py/paraguay-investor-pass-nueva-herramienta-para-facilitar-la-inversion-extranjera-en-el-pais/",
      "https://www.hoy.com.py/nacionales/2026/04/17/mic-y-migraciones-lanzan-el-paraguay-investor-pass",
      "https://www.paraguaytv.gov.py/2026/04/23/paraguay-investor-pass-nuevo-instrumento-legal-para-atraer-capitales-extranjeros/",
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-26 (medium confidence): Public launch event 17 April 2026 (Diario HOY, DNM). IMI Daily reports the resolution signed by Minister Marco Riquelme on 21 April 2026; one guide says rules in force 28 April 2026, another says effective 16 April. Safest public wording: 'April 2026'. Owner: read the resolution's date/vigencia clause in the PDF."
  },
  "investorpass.validity_years": {
    "key": "investorpass.validity_years",
    "label": "Investor Pass — residency validity",
    "title": {
      "en": "Investor Pass — residency validity",
      "es": "Investor Pass — vigencia de la residencia",
      "pt": "Investor Pass — validade da residência",
      "sv": "Investor Pass — uppehållstillståndets giltighet"
    },
    "display": {
      "en": "permanent residency with no expiry; the resident card is renewed every 10 years",
      "es": "residencia permanente sin vencimiento; el carnet de residente se renueva cada 10 años",
      "pt": "residência permanente sem vencimento; a carteira de residente é renovada a cada 10 anos",
      "sv": "permanent uppehållstillstånd utan slutdatum; uppehållskortet förnyas vart tionde år"
    },
    "hedged": "a long-validity permanent card — we confirm the exact term in writing before you file",
    "verified": false,
    "sourced": {
      "label": "Ley 6984/2022 (permanent = indefinite); DNM 'Renovación de Carnet Permanente'",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/renovacion-de-carnet-permanente/"
    },
    "sources": [
      "https://migraciones.gov.py/renovacion-de-carnet-permanente/",
      "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones",
      "https://www.elnacional.com.py/nacionales/todo-lo-hay-saber-sobre-nueva-ley-migraciones-n36782"
    ],
    "note": "Research 2026-09-26 (medium confidence): Many agency pages say 'a 10-year permanent residency' — that conflates the card with the status. Permanent residency is indefinite ('residir por tiempo indeterminado'); the carnet (and the cédula) are renewed every 10 years under Ley 6984. Renewal fee G 468,308 from 1 Jul 2026. Holders under old Ley 978/1996 are not required to renew. Presence rule still applies (see permanent.presence_rule)."
  },
  "permanent.presence_rule": {
    "key": "permanent.presence_rule",
    "label": "Permanent residency — presence requirement",
    "title": {
      "en": "Permanent residency — presence requirement",
      "es": "Residencia permanente — requisito de presencia",
      "pt": "Residência permanente — requisito de permanência",
      "sv": "Permanent uppehållstillstånd — krav på närvaro"
    },
    "display": {
      "en": "at least one entry every three years — an unjustified absence of more than 3 consecutive years cancels permanent residency",
      "es": "al menos una entrada cada tres años: una ausencia injustificada de más de 3 años consecutivos cancela la residencia permanente",
      "pt": "pelo menos uma entrada a cada três anos: uma ausência injustificada de mais de 3 anos consecutivos cancela a residência permanente",
      "sv": "minst en inresa vart tredje år – en oförklarad frånvaro på mer än 3 år i följd upphäver det permanenta uppehållstillståndet"
    },
    "hedged": {
      "en": "a minimum-presence rule applies — we tell you exactly what it means for your travel pattern",
      "es": "existe una regla de presencia mínima — te decimos exactamente qué significa para tu forma de viajar",
      "pt": "há uma exigência de presença mínima — explicamos o que ela significa para seus planos de viagem",
      "sv": "ett krav på minsta närvaro gäller — vi förklarar vad det innebär för dina resplaner"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6984/2022, art. 55; Res. DNM 376/2026 (13 May 2026)",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones",
      "https://www.ip.gov.py/ip/2026/04/08/unjustified-absence-from-the-country-leads-to-revocation-of-residency-for-foreigners-officials-remind/",
      "https://liberation.travel/paraguay-residency-absence-rules-376-2026/"
    ],
    "note": "Research 2026-09-26 (high confidence): Rule is consecutive absence, not days per year; one entry resets the clock. Some guides cite art. 54 — the cancellation causes are in art. 55 per most sources; check article number in the law text. NEW IN 2026: Res. DNM 376/2026 (signed 13 May 2026 by director Jorge Kronawetter, repeals Res. 018/2023 and 120/2023) makes the Dirección de Control de Permanencia sweep the register twice a year and cancel by administrative act; prior authorisation for longer absences can be requested (art. 6). Absences justified by DNM authorisation do not count."
  },
  "temporary.duration": {
    "key": "temporary.duration",
    "label": "Temporary residency — duration",
    "title": {
      "en": "Temporary residency — duration",
      "es": "Residencia temporal — duración",
      "pt": "Residência temporária — duração",
      "sv": "Tillfälligt uppehållstillstånd — giltighetstid"
    },
    "display": {
      "en": "up to two years (renewable), then permanent residency can be requested in the last 90 days of the card",
      "es": "hasta dos años (prorrogable); la residencia permanente se solicita en los últimos 90 días de vigencia del carnet",
      "pt": "até dois anos (prorrogável); a residência permanente é solicitada nos últimos 90 dias de validade da carteira",
      "sv": "upp till två år (kan förlängas); permanent uppehållstillstånd söks under kortets sista 90 dagar"
    },
    "hedged": {
      "en": "a fixed initial term, after which you apply for permanent residency — current term confirmed in writing for your case",
      "es": "un plazo inicial fijo, tras el cual solicitas la residencia permanente — el plazo vigente te lo confirmamos por escrito para tu caso",
      "pt": "um prazo inicial fixo, após o qual você solicita a residência permanente — confirmamos o prazo vigente por escrito para o seu caso",
      "sv": "en fast inledande period, varefter du ansöker om permanent uppehållstillstånd — aktuell giltighet bekräftas skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6984/2022; DNM Residencia Temporal and Cambio de categoría pages",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/residencia-temporal/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-temporal/",
      "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/",
      "https://altra.com.py/dos-anos-de-la-ley-6984-2022-residentes-temporales-ya-pueden-acceder-a-su-residencia-permanente/"
    ],
    "note": "Research 2026-09-26 (high confidence): DNM: card 'hasta 2 años, prorrogable por períodos iguales'. Change of category must be filed within the 3 months (≈90 days) before the temporary card expires — some sources say '3 months', Mercosur page says '90 days'. From 6 July 2026 the conversion requires proof of means under Res. DNM 407/2026 (see solvency.requirement). Extension (prórroga) fee G 1,287,847."
  },
  "cedula.timeline": {
    "key": "cedula.timeline",
    "label": "Cédula — typical timeline",
    "title": {
      "en": "Cédula — typical timeline",
      "es": "Cédula — plazo habitual",
      "pt": "Cédula — prazo habitual",
      "sv": "Cédula — vanlig handläggningstid"
    },
    "display": {
      "en": "an official 60 working days for a first-time foreign-resident cédula, often longer in 2026",
      "es": "un plazo oficial de 60 días hábiles para la primera cédula de un residente extranjero, a menudo más en 2026",
      "pt": "um prazo oficial de 60 dias úteis para a primeira cédula de residente estrangeiro, muitas vezes mais em 2026",
      "sv": "officiellt 60 arbetsdagar för ett första cédula-kort för utländska invånare, ofta längre under 2026"
    },
    "hedged": {
      "en": "issued after your residency is approved — we give you a current, realistic window, not a best case",
      "es": "se emite una vez aprobada tu residencia — te damos un plazo real y actual, no el mejor caso posible",
      "pt": "emitida após a aprovação da residência — damos um prazo atual e realista, não o melhor cenário",
      "sv": "utfärdas efter att ditt uppehållstillstånd har beviljats — vi ger dig en aktuell, realistisk tidsram, inte ett bästa scenario"
    },
    "verified": false,
    "sourced": {
      "label": "Policía Nacional, Dpto. de Identificaciones — cédula por primera vez a extranjeros",
      "checkedOn": "2026-09-26",
      "url": "https://www.policianacional.gov.py/identificaciones/cedula-de-identidad-por-primera-vez-a-extranjeros-con-radicacion-permanente/"
    },
    "sources": [
      "https://www.policianacional.gov.py/identificaciones/cedula-de-identidad-por-primera-vez-a-extranjeros-con-radicacion-permanente/",
      "https://www.policianacional.gov.py/identificaciones/expedicion-de-cedula-de-identidad-a-extranjeros-por-primera-vez/",
      "https://moveparaguay.com/en/cedula/",
      "https://goparaguay.co/en/blog/paraguay-temporary-residency-guide-2026"
    ],
    "note": "Research 2026-09-26 (medium confidence): Official page (via search excerpt) lists 60 working days for foreigners needing carnet + antecedentes + Interpol checks (30 working days reference for others). Agencies report 6–12 weeks typical and 'over 3 months' as of Feb 2026 because of volume and the enhanced Interpol verification. Legal basis cited: Res. 215/2020 art. 13. The old 'weeks' wording is too optimistic."
  },
  "tax.territorial_rate": {
    "key": "tax.territorial_rate",
    "label": "Personal income tax — territorial rate",
    "title": {
      "en": "Personal income tax — territorial rate",
      "es": "Impuesto sobre la renta personal — tasa territorial",
      "pt": "Imposto de renda pessoal — alíquota territorial",
      "sv": "Personlig inkomstskatt — territoriell skattesats"
    },
    "display": {
      "en": "8–10% on Paraguay-sourced personal income (10% top rate; 8% on capital income)",
      "es": "entre el 8% y el 10% sobre la renta personal de fuente paraguaya (10% como tipo máximo; 8% sobre rentas del capital)",
      "pt": "de 8% a 10% sobre a renda pessoal de fonte paraguaia (10% na faixa máxima; 8% sobre rendimentos de capital)",
      "sv": "8–10 % på personlig inkomst från paraguayansk källa (högst 10 %; 8 % på kapitalinkomst)"
    },
    "hedged": {
      "en": "a low flat rate on Paraguay-sourced income under a territorial system — your accountant confirms your case",
      "es": "un tipo fijo bajo sobre la renta de fuente paraguaya bajo un sistema territorial — tu asesor confirma tu caso concreto",
      "pt": "uma alíquota fixa baixa sobre a renda de fonte paraguaia em um sistema territorial — seu contador avalia o seu caso",
      "sv": "en låg enhetlig skattesats på inkomst från paraguayansk källa inom ett territoriellt system — din skatterådgivare bedömer ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019 (IRP), PwC Worldwide Tax Summaries",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://taxsummaries.pwc.com/paraguay/individual/taxes-on-personal-income",
      "https://www.dnit.gov.py/en/web/portal-institucional/w/d-ley-n-6380-19"
    ],
    "note": "Research 2026-09-26 (high confidence): IRP personal services: 8% up to G 50m, 9% G 50–150m, 10% above G 150m net income; capital income (rents, interest, gains) flat 8%. The old '10% flat' display is a simplification — keep '10%' only as 'top rate'. Personal-services IRP applies once gross annual income exceeds G 80m (PwC summary; owner should confirm current threshold). Never render as advice."
  },
  "investorpass.route_real_estate_usd": {
    "key": "investorpass.route_real_estate_usd",
    "label": "Investor Pass — real estate route minimum",
    "title": {
      "en": "Investor Pass — real estate route minimum",
      "es": "Investor Pass — mínimo de la vía inmobiliaria",
      "pt": "Investor Pass — mínimo da rota imobiliária",
      "sv": "Investor Pass — lägsta belopp för fastighetsvägen"
    },
    "display": {
      "en": "from USD 200,000 in real estate used for an economic activity (not your own home)",
      "es": "desde USD 200.000 en inmuebles destinados a una actividad económica (no a vivienda propia)",
      "pt": "a partir de USD 200.000 em imóveis destinados a uma atividade econômica (não para moradia própria)",
      "sv": "från USD 200 000 i fastigheter som används i ekonomisk verksamhet (inte som egen bostad)"
    },
    "hedged": {
      "en": "a qualifying real-estate purchase, with the current minimum confirmed in writing for your case",
      "es": "una compra inmobiliaria admitida, con el mínimo vigente confirmado por escrito para tu caso",
      "pt": "uma compra imobiliária qualificada, com o mínimo vigente confirmado por escrito para o seu caso",
      "sv": "ett godkänt fastighetsköp, med det aktuella minimibeloppet bekräftat skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.rediex.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://getgoldenvisa.com/paraguay-golden-visa"
    ],
    "note": "Research 2026-09-26 (high confidence): No jobs or business plan required, but property must be for economic activity — personal/family use excluded. The current 'from USD 70,000' display is WRONG and must change."
  },
  "investorpass.route_business_usd": {
    "key": "investorpass.route_business_usd",
    "label": "Investor Pass — productive business route minimum",
    "title": {
      "en": "Investor Pass — productive business route minimum",
      "es": "Investor Pass — mínimo de la vía de empresa productiva",
      "pt": "Investor Pass — mínimo da rota de empresa produtiva",
      "sv": "Investor Pass — lägsta belopp för vägen med produktivt företag"
    },
    "display": {
      "en": "from USD 70,000 invested in a productive business, with a business plan and at least 5 formal jobs",
      "es": "desde USD 70.000 invertidos en una empresa productiva, con plan de negocios y al menos 5 empleos formales",
      "pt": "a partir de USD 70.000 investidos em uma empresa produtiva, com plano de negócios e pelo menos 5 empregos formais",
      "sv": "från USD 70 000 investerat i ett produktivt företag, med affärsplan och minst 5 formella anställningar"
    },
    "hedged": {
      "en": "a qualifying investment in a productive business, with the current minimum confirmed in writing for your case",
      "es": "una inversión admitida en una empresa productiva, con el mínimo vigente confirmado por escrito para tu caso",
      "pt": "um investimento qualificado em uma empresa produtiva, com o mínimo vigente confirmado por escrito para o seu caso",
      "sv": "en godkänd investering i ett produktivt företag, med det aktuella minimibeloppet bekräftat skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.rediex.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.ferrere.com/es/novedades/residencia-permanente-por-inversion-paraguay-agiliza-el-acceso-a-la-constancia-de-inversionista-extranjero/"
    ],
    "note": "Research 2026-09-26 (high confidence): Industry, commerce or services. SUACE requirement sheets add an execution schedule with the investment implemented within max 24 months (the 24-month window from the old regime was dropped; see suace.status)."
  },
  "investorpass.route_financial_usd": {
    "key": "investorpass.route_financial_usd",
    "label": "Investor Pass — financial instruments route minimum",
    "title": {
      "en": "Investor Pass — financial instruments route minimum",
      "es": "Investor Pass — mínimo de la vía de instrumentos financieros",
      "pt": "Investor Pass — mínimo da rota de instrumentos financeiros",
      "sv": "Investor Pass — lägsta belopp för vägen med finansiella instrument"
    },
    "display": {
      "en": "from USD 200,000 in qualifying financial instruments, held for at least 2 years",
      "es": "desde USD 200.000 en instrumentos financieros admitidos, mantenidos al menos 2 años",
      "pt": "a partir de USD 200.000 em instrumentos financeiros qualificados, mantidos por pelo menos 2 anos",
      "sv": "från USD 200 000 i godkända finansiella instrument, som behålls i minst 2 år"
    },
    "hedged": {
      "en": "a qualifying financial-instrument investment, with the current minimum confirmed in writing for your case",
      "es": "una inversión en instrumentos financieros admitidos, con el mínimo vigente confirmado por escrito para tu caso",
      "pt": "um investimento em instrumentos financeiros qualificados, com o mínimo vigente confirmado por escrito para o seu caso",
      "sv": "en godkänd investering i finansiella instrument, med det aktuella minimibeloppet bekräftat skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.rediex.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/"
    ],
    "note": "Research 2026-09-26 (high confidence): No jobs or business management required. Some guides describe it as Paraguayan stock-market (BVA) securities; exact eligible instruments (bonds, CDAs, funds?) must be read from the resolution text before being listed."
  },
  "investorpass.route_tourism_usd": {
    "key": "investorpass.route_tourism_usd",
    "label": "Investor Pass — tourism-sector route minimum",
    "title": {
      "en": "Investor Pass — tourism-sector route minimum",
      "es": "Investor Pass — mínimo de la vía turística",
      "pt": "Investor Pass — mínimo da rota turística",
      "sv": "Investor Pass — lägsta belopp för turismvägen"
    },
    "display": {
      "en": "from USD 150,000 invested in a tourism project, with a business plan",
      "es": "desde USD 150.000 invertidos en un proyecto turístico, con plan de negocios",
      "pt": "a partir de USD 150.000 investidos em um projeto turístico, com plano de negócios",
      "sv": "från USD 150 000 investerat i ett turismprojekt, med affärsplan"
    },
    "hedged": {
      "en": "a qualifying tourism-sector investment, with the current minimum confirmed in writing for your case",
      "es": "una inversión admitida en el sector turístico, con el mínimo vigente confirmado por escrito para tu caso",
      "pt": "um investimento qualificado no setor de turismo, com o mínimo vigente confirmado por escrito para o seu caso",
      "sv": "en godkänd investering inom turismsektorn, med det aktuella minimibeloppet bekräftat skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.rediex.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://finance.yahoo.com/economy/policy/articles/paraguay-offers-direct-permanent-residency-152937040.html"
    ],
    "note": "Research 2026-09-26 (high confidence): Business plan and technical follow-up (likely SENATUR involvement) required; job-creation requirement not stated for this route in the sources seen."
  },
  "mercosur.residency_route": {
    "key": "mercosur.residency_route",
    "label": "Mercosur nationals — simplified residency route",
    "title": {
      "en": "Mercosur nationals — simplified residency route",
      "es": "Nacionales del Mercosur — vía simplificada de residencia",
      "pt": "Nacionais do Mercosul — rota simplificada de residência",
      "sv": "Mercosur-medborgare — förenklad väg till uppehållstillstånd"
    },
    "display": {
      "en": "a 2-year Mercosur temporary residency, convertible to permanent in the 90 days before it expires, for nationals of Argentina, Brazil, Uruguay, Bolivia, Chile, Peru, Colombia and Ecuador",
      "es": "una residencia temporal Mercosur de 2 años, convertible en permanente en los 90 días previos a su vencimiento, para nacionales de Argentina, Brasil, Uruguay, Bolivia, Chile, Perú, Colombia y Ecuador",
      "pt": "uma residência temporária Mercosul de 2 anos, convertível em permanente nos 90 dias antes do vencimento, para nacionais de Argentina, Brasil, Uruguai, Bolívia, Chile, Peru, Colômbia e Equador",
      "sv": "ett tvåårigt tillfälligt Mercosur-uppehållstillstånd, som kan omvandlas till permanent under de 90 dagarna före utgång, för medborgare i Argentina, Brasilien, Uruguay, Bolivia, Chile, Peru, Colombia och Ecuador"
    },
    "hedged": {
      "en": "Mercosur nationality can simplify parts of the process — we tell you exactly which parts, for your nationality, before you file",
      "es": "la nacionalidad Mercosur puede simplificar partes del trámite — te decimos exactamente cuáles, según tu nacionalidad, antes de presentar nada",
      "pt": "a nacionalidade do Mercosul pode simplificar partes do processo — dizemos exatamente quais, para a sua nacionalidade, antes de protocolar",
      "sv": "medborgarskap i ett Mercosur-land kan förenkla delar av processen — vi säger exakt vilka delar, för ditt medborgarskap, innan något lämnas in"
    },
    "verified": false,
    "sourced": {
      "label": "Acuerdo de Residencia Mercosur (2002), Leyes 3565/2008 y 3578/2008; DNM Residencia Temporaria/Permanente Mercosur",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/residencia-permanente-mercosur/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-permanente-mercosur/",
      "https://migraciones.gov.py/residencia-temporaria-mercosur/",
      "http://www.bacn.gov.py/leyes-paraguayas/1096/ley-n-3565-aprueba-el-acuerdo-sobre-residencia-para-nacionales-de-los-estados-partes-del-mercosur",
      "https://sela.org/observatorio/observatorio-de-migraciones/gobernanza-migratoria/paraguay/"
    ],
    "note": "Research 2026-09-26 (medium confidence): Country list is from the DNM page. Missing the 90-day window loses the right to convert under the Agreement. Since 6 July 2026 Res. DNM 407/2026 applies the SAME solvency evidence to Mercosur and Ley 6984 permanent residencies — the Mercosur route is no longer lighter on proof of means. Mercosur temporary card term '2 years' is from the Agreement (art. 4) — verify on DNM page. Keep the existing note: never present as a fixed entitlement."
  },
  "tax.foreign_income_treatment": {
    "key": "tax.foreign_income_treatment",
    "label": "Foreign-source income under the territorial system",
    "title": {
      "en": "Foreign-source income under the territorial system",
      "es": "Rentas de fuente extranjera bajo el sistema territorial",
      "pt": "Rendimentos de fonte estrangeira no sistema territorial",
      "sv": "Inkomst från utländsk källa under det territoriella systemet"
    },
    "display": {
      "en": "foreign-source income is generally outside Paraguayan income tax (Ley 6380/2019 taxes only Paraguay-source income)",
      "es": "las rentas de fuente extranjera quedan por lo general fuera del impuesto paraguayo (la Ley 6380/2019 solo grava la renta de fuente paraguaya)",
      "pt": "a renda de fonte estrangeira fica, em geral, fora do imposto paraguaio (a Lei 6380/2019 tributa apenas a renda de fonte paraguaia)",
      "sv": "inkomst från utländsk källa ligger i regel utanför paraguayansk inkomstskatt (lag 6380/2019 beskattar bara inkomst från paraguayansk källa)"
    },
    "hedged": {
      "en": "Paraguay taxes territorially, which changes how foreign income is treated — what that means for your own country and your own income is a question for your accountant, and we say so rather than promising anything",
      "es": "Paraguay aplica un sistema territorial, lo que cambia el trato de las rentas del exterior — qué significa eso para tu país y para tus ingresos es una pregunta para tu asesor, y lo decimos en vez de prometer nada",
      "pt": "o Paraguai tributa de forma territorial, o que muda o tratamento da renda vinda de fora — o que isso significa para o seu país e para a sua renda é pergunta para o seu contador, e a gente diz isso em vez de prometer qualquer coisa",
      "sv": "Paraguay beskattar territoriellt, vilket ändrar hur utländsk inkomst behandlas — vad det betyder för ditt eget land och din egen inkomst är en fråga för din skatterådgivare, och det säger vi hellre än lovar något"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019, art. 6 (source rule)",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://taxsummaries.pwc.com/paraguay/individual/taxes-on-personal-income",
      "https://www.dnit.gov.py/en/web/portal-institucional/w/d-ley-n-6380-19"
    ],
    "note": "Research 2026-09-26 (high confidence): CAVEAT for the frontier brand: Ley 6380 deems interest on deposits abroad, FX differences and foreign dividends to be Paraguay-source WHEN the investing entity is constituted or resident in Paraguay — i.e. routing foreign investments through a Paraguayan company (IRE) brings them into tax. For individuals holding directly, foreign interest/dividends/pensions are generally out of scope. Never render as 'tax-free'; home-country rules still apply."
  },
  "costofliving.overview": {
    "key": "costofliving.overview",
    "label": "Cost of living — general comparison",
    "title": {
      "en": "Cost of living — general comparison",
      "es": "Costo de vida — comparación general",
      "pt": "Custo de vida — comparação geral",
      "sv": "Levnadskostnader — allmän jämförelse"
    },
    "display": {
      "en": "about USD 600 a month for a single person before rent in Asunción (Numbeo, August 2026)",
      "es": "unos USD 600 al mes para una persona sola, sin contar el alquiler, en Asunción (Numbeo, agosto de 2026)",
      "pt": "cerca de USD 600 por mês para uma pessoa sozinha, sem contar o aluguel, em Assunção (Numbeo, agosto de 2026)",
      "sv": "cirka USD 600 i månaden för en ensamstående exklusive hyra i Asunción (Numbeo, augusti 2026)"
    },
    "hedged": {
      "en": "your budget depends on city, lifestyle and household size — we walk through your own spending rather than quoting an average that fits nobody",
      "pt": "visivelmente mais baixo do que Rio ou São Paulo para a maioria das pessoas, mas passamos pelos seus números de verdade — cidade, estilo de vida, tamanho da família — por escrito, em vez de citar uma média que não serve para ninguém",
      "es": "el presupuesto depende de la ciudad, el estilo de vida y el tamaño de la familia — revisamos tus gastos contigo en vez de dar una media que no se ajuste a tu caso",
      "sv": "budgeten beror på stad, livsstil och familjens storlek — vi går igenom dina utgifter tillsammans i stället för att ange ett genomsnitt som inte passar dig"
    },
    "verified": false,
    "sourced": {
      "label": "Numbeo, Asunción, updated Aug 2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.numbeo.com/cost-of-living/in/Asuncion"
    },
    "sources": [
      "https://www.numbeo.com/cost-of-living/in/Asuncion",
      "https://citycost.org/asuncion/",
      "https://wise.com/gb/cost-of-living/paraguay/asuncion",
      "https://expatsettle.com/asuncion/cost-of-living"
    ],
    "note": "Research 2026-09-26 (medium confidence): Numbeo Aug 2026: single person USD 598.8 (G 3,549,650) excl. rent; family of four USD 2,242 (G 13,293,016) excl. rent. CityCost ~USD 622, Wise ~GBP 435. Crowd-sourced; Numbeo page itself could not be fetched (proxy) — figures from search excerpts. Dated figure: must show the month. pt brand's comparative framing vs Brazilian capitals can stay as extra copy."
  },
  "costofliving.rent": {
    "key": "costofliving.rent",
    "label": "Cost of living — typical rent range",
    "title": {
      "en": "Cost of living — typical rent range",
      "es": "Costo de vida — rango habitual de alquiler",
      "pt": "Custo de vida — faixa habitual de aluguel",
      "sv": "Levnadskostnader — vanligt hyresintervall"
    },
    "display": {
      "en": "roughly USD 450–600 a month for a one-bedroom flat in central Asunción (2026), less outside the centre and in smaller cities",
      "es": "entre USD 450 y 600 al mes, aproximadamente, por un departamento de un dormitorio en el centro de Asunción (2026), menos fuera del centro y en ciudades más pequeñas",
      "pt": "cerca de USD 450 a 600 por mês por um apartamento de um quarto na região central de Assunção (2026), menos fora do centro e em cidades menores",
      "sv": "ungefär USD 450–600 i månaden för en etta i centrala Asunción (2026), mindre utanför centrum och i mindre städer"
    },
    "hedged": {
      "en": "rent depends on your city and the kind of place you want — we review current ranges together rather than quoting a number that goes stale",
      "pt": "aluguel é uma das categorias em que o Paraguai claramente custa menos — a faixa exata para a sua cidade e o tipo de imóvel que você quer é algo que confirmamos juntos, em vez de um número que fica desatualizado",
      "es": "el alquiler depende de la ciudad y del tipo de vivienda — revisamos contigo un rango actualizado para lo que buscas",
      "sv": "hyran beror på stad och bostadstyp — vi går igenom aktuella hyresnivåer för det boende du söker"
    },
    "verified": false,
    "sources": [
      "https://www.numbeo.com/cost-of-living/in/Asuncion",
      "https://citycost.org/asuncion/",
      "https://wise.com/gb/cost-of-living/paraguay/asuncion",
      "https://expatsettle.com/asuncion/cost-of-living"
    ],
    "note": "Research 2026-09-26 (low confidence): CityCost Aug 2026: ~USD 608 central 1-bed; Wise: ~GBP 414 (~USD 525); ExpatSettle (Numbeo-based): USD 450–620. An older Numbeo excerpt: G 3,350,000 centre / G 2,660,000 outside (date unclear, ~USD 570/450 at today's rate). Sources disagree and are crowd-sourced; quote as a range with year. Premium areas (Villa Morra, Carmelitas) run higher."
  },
  "costofliving.groceries": {
    "key": "costofliving.groceries",
    "label": "Cost of living — groceries and eating out",
    "title": {
      "en": "Cost of living — groceries and eating out",
      "es": "Costo de vida — supermercado y comer fuera",
      "pt": "Custo de vida — mercado e refeições fora de casa",
      "sv": "Levnadskostnader — matinköp och restaurangbesök"
    },
    "display": {
      "en": "around USD 150–210 a month in groceries for one person, and about G 35,000–40,000 (≈ USD 6–7) for a set lunch at a simple restaurant",
      "es": "unos USD 150–210 al mes en supermercado para una persona, y unos G 35.000–40.000 (≈ USD 6–7) por un menú del día en un restaurante sencillo",
      "pt": "cerca de USD 150–210 por mês em mercado para uma pessoa, e uns G 35.000–40.000 (≈ USD 6–7) por um almoço executivo em restaurante simples",
      "sv": "runt USD 150–210 i månaden i matinköp för en person, och cirka G 35 000–40 000 (≈ USD 6–7) för en dagens lunch på en enkel restaurang"
    },
    "hedged": {
      "en": "day-to-day spending is one of the categories we can walk through with real receipts from clients already living there, rather than a generic basket-of-goods number",
      "pt": "o gasto do dia a dia é uma das categorias que conseguimos mostrar com recibos reais de clientes que já moram lá, em vez de uma cesta básica genérica",
      "es": "podemos revisar los gastos cotidianos con recibos reales de clientes que ya viven allí, en vez de usar una cesta de productos genérica",
      "sv": "vi kan gå igenom vardagsutgifter med riktiga kvitton från kunder som redan bor där, i stället för att utgå från en generell varukorg"
    },
    "verified": false,
    "sources": [
      "https://www.numbeo.com/cost-of-living/in/Asuncion",
      "https://expatsettle.com/asuncion/cost-of-living",
      "https://preciosmundi.com/paraguay/precio-restaurantes",
      "https://wise.com/gb/cost-of-living/paraguay/asuncion"
    ],
    "note": "Research 2026-09-26 (low confidence): Grocery figure ~USD 212/month single (ExpatSettle) and USD 100–200 (other guide); lunch G 35–40k (Preciosmundi; its USD conversion of 4.5–5 used an older rate — at G 5,870/USD it is ~USD 6–7). Secondary/crowd-sourced only. Owner may prefer to keep hedged or add receipts from real clients."
  },
  "pricing.temporary": {
    "key": "pricing.temporary",
    "label": "Temporary residency — service fee",
    "display": {
      "en": "fixed service fee confirmed in writing",
      "es": "honorario fijo confirmado por escrito",
      "pt": "honorário fixo confirmado por escrito",
      "sv": "fast arvode som bekräftas skriftligt"
    },
    "hedged": {
      "en": "a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit",
      "es": "un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas",
      "pt": "um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir",
      "sv": "ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig"
    },
    "verified": false,
    "sources": [],
    "note": "No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee."
  },
  "pricing.permanent": {
    "key": "pricing.permanent",
    "label": "Permanent residency — service fee",
    "display": {
      "en": "fixed service fee confirmed in writing",
      "es": "honorario fijo confirmado por escrito",
      "pt": "honorário fixo confirmado por escrito",
      "sv": "fast arvode som bekräftas skriftligt"
    },
    "hedged": {
      "en": "a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit",
      "es": "un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas",
      "pt": "um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir",
      "sv": "ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig"
    },
    "verified": false,
    "sources": [],
    "note": "No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee."
  },
  "pricing.cedula": {
    "key": "pricing.cedula",
    "label": "Cédula de identidad — service fee",
    "display": {
      "en": "fixed service fee confirmed in writing",
      "es": "honorario fijo confirmado por escrito",
      "pt": "honorário fixo confirmado por escrito",
      "sv": "fast arvode som bekräftas skriftligt"
    },
    "hedged": {
      "en": "a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit",
      "es": "un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas",
      "pt": "um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir",
      "sv": "ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig"
    },
    "verified": false,
    "sources": [],
    "note": "No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee."
  },
  "pricing.tax_residency": {
    "key": "pricing.tax_residency",
    "label": "Tax residency and RUC — service fee",
    "display": {
      "en": "fixed service fee confirmed in writing",
      "es": "honorario fijo confirmado por escrito",
      "pt": "honorário fixo confirmado por escrito",
      "sv": "fast arvode som bekräftas skriftligt"
    },
    "hedged": {
      "en": "a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit",
      "es": "un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas",
      "pt": "um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir",
      "sv": "ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig"
    },
    "verified": false,
    "sources": [],
    "note": "No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee."
  },
  "pricing.family": {
    "key": "pricing.family",
    "label": "Family filing — service fee",
    "display": {
      "en": "fixed service fee confirmed in writing",
      "es": "honorario fijo confirmado por escrito",
      "pt": "honorário fixo confirmado por escrito",
      "sv": "fast arvode som bekräftas skriftligt"
    },
    "hedged": {
      "en": "a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit",
      "es": "un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas",
      "pt": "um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir",
      "sv": "ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig"
    },
    "verified": false,
    "sources": [],
    "note": "No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee."
  },
  "pricing.investor_pass": {
    "key": "pricing.investor_pass",
    "label": "Investor Pass — service fee",
    "display": {
      "en": "fixed service fee confirmed in writing",
      "es": "honorario fijo confirmado por escrito",
      "pt": "honorário fixo confirmado por escrito",
      "sv": "fast arvode som bekräftas skriftligt"
    },
    "hedged": {
      "en": "a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit",
      "es": "un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas",
      "pt": "um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir",
      "sv": "ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig"
    },
    "verified": false,
    "sources": [],
    "note": "No approved service price supplied. Added by the design overhaul (W4) so the PriceTable's Investor Pass row reads from the register like the other routes. The investment itself and government fees are not this service fee."
  },
  "residency.timeline": {
    "key": "residency.timeline",
    "label": "Residency application — processing window",
    "title": {
      "en": "Residency application — processing window",
      "es": "Solicitud de residencia — plazo de tramitación",
      "pt": "Solicitação de residência — prazo de tramitação",
      "sv": "Ansökan om uppehållstillstånd — handläggningstid"
    },
    "display": {
      "en": "typically 2–4 months for DNM to approve a temporary residency, and about 4–8 months from filing to cédula in hand",
      "es": "normalmente de 2 a 4 meses para que Migraciones apruebe la residencia temporal, y unos 4 a 8 meses desde la presentación hasta tener la cédula",
      "pt": "normalmente de 2 a 4 meses para a Migração aprovar a residência temporária, e cerca de 4 a 8 meses do protocolo até a cédula em mãos",
      "sv": "normalt 2–4 månader för migrationsmyndigheten att bevilja tillfälligt uppehållstillstånd, och cirka 4–8 månader från ansökan till färdigt cédula-kort"
    },
    "hedged": {
      "en": "a case-specific processing window confirmed in writing for your case; document readiness and authority review affect the timing",
      "es": "un plazo de tramitación para tu caso confirmado por escrito; depende de los documentos y de la revisión de la autoridad",
      "pt": "um prazo de tramitação para seu caso confirmado por escrito; depende dos documentos e da análise da autoridade",
      "sv": "en handläggningstid för ditt ärende som bekräftas skriftligt; dokument och myndighetens prövning påverkar tiden"
    },
    "verified": false,
    "sources": [
      "https://goparaguay.co/en/blog/paraguay-temporary-residency-guide-2026",
      "https://paraguaysovereign.com/residency/",
      "https://movetoparaguay.com/en/residency",
      "https://ntltrust.com/residency-by-investment/paraguay/"
    ],
    "note": "Research 2026-09-26 (low confidence): No official DNM processing time found. Agencies: 60–90 days typical, up to 120 for complex files; 3–4 months per others; 16–32 weeks first document to cédula. Since late 2025 DNM/Interpol verify antecedents directly with the country of origin, adding unpredictable delay by nationality. Competitor sources only — label as 'typical', never a promise."
  },
  "tax.timeline": {
    "key": "tax.timeline",
    "label": "Tax residency and RUC — processing window",
    "title": {
      "en": "Tax residency and RUC — processing window",
      "es": "Residencia fiscal y RUC — plazo de tramitación",
      "pt": "Residência fiscal e RUC — prazo de tramitação",
      "sv": "Skatterättslig hemvist och RUC — handläggningstid"
    },
    "display": {
      "en": "up to about 10 working days for the DNIT tax residency certificate once you hold a cédula and an active RUC",
      "es": "hasta unos 10 días hábiles para el certificado de residencia fiscal de la DNIT, una vez que tienes cédula y RUC activo",
      "pt": "até cerca de 10 dias úteis para o certificado de residência fiscal da DNIT, depois que você tiver cédula e RUC ativo",
      "sv": "upp till cirka 10 arbetsdagar för DNIT:s skatterättsliga hemvistintyg när du har cédula och aktivt RUC"
    },
    "hedged": {
      "en": "a separate tax and RUC processing window confirmed with the accountant for your case; residency approval does not set this timeline",
      "es": "un plazo separado para los trámites fiscales y el RUC, confirmado con el asesor para tu caso; la aprobación de residencia no fija este plazo",
      "pt": "um prazo separado para os trâmites fiscais e o RUC, confirmado com o contador para seu caso; a aprovação da residência não define esse prazo",
      "sv": "en separat tidsram för skatteärendet och RUC som bekräftas med revisorn för ditt ärende; beviljat uppehållstillstånd avgör inte denna tidsram"
    },
    "verified": false,
    "sources": [
      "https://www.dnit.gov.py/web/portal-institucional/certificado-de-residencia-fiscal-para-fines-tributarios",
      "https://www.vivirparaguay.com/en/tax-residence-certificate-paraguay/",
      "https://www.ferrere.com/es/novedades/certificado-de-residencia-fiscal-en-paraguay/"
    ],
    "note": "Research 2026-09-26 (low confidence): 10 working days is from an agency guide, not DNIT text. RUC registration itself is typically quick once cédula exists (not researched to a figure). Certificate is issued per fiscal year and collected in person or via notarised power of attorney."
  },
  "investorpass.timeline": {
    "key": "investorpass.timeline",
    "label": "Investor Pass — processing window",
    "title": {
      "en": "Investor Pass — processing window",
      "es": "Investor Pass — plazo de tramitación",
      "pt": "Investor Pass — prazo de tramitação",
      "sv": "Investor Pass — handläggningstid"
    },
    "display": {
      "en": "about 3–4 months: up to 5 working days for the investor certificate (CIE), then roughly 60–90 working days for the permanent residency resolution",
      "es": "unos 3 a 4 meses: hasta 5 días hábiles para la Constancia de Inversionista (CIE) y luego unos 60 a 90 días hábiles para la resolución de residencia permanente",
      "pt": "cerca de 3 a 4 meses: até 5 dias úteis para a Constância de Investidor (CIE) e depois uns 60 a 90 dias úteis para a resolução de residência permanente",
      "sv": "cirka 3–4 månader: upp till 5 arbetsdagar för investerarintyget (CIE), därefter ungefär 60–90 arbetsdagar för beslutet om permanent uppehållstillstånd"
    },
    "hedged": {
      "en": "a case-specific window confirmed in writing before filing; investment structuring, source-of-funds documents and authority review affect the timing",
      "es": "un plazo para tu caso confirmado por escrito antes de presentar la solicitud; depende de la estructura de inversión, el origen de los fondos y la revisión de la autoridad",
      "pt": "um prazo para seu caso confirmado por escrito antes do protocolo; depende da estrutura do investimento, da origem dos recursos e da análise da autoridade",
      "sv": "en tidsram för ditt ärende som bekräftas skriftligt före ansökan; investeringens upplägg, dokument om kapitalets ursprung och myndighetens prövning påverkar tiden"
    },
    "verified": false,
    "sources": [
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.ferrere.com/es/novedades/residencia-permanente-por-inversion-paraguay-agiliza-el-acceso-a-la-constancia-de-inversionista-extranjero/",
      "https://vfparaguaygestiones.com.py/blog/paraguay-investor-pass-2026/",
      "https://ntltrust.com/residency-by-investment/paraguay/"
    ],
    "note": "Research 2026-09-26 (low confidence): The 5-business-day CIE term is primary (resolution, confirmed by Ferrere). DNM stage 60–90 business days and total 90–120 days are agency claims; another guide says 4–9 months for the old SUACE route. Note 60–90 BUSINESS days is itself ~3–4.5 months, so '90–120 calendar days total' is internally inconsistent — owner should pick after first real cases. Excludes the time to make the investment and gather apostilled documents."
  },
  "fees.basis": {
    "key": "fees.basis",
    "label": "Government fees — how they are set",
    "title": {
      "en": "Government fees — how they are set",
      "es": "Tasas oficiales — cómo se fijan",
      "pt": "Taxas oficiais — como são fixadas",
      "sv": "Myndighetsavgifter — hur de fastställs"
    },
    "display": {
      "en": "set in minimum daily wages (jornales), G 117,077 each since 1 July 2026, so they rise with every minimum-wage adjustment",
      "es": "fijadas en jornales mínimos, de G 117.077 cada uno desde el 1 de julio de 2026, por lo que suben con cada reajuste del salario mínimo",
      "pt": "fixadas em diárias mínimas (jornales), de G 117.077 cada uma desde 1º de julho de 2026, por isso sobem a cada reajuste do salário mínimo",
      "sv": "fastställda i minimidagslöner (jornales), G 117 077 styck sedan den 1 juli 2026, så de höjs vid varje justering av minimilönen"
    },
    "hedged": {
      "en": "a government fee tied to the minimum wage, which we confirm in writing for your case",
      "es": "una tasa oficial vinculada al salario mínimo, que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial vinculada ao salário mínimo, que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift kopplad till minimilönen, som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Decreto 6225/2026; Res. DNM 478/2026",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/"
    },
    "sources": [
      "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/",
      "https://www.vouga.com.py/en/decreto-n-6225-2026-reajuste-del-salario-minimo-legal-para-el-sector-privado/",
      "https://www.ip.gov.py/ip/2026/07/01/direccion-de-migraciones-establece-nuevos-aranceles-para-tramites-migratorios-desde-este-1-de-julio/"
    ],
    "note": "Research 2026-09-26 (high confidence): Minimum wage G 3,044,000/month, daily G 117,077, from 1 Jul 2026 (+5%). Every fees.* entry below goes stale each July; set a yearly review."
  },
  "fees.temporary_residency": {
    "key": "fees.temporary_residency",
    "label": "DNM fee — temporary residency",
    "title": {
      "en": "DNM fee — temporary residency",
      "es": "Tasa de Migraciones — residencia temporal",
      "pt": "Taxa da Migração — residência temporária",
      "sv": "Migrationsavgift — tillfälligt uppehållstillstånd"
    },
    "display": {
      "en": "G 2,926,925 (about USD 500) in government fees",
      "es": "G 2.926.925 (unos USD 500) en tasas oficiales",
      "pt": "G 2.926.925 (cerca de USD 500) em taxas oficiais",
      "sv": "G 2 926 925 (cirka USD 500) i myndighetsavgifter"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "DNM aranceles from 1 Jul 2026 (Res. DNM 478/2026) — 25 jornales",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/aranceles-migratorios/"
    },
    "sources": [
      "https://migraciones.gov.py/aranceles-migratorios/",
      "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/",
      "https://expatsettle.com/paraguay-residency-calculator",
      "https://vfparaguaygestiones.com.py/residencia-temporal-paraguay/"
    ],
    "note": "Research 2026-09-26 (high confidence): 25 × G 117,077 = G 2,926,925 exactly, matching agency quotes. Before 1 Jul 2026 it was G 2,787,550 (25 × 111,502) — pages quoting that figure are outdated. USD at BCP ~G 5,870/USD (25 Sep 2026); older pages say ~USD 370 using a weaker guaraní. Cash in guaraníes or Bancard POS cards. Some agencies add a separate 'certificado de radicación' fee — check the DNM table."
  },
  "fees.permanent_residency": {
    "key": "fees.permanent_residency",
    "label": "DNM fee — permanent residency (change of category)",
    "title": {
      "en": "DNM fee — permanent residency (change of category)",
      "es": "Tasa de Migraciones — residencia permanente (cambio de categoría)",
      "pt": "Taxa da Migração — residência permanente (mudança de categoria)",
      "sv": "Migrationsavgift — permanent uppehållstillstånd (kategoribyte)"
    },
    "display": {
      "en": "G 2,926,925 (about USD 500) in government fees",
      "es": "G 2.926.925 (unos USD 500) en tasas oficiales",
      "pt": "G 2.926.925 (cerca de USD 500) em taxas oficiais",
      "sv": "G 2 926 925 (cirka USD 500) i myndighetsavgifter"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "DNM aranceles from 1 Jul 2026 — 25 jornales",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/",
      "https://migraciones.gov.py/aranceles-migratorios/",
      "https://vfparaguaygestiones.com.py/residencia-permanente-paraguay/",
      "https://www.riotimesonline.com/paraguay-visa-residency/"
    ],
    "note": "Research 2026-09-26 (medium confidence): Two agencies and Rio Times give 25 jornales, same as temporary. Plus 2 jornales (G 234,154) if personal data changed. Rio Times puts conversion all-in with local documents at G 5.5–6m (~USD 950–1,000 today). Verify the line on the DNM table (fetch blocked)."
  },
  "fees.mercosur_residency": {
    "key": "fees.mercosur_residency",
    "label": "DNM fee — Mercosur residency",
    "title": {
      "en": "DNM fee — Mercosur residency",
      "es": "Tasa de Migraciones — residencia Mercosur",
      "pt": "Taxa da Migração — residência Mercosul",
      "sv": "Migrationsavgift — Mercosur-uppehållstillstånd"
    },
    "display": {
      "en": "a reduced DNM fee of about G 2.3 million (≈ USD 400) for Mercosur nationals",
      "es": "una tasa reducida de Migraciones de unos G 2,3 millones (≈ USD 400) para nacionales del Mercosur",
      "pt": "uma taxa reduzida da Migração de cerca de G 2,3 milhões (≈ USD 400) para nacionais do Mercosul",
      "sv": "en reducerad avgift hos migrationsmyndigheten på cirka G 2,3 miljoner (≈ USD 400) för Mercosur-medborgare"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sources": [
      "https://migraciones.gov.py/aranceles-migratorios/",
      "https://vfparaguaygestiones.com.py/residencia-permanente-paraguay/"
    ],
    "note": "Research 2026-09-26 (low confidence): Sources quote G 2,230,040 = 20 × 111,502, i.e. the PRE-July-2026 jornal. Scaled to the current jornal it would be G 2,341,540 — computed, not seen in a source. Owner: read the exact line on the DNM table."
  },
  "fees.temporary_extension": {
    "key": "fees.temporary_extension",
    "label": "DNM fee — temporary residency extension (prórroga)",
    "title": {
      "en": "DNM fee — temporary residency extension (prórroga)",
      "es": "Tasa de Migraciones — prórroga de la residencia temporal",
      "pt": "Taxa da Migração — prorrogação da residência temporária",
      "sv": "Migrationsavgift — förlängning av tillfälligt uppehållstillstånd"
    },
    "display": {
      "en": "G 1,287,847 to extend a temporary residency",
      "es": "G 1.287.847 por la prórroga de la residencia temporal",
      "pt": "G 1.287.847 pela prorrogação da residência temporária",
      "sv": "G 1 287 847 för att förlänga ett tillfälligt uppehållstillstånd"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Res. DNM 478/2026 (1 Jul 2026)",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/"
    },
    "sources": [
      "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/",
      "https://www.hoy.com.py/nacionales/2026/07/01/establecen-nuevos-aranceles-para-tramites-migratorios",
      "https://www.adndigital.com.py/migraciones-actualiza-tarifas-y-multas-para-tramites-a-extranjeros-en-paraguay/"
    ],
    "note": "Research 2026-09-26 (high confidence): Reported in press coverage of the July 2026 fee table (11 jornales)."
  },
  "fees.permanent_card_renewal": {
    "key": "fees.permanent_card_renewal",
    "label": "DNM fee — permanent resident card renewal",
    "title": {
      "en": "DNM fee — permanent resident card renewal",
      "es": "Tasa de Migraciones — renovación del carnet de residente permanente",
      "pt": "Taxa da Migração — renovação da carteira de residente permanente",
      "sv": "Migrationsavgift — förnyelse av kort för permanent uppehållstillstånd"
    },
    "display": {
      "en": "G 468,308 to renew the permanent resident card every 10 years",
      "es": "G 468.308 por renovar el carnet de residente permanente cada 10 años",
      "pt": "G 468.308 para renovar a carteira de residente permanente a cada 10 anos",
      "sv": "G 468 308 för att förnya kortet för permanent uppehållstillstånd vart tionde år"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Res. DNM 478/2026 (1 Jul 2026)",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/"
    },
    "sources": [
      "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/",
      "https://migraciones.gov.py/renovacion-de-carnet-permanente/"
    ],
    "note": "Research 2026-09-26 (high confidence): 4 jornales. Card replacement / 'prórroga de permanencia': G 585,385."
  },
  "fees.interpol_certificate": {
    "key": "fees.interpol_certificate",
    "label": "Interpol (Paraguay) background certificate fee",
    "title": {
      "en": "Interpol (Paraguay) background certificate fee",
      "es": "Tasa del certificado de Interpol (Paraguay)",
      "pt": "Taxa do certificado da Interpol (Paraguai)",
      "sv": "Avgift för Interpol-intyg (Paraguay)"
    },
    "display": {
      "en": "G 117,077 (about USD 20), cash only",
      "es": "G 117.077 (unos USD 20), solo en efectivo",
      "pt": "G 117.077 (cerca de USD 20), somente em dinheiro",
      "sv": "G 117 077 (cirka USD 20), endast kontant"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Policía Nacional, Dpto. Interpol — 1 jornal from 1 Jul 2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.abc.com.py/nacionales/2026/07/01/certificado-de-antecedentes-interpol-nuevo-costo-vigente-desde-julio-2026/"
    },
    "sources": [
      "https://www.abc.com.py/nacionales/2026/07/01/certificado-de-antecedentes-interpol-nuevo-costo-vigente-desde-julio-2026/",
      "https://x.com/InterpolOCNASU/status/1940019823271973099",
      "https://www.ip.gov.py/ip/2026/04/20/el-departamento-de-interpol-detalla-requisitos-para-la-expedicion-del-certificado-de-antecedentes/"
    ],
    "note": "Research 2026-09-26 (high confidence): Was G 111,502 until 30 Jun 2026. Issued in 1–2 working days per guides, but 2026 enhanced verification with country of origin can delay. Press (La Política Online) reported allegations of parallel 'fees' at Interpol — worth warning clients to pay only the official amount."
  },
  "fees.police_certificate_py": {
    "key": "fees.police_certificate_py",
    "label": "Paraguayan police record certificate fee (for cédula)",
    "title": {
      "en": "Paraguayan police record certificate fee (for cédula)",
      "es": "Tasa del certificado de antecedentes policiales paraguayo (para la cédula)",
      "pt": "Taxa do certificado de antecedentes policiais paraguaio (para a cédula)",
      "sv": "Avgift för paraguayanskt polisintyg (för cédula)"
    },
    "display": {
      "en": "G 24,500 in person (G 27,364 online)",
      "es": "G 24.500 en forma presencial (G 27.364 en línea)",
      "pt": "G 24.500 presencialmente (G 27.364 on-line)",
      "sv": "G 24 500 på plats (G 27 364 online)"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Policía Nacional, Certificado de Antecedentes Policiales",
      "checkedOn": "2026-09-26",
      "url": "https://www.policianacional.gov.py/identificaciones/certificado-de-antecedentes-policiales/"
    },
    "sources": [
      "https://www.policianacional.gov.py/identificaciones/certificado-de-antecedentes-policiales/",
      "https://paraguay.gov.py/oee/policia-nacional/14"
    ],
    "note": "Research 2026-09-26 (medium confidence): Figures from search excerpts; may have been adjusted in July 2026 — confirm."
  },
  "fees.cedula_first": {
    "key": "fees.cedula_first",
    "label": "Cédula — government fee, first issue",
    "title": {
      "en": "Cédula — government fee, first issue",
      "es": "Cédula — tasa oficial, primera emisión",
      "pt": "Cédula — taxa oficial, primeira emissão",
      "sv": "Cédula — myndighetsavgift, första utfärdande"
    },
    "display": {
      "en": "free for the first issue (renewal or replacement G 8,500)",
      "es": "gratuita la primera vez (renovación o duplicado: G 8.500)",
      "pt": "gratuita na primeira emissão (renovação ou segunda via: G 8.500)",
      "sv": "kostnadsfritt första gången (förnyelse eller ersättning: G 8 500)"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en myndighetsavgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Policía Nacional, Dpto. de Identificaciones",
      "checkedOn": "2026-09-26",
      "url": "https://www.policianacional.gov.py/identificaciones/cedula-de-identidad-por-primera-vez-a-extranjeros-con-radicacion-permanente/"
    },
    "sources": [
      "https://www.policianacional.gov.py/identificaciones/cedula-de-identidad-por-primera-vez-a-extranjeros-con-radicacion-permanente/",
      "https://vfparaguaygestiones.com.py/cedula-paraguaya-extranjeros/",
      "https://www.policianacional.gov.py/identificaciones/expedicion-de-cedula-de-identidad-a-extranjeros-por-primera-vez/"
    ],
    "note": "Research 2026-09-26 (medium confidence): Supporting certificates (police record, Interpol) cost extra. Apply within ~6 months of the residency resolution (agency claim)."
  },
  "costs.diy_total": {
    "key": "costs.diy_total",
    "label": "Typical all-in DIY cost — temporary residency",
    "title": {
      "en": "Typical all-in DIY cost — temporary residency",
      "es": "Costo total típico haciéndolo tú mismo — residencia temporal",
      "pt": "Custo total típico fazendo por conta própria — residência temporária",
      "sv": "Typisk totalkostnad om du gör det själv — tillfälligt uppehållstillstånd"
    },
    "display": {
      "en": "roughly USD 700–1,000 per adult doing it yourself, including government fees, translations and apostilles",
      "es": "aproximadamente USD 700–1.000 por adulto si lo haces por tu cuenta, incluidas tasas, traducciones y apostillas",
      "pt": "aproximadamente USD 700–1.000 por adulto fazendo por conta própria, incluindo taxas, traduções e apostilas",
      "sv": "ungefär USD 700–1 000 per vuxen om du gör det själv, inklusive avgifter, översättningar och apostiller"
    },
    "hedged": {
      "en": "a rough all-in cost range we walk you through for your case",
      "es": "un rango de costo total aproximado que te explicamos para tu caso",
      "pt": "uma faixa de custo total aproximada que explicamos para o seu caso",
      "sv": "ett ungefärligt totalkostnadsintervall som vi går igenom för ditt fall"
    },
    "verified": false,
    "sources": [
      "https://expatsettle.com/paraguay-residency-calculator",
      "https://residencypy.com/en/blog/costo-residencia-paraguay/",
      "https://movetoparaguay.com/en/blog/paraguay-temporary-residency"
    ],
    "note": "Research 2026-09-26 (low confidence): Competitor estimates only (last-resort sources). They anchored on the DNM fee at ~USD 370; with the stronger guaraní the fee alone is ~USD 500, so the realistic range may now be ~USD 850–1,200. Apostille USD 50–200/doc, certified translation USD 30–80/doc, excluding flights and home-country document costs. Lawyer-assisted typically USD 1,500–2,500 (competitor claim)."
  },
  "temporary.presence_rule": {
    "key": "temporary.presence_rule",
    "label": "Temporary residency — presence requirement",
    "title": {
      "en": "Temporary residency — presence requirement",
      "es": "Residencia temporal — requisito de presencia",
      "pt": "Residência temporária — requisito de permanência",
      "sv": "Tillfälligt uppehållstillstånd — krav på närvaro"
    },
    "display": {
      "en": "at least one entry every 12 months — an unjustified absence of more than one year cancels temporary residency",
      "es": "al menos una entrada cada 12 meses: una ausencia injustificada de más de un año cancela la residencia temporal",
      "pt": "pelo menos uma entrada a cada 12 meses: uma ausência injustificada de mais de um ano cancela a residência temporária",
      "sv": "minst en inresa var 12:e månad – en oförklarad frånvaro på mer än ett år upphäver det tillfälliga uppehållstillståndet"
    },
    "hedged": {
      "en": "a maximum time abroad we confirm for your case",
      "es": "un tiempo máximo fuera del país que te confirmamos para tu caso",
      "pt": "um tempo máximo fora do país que confirmamos para o seu caso",
      "sv": "en maximal tid utomlands som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6984/2022, art. 55; Res. DNM 376/2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones",
      "https://www.ip.gov.py/ip/2026/04/08/unjustified-absence-from-the-country-leads-to-revocation-of-residency-for-foreigners-officials-remind/",
      "https://liberation.travel/paraguay-residency-absence-rules-376-2026/",
      "https://paraguaysovereign.com/residency/maintain-residency/"
    ],
    "note": "Research 2026-09-26 (high confidence): No minimum stay; one entry resets the clock. Not a new 2026 law — it is the 2022 law, but 2026 brought active enforcement (Res. 376/2026: twice-yearly register sweeps, cancellation by administrative act). DNM can authorise longer absences in advance."
  },
  "solvency.requirement": {
    "key": "solvency.requirement",
    "label": "Proof of means — current rule",
    "title": {
      "en": "Proof of means — current rule",
      "es": "Solvencia económica — norma vigente",
      "pt": "Comprovação de solvência — regra vigente",
      "sv": "Bevis på försörjning — gällande regel"
    },
    "display": {
      "en": "documented, verifiable income or assets matched to one of 12 applicant categories — no fixed minimum amount",
      "es": "ingresos o bienes documentados y verificables según una de 12 categorías de solicitante, sin un monto mínimo fijo",
      "pt": "renda ou bens documentados e verificáveis conforme uma de 12 categorias de solicitante, sem valor mínimo fixo",
      "sv": "dokumenterade och kontrollerbara inkomster eller tillgångar enligt en av 12 sökandekategorier – inget fast minimibelopp"
    },
    "hedged": {
      "en": "documented income or assets matched to your specific case, with no fixed figure",
      "es": "ingresos o bienes documentados adaptados a tu caso concreto, sin una cifra fija",
      "pt": "renda ou bens documentados de acordo com o seu caso específico, sem um valor fixo",
      "sv": "dokumenterad inkomst eller tillgångar anpassade till ditt specifika fall, utan ett fast belopp"
    },
    "verified": false,
    "sourced": {
      "label": "Res. DNM 407/2026 (applies to filings from 6 July 2026)",
      "checkedOn": "2026-09-26",
      "url": "https://migraciones.gov.py/migraciones-actualiza-el-regimen-de-acreditacion-de-solvencia-economica-para-extranjeros/"
    },
    "sources": [
      "https://migraciones.gov.py/migraciones-actualiza-el-regimen-de-acreditacion-de-solvencia-economica-para-extranjeros/",
      "https://www.mersanlaw.com/novedades/nuevos-criterios-para-acreditar-la-solvencia-economica-en-la-residencia-permanente/",
      "https://www.ip.gov.py/ip/2026/06/25/the-paraguayan-directorate-of-migration-updates-the-requirements-for-permanent-residency/",
      "https://paraguaysovereign.com/residency/resolution-407/"
    ],
    "note": "Research 2026-09-26 (medium confidence): BIG 2026 CHANGE: Res. 407/2026 governs permanent residency (Ley 6984 conversions AND Mercosur). Categories include professionals, technicians, employees, self-employed, teleworkers/digital nomads, property owners, shareholders, farmers, clergy, retirees, dependants, students. A degree alone no longer suffices; RUC and apostilled income evidence often required. One source gives effective date 28 May 2026 vs 6 July 2026 in DNM/most sources — likely dictated 28 May, applies to files from 6 July; confirm. Temporary-residency solvency evidence not covered by 407."
  },
  "solvency.deposit_abolished": {
    "key": "solvency.deposit_abolished",
    "label": "The old USD 5,000 bank deposit",
    "title": {
      "en": "The old USD 5,000 bank deposit",
      "es": "El antiguo depósito bancario de USD 5.000",
      "pt": "O antigo depósito bancário de USD 5.000",
      "sv": "Den gamla bankinsättningen på USD 5 000"
    },
    "display": {
      "en": "no longer required — the fixed USD 5,000 deposit ended with Ley 6984/2022",
      "es": "ya no se exige: el depósito fijo de USD 5.000 desapareció con la Ley 6984/2022",
      "pt": "não é mais exigido: o depósito fixo de USD 5.000 acabou com a Lei 6984/2022",
      "sv": "krävs inte längre – den fasta insättningen på USD 5 000 försvann med lag 6984/2022"
    },
    "hedged": {
      "en": "the old fixed bank deposit that is no longer required",
      "es": "el antiguo depósito bancario fijo que ya no se exige",
      "pt": "o antigo depósito bancário fixo que não é mais exigido",
      "sv": "den gamla fasta bankinsättningen som inte längre krävs"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6984/2022 (repealed Ley 978/1996 regime); IMI Daily",
      "checkedOn": "2026-09-26",
      "url": "https://www.imidaily.com/program-updates/paraguay-no-longer-accepting-5000-deposit-based-applications-for-permanent-residence/"
    },
    "sources": [
      "https://www.imidaily.com/program-updates/paraguay-no-longer-accepting-5000-deposit-based-applications-for-permanent-residence/",
      "https://paraguayresidencyguide.com/5000-deposit/",
      "https://paraguaypathways.com/5000-deposit-for-residency/"
    ],
    "note": "Research 2026-09-26 (medium confidence): Secondary sources consistent. Note: paraguayresidencyguide.com appears in results as a third-party site — Anton's guide domain; check whether that content is Anton's own before citing it as an independent source."
  },
  "investorpass.legal_instrument": {
    "key": "investorpass.legal_instrument",
    "label": "Investor Pass — legal instrument",
    "title": {
      "en": "Investor Pass — legal instrument",
      "es": "Investor Pass — instrumento legal",
      "pt": "Investor Pass — instrumento legal",
      "sv": "Investor Pass — rättslig grund"
    },
    "display": {
      "en": "MIC Resolution No. 0283/2026, which grants a Foreign Investor Certificate (CIE) giving direct access to permanent residency",
      "es": "la Resolución MIC N.º 0283/2026, que otorga la Constancia de Inversionista Extranjero (CIE) con acceso directo a la residencia permanente",
      "pt": "a Resolução MIC n.º 0283/2026, que concede a Constância de Investidor Estrangeiro (CIE) com acesso direto à residência permanente",
      "sv": "MIC-resolution nr 0283/2026, som ger ett utländskt investerarintyg (CIE) med direkt tillgång till permanent uppehållstillstånd"
    },
    "hedged": {
      "en": "the government resolution that created the Investor Pass, which we cite for your case",
      "es": "la resolución oficial que creó el Investor Pass, que citamos para tu caso",
      "pt": "a resolução oficial que criou o Investor Pass, que citamos para o seu caso",
      "sv": "den myndighetsresolution som skapade Investor Pass, som vi hänvisar till för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026 (repeals Res. 1052/2025)",
      "checkedOn": "2026-09-26",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://www.rediex.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://pasmorabogados.com/paraguay-investor-pass-resolucion-mic-283-2026/"
    ],
    "note": "Research 2026-09-26 (high confidence): Skips the 2-year temporary stage. Covers investor plus spouse and minor children (per REDIEX/Yahoo). Issued by MIC via SUACE; residency itself granted by DNM."
  },
  "suace.status": {
    "key": "suace.status",
    "label": "SUACE investor route — current status",
    "title": {
      "en": "SUACE investor route — current status",
      "es": "Vía de inversión SUACE — situación actual",
      "pt": "Rota de investimento SUACE — situação atual",
      "sv": "SUACE-investerarväg — nuvarande status"
    },
    "display": {
      "en": "still open as the productive route inside the Investor Pass: from USD 70,000, at least 5 formal jobs",
      "es": "sigue vigente como vía productiva dentro del Investor Pass: desde USD 70.000, al menos 5 empleos formales",
      "pt": "continua vigente como rota produtiva dentro do Investor Pass: a partir de USD 70.000, pelo menos 5 empregos formais",
      "sv": "fortfarande öppen som den produktiva vägen inom Investor Pass: från USD 70 000, minst 5 formella anställningar"
    },
    "hedged": {
      "en": "the qualifying investment amount, job requirement and completion window for this route, which we confirm for your case",
      "es": "el monto de inversión, el requisito de empleos y el plazo de ejecución de esta vía, que confirmamos para tu caso",
      "pt": "o valor do investimento, a exigência de empregos e o prazo de execução dessa rota, que confirmamos para o seu caso",
      "sv": "investeringsbeloppet, kravet på anställningar och tidsramen för denna väg, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "SUACE requirements sheet (2025) + MIC Res. 0283/2026",
      "checkedOn": "2026-09-26",
      "url": "https://suace.gov.py/wp-content/uploads/2025/09/REQUISITOS-CONSTANCIA-DEFINITIVO.pdf"
    },
    "sources": [
      "https://suace.gov.py/wp-content/uploads/2025/09/REQUISITOS-CONSTANCIA-DEFINITIVO.pdf",
      "https://www.mic.gov.py/paraguay-fortalece-la-atraccion-de-inversiones-extranjeras-con-el-nuevo-investor-pass/",
      "https://migraciones.gov.py/residencia-permanente-para-inversionistas-extranjeros-suace/",
      "https://www.ferrere.com/es/novedades/residencia-permanente-por-inversion-paraguay-agiliza-el-acceso-a-la-constancia-de-inversionista-extranjero/"
    ],
    "note": "Research 2026-09-28 (high confidence): the 24-month execution window is NOT stated in Res. 0283/2026, which sets no fixed execution deadline; it came from the repealed 2025 regime (Res. 1052/2025), so it is removed from the display."
  },
  "tax.irp_brackets": {
    "key": "tax.irp_brackets",
    "label": "IRP — personal income tax brackets",
    "title": {
      "en": "IRP — personal income tax brackets",
      "es": "IRP — tramos del impuesto a la renta personal",
      "pt": "IRP — faixas do imposto de renda pessoal",
      "sv": "IRP — skatteskikt för personlig inkomstskatt"
    },
    "display": {
      "en": "8% up to G 50 million, 9% from G 50 to 150 million and 10% above G 150 million of net income",
      "es": "8% hasta G 50 millones, 9% de G 50 a 150 millones y 10% por encima de G 150 millones de renta neta",
      "pt": "8% até G 50 milhões, 9% de G 50 a 150 milhões e 10% acima de G 150 milhões de renda líquida",
      "sv": "8 % upp till G 50 miljoner, 9 % mellan G 50 och 150 miljoner och 10 % över G 150 miljoner i nettoinkomst"
    },
    "hedged": {
      "en": "the tax brackets that apply to your income level, which we walk you through",
      "es": "los tramos impositivos que corresponden a tu nivel de ingresos, que te explicamos",
      "pt": "as faixas de imposto que correspondem ao seu nível de renda, que explicamos para você",
      "sv": "de skatteskikt som gäller för din inkomstnivå, som vi går igenom med dig"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019 (IRP); PwC WWTS",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://taxsummaries.pwc.com/paraguay/individual/taxes-on-personal-income",
      "https://www.taxnotes.com/worldwide-tax-treaties/worldwide-tax-summaries/paraguay-individual-taxes-on-personal-income"
    ],
    "note": "Research 2026-09-26 (high confidence): Brackets apply to personal-services income (annual). Gross-income threshold for IRP liability G 80m per PwC — confirm."
  },
  "tax.capital_income_rate": {
    "key": "tax.capital_income_rate",
    "label": "IRP — capital income rate",
    "title": {
      "en": "IRP — capital income rate",
      "es": "IRP — tasa sobre rentas de capital",
      "pt": "IRP — alíquota sobre rendimentos de capital",
      "sv": "IRP — skattesats på kapitalinkomst"
    },
    "display": {
      "en": "a flat 8% on Paraguay-source capital income and gains",
      "es": "un 8% fijo sobre rentas y ganancias de capital de fuente paraguaya",
      "pt": "8% fixo sobre rendimentos e ganhos de capital de fonte paraguaia",
      "sv": "en enhetlig skatt på 8 % på kapitalinkomster och kapitalvinster från paraguayansk källa"
    },
    "hedged": {
      "en": "a flat rate on capital income that we confirm for your case",
      "es": "una tasa fija sobre las rentas de capital que te confirmamos para tu caso",
      "pt": "uma alíquota fixa sobre rendimentos de capital que confirmamos para o seu caso",
      "sv": "en enhetlig skattesats på kapitalinkomst som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019 (IRP rentas del capital); PwC WWTS",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://taxsummaries.pwc.com/paraguay/individual/taxes-on-personal-income"
    ],
    "note": "Research 2026-09-26 (high confidence): "
  },
  "tax.ire_rate": {
    "key": "tax.ire_rate",
    "label": "IRE — business income tax",
    "title": {
      "en": "IRE — business income tax",
      "es": "IRE — impuesto a la renta empresarial",
      "pt": "IRE — imposto de renda empresarial",
      "sv": "IRE — företagsinkomstskatt"
    },
    "display": {
      "en": "10% on business profits (IRE); small businesses under G 2 billion turnover may opt for IRE SIMPLE",
      "es": "10% sobre las utilidades empresariales (IRE); las empresas con ingresos inferiores a G 2.000 millones pueden optar por el IRE SIMPLE",
      "pt": "10% sobre os lucros empresariais (IRE); empresas com faturamento abaixo de G 2 bilhões podem optar pelo IRE SIMPLE",
      "sv": "10 % på företagsvinster (IRE); småföretag med omsättning under G 2 miljarder kan välja IRE SIMPLE"
    },
    "hedged": {
      "en": "the business income tax rate and small-business threshold that apply to your case",
      "es": "la tasa del impuesto empresarial y el umbral para pequeñas empresas que aplican a tu caso",
      "pt": "a alíquota do imposto empresarial e o limite para pequenas empresas aplicáveis ao seu caso",
      "sv": "den företagsskattesats och tröskel för småföretag som gäller för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019 (IRE)",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://taxsummaries.pwc.com/paraguay/corporate/taxes-on-corporate-income",
      "https://practiceguides.chambers.com/practice-guides/corporate-tax-2026/paraguay/trends-and-developments"
    ],
    "note": "Research 2026-09-26 (high confidence): IRE SIMPLE is described in guides as ~3% of gross revenue (it is actually a presumptive-profit regime; do not render '3%' without accountant review). RESIMPLE: up to G 80m turnover, fixed monthly payments."
  },
  "tax.dividends": {
    "key": "tax.dividends",
    "label": "Dividend tax (IDU)",
    "title": {
      "en": "Dividend tax (IDU)",
      "es": "Impuesto a los dividendos (IDU)",
      "pt": "Imposto sobre dividendos (IDU)",
      "sv": "Utdelningsskatt (IDU)"
    },
    "display": {
      "en": "8% on dividends paid to Paraguayan residents and 15% to non-residents",
      "es": "8% sobre dividendos pagados a residentes en Paraguay y 15% a no residentes",
      "pt": "8% sobre dividendos pagos a residentes no Paraguai e 15% a não residentes",
      "sv": "8 % på utdelning till personer bosatta i Paraguay och 15 % till personer bosatta utomlands"
    },
    "hedged": {
      "en": "the dividend tax rate that applies depending on where you are resident",
      "es": "la tasa del impuesto a los dividendos que corresponde según tu residencia",
      "pt": "a alíquota do imposto sobre dividendos que se aplica de acordo com a sua residência",
      "sv": "den utdelningsskattesats som gäller beroende på var du är bosatt"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019 (IDU)",
      "checkedOn": "2026-09-26",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://rsa.com.py/impuesto-a-dividendos-y-a-utilidades-generalidades/",
      "https://www.ferrere.com/en/news/paraguay-promulgan-ley-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional/"
    ],
    "note": "Research 2026-09-26 (high confidence): Combined effective rate with 10% IRE: ~17.2% resident, ~23.5% non-resident (Ferrere). Applies to dividends from Paraguayan entities."
  },
  "tax.residency_certificate": {
    "key": "tax.residency_certificate",
    "label": "Tax residency certificate — requirements",
    "title": {
      "en": "Tax residency certificate — requirements",
      "es": "Certificado de residencia fiscal — requisitos",
      "pt": "Certidão de residência fiscal — requisitos",
      "sv": "Skatterättsligt hemvistintyg — krav"
    },
    "display": {
      "en": "issued by DNIT to residents with a cédula and an active RUC, supported by an official record of entries and exits",
      "es": "lo emite la DNIT a residentes con cédula y RUC activo, acompañado de la constancia oficial de entradas y salidas del país",
      "pt": "emitido pela DNIT a residentes com cédula e RUC ativo, acompanhado da certidão oficial de entradas e saídas do país",
      "sv": "utfärdas av DNIT till invånare med cédula och aktivt RUC, med ett officiellt intyg över in- och utresor"
    },
    "hedged": {
      "en": "the documentation and presence evidence DNIT expects, which we confirm for your case",
      "es": "la documentación y las pruebas de presencia que exige la DNIT, que confirmamos para tu caso",
      "pt": "a documentação e as provas de permanência que a DNIT exige, que confirmamos para o seu caso",
      "sv": "den dokumentation och de närvarobevis som DNIT kräver, vilka vi bekräftar för ditt fall"
    },
    "verified": false,
    "sources": [
      "https://www.dnit.gov.py/en/web/portal-institucional/w/resolucion-general-n-65-20",
      "https://www.ferrere.com/es/novedades/certificado-de-residencia-fiscal-en-paraguay/",
      "https://paraguaysovereign.com/tax/how-to-become-tax-resident/",
      "https://taxsummaries.pwc.com/paraguay/individual/residence"
    ],
    "note": "Research 2026-09-26 (low confidence): CONFLICT: RG 65/2020 requires the DNM 'Constancia de Movimiento Migratorio' for the fiscal period. Some guides say you need either an active RUC or >120 days' presence; others call 120 days a myth (it relates to domicile under Ley 125/1991 art. 152). No source found for an investment-based alternative (the brief's 'investment alternative' could not be confirmed). Certificate is per fiscal year / valid ~1 year. Needs accountant sign-off before any day count is published."
  },
  // residenciapt W6-A — facts added for the pt-BR SEO pages (2026-09-28). One block, keep it contiguous.
  "tax.iva_rate": {
    "key": "tax.iva_rate",
    "label": "IVA — value added tax rates",
    "title": {
      "en": "IVA — value added tax rates",
      "es": "IVA — tasas del impuesto al valor agregado",
      "pt": "IVA — alíquotas do imposto sobre valor agregado",
      "sv": "IVA — mervärdesskattesatser"
    },
    "display": {
      "en": "10% general rate and 5% reduced rate (some basic-basket foods, medicines, real estate sales and residential rent)",
      "es": "10% de tasa general y 5% de tasa reducida (algunos alimentos de la canasta básica, medicamentos, venta de inmuebles y alquiler de vivienda)",
      "pt": "10% na alíquota geral e 5% na reduzida (parte da cesta básica, medicamentos, venda de imóveis e aluguel residencial)",
      "sv": "10 % i normalskattesats och 5 % i reducerad skattesats (vissa baslivsmedel, läkemedel, fastighetsförsäljning och bostadshyra)"
    },
    "hedged": {
      "en": "a general IVA rate and a reduced rate for some essentials, which your accountant confirms for what you sell",
      "es": "una tasa general de IVA y una reducida para algunos bienes básicos, que tu asesor confirma según lo que vendas",
      "pt": "uma alíquota geral de IVA e uma reduzida para alguns itens básicos, que o contador confirma conforme o que você vende",
      "sv": "en allmän IVA-sats och en reducerad sats för vissa baslivsmedel, som din revisor bekräftar utifrån vad du säljer"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6380/2019 (IVA); La Nación, 17 Jul 2026",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional",
      "https://www.lanacion.com.py/negocios/2026/07/17/iva-en-paraguay-el-impuesto-que-esta-presente-en-casi-todas-las-compras/"
    ],
    "note": "Research 2026-09-28 (high confidence): two rates, 10% general and 5% reduced (basic-basket items such as rice, pasta, oil, yerba, milk, eggs, flour; medicines; real estate sales; rent for housing). Non-residential rent is 10%. The 'imposto 10 10 10' search term = IRE 10% + IRP top 10% + IVA 10%."
  },
  "tax.irp_threshold": {
    "key": "tax.irp_threshold",
    "label": "IRP — registration threshold for personal-services income",
    "title": {
      "en": "IRP — registration threshold for personal-services income",
      "es": "IRP — umbral de inscripción por rentas de servicios personales",
      "pt": "IRP — limite de inscrição para renda de serviços pessoais",
      "sv": "IRP — registreringsgräns för inkomst av personliga tjänster"
    },
    "display": {
      "en": "you must register for IRP on personal-services income once your taxed annual income passes G 80 million",
      "es": "la inscripción en el IRP por servicios personales es obligatoria cuando los ingresos anuales gravados superan los G 80 millones",
      "pt": "a inscrição no IRP por serviços pessoais passa a ser obrigatória quando a renda anual tributada passa de G 80 milhões",
      "sv": "registrering för IRP på inkomst av personliga tjänster krävs när den beskattade årsinkomsten överstiger G 80 miljoner"
    },
    "hedged": {
      "en": "an annual income threshold above which personal-services income must be registered for IRP, which your accountant confirms",
      "es": "un umbral de ingresos anuales a partir del cual hay que inscribirse en el IRP, que confirma tu asesor",
      "pt": "um limite de renda anual a partir do qual é preciso se inscrever no IRP, que o contador confirma",
      "sv": "en årlig inkomstgräns över vilken inkomst av personliga tjänster ska registreras för IRP, som din revisor bekräftar"
    },
    "verified": false,
    "sourced": {
      "label": "DNIT — umbral IRP-RSP (Ley 6380/2019)",
      "checkedOn": "2026-09-28",
      "url": "https://www.dnit.gov.py/web/portal-institucional/w/desde-el-ano-2020-el-monto-que-obliga-a-inscribirse-en-el-irp-rsp-es-haber-superado-los-80-millones-de-guaranies-de-ingresos-anuales-gravados"
    },
    "sources": [
      "https://www.dnit.gov.py/web/portal-institucional/w/desde-el-ano-2020-el-monto-que-obliga-a-inscribirse-en-el-irp-rsp-es-haber-superado-los-80-millones-de-guaranies-de-ingresos-anuales-gravados",
      "https://www.dnit.gov.py/en/web/portal-institucional/irp"
    ],
    "note": "Research 2026-09-28 (high confidence, DNIT primary): G 80 million of taxed annual income, fixed since 2020 (no longer stepped down each year). Registration within 30 business days of passing it; the obligation lapses after two consecutive years under the threshold. Personal-services income only; capital income has its own rules."
  },
  "tax.resimple": {
    "key": "tax.resimple",
    "label": "IRE RESIMPLE — small sole-proprietor regime",
    "title": {
      "en": "IRE RESIMPLE — small sole-proprietor regime",
      "es": "IRE RESIMPLE — régimen de pequeñas empresas unipersonales",
      "pt": "IRE RESIMPLE — regime das pequenas empresas unipessoais",
      "sv": "IRE RESIMPLE — förenklad ordning för små enskilda firmor"
    },
    "display": {
      "en": "for sole proprietorships with annual income up to G 80 million: a fixed amount of G 20,000 to G 80,000 a month (paid monthly or quarterly) and one annual return in February",
      "es": "para empresas unipersonales con ingresos anuales de hasta G 80 millones: un monto fijo de G 20.000 a G 80.000 por mes (pagado mensual o trimestralmente) y una sola declaración anual en febrero",
      "pt": "para empresas unipessoais com renda anual de até G 80 milhões: um valor fixo de G 20.000 a G 80.000 por mês (pago mensal ou trimestralmente) e uma única declaração anual em fevereiro",
      "sv": "för enskilda firmor med en årsinkomst på högst G 80 miljoner: ett fast belopp på G 20 000 till G 80 000 per månad (betalas månads- eller kvartalsvis) och en enda årsdeklaration i februari"
    },
    "hedged": {
      "en": "a simplified regime for very small sole proprietorships with a fixed periodic payment, which your accountant confirms for your turnover",
      "es": "un régimen simplificado para empresas unipersonales muy pequeñas, con un pago fijo periódico, que tu asesor confirma según tu facturación",
      "pt": "um regime simplificado para empresas unipessoais muito pequenas, com pagamento fixo periódico, que o contador confirma conforme o seu faturamento",
      "sv": "en förenklad ordning för mycket små enskilda firmor med en fast periodisk betalning, som din revisor bekräftar utifrån din omsättning"
    },
    "verified": false,
    "sourced": {
      "label": "DNIT — IRE RESIMPLE",
      "checkedOn": "2026-09-28",
      "url": "https://www.dnit.gov.py/en/web/portal-institucional/ire-resimple"
    },
    "sources": [
      "https://www.dnit.gov.py/en/web/portal-institucional/ire-resimple",
      "https://www.dnit.gov.py/en/web/portal-institucional/w/ire-resimple-ingresos-de-2025-deben-declararse-en-febrero",
      "https://ecovisparaguay.com.py/impuesto-a-la-renta-empresarial-regimen-re-simple-en-paraguay/"
    ],
    "note": "Research 2026-09-28 (medium confidence): DNIT page lists 'Empresas Unipersonales (con ingresos anuales de hasta Gs. 80.000.000)', 'De 20.000 a 80.000 G. en forma mensual', payable monthly or quarterly, annual sworn return in February (Form 502). An agency (Ecovis) describes four quarterly instalments of G 60,000–240,000, which is the same scale per quarter. Sole proprietorships only — not an EAS or SRL. This is the closest Paraguayan analogue to Brazil's MEI, but it is not the same thing."
  },
  "business.eas": {
    "key": "business.eas",
    "label": "EAS — simplified joint-stock company",
    "title": {
      "en": "EAS — simplified joint-stock company",
      "es": "EAS — Empresa por Acciones Simplificadas",
      "pt": "EAS — Empresa por Ações Simplificada",
      "sv": "EAS — förenklat aktiebolag"
    },
    "display": {
      "en": "the EAS (Empresa por Acciones Simplificadas, Ley 6480/2020) can have a single shareholder, an individual or a company, and is formed online through SUACE at the Ministry of Industry and Commerce",
      "es": "la EAS (Empresa por Acciones Simplificadas, Ley 6480/2020) puede tener un único accionista, persona física o jurídica, y se constituye en línea a través del SUACE del Ministerio de Industria y Comercio",
      "pt": "a EAS (Empresa por Acciones Simplificadas, Lei 6480/2020) pode ter um único acionista, pessoa física ou jurídica, e é constituída on-line pelo SUACE, do Ministério da Indústria e Comércio",
      "sv": "EAS (Empresa por Acciones Simplificadas, lag 6480/2020) kan ha en enda aktieägare, fysisk eller juridisk person, och bildas digitalt via SUACE hos industri- och handelsministeriet"
    },
    "hedged": {
      "en": "a simplified company form that one person can set up, registered through the government's company-opening system — your lawyer confirms whether it fits your case",
      "es": "una forma societaria simplificada que puede constituir una sola persona, registrada a través del sistema estatal de apertura de empresas — tu abogado confirma si encaja en tu caso",
      "pt": "um tipo societário simplificado que uma pessoa sozinha pode abrir, registrado pelo sistema oficial de abertura de empresas — o advogado confirma se ele serve para o seu caso",
      "sv": "en förenklad bolagsform som en enda person kan bilda, registrerad via statens system för bolagsbildning — din jurist bekräftar om den passar ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6480/2020 (EAS); SUACE — preguntas frecuentes EAS",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/9100/ley-n-6480-crea-la-empresa-por-acciones-simplificadas-eas"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/9100/ley-n-6480-crea-la-empresa-por-acciones-simplificadas-eas",
      "https://suace.gov.py/index.php/preguntas-frecuentes-2/",
      "https://eas.mic.gov.py/Preguntas-frecuentes",
      "https://www.vouga.com.py/en/el-poder-ejecutivo-promulgo-la-ley-6480-20-que-crea-la-empresa-por-acciones-simplificadas/"
    ],
    "note": "Research 2026-09-28 (high confidence on the law; BACN page from search excerpt): one or more natural or legal persons; a single-person EAS must carry 'Unipersonal' in its name and cannot own another single-person EAS; always commercial in nature; opened through SUACE (MIC), regulated by Decreto 3998/2020. Minimum capital, foreign-shareholder paperwork and the local legal-representative question were NOT researched — do not publish a figure or a rule on those without the lawyer."
  },
  "temporary.precarious_status": {
    "key": "temporary.precarious_status",
    "label": "Temporary residency — 'residente precario' status while the file is processed",
    "title": {
      "en": "Temporary residency — status while the file is processed",
      "es": "Residencia temporal — condición de residente precario durante el trámite",
      "pt": "Residência temporária — condição de residente precário durante o trâmite",
      "sv": "Tillfälligt uppehållstillstånd — status medan ansökan handläggs"
    },
    "display": {
      "en": "while the temporary residency application is processed you hold 'residente precario' status, which lets you leave and re-enter the country, study and work",
      "es": "mientras dura el trámite de la residencia temporal tienes la condición de residente precario, que te habilita a salir y reingresar al país, estudiar y trabajar",
      "pt": "enquanto a residência temporária está em trâmite, você tem a condição de residente precário, que permite sair e voltar ao país, estudar e trabalhar",
      "sv": "medan ansökan om tillfälligt uppehållstillstånd handläggs har du status som 'residente precario', som ger rätt att resa ut och in, studera och arbeta"
    },
    "hedged": {
      "en": "an interim status while your file is processed, whose exact rights we confirm for your case",
      "es": "una condición provisoria mientras se tramita tu expediente, cuyos derechos exactos confirmamos para tu caso",
      "pt": "uma condição provisória enquanto o seu processo tramita, cujos direitos exatos confirmamos para o seu caso",
      "sv": "en tillfällig status medan ditt ärende handläggs, vars exakta rättigheter vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — Residencia Temporal (Ley 6984/2022); Agencia IP, 4 May 2026",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/residencia-temporal/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-temporal/",
      "https://www.ip.gov.py/ip/2026/05/04/migraciones-detalla-requisitos-y-procedimientos-para-la-residencia-temporal-en-paraguay/",
      "https://paraguaysovereign.com/residency/resident-precaria-explained/"
    ],
    "note": "Research 2026-09-28 (high confidence on the rights, DNM page fetched): 'residente precario' lasts 'mientras dure el trámite' and 'lo habilita a salir y reingresar del país, estudiar y trabajar'. An agency (Paraguay Sovereign) says the precario card is valid 90 days, issued once and not renewable; the DNM page does not print a day count, so that is NOT in display. Owner: confirm the card's validity window before publishing a number."
  },
  "fx.brl_reference_rate": {
    "key": "fx.brl_reference_rate",
    "label": "Reference rate for Brazilian real conversions",
    "title": {
      "en": "Reference rate for Brazilian real conversions",
      "es": "Tipo de cambio de referencia para conversiones a reales",
      "pt": "Câmbio de referência para conversões em reais",
      "sv": "Referenskurs för omräkning till brasilianska real"
    },
    "display": {
      "en": "about R$ 5.20 per US dollar and G 1,130 per real (late September 2026)",
      "es": "unos R$ 5,20 por dólar y G 1.130 por real (finales de septiembre de 2026)",
      "pt": "cerca de R$ 5,20 por dólar e G 1.130 por real (final de setembro de 2026)",
      "sv": "cirka R$ 5,20 per US-dollar och G 1 130 per real (slutet av september 2026)"
    },
    "hedged": {
      "en": "the current real exchange rate, which we confirm on the day you pay",
      "es": "el tipo de cambio del real vigente, que confirmamos el día del pago",
      "pt": "o câmbio do real no dia, que confirmamos quando você for pagar",
      "sv": "den aktuella kursen för real, som vi bekräftar den dag du betalar"
    },
    "verified": false,
    "sourced": {
      "label": "InfoMoney (dólar comercial, 25 Sep 2026); ABC Color cotizaciones (28 Sep 2026)",
      "checkedOn": "2026-09-28",
      "url": "https://www.infomoney.com.br/mercados/dolar-hoje-abertura-fechamento-comercial-turismo-25092026/"
    },
    "sources": [
      "https://www.infomoney.com.br/mercados/dolar-hoje-abertura-fechamento-comercial-turismo-25092026/",
      "https://www.abc.com.py/cotizaciones/"
    ],
    "note": "Research 2026-09-28 (medium confidence): USD/BRL closed R$ 5.1834 on 25 Sep 2026 and traded ~R$ 5.20 on 28 Sep. ABC Color (Banco Atlas) 28 Sep 2026: real buy G 1,080 / sell G 1,190; dollar buy G 5,780 / sell G 6,070. G 5,870 ÷ 5.19 ≈ G 1,131 per real. Moves daily — re-check with fx.reference_rate."
  },
  "fees.residency_brl": {
    "key": "fees.residency_brl",
    "label": "DNM residency fee converted to Brazilian reais",
    "title": {
      "en": "DNM residency fee in Brazilian reais",
      "es": "Tasa de Migraciones de residencia en reales",
      "pt": "Taxa da Migração para residência, em reais",
      "sv": "Migrationsavgiften för uppehållstillstånd i real"
    },
    "display": {
      "en": "about R$ 2,600 per person for temporary or for permanent residency (G 2,926,925 at the late-September 2026 rate)",
      "es": "unos R$ 2.600 por persona para la temporal o para la permanente (G 2.926.925 al cambio de finales de septiembre de 2026)",
      "pt": "cerca de R$ 2.600 por pessoa na temporária ou na permanente (G 2.926.925 ao câmbio do fim de setembro de 2026)",
      "sv": "cirka R$ 2 600 per person för tillfälligt eller permanent uppehållstillstånd (G 2 926 925 till kursen i slutet av september 2026)"
    },
    "hedged": {
      "en": "a government fee in guaraníes whose value in reais we confirm on the day you pay",
      "es": "una tasa oficial en guaraníes cuyo valor en reales confirmamos el día del pago",
      "pt": "uma taxa oficial em guaranis cujo valor em reais confirmamos no dia do pagamento",
      "sv": "en myndighetsavgift i guaraní vars värde i real vi bekräftar den dag du betalar"
    },
    "verified": false,
    "sourced": {
      "label": "DNM aranceles from 1 Jul 2026 (Res. DNM 478/2026), converted at InfoMoney/ABC rates of 25–28 Sep 2026",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/aranceles-migratorios/"
    },
    "sources": [
      "https://migraciones.gov.py/aranceles-migratorios/",
      "https://www.infomoney.com.br/mercados/dolar-hoje-abertura-fechamento-comercial-turismo-25092026/",
      "https://www.abc.com.py/cotizaciones/"
    ],
    "note": "Derived 2026-09-28 (medium confidence): fees.temporary_residency / fees.permanent_residency (25 jornales = G 2,926,925) ÷ ~G 1,131 per real = R$ 2,588; USD ~500 × R$ 5.19 = R$ 2,595. Rounded to R$ 2,600. Goes stale with every jornal adjustment (July) and with the exchange rate."
  },
  "citizenship.multiple_nationality": {
    "key": "citizenship.multiple_nationality",
    "label": "Multiple nationality — constitutional rule",
    "title": {
      "en": "Multiple nationality — constitutional rule",
      "es": "Nacionalidad múltiple — regla constitucional",
      "pt": "Nacionalidade múltipla — regra constitucional",
      "sv": "Flerfaldigt medborgarskap — grundlagens regel"
    },
    "display": {
      "en": "the Paraguayan Constitution admits multiple nationality through an international treaty with reciprocity between the country of origin and the country of adoption (art. 149, regulated by Ley 7052/2023)",
      "es": "la Constitución paraguaya admite la nacionalidad múltiple mediante tratado internacional con reciprocidad entre el Estado de origen y el de adopción (art. 149, reglamentado por la Ley 7052/2023)",
      "pt": "a Constituição paraguaia admite a nacionalidade múltipla por tratado internacional com reciprocidade entre o país de origem e o de adoção (art. 149, regulamentado pela Lei 7052/2023)",
      "sv": "Paraguays grundlag tillåter flerfaldigt medborgarskap genom internationellt avtal med ömsesidighet mellan ursprungsland och adoptivland (art. 149, reglerad av lag 7052/2023)"
    },
    "hedged": {
      "en": "whether you can keep your original nationality depends on rules in both countries, which we confirm with a lawyer for your case",
      "es": "si puedes conservar tu nacionalidad de origen depende de las normas de ambos países, que confirmamos con un abogado para tu caso",
      "pt": "se você pode manter a nacionalidade de origem depende das regras dos dois países, que confirmamos com advogado para o seu caso",
      "sv": "om du kan behålla ditt ursprungliga medborgarskap beror på reglerna i båda länderna, vilket vi bekräftar med en jurist för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional, art. 149; Ley 7052/2023 (BACN)",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/11258/ley-n-7052-reglamenta-los-articulos-146-147-y-149-de-la-constitucion-nacional-de-la-nacionalidad-paraguaya-multiple"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/11258/ley-n-7052-reglamenta-los-articulos-146-147-y-149-de-la-constitucion-nacional-de-la-nacionalidad-paraguaya-multiple",
      "https://www.abc.com.py/politica/2023/01/13/rige-ley-que-garantiza-la-nacionalidad-multiple-a-los-paraguayos/",
      "https://www.pj.gov.py/ebook/monografias/nacional/internacional-p%C3%BAblico/Hugo-E-Estigarribia-G-Doble-o-Multiple-Nacionalidad.pdf"
    ],
    "note": "Research 2026-09-28 (medium confidence): art. 149 text confirmed via several excerpts; BACN page returned 403 to the fetcher. Ley 7052 (promulgated 12 Jan 2023) is mainly about natural-born Paraguayans keeping their nationality abroad. Whether a Brazilian naturalised in Paraguay must renounce Brazilian nationality in Paraguay's eyes was NOT confirmed — lawyer to confirm. Brazil side (EC 131/2023: loss only on express request) is hedged in prose, not here."
  },
  // end residenciapt W6-A
  // residenciaes W6-B (2026-09-28): figures for the new .es articles, researched on the web.
  "tax.spain_treaty": {
    "key": "tax.spain_treaty",
    "label": "Spain–Paraguay double tax treaty — status and dates",
    "title": {
      "en": "Spain–Paraguay double tax treaty",
      "es": "Convenio España–Paraguay para evitar la doble imposición",
      "pt": "Convenção Espanha–Paraguai para evitar a dupla tributação",
      "sv": "Dubbelbeskattningsavtalet Spanien–Paraguay"
    },
    "display": {
      "en": "the Spain–Paraguay income tax treaty, signed on 25 March 2023 (Paraguayan Law 7271/2024), in force since 14 October 2024 and applying to tax years starting on or after 1 January 2025",
      "es": "el Convenio entre España y Paraguay para evitar la doble imposición, firmado el 25 de marzo de 2023 (Ley paraguaya 7271/2024), en vigor desde el 14 de octubre de 2024 y aplicable a los ejercicios que empiezan desde el 1 de enero de 2025",
      "pt": "a convenção entre Espanha e Paraguai para evitar a dupla tributação, assinada em 25 de março de 2023 (Lei paraguaia 7271/2024), em vigor desde 14 de outubro de 2024 e aplicável aos exercícios iniciados a partir de 1º de janeiro de 2025",
      "sv": "dubbelbeskattningsavtalet mellan Spanien och Paraguay, undertecknat den 25 mars 2023 (paraguayansk lag 7271/2024), i kraft sedan den 14 oktober 2024 och tillämpligt på beskattningsår som börjar från och med den 1 januari 2025"
    },
    "hedged": {
      "en": "a double tax treaty between Spain and Paraguay, whose effect on your case your adviser confirms",
      "es": "un convenio para evitar la doble imposición entre España y Paraguay, cuyo efecto en tu caso confirma tu asesor",
      "pt": "uma convenção para evitar a dupla tributação entre Espanha e Paraguai, cujo efeito no seu caso o seu contador confirma",
      "sv": "ett dubbelbeskattningsavtal mellan Spanien och Paraguay, vars betydelse för ditt fall din rådgivare bekräftar"
    },
    "verified": false,
    "sourced": {
      "label": "BOE-A-2024-15573 (BOE, 29 jul 2024); Ley paraguaya 7271/2024",
      "checkedOn": "2026-09-28",
      "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-15573"
    },
    "sources": [
      "https://www.boe.es/buscar/doc.php?id=BOE-A-2024-15573",
      "https://sede.agenciatributaria.gob.es/Sede/normativa-criterios-interpretativos/fiscalidad-internacional/convenios-doble-imposicion-firmados-espana/paraguay.html",
      "https://www.amaral.com.py/es/convenio-para-evitar-la-doble-imposicion-cdi-entre-paraguay-y-espana-aprobado-por-ley-n-7271-2024-una-oportunidad-para-empresas-e-inversionistas-n5"
    ],
    "note": "Research 2026-09-28 (high confidence): BOE text: signed Santo Domingo 25 Mar 2023, published BOE 29 Jul 2024, 'entrará en vigor el 14 de octubre de 2024'; art. 27.2.a applies it to tax years starting from 1 Jan of the following year (2025). Art. 4.2 tie-breaker: permanent home, centre of vital interests, habitual abode, nationality, mutual agreement. Private pensions (art. 17) taxed only in the state of residence; government pensions (art. 18) in the paying state as a rule. Same research: Paraguay is NOT on Spain's list of jurisdicciones no cooperativas (Orden HFP/115/2023 as amended by Orden HAC/649/2026, BOE-A-2026-13946)."
  },
  "wages.minimum_monthly": {
    "key": "wages.minimum_monthly",
    "label": "Paraguay monthly minimum wage (private sector)",
    "title": {
      "en": "Paraguay minimum wage from July 2026",
      "es": "Salario mínimo en Paraguay desde julio de 2026",
      "pt": "Salário mínimo no Paraguai desde julho de 2026",
      "sv": "Minimilön i Paraguay från juli 2026"
    },
    "display": {
      "en": "G 3,044,000 a month (about USD 520) for general activities from 1 July 2026 (Decree 6225/2026)",
      "es": "G 3.044.000 al mes (unos USD 520) para actividades diversas desde el 1 de julio de 2026 (Decreto 6225/2026)",
      "pt": "G 3.044.000 por mês (cerca de USD 520) para atividades diversas desde 1º de julho de 2026 (Decreto 6225/2026)",
      "sv": "G 3 044 000 i månaden (cirka USD 520) för allmänna verksamheter från den 1 juli 2026 (dekret 6225/2026)"
    },
    "hedged": {
      "en": "the current legal minimum wage, which we confirm for your case",
      "es": "el salario mínimo legal vigente, que te confirmamos para tu caso",
      "pt": "o salário mínimo legal vigente, que confirmamos para o seu caso",
      "sv": "den gällande lagstadgade minimilönen, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Decreto N.º 6225/2026 (reajuste del salario mínimo, desde el 1 jul 2026)",
      "checkedOn": "2026-09-28",
      "url": "https://www.vouga.com.py/wp-content/uploads/2026/06/Decreto-6225.pdf"
    },
    "sources": [
      "https://www.vouga.com.py/wp-content/uploads/2026/06/Decreto-6225.pdf",
      "https://www.vouga.com.py/en/decreto-n-6225-2026-reajuste-del-salario-minimo-legal-para-el-sector-privado/",
      "https://www.hoy.com.py/nacionales/2026/07/08/oficializan-nuevo-salario-minimo-desde-este-fin-de-mes-se-debe-percibir-gs-3044000"
    ],
    "note": "Research 2026-09-28 (high confidence): G 3.044.000 monthly and G 117.077 daily jornal (same jornal as fees.basis), +5% over Decreto 4122/2025, in force 1 Jul 2026. USD at fx.reference_rate (~G 5.870)."
  },
  "company.eas": {
    "key": "company.eas",
    "label": "EAS (simplified company) — how it is formed",
    "title": {
      "en": "EAS simplified company (Law 6480/2020)",
      "es": "Empresa por Acciones Simplificadas (EAS, Ley 6480/2020)",
      "pt": "Empresa por Ações Simplificadas (EAS, Lei 6480/2020)",
      "sv": "Förenklat aktiebolag EAS (lag 6480/2020)"
    },
    "display": {
      "en": "an EAS (Law 6480/2020) is formed online through SUACE by one or more shareholders with no legal minimum capital, in about 72 hours with the model by-laws (up to 8 business days with custom ones); its main legal representative must hold Paraguayan nationality or a Paraguayan cédula",
      "es": "la EAS (Ley 6480/2020) se constituye en línea por el SUACE, con uno o más accionistas y sin capital mínimo legal, en unas 72 horas con el estatuto modelo (hasta 8 días hábiles con estatuto propio); su representante legal principal debe tener nacionalidad o cédula paraguaya",
      "pt": "a EAS (Lei 6480/2020) é constituída on-line pelo SUACE, com um ou mais acionistas e sem capital mínimo legal, em cerca de 72 horas com o estatuto-modelo (até 8 dias úteis com estatuto próprio); o representante legal principal deve ter nacionalidade ou cédula paraguaia",
      "sv": "ett EAS (lag 6480/2020) bildas digitalt via SUACE av en eller flera aktieägare utan lagstadgat minimikapital, på cirka 72 timmar med standardstadgar (upp till 8 arbetsdagar med egna stadgar); den huvudsakliga företrädaren måste ha paraguayanskt medborgarskap eller paraguayansk cédula"
    },
    "hedged": {
      "en": "a simplified company formed online, with the requirements for your shareholders and legal representative confirmed for your case",
      "es": "una sociedad simplificada que se constituye en línea, con los requisitos para tus accionistas y tu representante legal confirmados para tu caso",
      "pt": "uma sociedade simplificada constituída on-line, com os requisitos para acionistas e representante legal confirmados para o seu caso",
      "sv": "ett förenklat bolag som bildas digitalt, där kraven på aktieägare och företrädare bekräftas för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MIC, EAS – Preguntas frecuentes (Ley 6480/2020, Decreto 3998/2020)",
      "checkedOn": "2026-09-28",
      "url": "https://eas.mic.gov.py/Preguntas-frecuentes"
    },
    "sources": [
      "https://eas.mic.gov.py/Preguntas-frecuentes",
      "https://www.bacn.gov.py/leyes-paraguayas/9100/ley-n-6480-crea-la-empresa-por-acciones-simplificadas-eas",
      "https://baselegal.com.py/docs/22da4ff1-0a27-11eb-82fb-525400c761ca"
    ],
    "note": "Research 2026-09-28 (high confidence, official MIC FAQ): foreign shareholders sign with a Paraguayan cédula/permanent-residence card or through an apostilled power of attorney; shareholders need not be resident; 'no se requiere de un capital mínimo'. The FAQ quotes no fee, so no cost is published."
  },
  "property.border_zone": {
    "key": "property.border_zone",
    "label": "Border security zone — rural land and foreigners from neighbouring countries",
    "title": {
      "en": "Border security zone (Law 2532/2005)",
      "es": "Zona de seguridad fronteriza (Ley 2532/2005)",
      "pt": "Zona de segurança de fronteira (Lei 2532/2005)",
      "sv": "Gränssäkerhetszonen (lag 2532/2005)"
    },
    "display": {
      "en": "within the 50 km border security strip along land and river borders, nationals of neighbouring countries (Argentina, Brazil, Bolivia) cannot own rural property unless authorised by decree (Law 2532/2005); urban property is not affected",
      "es": "en la franja de seguridad fronteriza de 50 km junto a las fronteras terrestres y fluviales, los extranjeros de países limítrofes (Argentina, Brasil y Bolivia) no pueden ser propietarios de inmuebles rurales salvo autorización por decreto (Ley 2532/2005); no afecta a los inmuebles urbanos",
      "pt": "na faixa de segurança de fronteira de 50 km junto às fronteiras terrestres e fluviais, estrangeiros de países limítrofes (Argentina, Brasil e Bolívia) não podem ser proprietários de imóveis rurais salvo autorização por decreto (Lei 2532/2005); imóveis urbanos não são afetados",
      "sv": "inom den 50 km breda gränssäkerhetszonen längs land- och flodgränser får medborgare i grannländerna (Argentina, Brasilien, Bolivia) inte äga landsbygdsfastigheter utan tillstånd genom dekret (lag 2532/2005); stadsfastigheter berörs inte"
    },
    "hedged": {
      "en": "a border security zone with limits on rural property for some nationalities, which we check for the plot you are looking at",
      "es": "una zona de seguridad fronteriza con límites a la propiedad rural para algunas nacionalidades, que revisamos para el inmueble que te interesa",
      "pt": "uma zona de segurança de fronteira com limites à propriedade rural para algumas nacionalidades, que verificamos para o imóvel que interessa a você",
      "sv": "en gränssäkerhetszon med begränsningar för landsbygdsfastigheter för vissa nationaliteter, som vi kontrollerar för den fastighet du tittar på"
    },
    "verified": false,
    "sourced": {
      "label": "Ley N.º 2532/2005 (zona de seguridad fronteriza), BACN",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/4025/ley-n-2532-establece-la-zona-de-seguridad-fronteriza-de-la-republica-del-paraguay"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/4025/ley-n-2532-establece-la-zona-de-seguridad-fronteriza-de-la-republica-del-paraguay",
      "https://www.bacn.gov.py/leyes-paraguayas/4202/ley-n-2647-modifica-el-articulo-3-de-la-ley-n-2532-del-17-de-febrero-de-2005-que-establece-la-zona-de-seguridad-fronteriza-de-la-republica-del-paraguay",
      "https://ghp.com.py/2019/06/18/interpretando-la-ley-de-seguridad-fronteriza-del-paraguay/"
    ],
    "note": "Research 2026-09-28 (high confidence): art. 1 sets the 50 km strip; art. 2 bars nationals of bordering countries (and entities mainly owned by them) from owning, co-owning or holding usufruct of rural property there, save executive decree for public-interest reasons. Acquired rights and inheritance are protected. Art. 3 amended by Ley 2647/2005. Spaniards and other non-neighbouring nationals are not covered by art. 2."
  },
  "property.annual_tax": {
    "key": "property.annual_tax",
    "label": "Impuesto inmobiliario — annual property tax",
    "title": {
      "en": "Annual property tax (impuesto inmobiliario)",
      "es": "Impuesto inmobiliario anual",
      "pt": "Imposto imobiliário anual",
      "sv": "Årlig fastighetsskatt (impuesto inmobiliario)"
    },
    "display": {
      "en": "1% a year of the property's fiscal (not market) value, collected by the municipality; fiscal values are indexed every year (+4.1% for 2026)",
      "es": "un 1% anual sobre el valor fiscal del inmueble (no el de mercado), cobrado por la municipalidad; el valor fiscal se reajusta cada año (un 4,1% para 2026)",
      "pt": "1% ao ano sobre o valor fiscal do imóvel (não o de mercado), cobrado pelo município; o valor fiscal é reajustado todo ano (+4,1% para 2026)",
      "sv": "1 % per år av fastighetens taxeringsvärde (inte marknadsvärdet), som kommunen tar ut; taxeringsvärdet räknas upp varje år (+4,1 % för 2026)"
    },
    "hedged": {
      "en": "an annual municipal property tax on the fiscal value, which we estimate for the property you are looking at",
      "es": "un impuesto municipal anual sobre el valor fiscal, que estimamos para el inmueble que te interesa",
      "pt": "um imposto municipal anual sobre o valor fiscal, que estimamos para o imóvel que interessa a você",
      "sv": "en årlig kommunal fastighetsskatt på taxeringsvärdet, som vi uppskattar för den fastighet du tittar på"
    },
    "verified": false,
    "sourced": {
      "label": "ABC Color, 27 dic 2025 (Decreto 5181/2025); Ley 5513/2015",
      "checkedOn": "2026-09-28",
      "url": "https://www.abc.com.py/economia/2025/12/27/ejecutivo-ajusto-41-el-valor-fiscal-para-impuesto-inmobiliario-de-2026/"
    },
    "sources": [
      "https://www.abc.com.py/economia/2025/12/27/ejecutivo-ajusto-41-el-valor-fiscal-para-impuesto-inmobiliario-de-2026/",
      "https://www.bacn.gov.py/leyes-paraguayas/4492/ley-n-5513-modifica-los-articulos-60-62-66-70-y-74-de-la-ley-n-12591-que-establece-el-nuevo-regimen-tributario-y-los-articulos-155-y-179-de-la-ley-n-396610-organica-municipal",
      "https://www.mersanlaw.com/novedades/paraguay-actualiza-valores-fiscales-inmobiliarios-para-2026/"
    ],
    "note": "Research 2026-09-28 (medium-high confidence): rate 1% of valor fiscal, urban and rural; fiscal values set per district and indexed by CPI each year (Decreto 5181/2025: +4.1% for 2026). Reduced rates for small rural holdings exist in Ley 125/91 and are not published here."
  },
  "ips.contributions": {
    "key": "ips.contributions",
    "label": "IPS social security contributions (employees)",
    "title": {
      "en": "IPS social security contributions",
      "es": "Aportes al IPS (seguro social)",
      "pt": "Contribuições ao IPS (seguridade social)",
      "sv": "Avgifter till IPS (socialförsäkring)"
    },
    "display": {
      "en": "25.5% of salary: 9% paid by the employee and 16.5% by the employer, with the minimum wage as the floor",
      "es": "un 25,5% del salario: 9% a cargo del trabajador y 16,5% a cargo del empleador, con el salario mínimo como base mínima",
      "pt": "25,5% do salário: 9% pagos pelo trabalhador e 16,5% pelo empregador, com o salário mínimo como base mínima",
      "sv": "25,5 % av lönen: 9 % betalas av den anställda och 16,5 % av arbetsgivaren, med minimilönen som lägsta underlag"
    },
    "hedged": {
      "en": "the IPS contribution split between employee and employer, which we confirm for your case",
      "es": "el reparto de aportes al IPS entre trabajador y empleador, que te confirmamos para tu caso",
      "pt": "a divisão das contribuições ao IPS entre trabalhador e empregador, que confirmamos para o seu caso",
      "sv": "fördelningen av IPS-avgifter mellan anställd och arbetsgivare, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "MTESS / IPS, régimen de aporte obrero-patronal (Ley 213/93)",
      "checkedOn": "2026-09-28",
      "url": "https://www.mtess.gov.py/?p=7713"
    },
    "sources": [
      "https://www.mtess.gov.py/?p=7713",
      "https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?e=12",
      "https://www.deel.com/es/blog/aportes-ips-en-paraguay/"
    ],
    "note": "Research 2026-09-28 (high confidence on 9%/16.5%; the 2021 transitional 2.5% employer rate for some sectors has lapsed): IPS covers salaried employees; the self-employed are not compulsorily covered (voluntary schemes exist)."
  },
  "socialsecurity.spain_agreement": {
    "key": "socialsecurity.spain_agreement",
    "label": "Spain–Paraguay social security agreement",
    "title": {
      "en": "Spain–Paraguay social security agreement",
      "es": "Convenio de Seguridad Social España–Paraguay",
      "pt": "Convênio de Seguridade Social Espanha–Paraguai",
      "sv": "Socialförsäkringsavtalet Spanien–Paraguay"
    },
    "display": {
      "en": "a bilateral Spain–Paraguay social security agreement in force since 2006 (administrative arrangement of 2016) that lets contribution periods in both countries count towards contributory pensions; both also apply the Ibero-American Multilateral Agreement",
      "es": "un convenio bilateral de Seguridad Social entre España y Paraguay, en vigor desde 2006 (con acuerdo administrativo de 2016), que permite sumar los periodos cotizados en ambos países para las pensiones contributivas; los dos aplican además el Convenio Multilateral Iberoamericano",
      "pt": "um convênio bilateral de seguridade social entre Espanha e Paraguai, em vigor desde 2006 (com acordo administrativo de 2016), que permite somar os períodos de contribuição nos dois países para as aposentadorias contributivas; ambos aplicam também o Convênio Multilateral Ibero-americano",
      "sv": "ett bilateralt socialförsäkringsavtal mellan Spanien och Paraguay, i kraft sedan 2006 (med ett administrativt avtal från 2016), som låter avgiftsperioder i båda länderna räknas samman för avgiftsbaserade pensioner; båda tillämpar också det iberoamerikanska multilaterala avtalet"
    },
    "hedged": {
      "en": "a social security agreement between Spain and Paraguay, whose effect on your pension the INSS confirms",
      "es": "un convenio de Seguridad Social entre España y Paraguay, cuyo efecto en tu pensión confirma el INSS",
      "pt": "um convênio de seguridade social entre Espanha e Paraguai, cujo efeito na sua aposentadoria o INSS espanhol confirma",
      "sv": "ett socialförsäkringsavtal mellan Spanien och Paraguay, vars betydelse för din pension INSS bekräftar"
    },
    "verified": false,
    "sourced": {
      "label": "BOE-A-2006-1619 (Convenio de Seguridad Social España–Paraguay); BOE-A-2017-687",
      "checkedOn": "2026-09-28",
      "url": "https://www.boe.es/buscar/doc.php?id=BOE-A-2006-1619"
    },
    "sources": [
      "https://www.boe.es/buscar/doc.php?id=BOE-A-2006-1619",
      "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2017-687",
      "https://oiss.org/paraguay-se-incorpora-a-la/"
    ],
    "note": "Research 2026-09-28 (high confidence): signed Asunción 24 Jun 1998 (Paraguayan Ley 1468/1999), in force March 2006; administrative agreement Madrid 15 Sep 2016 (BOE 2017). Paraguay's IPS does not compulsorily cover the self-employed, so Spanish autónomo periods count on the Spanish side only. Pension payment abroad and the annual fe de vida are INSS rules, hedged in prose."
  },
  "apostille.since": {
    "key": "apostille.since",
    "label": "Apostille — Paraguay's membership",
    "title": {
      "en": "Apostille — Paraguay's membership",
      "es": "Apostilla — membresía de Paraguay",
      "pt": "Apostila — adesão do Paraguai",
      "sv": "Apostille — Paraguays medlemskap"
    },
    "display": {
      "en": "a member of the Hague Apostille Convention since 30 August 2014",
      "es": "miembro del Convenio de la Apostilla de La Haya desde el 30 de agosto de 2014",
      "pt": "membro da Convenção da Apostila de Haia desde 30 de agosto de 2014",
      "sv": "ansluten till Haagkonventionen om apostille sedan den 30 augusti 2014"
    },
    "hedged": {
      "en": "the date Paraguay joined the Apostille Convention, which we confirm for your case",
      "es": "la fecha en que Paraguay se adhirió al Convenio de la Apostilla, que confirmamos para tu caso",
      "pt": "a data em que o Paraguai aderiu à Convenção da Apostila, que confirmamos para o seu caso",
      "sv": "det datum då Paraguay anslöt sig till apostillekonventionen, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "HCCH status table / news (accession deposited 10 Dec 2013)",
      "checkedOn": "2026-09-26",
      "url": "https://www.hcch.net/en/news-archive/details/?varevent=342"
    },
    "sources": [
      "https://www.hcch.net/en/news-archive/details/?varevent=342",
      "https://www.hcch.net/en/instruments/conventions/status-table/print/?cid=41",
      "https://irglobal.com/article/the-apostille-convenion-becomes-effective-in-august-2014-in-paraguay-4667/"
    ],
    "note": "Research 2026-09-26 (high confidence): Germany had objected; the Convention only applied between Germany and Paraguay from 6 Jan 2022. Non-Hague countries still need consular legalisation."
  },
  "citizenship.years": {
    "key": "citizenship.years",
    "label": "Naturalisation — residence required",
    "title": {
      "en": "Naturalisation — residence required",
      "es": "Naturalización — residencia requerida",
      "pt": "Naturalização — residência exigida",
      "sv": "Naturalisation — krävd bosättningstid"
    },
    "display": {
      "en": "at least 3 years of permanent residency, counted from the date of the permanent residency resolution",
      "es": "al menos 3 años de residencia permanente, contados desde la fecha de la resolución de residencia permanente",
      "pt": "pelo menos 3 anos de residência permanente, contados a partir da data da resolução de residência permanente",
      "sv": "minst 3 års permanent uppehållstillstånd, räknat från datumet för beslutet om permanent uppehållstillstånd"
    },
    "hedged": {
      "en": "a minimum length of permanent residency we confirm for your case",
      "es": "un tiempo mínimo de residencia permanente que te confirmamos para tu caso",
      "pt": "um tempo mínimo de residência permanente que confirmamos para o seu caso",
      "sv": "en minsta tid med permanent uppehållstillstånd som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional, art. 148; Poder Judicial — Carta de Naturalización",
      "checkedOn": "2026-09-26",
      "url": "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463"
    },
    "sources": [
      "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463",
      "https://embapar.jp/archivos/nacionalidad-paraguaya/",
      "https://www.diputados.gov.py/noticias/noticias/283"
    ],
    "note": "Research 2026-09-26 (high confidence): Art. 148: adult, min. 3 years' residence, lawful occupation, good conduct. Judicial process (Corte Suprema). Paraguay does not generally allow dual nationality for naturalised citizens except by treaty (e.g. Spain, Italy) — not researched in depth; owner should confirm before publishing any dual-citizenship claim. Language and presence tests in practice not researched."
  },
  // residenciapt W6-B — added 2026-09-28 for the vidanoparaguai.com life, cities, car and land pages.
  "land.border_security_zone": {
    "key": "land.border_security_zone",
    "label": "Border security zone — rural land owned by foreigners from neighbouring countries",
    "title": {
      "en": "Border security zone — rural land and neighbouring-country nationals",
      "es": "Zona de seguridad fronteriza — inmuebles rurales y extranjeros de países limítrofes",
      "pt": "Zona de segurança de fronteira — imóvel rural e estrangeiros de países vizinhos",
      "sv": "Gränssäkerhetszonen — landsbygdsmark och medborgare i grannländer"
    },
    "display": {
      "en": "a 50 km strip along Paraguay's land and river borders in which nationals of neighbouring countries (Brazil included), and companies they mostly own, may not own, co-own or hold usufruct over rural property, unless the Executive authorises it by decree (Law 2532/2005)",
      "es": "una franja de 50 km a lo largo de las fronteras terrestres y fluviales en la que los extranjeros de países limítrofes (Brasil incluido), y las empresas integradas mayoritariamente por ellos, no pueden ser propietarios, condóminos ni usufructuarios de inmuebles rurales, salvo autorización por decreto del Poder Ejecutivo (Ley 2532/2005)",
      "pt": "uma faixa de 50 km ao longo das fronteiras terrestres e fluviais em que estrangeiros de países vizinhos (Brasil incluído), e empresas formadas majoritariamente por eles, não podem ser donos, condôminos nem usufrutuários de imóvel rural, salvo autorização por decreto do Poder Executivo (Lei 2.532/2005)",
      "sv": "en 50 km bred zon längs Paraguays land- och flodgränser där medborgare i grannländer (Brasilien inräknat), och bolag som de till största delen äger, inte får äga, samäga eller ha nyttjanderätt till landsbygdsfastigheter, om inte regeringen ger tillstånd genom dekret (lag 2532/2005)"
    },
    "hedged": {
      "en": "a restriction on rural land near the border for nationals of neighbouring countries, which we check for your case and your plot",
      "es": "una restricción sobre inmuebles rurales cerca de la frontera para extranjeros de países limítrofes, que revisamos para tu caso y tu terreno",
      "pt": "uma restrição à compra de imóvel rural perto da fronteira por estrangeiros de países vizinhos, que conferimos para o seu caso e o seu terreno",
      "sv": "en begränsning för medborgare i grannländer att äga landsbygdsmark nära gränsen, som vi kontrollerar för ditt fall och din tomt"
    },
    "verified": false,
    "sourced": {
      "label": "Ley N.º 2532/2005, Zona de Seguridad Fronteriza (BACN, Congreso Nacional)",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/4025/ley-n-2532-establece-la-zona-de-seguridad-fronteriza-de-la-republica-del-paraguay"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/4025/ley-n-2532-establece-la-zona-de-seguridad-fronteriza-de-la-republica-del-paraguay",
      "https://www.catastro.gov.py/public/439bc5_ley%202532-05%20seguridad%20fronteriza.pdf",
      "https://ghp.com.py/2019/06/18/interpretando-la-ley-de-seguridad-fronteriza-del-paraguay/"
    ],
    "note": "Research 2026-09-28 (high confidence): Art. 1 sets the 50 km strip; Art. 2 bars nationals of bordering countries (and legal persons mostly made up of them) from owning, co-owning or holding usufruct over RURAL property there, save a decree of the Executive on public-interest grounds (job creation counts). Urban property is not covered. Rights acquired before the law are kept. Regulated by Decreto 7525/2011. bacn.gov.py returned 403 to the fetcher; wording confirmed from the search excerpt of the official text and GHP Abogados' commentary."
  },
  "vehicles.used_import_age": {
    "key": "vehicles.used_import_age",
    "label": "Used vehicle imports — maximum age",
    "title": {
      "en": "Used vehicle imports — maximum age",
      "es": "Importación de vehículos usados — antigüedad máxima",
      "pt": "Importação de veículo usado — idade máxima",
      "sv": "Import av begagnade fordon — högsta ålder"
    },
    "display": {
      "en": "no more than 10 years old, counted from the year of manufacture to shipment at origin (Law 4333/2011, amending Law 2018/2002); classic cars certified by Customs are the exception",
      "es": "hasta 10 años de antigüedad, contados desde el año de fabricación hasta su despacho en origen (Ley 4333/2011, que modifica la Ley 2018/2002); la excepción son los clásicos certificados por la Aduana",
      "pt": "no máximo 10 anos de fabricação, contados do ano de fabricação até o embarque na origem (Lei 4.333/2011, que altera a Lei 2.018/2002); a exceção são os carros clássicos certificados pela Aduana",
      "sv": "högst 10 år gamla, räknat från tillverkningsåret till avsändandet i ursprungslandet (lag 4333/2011, som ändrar lag 2018/2002); undantaget är veteranbilar som tullen certifierat"
    },
    "hedged": {
      "en": "an age limit for importing a used vehicle, which we confirm with a customs broker for your car",
      "es": "un límite de antigüedad para importar un vehículo usado, que confirmamos con un despachante para tu auto",
      "pt": "um limite de idade para importar carro usado, que confirmamos com um despachante para o seu veículo",
      "sv": "en åldersgräns för import av begagnade fordon, som vi bekräftar med en tullombud för din bil"
    },
    "verified": false,
    "sourced": {
      "label": "Ley N.º 4333/2011, modifica el art. 1 de la Ley 2018/2002 (BACN, Congreso Nacional)",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/3705/modifica-el-articulo-1-de-la-ley-n-201802-que-autoriza-la-libre-importacion-de-vehiculos-maquinarias-agricolas-y-maquinarias-de-construccion-usados-modificada-por-la-ley-n-215303"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/3705/modifica-el-articulo-1-de-la-ley-n-201802-que-autoriza-la-libre-importacion-de-vehiculos-maquinarias-agricolas-y-maquinarias-de-construccion-usados-modificada-por-la-ley-n-215303",
      "https://www.ultimahora.com/ejecutivo-promulga-ley-que-fija-10-anos-la-antigedad-autos-usados-importados-n431944",
      "https://paraguayway.com/importar-vehiculo-paraguay/"
    ],
    "note": "Research 2026-09-28 (medium confidence): Ley 4333/2011 (promulgated May 2011) re-set the 10-year limit after a failed 5-year proposal. Bills to lower it (7 years, 2018) or lift it (2023) appeared in the press; a 2026 importer guide still states 10 years. Owner: confirm no later amendment with a despachante before signing off. Import duties, IVA and the resident's household-goods regime are not covered by this fact."
  },
  "customs.cash_declaration": {
    "key": "customs.cash_declaration",
    "label": "Cash carried across the border — declaration threshold",
    "title": {
      "en": "Cash at the border — declaration threshold",
      "es": "Dinero en efectivo en la frontera — umbral de declaración",
      "pt": "Dinheiro em espécie na fronteira — limite para declarar",
      "sv": "Kontanter vid gränsen — gräns för deklaration"
    },
    "display": {
      "en": "more than USD 10,000 (or the equivalent in other currencies) in cash per traveller, entering or leaving Paraguay, must be declared to Customs (Law 1015/1997); the DNIT's e-DAV form lets you declare online before the trip",
      "es": "más de USD 10.000 (o su equivalente en otras monedas) en efectivo por viajero, al entrar o salir de Paraguay, se declaran ante la Aduana (Ley 1015/1997); el formulario e-DAV de la DNIT permite hacerlo en línea antes del viaje",
      "pt": "mais de USD 10.000 (ou o equivalente em outras moedas) em espécie por viajante, na entrada ou na saída do Paraguai, precisam ser declarados à Aduana (Lei 1.015/1997); o formulário e-DAV da DNIT permite declarar on-line antes da viagem",
      "sv": "mer än USD 10 000 (eller motsvarande i annan valuta) i kontanter per resenär, vid in- eller utresa, ska deklareras för tullen (lag 1015/1997); DNIT:s e-DAV-formulär gör att du kan deklarera online före resan"
    },
    "hedged": {
      "en": "a cash amount above which you must declare to Paraguayan Customs, which we confirm before you travel",
      "es": "un monto en efectivo por encima del cual debes declararlo ante la Aduana paraguaya, que confirmamos antes de tu viaje",
      "pt": "um valor em espécie acima do qual é obrigatório declarar à Aduana paraguaia, que confirmamos antes da sua viagem",
      "sv": "ett kontantbelopp över vilket du måste deklarera för den paraguayanska tullen, som vi bekräftar före resan"
    },
    "verified": false,
    "sourced": {
      "label": "DNIT (Aduanas), control de dinero no declarado; Ley 1015/1997",
      "checkedOn": "2026-09-28",
      "url": "https://www.dnit.gov.py/en/web/portal-institucional/w/la-dnit-realiza-incautacion-de-dinero-no-declarado-en-control-fronterizo-1"
    },
    "sources": [
      "https://www.dnit.gov.py/en/web/portal-institucional/w/la-dnit-realiza-incautacion-de-dinero-no-declarado-en-control-fronterizo-1",
      "https://www.dnit.gov.py/documents/20123/1085745/Ayuda-Viajero-Declaracion-Electronica-ESP.pdf/ea112a1e-d15c-0f4f-c190-eea66d4a7b5c?t=1727195535625"
    ],
    "note": "Research 2026-09-28 (high confidence): DNIT's own notice states the USD 10,000 per-traveller threshold under Ley 1015/97, both directions. Declaring is not a tax; failing to declare leads to seizure. Brazil has its own, separate declaration (e-DBV, Receita Federal) that this fact does not cover."
  },
  "tourist.brazilian_stay": {
    "key": "tourist.brazilian_stay",
    "label": "Brazilian tourists — length of stay in Paraguay",
    "title": {
      "en": "Brazilian tourists — length of stay",
      "es": "Turistas brasileños — plazo de permanencia",
      "pt": "Turista brasileiro — prazo de permanência",
      "sv": "Brasilianska turister — vistelsens längd"
    },
    "display": {
      "en": "up to 90 days as a tourist, entering with a valid Brazilian ID card (RG) or passport, extendable once for the same period at the discretion of Migraciones",
      "es": "hasta 90 días como turista, entrando con la cédula brasileña (RG) o el pasaporte vigentes, prorrogables una vez por el mismo plazo a criterio de Migraciones",
      "pt": "até 90 dias como turista, entrando com RG ou passaporte válidos, prorrogáveis uma vez por igual período a critério da Migração paraguaia",
      "sv": "upp till 90 dagar som turist, med giltigt brasilianskt id-kort (RG) eller pass, som kan förlängas en gång med lika lång tid efter Migraciones bedömning"
    },
    "hedged": {
      "en": "a limited tourist stay for Brazilians, with the current term and extension rules confirmed for your trip",
      "es": "una estadía de turista limitada para brasileños, con el plazo y la prórroga vigentes confirmados para tu viaje",
      "pt": "uma permanência limitada como turista, com o prazo e a prorrogação vigentes confirmados para a sua viagem",
      "sv": "en begränsad turistvistelse för brasilianare, med gällande tid och förlängningsregler bekräftade för din resa"
    },
    "verified": false,
    "sourced": {
      "label": "Prefeitura de Ponta Porã, Ingresso de brasileiros no Paraguai (orientação do Consulado do Brasil)",
      "checkedOn": "2026-09-28",
      "url": "https://pontapora.ms.gov.br/v2/secretarias/secretaria-de-desenvolvimento-integrado/ingresso-de-brasileiros-no-paraguai/"
    },
    "sources": [
      "https://pontapora.ms.gov.br/v2/secretarias/secretaria-de-desenvolvimento-integrado/ingresso-de-brasileiros-no-paraguai/",
      "https://www.gov.br/mre/pt-br/consulado-assuncao/Ingresso%20Paraguai"
    ],
    "note": "Research 2026-09-28 (medium confidence): The Ponta Porã page states 'até 90 dias, prorrogáveis por igual período' with RG or passport; search excerpts of the Brazilian consulate page in Asunción add that the extension is granted once, at the DNM's discretion, and that RG entries get a separate 'boleta' stamp. The consulate page itself was CAPTCHA-walled for the fetcher. The RG must be in good condition (some guides say issued within the last 10 years) — not part of this fact."
  },
  "costofliving.monthly_family": {
    "key": "costofliving.monthly_family",
    "label": "Cost of living — family of four",
    "title": {
      "en": "Cost of living — family of four",
      "es": "Costo de vida — familia de cuatro personas",
      "pt": "Custo de vida — família de quatro pessoas",
      "sv": "Levnadskostnader — familj på fyra personer"
    },
    "display": {
      "en": "about USD 2,200 a month for a family of four before rent in Asunción (Numbeo, August 2026)",
      "es": "unos USD 2.200 al mes para una familia de cuatro, sin contar el alquiler, en Asunción (Numbeo, agosto de 2026)",
      "pt": "cerca de USD 2.200 por mês para uma família de quatro pessoas, sem contar o aluguel, em Assunção (Numbeo, agosto de 2026)",
      "sv": "cirka USD 2 200 i månaden för en familj på fyra exklusive hyra i Asunción (Numbeo, augusti 2026)"
    },
    "hedged": {
      "en": "a monthly budget estimate for a family, which we walk you through",
      "es": "una estimación de presupuesto mensual para una familia, que te explicamos",
      "pt": "uma estimativa de orçamento mensal para uma família, que explicamos para você",
      "sv": "en uppskattad månadsbudget för en familj, som vi går igenom med dig"
    },
    "verified": false,
    "sourced": {
      "label": "Numbeo, Asunción, Aug 2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.numbeo.com/cost-of-living/in/Asuncion"
    },
    "sources": [
      "https://www.numbeo.com/cost-of-living/in/Asuncion",
      "https://expatsettle.com/asuncion/cost-of-living"
    ],
    "note": "Research 2026-09-26 (medium confidence): Numbeo USD 2,242.3 (G 13,293,016); ExpatSettle USD 2,155. Crowd-sourced."
  },
  "fx.reference_rate": {
    "key": "fx.reference_rate",
    "label": "Reference exchange rate used for USD conversions",
    "title": {
      "en": "Reference exchange rate used for USD conversions",
      "es": "Tipo de cambio de referencia usado en las conversiones a USD",
      "pt": "Taxa de câmbio de referência usada nas conversões para USD",
      "sv": "Referensväxelkurs som används för USD-omräkningar"
    },
    "display": {
      "en": "about G 5,870 per US dollar (late September 2026)",
      "es": "unos G 5.870 por dólar estadounidense (finales de septiembre de 2026)",
      "pt": "cerca de G 5.870 por dólar americano (final de setembro de 2026)",
      "sv": "cirka G 5 870 per amerikansk dollar (slutet av september 2026)"
    },
    "hedged": {
      "en": "the current reference exchange rate we use, which we confirm for your case",
      "es": "el tipo de cambio de referencia actual que usamos, que confirmamos para tu caso",
      "pt": "a taxa de câmbio de referência atual que usamos, que confirmamos para o seu caso",
      "sv": "den aktuella referensväxelkursen vi använder, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "BCP reference rate / market 25 Sep 2026",
      "checkedOn": "2026-09-26",
      "url": "https://www.bcp.gov.py/webapps/web/cotizacion/referencial-fluctuante"
    },
    "sources": [
      "https://www.bcp.gov.py/webapps/web/cotizacion/referencial-fluctuante",
      "https://www.abc.com.py/cotizaciones/"
    ],
    "note": "Research 2026-09-26 (medium confidence): Market quote 25 Sep 2026: buy 5,856 / sell 5,891 (search excerpt). The guaraní has strengthened a lot vs 2025 (~7,900), which is why older 'USD 370' fee conversions are now ~USD 500. Internal helper, probably not rendered."
  },
  // frontier+flytta W6 — five facts added 2026-09-28 for the frontier stories and flytta guides
  // (seo-gap.md §4 and §6). Each was checked on the web on 2026-09-28; the source is named in
  // `sourced` and the confidence in `note`. None is signed off: Anton, please review in the report.
  "tax.double_tax_treaties": {
    "key": "tax.double_tax_treaties",
    "label": "Paraguay's double-tax treaties",
    "title": {
      "en": "Double-tax treaties — Paraguay's network",
      "es": "Convenios para evitar la doble imposición — la red de Paraguay",
      "pt": "Acordos para evitar a dupla tributação — a rede do Paraguai",
      "sv": "Skatteavtal — Paraguays avtalsnät"
    },
    "display": {
      "en": "comprehensive income-tax treaties with only five partners (Chile, Taiwan, Uruguay, the United Arab Emirates and Qatar); none with the United States, Canada, the United Kingdom, Australia or Sweden",
      "es": "convenios integrales sobre la renta con solo cinco socios (Chile, Taiwán, Uruguay, los Emiratos Árabes Unidos y Catar); ninguno con Estados Unidos, Canadá, el Reino Unido, Australia ni Suecia",
      "pt": "acordos amplos sobre a renda com apenas cinco parceiros (Chile, Taiwan, Uruguai, Emirados Árabes Unidos e Catar); nenhum com Estados Unidos, Canadá, Reino Unido, Austrália ou Suécia",
      "sv": "heltäckande skatteavtal för inkomstskatt med bara fem länder (Chile, Taiwan, Uruguay, Förenade Arabemiraten och Qatar); inget med USA, Kanada, Storbritannien, Australien eller Sverige"
    },
    "hedged": {
      "en": "only a small treaty network — whether any treaty covers your home country is something we check with an accountant for your case",
      "es": "una red de convenios muy reducida — si alguno cubre tu país lo verificamos con un contador para tu caso",
      "pt": "uma rede de acordos muito pequena — se algum cobre o seu país verificamos com um contador para o seu caso",
      "sv": "ett litet avtalsnät — om något avtal gäller ditt hemland stämmer vi av med en revisor för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "DNIT — Convenios Internacionales (agreements to avoid double taxation)",
      "checkedOn": "2026-09-28",
      "url": "https://www.dnit.gov.py/en/web/portal-institucional/convenios-internacionales"
    },
    "sources": [
      "https://www.dnit.gov.py/en/web/portal-institucional/convenios-internacionales",
      "https://taxsummaries.pwc.com/paraguay/individual/foreign-tax-relief-and-tax-treaties"
    ],
    "note": "Research 2026-09-28 (high confidence): DNIT (primary) lists comprehensive CDIs with Chile (Ley 2965/06), the Republic of China/Taiwan (Ley 3972/10), UAE (Ley 6230/18), Uruguay (Ley 6276/19) and Qatar (Ley 6387/19), plus narrower agreements: Germany air transport (Ley 1087/84), Belgium (Ley 1236/87, scope not stated on the page) and a transport convention (Ley 1105/97). PwC Worldwide Tax Summaries (reviewed 7 Feb 2026) lists the same five and adds that Paraguay gives no credit for income tax paid abroad. Some secondary sites wrongly list Spain or Germany as full treaties."
  },
  "citizenship.dual_nationality": {
    "key": "citizenship.dual_nationality",
    "label": "Citizenship — multiple nationality",
    "title": {
      "en": "Citizenship — multiple nationality",
      "es": "Nacionalidad — nacionalidad múltiple",
      "pt": "Nacionalidade — nacionalidade múltipla",
      "sv": "Medborgarskap — flera medborgarskap"
    },
    "display": {
      "en": "multiple nationality is admitted only by international treaty or by reciprocity of constitutional rank between the two countries (Constitution, art. 149); Ley 7052/2023 protects natural-born Paraguayans who take another nationality, not naturalised ones",
      "es": "la nacionalidad múltiple solo se admite por tratado internacional o por reciprocidad de rango constitucional entre los dos Estados (Constitución, art. 149); la Ley 7052/2023 protege a los paraguayos naturales que adquieren otra nacionalidad, no a los naturalizados",
      "pt": "a nacionalidade múltipla só é admitida por tratado internacional ou por reciprocidade de nível constitucional entre os dois países (Constituição, art. 149); a Lei 7052/2023 protege os paraguaios natos que adquirem outra nacionalidade, não os naturalizados",
      "sv": "flera medborgarskap godtas bara genom internationellt avtal eller genom ömsesidighet på grundlagsnivå mellan de två länderna (grundlagen, art. 149); lag 7052/2023 skyddar födda paraguayare som tar ett annat medborgarskap, inte naturaliserade"
    },
    "hedged": {
      "en": "whether you can hold Paraguayan nationality alongside your current one depends on treaties and on your home country's own law, which we confirm for your case",
      "es": "si puedes tener la nacionalidad paraguaya junto con la actual depende de los tratados y de la ley de tu país, algo que confirmamos para tu caso",
      "pt": "se você pode ter a nacionalidade paraguaia junto com a atual depende dos tratados e da lei do seu país, o que confirmamos para o seu caso",
      "sv": "om du kan ha paraguayanskt medborgarskap vid sidan av ditt nuvarande beror på avtal och på ditt hemlands egen lag, vilket vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional 1992, art. 149 (Constitute Project translation); Ley 7052/2023",
      "checkedOn": "2026-09-28",
      "url": "https://www.constituteproject.org/constitution/Paraguay_2011"
    },
    "sources": [
      "https://www.constituteproject.org/constitution/Paraguay_2011",
      "https://www.abc.com.py/politica/2023/01/13/rige-ley-que-garantiza-la-nacionalidad-multiple-a-los-paraguayos/",
      "https://www.bacn.gov.py/leyes-paraguayas/11258/ley-n-7052-reglamenta-los-articulos-146-147-y-149-de-la-constitucion-nacional-de-la-nacionalidad-paraguaya-multiple",
      "https://paraguaysovereign.com/citizenship/dual-citizenship/"
    ],
    "note": "Research 2026-09-28 (medium confidence): Art. 149 text is primary (Constitute Project translation; bacn.gov.py returned 403). Ley 7052 (promulgated 12 Jan 2023) regulates arts. 146, 147 and 149 for natural-born Paraguayans only. Paraguay has a dual-nationality treaty with Spain (1959); an agreement with Italy was approved by Ley 6479/2019 (Italian side not confirmed). One agency (paraguaysovereign) says the naturalisation oath includes a verbal renunciation that is not enforced and no proof of renunciation is asked for — secondary, NOT published. Whether the applicant keeps the first nationality is decided by the home country's law."
  },
  "citizenship.naturalized_loss": {
    "key": "citizenship.naturalized_loss",
    "label": "Citizenship — how a naturalised Paraguayan loses it",
    "title": {
      "en": "Citizenship — how a naturalised Paraguayan loses it",
      "es": "Nacionalidad — pérdida para los naturalizados",
      "pt": "Nacionalidade — perda para os naturalizados",
      "sv": "Medborgarskap — när en naturaliserad förlorar det"
    },
    "display": {
      "en": "a naturalised Paraguayan loses the nationality through an unjustified absence of more than 3 years, declared by a court, or by voluntarily acquiring another nationality (Constitution, art. 150)",
      "es": "el paraguayo naturalizado pierde la nacionalidad por ausencia injustificada de más de 3 años, declarada judicialmente, o por la adquisición voluntaria de otra nacionalidad (Constitución, art. 150)",
      "pt": "o paraguaio naturalizado perde a nacionalidade por ausência injustificada de mais de 3 anos, declarada judicialmente, ou pela aquisição voluntária de outra nacionalidade (Constituição, art. 150)",
      "sv": "en naturaliserad paraguayare förlorar medborgarskapet vid en oförklarad frånvaro på mer än 3 år, fastställd av domstol, eller genom att frivilligt skaffa ett annat medborgarskap (grundlagen, art. 150)"
    },
    "hedged": {
      "en": "naturalised citizens can lose Paraguayan nationality in circumstances the Constitution sets out, which we explain for your case",
      "es": "los naturalizados pueden perder la nacionalidad paraguaya en los supuestos que fija la Constitución, que te explicamos para tu caso",
      "pt": "os naturalizados podem perder a nacionalidade paraguaia nas hipóteses previstas na Constituição, que explicamos para o seu caso",
      "sv": "naturaliserade medborgare kan förlora det paraguayanska medborgarskapet i situationer som grundlagen anger, vilka vi förklarar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional 1992, art. 150 (Constitute Project translation)",
      "checkedOn": "2026-09-28",
      "url": "https://www.constituteproject.org/constitution/Paraguay_2011"
    },
    "sources": [
      "https://www.constituteproject.org/constitution/Paraguay_2011",
      "https://paraguaysovereign.com/citizenship/dual-citizenship/"
    ],
    "note": "Research 2026-09-28 (high confidence on the text, low on enforcement): the constitutional text is unambiguous; how often the absence ground is actually pursued in court was not researched."
  },
  "citizenship.naturalization_requirements": {
    "key": "citizenship.naturalization_requirements",
    "label": "Naturalisation — requirements and filing",
    "title": {
      "en": "Naturalisation — requirements and filing",
      "es": "Naturalización — requisitos y presentación",
      "pt": "Naturalização — requisitos e protocolo",
      "sv": "Naturalisation — krav och ansökan"
    },
    "display": {
      "en": "adult age, at least 3 years of permanent residency, proof that you regularly work, run a business or study in Paraguay, and good conduct; filed with the Supreme Court through a sponsoring lawyer, with a legal address in Asunción",
      "es": "mayoría de edad, al menos 3 años de residencia permanente, prueba de que trabajas, tienes un negocio o estudias en Paraguay de forma regular, y buena conducta; se presenta ante la Corte Suprema con patrocinio de abogado y domicilio legal en Asunción",
      "pt": "maioridade, pelo menos 3 anos de residência permanente, prova de que você trabalha, tem um negócio ou estuda no Paraguai de forma regular, e boa conduta; o pedido é feito à Corte Suprema com patrocínio de advogado e domicílio legal em Assunção",
      "sv": "myndig ålder, minst 3 års permanent uppehållstillstånd, bevis på att du regelbundet arbetar, driver företag eller studerar i Paraguay, och god vandel; ansökan lämnas till Högsta domstolen via ett ombud (advokat) med delgivningsadress i Asunción"
    },
    "hedged": {
      "en": "a set of residence, occupation and conduct requirements, filed through the courts, which we confirm for your case",
      "es": "un conjunto de requisitos de residencia, ocupación y conducta, tramitado ante la justicia, que confirmamos para tu caso",
      "pt": "um conjunto de requisitos de residência, ocupação e conduta, processado na Justiça, que confirmamos para o seu caso",
      "sv": "ett antal krav på bosättning, sysselsättning och vandel, prövade av domstol, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Poder Judicial — Carta de Naturalización (requisitos); Constitución Nacional, art. 148",
      "checkedOn": "2026-09-28",
      "url": "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463"
    },
    "sources": [
      "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463",
      "https://www.constituteproject.org/constitution/Paraguay_2011"
    ],
    "note": "Research 2026-09-28 (high confidence): the Poder Judicial page lists 14 items, including the permanent-residency card, a DNM residence certificate, police and judicial records, a home-country good-conduct certificate (apostilled), an employment certificate with the employer's RUC OR a commercial licence OR student enrolment OR professional credentials, a CV, a sworn declaration, a judicial fee (G 43,051 at the time of checking) and a petition signed by a sponsoring lawyer with a legal domicile in Asunción. No language test is listed on that page."
  },
  "entry.visa_exemption_us_ca_au": {
    "key": "entry.visa_exemption_us_ca_au",
    "label": "Entry — visa exemption for US, Canadian, Australian and New Zealand tourists",
    "title": {
      "en": "Entry — visa exemption for US, Canadian, Australian and New Zealand tourists",
      "es": "Ingreso — exoneración de visa para turistas de EE. UU., Canadá, Australia y Nueva Zelanda",
      "pt": "Entrada — isenção de visto para turistas dos EUA, Canadá, Austrália e Nova Zelândia",
      "sv": "Inresa — visumfrihet för turister från USA, Kanada, Australien och Nya Zeeland"
    },
    "display": {
      "en": "no tourist visa needed for US, Canadian, Australian and New Zealand citizens staying up to 90 days, under Ley 7314/2024, valid until 13 August 2027",
      "es": "no se exige visa de turista a ciudadanos de EE. UU., Canadá, Australia y Nueva Zelanda para estancias de hasta 90 días, según la Ley 7314/2024, vigente hasta el 13 de agosto de 2027",
      "pt": "não é exigido visto de turista para cidadãos dos EUA, Canadá, Austrália e Nova Zelândia em estadias de até 90 dias, pela Lei 7314/2024, válida até 13 de agosto de 2027",
      "sv": "inget turistvisum krävs för medborgare i USA, Kanada, Australien och Nya Zeeland vid vistelser på upp till 90 dagar, enligt lag 7314/2024, som gäller till den 13 augusti 2027"
    },
    "hedged": {
      "en": "entry rules for your passport, which change from time to time — we confirm them before you book a flight",
      "es": "las reglas de ingreso para tu pasaporte, que cambian cada cierto tiempo — las confirmamos antes de que compres el vuelo",
      "pt": "as regras de entrada para o seu passaporte, que mudam de tempos em tempos — confirmamos antes de você comprar a passagem",
      "sv": "inresereglerna för ditt pass, som ändras ibland — vi bekräftar dem innan du bokar flyg"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — Acuerdos de supresión de visas (updated January 2026); DNM news on Ley 7314",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/wp-content/uploads/2026/01/ACUERDOS-DE-SUPRESION-DE-VISAS-2026.pdf"
    },
    "sources": [
      "https://migraciones.gov.py/wp-content/uploads/2026/01/ACUERDOS-DE-SUPRESION-DE-VISAS-2026.pdf",
      "https://www.migraciones.gov.py/index.php/noticias/se-prorroga-por-tres-anos-mas-la-supresion-de-visas-de-ingreso-para-turistas-de-estados-unidos-canada-australia-y-nueva-zelanda"
    ],
    "note": "Research 2026-09-28 (high confidence): Ley 7314 (DNM news, 14 Aug 2024) extends Ley 6790/2021 by three years; DNM's January 2026 table gives the end date 13 August 2027. Tourism entries only; a residency applicant files inside Paraguay after entering. Re-check before August 2027 — this fact expires."
  },
  // merged from a parallel W6 writer branch
  "entry.venezuela_visa": {
    "key": "entry.venezuela_visa",
    "label": "Venezuelan nationals — consular visa to enter Paraguay",
    "title": {
      "en": "Venezuelan nationals — consular visa to enter Paraguay",
      "es": "Nacionales de Venezuela — visa consular para entrar a Paraguay",
      "pt": "Cidadãos venezuelanos — visto consular para entrar no Paraguai",
      "sv": "Venezuelanska medborgare — konsulärt visum för inresa i Paraguay"
    },
    "display": {
      "en": "since 10 January 2026 (Decree 5278/2026), a valid passport and a consular visa to enter Paraguay, including to settle; Venezuelans who entered regularly before that date can start or continue their residency without a visa",
      "es": "desde el 10 de enero de 2026 (Decreto 5278/2026), pasaporte vigente y visa consular para entrar a Paraguay, también para radicarse; quien ya había entrado de forma regular antes de esa fecha puede iniciar o continuar su residencia sin visa",
      "pt": "desde 10 de janeiro de 2026 (Decreto 5278/2026), passaporte válido e visto consular para entrar no Paraguai, inclusive para morar; quem já tinha entrado de forma regular antes dessa data pode iniciar ou continuar a residência sem visto",
      "sv": "sedan den 10 januari 2026 (dekret 5278/2026) krävs giltigt pass och konsulärt visum för inresa i Paraguay, även för att bosätta sig; den som redan rest in regelrätt före det datumet kan påbörja eller fortsätta sin ansökan utan visum"
    },
    "hedged": {
      "en": "an entry-visa rule for Venezuelan nationals, with exceptions for people already in Paraguay — we confirm how it applies to you before you travel",
      "es": "una exigencia de visa de entrada para nacionales de Venezuela, con excepciones para quienes ya están en Paraguay — te confirmamos cómo te afecta antes de que viajes",
      "pt": "uma exigência de visto de entrada para cidadãos venezuelanos, com exceções para quem já está no Paraguai — confirmamos como ela se aplica a você antes da viagem",
      "sv": "ett inresevisumkrav för venezuelanska medborgare, med undantag för den som redan är i Paraguay — vi bekräftar hur det gäller dig innan du reser"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — requisitos de ingreso y residencia para ciudadanos venezolanos (Decreto 5278/2026)",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/migraciones-informa-sobre-los-requisitos-de-ingreso-y-residencia-para-ciudadanos-venezolanos-a-partir-de-la-nueva-disposicion/"
    },
    "sources": [
      "https://migraciones.gov.py/migraciones-informa-sobre-los-requisitos-de-ingreso-y-residencia-para-ciudadanos-venezolanos-a-partir-de-la-nueva-disposicion/",
      "https://migraciones.gov.py/informacion-sobre-visas/",
      "https://www.abc.com.py/nacionales/2026/01/15/atencion-venezolanos-estos-son-los-nuevos-requisitos-para-ingresar-y-residir-en-paraguay/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM page read directly. The decree replaces Decree 14,609/1996, under which Venezuelans entered without a visa. Exempt: holders of temporary or permanent residency, refugees and asylum applicants with CONARE documents, and Venezuelans who entered regularly by 9 Jan 2026 and hold a valid stay or an open residency file. A Venezuelan without residency who leaves Paraguay needs the visa to come back. The DNM visa table (2026 file) lists Venezuela as 'requiere visa' for tourism and for residency. No relaxation found as of Sept 2026; Peña and Delcy Rodríguez opened talks on restoring relations on 19 Sept 2026, so re-check this entry if embassies reopen."
  },
  "entry.cuba_visa": {
    "key": "entry.cuba_visa",
    "label": "Cuban nationals — consular visa to enter Paraguay",
    "title": {
      "en": "Cuban nationals — consular visa to enter Paraguay",
      "es": "Nacionales de Cuba — visa consular para entrar a Paraguay",
      "pt": "Cidadãos cubanos — visto consular para entrar no Paraguai",
      "sv": "Kubanska medborgare — konsulärt visum för inresa i Paraguay"
    },
    "display": {
      "en": "Cuba is on Migraciones' list of nationalities that need a consular visa, both to enter as a tourist and to reside; the residency file then includes the visa and its verification by Paraguay's Foreign Ministry",
      "es": "Cuba figura en la lista de Migraciones de nacionalidades que necesitan visa consular, tanto para entrar como turista como para residir; el expediente de residencia incluye después la visa y su verificación por la Cancillería paraguaya",
      "pt": "Cuba está na lista da Migraciones de nacionalidades que precisam de visto consular, tanto para entrar como turista quanto para residir; o processo de residência inclui depois o visto e sua verificação pela Chancelaria paraguaia",
      "sv": "Kuba står på Migraciones lista över nationaliteter som behöver konsulärt visum, både för att resa in som turist och för att bosätta sig; uppehållsansökan innehåller sedan visumet och dess kontroll av Paraguays utrikesministerium"
    },
    "hedged": {
      "en": "a consular-visa requirement for Cuban nationals, which we confirm for your case before you apply",
      "es": "una exigencia de visa consular para nacionales de Cuba, que te confirmamos para tu caso antes de solicitarla",
      "pt": "uma exigência de visto consular para cidadãos cubanos, que confirmamos para o seu caso antes do pedido",
      "sv": "ett krav på konsulärt visum för kubanska medborgare, som vi bekräftar för ditt fall innan du ansöker"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — Información sobre visas (tabla de acuerdos de supresión de visas 2026); DNM Residencia Temporal",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/informacion-sobre-visas/"
    },
    "sources": [
      "https://migraciones.gov.py/informacion-sobre-visas/",
      "https://migraciones.gov.py/residencia-temporal/",
      "https://www.mre.gov.py/embapar-cuba/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM visa table row CUBA: 'LEY Nº 1738 02/08/2001 | REQUIERE VISA | REQUIERE VISA' (tourism and residency columns). The DNM temporary-residency checklist asks for the original consular visa and its MRE verification 'en los casos que se requiera'. Paraguay has an embassy with a consular section in Havana (Miramar). Cuba is not a party to the Apostille Convention, so Cuban documents are legalised, not apostilled (home-country rule, kept in prose)."
  },
  "entry.id_card_countries": {
    "key": "entry.id_card_countries",
    "label": "Entry with a national ID card instead of a passport",
    "title": {
      "en": "Entry with a national ID card instead of a passport",
      "es": "Entrada con documento nacional de identidad en lugar de pasaporte",
      "pt": "Entrada com documento nacional de identidade em vez de passaporte",
      "sv": "Inresa med nationellt id-kort i stället för pass"
    },
    "display": {
      "en": "nationals of Argentina, Brazil, Uruguay, Bolivia, Chile, Peru, Colombia and Ecuador can enter Paraguay with their valid national identity document instead of a passport",
      "es": "los nacionales de Argentina, Brasil, Uruguay, Bolivia, Chile, Perú, Colombia y Ecuador pueden entrar a Paraguay con su documento nacional de identidad vigente, sin pasaporte",
      "pt": "cidadãos de Argentina, Brasil, Uruguai, Bolívia, Chile, Peru, Colômbia e Equador podem entrar no Paraguai com seu documento nacional de identidade válido, sem passaporte",
      "sv": "medborgare i Argentina, Brasilien, Uruguay, Bolivia, Chile, Peru, Colombia och Ecuador kan resa in i Paraguay med giltigt nationellt id-kort i stället för pass"
    },
    "hedged": {
      "en": "some regional nationalities can enter with a national ID card — we confirm whether yours is one of them",
      "es": "algunas nacionalidades de la región pueden entrar con su documento de identidad — te confirmamos si la tuya es una de ellas",
      "pt": "algumas nacionalidades da região podem entrar com o documento de identidade — confirmamos se a sua é uma delas",
      "sv": "vissa nationaliteter i regionen kan resa in med id-kort — vi bekräftar om din är en av dem"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — Requerimientos migratorios de ingreso y salida del Paraguay",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/entrada-y-salida-del-pais/requerimientos-migratorios-de-ingreso-y-salida-del-paraguay/"
    },
    "sources": [
      "https://migraciones.gov.py/entrada-y-salida-del-pais/requerimientos-migratorios-de-ingreso-y-salida-del-paraguay/",
      "https://migraciones.gov.py/residencia-temporaria-mercosur/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM says national identity documents are valid 'exclusivamente para ciudadanos oriundos del MERCOSUR' and lists these eight countries (same list as mercosur.residency_route). The Mercosur temporary-residency checklist also accepts the national ID card as the identity document. Airlines may apply their own document rules."
  },
  "permanent.change_window": {
    "key": "permanent.change_window",
    "label": "Temporary to permanent — filing window and late filing",
    "title": {
      "en": "Temporary to permanent residency — filing window",
      "es": "De temporal a permanente — plazo para pedir el cambio de categoría",
      "pt": "De temporária a permanente — prazo para pedir a mudança de categoria",
      "sv": "Från tillfälligt till permanent — tidsfönster för ansökan"
    },
    "display": {
      "en": "within the 3 months before the temporary card expires; up to 1 month after expiry it is still possible, paying the overstay fine; after that month only an extension (prórroga) of the temporary residency can be requested, up to 6 months after expiry and also with the fine",
      "es": "dentro de los 3 meses anteriores al vencimiento del carnet temporal; hasta 1 mes después del vencimiento todavía se puede, pagando la multa por vencimiento de permanencia; pasado ese mes solo cabe pedir la prórroga de la temporal, hasta 6 meses después del vencimiento y también con multa",
      "pt": "nos 3 meses anteriores ao vencimento da carteira temporária; até 1 mês depois do vencimento ainda é possível, pagando a multa por permanência vencida; passado esse mês só cabe pedir a prorrogação da temporária, até 6 meses depois do vencimento e também com multa",
      "sv": "inom de 3 månaderna innan det tillfälliga kortet går ut; upp till 1 månad efter att det gått ut går det fortfarande, mot avgift för överskriden vistelse; efter den månaden kan man bara begära förlängning (prórroga) av det tillfälliga tillståndet, upp till 6 månader efter utgångsdatum och också mot avgift"
    },
    "hedged": {
      "en": "a fixed window before your temporary card expires, with a narrow late option that carries a fine — we put your exact dates in writing",
      "es": "un plazo fijo antes de que venza tu carnet temporal, con una opción tardía corta y con multa — te damos tus fechas exactas por escrito",
      "pt": "um prazo fixo antes do vencimento da sua carteira temporária, com uma opção tardia curta e com multa — passamos suas datas exatas por escrito",
      "sv": "ett fast tidsfönster innan ditt tillfälliga kort går ut, med en kort sen möjlighet mot avgift — vi ger dig dina exakta datum skriftligt"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — Residencia permanente para el cambio de categoría de residente temporal",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/",
      "https://migraciones.gov.py/residencia-temporal/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM page read directly: 'deberá tramitarse dentro de los 3 (tres) meses anteriores al vencimiento'; 'hasta 1 (un) mes posterior al vencimiento, debiendo abonar la multa'; 'Transcurrido 1 (un) mes ... solo se podrá solicitar la prórroga de residencia temporal, la cual será otorgada por igual período, hasta 6 (seis) meses posteriores al vencimiento del carnet'. Applies to Ley 6984/2022 temporary residents; the Mercosur conversion has its own, stricter rule (mercosur.conversion_deadline)."
  },
  "mercosur.conversion_deadline": {
    "key": "mercosur.conversion_deadline",
    "label": "Mercosur temporary residency — conversion deadline",
    "title": {
      "en": "Mercosur temporary residency — conversion deadline",
      "es": "Temporaria Mercosur — plazo para pasar a la permanente",
      "pt": "Temporária Mercosul — prazo para passar à permanente",
      "sv": "Tillfälligt Mercosur-tillstånd — sista dag för permanent ansökan"
    },
    "display": {
      "en": "the Mercosur temporary card lasts 2 years and cannot be extended: if you do not apply for permanent residency in the 90 days before it expires, you lose the Mercosur route and must apply under the general regime of Ley 6984/2022",
      "es": "la temporaria Mercosur dura 2 años y no se prorroga: si no pides la permanente en los 90 días previos al vencimiento, pierdes la vía Mercosur y tienes que solicitar la residencia por el régimen general de la Ley 6984/2022",
      "pt": "a temporária Mercosul dura 2 anos e não se prorroga: se você não pedir a permanente nos 90 dias anteriores ao vencimento, perde a via Mercosul e precisa pedir a residência pelo regime geral da Lei 6984/2022",
      "sv": "det tillfälliga Mercosur-kortet gäller i 2 år och kan inte förlängas: ansöker du inte om permanent uppehållstillstånd under de 90 dagarna före utgångsdatum förlorar du Mercosur-vägen och måste ansöka enligt den allmänna ordningen i lag 6984/2022"
    },
    "hedged": {
      "en": "the Mercosur temporary card cannot be extended and has a strict conversion window — we give you your exact dates in writing",
      "es": "la temporaria Mercosur no se prorroga y tiene un plazo estricto para pasar a permanente — te damos tus fechas exactas por escrito",
      "pt": "a temporária Mercosul não se prorroga e tem um prazo rígido para virar permanente — passamos suas datas exatas por escrito",
      "sv": "det tillfälliga Mercosur-kortet kan inte förlängas och har ett strikt tidsfönster för permanent ansökan — vi ger dig dina exakta datum skriftligt"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — Residencia Temporaria Mercosur y Residencia Permanente Mercosur",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/residencia-permanente-mercosur/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-permanente-mercosur/",
      "https://migraciones.gov.py/residencia-temporaria-mercosur/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM temporaria page: 'Dos (2) años, no prorrogable'. Permanente page: filing 'noventa (90) días previos al vencimiento de su Carnet de Admisión Temporaria MERCOSUR'; if it lapses the person 'deberá solicitar la residencia bajo el régimen de la Ley Nº 6984/22'. The same DNM temporaria page lists the Mercosur temporary fee as G 2,341,540, which confirms the computed figure in fees.mercosur_residency (that entry could now carry a sourced block)."
  },
  "fees.overstay_fine": {
    "key": "fees.overstay_fine",
    "label": "DNM fine — expired stay",
    "title": {
      "en": "DNM fine — expired stay",
      "es": "Multa de Migraciones — vencimiento del plazo de permanencia",
      "pt": "Multa da Migraciones — vencimento do prazo de permanência",
      "sv": "DNM-avgift — överskriden vistelsetid"
    },
    "display": {
      "en": "G 702,462 (about USD 120) as the fine for an expired stay",
      "es": "G 702.462 (unos USD 120) de multa por vencimiento del plazo de permanencia",
      "pt": "G 702.462 (cerca de USD 120) de multa por vencimento do prazo de permanência",
      "sv": "G 702 462 (cirka USD 120) i avgift för överskriden vistelsetid"
    },
    "hedged": {
      "en": "a government fine we confirm in writing for your case",
      "es": "una multa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma multa oficial que confirmamos por escrito para o seu caso",
      "sv": "en statlig avgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — cambio de categoría, aranceles desde el 1 de julio de 2026 (6 jornales)",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/",
      "https://migraciones.gov.py/nuevos-aranceles-migratorios-rigen-desde-el-1-de-julio-por-reajuste-del-salario-minimo/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM fee line 'Multa (Art. 87) Por vencimiento del plazo de estadía: Gs. 702.462' = 6 × G 117,077. USD at ~G 5,870 (fx.reference_rate). Goes stale each July with the minimum wage."
  },
  "fees.radicacion_certificate": {
    "key": "fees.radicacion_certificate",
    "label": "DNM fee — certificado de radicación",
    "title": {
      "en": "DNM fee — residence certificate (certificado de radicación)",
      "es": "Tasa de Migraciones — certificado de radicación",
      "pt": "Taxa da Migraciones — certificado de radicação",
      "sv": "DNM-avgift — bosättningsintyg (certificado de radicación)"
    },
    "display": {
      "en": "G 234,154 (about USD 40) for the certificado de radicación",
      "es": "G 234.154 (unos USD 40) por el certificado de radicación",
      "pt": "G 234.154 (cerca de USD 40) pelo certificado de radicação",
      "sv": "G 234 154 (cirka USD 40) för certificado de radicación"
    },
    "hedged": {
      "en": "a government fee we confirm in writing for your case",
      "es": "una tasa oficial que te confirmamos por escrito para tu caso",
      "pt": "uma taxa oficial que confirmamos por escrito para o seu caso",
      "sv": "en statlig avgift som vi bekräftar skriftligt för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "DNM — aranceles de residencia permanente desde el 1 de julio de 2026 (2 jornales)",
      "checkedOn": "2026-09-28",
      "url": "https://migraciones.gov.py/residencia-permanente-mercosur/"
    },
    "sources": [
      "https://migraciones.gov.py/residencia-permanente-mercosur/",
      "https://migraciones.gov.py/residencia-permanente-para-el-cambio-de-categoria-de-residente-temporal/"
    ],
    "note": "Research 2026-09-28 (high confidence): DNM fee line 'Certificado de Radicación: Gs. 234.154' = 2 × G 117,077, on both permanent-residency pages. The naturalisation file asks for a DNM residence certificate (pj.gov.py list)."
  },
  "fees.naturalization_judicial": {
    "key": "fees.naturalization_judicial",
    "label": "Naturalisation — judicial fee",
    "title": {
      "en": "Naturalisation — judicial fee",
      "es": "Naturalización — tasa judicial",
      "pt": "Naturalização — taxa judicial",
      "sv": "Naturalisering — domstolsavgift"
    },
    "display": {
      "en": "a judicial fee of G 43,051 (about USD 7) for the naturalisation letter, before lawyer's fees",
      "es": "una tasa judicial de G 43.051 (unos USD 7) por la carta de naturalización, sin contar los honorarios del abogado",
      "pt": "uma taxa judicial de G 43.051 (cerca de USD 7) pela carta de naturalização, sem contar os honorários do advogado",
      "sv": "en domstolsavgift på G 43 051 (cirka USD 7) för naturaliseringsbrevet, utöver advokatarvodet"
    },
    "hedged": {
      "en": "a small court fee plus lawyer's fees, which we confirm for your case",
      "es": "una tasa judicial pequeña más los honorarios del abogado, que te confirmamos para tu caso",
      "pt": "uma pequena taxa judicial mais os honorários do advogado, que confirmamos para o seu caso",
      "sv": "en liten domstolsavgift plus advokatarvode, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Poder Judicial — Carta de Naturalización (requisitos y tasa)",
      "checkedOn": "2026-09-28",
      "url": "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463"
    },
    "sources": [
      "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463",
      "https://moveparaguay.com/en/citizenship/"
    ],
    "note": "Research 2026-09-28 (medium confidence): pj.gov.py page read directly: 'Se debe abonar el monto de Gs. 43.051' (bank commission extra). The page is undated and may not reflect a later adjustment. Lawyer fees are the real cost (competitors quote USD 1,500–3,500); keep those out of this entry."
  },
  "citizenship.loss_rule": {
    "key": "citizenship.loss_rule",
    "label": "Naturalised Paraguayans — loss of nationality",
    "title": {
      "en": "Naturalised Paraguayans — loss of nationality",
      "es": "Paraguayos naturalizados — pérdida de la nacionalidad",
      "pt": "Paraguaios naturalizados — perda da nacionalidade",
      "sv": "Naturaliserade paraguayare — förlust av medborgarskapet"
    },
    "display": {
      "en": "a naturalised Paraguayan loses the nationality through an unjustified absence of more than 3 years, declared by a court, or by voluntarily acquiring another nationality (Constitution, art. 150)",
      "es": "un paraguayo naturalizado pierde la nacionalidad por una ausencia injustificada de más de 3 años, declarada judicialmente, o por adquirir voluntariamente otra nacionalidad (Constitución, art. 150)",
      "pt": "um paraguaio naturalizado perde a nacionalidade por uma ausência injustificada de mais de 3 anos, declarada judicialmente, ou por adquirir voluntariamente outra nacionalidade (Constituição, art. 150)",
      "sv": "en naturaliserad paraguayare förlorar medborgarskapet vid oförklarad frånvaro i mer än 3 år, fastställd av domstol, eller genom att frivilligt skaffa ett annat medborgarskap (grundlagen, art. 150)"
    },
    "hedged": {
      "en": "naturalised citizens can lose the nationality after a long unjustified absence — we explain what it means for your travel",
      "es": "un naturalizado puede perder la nacionalidad tras una ausencia larga e injustificada — te explicamos qué significa para tus viajes",
      "pt": "um naturalizado pode perder a nacionalidade após uma ausência longa e injustificada — explicamos o que isso significa para suas viagens",
      "sv": "en naturaliserad medborgare kan förlora medborgarskapet efter lång oförklarad frånvaro — vi förklarar vad det betyder för dina resor"
    },
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional de 1992, art. 150",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/constitucion-nacional-de-la-republica-del-paraguay"
    },
    "sources": [
      "https://www.bacn.gov.py/constitucion-nacional-de-la-republica-del-paraguay",
      "https://www.constituteproject.org/constitution/Paraguay_2011"
    ],
    "note": "Research 2026-09-28 (high confidence): art. 150 verbatim: 'Los paraguayos naturalizados pierden la nacionalidad en virtud de ausencia injustificada de la República por más de tres años, declarada judicialmente, o por la adquisición voluntaria de otra nacionalidad.' Text read from the constituteproject.org edition (rev. 2011). Secondary sources say a longer absence can be notified in advance to the civil judge or at a consulate."
  },
  "citizenship.political_rights": {
    "key": "citizenship.political_rights",
    "label": "Naturalised Paraguayans — citizenship (political rights)",
    "title": {
      "en": "Naturalised Paraguayans — when political rights start",
      "es": "Paraguayos naturalizados — cuándo llega la ciudadanía",
      "pt": "Paraguaios naturalizados — quando chega a cidadania",
      "sv": "Naturaliserade paraguayare — när de politiska rättigheterna börjar"
    },
    "display": {
      "en": "naturalisation gives the nationality at once, and citizenship (political rights) 2 years after it is granted (Constitution, art. 152)",
      "es": "la naturalización da la nacionalidad de inmediato, y la ciudadanía (los derechos políticos) 2 años después de obtenerla (Constitución, art. 152)",
      "pt": "a naturalização dá a nacionalidade de imediato, e a cidadania (direitos políticos) 2 anos depois de obtida (Constituição, art. 152)",
      "sv": "naturaliseringen ger medborgarskapet direkt, och de politiska rättigheterna 2 år efter att det beviljats (grundlagen, art. 152)"
    },
    "hedged": {
      "en": "political rights for naturalised citizens start after a waiting period, which we confirm for your case",
      "es": "los derechos políticos de un naturalizado llegan tras un periodo de espera, que te confirmamos para tu caso",
      "pt": "os direitos políticos de um naturalizado chegam após um período de espera, que confirmamos para o seu caso",
      "sv": "de politiska rättigheterna för en naturaliserad medborgare börjar efter en väntetid, som vi bekräftar för ditt fall"
    },
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional de 1992, art. 152",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/constitucion-nacional-de-la-republica-del-paraguay"
    },
    "sources": [
      "https://www.bacn.gov.py/constitucion-nacional-de-la-republica-del-paraguay",
      "https://www.constituteproject.org/constitution/Paraguay_2011"
    ],
    "note": "Research 2026-09-28 (high confidence): art. 152.2 verbatim: 'toda persona de nacionalidad paraguaya por naturalización, después de dos años de haberla obtenido' is a citizen. Some offices (President, Congress, Supreme Court) are reserved for Paraguayans by birth under other articles; not listed here."
  },
  // merged from a parallel W6 writer branch
  "investorpass.cie_scope": {
    "key": "investorpass.cie_scope",
    "label": "Investor Pass — what the investor certificate (CIE) is",
    "title": "Investor Pass — what the investor certificate (CIE) is",
    "display": "a Foreign Investor Certificate (CIE) issued by the Ministry of Industry and Commerce through SUACE, only to individual foreign investors and only so that the migration office (DNM) can grant permanent residency without the temporary stage (Ley 6984/2022, art. 46)",
    "hedged": "an investor certificate from the Ministry of Industry and Commerce that supports a direct permanent residency application, with the current rules confirmed for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, art. 1 and Annex I art. 1(a); Ley 6984/2022, art. 46",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf",
      "https://baselegal.com.py/docs/7118f528-513d-11ed-b822-525400343722"
    ],
    "note": "Research 2026-09-28 (high confidence): read from the resolution PDF (scanned, 10 pages). The CIE is issued 'exclusivamente a favor de personas físicas extranjeras' and 'exclusivamente a los efectos de obtener la residencia permanente'; DNM and SEPRELAD powers are reserved. Art. 1 cites 'Ley 6934/2022', a typo for 6984 in the original. The resolution says nothing about spouses or children: family cover comes from DNM practice and REDIEX statements, not from this text."
  },
  "investorpass.cie_issuing_term": {
    "key": "investorpass.cie_issuing_term",
    "label": "Investor Pass — issuing term for the CIE",
    "title": "Investor Pass — issuing term for the investor certificate",
    "display": "within 5 working days of SUACE receiving a complete file, with the clock stopped while any observations or requests for more information are answered",
    "hedged": "a short issuing window once the file is complete, which we confirm for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, art. 4",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): 'en un plazo no mayor a 5 días hábiles a partir de la recepción del expediente. En caso de observaciones, solicitudes de información complementaria o requerimientos de rectificación, el plazo quedará suspendido'. The DNM residency stage that follows has no term in this resolution."
  },
  "investorpass.resolution_history": {
    "key": "investorpass.resolution_history",
    "label": "Investor Pass — which resolution is in force",
    "title": "Investor Pass — which resolution is in force",
    "display": "MIC Resolution 0283 of 21 April 2026, which repealed Resolution 1052 of 11 September 2025, itself the replacement for Resolution 236 of 14 February 2019: the same SUACE investor certificate, regulated three times",
    "hedged": "the MIC resolution currently in force, which replaced earlier versions of the same investor certificate",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, preamble and art. 7",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): signed by Minister Marco Nicolás Riquelme Boettner. Art. 6 applies the new rules to applications pending under Res. 1052/2025 where they are more favourable to the applicant."
  },
  "investorpass.cie_documents": {
    "key": "investorpass.cie_documents",
    "label": "Investor Pass — personal documents for the CIE",
    "title": "Investor Pass — personal documents for the investor certificate",
    "display": "an online application form that counts as a sworn statement; your passport or national ID; proof of entry to Paraguay (entry card, passport stamp or DNM movement certificate, plus a consular visa if your nationality needs one); an apostilled or legalised criminal record certificate from your country of origin, and from any country you lived in for more than a year in the last 3 years; a Paraguayan Interpol certificate; and a sworn statement on the origin of the funds",
    "hedged": "a personal document set (identity, entry record, criminal record certificates and a source-of-funds statement) that we list for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I art. 2",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): the source-of-funds statement includes a commitment to SEPRELAD anti-money-laundering rules. The route-specific evidence (business plan, deed, securities certificate) comes on top."
  },
  "investorpass.investment_status": {
    "key": "investorpass.investment_status",
    "label": "Investor Pass — timing and valuation of the investment",
    "title": "Investor Pass — timing and valuation of the investment",
    "display": "the investment may be completed or still in progress, as long as the financial commitment is documented; minimums are in US dollars or the guaraní equivalent at the official rate on the day you apply",
    "hedged": "rules on when the investment must be made and how it is valued, which we confirm for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I art. 1(g) and (h)",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): 'Las inversiones podrán encontrarse ejecutadas o en proceso de ejecución, siempre que se acredite documentalmente su compromiso económico.' Foreign-currency documents are converted at the BCP official rate on the day of conversion (Annex I art. 7(a))."
  },
  "investorpass.productive_conditions": {
    "key": "investorpass.productive_conditions",
    "label": "Investor Pass — productive route conditions",
    "title": "Investor Pass — productive business route conditions",
    "display": "a business plan in industry, commerce or services that creates at least 5 formal jobs, with an execution schedule and progress reports every six months; rent, salaries, utilities and recurring admin costs do not count as investment, and each co-investor must meet the minimum individually",
    "hedged": "a business plan, job creation and progress reporting, with the current conditions confirmed in writing for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I arts. 1(c) and 3",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): counts as investment: property, machinery and equipment, specialised tools, vehicles used in the activity, technology, operating furniture, civil works and installations. Solvency is shown with 3 months of bank statements (own or company) or investment titles, or with property/vehicle valuations. The resolution sets no fixed execution deadline (the '24 months' in suace.status comes from the repealed 2025 regime)."
  },
  "investorpass.tourism_conditions": {
    "key": "investorpass.tourism_conditions",
    "label": "Investor Pass — tourism route conditions",
    "title": "Investor Pass — tourism route conditions",
    "display": "a tourism business plan (creating, buying, expanding, modernising or running tourism assets, infrastructure or services) with an execution schedule and progress reports every six months; the resolution sets no minimum number of jobs for this route, and rent, salaries and running costs do not count as investment",
    "hedged": "a tourism business plan and progress reporting, with the current conditions confirmed in writing for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I arts. 1(f) and 4",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): the plan must name the category of tourism service provider under the competent authority's classification (SENATUR is not named in the text). Same solvency evidence as the productive route."
  },
  "investorpass.financial_conditions": {
    "key": "investorpass.financial_conditions",
    "label": "Investor Pass — financial instruments route conditions",
    "title": "Investor Pass — financial instruments route conditions",
    "display": "a certificate from an entity authorised by the Superintendencia de Valores of the Central Bank of Paraguay, for a term of at least 2 years and stating the investment's value; supporting documents no older than 180 days when you file; no business plan or jobs, but the holding must be reported every year",
    "hedged": "an investment certified by an authorised Paraguayan securities entity and held for a minimum term, with the conditions confirmed in writing for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I arts. 1(d) and 5",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): 'Se admiten todas las inversiones económicamente demostrables, cuya naturaleza económica sea verificable con documentación.' The text names no list of instruments (bonds, funds, CDAs); the test is who issues the certificate and for how long."
  },
  "investorpass.real_estate_evidence": {
    "key": "investorpass.real_estate_evidence",
    "label": "Investor Pass — real estate route evidence",
    "title": "Investor Pass — real estate route evidence",
    "display": "a registered title deed, or a private purchase contract with signatures certified by a notary (escribano) showing at least 30% of the declared investment paid; documents no older than 180 days when you file; property bought for purely personal or family use does not qualify",
    "hedged": "a registered deed or a notarised purchase contract meeting the route's conditions, which we confirm in writing for your case",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I arts. 1(e) and 6",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence): qualifying = acquisition, development or exploitation of real property or recognised real rights, to earn rent, appreciation or productive use. No business plan or jobs. The 30%-paid private contract is new relative to the site's real-estate deep dive, which says off-plan purchases generally do not work."
  },
  "investorpass.foreign_documents": {
    "key": "investorpass.foreign_documents",
    "label": "Investor Pass — foreign documents",
    "title": "Investor Pass — authentication and translation of foreign documents",
    "display": "apostilled (or legalised by the Paraguayan consulate and then the Foreign Ministry) and translated into Spanish by a Paraguayan registered public translator or an authorised foreign one, with the translation itself apostilled or legalised; Brazilian documents in Portuguese need no translation",
    "hedged": "authenticated and translated to the standard the resolution sets, which we check document by document",
    "verified": false,
    "sourced": {
      "label": "MIC Res. 0283/2026, Annex I art. 7",
      "checkedOn": "2026-09-28",
      "url": "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    },
    "sources": [
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (high confidence)."
  },
  "residency.criminal_record_refusal": {
    "key": "residency.criminal_record_refusal",
    "label": "Criminal record — grounds for refusing residency",
    "title": "Criminal record — grounds for refusing residency",
    "display": {
      "en": "the migration office may refuse temporary or permanent residency to anyone prosecuted or convicted, in Paraguay or abroad, for an intentional offence that carries more than 2 years in prison under Paraguayan law, and to anyone with a pattern of repeat offending (Ley 6984/2022, arts. 50 and 52)",
      "es": "la oficina de migraciones puede denegar la residencia temporal o permanente a quien haya sido procesado o condenado, en Paraguay o en el extranjero, por un hecho punible doloso que según la ley paraguaya merezca una pena de prisión mayor a 2 años, y a quien registre una conducta reiterante (Ley 6984/2022, arts. 50 y 52)",
      "pt": "a Migração pode negar a residência temporária ou permanente a quem tenha sido processado ou condenado, no Paraguai ou no exterior, por crime doloso que, pela lei paraguaia, mereça pena de prisão superior a 2 anos, e a quem tenha conduta reiterada (Ley 6984/2022, arts. 50 e 52)",
      "sv": "migrationsmyndigheten kan neka tillfälligt eller permanent uppehållstillstånd till den som är åtalad eller dömd, i Paraguay eller utomlands, för ett uppsåtligt brott som enligt paraguayansk lag ger mer än 2 års fängelse, och till den som har upprepade brott bakom sig (Ley 6984/2022, art. 50 och 52)"
    },
    "hedged": {
      "en": "Paraguayan law lets the migration office refuse residency over certain criminal records, and we tell you how yours is likely to be read before you file",
      "es": "la ley paraguaya permite a migraciones denegar la residencia por ciertos antecedentes penales, y te decimos cómo es probable que se lea el tuyo antes de presentar el expediente",
      "pt": "a lei paraguaia permite que a Migração negue a residência por certos antecedentes criminais, e dizemos como o seu tende a ser lido antes de você protocolar",
      "sv": "paraguayansk lag låter migrationsmyndigheten neka uppehållstillstånd vid vissa brottsregister, och vi berättar hur ditt sannolikt läses innan du lämnar in"
    },
    "verified": false,
    "sourced": {
      "label": "Ley 6984/2022 de Migraciones, arts. 50 and 52",
      "checkedOn": "2026-09-28",
      "url": "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones"
    },
    "sources": [
      "https://www.bacn.gov.py/leyes-paraguayas/10973/ley-n-6984-de-migraciones",
      "https://baselegal.com.py/docs/7118f528-513d-11ed-b822-525400343722"
    ],
    "note": "Research 2026-09-28 (high confidence): text read on baselegal.com.py (BACN returned 403). Art. 52: 'podrá denegar la Residencia Permanente a quienes hayan sido procesados o condenados por hechos punibles de carácter doloso cometidos en el país o fuera de él, que merezcan según las leyes de la República del Paraguay la aplicación de penas privativas de libertad mayores a 2 (dos) años y a quienes registren una conducta reiterante'; art. 50 has the same wording for temporary residency. The power is discretionary ('podrá'). Art. 55.1: residency obtained with false documents can be cancelled at any time."
  },
  "uk.state_pension_paraguay": {
    "key": "uk.state_pension_paraguay",
    "label": "UK State Pension in Paraguay — annual increases",
    "title": "UK State Pension in Paraguay — annual increases",
    "display": "paid in Paraguay but frozen: Paraguay is not on the GOV.UK list of countries where the UK pays the State Pension's annual increase, so it stays at the rate you are first paid abroad",
    "hedged": "payable abroad, with annual increases that depend on where you live — check your own position with the International Pension Centre",
    "verified": false,
    "sourced": {
      "label": "GOV.UK — Countries where we pay an annual increase in the State Pension",
      "checkedOn": "2026-09-28",
      "url": "https://www.gov.uk/government/publications/state-pensions-annual-increases-if-you-live-abroad/countries-where-we-pay-an-annual-increase-in-the-state-pension"
    },
    "sources": [
      "https://www.gov.uk/government/publications/state-pensions-annual-increases-if-you-live-abroad/countries-where-we-pay-an-annual-increase-in-the-state-pension",
      "https://www.gov.uk/state-pension-if-you-retire-abroad"
    ],
    "note": "Research 2026-09-28 (high confidence): the list covers the EEA, Switzerland and 17 agreement countries (Barbados, Bermuda, Bosnia-Herzegovina, Gibraltar, Guernsey, Isle of Man, Israel, Jamaica, Jersey, Kosovo, Mauritius, Montenegro, North Macedonia, Philippines, Serbia, Turkey, USA). No South American country is on it. A UK home-country rule: re-check if the UK ever signs a social security agreement with Paraguay."
  },
  "uk.voluntary_nic_abroad": {
    "key": "uk.voluntary_nic_abroad",
    "label": "UK voluntary National Insurance from abroad",
    "title": "UK voluntary National Insurance contributions from abroad",
    "display": "from 6 April 2026 only voluntary Class 3 contributions can be paid for time abroad, and only if you previously lived in the UK for 10 years in a row or paid 10 years of contributions in total",
    "hedged": "voluntary National Insurance contributions from abroad are subject to eligibility rules that changed recently — check your record with HMRC",
    "verified": false,
    "sourced": {
      "label": "GOV.UK — Voluntary National Insurance contributions for periods abroad from April 2026",
      "checkedOn": "2026-09-28",
      "url": "https://www.gov.uk/government/publications/changes-to-voluntary-national-insurance-contributions-for-periods-spent-abroad/voluntary-national-insurance-contributions-for-periods-abroad-from-april-2026"
    },
    "sources": [
      "https://www.gov.uk/government/publications/changes-to-voluntary-national-insurance-contributions-for-periods-spent-abroad/voluntary-national-insurance-contributions-for-periods-abroad-from-april-2026"
    ],
    "note": "Research 2026-09-28 (high confidence): Class 2 for periods abroad ends with 2025–26. Transitional rule: people who applied before 6 April 2026 can pay Class 3 under the old 3-year test if they apply and pay by 5 April 2027. A UK home-country rule, not Paraguayan."
  },
  "uk.paraguay_tax_treaty": {
    "key": "uk.paraguay_tax_treaty",
    "label": "UK–Paraguay double taxation agreement",
    "title": "UK–Paraguay double taxation agreement",
    "display": "there is no double taxation agreement between the United Kingdom and Paraguay (HMRC Double Taxation Relief Manual, DT15200)",
    "hedged": "the tax treaty position between the UK and Paraguay, which your UK tax adviser should confirm",
    "verified": false,
    "sourced": {
      "label": "HMRC Double Taxation Relief Manual, DT15200 (Paraguay)",
      "checkedOn": "2026-09-28",
      "url": "https://www.gov.uk/hmrc-internal-manuals/double-taxation-relief/dt15200"
    },
    "sources": [
      "https://www.gov.uk/hmrc-internal-manuals/double-taxation-relief/dt15200"
    ],
    "note": "Research 2026-09-28 (high confidence): the page reads, in full, 'There is no double taxation agreement between the United Kingdom and Paraguay.' Unilateral relief may still apply; that is for a UK adviser."
  },
  "citizenship.constitutional_requirements": {
    "key": "citizenship.constitutional_requirements",
    "label": "Naturalisation — constitutional requirements",
    "title": "Naturalisation — constitutional requirements",
    "display": "legal adulthood, a minimum of 3 years' residence (radicación) in Paraguay, a profession, trade, science, art or industry exercised in the country, and good conduct (Constitution, art. 148)",
    "hedged": "the constitutional conditions for naturalisation, which we set out for your case",
    "verified": false,
    "sourced": {
      "label": "Constitución Nacional (1992), art. 148, as published by the Embassy of Paraguay in Japan",
      "checkedOn": "2026-09-28",
      "url": "https://embapar.jp/archivos/nacionalidad-paraguaya/"
    },
    "sources": [
      "https://embapar.jp/archivos/nacionalidad-paraguaya/",
      "https://www.pj.gov.py/contenido/463-carta-de-naturalizacion/463"
    ],
    "note": "Research 2026-09-28 (high confidence): the Supreme Court (Corte Suprema de Justicia) issues the carta de naturalización. How the courts test 'radicación' in practice (permanent residency held for 3 years, per citizenship.years) and any language or interview step were not researched."
  },
  "visa.india_consular": {
    "key": "visa.india_consular",
    "label": "Indian nationals — Paraguayan entry visa",
    "title": "Indian nationals — Paraguayan entry visa",
    "display": "Indian ordinary-passport holders need a Paraguayan consular visa before they travel: India is on Paraguay's consular-visa list, and Paraguay is not on India's own list of visa-free, visa-on-arrival or e-visa destinations",
    "hedged": "Indian nationals generally need a visa arranged before travel, and we confirm the current consular process for your case",
    "verified": false,
    "sourced": {
      "label": "Government of India, MEA — visa facility for Indian nationals (as on 2 Feb 2026); Paraguayan consular visa regime",
      "checkedOn": "2026-09-28",
      "url": "https://www.mea.gov.in/vffin"
    },
    "sources": [
      "https://www.mea.gov.in/vffin",
      "https://www2.mre.gov.py/congralpar-buenos-aires/index.php/tramites-y-servicios/visas",
      "https://www.mic.gov.py/wp-content/uploads/2026/04/Res.-N-0283.2026_Constancia-de-Inversionista.pdf"
    ],
    "note": "Research 2026-09-28 (medium confidence): the MEA list (page updated 27 Aug 2026) does not include Paraguay in any visa-facility category. A search excerpt of the Paraguayan consulate page (403 on fetch) lists India among nationalities needing a consular visa with Foreign Ministry authorisation. Some visa-agency pages claim visa-free entry; they conflict with both. Paraguay has an embassy in New Delhi. Owner: confirm with the embassy before relying on it."
  },
  "driving.uk_licence_visitors": {
    "key": "driving.uk_licence_visitors",
    "label": "Driving in Paraguay on a UK licence (visitors)",
    "title": "Driving in Paraguay on a UK licence (visitors)",
    "display": "visitors can drive in Paraguay on a UK photocard licence, and must carry it with the passport showing their entry stamp",
    "hedged": "visitor driving rules for UK licence holders, which you should check in the FCDO's current travel advice",
    "verified": false,
    "sourced": {
      "label": "FCDO travel advice: Paraguay — safety and security (driving)",
      "checkedOn": "2026-09-28",
      "url": "https://www.gov.uk/foreign-travel-advice/paraguay/safety-and-security"
    },
    "sources": [
      "https://www.gov.uk/foreign-travel-advice/paraguay/safety-and-security"
    ],
    "note": "Research 2026-09-28 (high confidence on the FCDO wording): the FCDO gives no time limit for visitors. Agency guides say a foreign licence is accepted for 90 days as a tourist; not verified in a primary source, so not published. Paper-licence holders may need an IDP (FCDO)."
  },
  "driving.resident_licence": {
    "key": "driving.resident_licence",
    "label": "Paraguayan driving licence for residents",
    "title": "Paraguayan driving licence for residents",
    "display": {
      "en": "residents exchange a valid foreign licence for a Paraguayan one at the municipality where they live, usually without driving tests, once they hold a cédula",
      "es": "los residentes canjean un carnet extranjero vigente por uno paraguayo en la municipalidad donde viven, por lo general sin exámenes de manejo, una vez que tienen la cédula",
      "pt": "residentes trocam uma carteira de motorista estrangeira válida por uma paraguaia na prefeitura do município onde moram, em geral sem prova de direção, depois de ter a cédula",
      "sv": "bosatta byter ett giltigt utländskt körkort mot ett paraguayanskt hos kommunen där de bor, oftast utan körprov, när de väl har cédulan"
    },
    "hedged": {
      "en": "a Paraguayan licence issued by the municipality where you live, once your residency paperwork allows it, with the current requirements confirmed for your case",
      "es": "un carnet paraguayo emitido por la municipalidad donde vives, cuando tu residencia lo permita, con los requisitos vigentes confirmados para tu caso",
      "pt": "uma carteira paraguaia emitida pela prefeitura do município onde você mora, quando a sua residência permitir, com os requisitos atuais confirmados para o seu caso",
      "sv": "ett paraguayanskt körkort som utfärdas av kommunen där du bor, när ditt uppehållstillstånd tillåter det, med gällande krav bekräftade för ditt fall"
    },
    "verified": false,
    "sources": [
      "https://www.asuncion.gov.py/f-a-q/requisitos-para-obtencion-de-licencias-de-conducir",
      "https://guiaparaguay.com.py/blog/canje-de-licencia-de-conducir-en-paraguay-la-guia-definitiva-para-residentes-extranjeros.html",
      "https://moveparaguay.com/en/driver-license/"
    ],
    "note": "Research 2026-09-28 (low confidence): the Municipalidad de Asunción publishes its requirements only as images (Ordenanza 479/10). Guides agree on: cédula required, blood-group certificate from a Paraguayan lab, apostilled and translated foreign licence, no tests for a straight exchange, fee around G 225,000–240,000. Kept hedged until someone reads the municipal sheet."
  },
} as const satisfies Record<string, Fact>;

export type FactKey = keyof typeof facts;

export const factKeys = Object.keys(facts) as FactKey[];

export function getFact(key: FactKey): Fact {
  return facts[key];
}

/** Picks the brand's locale out of a `LocalizedText`, falling back to `en`. */
export function localized(text: LocalizedText, locale: FactLocale = 'en'): string {
  if (typeof text === 'string') return text;
  return text[locale] ?? text.en;
}

/**
 * What a page should actually print for this fact right now, in the brand's
 * language. `<Fact>` is the only caller that matters; this is exported so the
 * admin verification screen and the tests can read the same string.
 */
export function factText(key: FactKey, locale: FactLocale = 'en'): string {
  const fact = facts[key] as Fact;
  return localized(factPublished(fact) ? fact.display : fact.hedged, locale);
}

/** A fact shows its figure once it is signed off OR carries a cited source. */
export function factPublished(fact: Fact): boolean {
  return fact.verified || Boolean(fact.sourced);
}

/**
 * Resolves `{{fact:key}}` tokens in plain-text frontmatter (an article's
 * summary, takeaways and FAQ answers) to what `<Fact k>` would print. Those
 * fields are strings, not MDX, and they are exactly what answer engines quote,
 * so they need the figure too — from this register, never typed inline.
 * An unknown key is left visible so a test can catch it.
 */
export function interpolateFacts(text: string, locale: FactLocale = 'en'): string {
  return text.replace(/\{\{fact:([\w.]+)\}\}/g, (token, key: string) =>
    key in facts ? factText(key as FactKey, locale) : token,
  );
}

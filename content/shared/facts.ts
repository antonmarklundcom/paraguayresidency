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
    "note": "Research 2026-09-26 (high confidence): Industry, commerce or services. SUACE requirement sheets add an execution schedule with the investment implemented within max 24 months (see suace.status)."
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
      "en": "still open as the productive route inside the Investor Pass: from USD 70,000, at least 5 formal jobs, investment executed within 24 months",
      "es": "sigue vigente como vía productiva dentro del Investor Pass: desde USD 70.000, al menos 5 empleos formales e inversión ejecutada en un plazo máximo de 24 meses",
      "pt": "continua vigente como rota produtiva dentro do Investor Pass: a partir de USD 70.000, pelo menos 5 empregos formais e investimento executado em até 24 meses",
      "sv": "fortfarande öppen som den produktiva vägen inom Investor Pass: från USD 70 000, minst 5 formella anställningar och investeringen genomförd inom 24 månader"
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
    "note": "Research 2026-09-26 (medium confidence): 24-month execution schedule is from the 2025 SUACE sheet under Res. 1052/2025 (now repealed); confirm Res. 0283 keeps it."
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
  }
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

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
  /** The figure/claim as it should read ONCE verified. */
  display: LocalizedText;
  /** What renders while `verified` is false. Never contains a bare number. */
  hedged: LocalizedText;
  verified: boolean;
  verifiedBy?: string;
  verifiedOn?: string;
  /** Where the unverified value came from; the resolution text is the goal. */
  sources: string[];
  note?: string;
}

export const facts = {
  'documents.police_certificate_validity': {
    key: 'documents.police_certificate_validity',
    label: 'Police certificate — recency and acceptance',
    display: {
      en: 'the applicable certificate recency window and acceptance conditions must be confirmed for your issuing country, route and filing stage',
      es: 'la vigencia y las condiciones de aceptación del certificado deben confirmarse según tu país emisor, tu ruta y la etapa de tu trámite',
      pt: 'a validade e as condições de aceitação da certidão devem ser confirmadas conforme seu país emissor, sua rota e a etapa do seu processo',
      sv: 'giltighetstiden och villkoren för godkännande av intyget måste bekräftas utifrån ditt utfärdande land, din väg och var i processen du befinner dig',
    },
    hedged: {
      en: 'the applicable certificate recency window and acceptance conditions must be confirmed for your issuing country, route and filing stage',
      es: 'la vigencia y las condiciones de aceptación del certificado deben confirmarse según tu país emisor, tu ruta y la etapa de tu trámite',
      pt: 'a validade e as condições de aceitação da certidão devem ser confirmadas conforme seu país emissor, sua rota e a etapa do seu processo',
      sv: 'giltighetstiden och villkoren för godkännande av intyget måste bekräftas utifrån ditt utfärdande land, din väg och var i processen du befinner dig',
    },
    verified: false,
    sources: [],
    note: 'No verified validity window or nationality-specific enforcement evidence supplied. Confirm the accepted issuer, document form, authentication and translation conditions, the date used to assess recency, and whether later review can require a replacement before adding figures or verifying.',
  },
  'investorpass.min_investment_usd': {
    key: 'investorpass.min_investment_usd',
    label: 'Investor Pass — minimum qualifying investment',
    display: {
      en: 'from USD 70,000',
      es: 'desde USD 70.000',
      pt: 'a partir de USD 70.000',
      sv: 'från USD 70 000',
    },
    hedged: {
      en: 'from a qualifying investment amount we confirm in writing for your case',
      es: 'desde un monto de inversión que confirmamos por escrito para tu caso',
      pt: 'a partir de um valor de investimento que confirmamos por escrito para o seu caso',
      sv: 'från ett investeringsbelopp som vi bekräftar skriftligt för ditt fall',
    },
    verified: false,
    sources: [
      'https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html',
      'https://immigrantinvest.com/insider/paraguay-investor-pass/',
      'https://finance.yahoo.com/economy/policy/articles/paraguay-offers-direct-permanent-residency-152937040.html',
    ],
    note: 'Public sources disagree (70k / 150k / 200k USD). Obtain the resolution text (cited as Resolución 0283/2026) before verifying.',
  },
  'investorpass.launch_date': {
    key: 'investorpass.launch_date',
    label: 'Investor Pass — programme launch',
    display: 'April 2026',
    hedged: 'programme launch and current status confirmed in writing for your case',
    verified: false,
    sources: [
      'https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html',
    ],
  },
  'investorpass.validity_years': {
    key: 'investorpass.validity_years',
    label: 'Investor Pass — residency validity',
    display: '10 years',
    hedged: 'a long-validity permanent card — we confirm the exact term in writing before you file',
    verified: false,
    sources: ['https://immigrantinvest.com/insider/paraguay-investor-pass/'],
  },
  'permanent.presence_rule': {
    key: 'permanent.presence_rule',
    label: 'Permanent residency — presence requirement',
    display: {
      en: 'at least one entry every three years',
      es: 'al menos una entrada cada tres años',
      pt: 'pelo menos uma entrada a cada três anos',
      sv: 'minst en inresa vart tredje år',
    },
    hedged: {
      en: 'a minimum-presence rule applies — we tell you exactly what it means for your travel pattern',
      es: 'existe una regla de presencia mínima — te decimos exactamente qué significa para tu forma de viajar',
      pt: 'há uma exigência de presença mínima — explicamos o que ela significa para seus planos de viagem',
      sv: 'ett krav på minsta närvaro gäller — vi förklarar vad det innebär för dina resplaner',
    },
    verified: false,
    sources: [
      'https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html',
    ],
    note: 'Presence rules are the single most-misquoted figure in this niche. Do not publish unhedged.',
  },
  'temporary.duration': {
    key: 'temporary.duration',
    label: 'Temporary residency — duration',
    display: {
      en: 'two years, then permanent',
      es: 'dos años, y después permanente',
      pt: "dois anos, depois permanente",
      sv: "två år, sedan permanent",
    },
    hedged: {
      en: 'a fixed initial term, after which you apply for permanent residency — current term confirmed in writing for your case',
      es: 'un plazo inicial fijo, tras el cual solicitas la residencia permanente — el plazo vigente te lo confirmamos por escrito para tu caso',
      pt: "um prazo inicial fixo, após o qual você solicita a residência permanente — confirmamos o prazo vigente por escrito para o seu caso",
      sv: "en fast inledande period, varefter du ansöker om permanent uppehållstillstånd — aktuell giltighet bekräftas skriftligt för ditt fall",
    },
    verified: false,
    sources: ['https://immigrantinvest.com/insider/paraguay-investor-pass/'],
  },
  'cedula.timeline': {
    key: 'cedula.timeline',
    label: 'Cédula — typical timeline',
    display: {
      en: 'issued within weeks of residency approval',
      es: 'se emite semanas después de aprobarse la residencia',
      pt: "emitida em semanas após a aprovação da residência",
      sv: "utfärdas inom veckor efter beviljat uppehållstillstånd",
    },
    hedged: {
      en: 'issued after your residency is approved — we give you a current, realistic window, not a best case',
      es: 'se emite una vez aprobada tu residencia — te damos un plazo real y actual, no el mejor caso posible',
      pt: "emitida após a aprovação da residência — damos um prazo atual e realista, não o melhor cenário",
      sv: "utfärdas efter att ditt uppehållstillstånd har beviljats — vi ger dig en aktuell, realistisk tidsram, inte ett bästa scenario",
    },
    verified: false,
    sources: [],
  },
  'tax.territorial_rate': {
    key: 'tax.territorial_rate',
    label: 'Personal income tax — territorial rate',
    display: {
      en: '10% on Paraguay-sourced income',
      es: '10% sobre la renta de fuente paraguaya',
      pt: '10% sobre a renda de fonte paraguaia',
      sv: '10% på inkomst från paraguayansk källa',
    },
    hedged: {
      en: 'a low flat rate on Paraguay-sourced income under a territorial system — your accountant confirms your case',
      es: 'un tipo fijo bajo sobre la renta de fuente paraguaya bajo un sistema territorial — tu asesor confirma tu caso concreto',
      pt: 'uma alíquota fixa baixa sobre a renda de fonte paraguaia em um sistema territorial — seu contador avalia o seu caso',
      sv: 'en låg enhetlig skattesats på inkomst från paraguayansk källa inom ett territoriellt system — din skatterådgivare bedömer ditt fall',
    },
    verified: false,
    sources: [],
    note: 'Tax wording must never read as advice. Keep hedged until the partner firm signs off.',
  },
  /**
   * Added in S4 for `/investor-pass/investment-routes` (plan §6.2): each of
   * the four qualifying routes gets its own hedged threshold rather than
   * reusing the generic `investorpass.min_investment_usd` figure, because
   * public sources do not even agree the routes share one minimum.
   */
  'investorpass.route_real_estate_usd': {
    key: 'investorpass.route_real_estate_usd',
    label: 'Investor Pass — real estate route minimum',
    display: 'from USD 70,000 in qualifying real estate',
    hedged: 'a qualifying real-estate purchase, with the current minimum confirmed in writing for your case',
    verified: false,
    sources: [
      'https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html',
      'https://immigrantinvest.com/insider/paraguay-investor-pass/',
    ],
    note: 'Per-route minimums are not consistently reported; treat as the same open question as investorpass.min_investment_usd until the resolution text is obtained.',
  },
  'investorpass.route_business_usd': {
    key: 'investorpass.route_business_usd',
    label: 'Investor Pass — productive business route minimum',
    display: 'from USD 70,000 invested in a productive business',
    hedged: 'a qualifying investment in a productive business, with the current minimum confirmed in writing for your case',
    verified: false,
    sources: [
      'https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html',
    ],
    note: 'Same open question as investorpass.min_investment_usd.',
  },
  'investorpass.route_financial_usd': {
    key: 'investorpass.route_financial_usd',
    label: 'Investor Pass — financial instruments route minimum',
    display: 'from USD 70,000 in qualifying financial instruments',
    hedged: 'a qualifying financial-instrument investment, with the current minimum confirmed in writing for your case',
    verified: false,
    sources: [
      'https://immigrantinvest.com/insider/paraguay-investor-pass/',
    ],
    note: 'Same open question as investorpass.min_investment_usd.',
  },
  'investorpass.route_tourism_usd': {
    key: 'investorpass.route_tourism_usd',
    label: 'Investor Pass — tourism-sector route minimum',
    display: 'from USD 70,000 invested in a qualifying tourism project',
    hedged: 'a qualifying tourism-sector investment, with the current minimum confirmed in writing for your case',
    verified: false,
    sources: [
      'https://finance.yahoo.com/economy/policy/articles/paraguay-offers-direct-permanent-residency-152937040.html',
    ],
    note: 'Same open question as investorpass.min_investment_usd. Tourism-sector qualification criteria are the least documented of the four routes publicly.',
  },
  /**
   * Added in O9 for the ES and PT brands (§11.6–§11.7), whose Mercosur pages
   * must never state the route as settled law without the resolution text.
   */
  'mercosur.residency_route': {
    key: 'mercosur.residency_route',
    label: 'Mercosur nationals — simplified residency route',
    display: {
      en: 'a simplified residency route for Mercosur nationals',
      es: 'una vía de residencia simplificada para nacionales del Mercosur',
      pt: 'uma rota de residência simplificada para nacionais do Mercosul',
      sv: 'en förenklad väg till uppehållstillstånd för medborgare i Mercosur-länder',
    },
    hedged: {
      en: 'Mercosur nationality can simplify parts of the process — we tell you exactly which parts, for your nationality, before you file',
      es: 'la nacionalidad Mercosur puede simplificar partes del trámite — te decimos exactamente cuáles, según tu nacionalidad, antes de presentar nada',
      pt: 'a nacionalidade do Mercosul pode simplificar partes do processo — dizemos exatamente quais, para a sua nacionalidade, antes de protocolar',
      sv: 'medborgarskap i ett Mercosur-land kan förenkla delar av processen — vi säger exakt vilka delar, för ditt medborgarskap, innan något lämnas in',
    },
    verified: false,
    sources: [],
    note: 'The Mercosur residence agreement is implemented through national rules that change. Never publish it as a fixed entitlement.',
  },
  /**
   * Added in O9 for the `frontier` brand (§11.5), whose rule is that every tax
   * sentence renders this fact or `tax.territorial_rate`, and that the brand
   * never says "tax-free".
   */
  'tax.foreign_income_treatment': {
    key: 'tax.foreign_income_treatment',
    label: 'Foreign-source income under the territorial system',
    display: {
      en: 'foreign-source income is generally outside Paraguayan income tax',
      es: 'las rentas de fuente extranjera quedan por lo general fuera del impuesto paraguayo',
      pt: 'a renda de fonte estrangeira fica, em geral, fora do imposto paraguaio',
      sv: 'inkomst från utländsk källa ligger i regel utanför paraguayansk inkomstskatt',
    },
    hedged: {
      en: 'Paraguay taxes territorially, which changes how foreign income is treated — what that means for your own country and your own income is a question for your accountant, and we say so rather than promising anything',
      es: 'Paraguay aplica un sistema territorial, lo que cambia el trato de las rentas del exterior — qué significa eso para tu país y para tus ingresos es una pregunta para tu asesor, y lo decimos en vez de prometer nada',
      pt: 'o Paraguai tributa de forma territorial, o que muda o tratamento da renda vinda de fora — o que isso significa para o seu país e para a sua renda é pergunta para o seu contador, e a gente diz isso em vez de prometer qualquer coisa',
      sv: 'Paraguay beskattar territoriellt, vilket ändrar hur utländsk inkomst behandlas — vad det betyder för ditt eget land och din egen inkomst är en fråga för din skatterådgivare, och det säger vi hellre än lovar något',
    },
    verified: false,
    sources: [],
    note: 'Never renders as "tax-free" (plan §11.5). Territoriality is not exemption, and the reader\'s home country still has its own rules.',
  },
  /**
   * Added in S12 for `/custo-de-vida` (plan §6.7, §11.7): the brand name
   * promises a living-cost answer, but no verified local cost-of-living
   * source has been reviewed yet, so every entry stays comparative and
   * hedged rather than naming a rent or grocery figure that would look
   * precise and be unverifiable. `en` is required by `LocalizedText`; only
   * `residenciapt` renders these today.
   */
  'costofliving.overview': {
    key: 'costofliving.overview',
    label: 'Cost of living — general comparison for Brazilians',
    display: {
      en: 'a monthly budget shaped by your city, lifestyle and household size',
      pt: 'um orçamento mensal que a maioria compara ao de uma capital brasileira de porte médio, não aos preços do Rio ou de São Paulo',
      es: 'un presupuesto mensual que depende de la ciudad, el estilo de vida y el tamaño de la familia',
      sv: 'en månadsbudget som beror på stad, livsstil och familjens storlek',
    },
    hedged: {
      en: 'your budget depends on city, lifestyle and household size — we walk through your own spending rather than quoting an average that fits nobody',
      pt: 'visivelmente mais baixo do que Rio ou São Paulo para a maioria das pessoas, mas passamos pelos seus números de verdade — cidade, estilo de vida, tamanho da família — por escrito, em vez de citar uma média que não serve para ninguém',
      es: 'el presupuesto depende de la ciudad, el estilo de vida y el tamaño de la familia — revisamos tus gastos contigo en vez de dar una media que no se ajuste a tu caso',
      sv: 'budgeten beror på stad, livsstil och familjens storlek — vi går igenom dina utgifter tillsammans i stället för att ange ett genomsnitt som inte passar dig',
    },
    verified: false,
    sources: [],
    note: 'No reviewed local cost-of-living index yet. Keep comparative, never a bare monthly figure.',
  },
  'costofliving.rent': {
    key: 'costofliving.rent',
    label: 'Cost of living — typical rent range',
    display: {
      en: 'rent that varies by city, neighbourhood and property type',
      pt: 'um aluguel que fica bem abaixo do de capitais brasileiras equivalentes, com Assunção custando mais do que cidades menores e a região de fronteira',
      es: 'alquileres que varían según la ciudad, el barrio y el tipo de vivienda',
      sv: 'hyror som varierar med stad, område och bostadstyp',
    },
    hedged: {
      en: 'rent depends on your city and the kind of place you want — we review current ranges together rather than quoting a number that goes stale',
      pt: 'aluguel é uma das categorias em que o Paraguai claramente custa menos — a faixa exata para a sua cidade e o tipo de imóvel que você quer é algo que confirmamos juntos, em vez de um número que fica desatualizado',
      es: 'el alquiler depende de la ciudad y del tipo de vivienda — revisamos contigo un rango actualizado para lo que buscas',
      sv: 'hyran beror på stad och bostadstyp — vi går igenom aktuella hyresnivåer för det boende du söker',
    },
    verified: false,
    sources: [],
    note: 'No reviewed local cost-of-living index yet. Keep comparative, never a bare rent figure.',
  },
  'costofliving.groceries': {
    key: 'costofliving.groceries',
    label: 'Cost of living — groceries and eating out',
    display: {
      en: 'grocery and restaurant spending shaped by the products and places you choose',
      pt: 'mercado e restaurante com preço mais parecido com o de uma cidade do interior brasileiro do que com o Rio ou São Paulo',
      es: 'gastos de supermercado y restaurantes que dependen de los productos y establecimientos que elijas',
      sv: 'utgifter för mat och restaurangbesök som beror på vilka varor och ställen du väljer',
    },
    hedged: {
      en: 'day-to-day spending is one of the categories we can walk through with real receipts from clients already living there, rather than a generic basket-of-goods number',
      pt: 'o gasto do dia a dia é uma das categorias que conseguimos mostrar com recibos reais de clientes que já moram lá, em vez de uma cesta básica genérica',
      es: 'podemos revisar los gastos cotidianos con recibos reales de clientes que ya viven allí, en vez de usar una cesta de productos genérica',
      sv: 'vi kan gå igenom vardagsutgifter med riktiga kvitton från kunder som redan bor där, i stället för att utgå från en generell varukorg',
    },
    verified: false,
    sources: [],
    note: 'No reviewed local cost-of-living index yet. Keep comparative, never a bare grocery figure.',
  },
  'pricing.temporary': {
    key: 'pricing.temporary',
    label: 'Temporary residency — service fee',
    display: {
      en: 'fixed service fee confirmed in writing',
      es: 'honorario fijo confirmado por escrito',
      pt: 'honorário fixo confirmado por escrito',
      sv: 'fast arvode som bekräftas skriftligt',
    },
    hedged: {
      en: 'a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit',
      es: 'un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas',
      pt: 'um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir',
      sv: 'ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig',
    },
    verified: false,
    sources: [],
    note: 'No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee.',
  },
  'pricing.permanent': {
    key: 'pricing.permanent',
    label: 'Permanent residency — service fee',
    display: {
      en: 'fixed service fee confirmed in writing',
      es: 'honorario fijo confirmado por escrito',
      pt: 'honorário fixo confirmado por escrito',
      sv: 'fast arvode som bekräftas skriftligt',
    },
    hedged: {
      en: 'a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit',
      es: 'un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas',
      pt: 'um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir',
      sv: 'ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig',
    },
    verified: false,
    sources: [],
    note: 'No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee.',
  },
  'pricing.cedula': {
    key: 'pricing.cedula',
    label: 'Cédula de identidad — service fee',
    display: {
      en: 'fixed service fee confirmed in writing',
      es: 'honorario fijo confirmado por escrito',
      pt: 'honorário fixo confirmado por escrito',
      sv: 'fast arvode som bekräftas skriftligt',
    },
    hedged: {
      en: 'a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit',
      es: 'un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas',
      pt: 'um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir',
      sv: 'ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig',
    },
    verified: false,
    sources: [],
    note: 'No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee.',
  },
  'pricing.tax_residency': {
    key: 'pricing.tax_residency',
    label: 'Tax residency and RUC — service fee',
    display: {
      en: 'fixed service fee confirmed in writing',
      es: 'honorario fijo confirmado por escrito',
      pt: 'honorário fixo confirmado por escrito',
      sv: 'fast arvode som bekräftas skriftligt',
    },
    hedged: {
      en: 'a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit',
      es: 'un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas',
      pt: 'um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir',
      sv: 'ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig',
    },
    verified: false,
    sources: [],
    note: 'No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee.',
  },
  'pricing.family': {
    key: 'pricing.family',
    label: 'Family filing — service fee',
    display: {
      en: 'fixed service fee confirmed in writing',
      es: 'honorario fijo confirmado por escrito',
      pt: 'honorário fixo confirmado por escrito',
      sv: 'fast arvode som bekräftas skriftligt',
    },
    hedged: {
      en: 'a fixed service fee quoted in writing — we confirm the scope and separate costs before you commit',
      es: 'un honorario fijo cotizado por escrito — confirmamos el alcance y los gastos separados antes de que te comprometas',
      pt: 'um honorário fixo cotado por escrito — confirmamos o escopo e os custos separados antes de você decidir',
      sv: 'ett fast arvode som vi offererar skriftligt — vi bekräftar omfattningen och de separata kostnaderna innan du bestämmer dig',
    },
    verified: false,
    sources: [],
    note: 'No approved service price supplied. Confirm the route scope and separate costs with the team before entering a figure or verifying. Government fees and document-provider charges are not this service fee.',
  },
  'residency.timeline': {
    "key": "residency.timeline",
    "label": "Residency application — processing window",
    "display": {
      "en": "a case-specific processing window confirmed in writing for your case; document readiness and authority review affect the timing",
      "es": "un plazo de tramitación para tu caso confirmado por escrito; depende de los documentos y de la revisión de la autoridad",
      "pt": "um prazo de tramitação para seu caso confirmado por escrito; depende dos documentos e da análise da autoridade",
      "sv": "en handläggningstid för ditt ärende som bekräftas skriftligt; dokument och myndighetens prövning påverkar tiden"
    },
    "hedged": {
      "en": "a case-specific processing window confirmed in writing for your case; document readiness and authority review affect the timing",
      "es": "un plazo de tramitación para tu caso confirmado por escrito; depende de los documentos y de la revisión de la autoridad",
      "pt": "um prazo de tramitação para seu caso confirmado por escrito; depende dos documentos e da análise da autoridade",
      "sv": "en handläggningstid för ditt ärende som bekräftas skriftligt; dokument och myndighetens prövning påverkar tiden"
    },
    "verified": false,
    "sources": [],
    "note": "No verified processing estimate supplied. Confirm a case-specific window before adding any number or verifying; this is not the residency validity term."
  },
  'tax.timeline': {
    "key": "tax.timeline",
    "label": "Tax residency and RUC — processing window",
    "display": {
      "en": "a separate tax and RUC processing window confirmed with the accountant for your case; residency approval does not set this timeline",
      "es": "un plazo separado para los trámites fiscales y el RUC, confirmado con el asesor para tu caso; la aprobación de residencia no fija este plazo",
      "pt": "um prazo separado para os trâmites fiscais e o RUC, confirmado com o contador para seu caso; a aprovação da residência não define esse prazo",
      "sv": "en separat tidsram för skatteärendet och RUC som bekräftas med revisorn för ditt ärende; beviljat uppehållstillstånd avgör inte denna tidsram"
    },
    "hedged": {
      "en": "a separate tax and RUC processing window confirmed with the accountant for your case; residency approval does not set this timeline",
      "es": "un plazo separado para los trámites fiscales y el RUC, confirmado con el asesor para tu caso; la aprobación de residencia no fija este plazo",
      "pt": "um prazo separado para os trâmites fiscais e o RUC, confirmado com o contador para seu caso; a aprovação da residência não define esse prazo",
      "sv": "en separat tidsram för skatteärendet och RUC som bekräftas med revisorn för ditt ärende; beviljat uppehållstillstånd avgör inte denna tidsram"
    },
    "verified": false,
    "sources": [],
    "note": "No verified processing estimate supplied. Confirm a case-specific window before adding any number or verifying; this is not the residency validity term."
  },
  'investorpass.timeline': {
    "key": "investorpass.timeline",
    "label": "Investor Pass — processing window",
    "display": {
      "en": "a case-specific window confirmed in writing before filing; investment structuring, source-of-funds documents and authority review affect the timing",
      "es": "un plazo para tu caso confirmado por escrito antes de presentar la solicitud; depende de la estructura de inversión, el origen de los fondos y la revisión de la autoridad",
      "pt": "um prazo para seu caso confirmado por escrito antes do protocolo; depende da estrutura do investimento, da origem dos recursos e da análise da autoridade",
      "sv": "en tidsram för ditt ärende som bekräftas skriftligt före ansökan; investeringens upplägg, dokument om kapitalets ursprung och myndighetens prövning påverkar tiden"
    },
    "hedged": {
      "en": "a case-specific window confirmed in writing before filing; investment structuring, source-of-funds documents and authority review affect the timing",
      "es": "un plazo para tu caso confirmado por escrito antes de presentar la solicitud; depende de la estructura de inversión, el origen de los fondos y la revisión de la autoridad",
      "pt": "um prazo para seu caso confirmado por escrito antes do protocolo; depende da estrutura do investimento, da origem dos recursos e da análise da autoridade",
      "sv": "en tidsram för ditt ärende som bekräftas skriftligt före ansökan; investeringens upplägg, dokument om kapitalets ursprung och myndighetens prövning påverkar tiden"
    },
    "verified": false,
    "sources": [],
    "note": "No verified processing estimate supplied. Confirm a case-specific window before adding any number or verifying; this is not the residency validity term."
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
  return localized(fact.verified ? fact.display : fact.hedged, locale);
}

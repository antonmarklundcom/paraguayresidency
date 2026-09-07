/**
 * Every legal or financial figure on any of the three sites lives here
 * (plan §1.10 / §4.11). Nothing is written as a bare number in JSX or MDX.
 *
 * Until Anton's legal partner verifies an entry (`verified: true` plus
 * `verifiedBy`/`verifiedOn`), pages render `hedged` — wording that points the
 * reader at a call instead of quoting a figure we cannot stand behind.
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
  'investorpass.min_investment_usd': {
    key: 'investorpass.min_investment_usd',
    label: 'Investor Pass — minimum qualifying investment',
    display: 'from USD 70,000',
    hedged: 'from a qualifying investment amount we confirm on your call',
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
    hedged: 'launched in 2026 — we confirm the current programme status on your call',
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
    display: 'at least one entry every three years',
    hedged: 'a minimum-presence rule applies — we tell you exactly what it means for your travel pattern',
    verified: false,
    sources: [
      'https://www.fragomen.com/insights/paraguay-new-investor-pass-expands-permanent-residence-options.html',
    ],
    note: 'Presence rules are the single most-misquoted figure in this niche. Do not publish unhedged.',
  },
  'temporary.duration': {
    key: 'temporary.duration',
    label: 'Temporary residency — duration',
    display: 'two years, then permanent',
    hedged: 'a fixed initial term, after which you apply for permanent residency — current term confirmed on your call',
    verified: false,
    sources: ['https://immigrantinvest.com/insider/paraguay-investor-pass/'],
  },
  'cedula.timeline': {
    key: 'cedula.timeline',
    label: 'Cédula — typical timeline',
    display: 'issued within weeks of residency approval',
    hedged: 'issued after your residency is approved — we give you a current, realistic window, not a best case',
    verified: false,
    sources: [],
  },
  'tax.territorial_rate': {
    key: 'tax.territorial_rate',
    label: 'Personal income tax — territorial rate',
    display: '10% on Paraguay-sourced income',
    hedged: 'a low flat rate on Paraguay-sourced income under a territorial system — your accountant confirms your case',
    verified: false,
    sources: [],
    note: 'Tax wording must never read as advice. Keep hedged until the partner firm signs off.',
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

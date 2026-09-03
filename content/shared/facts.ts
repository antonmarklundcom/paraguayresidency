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

export interface Fact {
  /** Stable key used as `<Fact k="…" />`. */
  key: string;
  /** Short human label, e.g. for the admin verification screen. */
  label: string;
  /** The figure/claim as it should read ONCE verified. */
  display: string;
  /** What renders while `verified` is false. Never contains a bare number. */
  hedged: string;
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
} as const satisfies Record<string, Fact>;

export type FactKey = keyof typeof facts;

export const factKeys = Object.keys(facts) as FactKey[];

export function getFact(key: FactKey): Fact {
  return facts[key];
}

/** What a page should actually print for this fact right now. */
export function factText(key: FactKey): string {
  const fact = facts[key];
  return fact.verified ? fact.display : fact.hedged;
}

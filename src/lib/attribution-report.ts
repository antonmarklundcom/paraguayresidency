import { EXPERIMENTS } from './experiments';

/**
 * The `/admin/attribution` report (O24, items 3 and 10), pure so it is tested
 * without a database: rows in, counts out.
 *
 * "Source" is the FIRST touch — the campaign or site that earned the visitor
 * (`leads.attribution`) — falling back to last-touch UTM, then to the
 * referrer's host, then `(direct)`. The same rule labels WhatsApp clicks.
 */

export interface LeadRow {
  id: number;
  site: string;
  kind: string;
  pagePath: string | null;
  attribution: unknown;
  utm: unknown;
  createdAt: Date;
}

export interface ClickRow {
  site: string;
  path: string | null;
  source: string | null;
  variant: string | null;
  createdAt: Date;
}

export interface Bucket {
  key: string;
  last7: number;
  last30: number;
}

const DAY = 86_400_000;

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
};
const str = (value: unknown): string | undefined => (typeof value === 'string' && value ? value : undefined);

function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/** First-touch source label for a lead. */
export function leadSource(row: Pick<LeadRow, 'attribution' | 'utm'>): string {
  const first = obj(row.attribution);
  const last = obj(row.utm);
  return (
    str(first.utm_source) ??
    (str(first.gclid) ? 'google-ads' : undefined) ??
    (str(first.fbclid) ? 'facebook-ads' : undefined) ??
    str(last.utm_source) ??
    hostOf(str(first.referrer)) ??
    '(direct)'
  );
}

/** Kind as reported: a pre-migration WhatsApp lead is stored as `contact` + marker. */
export function reportKind(row: Pick<LeadRow, 'kind' | 'attribution'>): string {
  return row.kind === 'contact' && obj(row.attribution).lead_kind === 'whatsapp' ? 'whatsapp' : row.kind;
}

export function leadExperiments(row: Pick<LeadRow, 'attribution'>): Record<string, string> {
  const experiments = obj(obj(row.attribution).experiments);
  return Object.fromEntries(Object.entries(experiments).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
}

function bucketize<T>(rows: T[], keyOf: (row: T) => string, dateOf: (row: T) => Date, now: Date): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const row of rows) {
    const age = now.getTime() - dateOf(row).getTime();
    if (age < 0 || age > 30 * DAY) continue;
    const key = keyOf(row);
    const bucket = map.get(key) ?? { key, last7: 0, last30: 0 };
    bucket.last30 += 1;
    if (age <= 7 * DAY) bucket.last7 += 1;
    map.set(key, bucket);
  }
  return [...map.values()].sort((a, b) => b.last30 - a.last30 || b.last7 - a.last7 || a.key.localeCompare(b.key));
}

export interface AttributionReport {
  totals: { last7: number; last30: number };
  bySite: Bucket[];
  byPage: Bucket[];
  byLanding: Bucket[];
  bySource: Bucket[];
  byKind: Bucket[];
  clicks: { totals: { last7: number; last30: number }; byPage: Bucket[]; bySource: Bucket[]; bySite: Bucket[] };
  experiments: ExperimentReadout[];
}

export function buildAttributionReport(leads: LeadRow[], clicks: ClickRow[], now = new Date()): AttributionReport {
  const total = (rows: { createdAt: Date }[]) => {
    const recent = rows.filter((r) => now.getTime() - r.createdAt.getTime() <= 30 * DAY);
    return {
      last30: recent.length,
      last7: recent.filter((r) => now.getTime() - r.createdAt.getTime() <= 7 * DAY).length,
    };
  };
  const at = (row: { createdAt: Date }) => row.createdAt;
  return {
    totals: total(leads),
    bySite: bucketize(leads, (r) => r.site, at, now),
    byPage: bucketize(leads, (r) => `${r.site} ${r.pagePath ?? '(unknown)'}`, at, now),
    byLanding: bucketize(leads, (r) => `${r.site} ${str(obj(r.attribution).landing_page) ?? '(unknown)'}`, at, now),
    bySource: bucketize(leads, leadSource, at, now),
    byKind: bucketize(leads, reportKind, at, now),
    clicks: {
      totals: total(clicks),
      byPage: bucketize(clicks, (r) => `${r.site} ${r.path ?? '(unknown)'}`, at, now),
      bySource: bucketize(clicks, (r) => r.source ?? '(direct)', at, now),
      bySite: bucketize(clicks, (r) => r.site, at, now),
    },
    experiments: experimentReadout(leads, clicks, now),
  };
}

/* ------------------------------------------------------ the A/B readout */

/**
 * Below this many leads per variant the readout says "not enough data yet"
 * instead of showing a leader. It is a floor for eyeballing, not a
 * significance test: the page makes no statistical claim either way.
 */
export const MIN_LEADS_PER_VARIANT = 30;

export interface ExperimentReadout {
  id: string;
  variants: { variant: string; leads: number; clicks: number }[];
  enoughData: boolean;
  /** The variant with the most leads, only when `enoughData` and not tied. */
  ahead: string | null;
}

export function experimentReadout(leads: LeadRow[], clicks: ClickRow[], now = new Date()): ExperimentReadout[] {
  const inWindow = (d: Date) => now.getTime() - d.getTime() <= 30 * DAY;
  return EXPERIMENTS.map((experiment) => {
    const variants = experiment.variants.map((variant) => ({
      variant,
      leads: leads.filter((row) => inWindow(row.createdAt) && leadExperiments(row)[experiment.id] === variant).length,
      clicks: clicks.filter(
        (row) => inWindow(row.createdAt) && (row.variant ?? '').split(',').includes(`${experiment.id}:${variant}`),
      ).length,
    }));
    const enoughData = variants.every((v) => v.leads >= MIN_LEADS_PER_VARIANT);
    const sorted = [...variants].sort((a, b) => b.leads - a.leads);
    const ahead = enoughData && sorted[0].leads > sorted[1]?.leads ? sorted[0].variant : null;
    return { id: experiment.id, variants, enoughData, ahead };
  });
}

/* ------------------------------------------------------------ the export */

export const ATTRIBUTION_CSV_COLUMNS = [
  'id',
  'createdAt',
  'site',
  'kind',
  'source',
  'pagePath',
  'landing_page',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'last_utm_source',
  'last_utm_campaign',
  'article_slug',
  'experiments',
  'first_seen',
];

/** One flat row per lead: attribution only, no contact details (the leads CSV has those). */
export function attributionCsvRow(row: LeadRow): Record<string, unknown> {
  const first = obj(row.attribution);
  const last = obj(row.utm);
  return {
    id: row.id,
    createdAt: row.createdAt,
    site: row.site,
    kind: reportKind(row),
    source: leadSource(row),
    pagePath: row.pagePath,
    landing_page: str(first.landing_page),
    referrer: str(first.referrer),
    utm_source: str(first.utm_source),
    utm_medium: str(first.utm_medium),
    utm_campaign: str(first.utm_campaign),
    last_utm_source: str(last.utm_source),
    last_utm_campaign: str(last.utm_campaign),
    article_slug: str(first.article_slug),
    experiments: Object.entries(leadExperiments(row)).map(([k, v]) => `${k}:${v}`).join(','),
    first_seen: str(first.first_seen),
  };
}

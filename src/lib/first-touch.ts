import { UTM_KEYS } from './utm';

/**
 * The first-touch attribution cookie (`vc_attr`): its shape, how it is read
 * and — since O24 item 3 — how it is written. Dependency-free on purpose:
 * `src/proxy.ts` imports it on every request. The rest of the attribution
 * logic (first touch vs last touch on the lead, dedupe) is in `attribution.ts`.
 */

/** Keys the attribution cookie may carry. Anything else is dropped. */
export const ATTRIBUTION_KEYS = [
  ...UTM_KEYS,
  'landing_page',
  'referrer',
  'first_seen',
] as const;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

/**
 * Reads the CRM's `vc_attr` cookie. It is written by the visitor's browser, so
 * it is untrusted input: unknown keys, non-strings and oversized values are
 * dropped rather than stored, and a malformed cookie is simply no attribution.
 */
export function parseAttribution(cookieValue: string | undefined | null): Attribution {
  if (!cookieValue) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  const allowed = new Set<string>(ATTRIBUTION_KEYS);
  const out: Attribution = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!allowed.has(key)) continue;
    if (typeof value !== 'string' || value === '') continue;
    out[key as keyof Attribution] = value.slice(0, 500);
  }
  return out;
}


/* ------------------------------------------------- the first-touch cookie */

/**
 * `vc_attr`: written by `src/proxy.ts` on the first page view that carries an
 * attribution signal (O24, item 3). Until O24 nothing wrote it, so first
 * touch was only ever the form's own page. Named after the VenderCRM cookie
 * it replaces, so a CRM script that also writes it stays compatible.
 */
export const ATTRIBUTION_COOKIE = 'vc_attr';
export const ATTRIBUTION_MAX_AGE_S = 90 * 86_400;

/**
 * The first-touch record for a landing request, or null when there is
 * nothing worth recording (a direct visit with no campaign parameters and no
 * outside referrer — the form's own page and the submit request cover that).
 * Pure; the proxy passes the request's query string, `Referer` and host.
 */
export function landingAttribution(input: {
  search: string;
  referrer?: string | null;
  host?: string | null;
  path: string;
  now?: Date;
}): Attribution | null {
  const params = new URLSearchParams(input.search);
  const out: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 200);
  }
  const referrer = externalReferrer(input.referrer, input.host);
  if (referrer) out.referrer = referrer;
  if (!Object.keys(out).length) return null;
  out.landing_page = input.path.slice(0, 500);
  out.first_seen = (input.now ?? new Date()).toISOString();
  return out;
}

/**
 * A referrer from another site, reduced to origin + path (a query string can
 * carry someone's search terms or tokens). Our own hosts are not a referrer.
 */
export function externalReferrer(referrer: string | null | undefined, host: string | null | undefined): string | null {
  if (!referrer) return null;
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const own = (host ?? '').toLowerCase().split(':')[0].replace(/^www\./, '');
  if (own && url.hostname.toLowerCase().replace(/^www\./, '') === own) return null;
  return `${url.origin}${url.pathname}`.slice(0, 500);
}

/** Cookie value: the same encoding `parseAttribution` reads. */
export function serializeAttribution(value: Attribution): string {
  return encodeURIComponent(JSON.stringify(value));
}

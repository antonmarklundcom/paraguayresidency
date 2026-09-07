import { createHash } from 'node:crypto';
import { UTM_KEYS } from './lead-schema';

/**
 * First-touch attribution and submit deduplication, ported from
 * `flyttatillparaguay` in O9 (plan §5.4.7, §12.4).
 *
 * Both are pure functions here so they can be tested without a request, a
 * cookie jar or a database. Nothing from flytta replaces O2's flow — the
 * signed-timestamp and honeypot guard still run first, and the local `leads`
 * row is still written before anything leaves the server.
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

/**
 * The row we store on `leads.attribution`.
 *
 * FIRST touch wins: if the cookie already carries a `utm_source` from the
 * visitor's first session, the one on today's URL does not overwrite it. That
 * is the whole point of the column — `leads.utm` already holds last touch.
 */
export function firstTouch(input: {
  cookie: Attribution;
  landingPath?: string | null;
  referrer?: string | null;
  now?: Date;
}): Attribution {
  const out: Attribution = { ...input.cookie };
  if (!out.landing_page && input.landingPath) out.landing_page = input.landingPath.slice(0, 500);
  if (!out.referrer && input.referrer) out.referrer = input.referrer.slice(0, 500);
  if (!out.first_seen) out.first_seen = (input.now ?? new Date()).toISOString();
  return out;
}

export function hasAttribution(value: Attribution): boolean {
  return Object.keys(value).length > 0;
}

/* --------------------------------------------------------- deduplication */

/**
 * How long two submissions from the same phone count as one (plan §5.4.7).
 *
 * flytta bucketed by the calendar hour, which has a nasty edge: two clicks a
 * second apart at 10:59:59 and 11:00:01 land in different buckets and create
 * two contacts. A rolling window has the opposite failure — it never closes —
 * so this keeps the bucket but makes it explicit and short.
 */
export const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

/** Digits only, so `+595 981 000 000` and `595981000000` are one person. */
export function normalisePhone(phone: string): string {
  return phone.replace(/\D+/g, '');
}

/**
 * `sha256(site|phone|bucket)`. The site is in the key because the same person
 * enquiring on two brands is two leads for two teams, not a duplicate.
 *
 * Returns null when there is no usable phone: those leads are stored without a
 * dedupe key, and MySQL allows any number of NULLs in a unique index.
 */
export function dedupeKey(input: {
  site: string;
  phone?: string | null;
  now?: Date;
}): string | null {
  const digits = normalisePhone(input.phone ?? '');
  if (digits.length < 6) return null;
  const bucket = Math.floor((input.now ?? new Date()).getTime() / DEDUPE_WINDOW_MS);
  return createHash('sha256').update(`${input.site}|${digits}|${bucket}`).digest('hex');
}

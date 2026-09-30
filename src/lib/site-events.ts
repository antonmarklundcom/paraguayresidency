import 'server-only';
import { getDb, hasDatabase } from '@/db';
import { siteEvents } from '@/db/schema';
import type { SiteKey } from '@/sites/registry';
import { dbFeatures, forgetDbFeatures, isMissingTable } from './db-features';
import { log } from './log';

/**
 * Anonymous conversion signals (O24, item 2). Today one type: a click on a
 * WhatsApp link, posted by `WhatsAppClickTracker` as a beacon to `/api/track`.
 *
 * Nothing personal is ever accepted: the body is an allowlist of short
 * strings (path, placement, article slug), and the variant and source are
 * read server-side from our own cookies. No IP, no user agent, no id.
 */

export const SITE_EVENT_TYPES = ['whatsapp_click'] as const;
export type SiteEventType = (typeof SITE_EVENT_TYPES)[number];

export interface TrackInput {
  type: SiteEventType;
  path: string;
  placement: string | null;
  slug: string | null;
}

const PLACEMENT = /^[a-z0-9_-]{1,40}$/i;

/** Pure: the beacon body → a clean event, or null for anything unexpected. */
export function parseTrackBody(raw: unknown): TrackInput | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;
  if (!(SITE_EVENT_TYPES as readonly string[]).includes(String(body.type))) return null;
  const path = typeof body.path === 'string' ? body.path : '';
  // A path, never a URL: no scheme, no host, no query (a query can carry PII).
  if (!path.startsWith('/') || path.startsWith('//') || path.length > 512) return null;
  const cleanPath = path.split(/[?#]/)[0];
  const placement = typeof body.placement === 'string' && PLACEMENT.test(body.placement) ? body.placement : null;
  const slug = articleSlugFromPath(cleanPath);
  return { type: body.type as SiteEventType, path: cleanPath, placement, slug };
}

/**
 * The article a path is, if it is one: the last segment of a path at least
 * two segments deep (`/guides/taxes/foo` → `foo`, `/guider/foo` → `foo`).
 * Derived server-side so the client cannot label a click arbitrarily.
 */
export function articleSlugFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  return /^[a-z0-9][a-z0-9-]{0,190}$/i.test(last) ? last : null;
}

/** utm_source, else the referrer's host, else null (direct). */
export function sourceLabel(attribution: { utm_source?: string; referrer?: string }): string | null {
  if (attribution.utm_source) return attribution.utm_source.slice(0, 120);
  if (attribution.referrer) {
    try {
      return new URL(attribution.referrer).hostname.replace(/^www\./, '').slice(0, 120);
    } catch {
      return null;
    }
  }
  return null;
}

/** Stores one event. Silent no-op before migration 0002 or with no database. */
export async function recordSiteEvent(
  site: SiteKey,
  event: TrackInput,
  extra: { variant: string | null; source: string | null },
): Promise<'stored' | 'skipped'> {
  if (!hasDatabase() || !(await dbFeatures()).siteEvents) return 'skipped';
  try {
    await getDb().insert(siteEvents).values({
      site,
      type: event.type,
      path: event.path,
      placement: event.placement,
      slug: event.slug,
      variant: extra.variant?.slice(0, 120) ?? null,
      source: extra.source,
    });
    return 'stored';
  } catch (error) {
    if (isMissingTable(error)) forgetDbFeatures();
    log.error('[site-events] could not store event', { site, err: error });
    return 'skipped';
  }
}

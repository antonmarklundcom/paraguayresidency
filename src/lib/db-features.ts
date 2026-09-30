import 'server-only';
import { sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';

/**
 * What the CONNECTED database can actually hold, as opposed to what
 * `src/db/schema.ts` says it should (O24, "Database rule").
 *
 * Build sessions write migrations and never run them; Anton applies them later
 * from `docs/db-work-later.md`. Between the deploy and that moment the code is
 * newer than the database, so every O24 write that needs a new table or enum
 * value asks here first and falls back to the pre-O24 behaviour when the answer
 * is no. Nothing may crash on an un-migrated production database.
 *
 * One `information_schema` query, cached per process. A "no" is cached briefly
 * so that running the migration takes effect within a minute without a
 * restart; a "yes" is cached longer because a migration is never un-run.
 */

export interface DbFeatures {
  /** `lead_deliveries` exists (0002): the retry queue. */
  leadDeliveries: boolean;
  /** `site_events` exists (0002): the WhatsApp click beacon's table. */
  siteEvents: boolean;
  /** `leads.kind` accepts `whatsapp` (0002). */
  whatsappKind: boolean;
  /** Values `leads.site` accepts, e.g. to tell whether a new brand's enum migration ran. */
  leadSites: string[];
}

export const NO_FEATURES: DbFeatures = Object.freeze({
  leadDeliveries: false,
  siteEvents: false,
  whatsappKind: false,
  leadSites: [],
}) as DbFeatures;

const YES_TTL_MS = 10 * 60_000;
const NO_TTL_MS = 60_000;

let cache: { at: number; value: DbFeatures } | null = null;

/** `enum('a','b')` → `['a','b']`. */
export function parseEnumValues(columnType: string | null | undefined): string[] {
  if (!columnType) return [];
  const inner = /^enum\((.*)\)$/i.exec(columnType.trim())?.[1];
  if (!inner) return [];
  return [...inner.matchAll(/'((?:[^']|'')*)'/g)].map((m) => m[1].replace(/''/g, "'"));
}

export interface ColumnRow {
  TABLE_NAME?: string;
  COLUMN_NAME?: string;
  COLUMN_TYPE?: string;
  table_name?: string;
  column_name?: string;
  column_type?: string;
}

/** Pure: the `information_schema.COLUMNS` rows → features. */
export function featuresFromColumns(rows: ColumnRow[]): DbFeatures {
  const norm = rows.map((row) => ({
    table: String(row.TABLE_NAME ?? row.table_name ?? '').toLowerCase(),
    column: String(row.COLUMN_NAME ?? row.column_name ?? '').toLowerCase(),
    type: String(row.COLUMN_TYPE ?? row.column_type ?? ''),
  }));
  const column = (table: string, name: string) => norm.find((r) => r.table === table && r.column === name);
  return {
    leadDeliveries: Boolean(column('lead_deliveries', 'id')),
    siteEvents: Boolean(column('site_events', 'id')),
    whatsappKind: parseEnumValues(column('leads', 'kind')?.type).includes('whatsapp'),
    leadSites: parseEnumValues(column('leads', 'site')?.type),
  };
}

export async function dbFeatures(now = Date.now()): Promise<DbFeatures> {
  if (!hasDatabase()) return NO_FEATURES;
  if (cache) {
    const ttl = cache.value.leadDeliveries && cache.value.whatsappKind ? YES_TTL_MS : NO_TTL_MS;
    if (now - cache.at < ttl) return cache.value;
  }
  try {
    const query = getDb().execute(sql`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND ((TABLE_NAME = 'leads' AND COLUMN_NAME IN ('kind', 'site'))
          OR (TABLE_NAME IN ('lead_deliveries', 'site_events') AND COLUMN_NAME = 'id'))
    `);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('feature probe timeout')), 3000),
    );
    const result = (await Promise.race([query, timeout])) as unknown;
    // mysql2 answers `[rows, fields]`.
    const rows = (Array.isArray(result) && Array.isArray(result[0]) ? result[0] : []) as ColumnRow[];
    cache = { at: now, value: featuresFromColumns(rows) };
  } catch (error) {
    console.error('[db-features] probe failed — assuming the pre-O24 schema', error instanceof Error ? error.message : error);
    cache = { at: now, value: NO_FEATURES };
  }
  return cache.value;
}

/** A query just proved a feature missing (e.g. `ER_NO_SUCH_TABLE`): re-probe next time. */
export function forgetDbFeatures(): void {
  cache = null;
}

/** Test hook. */
export function setDbFeaturesForTest(value: DbFeatures | null): void {
  cache = value ? { at: Number.MAX_SAFE_INTEGER / 2, value } : null;
}

/** MySQL/MariaDB error code anywhere on Drizzle's `.cause` chain. */
export function mysqlErrorCode(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const candidate = current as { code?: unknown; cause?: unknown };
    if (typeof candidate.code === 'string' && candidate.code.startsWith('ER_')) return candidate.code;
    current = candidate.cause;
  }
  return null;
}

/** The table is not there: the migration that creates it has not run. */
export function isMissingTable(error: unknown): boolean {
  return mysqlErrorCode(error) === 'ER_NO_SUCH_TABLE';
}

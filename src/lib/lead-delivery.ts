import 'server-only';
import { and, asc, count, desc, eq, gte, inArray, isNotNull, lte, max, min, or, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { leadDeliveries, leadEvents, leads } from '@/db/schema';
import { dbFeatures, forgetDbFeatures, isMissingTable } from './db-features';
import {
  BACKOFF_MINUTES,
  nextDeliveryState,
  type ChannelOutcome,
  type DeliveryChannel,
} from './lead-delivery-policy';

export * from './lead-delivery-policy';

/**
 * The persistence half of the lead retry queue (O24, item 1). The policy —
 * what an outcome does to a row, how long to back off — is pure and lives in
 * `lead-delivery-policy.ts`; this file only reads and writes
 * `lead_deliveries`, and every function here is safe to call on a database
 * that does not have that table yet (it returns quietly and the caller keeps
 * the O18 behaviour: `leads.crm_status` + `lead_events`).
 */

async function tableReady(): Promise<boolean> {
  if (!hasDatabase()) return false;
  return (await dbFeatures()).leadDeliveries;
}

function onTableError(error: unknown, what: string): void {
  if (isMissingTable(error)) forgetDbFeatures();
  console.error(`[lead-delivery] could not ${what}`, error instanceof Error ? error.message : error);
}

/**
 * One `pending` row per channel, written right after the lead row and BEFORE
 * anything is attempted. If the process dies mid-delivery the rows stay
 * `pending`, and the queue picks them up (`STUCK_PENDING_MS`) instead of the
 * lead silently never reaching anyone.
 */
export async function openDeliveries(leadId: number | null, channels: DeliveryChannel[], now: Date): Promise<void> {
  if (leadId === null || !channels.length || !(await tableReady())) return;
  try {
    await getDb()
      .insert(leadDeliveries)
      .values(channels.map((channel) => ({ leadId, channel, status: 'pending' as const, createdAt: now })))
      .onDuplicateKeyUpdate({ set: { leadId: sql`lead_id` } });
  } catch (error) {
    onTableError(error, 'open delivery rows');
  }
}

/** Writes one attempt's outcome onto the (lead, channel) row. Never throws. */
export async function recordDelivery(
  leadId: number | null,
  channel: DeliveryChannel,
  outcome: ChannelOutcome,
  now: Date,
): Promise<void> {
  if (leadId === null || !(await tableReady())) return;
  try {
    const db = getDb();
    const [existing] = await db
      .select({ attempts: leadDeliveries.attempts })
      .from(leadDeliveries)
      .where(and(eq(leadDeliveries.leadId, leadId), eq(leadDeliveries.channel, channel)))
      .limit(1);
    const state = nextDeliveryState(existing?.attempts ?? 0, outcome, now);
    await db
      .insert(leadDeliveries)
      .values({ leadId, channel, ...state })
      .onDuplicateKeyUpdate({ set: state });
  } catch (error) {
    onTableError(error, `record ${channel} delivery`);
  }
}

/** A `pending` row this old was abandoned by a crashed request. */
export const STUCK_PENDING_MS = 10 * 60_000;
/** Skipped rows are replayed on request only, and only this far back. */
const SKIPPED_REPLAY_DAYS = 30;

export interface DueDelivery {
  leadId: number;
  channel: DeliveryChannel;
  status: string;
  attempts: number;
}

/** Rows whose next attempt is due, oldest first. */
export async function dueDeliveries(
  now: Date,
  limit: number,
  options: { includeSkipped?: boolean } = {},
): Promise<DueDelivery[] | null> {
  if (!(await tableReady())) return null;
  const conditions = [
    and(eq(leadDeliveries.status, 'failed'), lte(leadDeliveries.nextAttemptAt, now)),
    and(eq(leadDeliveries.status, 'pending'), lte(leadDeliveries.createdAt, new Date(now.getTime() - STUCK_PENDING_MS))),
  ];
  if (options.includeSkipped) {
    conditions.push(
      and(
        eq(leadDeliveries.status, 'skipped'),
        gte(leadDeliveries.createdAt, new Date(now.getTime() - SKIPPED_REPLAY_DAYS * 86_400_000)),
      ),
    );
  }
  try {
    return await getDb()
      .select({
        leadId: leadDeliveries.leadId,
        channel: leadDeliveries.channel,
        status: leadDeliveries.status,
        attempts: leadDeliveries.attempts,
      })
      .from(leadDeliveries)
      .where(or(...conditions))
      .orderBy(asc(leadDeliveries.nextAttemptAt), asc(leadDeliveries.id))
      .limit(limit);
  } catch (error) {
    onTableError(error, 'list due deliveries');
    return null;
  }
}

/** Per-channel status for one lead (admin detail, retry decisions). */
export async function deliveriesForLeads(leadIds: number[]): Promise<Map<number, Record<string, string>>> {
  const out = new Map<number, Record<string, string>>();
  if (!leadIds.length || !(await tableReady())) return out;
  try {
    const rows = await getDb()
      .select({ leadId: leadDeliveries.leadId, channel: leadDeliveries.channel, status: leadDeliveries.status })
      .from(leadDeliveries)
      .where(inArray(leadDeliveries.leadId, leadIds));
    for (const row of rows) {
      const entry = out.get(row.leadId) ?? {};
      entry[row.channel] = row.status;
      out.set(row.leadId, entry);
    }
  } catch (error) {
    onTableError(error, 'read deliveries');
  }
  return out;
}

/* ---------------------------------------------------------------- health */

export interface DeliveryHealth {
  /** `table`: the O24 queue. `legacy`: pre-migration, read off `leads.crm_status`. `none`: no database. */
  queue: 'table' | 'legacy' | 'none' | 'error';
  lastSuccessAt: string | null;
  failed24h: number;
  dead: number;
  oldestUndeliveredAt: string | null;
  /** Something has been waiting longer than `BACKLOG_ALERT_MS`: page someone. */
  backlog: boolean;
}

/** An undelivered lead older than this is a problem, not a retry in progress. */
export const BACKLOG_ALERT_MS = 60 * 60_000;

const iso = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value).replace(' ', 'T') + (String(value).includes('Z') ? '' : 'Z'));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export function isBacklogged(oldestUndeliveredAt: string | null, now: Date): boolean {
  if (!oldestUndeliveredAt) return false;
  return now.getTime() - new Date(oldestUndeliveredAt).getTime() > BACKLOG_ALERT_MS;
}

/**
 * `/api/health` and the readiness screen. Bounded by a timeout by the caller;
 * never throws.
 */
export async function deliveryHealth(now = new Date()): Promise<DeliveryHealth> {
  const empty = { lastSuccessAt: null, failed24h: 0, dead: 0, oldestUndeliveredAt: null, backlog: false };
  if (!hasDatabase()) return { queue: 'none', ...empty };
  const since = new Date(now.getTime() - 86_400_000);
  const db = getDb();
  try {
    if (await tableReady()) {
      const [[success], [failed], [dead], [oldest]] = await Promise.all([
        db.select({ at: max(leadDeliveries.deliveredAt) }).from(leadDeliveries).where(isNotNull(leadDeliveries.deliveredAt)),
        db
          .select({ n: count() })
          .from(leadDeliveries)
          .where(and(inArray(leadDeliveries.status, ['failed', 'dead']), gte(leadDeliveries.lastAttemptAt, since))),
        db.select({ n: count() }).from(leadDeliveries).where(eq(leadDeliveries.status, 'dead')),
        db
          .select({ at: min(leadDeliveries.createdAt) })
          .from(leadDeliveries)
          .where(inArray(leadDeliveries.status, ['pending', 'failed'])),
      ]);
      const oldestUndeliveredAt = iso(oldest?.at);
      return {
        queue: 'table',
        lastSuccessAt: iso(success?.at),
        failed24h: Number(failed?.n ?? 0),
        dead: Number(dead?.n ?? 0),
        oldestUndeliveredAt,
        backlog: isBacklogged(oldestUndeliveredAt, now),
      };
    }
    // Pre-migration: the CRM side is all the old schema records.
    const [[success], [failed], [oldest]] = await Promise.all([
      db.select({ at: max(leadEvents.createdAt) }).from(leadEvents).where(eq(leadEvents.type, 'crm.sent')),
      db.select({ n: count() }).from(leads).where(and(eq(leads.crmStatus, 'failed'), gte(leads.createdAt, since))),
      db.select({ at: min(leads.createdAt) }).from(leads).where(eq(leads.crmStatus, 'failed')),
    ]);
    const oldestUndeliveredAt = iso(oldest?.at);
    return {
      queue: 'legacy',
      lastSuccessAt: iso(success?.at),
      failed24h: Number(failed?.n ?? 0),
      dead: 0,
      oldestUndeliveredAt,
      backlog: isBacklogged(oldestUndeliveredAt, now),
    };
  } catch (error) {
    onTableError(error, 'read delivery health');
    return { queue: 'error', ...empty };
  }
}

/** Recent failures for the admin (no PII: lead id, channel, error text). */
export async function recentDeliveryFailures(limit = 20) {
  if (!(await tableReady())) return [];
  try {
    return await getDb()
      .select({
        leadId: leadDeliveries.leadId,
        channel: leadDeliveries.channel,
        status: leadDeliveries.status,
        attempts: leadDeliveries.attempts,
        nextAttemptAt: leadDeliveries.nextAttemptAt,
        lastError: leadDeliveries.lastError,
      })
      .from(leadDeliveries)
      .where(inArray(leadDeliveries.status, ['failed', 'dead']))
      .orderBy(desc(leadDeliveries.lastAttemptAt))
      .limit(limit);
  } catch (error) {
    onTableError(error, 'read recent failures');
    return [];
  }
}

export { BACKOFF_MINUTES };

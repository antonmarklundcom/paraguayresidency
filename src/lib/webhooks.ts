import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { webhookEvents, type Provider } from '@/db/schema';

/**
 * The idempotency log both webhooks share (plan §5.4.6).
 *
 * The rule is order: the row goes in BEFORE any purchase, subscription or tier
 * is touched. A processor retrying a delivery hits the unique index on
 * `(provider, provider_event_id)`, the handler answers 200, and nothing runs
 * twice — no second download token, no second welcome email, no double grant.
 */

export interface LoggedEvent {
  id: number | null;
  /** This delivery has been seen before. */
  duplicate: boolean;
  /**
   * …and it was carried through to the end. A duplicate that is NOT processed
   * is a delivery whose handler failed (a transient database fault, say) and
   * which the processor is now retrying — that one must run again, or a lost
   * second would drop a real purchase for good.
   */
  processed: boolean;
}

export async function recordWebhookEvent(input: {
  provider: Provider;
  providerEventId: string;
  type: string;
  payload: unknown;
}): Promise<LoggedEvent> {
  if (!hasDatabase()) {
    // Without a database there is nothing to be idempotent about, and refusing
    // the delivery would only make the processor retry forever.
    console.error('[webhooks] DATABASE_URL is not set — cannot log', input.providerEventId);
    return { id: null, duplicate: false, processed: false };
  }
  const db = getDb();
  try {
    const [inserted] = await db.insert(webhookEvents).values({
      provider: input.provider,
      providerEventId: input.providerEventId,
      type: input.type,
      payload: input.payload as object,
    });
    return { id: Number(inserted.insertId), duplicate: false, processed: false };
  } catch (error) {
    // A duplicate key is the expected path for a retry, not a fault.
    if (isDuplicateKey(error)) {
      const [existing] = await db
        .select({ id: webhookEvents.id, processedAt: webhookEvents.processedAt })
        .from(webhookEvents)
        .where(
          and(
            eq(webhookEvents.provider, input.provider),
            eq(webhookEvents.providerEventId, input.providerEventId),
          ),
        )
        .limit(1);
      return {
        id: existing?.id ?? null,
        duplicate: true,
        processed: existing?.processedAt != null,
      };
    }
    throw error;
  }
}

/** Marks the delivery processed, or records why it failed. */
export async function finishWebhookEvent(id: number | null, error?: unknown): Promise<void> {
  if (id === null || !hasDatabase()) return;
  try {
    await getDb()
      .update(webhookEvents)
      .set({
        processedAt: new Date(),
        error: error === undefined ? null : String(error).slice(0, 2000),
      })
      .where(eq(webhookEvents.id, id));
  } catch (updateError) {
    console.error('[webhooks] could not close out event', id, updateError);
  }
}

/**
 * Is this the unique-index collision we expect on a retried delivery?
 *
 * Drizzle wraps the mysql2 error, so the driver's `code` sits on `.cause`, not
 * on the error it throws. Reading only the top level made every duplicate
 * delivery a 500 and a processor retry loop — found by replaying a fixture
 * against a real MySQL, not by reading the code.
 */
export function isDuplicateKey(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const candidate = current as { code?: string; errno?: number; cause?: unknown };
    if (candidate.code === 'ER_DUP_ENTRY' || candidate.errno === 1062) return true;
    current = candidate.cause;
  }
  return false;
}

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

/**
 * The route's one decision after logging the delivery, as a pure predicate.
 *
 * Seen AND finished ⇒ a plain retry of work that already succeeded, so do
 * nothing and answer 200. Seen but NEVER finished ⇒ the previous attempt threw,
 * and this delivery is the second chance — run the handler again.
 */
export function shouldRunHandler(logged: Pick<LoggedEvent, 'duplicate' | 'processed'>): boolean {
  return !(logged.duplicate && logged.processed);
}

/**
 * What `finishWebhookEvent` writes, as a pure function so the rule is testable
 * without a database.
 *
 * The rule (O17 P0 #1): **`processed_at` is set ONLY on success.** Before O17
 * it was set unconditionally, including on the error path, so a MySQL blip
 * during `checkout.session.completed` answered 500, the processor retried, and
 * `recordWebhookEvent` reported `{duplicate: true, processed: true}` — the
 * retry became a no-op and a real buyer was charged with no purchase row, no
 * account and no download. Leaving `processed_at` null is what makes the next
 * delivery run the handler again; `error` keeps the reason for support.
 */
export function webhookClosure(
  error?: unknown,
  now: Date = new Date(),
): { processedAt: Date | null; error: string | null } {
  if (error === undefined) return { processedAt: now, error: null };
  return { processedAt: null, error: String(error).slice(0, 2000) };
}

/** Marks the delivery processed, or records why it failed and leaves it open. */
export async function finishWebhookEvent(id: number | null, error?: unknown): Promise<void> {
  if (id === null || !hasDatabase()) return;
  try {
    await getDb().update(webhookEvents).set(webhookClosure(error)).where(eq(webhookEvents.id, id));
  } catch (updateError) {
    console.error('[webhooks] could not close out event', id, updateError);
  }
}

/* ------------------------------------------------------------------- locks */

/**
 * In-process claim, one delivery at a time per event id (O17 P0 #2).
 *
 * Between `recordWebhookEvent` and `finishWebhookEvent` there is a window in
 * which a second delivery of the SAME event sees `{duplicate: true, processed:
 * false}` — correct for a retry after a failure, wrong for two deliveries
 * racing — and both would fulfil: two download tokens, two receipts.
 *
 * This app runs as ONE Node process behind one hosting slot (plan §1.7, and
 * the `nextjs-deploy-hostinger` skill's single-slot model), so a per-key
 * promise chain is a real mutex, not an approximation. The database-level
 * guard is separate and belongs to `fulfilCheckout`'s conditional UPDATE — this
 * only removes the overlap; correctness does not depend on it alone.
 */
const eventLocks = new Map<string, Promise<void>>();

export async function withEventLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = eventLocks.get(key) ?? Promise.resolve();
  // `.then(fn, fn)` so a failed predecessor still releases the lock, and no
  // `await` before the map is written — two deliveries in the same tick must
  // not both find the key missing.
  const run = previous.then(fn, fn);
  const tail = run.then(
    () => undefined,
    () => undefined,
  );
  eventLocks.set(key, tail);
  try {
    return await run;
  } finally {
    // Lazy eviction: only the last waiter in the chain clears the key, so the
    // map never accumulates one entry per delivery for the life of the process.
    if (eventLocks.get(key) === tail) eventLocks.delete(key);
  }
}

/** Test seam: how many keys the lock map is currently holding. */
export function eventLockSize(): number {
  return eventLocks.size;
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

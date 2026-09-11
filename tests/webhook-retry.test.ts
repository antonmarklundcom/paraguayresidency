import { describe, expect, it } from 'vitest';
import {
  eventLockSize,
  isDuplicateKey,
  shouldRunHandler,
  webhookClosure,
  withEventLock,
  type LoggedEvent,
} from '@/lib/webhooks';

/**
 * O17 P0 #1 and #2 (plan §14.1.1–2): a failed webhook must be retried, and two
 * deliveries of one event must fulfil once.
 *
 * Everything here is pure or in-process — no database, no network — which is
 * also the point: the bug these cover shipped because the `webhook_events`
 * lifecycle had no test at all (`docs/improvement-report.md` §1.1, §1.25).
 */

/* ------------------------------------------------- P0 #1: the retry runs */

describe('webhookClosure — processed_at is set only on success', () => {
  const now = new Date('2026-09-11T10:00:00Z');

  it('marks a successful delivery processed with no error', () => {
    expect(webhookClosure(undefined, now)).toEqual({ processedAt: now, error: null });
  });

  it('leaves processed_at NULL on the error path, so the retry re-runs', () => {
    const closure = webhookClosure(new Error('ER_LOCK_WAIT_TIMEOUT'), now);
    expect(closure.processedAt).toBeNull();
    expect(closure.error).toContain('ER_LOCK_WAIT_TIMEOUT');
  });

  it('truncates a runaway error so one delivery cannot fill the column', () => {
    const closure = webhookClosure(new Error('x'.repeat(9000)), now);
    expect(closure.error!.length).toBe(2000);
  });

  it('treats a thrown non-Error as an error, not as success', () => {
    expect(webhookClosure('boom', now).processedAt).toBeNull();
  });
});

describe('shouldRunHandler — what a duplicate delivery means', () => {
  const logged = (duplicate: boolean, processed: boolean): Pick<LoggedEvent, 'duplicate' | 'processed'> =>
    ({ duplicate, processed });

  it('runs the handler for a first delivery', () => {
    expect(shouldRunHandler(logged(false, false))).toBe(true);
  });

  it('does nothing for a retry of a delivery that already succeeded', () => {
    expect(shouldRunHandler(logged(true, true))).toBe(false);
  });

  it('RE-RUNS a retry of a delivery that failed — the P0 #1 regression', () => {
    // Before O17 this state was unreachable: the error path stamped
    // `processed_at` too, so the retry answered `duplicate:true` and the buyer
    // was charged with no purchase row.
    expect(shouldRunHandler(logged(true, false))).toBe(true);
  });
});

describe('the duplicate-then-retry flow end to end (in-memory webhook_events)', () => {
  interface Row {
    id: number;
    key: string;
    processedAt: Date | null;
    error: string | null;
  }

  /** The two functions in `webhooks.ts`, over a Map instead of MySQL. */
  function makeLog() {
    const rows = new Map<string, Row>();
    let nextId = 1;
    return {
      rows,
      record(key: string): LoggedEvent {
        const existing = rows.get(key);
        if (existing) {
          return { id: existing.id, duplicate: true, processed: existing.processedAt != null };
        }
        const row: Row = { id: nextId++, key, processedAt: null, error: null };
        rows.set(key, row);
        return { id: row.id, duplicate: false, processed: false };
      },
      finish(id: number, error?: unknown) {
        const row = [...rows.values()].find((r) => r.id === id)!;
        Object.assign(row, webhookClosure(error));
      },
    };
  }

  it('delivery 1 fails, delivery 2 fulfils, delivery 3 is a no-op', () => {
    const log = makeLog();
    const fulfilments: number[] = [];
    const deliver = (key: string, handler: () => void) => {
      const logged = log.record(key);
      if (!shouldRunHandler(logged)) return 'duplicate';
      try {
        handler();
        log.finish(logged.id!, undefined);
        return 'handled';
      } catch (error) {
        log.finish(logged.id!, error);
        return 'failed';
      }
    };

    expect(
      deliver('evt_1', () => {
        throw new Error('MySQL went away');
      }),
    ).toBe('failed');
    expect(fulfilments).toHaveLength(0);
    expect(log.rows.get('evt_1')!.processedAt).toBeNull();

    expect(deliver('evt_1', () => fulfilments.push(1))).toBe('handled');
    expect(deliver('evt_1', () => fulfilments.push(1))).toBe('duplicate');
    expect(fulfilments).toEqual([1]);
  });
});

/* ---------------------------------- P0 #2: two deliveries, one fulfilment */

describe('withEventLock — one delivery at a time per event id', () => {
  it('serialises two concurrent deliveries of the same event', async () => {
    const order: string[] = [];
    const slow = async (tag: string) => {
      order.push(`${tag}:start`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push(`${tag}:end`);
      return tag;
    };

    const [a, b] = await Promise.all([
      withEventLock('evt_race', () => slow('a')),
      withEventLock('evt_race', () => slow('b')),
    ]);

    expect([a, b]).toEqual(['a', 'b']);
    // Not interleaved: a finishes before b starts.
    expect(order).toEqual(['a:start', 'a:end', 'b:start', 'b:end']);
  });

  it('lets the second delivery see the first one`s result — one fulfilment', async () => {
    // The shape both webhook routes have: record, check, handle, finish.
    const processed = new Set<string>();
    let fulfilments = 0;
    const deliver = (id: string) =>
      withEventLock(id, async () => {
        const duplicate = processed.has(id);
        if (duplicate) return 'duplicate';
        await new Promise((resolve) => setTimeout(resolve, 5));
        fulfilments += 1;
        processed.add(id);
        return 'fulfilled';
      });

    const results = await Promise.all([deliver('evt_2'), deliver('evt_2')]);
    expect(results).toEqual(['fulfilled', 'duplicate']);
    expect(fulfilments).toBe(1);
  });

  it('does not block a DIFFERENT event id', async () => {
    const started: string[] = [];
    const hold = (tag: string) =>
      withEventLock(tag, async () => {
        started.push(tag);
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
    await Promise.all([hold('evt_a'), hold('evt_b')]);
    expect(started.sort()).toEqual(['evt_a', 'evt_b']);
  });

  it('releases the lock when the handler throws, so the retry is not deadlocked', async () => {
    await expect(
      withEventLock('evt_throw', async () => {
        throw new Error('handler failed');
      }),
    ).rejects.toThrow('handler failed');

    await expect(withEventLock('evt_throw', async () => 'second chance')).resolves.toBe(
      'second chance',
    );
  });

  it('evicts its keys — the map does not grow one entry per delivery', async () => {
    const before = eventLockSize();
    for (let i = 0; i < 50; i += 1) {
      await withEventLock(`evt_evict_${i}`, async () => i);
    }
    expect(eventLockSize()).toBe(before);
  });
});

describe('isDuplicateKey (unchanged, re-asserted alongside the retry rule)', () => {
  it('finds ER_DUP_ENTRY through the wrapper drizzle throws', () => {
    expect(isDuplicateKey({ cause: { code: 'ER_DUP_ENTRY' } })).toBe(true);
    expect(isDuplicateKey({ cause: { errno: 1062 } })).toBe(true);
    expect(isDuplicateKey(new Error('something else'))).toBe(false);
  });
});

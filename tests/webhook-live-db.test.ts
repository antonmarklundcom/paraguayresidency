import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * The live-MySQL replay KNOWN-ISSUES has wanted since O17.
 *
 * Every O17 correctness decision — `webhookClosure`, `shouldRunHandler`,
 * `claimVerdict`, `planGrant` — is already covered by a pure or in-memory test
 * (`tests/webhook-retry.test.ts`, `tests/money-correctness.test.ts`). What was
 * never checked is the layer underneath them: whether the SQL those decisions
 * sit on actually behaves the way they assume. Two assumptions in particular,
 * both of which are properties of the *engine*, not of our code, and neither of
 * which an in-memory fixture can prove:
 *
 *  1. `UPDATE purchases SET status='paid' … WHERE id = ? AND status <> 'paid'`
 *     reports `affectedRows: 0` on a second call. `claimVerdict` reads exactly
 *     that number to decide whether THIS caller owns the download token and the
 *     receipt. If MySQL counted matched-rather-than-changed rows here, two
 *     deliveries would both "claim" and both deliver.
 *  2. `purchases_checkout_uq` raises `ER_DUP_ENTRY`, and Drizzle hands that
 *     driver error down on `.cause` rather than on the error it throws — which
 *     is the whole reason `isDuplicateKey` walks the cause chain. Reading the
 *     top level only made every duplicate delivery a 500 and a retry loop.
 *
 * ## Why this file skips itself
 *
 * `npm run verify` must pass on a clean checkout with no database and no env
 * (plan §4.5, and CI has none). So the whole suite hangs off a probe: with no
 * `TEST_DATABASE_URL`, or with one nothing answers on, every test below is
 * skipped and the run is green. It is a deliberately separate variable from
 * `DATABASE_URL` — this file CREATES AND DROPS a scratch database, and it must
 * be impossible to aim that at a real one by having the app's own connection
 * string exported in a shell.
 *
 * ## How to actually run it
 *
 *   TEST_DATABASE_URL=mysql://root@127.0.0.1:3399/mysql npx vitest run tests/webhook-live-db.test.ts
 *
 * Any reachable MySQL/MariaDB the user can `CREATE DATABASE` on will do; O2
 * established that MariaDB installs in this environment. The database named in
 * the URL is only the one used to connect — the tests run against a fresh
 * `o20_live_<timestamp>` schema built from `drizzle/*.sql` and dropped again in
 * `afterAll`, so this never reads or writes an existing table.
 */

const PROBE_TIMEOUT_MS = 2_000;
const BASE_URL = process.env.TEST_DATABASE_URL ?? '';

/** Can we reach a server AND create a scratch schema on it? */
async function probe(): Promise<boolean> {
  if (!BASE_URL) return false;
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection({ uri: BASE_URL, connectTimeout: PROBE_TIMEOUT_MS });
    await connection.query('select 1');
    return true;
  } catch {
    return false;
  } finally {
    await connection?.end().catch(() => {});
  }
}

const live = await probe();

if (!live) {
  // One line, so a run that skipped says so rather than silently reporting a
  // suite that "passed" without touching a database.
  console.log(
    '[webhook-live-db] skipped: set TEST_DATABASE_URL to a reachable MySQL/MariaDB to run these.',
  );
}

/* ------------------------------------------------------------- the fixture */

const SCRATCH_DB = `o20_live_${Date.now()}`;
const MIGRATIONS = fileURLToPath(new URL('../drizzle', import.meta.url));
const WEBHOOK_SECRET = 'whsec_live_db_test_secret';

/** The emails a fulfilment sends, counted rather than delivered. */
const sentEmails: { to: string; subject: string }[] = [];

function scratchUrl(): string {
  const url = new URL(BASE_URL);
  url.pathname = `/${SCRATCH_DB}`;
  return url.toString();
}

/** `drizzle/*.sql` in order, split on drizzle-kit's own statement separator. */
function migrationStatements(): string[] {
  return readdirSync(MIGRATIONS)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .flatMap((file) =>
      readFileSync(path.join(MIGRATIONS, file), 'utf8')
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean),
    );
}

type LiveContext = {
  raw: mysql.Connection;
  db: typeof import('@/db');
  purchases: typeof import('@/db/schema')['purchases'];
  webhooks: typeof import('@/lib/webhooks');
  fulfilCheckout: typeof import('@/lib/purchases')['fulfilCheckout'];
  stripePost: typeof import('@/app/(en)/api/stripe/webhook/route')['POST'];
  signStripePayload: typeof import('@/lib/stripe-signature')['signStripePayload'];
};

let ctx: LiveContext;
let productId: number;

beforeAll(async () => {
  if (!live) return;

  // 1. A schema of our own, built from the real migrations.
  const admin = await mysql.createConnection({ uri: BASE_URL, multipleStatements: false });
  await admin.query(`create database \`${SCRATCH_DB}\` character set utf8mb4`);
  await admin.end();

  const raw = await mysql.createConnection({ uri: scratchUrl(), multipleStatements: false });
  for (const statement of migrationStatements()) await raw.query(statement);

  // 2. The env the route and the db module read. Set BEFORE anything calls
  //    `getDb()`, because the pool is created once and cached on first use.
  vi.stubEnv('DATABASE_URL', scratchUrl());
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', WEBHOOK_SECRET);
  vi.stubEnv('SESSION_SECRET', 'live-db-test-session-secret-well-over-32-chars');

  // 3. Email is the side effect we are counting, so it is captured rather than
  //    sent. Everything else in the path — users, purchases, tokens, the tier
  //    refresh — runs for real against the schema above.
  vi.doMock('@/lib/email', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/email')>();
    return {
      ...actual,
      sendEmail: async (message: { to: string | string[]; subject: string }) => {
        sentEmails.push({
          to: Array.isArray(message.to) ? message.to.join(',') : message.to,
          subject: message.subject,
        });
        return { ok: true as const, mode: 'console' as const };
      },
    };
  });

  const db = await import('@/db');
  const schema = await import('@/db/schema');
  const webhooks = await import('@/lib/webhooks');
  const { fulfilCheckout } = await import('@/lib/purchases');
  const { POST: stripePost } = await import('@/app/(en)/api/stripe/webhook/route');
  const { signStripePayload } = await import('@/lib/stripe-signature');

  // 4. The one row a fulfilment needs to exist. `file_key` is set so the
  //    download-token branch runs — that token is the side effect a double
  //    fulfilment would duplicate.
  const [inserted] = await raw.query<mysql.ResultSetHeader>(
    "insert into products (slug, site, name, tier, kind, provider, price_cents, currency, file_key, active) values ('guide-entry','guide','The Paraguay Residency Guide','entry','one_time','stripe',4900,'USD','guide-placeholder.pdf',1)",
  );
  productId = inserted.insertId;

  ctx = { raw, db, purchases: schema.purchases, webhooks, fulfilCheckout, stripePost, signStripePayload };
}, 60_000);

afterAll(async () => {
  if (!live || !ctx) return;
  await ctx.raw.end().catch(() => {});
  const admin = await mysql.createConnection({ uri: BASE_URL });
  await admin.query(`drop database if exists \`${SCRATCH_DB}\``);
  await admin.end();
  vi.unstubAllEnvs();
});

/* ------------------------------------------------------------- the helpers */

async function countWhere(table: string, where: string, value: string): Promise<number> {
  const [rows] = await ctx.raw.query<mysql.RowDataPacket[]>(
    `select count(*) as n from \`${table}\` where ${where} = ?`,
    [value],
  );
  return Number(rows[0].n);
}

function stripeEvent(eventId: string, sessionId: string) {
  return JSON.stringify({
    id: eventId,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        payment_status: 'paid',
        payment_intent: `pi_${sessionId}`,
        amount_total: 4900,
        currency: 'usd',
        customer_details: { email: `${sessionId}@example.com`, name: 'Live Test Buyer' },
        metadata: { site: 'guide', product_slug: 'guide-entry' },
      },
    },
  });
}

async function deliver(eventId: string, sessionId: string) {
  const payload = stripeEvent(eventId, sessionId);
  const header = ctx.signStripePayload(payload, WEBHOOK_SECRET, Math.floor(Date.now() / 1000));
  const response = await ctx.stripePost(
    new Request('https://paraguayresidencyguide.com/api/stripe/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': header },
      body: payload,
    }) as never,
  );
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
}

/* --------------------------------------------------------------- the tests */

describe.skipIf(!live)('webhook replay against a real MySQL/MariaDB', () => {
  it('runs against a real engine, not a mock', async () => {
    const [rows] = await ctx.raw.query<mysql.RowDataPacket[]>('select version() as v');
    expect(String(rows[0].v)).toMatch(/mariadb|^\d+\.\d+/i);
    // The migrations really built the schema the app expects.
    const [tables] = await ctx.raw.query<mysql.RowDataPacket[]>('show tables');
    const names = tables.map((row) => String(Object.values(row)[0]));
    expect(names).toEqual(expect.arrayContaining(['purchases', 'webhook_events', 'download_tokens', 'users']));
  });

  it('delivers once and, on an identical replay, changes nothing', async () => {
    const session = 'cs_live_replay_1';
    sentEmails.length = 0;

    const first = await deliver('evt_live_replay_1', session);
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ ok: true, status: 'fulfilled' });

    const emailsAfterFirst = sentEmails.length;
    expect(emailsAfterFirst).toBeGreaterThan(0);
    expect(await countWhere('purchases', 'provider_checkout_id', session)).toBe(1);

    const [firstRows] = await ctx.raw.query<mysql.RowDataPacket[]>(
      'select id, status, paid_at from purchases where provider_checkout_id = ?',
      [session],
    );
    const purchaseId = Number(firstRows[0].id);
    expect(firstRows[0].status).toBe('paid');
    expect(await countWhere('download_tokens', 'purchase_id', String(purchaseId))).toBe(1);

    // The identical delivery: same event id, same bytes. `webhook_events`
    // catches it first, so the handler never runs at all.
    const replay = await deliver('evt_live_replay_1', session);
    expect(replay.status).toBe(200);
    expect(replay.body).toEqual({ ok: true, duplicate: true });

    expect(await countWhere('purchases', 'provider_checkout_id', session)).toBe(1);
    expect(await countWhere('download_tokens', 'purchase_id', String(purchaseId))).toBe(1);
    expect(sentEmails.length).toBe(emailsAfterFirst);
    expect(await countWhere('webhook_events', 'provider_event_id', 'evt_live_replay_1')).toBe(1);
  });

  it('a DIFFERENT event carrying the same session is stopped by the conditional UPDATE', async () => {
    // This is the case `webhook_events` cannot catch and `claimVerdict` exists
    // for: Stripe sends `checkout.session.completed` and, for some payment
    // methods, `checkout.session.async_payment_succeeded` for one session.
    const session = 'cs_live_replay_2';
    sentEmails.length = 0;

    const first = await deliver('evt_live_replay_2a', session);
    expect(first.body).toMatchObject({ status: 'fulfilled' });
    const emailsAfterFirst = sentEmails.length;

    const [rows] = await ctx.raw.query<mysql.RowDataPacket[]>(
      'select id from purchases where provider_checkout_id = ?',
      [session],
    );
    const purchaseId = Number(rows[0].id);

    const second = await deliver('evt_live_replay_2b', session);
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ ok: true, status: 'already-paid' });

    expect(await countWhere('purchases', 'provider_checkout_id', session)).toBe(1);
    expect(await countWhere('download_tokens', 'purchase_id', String(purchaseId))).toBe(1);
    expect(sentEmails.length).toBe(emailsAfterFirst);
    // Both deliveries were logged — the second was NOT suppressed as a
    // duplicate event, which is what makes this a real test of the SQL guard.
    expect(await countWhere('webhook_events', 'provider_event_id', 'evt_live_replay_2a')).toBe(1);
    expect(await countWhere('webhook_events', 'provider_event_id', 'evt_live_replay_2b')).toBe(1);
  });

  it('two concurrent deliveries of one session produce ONE purchase, token and receipt', async () => {
    const session = 'cs_live_concurrent';
    sentEmails.length = 0;

    // Different event ids so the in-process event lock does not serialise them;
    // the only thing standing between these two and a double fulfilment is the
    // database.
    const [a, b] = await Promise.all([
      deliver('evt_live_concurrent_a', session),
      deliver('evt_live_concurrent_b', session),
    ]);
    const outcomes = [a.body.status, b.body.status].sort();
    expect(outcomes).toEqual(['already-paid', 'fulfilled']);

    expect(await countWhere('purchases', 'provider_checkout_id', session)).toBe(1);
    const [rows] = await ctx.raw.query<mysql.RowDataPacket[]>(
      'select id from purchases where provider_checkout_id = ?',
      [session],
    );
    expect(await countWhere('download_tokens', 'purchase_id', String(rows[0].id))).toBe(1);
  });
});

describe.skipIf(!live)('the SQL the O17 decisions assume', () => {
  /** A fresh pending purchase to claim, written straight through the driver. */
  async function pendingPurchase(checkoutId: string): Promise<number> {
    const [result] = await ctx.raw.query<mysql.ResultSetHeader>(
      "insert into purchases (site, product_id, email, provider, provider_checkout_id, amount_cents, currency, status) values ('guide', ?, ?, 'stripe', ?, 4900, 'USD', 'pending')",
      [productId, `${checkoutId}@example.com`, checkoutId],
    );
    return result.insertId;
  }

  it("UPDATE … WHERE status <> 'paid' reports affectedRows 1 then 0 — what claimVerdict reads", async () => {
    const id = await pendingPurchase('cs_affected_rows');
    const claim = async () => {
      const [result] = await ctx.raw.query<mysql.ResultSetHeader>(
        "update purchases set status = 'paid', paid_at = now() where id = ? and status <> 'paid'",
        [id],
      );
      return result.affectedRows;
    };

    const firstClaim = await claim();
    const secondClaim = await claim();
    expect(firstClaim).toBe(1);
    // The assumption in `claimVerdict`'s doc comment, verified against the
    // engine: zero really does mean "someone else already claimed it".
    expect(secondClaim).toBe(0);

    const { claimVerdict } = await import('@/lib/purchases');
    expect(claimVerdict(firstClaim)).toBe('claimed');
    expect(claimVerdict(secondClaim)).toBe('already-paid');
  });

  it("a row that is already 'paid' is never re-claimed even when the SET would change other columns", async () => {
    const id = await pendingPurchase('cs_already_paid');
    await ctx.raw.query("update purchases set status = 'paid' where id = ?", [id]);
    const [result] = await ctx.raw.query<mysql.ResultSetHeader>(
      "update purchases set status = 'paid', name = 'someone else', amount_cents = 1 where id = ? and status <> 'paid'",
      [id],
    );
    expect(result.affectedRows).toBe(0);

    const [rows] = await ctx.raw.query<mysql.RowDataPacket[]>(
      'select name, amount_cents from purchases where id = ?',
      [id],
    );
    expect(rows[0].name).toBeNull();
    expect(Number(rows[0].amount_cents)).toBe(4900);
  });

  it('purchases_checkout_uq really raises ER_DUP_ENTRY, and Drizzle puts it on .cause', async () => {
    const values = {
      site: 'guide' as const,
      productId,
      email: 'dup@example.com',
      provider: 'stripe' as const,
      providerCheckoutId: 'cs_live_duplicate',
      amountCents: 4900,
      currency: 'USD',
      status: 'paid' as const,
    };
    const db = ctx.db.getDb();
    await db.insert(ctx.purchases).values(values);

    let thrown: unknown;
    try {
      await db.insert(ctx.purchases).values(values);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();
    const wrapper = thrown as { message?: string; code?: string; cause?: { code?: string; errno?: number; message?: string } };

    // Drizzle's OWN error says nothing useful: it is "Failed query: insert into
    // `purchases` …" with no code and no constraint name. This is the trap
    // `isDuplicateKey` was written for — reading the top level made every
    // duplicate delivery a 500 and a processor retry loop.
    expect(wrapper.message).toContain('Failed query');
    expect(wrapper.code).toBeUndefined();

    // Everything that identifies the collision is one level down, on `.cause`.
    expect(wrapper.cause?.code).toBe('ER_DUP_ENTRY');
    expect(wrapper.cause?.errno).toBe(1062);
    // The named constraint is the one that fired, not some other unique index.
    expect(String(wrapper.cause?.message ?? '')).toContain('purchases_checkout_uq');

    expect(ctx.webhooks.isDuplicateKey(thrown)).toBe(true);

    expect(await countWhere('purchases', 'provider_checkout_id', 'cs_live_duplicate')).toBe(1);
  });

  it('the fulfilment insert path catches that duplicate instead of 500ing', async () => {
    // A pending row already exists (the checkout route wrote it), then a
    // webhook arrives. `fulfilCheckout` reads, claims and delivers exactly once
    // across two calls.
    await pendingPurchase('cs_live_pending_then_paid');
    sentEmails.length = 0;

    const first = await ctx.fulfilCheckout({
      checkoutId: 'cs_live_pending_then_paid',
      provider: 'stripe',
      providerOrderId: 'pi_live_pending_then_paid',
      email: 'pending@example.com',
      amountCents: 4900,
      currency: 'USD',
      productSlug: 'guide-entry',
    });
    expect(first.status).toBe('fulfilled');

    const second = await ctx.fulfilCheckout({
      checkoutId: 'cs_live_pending_then_paid',
      provider: 'stripe',
      providerOrderId: 'pi_live_pending_then_paid',
      email: 'pending@example.com',
      amountCents: 4900,
      currency: 'USD',
      productSlug: 'guide-entry',
    });
    expect(second.status).toBe('already-paid');
    expect(second.purchaseId).toBe(first.purchaseId);

    expect(await countWhere('purchases', 'provider_checkout_id', 'cs_live_pending_then_paid')).toBe(1);
    expect(await countWhere('download_tokens', 'purchase_id', String(first.purchaseId))).toBe(1);
  });

  it('recordWebhookEvent reports duplicate/processed from the real unique index', async () => {
    const event = { provider: 'stripe' as const, providerEventId: 'evt_live_log', type: 'test.event', payload: { a: 1 } };

    const first = await ctx.webhooks.recordWebhookEvent(event);
    expect(first).toMatchObject({ duplicate: false, processed: false });
    expect(ctx.webhooks.shouldRunHandler(first)).toBe(true);

    // Retry of a delivery whose handler has NOT finished: must re-run (O17 #1).
    const retryOfOpen = await ctx.webhooks.recordWebhookEvent(event);
    expect(retryOfOpen).toMatchObject({ duplicate: true, processed: false, id: first.id });
    expect(ctx.webhooks.shouldRunHandler(retryOfOpen)).toBe(true);

    await ctx.webhooks.finishWebhookEvent(first.id);
    const retryOfDone = await ctx.webhooks.recordWebhookEvent(event);
    expect(retryOfDone).toMatchObject({ duplicate: true, processed: true });
    expect(ctx.webhooks.shouldRunHandler(retryOfDone)).toBe(false);

    expect(await countWhere('webhook_events', 'provider_event_id', 'evt_live_log')).toBe(1);
  });

  it('a failed handler leaves processed_at NULL in the real column, so the retry re-runs', async () => {
    const event = { provider: 'stripe' as const, providerEventId: 'evt_live_failed', type: 'test.event', payload: {} };
    const logged = await ctx.webhooks.recordWebhookEvent(event);
    await ctx.webhooks.finishWebhookEvent(logged.id, new Error('MySQL went away'));

    const [rows] = await ctx.raw.query<mysql.RowDataPacket[]>(
      'select processed_at, error from webhook_events where id = ?',
      [logged.id],
    );
    expect(rows[0].processed_at).toBeNull();
    expect(String(rows[0].error)).toContain('MySQL went away');

    const retry = await ctx.webhooks.recordWebhookEvent(event);
    expect(ctx.webhooks.shouldRunHandler(retry)).toBe(true);
  });
});

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { issueFormTimestamp, MIN_FILL_MS } from '@/lib/form-guard';

/**
 * O24 items 1–2 against a real MariaDB/MySQL, in the order production will
 * live through them:
 *
 *  1. The app is deployed, migration 0002 is NOT applied yet (the build
 *     sessions never apply one; Anton does, later). Every lead must still be
 *     stored, a WhatsApp lead as `contact` + marker, and nothing may throw on
 *     the missing `lead_deliveries` / `site_events` tables.
 *  2. Anton runs 0002. Within the feature-cache window the same code starts
 *     writing the queue, the new kind and the click table.
 *
 * Skips itself without `TEST_DATABASE_URL`, exactly like
 * `tests/webhook-live-db.test.ts` (read its header for why and how):
 *
 *   TEST_DATABASE_URL=mysql://root@127.0.0.1:3399/mysql npx vitest run tests/lead-delivery-live-db.test.ts
 */

const BASE_URL = process.env.TEST_DATABASE_URL ?? '';

async function probe(): Promise<boolean> {
  if (!BASE_URL) return false;
  try {
    const connection = await mysql.createConnection({ uri: BASE_URL, connectTimeout: 2000 });
    await connection.query('select 1');
    await connection.end();
    return true;
  } catch {
    return false;
  }
}

const live = await probe();
if (!live) console.log('[lead-delivery-live-db] skipped: set TEST_DATABASE_URL to a reachable MySQL/MariaDB to run these.');

const SCRATCH_DB = `o24_live_${Date.now()}`;
const MIGRATIONS = fileURLToPath(new URL('../drizzle', import.meta.url));
const NOW = new Date();

function scratchUrl(): string {
  const url = new URL(BASE_URL);
  url.pathname = `/${SCRATCH_DB}`;
  return url.toString();
}

function statements(files: string[]): string[] {
  return files.flatMap((file) =>
    readFileSync(path.join(MIGRATIONS, file), 'utf8')
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter(Boolean),
  );
}

const allFiles = () => readdirSync(MIGRATIONS).filter((file) => file.endsWith('.sql')).sort();
const PRE_O24 = ['0000_green_lord_hawal.sql', '0001_o9_platform.sql'];

let raw: mysql.Connection;
let leadsModule: typeof import('@/lib/leads');
let delivery: typeof import('@/lib/lead-delivery');
let features: typeof import('@/lib/db-features');
let siteEvents: typeof import('@/lib/site-events');

const guard = () => ({ timestamp: issueFormTimestamp(NOW.getTime() - MIN_FILL_MS - 1000), now: NOW });
let phoneSeq = 100;
const whatsappLead = () => ({ site: 'frontier', kind: 'whatsapp', whatsapp: `+595 981 000 ${phoneSeq++}`, pagePath: '/stories/x' });
const formLead = () => ({ site: 'residency', kind: 'contact', email: 'ana@example.com', phone: `+595 982 000 ${phoneSeq++}` });

beforeAll(async () => {
  if (!live) return;
  const admin = await mysql.createConnection({ uri: BASE_URL });
  await admin.query(`create database \`${SCRATCH_DB}\` character set utf8mb4`);
  await admin.end();
  raw = await mysql.createConnection({ uri: scratchUrl() });
  for (const statement of statements(PRE_O24)) await raw.query(statement);

  vi.stubEnv('DATABASE_URL', scratchUrl());
  vi.stubEnv('VENDERCRM_API_URL', 'https://crm.example.invalid');
  vi.stubEnv('VENDERCRM_API_KEY', 'key');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.doMock('@/lib/email', async (original) => ({
    ...(await original<typeof import('@/lib/email')>()),
    notifyTo: () => 'team@example.invalid',
    // A mail transport that is down.
    sendEmail: async () => ({ ok: false, mode: 'smtp', error: 'SMTP 421 service not available' }),
  }));
  // A CRM that is down.
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connect ECONNREFUSED'));

  leadsModule = await import('@/lib/leads');
  delivery = await import('@/lib/lead-delivery');
  features = await import('@/lib/db-features');
  siteEvents = await import('@/lib/site-events');
}, 30_000);

afterAll(async () => {
  if (!live) return;
  await raw?.end().catch(() => {});
  const admin = await mysql.createConnection({ uri: BASE_URL });
  await admin.query(`drop database if exists \`${SCRATCH_DB}\``);
  await admin.end();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe.skipIf(!live)('before migration 0002 (production right after the deploy)', () => {
  it('detects the old schema', async () => {
    features.forgetDbFeatures();
    expect(await features.dbFeatures()).toMatchObject({ leadDeliveries: false, siteEvents: false, whatsappKind: false });
  });

  it('still stores a WhatsApp lead — as contact, marked — with CRM and mail both down', async () => {
    const result = await leadsModule.createLead(whatsappLead(), guard());
    expect(result).toMatchObject({ ok: true, stored: true });
    const [rows] = await raw.query('select kind, attribution, crm_status from leads where id = ?', [(result as { leadId: number }).leadId]);
    const row = (rows as { kind: string; attribution: unknown; crm_status: string }[])[0];
    expect(row.kind).toBe('contact');
    const attribution = typeof row.attribution === 'string' ? JSON.parse(row.attribution) : row.attribution;
    expect(attribution.lead_kind).toBe('whatsapp');
    expect(row.crm_status).toBe('failed');
  });

  it('reports health and runs the queue in legacy mode without touching the missing table', async () => {
    const health = await delivery.deliveryHealth(NOW);
    expect(health.queue).toBe('legacy');
    expect(health.failed24h).toBeGreaterThanOrEqual(1);
    const run = await leadsModule.runLeadDeliveryQueue({ now: NOW, trigger: 'test' });
    expect(run.mode).toBe('legacy');
    expect(run.attempted).toBeGreaterThanOrEqual(1);
  });

  it('drops a WhatsApp click beacon quietly', async () => {
    const stored = await siteEvents.recordSiteEvent('frontier', { type: 'whatsapp_click', path: '/x', placement: 'hero', slug: null }, { variant: null, source: null });
    expect(stored).toBe('skipped');
  });
});

describe.skipIf(!live)('after Anton runs migration 0002', () => {
  beforeAll(async () => {
    const pending = allFiles().filter((file) => !PRE_O24.includes(file) && file.startsWith('0002'));
    for (const statement of statements(pending)) await raw.query(statement);
    features.forgetDbFeatures();
  });

  it('detects the new schema', async () => {
    expect(await features.dbFeatures()).toMatchObject({ leadDeliveries: true, siteEvents: true, whatsappKind: true });
  });

  it('stores WhatsApp as its own kind and queues every failed channel with backoff', async () => {
    const result = await leadsModule.createLead(whatsappLead(), guard());
    const leadId = (result as { leadId: number }).leadId;
    const [kinds] = await raw.query('select kind from leads where id = ?', [leadId]);
    expect((kinds as { kind: string }[])[0].kind).toBe('whatsapp');

    const [rows] = await raw.query(
      'select channel, status, attempts, next_attempt_at from lead_deliveries where lead_id = ? order by channel',
      [leadId],
    );
    const byChannel = Object.fromEntries((rows as { channel: string; status: string; attempts: number; next_attempt_at: Date }[]).map((r) => [r.channel, r]));
    expect(Object.keys(byChannel).sort()).toEqual(['crm', 'notify']);
    expect(byChannel.crm).toMatchObject({ status: 'failed', attempts: 1 });
    expect(byChannel.notify).toMatchObject({ status: 'failed', attempts: 1 });
    expect(byChannel.crm.next_attempt_at).toBeInstanceOf(Date);
  });

  it('picks up due rows, succeeds once the CRM is back, and reports health off the table', async () => {
    const result = await leadsModule.createLead(formLead(), guard());
    const leadId = (result as { leadId: number }).leadId;

    // Nothing is due yet (first backoff is a minute).
    const early = await delivery.dueDeliveries(NOW, 50);
    expect(early?.some((row) => row.leadId === leadId)).toBe(false);

    const later = new Date(NOW.getTime() + 2 * 60_000);
    const due = await delivery.dueDeliveries(later, 50);
    expect(due?.filter((row) => row.leadId === leadId).map((row) => row.channel).sort()).toEqual(['autoreply', 'crm', 'notify']);

    vi.mocked(globalThis.fetch).mockImplementation(async () => Response.json({ id: 9 }, { status: 201 }));
    const run = await leadsModule.runLeadDeliveryQueue({ now: later, limit: 50, trigger: 'test' });
    expect(run.mode).toBe('table');
    expect(run.items).toContain(`${leadId}:crm`);

    const [rows] = await raw.query("select channel, status, attempts from lead_deliveries where lead_id = ? and channel = 'crm'", [leadId]);
    expect((rows as { status: string; attempts: number }[])[0]).toMatchObject({ status: 'sent', attempts: 2 });

    const health = await delivery.deliveryHealth(later);
    expect(health.queue).toBe('table');
    expect(health.lastSuccessAt).not.toBeNull();
    // The mail transport is still down, so email rows remain undelivered.
    expect(health.oldestUndeliveredAt).not.toBeNull();

    const [runs] = await raw.query("select ok from cron_runs where job = 'lead-deliveries'");
    expect((runs as { ok: number }[]).every((r) => Number(r.ok) === 1)).toBe(true);
  });

  it('stores a WhatsApp click beacon', async () => {
    const stored = await siteEvents.recordSiteEvent(
      'frontier',
      { type: 'whatsapp_click', path: '/stories/x', placement: 'hero', slug: 'x' },
      { variant: 'hero_cta:two_minutes', source: 'google' },
    );
    expect(stored).toBe('stored');
  });
});

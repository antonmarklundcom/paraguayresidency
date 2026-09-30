import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { issueFormTimestamp, MIN_FILL_MS } from '@/lib/form-guard';
import {
  BACKOFF_MINUTES,
  crmChannelOutcome,
  emailChannelOutcome,
  MAX_ATTEMPTS,
  nextDeliveryState,
  scrubError,
} from '@/lib/lead-delivery-policy';
import { featuresFromColumns, mysqlErrorCode, parseEnumValues } from '@/lib/db-features';

/**
 * O24 item 1: a failed CRM push or email never fails the form, and it is
 * retried with backoff until it lands or gives up visibly. Item 2: WhatsApp
 * is its own lead kind — on a migrated database — and degrades to `contact`
 * on one that is not.
 *
 * The SQL underneath (`lead_deliveries`, `information_schema`) is exercised
 * against a real MariaDB by `tests/lead-delivery-live-db.test.ts`; this file
 * runs everywhere, with no database.
 */

const NOW = new Date('2026-09-30T12:00:00Z');

describe('retry policy', () => {
  it('marks a delivered channel sent and stops retrying', () => {
    const state = nextDeliveryState(2, { result: 'sent' }, NOW);
    expect(state).toMatchObject({ status: 'sent', attempts: 3, nextAttemptAt: null, deliveredAt: NOW, lastError: null });
  });

  it('backs off 1, 5, 30, 120, 360, 1440 minutes, then gives up', () => {
    const waits: number[] = [];
    let attempts = 0;
    let status = 'failed';
    while (status === 'failed') {
      const state = nextDeliveryState(attempts, { result: 'failed', error: 'HTTP 503' }, NOW);
      attempts = state.attempts;
      status = state.status;
      if (state.nextAttemptAt) waits.push((state.nextAttemptAt.getTime() - NOW.getTime()) / 60_000);
    }
    expect(waits).toEqual([...BACKOFF_MINUTES]);
    expect(status).toBe('dead');
    expect(attempts).toBe(MAX_ATTEMPTS);
  });

  it('gives up at once on a rejection that will never succeed (4xx), but not on 408/429', () => {
    expect(nextDeliveryState(0, crmChannelOutcome({ status: 'failed', httpStatus: 422, error: 'bad' }), NOW).status).toBe('dead');
    expect(nextDeliveryState(0, crmChannelOutcome({ status: 'failed', httpStatus: 429, error: 'slow' }), NOW).status).toBe('failed');
    expect(nextDeliveryState(0, crmChannelOutcome({ status: 'failed', httpStatus: 0, error: 'ECONNREFUSED' }), NOW).status).toBe('failed');
  });

  it('does not spend an attempt on a skip (CRM or mail not configured)', () => {
    const state = nextDeliveryState(0, crmChannelOutcome({ status: 'skipped', reason: 'not-configured' }), NOW);
    expect(state).toMatchObject({ status: 'skipped', attempts: 0, nextAttemptAt: null, lastError: 'not-configured' });
  });

  it('treats console-mode email as not configured, and a transport error as a failure', () => {
    expect(emailChannelOutcome({ ok: true, mode: 'console' })).toEqual({ result: 'skipped', reason: 'email-not-configured' });
    expect(emailChannelOutcome({ ok: false, mode: 'smtp', error: 'ETIMEDOUT' })).toEqual({ result: 'failed', error: 'ETIMEDOUT' });
    expect(emailChannelOutcome({ ok: true, mode: 'resend' })).toEqual({ result: 'sent' });
    expect(emailChannelOutcome({ skipped: 'no-lead-email' })).toEqual({ result: 'skipped', reason: 'no-lead-email' });
  });

  it('never stores the lead inside an error message', () => {
    const scrubbed = scrubError('422: phone +595 981 123 456 invalid for ana.ruiz@example.com');
    expect(scrubbed).not.toMatch(/981|ana\.ruiz/);
    expect(scrubbed).toContain('[number]');
    expect(scrubbed).toContain('[email]');
    expect(scrubError('x'.repeat(2000)).length).toBeLessThanOrEqual(480);
  });
});

describe('database feature detection', () => {
  it('parses MySQL enum column types', () => {
    expect(parseEnumValues("enum('a','b','it''s')")).toEqual(['a', 'b', "it's"]);
    expect(parseEnumValues('varchar(40)')).toEqual([]);
    expect(parseEnumValues(null)).toEqual([]);
  });

  it('reads an un-migrated database as "no O24 features"', () => {
    const features = featuresFromColumns([
      { TABLE_NAME: 'leads', COLUMN_NAME: 'kind', COLUMN_TYPE: "enum('consultation','investor_inquiry','contact','quiz')" },
      { TABLE_NAME: 'leads', COLUMN_NAME: 'site', COLUMN_TYPE: "enum('residency','guide')" },
    ]);
    expect(features).toEqual({ leadDeliveries: false, siteEvents: false, whatsappKind: false, leadSites: ['residency', 'guide'] });
  });

  it('reads a migrated one as having them (either column-name case)', () => {
    const features = featuresFromColumns([
      { table_name: 'leads', column_name: 'kind', column_type: "enum('contact','whatsapp')" },
      { table_name: 'lead_deliveries', column_name: 'id', column_type: 'bigint unsigned' },
      { TABLE_NAME: 'site_events', COLUMN_NAME: 'id', COLUMN_TYPE: 'bigint unsigned' },
    ]);
    expect(features).toMatchObject({ leadDeliveries: true, siteEvents: true, whatsappKind: true });
  });

  it('finds the MySQL error code on Drizzle\'s cause chain', () => {
    const driver = Object.assign(new Error("Table 'x.lead_deliveries' doesn't exist"), { code: 'ER_NO_SUCH_TABLE' });
    expect(mysqlErrorCode(new Error('Failed query', { cause: driver }))).toBe('ER_NO_SUCH_TABLE');
    expect(mysqlErrorCode(new Error('plain'))).toBeNull();
  });
});

/* ------------------------------------------------ createLead orchestration */

const state = vi.hoisted(() => ({
  features: { leadDeliveries: true, siteEvents: true, whatsappKind: true, leadSites: [] as string[] },
  inserted: [] as { table: unknown; row: Record<string, unknown> }[],
  opened: [] as { leadId: number | null; channels: string[] }[],
  recorded: [] as { leadId: number | null; channel: string; outcome: { result: string } }[],
  due: [] as { leadId: number; channel: string; status: string; attempts: number }[] | null,
  leadRow: null as Record<string, unknown> | null,
  crm: vi.fn(),
  email: vi.fn(),
}));

vi.mock('@/db', () => ({
  hasDatabase: () => true,
  getDb: () => ({
    insert: (table: unknown) => ({
      values: async (row: Record<string, unknown>) => {
        state.inserted.push({ table, row });
        return [{ insertId: 77 }];
      },
    }),
    update: () => ({ set: () => ({ where: async () => [] }) }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (state.leadRow ? [state.leadRow] : []),
          orderBy: () => ({ limit: async () => [] }),
        }),
      }),
    }),
  }),
}));

vi.mock('@/lib/db-features', async (original) => ({
  ...(await original<typeof import('@/lib/db-features')>()),
  dbFeatures: async () => state.features,
}));

vi.mock('@/lib/lead-delivery', async () => ({
  ...(await import('@/lib/lead-delivery-policy')),
  openDeliveries: async (leadId: number | null, channels: string[]) => {
    state.opened.push({ leadId, channels });
  },
  recordDelivery: async (leadId: number | null, channel: string, outcome: { result: string }) => {
    state.recorded.push({ leadId, channel, outcome });
  },
  dueDeliveries: async () => state.due,
}));

vi.mock('@/lib/email', async (original) => ({
  ...(await original<typeof import('@/lib/email')>()),
  notifyTo: () => 'team@example.invalid',
  sendEmail: state.email,
}));

const { createLead, runLeadDeliveryQueue, effectiveLeadKind } = await import('@/lib/leads');
const { leads } = await import('@/db/schema');

const guard = () => ({ timestamp: issueFormTimestamp(NOW.getTime() - MIN_FILL_MS - 1000), now: NOW });
const consultation = { site: 'residency', kind: 'consultation', name: 'Ana', email: 'ana@example.com', phone: '0981 123 456' };
const whatsapp = { site: 'frontier', kind: 'whatsapp', name: 'Bo', whatsapp: '+595 981 654 321', pagePath: '/stories/foo' };

const env = { ...process.env };
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  state.features = { leadDeliveries: true, siteEvents: true, whatsappKind: true, leadSites: [] };
  state.inserted = [];
  state.opened = [];
  state.recorded = [];
  state.due = [];
  state.leadRow = null;
  process.env.VENDERCRM_API_URL = 'https://crm.example.invalid';
  process.env.VENDERCRM_API_KEY = 'key';
});
afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  state.email.mockReset();
});

const leadInsert = () => state.inserted.find((entry) => entry.table === leads)?.row;
const outcomes = () => Object.fromEntries(state.recorded.map((r) => [r.channel, r.outcome.result]));

describe('createLead with a failing CRM and a failing mail transport', () => {
  it('accepts the form, stores the lead, and queues every channel for retry', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connect ECONNREFUSED'));
    state.email.mockResolvedValue({ ok: false, mode: 'smtp', error: 'SMTP 421 try again later' });

    const result = await createLead(consultation, guard());

    expect(result).toMatchObject({ ok: true, stored: true, leadId: 77 });
    expect(state.opened).toEqual([{ leadId: 77, channels: ['crm', 'notify', 'autoreply'] }]);
    expect(outcomes()).toEqual({ crm: 'failed', notify: 'failed', autoreply: 'failed' });
  });

  it('records a CRM 500 as a retryable failure and a sent email as sent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('upstream exploded', { status: 500 }));
    state.email.mockResolvedValue({ ok: true, mode: 'resend', id: 'm1' });

    const result = await createLead(consultation, guard());

    expect(result.ok).toBe(true);
    expect(outcomes()).toEqual({ crm: 'failed', notify: 'sent', autoreply: 'sent' });
  });

  it('records a CRM that is not configured as skipped, not failed', async () => {
    delete process.env.VENDERCRM_API_URL;
    state.email.mockResolvedValue({ ok: true, mode: 'resend' });
    await createLead(consultation, guard());
    expect(outcomes().crm).toBe('skipped');
  });
});

describe('WhatsApp lead kind (item 2)', () => {
  it('is stored as its own kind on a migrated database, with no auto-reply channel', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: 1 }, { status: 201 }));
    state.email.mockResolvedValue({ ok: true, mode: 'resend' });

    const result = await createLead(whatsapp, {
      ...guard(),
      context: { articleSlug: 'foo', experiments: { hero_cta: 'two_minutes', 'bad id!': 'x' } },
    });

    expect(result).toMatchObject({ ok: true, stored: true });
    expect(leadInsert()).toMatchObject({ kind: 'whatsapp', email: '', whatsapp: whatsapp.whatsapp });
    expect(leadInsert()?.attribution).toMatchObject({ article_slug: 'foo', experiments: { hero_cta: 'two_minutes' } });
    expect((leadInsert()?.attribution as Record<string, unknown>).lead_kind).toBeUndefined();
    expect(state.opened[0].channels).toEqual(['crm', 'notify']);

    // The CRM gets the attribution as fields.
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body));
    expect(payload.fields).toMatchObject({ kind: 'whatsapp', site: 'frontier', article_slug: 'foo', ab_variants: 'hero_cta:two_minutes' });
    expect(payload.fields.landing_page).toBe('/stories/foo');
  });

  it('degrades to `contact` + a marker on a database that has not run migration 0002', async () => {
    state.features = { leadDeliveries: false, siteEvents: false, whatsappKind: false, leadSites: [] };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: 1 }, { status: 201 }));
    state.email.mockResolvedValue({ ok: true, mode: 'resend' });

    const result = await createLead(whatsapp, guard());

    expect(result).toMatchObject({ ok: true, stored: true });
    expect(leadInsert()).toMatchObject({ kind: 'contact' });
    expect(leadInsert()?.attribution).toMatchObject({ lead_kind: 'whatsapp' });
    expect(effectiveLeadKind({ kind: 'contact', attribution: leadInsert()?.attribution })).toBe('whatsapp');
    expect(effectiveLeadKind({ kind: 'contact', attribution: null })).toBe('contact');
  });
});

describe('the retry queue', () => {
  it('re-delivers only the channels that are due, and records the new outcome', async () => {
    state.due = [
      { leadId: 77, channel: 'crm', status: 'failed', attempts: 1 },
      { leadId: 77, channel: 'autoreply', status: 'failed', attempts: 2 },
    ];
    state.leadRow = {
      id: 77, site: 'residency', kind: 'consultation', name: 'Ana', email: 'ana@example.com', phone: '0981 123 456',
      whatsapp: null, country: null, nationality: null, message: null, quizResult: null, quizAnswers: null,
      pagePath: '/contact', utm: null, attribution: { landing_page: '/' },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: 1 }, { status: 201 }));
    state.email.mockResolvedValue({ ok: true, mode: 'resend' });

    const result = await runLeadDeliveryQueue({ now: NOW, trigger: 'test' });

    expect(result).toEqual({ mode: 'table', attempted: 2, items: ['77:crm', '77:autoreply'] });
    expect(outcomes()).toEqual({ crm: 'sent', autoreply: 'sent' });
    // Only the auto-reply was due: the team is not notified twice.
    expect(state.email).toHaveBeenCalledTimes(1);
    expect(state.email).toHaveBeenCalledWith(expect.objectContaining({ to: 'ana@example.com' }));
  });

  it('falls back to re-pushing failed CRM leads before the migration', async () => {
    state.due = null;
    const result = await runLeadDeliveryQueue({ now: NOW, trigger: 'test' });
    expect(result.mode).toBe('legacy');
  });
});

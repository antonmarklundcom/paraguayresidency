import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { issueFormTimestamp, MIN_FILL_MS } from '@/lib/form-guard';

/**
 * O18 §14.2.2 / `docs/improvement-report.md` §1.8 — a database fault must not
 * cost us the lead.
 *
 * `createLead` used to re-throw any insert error that was not a duplicate-key,
 * which meant a reachable-but-failing MySQL dropped the submission AND showed
 * the visitor an exception — while the no-DATABASE_URL branch three lines above
 * did the right thing. The rule is CLAUDE.md's: never let an integration or
 * database failure fail a form (plan §1.6).
 */

const state = { failInsert: true };

const rejects = () => Promise.reject(new Error('ECONNRESET: MySQL went away'));

vi.mock('@/db', () => ({
  hasDatabase: () => true,
  getDb: () => ({
    insert: () => ({ values: () => (state.failInsert ? rejects() : Promise.resolve([{ insertId: 7 }])) }),
    update: () => ({ set: () => ({ where: () => rejects() }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: () => rejects() }) }) }),
  }),
}));

const crmCalls: unknown[] = [];
vi.mock('@/lib/vendercrm', () => ({
  crmConfigured: () => true,
  sendToVenderCrm: async (lead: unknown) => {
    crmCalls.push(lead);
    return { status: 'sent', httpStatus: 200 };
  },
}));

const mailed: { to: unknown; subject: string }[] = [];
vi.mock('@/lib/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/email')>();
  return {
    ...actual,
    notifyTo: () => 'anton@example.com',
    sendEmail: async (message: { to: unknown; subject: string }) => {
      mailed.push({ to: message.to, subject: message.subject });
      return { ok: true, mode: 'console' as const };
    },
  };
});

const { createLead } = await import('@/lib/leads');

const NOW = new Date('2026-09-11T12:00:00Z');
const lead = {
  site: 'residency',
  kind: 'consultation',
  name: 'Ana Ruiz',
  email: 'ana@example.com',
  phone: '0981 123 456',
};
const guard = () => ({ timestamp: issueFormTimestamp(NOW.getTime() - MIN_FILL_MS - 1000) });

beforeEach(() => {
  state.failInsert = true;
  crmCalls.length = 0;
  mailed.length = 0;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('createLead against a failing database', () => {
  it('still accepts the submission instead of throwing at the visitor', async () => {
    const result = await createLead(lead, { ...guard(), now: NOW });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Honest about what happened: accepted, not stored.
    expect(result.stored).toBe(false);
    expect(result.leadId).toBeNull();
  });

  it('still pushes the lead to the CRM and still emails a human', async () => {
    await createLead(lead, { ...guard(), now: NOW });
    expect(crmCalls).toHaveLength(1);
    expect(mailed.map((m) => m.to)).toContain('anton@example.com');
    expect(mailed.map((m) => m.to)).toContain('ana@example.com');
  });

  it('makes the failure loud in the log — the lead is only in the CRM now', async () => {
    await createLead(lead, { ...guard(), now: NOW });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('could not store the lead'),
      expect.anything(),
    );
  });

  it('a working insert still stores and still reports stored:true', async () => {
    state.failInsert = false;
    const result = await createLead(lead, { ...guard(), now: NOW });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result).toMatchObject({ stored: true, leadId: 7 });
    expect(crmCalls).toHaveLength(1);
  });

  it('does not silently swallow a honeypot into the delivery path', async () => {
    const result = await createLead(lead, { ...guard(), honeypot: 'http://spam', now: NOW });
    expect(result).toMatchObject({ ok: true, dropped: 'honeypot', stored: false });
    expect(crmCalls).toHaveLength(0);
    expect(mailed).toHaveLength(0);
  });
});

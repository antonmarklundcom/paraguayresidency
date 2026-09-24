import { leadIdempotencyKey } from '@/lib/signing';
import { beforeEach, expect, it, vi } from 'vitest';
import { parseLeadInput } from '@/lib/lead-schema';
import { issueFormTimestamp, MIN_FILL_MS } from '@/lib/form-guard';
import { leads } from '@/db/schema';

const mocks = vi.hoisted(() => ({ rows: vi.fn(), crm: vi.fn(), email: vi.fn() }));
vi.mock('@/db', () => ({
  hasDatabase: () => true,
  getDb: () => ({
    insert: (table: unknown) => ({ values: async (row: unknown) => { mocks.rows(table, row); return [{ insertId: 41 }]; } }),
    update: () => ({ set: () => ({ where: async () => [] }) }),
  }),
}));
vi.mock('@/lib/vendercrm', () => ({ sendToVenderCrm: mocks.crm }));
vi.mock('@/lib/email', async (original) => ({
  ...await original<typeof import('@/lib/email')>(),
  notifyTo: () => 'team@example.invalid', sendEmail: mocks.email,
}));
import { createLead } from '@/lib/leads';
const input = { site: 'frontier', kind: 'whatsapp', name: 'Test visitor', whatsapp: '+595 981 123456', message: 'Please contact me.' };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.crm.mockResolvedValue({ status: 'sent', httpStatus: 201 });
  mocks.email.mockResolvedValue({ ok: true, mode: 'console' });
});
it('accepts WhatsApp-only input and maps it to the existing contact storage kind', () => {
  expect(parseLeadInput(input)).toMatchObject({ ok: true, data: { email: '', kind: 'contact', whatsapp: input.whatsapp } });
});
it('also accepts a phone identity, but refuses missing or invalid numbers', () => {
  expect(parseLeadInput({ ...input, whatsapp: '', phone: '+595981123456' }).ok).toBe(true);
  expect(parseLeadInput({ ...input, whatsapp: '' }).ok).toBe(false);
  expect(parseLeadInput({ ...input, whatsapp: 'call me' }).ok).toBe(false);
});
it('still requires an email for every existing kind', () => {
  for (const kind of ['contact', 'consultation', 'investor_inquiry', 'quiz']) {
    expect(parseLeadInput({ ...input, kind }).ok).toBe(false);
  }
  expect(parseLeadInput({ ...input, email: 'invalid' }).ok).toBe(false);
});
it('stores a phone-only lead, delivers to CRM and notifies the team without a visitor auto-reply', async () => {
  const result = await createLead(input, { timestamp: issueFormTimestamp(Date.now() - MIN_FILL_MS - 1000) });
  expect(result).toMatchObject({ ok: true, stored: true, leadId: 41 });
  expect(mocks.rows).toHaveBeenCalledWith(leads, expect.objectContaining({ kind: 'contact', email: '', whatsapp: input.whatsapp }));
  // The site picks the brand's own VenderCRM key; the lead row id gives a
  // per-submission idempotency key that survives retries.
  expect(mocks.crm).toHaveBeenCalledWith(
    expect.objectContaining({ phone: input.whatsapp, idempotencyKey: leadIdempotencyKey('frontier', 41) }),
    'frontier',
  );
  expect(mocks.email).toHaveBeenCalledTimes(1);
  expect(mocks.email).toHaveBeenCalledWith(expect.objectContaining({ to: 'team@example.invalid', replyTo: undefined }));
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLead } from '@/lib/leads';
import { issueFormTimestamp, MIN_FILL_MS } from '@/lib/form-guard';
import { sendToVenderCrm } from '@/lib/vendercrm';
import { emailMode, notifyTo, unsubscribeUrl } from '@/lib/email';

/**
 * The rule this phase exists to protect (plan §1.6, CRM skill rule 5): the
 * local row is the source of truth and a CRM or email failure never fails a
 * form. These run with no DATABASE_URL, which is the harshest case — the
 * submission still has to be accepted and still has to reach a human.
 */
const NOW = new Date('2026-09-07T12:00:00Z');
const good = () => ({
  timestamp: issueFormTimestamp(NOW.getTime() - MIN_FILL_MS - 1000),
});

const lead = {
  site: 'residency',
  kind: 'consultation',
  name: 'Ana Ruiz',
  email: 'ana@example.com',
  phone: '0981 123 456',
};

const env = { ...process.env };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
});

describe('createLead', () => {
  it('accepts a valid submission even with no database configured', async () => {
    delete process.env.DATABASE_URL;
    const result = await createLead(lead, { ...good(), now: NOW });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.stored).toBe(false);
  });

  it('drops a honeypot hit silently — the bot sees success, nothing is sent', async () => {
    delete process.env.DATABASE_URL;
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await createLead(lead, { ...good(), honeypot: 'http://spam', now: NOW });
    expect(result).toEqual({ ok: true, leadId: null, dropped: 'honeypot', stored: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects an instant submission with a message the visitor can act on', async () => {
    delete process.env.DATABASE_URL;
    const result = await createLead(lead, { timestamp: issueFormTimestamp(NOW.getTime()), now: NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.guard).toBe('too-fast');
    expect(result.errors.form).toMatch(/try again/i);
  });

  it('returns field errors for invalid input and sends nothing', async () => {
    delete process.env.DATABASE_URL;
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await createLead({ ...lead, email: 'nope' }, { ...good(), now: NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.email).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('still succeeds when the CRM is unreachable', async () => {
    delete process.env.DATABASE_URL;
    process.env.VENDERCRM_API_URL = 'https://crm.example.com';
    process.env.VENDERCRM_API_KEY = 'key';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await createLead(lead, { ...good(), now: NOW });
    expect(result.ok).toBe(true);
  });

  it('still succeeds when the CRM answers with a 500', async () => {
    delete process.env.DATABASE_URL;
    process.env.VENDERCRM_API_URL = 'https://crm.example.com';
    process.env.VENDERCRM_API_KEY = 'key';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('upstream exploded', { status: 500 }),
    );

    const result = await createLead(lead, { ...good(), now: NOW });
    expect(result.ok).toBe(true);
  });
});

describe('sendToVenderCrm', () => {
  it('skips rather than fails when the CRM is not configured', async () => {
    delete process.env.VENDERCRM_API_URL;
    delete process.env.VENDERCRM_API_KEY;
    await expect(sendToVenderCrm({ phone: '0981 123 456' })).resolves.toEqual({
      status: 'skipped',
      reason: 'not-configured',
    });
  });

  it('skips a lead with no usable phone — the CRM requires one as the identity', async () => {
    process.env.VENDERCRM_API_URL = 'https://crm.example.com';
    process.env.VENDERCRM_API_KEY = 'key';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(sendToVenderCrm({ phone: '' })).resolves.toEqual({
      status: 'skipped',
      reason: 'no-phone',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('treats a 200 idempotency replay as a success, not a duplicate failure', async () => {
    process.env.VENDERCRM_API_URL = 'https://crm.example.com/';
    process.env.VENDERCRM_API_KEY = 'key';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ contactId: 1, duplicate: true }, { status: 200 }),
    );
    const outcome = await sendToVenderCrm({ phone: '0981 123 456' });
    expect(outcome.status).toBe('sent');
  });

  it('sends the key in a header and never in the URL', async () => {
    process.env.VENDERCRM_API_URL = 'https://crm.example.com';
    process.env.VENDERCRM_API_KEY = 'secret-key';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ contactId: 1 }, { status: 201 }));

    await sendToVenderCrm({ phone: '0981 123 456', source: 'paraguayresidency.co.uk' });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://crm.example.com/api/v1/leads');
    expect(url).not.toContain('secret-key');
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('secret-key');
  });
});

describe('email fallbacks', () => {
  it('picks Resend, then SMTP, then console', () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    expect(emailMode()).toBe('console');

    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'u';
    process.env.SMTP_PASSWORD = 'p';
    expect(emailMode()).toBe('smtp');

    process.env.RESEND_API_KEY = 're_x';
    expect(emailMode()).toBe('resend');
  });

  it('falls back to the from-address mailbox when no notify address is set', () => {
    delete process.env.EMAIL_NOTIFY_TO;
    process.env.EMAIL_FROM = 'Paraguay Residency <hello@paraguayresidency.co.uk>';
    expect(notifyTo()).toBe('hello@paraguayresidency.co.uk');
    process.env.EMAIL_NOTIFY_TO = 'anton@example.com';
    expect(notifyTo()).toBe('anton@example.com');
  });

  it('builds an unsubscribe link on the brand that sent the mail', () => {
    const url = unsubscribeUrl('guide', 'Ana@Example.com');
    expect(url.startsWith('https://paraguayresidencyguide.com/unsubscribe?u=')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { buildCrmPayload, crmConfigured } from '@/lib/vendercrm';
import { idempotencyKey, pack, randomToken, sign, unpack, verify } from '@/lib/signing';
import { leadNotification, purchaseEmail, subscribeConfirmEmail } from '@/lib/email-templates';

const SECRET = 'a-test-secret-that-is-long-enough-32ch';

describe('buildCrmPayload', () => {
  const lead = { phone: '0981 123 456', name: 'Ana', email: 'ana@example.com' };

  it('always includes an idempotency key (skill rule 2)', () => {
    const payload = buildCrmPayload(lead);
    expect(String(payload.idempotency_key)).toHaveLength(64);
  });

  it('collapses a double submit within the hour and separates the next one', () => {
    const at = (iso: string) => idempotencyKey(lead.phone, new Date(iso));
    expect(at('2026-09-07T12:00:00Z')).toBe(at('2026-09-07T12:59:59Z'));
    expect(at('2026-09-07T12:00:00Z')).not.toBe(at('2026-09-07T13:00:00Z'));
    expect(at('2026-09-07T12:00:00Z')).not.toBe(idempotencyKey('0981 999 999', new Date()));
  });

  it('omits empty fields rather than sending them — an empty email is a 422', () => {
    const payload = buildCrmPayload({ ...lead, email: '', message: null, source: undefined });
    expect('email' in payload).toBe(false);
    expect('message' in payload).toBe(false);
    expect('source' in payload).toBe(false);
  });

  it('drops empty entries inside `fields` and omits the object when it empties', () => {
    expect(buildCrmPayload({ ...lead, fields: { a: '', b: null } })).not.toHaveProperty('fields');
    expect(buildCrmPayload({ ...lead, fields: { kind: 'quiz', b: '' } }).fields).toEqual({
      kind: 'quiz',
    });
  });

  it('never sends pipeline, stage, owner or tag — routing lives in the CRM', () => {
    const payload = buildCrmPayload({ ...lead, source: 'paraguayresidency.com' });
    for (const forbidden of ['pipeline', 'stage', 'owner', 'tag']) {
      expect(payload).not.toHaveProperty(forbidden);
    }
  });

  it('reports the CRM as unconfigured when either variable is missing', () => {
    const before = { ...process.env };
    delete process.env.VENDERCRM_API_URL;
    delete process.env.VENDERCRM_API_KEY;
    expect(crmConfigured()).toBe(false);
    process.env.VENDERCRM_API_URL = 'https://crm.example.com';
    expect(crmConfigured()).toBe(false);
    process.env.VENDERCRM_API_KEY = 'k';
    expect(crmConfigured()).toBe(true);
    process.env = before;
  });
});

// `readAttribution` moved to `src/lib/attribution.ts` in O9 and gained an
// allowlist; it is covered by tests/leads-attribution.test.ts.

describe('signing', () => {
  it('verifies its own signature and rejects a forged one', () => {
    const sig = sign('hello', 'test', SECRET);
    expect(verify('hello', sig, 'test', SECRET)).toBe(true);
    expect(verify('hello!', sig, 'test', SECRET)).toBe(false);
    expect(verify('hello', sig, 'other-purpose', SECRET)).toBe(false);
    expect(verify('hello', sig, 'test', 'a-different-secret-of-the-same-len')).toBe(false);
    expect(verify('hello', '', 'test', SECRET)).toBe(false);
  });

  it('round-trips a packed value and refuses a tampered one', () => {
    const packed = pack('ana@example.com', 'unsubscribe', SECRET);
    expect(unpack(packed, 'unsubscribe', SECRET)).toBe('ana@example.com');
    expect(unpack(packed, 'form-timestamp', SECRET)).toBeNull();
    expect(unpack(`${packed}x`, 'unsubscribe', SECRET)).toBeNull();
    expect(unpack('no-dot', 'unsubscribe', SECRET)).toBeNull();
    expect(unpack('', 'unsubscribe', SECRET)).toBeNull();
  });

  it('mints distinct URL-safe tokens', () => {
    const tokens = new Set(Array.from({ length: 200 }, () => randomToken()));
    expect(tokens.size).toBe(200);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('email templates', () => {
  it('puts an unsubscribe link in every message', () => {
    const url = 'https://paraguayinvestorguide.com/unsubscribe?u=token';
    const bodies = [
      leadNotification({
        site: 'residency',
        kind: 'consultation',
        leadId: 1,
        email: 'a@b.co',
        unsubscribeUrl: url,
      }),
      purchaseEmail({
        site: 'guide',
        productName: 'The Guide',
        downloadUrl: 'https://paraguayinvestorguide.com/api/download/t',
        expiresAt: new Date('2026-09-10T12:00:00Z'),
        maxDownloads: 5,
        consultationUrl: 'https://paraguayresidency.com/book',
        unsubscribeUrl: url,
      }),
      subscribeConfirmEmail({
        site: 'guide',
        confirmUrl: 'https://paraguayinvestorguide.com/confirm?token=t',
        unsubscribeUrl: url,
      }),
    ];
    for (const body of bodies) {
      expect(body.html).toContain(url);
      expect(body.subject.length).toBeGreaterThan(0);
      expect(body.text.length).toBeGreaterThan(0);
    }
  });

  it('escapes submitted content so a lead cannot inject markup into the notification', () => {
    const body = leadNotification({
      site: 'residency',
      kind: 'contact',
      leadId: 9,
      name: '<script>alert(1)</script>',
      email: 'a@b.co',
      message: '<img src=x onerror=alert(1)>',
      unsubscribeUrl: 'https://paraguayresidency.com/unsubscribe?u=t',
    });
    expect(body.html).not.toContain('<script>');
    expect(body.html).not.toContain('<img src=x');
    expect(body.html).toContain('&lt;script&gt;');
  });

  it('carries the funnel upsell in the purchase email (plan §1.2)', () => {
    const body = purchaseEmail({
      site: 'guide',
      productName: 'The Guide',
      downloadUrl: 'https://paraguayinvestorguide.com/api/download/t',
      expiresAt: new Date('2026-09-10T12:00:00Z'),
      maxDownloads: 5,
      consultationUrl: 'https://paraguayresidency.com/book',
      unsubscribeUrl: 'https://paraguayinvestorguide.com/unsubscribe?u=t',
    });
    expect(body.html).toContain('https://paraguayresidency.com/book');
  });
});

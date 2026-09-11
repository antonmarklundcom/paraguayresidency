import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  lemonSqueezyEventId,
  mapSubscriptionStatus,
  signLemonSqueezyPayload,
  verifyLemonSqueezySignature,
} from '@/lib/lemonsqueezy';

/**
 * The signature check is a pure function, so it is tested against a fixture
 * built here — no Lemon Squeezy account, no key, no SDK, exactly like O2's
 * Stripe test (plan §5.4.6).
 */
const SECRET = 'ls_whsec_test_0123456789abcdef';

const fixture = {
  meta: {
    event_name: 'subscription_created',
    custom_data: { site: 'guide', product: 'guide-insider' },
  },
  data: {
    id: '923456',
    type: 'subscriptions',
    attributes: {
      status: 'active',
      user_email: 'insider@example.com',
      user_name: 'An Insider',
      customer_id: 55512,
      renews_at: '2026-07-15T12:00:00.000000Z',
      ends_at: null,
    },
  },
};
const payload = JSON.stringify(fixture);
const signature = createHmac('sha256', SECRET).update(payload, 'utf8').digest('hex');

describe('Lemon Squeezy signature (plan §5.4.6)', () => {
  it('accepts a correctly signed payload', () => {
    expect(verifyLemonSqueezySignature({ payload, header: signature, secret: SECRET })).toBe('ok');
  });

  it('signs the same way the fixture was signed', () => {
    expect(signLemonSqueezyPayload(payload, SECRET)).toBe(signature);
  });

  it('is case-insensitive about the hex header', () => {
    expect(
      verifyLemonSqueezySignature({ payload, header: signature.toUpperCase(), secret: SECRET }),
    ).toBe('ok');
  });

  it('rejects a payload changed by one byte', () => {
    const tampered = payload.replace('insider@example.com', 'attacker@example.com');
    expect(verifyLemonSqueezySignature({ payload: tampered, header: signature, secret: SECRET })).toBe(
      'mismatch',
    );
  });

  it('rejects the right signature under the wrong secret', () => {
    expect(
      verifyLemonSqueezySignature({ payload, header: signature, secret: 'another-secret' }),
    ).toBe('mismatch');
  });

  it('names why a header is unusable instead of throwing', () => {
    expect(verifyLemonSqueezySignature({ payload, header: null, secret: SECRET })).toBe(
      'missing-header',
    );
    expect(verifyLemonSqueezySignature({ payload, header: '   ', secret: SECRET })).toBe(
      'missing-header',
    );
    expect(verifyLemonSqueezySignature({ payload, header: 'not-hex!!', secret: SECRET })).toBe(
      'malformed',
    );
    expect(verifyLemonSqueezySignature({ payload, header: 'abcd', secret: SECRET })).toBe('mismatch');
  });
});

describe('Lemon Squeezy idempotency key (rewritten in O17, plan §14.1.4)', () => {
  it('is event name, resource id and a hash of the raw signed body', () => {
    expect(lemonSqueezyEventId(fixture, payload)).toMatch(
      /^subscription_created:923456:[0-9a-f]{32}$/,
    );
  });

  it('collapses a RETRY: Lemon Squeezy repeats the exact signed bytes', () => {
    // Their retry policy is up to three more attempts with exponential backoff
    // (~5 s, 25 s, 125 s) and the body must be byte-identical, because
    // `X-Signature` is an HMAC over it. Same bytes ⇒ same key ⇒ duplicate.
    expect(lemonSqueezyEventId(fixture, payload)).toBe(lemonSqueezyEventId(fixture, payload));
  });

  it('separates two DIFFERENT subscription_updated events for one subscription', () => {
    // The pre-O17 key was `<event>:<data.id>`, and for `subscription_updated`
    // the id is the SUBSCRIPTION id — so only the first update a membership
    // ever produced was processed and `effectiveTier` drifted for good
    // (`docs/improvement-report.md` §1.4).
    const first = {
      ...fixture,
      meta: { ...fixture.meta, event_name: 'subscription_updated' },
    };
    const second = {
      ...first,
      data: {
        ...first.data,
        attributes: { ...first.data.attributes, renews_at: '2026-08-15T12:00:00.000000Z' },
      },
    };
    const firstId = lemonSqueezyEventId(first, JSON.stringify(first));
    const secondId = lemonSqueezyEventId(second, JSON.stringify(second));
    expect(firstId).not.toBe(secondId);
    expect(firstId!.startsWith('subscription_updated:923456:')).toBe(true);
    expect(secondId!.startsWith('subscription_updated:923456:')).toBe(true);
  });

  it('separates two different event names for the same resource', () => {
    const cancelled = { ...fixture, meta: { ...fixture.meta, event_name: 'subscription_cancelled' } };
    expect(lemonSqueezyEventId(cancelled, JSON.stringify(cancelled))).not.toBe(
      lemonSqueezyEventId(fixture, payload),
    );
  });

  it('never uses meta.webhook_id — that id names the ENDPOINT, not the delivery', () => {
    // Keying on it would collapse every event from one webhook into a single
    // `webhook_events` row and silently drop every purchase after the first.
    const withWebhookId = {
      ...fixture,
      meta: { ...fixture.meta, webhook_id: '1f2e3d4c-0000-0000-0000-000000000000' },
    };
    const id = lemonSqueezyEventId(withWebhookId, JSON.stringify(withWebhookId));
    expect(id).not.toContain('1f2e3d4c');
    expect(id).toMatch(/^subscription_created:923456:[0-9a-f]{32}$/);
  });

  it('falls back to the parsed body when no raw bytes are passed', () => {
    expect(lemonSqueezyEventId(fixture)).toBe(lemonSqueezyEventId(fixture, JSON.stringify(fixture)));
  });

  it('fits the varchar(191) idempotency column', () => {
    expect(lemonSqueezyEventId(fixture, payload)!.length).toBeLessThanOrEqual(191);
  });

  it('is null when there is nothing to be idempotent on', () => {
    expect(lemonSqueezyEventId({ meta: {}, data: {} })).toBeNull();
    expect(lemonSqueezyEventId({ meta: { event_name: 'x' } })).toBeNull();
  });
});

describe('Lemon Squeezy status mapping', () => {
  const cases: [string, string][] = [
    ['active', 'active'],
    ['on_trial', 'active'],
    ['past_due', 'past_due'],
    ['unpaid', 'past_due'],
    ['cancelled', 'cancelled'],
    ['paused', 'paused'],
    ['expired', 'expired'],
  ];
  for (const [ls, ours] of cases) {
    it(`maps ${ls} → ${ours}`, () => {
      expect(mapSubscriptionStatus(ls)).toBe(ours);
    });
  }

  it('treats an unknown status as expired rather than granting access', () => {
    expect(mapSubscriptionStatus('something_new')).toBe('expired');
    expect(mapSubscriptionStatus(undefined)).toBe('expired');
  });
});

describe('duplicate-key detection (the retry path)', () => {
  it('sees through the wrapper Drizzle throws', async () => {
    const { isDuplicateKey } = await import('@/lib/webhooks');
    // Shape of what actually arrived from drizzle-orm + mysql2, which is why
    // the first version of this check let every retry become a 500.
    const wrapped = Object.assign(new Error('Failed query'), {
      cause: Object.assign(new Error('Duplicate entry'), {
        code: 'ER_DUP_ENTRY',
        errno: 1062,
      }),
    });
    expect(isDuplicateKey(wrapped)).toBe(true);
    expect(isDuplicateKey(Object.assign(new Error('x'), { errno: 1062 }))).toBe(true);
    expect(isDuplicateKey(Object.assign(new Error('x'), { code: 'ER_DUP_ENTRY' }))).toBe(true);
  });

  it('does not mistake an unrelated failure for a retry', async () => {
    const { isDuplicateKey } = await import('@/lib/webhooks');
    expect(isDuplicateKey(new Error('connection lost'))).toBe(false);
    expect(isDuplicateKey(Object.assign(new Error('x'), { errno: 1045 }))).toBe(false);
    expect(isDuplicateKey(null)).toBe(false);
    expect(isDuplicateKey(undefined)).toBe(false);
  });

  it('does not loop forever on a self-referencing cause chain', async () => {
    const { isDuplicateKey } = await import('@/lib/webhooks');
    const loop = new Error('a') as Error & { cause?: unknown };
    loop.cause = loop;
    expect(isDuplicateKey(loop)).toBe(false);
  });
});

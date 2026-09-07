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

describe('Lemon Squeezy idempotency key', () => {
  it('is event name plus resource id, so a retry collapses', () => {
    expect(lemonSqueezyEventId(fixture)).toBe('subscription_created:923456');
  });

  it('separates two different events for the same subscription', () => {
    const cancelled = { ...fixture, meta: { ...fixture.meta, event_name: 'subscription_cancelled' } };
    expect(lemonSqueezyEventId(cancelled)).not.toBe(lemonSqueezyEventId(fixture));
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

import { describe, expect, it } from 'vitest';
import {
  GRACE_DAYS,
  TIERS,
  effectiveTier,
  firstEntitledAt,
  hasTier,
  isDripped,
  isUnlocked,
  subscriptionAccessUntil,
  tierExpiresAt,
  tierIsStale,
  tierRank,
} from '@/lib/entitlements';

const NOW = new Date('2026-06-15T12:00:00Z');
const day = (n: number) => new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);

type Sub = Parameters<typeof subscriptionAccessUntil>[0];
const sub = (over: Partial<Sub> = {}): Sub =>
  ({
    status: 'active',
    currentPeriodEnd: day(20),
    endsAt: null,
    cancelledAt: null,
    ...over,
  }) as Sub;

const paid = (paidAt: Date | null = day(-40)) => ({ status: 'paid' as const, paidAt });
const refunded = () => ({ status: 'refunded' as const, paidAt: day(-40) });
const pending = () => ({ status: 'pending' as const, paidAt: null });

describe('tier ordering (plan §1.12)', () => {
  it('ranks none < entry < insider', () => {
    expect(TIERS).toEqual(['none', 'entry', 'insider']);
    expect(tierRank('none')).toBeLessThan(tierRank('entry'));
    expect(tierRank('entry')).toBeLessThan(tierRank('insider'));
  });

  it('lets a higher tier satisfy a lower minimum, never the reverse', () => {
    expect(hasTier('insider', 'entry')).toBe(true);
    expect(hasTier('insider', 'insider')).toBe(true);
    expect(hasTier('entry', 'entry')).toBe(true);
    expect(hasTier('entry', 'insider')).toBe(false);
    expect(hasTier('none', 'entry')).toBe(false);
    expect(hasTier('none', 'insider')).toBe(false);
  });
});

describe('effectiveTier', () => {
  const cases: [string, Parameters<typeof effectiveTier>[0], string][] = [
    ['nothing at all', { subscriptions: [], purchases: [] }, 'none'],
    ['a pending purchase only', { subscriptions: [], purchases: [pending()] }, 'none'],
    ['a refunded purchase only', { subscriptions: [], purchases: [refunded()] }, 'none'],
    ['a paid one-time purchase', { subscriptions: [], purchases: [paid()] }, 'entry'],
    ['an active subscription', { subscriptions: [sub()], purchases: [] }, 'insider'],
    [
      'a past_due subscription (still chasing payment, access stays)',
      { subscriptions: [sub({ status: 'past_due' })], purchases: [] },
      'insider',
    ],
    [
      'a paused subscription',
      { subscriptions: [sub({ status: 'paused' })], purchases: [] },
      'insider',
    ],
    [
      'cancelled but the paid-up period has not ended',
      {
        subscriptions: [sub({ status: 'cancelled', endsAt: day(5), cancelledAt: day(-1) })],
        purchases: [],
      },
      'insider',
    ],
    [
      'cancelled, period over, still inside the 3-day grace',
      {
        subscriptions: [sub({ status: 'cancelled', endsAt: day(-1), cancelledAt: day(-10) })],
        purchases: [],
      },
      'insider',
    ],
    [
      'expired past the grace — decays to entry, NOT none (§1.12)',
      {
        subscriptions: [sub({ status: 'expired', endsAt: day(-10), currentPeriodEnd: day(-10) })],
        purchases: [],
      },
      'entry',
    ],
    [
      'expired past the grace, and they also bought the guide',
      {
        subscriptions: [sub({ status: 'expired', endsAt: day(-10) })],
        purchases: [paid()],
      },
      'entry',
    ],
    [
      'an upgrade: guide buyer who then subscribed',
      { subscriptions: [sub()], purchases: [paid()] },
      'insider',
    ],
    [
      'one lapsed and one live subscription — the live one wins',
      { subscriptions: [sub({ status: 'expired', endsAt: day(-30) }), sub()], purchases: [] },
      'insider',
    ],
  ];

  for (const [label, input, expected] of cases) {
    it(`${label} → ${expected}`, () => {
      expect(effectiveTier(input, NOW)).toBe(expected);
    });
  }

  it('expires exactly at the end of the grace, not before or after', () => {
    const endsAt = day(-GRACE_DAYS);
    const input = { subscriptions: [sub({ status: 'cancelled', endsAt })], purchases: [] };
    // One second before the grace runs out.
    expect(effectiveTier(input, new Date(NOW.getTime() - 1000))).toBe('insider');
    // One second after.
    expect(effectiveTier(input, new Date(NOW.getTime() + 1000))).toBe('entry');
  });

  it('grants nothing from a cancelled subscription with no end date at all', () => {
    const input = {
      subscriptions: [sub({ status: 'cancelled', endsAt: null, currentPeriodEnd: null })],
      purchases: [],
    };
    // It still counts as "they once paid", so entry, never insider.
    expect(effectiveTier(input, NOW)).toBe('entry');
  });

  it('falls back to current_period_end when ends_at is absent', () => {
    const s = sub({ status: 'cancelled', endsAt: null, currentPeriodEnd: day(1) });
    expect(subscriptionAccessUntil(s)?.getTime()).toBe(
      day(1).getTime() + GRACE_DAYS * 86_400_000,
    );
    expect(effectiveTier({ subscriptions: [s], purchases: [] }, NOW)).toBe('insider');
  });
});

describe('tierExpiresAt — what the users.tier cache should carry', () => {
  it('is null when nothing is time-limited', () => {
    expect(tierExpiresAt({ subscriptions: [], purchases: [paid()] }, NOW)).toBeNull();
  });

  it('is the end of the paid period plus the grace', () => {
    const at = tierExpiresAt({ subscriptions: [sub({ currentPeriodEnd: day(10) })], purchases: [] }, NOW);
    expect(at?.getTime()).toBe(day(10).getTime() + GRACE_DAYS * 86_400_000);
  });

  it('takes the soonest of several live subscriptions', () => {
    const at = tierExpiresAt(
      {
        subscriptions: [sub({ currentPeriodEnd: day(30) }), sub({ currentPeriodEnd: day(4) })],
        purchases: [],
      },
      NOW,
    );
    expect(at?.getTime()).toBe(day(4).getTime() + GRACE_DAYS * 86_400_000);
  });
});

describe('tierIsStale — what the nightly reconcile looks for', () => {
  it('is false when the cache already agrees', () => {
    const input = { subscriptions: [], purchases: [paid()] };
    expect(tierIsStale({ tier: 'entry', tierExpiresAt: null }, input, NOW)).toBe(false);
  });

  it('is true when a subscription lapsed and no webhook ever arrived', () => {
    const input = {
      subscriptions: [sub({ status: 'expired', endsAt: day(-30) })],
      purchases: [],
    };
    expect(tierIsStale({ tier: 'insider', tierExpiresAt: day(-27) }, input, NOW)).toBe(true);
  });

  it('is true when the expiry drifted', () => {
    const input = { subscriptions: [sub({ currentPeriodEnd: day(10) })], purchases: [] };
    expect(tierIsStale({ tier: 'insider', tierExpiresAt: day(1) }, input, NOW)).toBe(true);
    expect(tierIsStale({ tier: 'insider', tierExpiresAt: day(13) }, input, NOW)).toBe(false);
  });
});

describe('drip gating', () => {
  const start = day(-10);

  it('opens a lesson with no drip immediately, even with no start date', () => {
    expect(isDripped({ dripDays: 0, minTier: 'entry' }, null, NOW)).toBe(true);
  });

  it('keeps a dripped lesson shut until its day', () => {
    expect(isDripped({ dripDays: 7, minTier: 'entry' }, start, NOW)).toBe(true);
    expect(isDripped({ dripDays: 10, minTier: 'entry' }, start, NOW)).toBe(true);
    expect(isDripped({ dripDays: 11, minTier: 'entry' }, start, NOW)).toBe(false);
    expect(isDripped({ dripDays: 30, minTier: 'entry' }, start, NOW)).toBe(false);
  });

  it('shows only undripped lessons to a member with no start date', () => {
    expect(isDripped({ dripDays: 1, minTier: 'entry' }, null, NOW)).toBe(false);
  });

  it('needs BOTH the tier and the drip to unlock', () => {
    const insiderLesson = { dripDays: 7, minTier: 'insider' as const };
    expect(isUnlocked(insiderLesson, 'insider', start, NOW)).toBe(true);
    expect(isUnlocked(insiderLesson, 'entry', start, NOW)).toBe(false);
    expect(isUnlocked({ dripDays: 40, minTier: 'insider' }, 'insider', start, NOW)).toBe(false);
    expect(isUnlocked({ dripDays: 0, minTier: 'entry' }, 'entry', null, NOW)).toBe(true);
  });

  it('runs the drip clock from the earliest paid row, not the latest', () => {
    const at = firstEntitledAt({
      subscriptions: [],
      purchases: [paid(day(-5)), paid(day(-100)), refunded()],
    });
    expect(at?.getTime()).toBe(day(-100).getTime());
  });

  it('ignores unpaid purchases when finding the start date', () => {
    expect(firstEntitledAt({ subscriptions: [], purchases: [pending()] })).toBeNull();
  });
});

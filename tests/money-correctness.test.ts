import { describe, expect, it } from 'vitest';
import { claimVerdict } from '@/lib/purchases';
import { handleLemonSqueezyEvent } from '@/lib/subscriptions';
import {
  ADMIN_GRANT_LIKE,
  ADMIN_GRANT_PREFIX,
  describeGrant,
  grantMarker,
  planGrant,
} from '@/lib/member-admin';
import { effectiveTier, subscriptionEverPaid } from '@/lib/entitlements';
import { resourceUnlocked } from '@/lib/download-policy';

/**
 * O17 §14.1.2, .4, .5 and .7 — the fixes that are not P0 but are still money.
 *
 * Everything here is pure or runs with no DATABASE_URL, exactly like every
 * other test in this repo (`npm run verify` must pass on a clean checkout).
 */

/* ------------------------------- §14.1.2: one fulfilment per paid event */

describe('claimVerdict — who marked the purchase paid', () => {
  it('one changed row means this caller claimed it and delivers', () => {
    expect(claimVerdict(1)).toBe('claimed');
  });

  it('zero changed rows means a concurrent delivery already did', () => {
    // The UPDATE is `… WHERE id = ? AND status <> 'paid'`, so zero rows is not
    // "nothing happened" — it is "it was already paid". Every side effect (the
    // download token, the receipt, the sign-in link) hangs off this.
    expect(claimVerdict(0)).toBe('already-paid');
  });

  it('treats a driver that reported nothing as already-paid, never as claimed', () => {
    // Failing closed: a spurious second token and second receipt is worse than
    // a delivery that answers 200 and sends nothing.
    expect(claimVerdict(undefined)).toBe('already-paid');
  });
});

/* --------------------------------------- §14.1.4: refunds and never-paid */

describe('order_refunded (Lemon Squeezy)', () => {
  it('is routed to a handler instead of being ignored', async () => {
    // Before O17 `order_refunded` fell through to the ignore bucket, so a
    // refunded buyer kept `entry` for ever and `markRefunded` was dead code on
    // this side. With no DATABASE_URL `markRefunded` is a no-op, so what this
    // asserts is the routing.
    const handled = await handleLemonSqueezyEvent({
      meta: { event_name: 'order_refunded' },
      data: { id: '77001', type: 'orders', attributes: { status: 'refunded' } },
    });
    expect(handled.handled).toBe('order_refunded');
  });

  it('refuses a refund event with no order id rather than guessing', async () => {
    const handled = await handleLemonSqueezyEvent({
      meta: { event_name: 'order_refunded' },
      data: { type: 'orders' },
    });
    expect(handled.handled).toBe('order_refunded:incomplete');
  });

  it('still ignores an event type it does not know, without throwing', async () => {
    const handled = await handleLemonSqueezyEvent({
      meta: { event_name: 'license_key_created' },
      data: { id: '1' },
    });
    expect(handled.handled).toBe('ignored:license_key_created');
  });
});

/* --------------------------------- §14.1.5: an admin grant is a real row */

describe('planGrant — a grant is a row, not a cache write', () => {
  it('an insider grant with no date is an active subscription', () => {
    const planned = planGrant({ tier: 'insider', until: null });
    expect(planned).toMatchObject({ ok: true, plan: { kind: 'subscription', status: 'active' } });
  });

  it('a dated insider grant is a CANCELLED subscription ending on that date', () => {
    // Not an `active` row with a period end: rule 1 of plan §1.12 grants
    // `insider` for any active subscription regardless of dates, so the expiry
    // would never expire.
    const planned = planGrant({ tier: 'insider', until: '2026-12-31' });
    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan).toEqual({
      kind: 'subscription',
      status: 'cancelled',
      endsAt: new Date('2026-12-31T23:59:59Z'),
    });
  });

  it('an entry grant is a zero-amount purchase', () => {
    expect(planGrant({ tier: 'entry', until: null })).toMatchObject({
      ok: true,
      plan: { kind: 'purchase' },
    });
  });

  it('refuses a DATED entry grant instead of silently making it permanent', () => {
    const planned = planGrant({ tier: 'entry', until: '2026-12-31' });
    expect(planned.ok).toBe(false);
    if (planned.ok) return;
    expect(planned.error).toMatch(/does not expire/);
  });

  it('rejects an unknown tier and a malformed date', () => {
    expect(planGrant({ tier: 'vip', until: null }).ok).toBe(false);
    expect(planGrant({ tier: 'insider', until: '31/12/2026' }).ok).toBe(false);
  });

  it('a revoke takes no date', () => {
    expect(planGrant({ tier: 'none', until: null })).toMatchObject({
      ok: true,
      plan: { kind: 'revoke' },
    });
    expect(planGrant({ tier: 'none', until: '2026-12-31' }).ok).toBe(false);
  });
});

describe('the granted row is visible to effectiveTier — the point of §14.1.5', () => {
  const NOW = new Date('2026-09-11T12:00:00Z');
  const rowFor = (until: string | null) => {
    const planned = planGrant({ tier: 'insider', until });
    if (!planned.ok || planned.plan.kind !== 'subscription') throw new Error('bad plan');
    return {
      status: planned.plan.status,
      currentPeriodEnd: planned.plan.endsAt,
      endsAt: planned.plan.endsAt,
      cancelledAt: planned.plan.status === 'cancelled' ? NOW : null,
    };
  };

  it('a permanent insider grant reads back as insider', () => {
    expect(effectiveTier({ subscriptions: [rowFor(null)], purchases: [] }, NOW)).toBe('insider');
  });

  it('a dated grant reads as insider inside the window', () => {
    expect(effectiveTier({ subscriptions: [rowFor('2026-12-31')], purchases: [] }, NOW)).toBe(
      'insider',
    );
  });

  it('and decays to entry after the date plus the standard grace', () => {
    const row = rowFor('2026-09-12');
    const wellAfter = new Date('2026-09-20T12:00:00Z');
    expect(effectiveTier({ subscriptions: [row], purchases: [] }, wellAfter)).toBe('entry');
  });

  it('an entry grant is a paid purchase, which is what makes it stick', () => {
    const planned = planGrant({ tier: 'entry', until: null });
    expect(planned.ok).toBe(true);
    expect(
      effectiveTier({ subscriptions: [], purchases: [{ status: 'paid', paidAt: NOW }] }, NOW),
    ).toBe('entry');
  });

  it('a granted subscription counts as ever-paid, so it never reads as none', () => {
    expect(subscriptionEverPaid(rowFor('2026-12-31'))).toBe(true);
  });

  it('marks its rows so a revoke can find exactly them', () => {
    expect(ADMIN_GRANT_PREFIX).toBe('admin_grant_');
    expect(grantMarker(7, new Date(1_800_000_000_000)).startsWith('admin_grant_7_')).toBe(true);
  });

  it('gives two grants in the same millisecond different ids', () => {
    // The timestamp alone collided on `subscriptions_provider_uq` and the
    // admin saw a bare "Grant failed".
    const at = new Date(1_800_000_000_000);
    const markers = new Set(Array.from({ length: 50 }, () => grantMarker(7, at)));
    expect(markers.size).toBe(50);
  });

  it('escapes the LIKE pattern a revoke matches on', () => {
    // `_` is a single-character wildcard in MySQL LIKE, so the bare prefix
    // would also match `adminXgrantY…`. A revoke is destructive; it should
    // match exactly what it claims to.
    expect(ADMIN_GRANT_LIKE).toBe(String.raw`admin\_grant\_%`);
    // And the ids it is meant to match still satisfy it once unescaped.
    expect(grantMarker(1).startsWith(ADMIN_GRANT_PREFIX)).toBe(true);
  });
});

describe('describeGrant — the message is true now', () => {
  it('names the row it wrote and the window', () => {
    const message = describeGrant({
      email: 'member@example.com',
      tier: 'insider',
      plan: { kind: 'subscription', status: 'cancelled', endsAt: new Date() },
      until: '2026-12-31',
      entitledTo: 'none',
    });
    expect(message).toContain('a subscription');
    expect(message).toContain('until 2026-12-31');
    expect(message).toContain('3-day grace');
  });

  it('says plainly when a revoke leaves real purchases standing', () => {
    expect(
      describeGrant({
        email: 'member@example.com',
        tier: 'none',
        plan: { kind: 'revoke' },
        until: null,
        entitledTo: 'entry',
      }),
    ).toMatch(/still entitle them to "entry"/);
  });
});

/* ------------------------------------ §14.1.7: resource downloads and drip */

describe('resourceUnlocked — the download route matches the lesson pages', () => {
  const NOW = new Date('2026-09-11T12:00:00Z');
  const started = new Date('2026-09-01T12:00:00Z');

  it('lets an insider through an insider-only resource', () => {
    expect(resourceUnlocked({ minTier: 'insider' }, 'insider', started, NOW)).toBe(true);
  });

  it('refuses an entry member an insider-only resource', () => {
    expect(resourceUnlocked({ minTier: 'insider' }, 'entry', started, NOW)).toBe(false);
  });

  it('refuses an anonymous-tier member everything', () => {
    expect(resourceUnlocked({ minTier: 'entry' }, 'none', started, NOW)).toBe(false);
  });

  it('runs both gates, so a future drip column needs no route change', () => {
    // `resources` has no `drip_days` (schema FINAL), so the drip is 0 today and
    // the tier decides — but the call goes through `isUnlocked`, which is the
    // fix: the route no longer carries a rule of its own.
    expect(resourceUnlocked({ minTier: 'entry' }, 'entry', null, NOW)).toBe(true);
  });
});

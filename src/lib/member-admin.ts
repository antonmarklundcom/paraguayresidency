import 'server-only';
import { and, eq, like } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { leadEvents, products, purchases, subscriptions, users } from '@/db/schema';
import { TIERS, entitlementFor, refreshUserTier, tierRank } from './entitlements';
import { GUIDE_ENTRY_SLUG, GUIDE_INSIDER_SLUG } from '@/sites/registry';
import { randomToken } from './signing';
import type { Tier } from '@/db/schema';

/**
 * Support actions on a member's account (plan §5.4.9).
 *
 * **Rewritten in O17 (§14.1.5).** It used to write `users.tier` directly — the
 * one column plan §1.12 calls a CACHE. Every gate reads `effectiveTier()` from
 * the rows, and the nightly `reconcileTiers` recomputes the column from the
 * rows too, so a grant changed nothing a member could see and was silently
 * undone within a day. The success message was simply false
 * (`docs/improvement-report.md` §1.5).
 *
 * A grant is now a ROW, of the same kind a processor would have written:
 *
 *  - `insider` → a `subscriptions` row. Permanent grants are `active`; dated
 *    grants are `cancelled` with `ends_at`, which is how every real cancelled
 *    membership already expresses "access until this date".
 *  - `entry` → a zero-amount `paid` `purchases` row, which is what a free copy
 *    of the guide is.
 *  - `none` → revokes the rows THIS function created, and says so honestly when
 *    the member's real purchases still entitle them to something.
 *
 * `refreshUserTier()` then writes the cache from the rows, as every webhook
 * does. Nothing here needs an exemption from the reconcile, because the truth
 * now carries the grant.
 *
 * Every grant is still recorded in `lead_events` with `lead_id = 0`: it is the
 * existing audit table, and the schema is FINAL (O9).
 */

export type GrantResult = { ok: true; message: string } | { ok: false; error: string };

/** Marks the rows this module writes, so `none` can find and revoke them. */
export const ADMIN_GRANT_PREFIX = 'admin_grant_';

/**
 * The same prefix as a MySQL `LIKE` pattern.
 *
 * `_` is a single-character wildcard in `LIKE`, so the bare prefix would also
 * match `adminXgrantY…`. Real Lemon Squeezy subscription ids and Stripe session
 * ids never look like that, so nothing was actually mis-revoked — but a revoke
 * is a destructive statement and it should match exactly what it claims to.
 * Backslash is MySQL's default `LIKE` escape character.
 */
export const ADMIN_GRANT_LIKE = 'admin\\_grant\\_%';

/**
 * The id one grant's row carries. The timestamp alone collided when two grants
 * for one member landed in the same millisecond — `subscriptions_provider_uq`
 * threw and the admin saw a bare "Grant failed".
 */
export function grantMarker(userId: number, now: Date = new Date()): string {
  return `${ADMIN_GRANT_PREFIX}${userId}_${now.getTime()}_${randomToken(6)}`;
}

export type GrantPlan =
  | { kind: 'subscription'; status: 'active' | 'cancelled'; endsAt: Date | null }
  | { kind: 'purchase' }
  | { kind: 'revoke' };

/**
 * What rows a grant needs, as a pure function so the decision is testable
 * without a database.
 *
 * A dated `insider` grant becomes a `cancelled` subscription ending on that
 * date. That is deliberate rather than an `active` one with a
 * `current_period_end`: an `active` row grants `insider` for ever regardless of
 * any date (plan §1.12 rule 1), so the expiry would not expire. The standard
 * 3-day grace then applies to it exactly as it does to a real cancellation,
 * which is why `describeGrant` says "plus the usual 3-day grace" rather than
 * pretending access stops at midnight.
 *
 * A dated `entry` grant has no columnless expression: a purchase is not
 * time-limited and the schema is FINAL. It is refused with a message that says
 * what to do instead, rather than accepted and silently made permanent.
 */
export function planGrant(input: { tier: string; until: string | null }):
  | { ok: true; tier: Tier; plan: GrantPlan; expiresAt: Date | null }
  | { ok: false; error: string } {
  if (!(TIERS as readonly string[]).includes(input.tier)) {
    return { ok: false, error: `Unknown tier "${input.tier}"` };
  }
  const tier = input.tier as Tier;

  let expiresAt: Date | null = null;
  if (input.until) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.until)) {
      return { ok: false, error: 'Use YYYY-MM-DD for the expiry date' };
    }
    expiresAt = new Date(`${input.until}T23:59:59Z`);
    if (Number.isNaN(expiresAt.getTime())) return { ok: false, error: 'That is not a real date' };
  }

  if (tier === 'none') {
    if (expiresAt) return { ok: false, error: 'A revoke takes no date — leave it blank' };
    return { ok: true, tier, plan: { kind: 'revoke' }, expiresAt: null };
  }

  if (tier === 'entry') {
    if (expiresAt) {
      return {
        ok: false,
        error:
          'An "entry" grant is a purchase, and a purchase does not expire. ' +
          'Leave the date blank for a permanent entry grant, or grant "insider" until that date.',
      };
    }
    return { ok: true, tier, plan: { kind: 'purchase' }, expiresAt: null };
  }

  return {
    ok: true,
    tier,
    plan: expiresAt
      ? { kind: 'subscription', status: 'cancelled', endsAt: expiresAt }
      : { kind: 'subscription', status: 'active', endsAt: null },
    expiresAt,
  };
}

/** The sentence the admin sees. Pure, and true — which it was not before O17. */
export function describeGrant(input: {
  email: string;
  tier: Tier;
  plan: GrantPlan;
  until: string | null;
  entitledTo: Tier;
}): string {
  if (input.plan.kind === 'revoke') {
    return input.entitledTo === 'none'
      ? `${input.email}: every admin grant removed; their rows entitle them to nothing.`
      : `${input.email}: admin grants removed, but their real purchases still entitle them to "${input.entitledTo}".`;
  }
  const row = input.plan.kind === 'purchase' ? 'a zero-amount purchase' : 'a subscription';
  const window = input.until
    ? ` until ${input.until} (plus the usual ${GRACE_NOTE})`
    : ' with no expiry';
  const note =
    tierRank(input.tier) > tierRank(input.entitledTo)
      ? ' Their own rows entitled them to ' + `"${input.entitledTo}".`
      : '';
  return `${input.email} granted "${input.tier}" via ${row}${window}.${note}`;
}

const GRACE_NOTE = '3-day grace every cancelled membership gets';

export async function grantTierUntil(input: {
  userId: number;
  tier: string;
  /** `YYYY-MM-DD`, or null for no expiry (a permanent grant). */
  until: string | null;
  byEmail: string;
}): Promise<GrantResult> {
  if (!hasDatabase()) return { ok: false, error: 'DATABASE_URL is not set' };

  const planned = planGrant({ tier: input.tier, until: input.until });
  if (!planned.ok) return { ok: false, error: planned.error };
  const { tier, plan } = planned;

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user) return { ok: false, error: 'No member with that id' };

  // What the rows said BEFORE the grant, so the audit entry records what it
  // actually overrode.
  const before = (await entitlementFor(user)).tier;
  const now = new Date();
  const marker = grantMarker(user.id, now);

  if (plan.kind === 'subscription') {
    const productId = await productIdForSlug(GUIDE_INSIDER_SLUG);
    await db.insert(subscriptions).values({
      site: user.homeSite ?? 'guide',
      productId,
      userId: user.id,
      // The provider enum is (stripe | lemonsqueezy) and the schema is FINAL;
      // the `admin_grant_` id is what marks the row as ours, not the provider.
      provider: 'lemonsqueezy',
      providerSubscriptionId: marker,
      status: plan.status,
      currentPeriodEnd: plan.endsAt,
      cancelledAt: plan.status === 'cancelled' ? now : null,
      endsAt: plan.endsAt,
      raw: { adminGrant: true, by: input.byEmail, at: now.toISOString() },
    });
  } else if (plan.kind === 'purchase') {
    const productId = await productIdForSlug(GUIDE_ENTRY_SLUG);
    if (!productId) {
      return { ok: false, error: `No "${GUIDE_ENTRY_SLUG}" product row to attach the grant to` };
    }
    await db.insert(purchases).values({
      site: user.homeSite ?? 'guide',
      productId,
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: 'stripe',
      providerCheckoutId: marker,
      providerOrderId: marker,
      amountCents: 0,
      currency: 'USD',
      status: 'paid',
      paidAt: now,
      raw: { adminGrant: true, by: input.byEmail, at: now.toISOString() },
    });
  } else {
    await revokeAdminGrants(user.id);
  }

  // The cache follows the rows, exactly as it does after a webhook (plan §1.12).
  await refreshUserTier(user.id, now);
  const after = (await entitlementFor(user, now)).tier;

  await db.insert(leadEvents).values({
    leadId: 0,
    type: 'admin.grant_tier',
    payload: {
      userId: user.id,
      email: user.email,
      from: before,
      to: after,
      requested: tier,
      until: input.until,
      row: plan.kind,
      marker: plan.kind === 'revoke' ? null : marker,
      by: input.byEmail,
      at: now.toISOString(),
    },
  });

  return {
    ok: true,
    message: describeGrant({
      email: user.email,
      tier,
      plan,
      until: input.until,
      entitledTo: plan.kind === 'revoke' ? after : before,
    }),
  };
}

/**
 * Undoes every grant this module made for one member, and nothing else. A real
 * purchase is never touched: taking away something a person paid for is a
 * refund, and a refund happens at the processor (`markRefunded`).
 */
async function revokeAdminGrants(userId: number): Promise<void> {
  const db = getDb();
  const pattern = ADMIN_GRANT_LIKE;
  await db
    .update(subscriptions)
    // Both dates back to null as well as the status: a row with an `ends_at`
    // still counts as "ever paid" and would leave `entry` behind, and an admin
    // grant that was revoked was never bought (plan §1.12 rule 3).
    .set({ status: 'expired', endsAt: null, currentPeriodEnd: null, cancelledAt: new Date() })
    .where(
      and(
        eq(subscriptions.userId, userId),
        like(subscriptions.providerSubscriptionId, pattern),
      ),
    );
  await db
    .update(purchases)
    .set({ status: 'refunded' })
    .where(and(eq(purchases.userId, userId), like(purchases.providerCheckoutId, pattern)));
}

async function productIdForSlug(slug: string): Promise<number | null> {
  const [row] = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return row?.id ?? null;
}

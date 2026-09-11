import type { Purchase, Subscription, Tier, MinTier, User } from '@/db/schema';

/**
 * What a member may see (plan §1.12, §5.4.4).
 *
 * Everything in the top half of this file is a PURE FUNCTION over rows — no
 * database, no request, no `server-only` — so the whole entitlement model is
 * unit-testable and the same code answers for a live user, an import dry-run
 * and the nightly reconcile.
 *
 * The rule that matters: `users.tier` is a CACHE. `effectiveTier()` is the
 * truth, computed from `purchases` + `subscriptions`. Read-time evaluation is
 * what makes a lapsed subscription lose access on the day it lapses even if no
 * webhook ever arrives.
 */

export const TIERS = ['none', 'entry', 'insider'] as const;

/** Days of access after a subscription's paid-up period ends (plan §1.12). */
export const GRACE_DAYS = 3;
export const GRACE_MS = GRACE_DAYS * 24 * 60 * 60 * 1000;

export function tierRank(tier: Tier | MinTier): number {
  return TIERS.indexOf(tier as Tier);
}

/** `hasTier('entry', 'insider')` is false; `hasTier('insider', 'entry')` is true. */
export function hasTier(tier: Tier, minTier: MinTier): boolean {
  return tierRank(tier) >= tierRank(minTier);
}

/** Statuses that mean the member is paying, or is expected to keep paying. */
const LIVE_SUBSCRIPTION = new Set(['active', 'past_due', 'paused']);
/** Statuses that end in a date: access runs to that date plus the grace. */
const WINDING_DOWN = new Set(['cancelled', 'expired']);

export interface EntitlementInput {
  subscriptions: Pick<
    Subscription,
    'status' | 'currentPeriodEnd' | 'endsAt' | 'cancelledAt'
  >[];
  purchases: Pick<Purchase, 'status' | 'paidAt'>[];
  /** The tier each purchase grants, in the same order as `purchases`. */
  purchaseTiers?: MinTier[];
}

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * When a winding-down subscription stops granting `insider`: the end of the
 * period the member already paid for, plus the grace. A cancellation is not
 * itself an end date — a member who cancels on day 2 of a month keeps the
 * month (plan §1.12, and pararesi doc 06 R1 agrees).
 */
export function subscriptionAccessUntil(
  sub: EntitlementInput['subscriptions'][number],
): Date | null {
  const end = asDate(sub.endsAt) ?? asDate(sub.currentPeriodEnd);
  return end ? new Date(end.getTime() + GRACE_MS) : null;
}

/** True while this one subscription still grants `insider`. */
export function subscriptionGrantsInsider(
  sub: EntitlementInput['subscriptions'][number],
  now: Date,
): boolean {
  if (LIVE_SUBSCRIPTION.has(sub.status)) return true;
  if (!WINDING_DOWN.has(sub.status)) return false;
  const until = subscriptionAccessUntil(sub);
  return until !== null && until.getTime() > now.getTime();
}

/**
 * Did this subscription ever have a paid period? (O17 §14.1.4.)
 *
 * `effectiveTier` used to hand `entry` to anyone with ANY subscription row, so
 * a membership that was created and never paid for — a card declined on the
 * first invoice, a checkout abandoned after Lemon Squeezy had already written
 * the subscription — left permanent paid-tier access behind
 * (`docs/improvement-report.md` §1.10).
 *
 * No new column (the schema is FINAL, O9). The signal is already in the row:
 *
 *  - a **live** status (`active`, `past_due`, `paused`) only exists after Lemon
 *    Squeezy has taken, or is retrying, a payment;
 *  - `current_period_end` (`renews_at`) or `ends_at` is only ever set once a
 *    period exists to run to.
 *
 * A row that is `expired`/`cancelled` with neither date is the never-paid case,
 * and it grants nothing.
 */
export function subscriptionEverPaid(
  sub: EntitlementInput['subscriptions'][number],
): boolean {
  if (LIVE_SUBSCRIPTION.has(sub.status)) return true;
  return asDate(sub.currentPeriodEnd) !== null || asDate(sub.endsAt) !== null;
}

/**
 * The tier a person is actually entitled to, right now.
 *
 * `insider` while any subscription is live, or is winding down inside its
 * paid-up period plus the grace. Otherwise `entry` if they ever paid for
 * anything — a lapsed Insider decays to `entry`, NOT to `none`, because they
 * keep what they bought (plan §1.12). Otherwise `none`.
 *
 * A refunded purchase grants nothing. A subscription that once existed but has
 * expired still leaves `entry` behind: they paid for the months they had. A
 * subscription that never took a payment leaves nothing (`subscriptionEverPaid`).
 */
export function effectiveTier(input: EntitlementInput, now: Date = new Date()): Tier {
  if (input.subscriptions.some((s) => subscriptionGrantsInsider(s, now))) return 'insider';

  const paidPurchase = input.purchases.some((p) => p.status === 'paid');
  const everSubscribed = input.subscriptions.some(subscriptionEverPaid);
  if (paidPurchase || everSubscribed) return 'entry';

  return 'none';
}

/**
 * When `tier` should next be re-checked — the cache's expiry. Null means
 * nothing is time-limited, so the cached value cannot go stale on its own.
 */
export function tierExpiresAt(input: EntitlementInput, now: Date = new Date()): Date | null {
  const ends = input.subscriptions
    .filter((s) => subscriptionGrantsInsider(s, now))
    .map(subscriptionAccessUntil)
    .filter((d): d is Date => d !== null)
    .map((d) => d.getTime());
  return ends.length ? new Date(Math.min(...ends)) : null;
}

/* -------------------------------------------------------------------- drip */

export interface Drippable {
  dripDays: number;
  minTier: MinTier;
}

/**
 * Drip gating (plan §5.4.4). `firstEntitledAt` is when this member's access
 * started; a lesson with `dripDays: 7` opens a week later. Day 0 is always
 * open, and a member with no start date sees only the undripped lessons.
 */
export function isDripped(
  item: Drippable,
  firstEntitledAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (item.dripDays <= 0) return true;
  const start = asDate(firstEntitledAt);
  if (!start) return false;
  const opensAt = start.getTime() + item.dripDays * 24 * 60 * 60 * 1000;
  return opensAt <= now.getTime();
}

/** Both gates at once: the tier is high enough AND the drip has elapsed. */
export function isUnlocked(
  item: Drippable,
  tier: Tier,
  firstEntitledAt: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  return hasTier(tier, item.minTier) && isDripped(item, firstEntitledAt, now);
}

/**
 * The moment this member's access began — the earliest paid purchase or
 * subscription. The drip clock runs from here, so a buyer who returns after a
 * year does not restart at lesson one.
 */
export function firstEntitledAt(input: EntitlementInput): Date | null {
  const dates = [
    ...input.purchases.filter((p) => p.status === 'paid').map((p) => asDate(p.paidAt)),
    // Only subscriptions that took a payment — a never-paid row must not start
    // someone's drip clock any more than it grants them a tier.
    ...input.subscriptions
      .filter(subscriptionEverPaid)
      .map((s) => asDate((s as { createdAt?: Date }).createdAt ?? null)),
  ].filter((d): d is Date => d !== null);
  return dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
}

/** Does the cached `users.tier` still match what the rows say? */
export function tierIsStale(
  user: Pick<User, 'tier' | 'tierExpiresAt'>,
  input: EntitlementInput,
  now: Date = new Date(),
): boolean {
  const computed = effectiveTier(input, now);
  if (computed !== user.tier) return true;
  const expected = tierExpiresAt(input, now);
  const cached = asDate(user.tierExpiresAt);
  if (expected === null) return cached !== null;
  return cached === null || Math.abs(cached.getTime() - expected.getTime()) > 60_000;
}

/* ========================================================================== */
/*  Everything below touches the database. The pure half above is what the    */
/*  tests exercise; this half only fetches rows and hands them to it.         */
/* ========================================================================== */

// Deliberately NOT `server-only`. Everything below reaches the database but
// nothing reaches a request, and `scripts/reconcile-tiers.ts` and
// `scripts/import-pararesi.ts` both run this code outside Next. The guard
// stays on `member-auth.ts`, which is where cookies actually live.
import { and, eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb, hasDatabase } from '@/db';
import { cronRuns, products, purchases, subscriptions, users } from '@/db/schema';
import { GUIDE_ENTRY_SLUG } from '@/sites/registry';

export interface MemberEntitlement {
  user: User;
  /** The truth, computed from rows — never `user.tier`. */
  tier: Tier;
  expiresAt: Date | null;
  firstEntitledAt: Date | null;
}

/** Loads a user's purchase and subscription rows and evaluates them. */
export async function entitlementFor(user: User, now: Date = new Date()): Promise<MemberEntitlement> {
  if (!hasDatabase()) {
    return { user, tier: 'none', expiresAt: null, firstEntitledAt: null };
  }
  const db = getDb();
  const [purchaseRows, subscriptionRows] = await Promise.all([
    db
      .select({ status: purchases.status, paidAt: purchases.paidAt })
      .from(purchases)
      .where(eq(purchases.userId, user.id)),
    db
      .select({
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        endsAt: subscriptions.endsAt,
        cancelledAt: subscriptions.cancelledAt,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id)),
  ]);

  const input: EntitlementInput = { purchases: purchaseRows, subscriptions: subscriptionRows };
  return {
    user,
    tier: effectiveTier(input, now),
    expiresAt: tierExpiresAt(input, now),
    firstEntitledAt: firstEntitledAt(input),
  };
}

/**
 * Writes the `users.tier` cache to match the rows. Every webhook calls this
 * after it has written its purchase or subscription; nothing else may set the
 * column (plan §1.12).
 */
export async function refreshUserTier(userId: number, now: Date = new Date()): Promise<Tier> {
  if (!hasDatabase()) return 'none';
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return 'none';
  const entitlement = await entitlementFor(user, now);
  await db
    .update(users)
    .set({ tier: entitlement.tier, tierExpiresAt: entitlement.expiresAt })
    .where(eq(users.id, userId));
  return entitlement.tier;
}

/**
 * Gate for server components (plan §5.4.4): anonymous → `/login`,
 * under-tiered → the product's sales path. It THROWS via `redirect()` rather
 * than returning a boolean, so a forgotten check cannot silently pass.
 */
export async function requireTier(
  minTier: MinTier,
  now: Date = new Date(),
): Promise<MemberEntitlement> {
  // Imported lazily so this module's graph stays free of `server-only` and the
  // CLI scripts above can use the rest of the file.
  const { currentMember } = await import('./member-auth');
  const user = await currentMember();
  if (!user) redirect('/login');

  const entitlement = await entitlementFor(user, now);
  if (!hasTier(entitlement.tier, minTier)) {
    redirect(salesPathFor(minTier));
  }
  return entitlement;
}

/**
 * Where an under-tiered member is sent to buy what they are missing. Both
 * paths live on the brand that sells; S14 builds `/insider`, and until it does
 * the guide home carries both offers.
 */
export function salesPathFor(minTier: MinTier): string {
  return minTier === 'insider' ? '/insider' : '/';
}

/* --------------------------------------------------------------- reconcile */

export interface ReconcileResult {
  checked: number;
  changed: number;
  changes: { userId: number; from: Tier; to: Tier }[];
}

/**
 * The nightly job behind `scripts/reconcile-tiers.ts`.
 *
 * Webhooks are the fast path and they are not reliable enough to be the only
 * path: a delivery can be lost, a subscription can lapse with no event at all.
 * This walks every user whose cached tier disagrees with their rows and fixes
 * it, then records the run in `cron_runs` so "nothing changed" and "the cron
 * never fired" stop looking identical.
 */
export async function reconcileTiers(now: Date = new Date()): Promise<ReconcileResult> {
  const result: ReconcileResult = { checked: 0, changed: 0, changes: [] };
  if (!hasDatabase()) throw new Error('DATABASE_URL is not set');
  const db = getDb();

  const [run] = await db.insert(cronRuns).values({ job: 'reconcile-tiers', ok: false });
  const runId = Number(run.insertId);

  try {
    // Only members can hold a tier; staff rows never do.
    const candidates = await db
      .select()
      .from(users)
      .where(inArray(users.tier, ['entry', 'insider']));
    // Anyone who paid but whose cache still says `none` also needs a look.
    const stale = await db
      .select()
      .from(users)
      .where(and(eq(users.tier, 'none'), eq(users.role, 'member')));

    const seen = new Set<number>();
    for (const user of [...candidates, ...stale]) {
      if (seen.has(user.id)) continue;
      seen.add(user.id);
      result.checked += 1;

      const entitlement = await entitlementFor(user, now);
      const expiryDrifted =
        (entitlement.expiresAt?.getTime() ?? null) !== (user.tierExpiresAt?.getTime() ?? null);
      if (entitlement.tier === user.tier && !expiryDrifted) continue;

      await db
        .update(users)
        .set({ tier: entitlement.tier, tierExpiresAt: entitlement.expiresAt })
        .where(eq(users.id, user.id));
      if (entitlement.tier !== user.tier) {
        result.changed += 1;
        result.changes.push({ userId: user.id, from: user.tier, to: entitlement.tier });
      }
    }

    await db
      .update(cronRuns)
      .set({
        finishedAt: new Date(),
        ok: true,
        note: `checked ${result.checked}, changed ${result.changed}`,
      })
      .where(eq(cronRuns.id, runId));
    return result;
  } catch (error) {
    await db
      .update(cronRuns)
      .set({ finishedAt: new Date(), ok: false, note: String(error).slice(0, 2000) })
      .where(eq(cronRuns.id, runId));
    throw error;
  }
}

/** The tier a product grants — `products.tier`, defaulting to the entry guide. */
export async function tierForProductSlug(slug: string): Promise<MinTier> {
  if (!hasDatabase()) return slug === GUIDE_ENTRY_SLUG ? 'entry' : 'insider';
  const [row] = await getDb()
    .select({ tier: products.tier })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return row?.tier ?? 'entry';
}

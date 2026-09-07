import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { leadEvents, users } from '@/db/schema';
import { TIERS, entitlementFor, tierRank } from './entitlements';
import type { Tier } from '@/db/schema';

/**
 * Support actions on a member's account (plan §5.4.9).
 *
 * A manual grant is the ONLY way `users.tier` is ever allowed to disagree with
 * the purchase and subscription rows, so every one is written through here and
 * recorded. The record goes in `lead_events` with `lead_id = 0`: it is the
 * existing audit table, and O9 is not adding a ninth one for a rare action.
 */

export type GrantResult = { ok: true; message: string } | { ok: false; error: string };

export async function grantTierUntil(input: {
  userId: number;
  tier: string;
  /** `YYYY-MM-DD`, or null for no expiry (a permanent grant). */
  until: string | null;
  byEmail: string;
}): Promise<GrantResult> {
  if (!hasDatabase()) return { ok: false, error: 'DATABASE_URL is not set' };
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

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (!user) return { ok: false, error: 'No member with that id' };

  // What the rows say, so the log records what the grant actually overrode.
  const computed = await entitlementFor(user);

  await db.update(users).set({ tier, tierExpiresAt: expiresAt }).where(eq(users.id, user.id));

  await db.insert(leadEvents).values({
    leadId: 0,
    type: 'admin.grant_tier',
    payload: {
      userId: user.id,
      email: user.email,
      from: user.tier,
      to: tier,
      until: input.until,
      entitledTo: computed.tier,
      by: input.byEmail,
      at: new Date().toISOString(),
    },
  });

  const note =
    tierRank(tier) > tierRank(computed.tier)
      ? ` (their rows only entitle them to "${computed.tier}" — the next reconcile will NOT undo this while the expiry holds)`
      : '';
  return {
    ok: true,
    message: `${user.email} set to "${tier}"${input.until ? ` until ${input.until}` : ''}${note}.`,
  };
}

import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { products, providerCustomers, subscriptions } from '@/db/schema';
import { mapSubscriptionStatus, type LsWebhookBody } from './lemonsqueezy';
import { findOrCreateUser } from './member-auth';
import { entitlementFor, refreshUserTier } from './entitlements';
import { fulfilCheckout, markRefunded } from './purchases';
import { insiderWelcomeEmail } from './email-templates';
import { sendEmail, unsubscribeUrl } from './email';
import { GUIDE_INSIDER_SLUG, isSiteKey, siteOrigin, type SiteKey } from '@/sites/registry';

/**
 * Lemon Squeezy event handling (plan §5.4.6).
 *
 * The webhook route owns the signature, the raw body and the idempotency log.
 * This file owns what the events MEAN: which row they write, and the one rule
 * that matters — after every paid event the user's cached tier is recomputed
 * from the rows by `entitlements.ts`, never set by hand from the event.
 */

export interface LsHandled {
  handled: string;
  userId?: number;
  subscriptionId?: number;
  purchaseId?: number;
}

const SUBSCRIPTION_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_resumed',
  'subscription_expired',
  'subscription_paused',
  'subscription_unpaused',
  'subscription_payment_success',
  'subscription_payment_failed',
]);

function str(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s === '' ? undefined : s;
}

function date(value: unknown): Date | null {
  const raw = str(value);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function siteFrom(body: LsWebhookBody): SiteKey {
  const custom = body.meta?.custom_data ?? {};
  // The brand we put into `checkout_data.custom` comes back on every event for
  // that subscription; `guide` is the only brand that sells today anyway.
  return isSiteKey(custom.site) ? custom.site : 'guide';
}

export async function handleLemonSqueezyEvent(body: LsWebhookBody): Promise<LsHandled> {
  const event = body.meta?.event_name ?? '';
  const attrs = (body.data?.attributes ?? {}) as Record<string, unknown>;
  const site = siteFrom(body);

  if (event === 'order_created') return handleOrder(body, attrs, site);
  if (event === 'order_refunded') return handleOrderRefunded(body);
  if (SUBSCRIPTION_EVENTS.has(event)) return handleSubscription(body, attrs, site, event);

  // Unknown events are logged by the route and ignored here, exactly as
  // pararesi did — a new LS event type must never 500 the endpoint.
  return { handled: `ignored:${event || 'unknown'}` };
}

/* ------------------------------------------------------------------ orders */

/**
 * A one-time Lemon Squeezy purchase. It goes through the same `fulfilCheckout`
 * as Stripe, so there is one delivery path, one download-token policy and one
 * receipt email for both processors (plan §1.13).
 */
async function handleOrder(
  body: LsWebhookBody,
  attrs: Record<string, unknown>,
  site: SiteKey,
): Promise<LsHandled> {
  const orderId = str(body.data?.id);
  const email = str(attrs.user_email) ?? str(body.meta?.custom_data?.email);
  if (!orderId || !email) return { handled: 'order_created:incomplete' };
  if (str(attrs.status) === 'refunded') return { handled: 'order_created:refunded' };

  const total = Number(attrs.total ?? 0);
  const result = await fulfilCheckout({
    checkoutId: `ls_order_${orderId}`,
    provider: 'lemonsqueezy',
    providerOrderId: orderId,
    email,
    name: str(attrs.user_name) ?? null,
    amountCents: Number.isFinite(total) ? total : 0,
    currency: (str(attrs.currency) ?? 'USD').toUpperCase(),
    site,
    productSlug: str(body.meta?.custom_data?.product),
    raw: body,
  });

  if (result.userId) {
    await linkCustomer(result.userId, str(attrs.customer_id));
  }
  return { handled: 'order_created', purchaseId: result.purchaseId, userId: result.userId };
}

/**
 * The charge came back (O17 §14.1.4). Before O17 `order_refunded` was in the
 * ignored bucket, so a refunded Lemon Squeezy buyer kept `entry` for ever —
 * `markRefunded` existed and nothing called it on this side.
 *
 * `purchases.provider_order_id` for a Lemon Squeezy order is the order id, which
 * is exactly what `data.id` carries on this event, so the row is found the same
 * way the Stripe refund path finds its own. `markRefunded` recomputes the tier
 * immediately rather than waiting for the nightly reconcile.
 */
async function handleOrderRefunded(body: LsWebhookBody): Promise<LsHandled> {
  const orderId = str(body.data?.id);
  if (!orderId) return { handled: 'order_refunded:incomplete' };
  await markRefunded(orderId, 'lemonsqueezy');
  return { handled: 'order_refunded' };
}

/* ----------------------------------------------------------- subscriptions */

async function handleSubscription(
  body: LsWebhookBody,
  attrs: Record<string, unknown>,
  site: SiteKey,
  event: string,
): Promise<LsHandled> {
  if (!hasDatabase()) return { handled: `${event}:no-database` };
  const subscriptionId = str(body.data?.id);
  const email = str(attrs.user_email) ?? str(body.meta?.custom_data?.email);
  if (!subscriptionId || !email) return { handled: `${event}:incomplete` };

  const db = getDb();
  const user = await findOrCreateUser({ email, name: str(attrs.user_name) ?? null, site });
  if (!user) return { handled: `${event}:no-user` };
  await linkCustomer(user.id, str(attrs.customer_id));

  // `payment_failed` does not itself end a subscription — LS moves the status
  // to past_due and keeps retrying — so the status on the payload is trusted
  // for everything except that one event, where it may still say `active`.
  const status =
    event === 'subscription_payment_failed'
      ? 'past_due'
      : mapSubscriptionStatus(attrs.status);

  const renewsAt = date(attrs.renews_at);
  const endsAt = date(attrs.ends_at);
  const productSlug = str(body.meta?.custom_data?.product) ?? GUIDE_INSIDER_SLUG;
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, productSlug))
    .limit(1);

  const wasInsider = (await entitlementFor(user)).tier === 'insider';

  const values = {
    site,
    productId: product?.id ?? null,
    userId: user.id,
    provider: 'lemonsqueezy' as const,
    providerSubscriptionId: subscriptionId,
    status,
    currentPeriodEnd: renewsAt,
    // A cancellation is not an end date: access runs to the end of the period
    // already paid for (plan §1.12).
    cancelledAt: status === 'cancelled' || status === 'expired' ? (date(attrs.cancelled_at) ?? new Date()) : null,
    endsAt: endsAt ?? (status === 'cancelled' ? renewsAt : null),
    raw: body as unknown as object,
  };

  await db
    .insert(subscriptions)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        status: sql`values(status)`,
        currentPeriodEnd: sql`values(current_period_end)`,
        cancelledAt: sql`values(cancelled_at)`,
        endsAt: sql`values(ends_at)`,
        raw: sql`values(raw)`,
        productId: sql`coalesce(values(product_id), product_id)`,
      },
    });

  const [row] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.provider, 'lemonsqueezy'),
        eq(subscriptions.providerSubscriptionId, subscriptionId),
      ),
    )
    .limit(1);

  // The cache follows the rows (plan §1.12) — this is the only write to it.
  const tier = await refreshUserTier(user.id);

  // Welcome them once, on the transition into Insider, not on every renewal.
  if (tier === 'insider' && !wasInsider) {
    await sendInsiderWelcome(user.email, user.name, site);
  }

  return { handled: event, userId: user.id, subscriptionId: row?.id };
}

async function sendInsiderWelcome(
  email: string,
  name: string | null,
  site: SiteKey,
): Promise<void> {
  try {
    const outcome = await sendEmail({
      to: email,
      ...insiderWelcomeEmail({
        site,
        name,
        membersUrl: `${siteOrigin(site)}/members`,
        unsubscribeUrl: unsubscribeUrl(site, email),
      }),
    });
    if (!outcome.ok) console.error('[subscriptions] welcome email failed', outcome.error);
  } catch (error) {
    console.error('[subscriptions] could not send the welcome email', error);
  }
}

/** Records the buyer's id at the processor, so support can find them there. */
export async function linkCustomer(
  userId: number,
  providerCustomerId: string | undefined,
  provider: 'stripe' | 'lemonsqueezy' = 'lemonsqueezy',
): Promise<void> {
  if (!providerCustomerId || !hasDatabase()) return;
  try {
    await getDb()
      .insert(providerCustomers)
      .values({ userId, provider, providerCustomerId })
      .onDuplicateKeyUpdate({ set: { userId: sql`values(user_id)` } });
  } catch (error) {
    console.error('[subscriptions] could not link the provider customer', error);
  }
}

/** Used by the admin member list and the import script. */
export async function subscriptionsForUser(userId: number) {
  if (!hasDatabase()) return [];
  return getDb().select().from(subscriptions).where(eq(subscriptions.userId, userId));
}


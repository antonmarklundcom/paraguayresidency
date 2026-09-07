import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import {
  downloadTokens,
  products,
  purchases,
  type Product,
  type Provider,
  type Purchase,
  type SiteValue,
} from '@/db/schema';
import { GUIDE_ENTRY_SLUG, siteOrigin, type SiteKey } from '@/sites/registry';
import { randomToken } from './signing';
import { expiryFrom, MAX_DOWNLOADS } from './download-policy';
import { absoluteUrl, sendEmail, unsubscribeUrl } from './email';
import { magicLinkEmail, purchaseEmail } from './email-templates';
import { issueMagicToken, magicLinkUrl, findOrCreateUser } from './member-auth';
import { refreshUserTier } from './entitlements';

/**
 * Purchase lifecycle for one-time products, from EITHER provider (plan §1.13).
 * A webhook is the only writer that may mark a purchase `paid` (§5.2.4 trap:
 * never trust the success URL alone), and it is idempotent on the provider's
 * checkout id.
 *
 * O9 renamed the table from `orders`; the only behavioural change on the
 * Stripe side is the table it writes and the member account it now creates.
 */

export const GUIDE_SLUG = GUIDE_ENTRY_SLUG;

/**
 * The Guide product row. When the database is unavailable (build, dev without
 * MySQL) the env defaults stand in so the sales page can still render a price
 * and the checkout button can still say why it is disabled.
 */
export async function getGuideProduct(): Promise<Product | null> {
  return getProductBySlug(GUIDE_SLUG);
}

/** Any product by slug — the checkout router's entry point (plan §5.4.6). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDatabase()) return null;
  try {
    const [row] = await getDb().select().from(products).where(eq(products.slug, slug)).limit(1);
    return row ?? null;
  } catch (error) {
    console.error('[purchases] could not load product', slug, error);
    return null;
  }
}

export function fallbackPriceCents(): number {
  const parsed = Number.parseInt(process.env.GUIDE_PRICE_CENTS ?? '4900', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 4900;
}

export function fallbackCurrency(): string {
  return (process.env.GUIDE_CURRENCY ?? 'USD').toUpperCase();
}

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Records the intent to buy so attribution survives the trip to the processor. */
export async function recordPendingPurchase(input: {
  productId: number;
  site: SiteValue;
  provider: Provider;
  checkoutId: string;
  email: string;
  amountCents: number;
  currency: string;
  utm?: Record<string, string>;
}): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await getDb()
      .insert(purchases)
      .values({
        productId: input.productId,
        site: input.site,
        provider: input.provider,
        email: input.email,
        providerCheckoutId: input.checkoutId,
        amountCents: input.amountCents,
        currency: input.currency,
        status: 'pending',
        utm: input.utm ?? null,
      })
      // Replaying the same checkout must not reset a paid purchase.
      .onDuplicateKeyUpdate({
        set: { providerCheckoutId: sql`values(provider_checkout_id)` },
      });
  } catch (error) {
    console.error('[purchases] could not record the pending purchase', error);
  }
}

export interface FulfilmentResult {
  status: 'fulfilled' | 'already-paid' | 'ignored';
  purchaseId?: number;
  userId?: number;
  token?: string;
}

/**
 * Marks a purchase paid and delivers it. Called by BOTH webhooks (plan §5.4.6).
 *
 * Idempotent on the provider's checkout id: a replayed delivery (Stripe retries
 * for days) finds the row already `paid` and returns without minting a second
 * download token or sending a second email.
 *
 * Since O9 it also gives the buyer an account and a sign-in link — the same
 * `users` row that carries an Insider membership (plan §1.5, §1.15).
 */
export async function fulfilCheckout(input: {
  /** The provider's checkout id — a Stripe session id, or the LS order id. */
  checkoutId: string;
  provider?: Provider;
  /** Stripe payment intent, or the Lemon Squeezy order id. */
  providerOrderId?: string | null;
  email: string;
  name?: string | null;
  amountCents: number;
  currency: string;
  site?: SiteKey;
  productSlug?: string;
  raw?: unknown;
  now?: Date;
}): Promise<FulfilmentResult> {
  if (!hasDatabase()) {
    console.error('[purchases] DATABASE_URL is not set — cannot fulfil', input.checkoutId);
    return { status: 'ignored' };
  }
  const now = input.now ?? new Date();
  const provider = input.provider ?? 'stripe';
  const site = input.site ?? 'guide';
  const db = getDb();

  const [existing] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.providerCheckoutId, input.checkoutId))
    .limit(1);

  if (existing?.status === 'paid') {
    return { status: 'already-paid', purchaseId: existing.id, userId: existing.userId ?? undefined };
  }

  const product = await getProductBySlug(input.productSlug ?? GUIDE_SLUG);
  if (!product && !existing) {
    console.error('[purchases] no product row — cannot fulfil', input.checkoutId);
    return { status: 'ignored' };
  }

  // The buyer's account. A failure here must not lose the purchase, so it is
  // best-effort and the row is written either way.
  let userId: number | undefined;
  try {
    const user = await findOrCreateUser({ email: input.email, name: input.name, site });
    userId = user?.id;
  } catch (error) {
    console.error('[purchases] could not create the buyer account', error);
  }

  let purchaseId: number;
  if (existing) {
    await db
      .update(purchases)
      .set({
        status: 'paid',
        paidAt: now,
        email: input.email,
        name: input.name ?? existing.name,
        userId: userId ?? existing.userId,
        provider,
        providerOrderId: input.providerOrderId ?? null,
        amountCents: input.amountCents,
        currency: input.currency,
        raw: (input.raw as object) ?? existing.raw,
      })
      .where(eq(purchases.id, existing.id));
    purchaseId = existing.id;
  } else {
    const [inserted] = await db.insert(purchases).values({
      productId: product!.id,
      site,
      userId: userId ?? null,
      email: input.email,
      name: input.name ?? null,
      provider,
      providerCheckoutId: input.checkoutId,
      providerOrderId: input.providerOrderId ?? null,
      amountCents: input.amountCents,
      currency: input.currency,
      status: 'paid',
      raw: (input.raw as object) ?? null,
      paidAt: now,
    });
    purchaseId = Number(inserted.insertId);
  }

  // The tier cache follows the rows, never the other way round (plan §1.12).
  if (userId) await refreshUserTier(userId, now);

  // Only a product with a file has anything to download. Lemon Squeezy also
  // fires `order_created` for the first invoice of a SUBSCRIPTION, and
  // offering that buyer a "download the guide" link would mint a token for a
  // product with no file and send them to a 503.
  if (!product?.fileKey) {
    await sendSignInLink(input.email, site);
    return { status: 'fulfilled', purchaseId, userId };
  }

  const token = await issueDownloadToken(purchaseId, now);
  await sendPurchaseEmail({
    purchaseId,
    site,
    email: input.email,
    name: input.name ?? null,
    token,
    productName: product.name,
    now,
  });

  return { status: 'fulfilled', purchaseId, userId, token };
}

export async function issueDownloadToken(
  purchaseId: number,
  now: Date = new Date(),
): Promise<string> {
  const token = randomToken();
  await getDb().insert(downloadTokens).values({
    purchaseId,
    token,
    expiresAt: expiryFrom(now),
    maxDownloads: MAX_DOWNLOADS,
  });
  return token;
}

export function downloadUrl(token: string): string {
  return absoluteUrl('guide', `/api/download/${encodeURIComponent(token)}`);
}

export async function sendPurchaseEmail(input: {
  purchaseId: number;
  site?: SiteKey;
  email: string;
  name: string | null;
  token: string;
  productName: string;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  const site = input.site ?? 'guide';
  const body = purchaseEmail({
    site,
    name: input.name,
    productName: input.productName,
    downloadUrl: downloadUrl(input.token),
    expiresAt: expiryFrom(now),
    maxDownloads: MAX_DOWNLOADS,
    // The Guide's job is to feed the service brands (plan §1.2).
    consultationUrl: `${siteOrigin('residency')}/book`,
    unsubscribeUrl: unsubscribeUrl(site, input.email),
  });
  const outcome = await sendEmail({ to: input.email, ...body });
  if (!outcome.ok) {
    console.error('[purchases] purchase email failed for', input.purchaseId, outcome.error);
  }
  // The buyer now has an account they never asked to create, so the sign-in
  // link goes out with the receipt rather than waiting to be discovered.
  await sendSignInLink(input.email, site);
}

/** Best-effort: a failed sign-in email must never fail a fulfilment. */
export async function sendSignInLink(email: string, site: SiteKey): Promise<void> {
  try {
    const token = issueMagicToken(email, site);
    const outcome = await sendEmail({
      to: email,
      ...magicLinkEmail({ site, url: magicLinkUrl(token, site) }),
    });
    if (!outcome.ok) console.error('[purchases] sign-in link email failed', outcome.error);
  } catch (error) {
    console.error('[purchases] could not send the sign-in link', error);
  }
}

/** Admin action: mint a fresh link for a paid purchase and email it again. */
export async function resendDownload(purchaseId: number): Promise<{ ok: boolean; error?: string }> {
  if (!hasDatabase()) return { ok: false, error: 'DATABASE_URL is not set' };
  const db = getDb();
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.id, purchaseId), eq(purchases.status, 'paid')))
    .limit(1);
  if (!purchase) return { ok: false, error: 'No paid purchase with that id' };

  const product = await getGuideProduct();
  const now = new Date();
  const token = await issueDownloadToken(purchase.id, now);
  await sendPurchaseEmail({
    purchaseId: purchase.id,
    site: purchase.site,
    email: purchase.email,
    name: purchase.name,
    token,
    productName: product?.name ?? 'The Paraguay Residency Guide',
    now,
  });
  return { ok: true };
}

/**
 * The charge came back. A refund removes the entitlement the purchase granted,
 * so the buyer's tier is recomputed immediately rather than at the next cron.
 */
export async function markRefunded(providerOrderId: string, provider: Provider = 'stripe'): Promise<void> {
  if (!hasDatabase()) return;
  const db = getDb();
  const rows = await db
    .select({ id: purchases.id, userId: purchases.userId })
    .from(purchases)
    .where(and(eq(purchases.provider, provider), eq(purchases.providerOrderId, providerOrderId)));
  if (!rows.length) return;

  await db
    .update(purchases)
    .set({ status: 'refunded' })
    .where(and(eq(purchases.provider, provider), eq(purchases.providerOrderId, providerOrderId)));

  for (const row of rows) {
    if (row.userId) await refreshUserTier(row.userId);
  }
}

export type { Purchase };

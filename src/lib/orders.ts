import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { downloadTokens, orders, products, type Order, type Product } from '@/db/schema';
import { siteOrigin } from '@/sites/registry';
import { randomToken } from './signing';
import { expiryFrom, MAX_DOWNLOADS } from './download-policy';
import { absoluteUrl, sendEmail, unsubscribeUrl } from './email';
import { purchaseEmail } from './email-templates';

/**
 * Order lifecycle for the paid guide. The webhook is the only writer that may
 * mark an order `paid` (plan §5.2.4 trap: never trust the success URL alone),
 * and it is idempotent on `stripe_session_id`.
 */

export const GUIDE_SLUG = 'paraguay-residency-guide';

/**
 * The Guide product row. When the database is unavailable (build, dev without
 * MySQL) the env defaults stand in so the sales page can still render a price
 * and the checkout button can still say why it is disabled.
 */
export async function getGuideProduct(): Promise<Product | null> {
  if (!hasDatabase()) return null;
  try {
    const [row] = await getDb().select().from(products).where(eq(products.slug, GUIDE_SLUG)).limit(1);
    return row ?? null;
  } catch (error) {
    console.error('[orders] could not load the guide product', error);
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

/** Records the intent to buy so attribution survives the trip to Stripe. */
export async function recordPendingOrder(input: {
  productId: number;
  sessionId: string;
  email: string;
  amountCents: number;
  currency: string;
  utm?: Record<string, string>;
}): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await getDb()
      .insert(orders)
      .values({
        productId: input.productId,
        email: input.email,
        stripeSessionId: input.sessionId,
        amountCents: input.amountCents,
        currency: input.currency,
        status: 'pending',
        site: 'guide',
        utm: input.utm ?? null,
      })
      // Replaying the same session must not reset a paid order.
      .onDuplicateKeyUpdate({ set: { stripeSessionId: sql`values(stripe_session_id)` } });
  } catch (error) {
    console.error('[orders] could not record the pending order', error);
  }
}

export interface FulfilmentResult {
  status: 'fulfilled' | 'already-paid' | 'ignored';
  orderId?: number;
  token?: string;
}

/**
 * Marks an order paid and delivers it. Idempotent on `stripe_session_id`: a
 * replayed webhook (Stripe retries for days) finds the order already `paid`
 * and returns without minting a second token or sending a second email.
 */
export async function fulfilCheckout(input: {
  sessionId: string;
  paymentIntent?: string | null;
  email: string;
  name?: string | null;
  amountCents: number;
  currency: string;
  now?: Date;
}): Promise<FulfilmentResult> {
  if (!hasDatabase()) {
    console.error('[orders] DATABASE_URL is not set — cannot fulfil', input.sessionId);
    return { status: 'ignored' };
  }
  const now = input.now ?? new Date();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, input.sessionId))
    .limit(1);

  if (existing?.status === 'paid') return { status: 'already-paid', orderId: existing.id };

  const product = await getGuideProduct();
  if (!product && !existing) {
    console.error('[orders] no guide product row — cannot fulfil', input.sessionId);
    return { status: 'ignored' };
  }

  let orderId: number;
  if (existing) {
    await db
      .update(orders)
      .set({
        status: 'paid',
        paidAt: now,
        email: input.email,
        name: input.name ?? existing.name,
        stripePaymentIntent: input.paymentIntent ?? null,
        amountCents: input.amountCents,
        currency: input.currency,
      })
      .where(eq(orders.id, existing.id));
    orderId = existing.id;
  } else {
    const [inserted] = await db.insert(orders).values({
      productId: product!.id,
      email: input.email,
      name: input.name ?? null,
      stripeSessionId: input.sessionId,
      stripePaymentIntent: input.paymentIntent ?? null,
      amountCents: input.amountCents,
      currency: input.currency,
      status: 'paid',
      site: 'guide',
      paidAt: now,
    });
    orderId = Number(inserted.insertId);
  }

  const token = await issueDownloadToken(orderId, now);
  await sendPurchaseEmail({
    orderId,
    email: input.email,
    name: input.name ?? null,
    token,
    productName: product?.name ?? 'The Paraguay Residency Guide',
    now,
  });

  return { status: 'fulfilled', orderId, token };
}

export async function issueDownloadToken(orderId: number, now: Date = new Date()): Promise<string> {
  const token = randomToken();
  await getDb().insert(downloadTokens).values({
    orderId,
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
  orderId: number;
  email: string;
  name: string | null;
  token: string;
  productName: string;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  const body = purchaseEmail({
    site: 'guide',
    name: input.name,
    productName: input.productName,
    downloadUrl: downloadUrl(input.token),
    expiresAt: expiryFrom(now),
    maxDownloads: MAX_DOWNLOADS,
    // The Guide's job is to feed the service brands (plan §1.2).
    consultationUrl: `${siteOrigin('residency')}/book`,
    unsubscribeUrl: unsubscribeUrl('guide', input.email),
  });
  const outcome = await sendEmail({ to: input.email, ...body });
  if (!outcome.ok) {
    console.error('[orders] purchase email failed for order', input.orderId, outcome.error);
  }
}

/** Admin action: mint a fresh link for a paid order and email it again. */
export async function resendDownload(orderId: number): Promise<{ ok: boolean; error?: string }> {
  if (!hasDatabase()) return { ok: false, error: 'DATABASE_URL is not set' };
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.status, 'paid')))
    .limit(1);
  if (!order) return { ok: false, error: 'No paid order with that id' };

  const product = await getGuideProduct();
  const now = new Date();
  const token = await issueDownloadToken(order.id, now);
  await sendPurchaseEmail({
    orderId: order.id,
    email: order.email,
    name: order.name,
    token,
    productName: product?.name ?? 'The Paraguay Residency Guide',
    now,
  });
  return { ok: true };
}

/** Stripe told us the charge came back. Refunded orders lose their access. */
export async function markRefunded(paymentIntent: string): Promise<void> {
  if (!hasDatabase()) return;
  await getDb()
    .update(orders)
    .set({ status: 'refunded' })
    .where(eq(orders.stripePaymentIntent, paymentIntent));
}

export type { Order };

import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { downloadTokens, orders } from '@/db/schema';
import { downloadState } from './download-policy';
import { fulfilCheckout, downloadUrl } from './orders';
import { retrieveCheckoutSession, stripeConfigured } from './stripe';

/**
 * What `/thank-you?session_id=…` may show.
 *
 * The session id in the URL is never treated as proof of payment (plan §5.2.4
 * trap). It is only used to *look up* the order the webhook already marked
 * paid; if the webhook has not landed yet, we ask Stripe directly — a
 * server-to-server answer, not the query string — and fulfil on that.
 */
export type ThankYouState =
  | { status: 'ready'; url: string }
  | { status: 'pending' }
  | { status: 'unknown' };

export async function resolveThankYou(sessionId: string | undefined): Promise<ThankYouState> {
  if (!sessionId || !hasDatabase()) return { status: 'unknown' };
  const db = getDb();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);

  if (order?.status === 'paid') {
    const url = await latestUsableToken(order.id);
    return url ? { status: 'ready', url } : { status: 'pending' };
  }

  // The webhook may simply be a few seconds behind, or may have been missed
  // entirely (a misconfigured endpoint in test mode). Ask Stripe itself.
  if (stripeConfigured()) {
    try {
      const session = await retrieveCheckoutSession(sessionId);
      const email = session.customer_details?.email ?? session.customer_email ?? '';
      if (session.payment_status === 'paid' && email) {
        const result = await fulfilCheckout({
          sessionId: session.id,
          paymentIntent: session.payment_intent ?? null,
          email,
          name: session.customer_details?.name ?? null,
          amountCents: session.amount_total ?? 0,
          currency: (session.currency ?? 'usd').toUpperCase(),
        });
        if (result.token) return { status: 'ready', url: downloadUrl(result.token) };
        if (result.orderId) {
          const url = await latestUsableToken(result.orderId);
          if (url) return { status: 'ready', url };
        }
        return { status: 'pending' };
      }
    } catch (error) {
      console.error('[thank-you] could not confirm the session with Stripe', error);
    }
  }

  return order ? { status: 'pending' } : { status: 'unknown' };
}

async function latestUsableToken(orderId: number): Promise<string | null> {
  const rows = await getDb()
    .select()
    .from(downloadTokens)
    .where(eq(downloadTokens.orderId, orderId))
    .orderBy(desc(downloadTokens.id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const state = downloadState({
    expiresAt: row.expiresAt,
    downloads: row.downloads,
    maxDownloads: row.maxDownloads,
    orderStatus: 'paid',
  });
  return state === 'ok' ? downloadUrl(row.token) : null;
}

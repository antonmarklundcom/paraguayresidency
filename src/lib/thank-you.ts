import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { downloadTokens, purchases } from '@/db/schema';
import { downloadState } from './download-policy';
import { fulfilCheckout, downloadUrl } from './purchases';
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

  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.providerCheckoutId, sessionId))
    .limit(1);

  if (purchase?.status === 'paid') {
    const url = await latestUsableToken(purchase.id);
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
          checkoutId: session.id,
          provider: 'stripe',
          providerOrderId: session.payment_intent ?? null,
          email,
          name: session.customer_details?.name ?? null,
          amountCents: session.amount_total ?? 0,
          currency: (session.currency ?? 'usd').toUpperCase(),
          productSlug: session.metadata?.product_slug,
          raw: session,
        });
        if (result.token) return { status: 'ready', url: downloadUrl(result.token) };
        if (result.purchaseId) {
          const url = await latestUsableToken(result.purchaseId);
          if (url) return { status: 'ready', url };
        }
        return { status: 'pending' };
      }
    } catch (error) {
      console.error('[thank-you] could not confirm the session with Stripe', error);
    }
  }

  return purchase ? { status: 'pending' } : { status: 'unknown' };
}

async function latestUsableToken(purchaseId: number): Promise<string | null> {
  const rows = await getDb()
    .select()
    .from(downloadTokens)
    .where(eq(downloadTokens.purchaseId, purchaseId))
    .orderBy(desc(downloadTokens.id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const state = downloadState({
    expiresAt: row.expiresAt,
    downloads: row.downloads,
    maxDownloads: row.maxDownloads,
    purchaseStatus: 'paid',
  });
  return state === 'ok' ? downloadUrl(row.token) : null;
}

import { NextResponse, type NextRequest } from 'next/server';
import { verifyStripeSignature } from '@/lib/stripe-signature';
import { stripeWebhookConfigured } from '@/lib/stripe';
import { fulfilCheckout, markRefunded } from '@/lib/purchases';
import { recordWebhookEvent, finishWebhookEvent } from '@/lib/webhooks';
import { isSiteKey } from '@/sites/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook (plan §5.2.4 traps: verify the signature, be idempotent on
 * the checkout id, never trust the success URL alone).
 *
 * The raw body text is read before any parsing — the signature covers the
 * exact bytes Stripe sent, so re-serialising a parsed object would never match.
 *
 * Since O9 it writes `webhook_events` BEFORE doing anything else, exactly like
 * the Lemon Squeezy sibling: a duplicate delivery returns 200 and changes
 * nothing (plan §5.4.6).
 */
interface StripeEvent {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
}

export async function POST(request: NextRequest) {
  if (!stripeWebhookConfigured()) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set — rejecting');
    return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
  }

  const payload = await request.text();
  const verdict = verifyStripeSignature({
    payload,
    header: request.headers.get('stripe-signature'),
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  if (verdict !== 'ok') {
    console.error('[stripe-webhook] signature rejected:', verdict);
    return NextResponse.json({ ok: false, error: verdict }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  // Idempotency first, work second. Stripe retries for days, and both
  // webhooks share one log so one query answers "did we see this delivery".
  const logged = await recordWebhookEvent({
    provider: 'stripe',
    providerEventId: event.id ?? `${event.type}:${JSON.stringify(event.data?.object ?? {}).length}`,
    type: event.type ?? 'unknown',
    payload: event,
  });
  // Seen AND finished: a plain retry, so do nothing. Seen but never finished:
  // the previous attempt failed, and this retry is the second chance.
  if (logged.duplicate && logged.processed) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = (event.data?.object ?? {}) as {
          id?: string;
          payment_status?: string;
          payment_intent?: string | null;
          amount_total?: number | null;
          currency?: string | null;
          customer_email?: string | null;
          customer_details?: { email?: string | null; name?: string | null } | null;
          metadata?: Record<string, string> | null;
        };
        const email = session.customer_details?.email ?? session.customer_email ?? '';
        // `completed` fires for unpaid sessions too (e.g. a delayed method).
        if (!session.id || session.payment_status !== 'paid' || !email) {
          await finishWebhookEvent(logged.id);
          return NextResponse.json({ ok: true, ignored: 'not-paid' });
        }
        const metadata = session.metadata ?? {};
        const result = await fulfilCheckout({
          checkoutId: session.id,
          provider: 'stripe',
          providerOrderId: session.payment_intent ?? null,
          email,
          name: session.customer_details?.name ?? null,
          amountCents: session.amount_total ?? 0,
          currency: (session.currency ?? 'usd').toUpperCase(),
          site: isSiteKey(metadata.site) ? metadata.site : undefined,
          productSlug: metadata.product_slug,
          raw: event,
        });
        await finishWebhookEvent(logged.id);
        return NextResponse.json({ ok: true, ...result, token: undefined });
      }

      case 'charge.refunded': {
        const charge = (event.data?.object ?? {}) as { payment_intent?: string | null };
        if (charge.payment_intent) await markRefunded(charge.payment_intent, 'stripe');
        await finishWebhookEvent(logged.id);
        return NextResponse.json({ ok: true, handled: 'refund' });
      }

      default:
        await finishWebhookEvent(logged.id);
        return NextResponse.json({ ok: true, ignored: event.type ?? 'unknown' });
    }
  } catch (error) {
    // A 500 makes Stripe retry, which is what we want for a transient DB fault.
    console.error('[stripe-webhook] handler failed', event.type, error);
    await finishWebhookEvent(logged.id, error);
    return NextResponse.json({ ok: false, error: 'handler-failed' }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { verifyStripeSignature } from '@/lib/stripe-signature';
import { stripeWebhookConfigured } from '@/lib/stripe';
import { fulfilCheckout, markRefunded } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook (plan §5.2.4 traps: verify the signature, be idempotent on
 * `stripe_session_id`, never trust the success URL alone).
 *
 * The raw body text is read before any parsing — the signature covers the
 * exact bytes Stripe sent, so re-serialising a parsed object would never match.
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
        };
        const email = session.customer_details?.email ?? session.customer_email ?? '';
        // `completed` fires for unpaid sessions too (e.g. a delayed method).
        if (!session.id || session.payment_status !== 'paid' || !email) {
          return NextResponse.json({ ok: true, ignored: 'not-paid' });
        }
        const result = await fulfilCheckout({
          sessionId: session.id,
          paymentIntent: session.payment_intent ?? null,
          email,
          name: session.customer_details?.name ?? null,
          amountCents: session.amount_total ?? 0,
          currency: (session.currency ?? 'usd').toUpperCase(),
        });
        return NextResponse.json({ ok: true, ...result, token: undefined });
      }

      case 'charge.refunded': {
        const charge = (event.data?.object ?? {}) as { payment_intent?: string | null };
        if (charge.payment_intent) await markRefunded(charge.payment_intent);
        return NextResponse.json({ ok: true, handled: 'refund' });
      }

      default:
        return NextResponse.json({ ok: true, ignored: event.type ?? 'unknown' });
    }
  } catch (error) {
    // A 500 makes Stripe retry, which is what we want for a transient DB fault.
    console.error('[stripe-webhook] handler failed', event.type, error);
    return NextResponse.json({ ok: false, error: 'handler-failed' }, { status: 500 });
  }
}

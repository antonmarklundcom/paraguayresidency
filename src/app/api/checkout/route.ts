import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, StripeError, stripeConfigured } from '@/lib/stripe';
import {
  fallbackCurrency,
  fallbackPriceCents,
  getGuideProduct,
  recordPendingOrder,
} from '@/lib/orders';
import { pickUtm } from '@/lib/lead-schema';
import { checkFormGuard, isSilentDrop } from '@/lib/form-guard';
import { siteOrigin } from '@/sites/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Starts a Stripe Checkout session for the Guide (plan §5.2.4).
 *
 * Nothing here grants access: the order is written as `pending` only so the
 * attribution survives the trip to Stripe. Only the signed webhook may mark it
 * paid.
 */
const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255).optional().or(z.literal('')),
  utm: z.string().max(2000).optional(),
  ts: z.string().max(400).optional(),
  website: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  if (!stripeConfigured()) {
    // Plan §4.5: a missing credential degrades, it does not crash.
    return NextResponse.json(
      { ok: false, error: 'checkout-unavailable', reason: 'STRIPE_SECRET_KEY is not set' },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid-request' }, { status: 422 });
  }
  const body = parsed.data;

  const guard = checkFormGuard({ honeypot: body.website, timestamp: body.ts });
  // A bot gets a plausible answer and no session.
  if (isSilentDrop(guard)) return NextResponse.json({ ok: true, url: '/' });
  if (guard !== 'ok') {
    return NextResponse.json({ ok: false, error: 'expired-form' }, { status: 400 });
  }

  const product = await getGuideProduct();
  const amountCents = product?.priceCents ?? fallbackPriceCents();
  const currency = product?.currency ?? fallbackCurrency();
  const origin = siteOrigin('guide');
  const utm = pickUtm(new URLSearchParams(body.utm ?? ''));

  try {
    const session = await createCheckoutSession({
      successUrl: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/?checkout=cancelled`,
      email: body.email || undefined,
      priceId: product?.stripePriceId ?? process.env.STRIPE_GUIDE_PRICE_ID ?? null,
      productName: product?.name ?? 'The Paraguay Residency Guide',
      amountCents,
      currency,
      metadata: { site: 'guide', product_slug: product?.slug ?? 'paraguay-residency-guide', ...utm },
    });

    if (product) {
      await recordPendingOrder({
        productId: product.id,
        sessionId: session.id,
        email: body.email || '',
        amountCents,
        currency,
        utm,
      });
    }

    return NextResponse.json({ ok: true, url: session.url ?? null, id: session.id });
  } catch (error) {
    const message = error instanceof StripeError ? error.message : String(error);
    console.error('[checkout] could not create a session', message);
    return NextResponse.json({ ok: false, error: 'checkout-failed' }, { status: 502 });
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession, StripeError, stripeConfigured } from '@/lib/stripe';
import {
  createLemonSqueezyCheckout,
  LemonSqueezyError,
  lemonSqueezyConfigured,
} from '@/lib/lemonsqueezy';
import {
  fallbackCurrency,
  fallbackPriceCents,
  getProductBySlug,
  recordPendingPurchase,
} from '@/lib/purchases';
import { pickUtm } from '@/lib/lead-schema';
import { checkFormGuard, isSilentDrop } from '@/lib/form-guard';
import { currentSite } from '@/lib/current-site';
import { GUIDE_ENTRY_SLUG, isSiteKey, siteOrigin, siteSellsProducts } from '@/sites/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One checkout endpoint, two processors (plan §5.4.6).
 *
 * `products.provider` decides which one: Stripe for one-time products, Lemon
 * Squeezy for subscriptions. Nothing here grants access — the purchase or
 * subscription row is only marked paid by a signature-verified webhook.
 */
const bodySchema = z.object({
  product: z.string().trim().max(120).optional(),
  site: z.string().optional(),
  email: z.string().trim().toLowerCase().email().max(255).optional().or(z.literal('')),
  utm: z.string().max(2000).optional(),
  ts: z.string().max(400).optional(),
  website: z.string().max(200).optional(),
});

/** Plan §4.5: a missing credential degrades to "coming soon", never a crash. */
function comingSoon(reason: string) {
  return NextResponse.json({ ok: false, error: 'checkout-unavailable', reason }, { status: 503 });
}

export async function POST(request: NextRequest) {
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

  const site = isSiteKey(body.site) ? body.site : await currentSite();
  if (!siteSellsProducts(site)) {
    return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 });
  }

  const slug = body.product ?? GUIDE_ENTRY_SLUG;
  const product = await getProductBySlug(slug);
  const origin = siteOrigin(site);
  const utm = pickUtm(new URLSearchParams(body.utm ?? ''));

  // No row at all: only the entry guide has env fallbacks, and only for Stripe.
  if (!product && slug !== GUIDE_ENTRY_SLUG) {
    return NextResponse.json({ ok: false, error: 'unknown-product' }, { status: 404 });
  }
  if (product && !product.active) {
    return comingSoon(`product "${slug}" is not active`);
  }

  const provider = product?.provider ?? 'stripe';
  const amountCents = product?.priceCents ?? fallbackPriceCents();
  const currency = product?.currency ?? fallbackCurrency();

  if (provider === 'lemonsqueezy') {
    if (!lemonSqueezyConfigured()) {
      return comingSoon('LEMONSQUEEZY_API_KEY / LEMONSQUEEZY_STORE_ID are not set');
    }
    const variantId = product?.providerPriceId;
    if (!variantId) return comingSoon(`product "${slug}" has no Lemon Squeezy variant id`);

    try {
      const url = await createLemonSqueezyCheckout({
        variantId,
        email: body.email || undefined,
        // Round-tripped back on every webhook for this checkout, so the
        // handler knows the brand and product without guessing from a price.
        custom: { site, product: slug, ...(body.email ? { email: body.email } : {}) },
        successUrl: `${origin}/members`,
      });
      return NextResponse.json({ ok: true, url, provider });
    } catch (error) {
      const message = error instanceof LemonSqueezyError ? error.message : String(error);
      console.error('[checkout] Lemon Squeezy checkout failed', message);
      return NextResponse.json({ ok: false, error: 'checkout-failed' }, { status: 502 });
    }
  }

  if (!stripeConfigured()) return comingSoon('STRIPE_SECRET_KEY is not set');

  try {
    const session = await createCheckoutSession({
      successUrl: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/?checkout=cancelled`,
      email: body.email || undefined,
      priceId: product?.providerPriceId ?? process.env.STRIPE_GUIDE_PRICE_ID ?? null,
      productName: product?.name ?? 'The Paraguay Residency Guide',
      amountCents,
      currency,
      metadata: { site, product_slug: slug, ...utm },
    });

    if (product) {
      await recordPendingPurchase({
        productId: product.id,
        site,
        provider: 'stripe',
        checkoutId: session.id,
        email: body.email || '',
        amountCents,
        currency,
        utm,
      });
    }

    return NextResponse.json({ ok: true, url: session.url ?? null, id: session.id, provider });
  } catch (error) {
    const message = error instanceof StripeError ? error.message : String(error);
    console.error('[checkout] could not create a session', message);
    return NextResponse.json({ ok: false, error: 'checkout-failed' }, { status: 502 });
  }
}

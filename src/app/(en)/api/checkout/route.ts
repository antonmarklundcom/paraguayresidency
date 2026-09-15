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
  fulfilCheckout,
  getProductBySlug,
  recordPendingPurchase,
} from '@/lib/purchases';
import { randomToken } from '@/lib/signing';
import { clientIp, RATE_LIMIT_MESSAGE, take, takeLimit } from '@/lib/rate-limit';
import { pickUtm } from '@/lib/lead-schema';
import { checkFormGuard, isSilentDrop } from '@/lib/form-guard';
import { currentSite } from '@/lib/current-site';
import { GUIDE_ENTRY_SLUG, isSiteKey, siteOrigin, siteSellsProducts } from '@/sites/registry';

/**
 * TEMPORARY — remove once Stripe live keys are in place (plan §7). Grants the
 * Guide entry product for free instead of charging: FREE_ACCESS_MODE=true
 * skips Stripe entirely and calls the same `fulfilCheckout` a real webhook
 * would, so the buyer still gets a real `purchases` row (amount 0, marked
 * paid), a member account and the download email — see KNOWN-ISSUES.md.
 *
 * O17 hardened three things about it (plan §14.1.6):
 *
 *  - it worked exactly ONCE. Every free purchase was written with the constant
 *    `providerOrderId: 'free-access-mode'`, and `purchases_provider_order_uq`
 *    is `(provider, provider_order_id)` — so the second free buyer got an
 *    uncaught ER_DUP_ENTRY 500 (`docs/improvement-report.md` §1.3). The order
 *    id is now the checkout id, which is already unique and already random.
 *  - it stayed armed after Stripe went live. A forgotten `FREE_ACCESS_MODE=true`
 *    next to a real `STRIPE_SECRET_KEY` gave the product away; the two are now
 *    mutually exclusive and the live key wins.
 *  - it was an unauthenticated "create an account and email a sign-in link to
 *    any address" endpoint with no limit. Five per hour per IP.
 */
const FREE_ACCESS_WINDOW_MS = 60 * 60 * 1000;
const FREE_ACCESS_PER_IP = 5;

/**
 * Read at request time, not module scope: the tests and a running process must
 * both see a changed env, and a live Stripe key disarms it whatever the flag
 * says.
 */
export function freeAccessMode(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.FREE_ACCESS_MODE !== 'true') return false;
  if ((env.STRIPE_SECRET_KEY ?? '').trim() !== '') {
    console.error(
      '[checkout] FREE_ACCESS_MODE=true is ignored because STRIPE_SECRET_KEY is set — ' +
        'remove the flag (KNOWN-ISSUES.md) rather than giving the guide away next to a live key',
    );
    return false;
  }
  return true;
}

/**
 * The ids one free purchase is written with. `provider_order_id` MUST vary per
 * buyer: `purchases_provider_order_uq` is `(provider, provider_order_id)`, so
 * the old constant `'free-access-mode'` made the second free buyer an uncaught
 * ER_DUP_ENTRY 500. The checkout id is already unique and unguessable, so it
 * serves as both.
 */
export function freeAccessIds(): { checkoutId: string; providerOrderId: string } {
  const checkoutId = `free_${randomToken()}`;
  return { checkoutId, providerOrderId: checkoutId };
}

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
  // Every caller, before any parsing: creating a checkout session is a call to
  // Stripe or Lemon Squeezy on our API key, and `recordPendingPurchase` writes
  // a row (plan §14.2.1). Ten an hour is more purchases than any one visitor
  // makes and far fewer than a script wants.
  const limit = takeLimit('checkout', clientIp(request.headers));
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate-limited', message: RATE_LIMIT_MESSAGE },
      { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
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

  if (freeAccessMode() && provider === 'stripe' && slug === GUIDE_ENTRY_SLUG) {
    if (!body.email) {
      return NextResponse.json({ ok: false, error: 'email-required' }, { status: 422 });
    }
    // Unauthenticated, and it emails a sign-in link to whatever address it is
    // given — so it is limited per IP even though it charges nothing.
    const limit = take(
      `free-access:${clientIp(request.headers)}`,
      FREE_ACCESS_PER_IP,
      FREE_ACCESS_WINDOW_MS,
    );
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: 'rate-limited', message: 'Too many requests. Try again later.' },
        { status: 429, headers: { 'retry-after': String(limit.retryAfterSeconds) } },
      );
    }
    const { checkoutId, providerOrderId } = freeAccessIds();
    const result = await fulfilCheckout({
      checkoutId,
      provider: 'stripe',
      providerOrderId,
      email: body.email,
      amountCents: 0,
      currency,
      site,
      productSlug: slug,
      raw: { freeAccessMode: true, utm },
    });
    if (result.status === 'ignored') return comingSoon('free access mode could not fulfil');
    return NextResponse.json({
      ok: true,
      url: `${origin}/thank-you?session_id=${checkoutId}`,
      id: checkoutId,
      provider: 'free',
    });
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

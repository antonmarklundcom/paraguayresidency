import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { GUIDE_ENTRY_SLUG, GUIDE_INSIDER_SLUG, sites, siteSellsProducts } from '@/sites/registry';

/**
 * `POST /api/checkout` routes on `products.provider` (plan §5.4.6). The route
 * itself needs a database, so what is asserted here is the decision table it
 * implements, plus the §4.5 degradations, exercised through the route with the
 * data layer stubbed.
 */
const product = (over: Record<string, unknown> = {}) => ({
  id: 1,
  slug: GUIDE_ENTRY_SLUG,
  site: 'guide',
  name: 'The Paraguay Residency Guide',
  tier: 'entry',
  kind: 'one_time',
  provider: 'stripe',
  providerPriceId: 'price_123',
  priceCents: 700,
  currency: 'USD',
  interval: null,
  active: true,
  ...over,
});

const state = {
  product: product() as Record<string, unknown> | null,
  stripeCalled: 0,
  lsCalled: 0,
};

vi.mock('@/lib/purchases', () => ({
  getProductBySlug: async () => state.product,
  fallbackPriceCents: () => 700,
  fallbackCurrency: () => 'USD',
  recordPendingPurchase: async () => {},
}));

vi.mock('@/lib/stripe', () => ({
  stripeConfigured: () => Boolean(process.env.STRIPE_SECRET_KEY),
  StripeError: class StripeError extends Error {},
  createCheckoutSession: async () => {
    state.stripeCalled += 1;
    return { id: 'cs_test_1', url: 'https://checkout.stripe.com/cs_test_1' };
  },
}));

vi.mock('@/lib/lemonsqueezy', () => ({
  lemonSqueezyConfigured: () =>
    Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID),
  LemonSqueezyError: class LemonSqueezyError extends Error {},
  createLemonSqueezyCheckout: async () => {
    state.lsCalled += 1;
    return 'https://store.lemonsqueezy.com/checkout/abc';
  },
}));

vi.mock('@/lib/current-site', () => ({ currentSite: async () => 'guide' }));

const { POST } = await import('@/app/api/checkout/route');
const { issueFormTimestamp } = await import('@/lib/form-guard');

function post(body: Record<string, unknown>) {
  return POST(
    new Request('https://paraguayinvestorguide.com/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ts: issueFormTimestamp(Date.now() - 5000), ...body }),
    }) as never,
  );
}

beforeEach(() => {
  state.product = product();
  state.stripeCalled = 0;
  state.lsCalled = 0;
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.LEMONSQUEEZY_API_KEY = 'ls_key';
  process.env.LEMONSQUEEZY_STORE_ID = '1234';
});

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.LEMONSQUEEZY_API_KEY;
  delete process.env.LEMONSQUEEZY_STORE_ID;
});

describe('checkout routes on products.provider', () => {
  it('sends a Stripe product to Stripe', async () => {
    const body = await (await post({ product: GUIDE_ENTRY_SLUG })).json();
    expect(body).toMatchObject({ ok: true, provider: 'stripe' });
    expect(body.url).toContain('checkout.stripe.com');
    expect(state.stripeCalled).toBe(1);
    expect(state.lsCalled).toBe(0);
  });

  it('sends a Lemon Squeezy product to Lemon Squeezy', async () => {
    state.product = product({
      slug: GUIDE_INSIDER_SLUG,
      provider: 'lemonsqueezy',
      kind: 'subscription',
      tier: 'insider',
      providerPriceId: '99887',
      interval: 'month',
      priceCents: 900,
    });
    const body = await (await post({ product: GUIDE_INSIDER_SLUG })).json();
    expect(body).toMatchObject({ ok: true, provider: 'lemonsqueezy' });
    expect(body.url).toContain('lemonsqueezy.com');
    expect(state.lsCalled).toBe(1);
    expect(state.stripeCalled).toBe(0);
  });

  it('defaults to the entry guide when no product is named', async () => {
    const body = await (await post({})).json();
    expect(body).toMatchObject({ ok: true, provider: 'stripe' });
  });
});

describe('missing keys degrade, they never crash (plan §4.5)', () => {
  it('answers "coming soon" for Insider with no Lemon Squeezy keys', async () => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    state.product = product({
      slug: GUIDE_INSIDER_SLUG,
      provider: 'lemonsqueezy',
      kind: 'subscription',
      providerPriceId: '99887',
    });
    const response = await post({ product: GUIDE_INSIDER_SLUG });
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe('checkout-unavailable');
    expect(state.lsCalled).toBe(0);
  });

  it('answers "coming soon" for an inactive product, whatever the keys say', async () => {
    state.product = product({ active: false });
    const response = await post({ product: GUIDE_ENTRY_SLUG });
    expect(response.status).toBe(503);
    expect(state.stripeCalled).toBe(0);
  });

  it('answers "coming soon" when the Insider variant id is not set yet', async () => {
    state.product = product({
      slug: GUIDE_INSIDER_SLUG,
      provider: 'lemonsqueezy',
      kind: 'subscription',
      providerPriceId: null,
    });
    const response = await post({ product: GUIDE_INSIDER_SLUG });
    expect(response.status).toBe(503);
    expect(state.lsCalled).toBe(0);
  });

  it('answers "coming soon" for Stripe with no secret key', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const response = await post({ product: GUIDE_ENTRY_SLUG });
    expect(response.status).toBe(503);
    expect(state.stripeCalled).toBe(0);
  });
});

describe('checkout refuses what it should', () => {
  it('404s an unknown product slug', async () => {
    state.product = null;
    const response = await post({ product: 'not-a-real-product' });
    expect(response.status).toBe(404);
  });

  it('404s on a brand that sells nothing', async () => {
    const response = await post({ product: GUIDE_ENTRY_SLUG, site: 'frontier' });
    expect(response.status).toBe(404);
    expect(siteSellsProducts('frontier')).toBe(false);
    expect(sites.frontier.products).toBeUndefined();
  });

  it('swallows a honeypot hit without opening a checkout', async () => {
    const response = await post({ product: GUIDE_ENTRY_SLUG, website: 'http://spam.example' });
    expect(response.status).toBe(200);
    expect(state.stripeCalled).toBe(0);
    expect(state.lsCalled).toBe(0);
  });

  it('rejects a form with no signed timestamp', async () => {
    const response = await POST(
      new Request('https://paraguayinvestorguide.com/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product: GUIDE_ENTRY_SLUG }),
      }) as never,
    );
    expect(response.status).toBe(400);
    expect(state.stripeCalled).toBe(0);
  });
});

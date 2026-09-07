import { t } from '@/i18n';
import { issueFormTimestamp } from '@/lib/form-guard';
import {
  fallbackCurrency,
  fallbackPriceCents,
  formatPrice,
  getProductBySlug,
} from '@/lib/purchases';
import { stripeConfigured } from '@/lib/stripe';
import { lemonSqueezyConfigured } from '@/lib/lemonsqueezy';
import { GUIDE_ENTRY_SLUG } from '@/sites/registry';
import { CheckoutButtonClient, type CheckoutLabels } from './CheckoutButtonClient';

/**
 * The Guide's buy button. Server half: it reads the live price from the
 * `products` row (env defaults when there is no database yet) and decides
 * whether checkout is available at all.
 */
export async function CheckoutButton({
  site = 'guide' as const,
  product: slug = GUIDE_ENTRY_SLUG,
}: { site?: 'guide'; product?: string } = {}) {
  const product = await getProductBySlug(slug);
  const price = formatPrice(
    product?.priceCents ?? fallbackPriceCents(),
    product?.currency ?? fallbackCurrency(),
  );
  const provider = product?.provider ?? 'stripe';
  const subscription = product?.kind === 'subscription';

  // Whichever processor this product sells through has to be configured, and
  // the product itself has to be active. Otherwise the button says so rather
  // than opening a checkout that cannot complete (plan §4.5).
  const enabled =
    (product?.active ?? true) &&
    (provider === 'lemonsqueezy' ? lemonSqueezyConfigured() : stripeConfigured());

  const labels: CheckoutLabels = {
    buy: t(site, subscription ? 'checkout.insiderBuy' : 'checkout.buy', { price }),
    starting: t(site, 'checkout.starting'),
    unavailable: t(site, subscription ? 'checkout.comingSoon' : 'checkout.unavailable'),
    error: t(site, 'checkout.error'),
  };

  return (
    <CheckoutButtonClient
      enabled={enabled}
      product={slug}
      timestamp={issueFormTimestamp()}
      labels={labels}
    />
  );
}

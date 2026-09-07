import { t } from '@/i18n';
import { issueFormTimestamp } from '@/lib/form-guard';
import { fallbackCurrency, fallbackPriceCents, formatPrice, getGuideProduct } from '@/lib/orders';
import { stripeConfigured } from '@/lib/stripe';
import { CheckoutButtonClient, type CheckoutLabels } from './CheckoutButtonClient';

/**
 * The Guide's buy button. Server half: it reads the live price from the
 * `products` row (env defaults when there is no database yet) and decides
 * whether checkout is available at all.
 */
export async function CheckoutButton({ site = 'guide' as const }: { site?: 'guide' } = {}) {
  const product = await getGuideProduct();
  const price = formatPrice(
    product?.priceCents ?? fallbackPriceCents(),
    product?.currency ?? fallbackCurrency(),
  );

  const labels: CheckoutLabels = {
    buy: t(site, 'checkout.buy', { price }),
    starting: t(site, 'checkout.starting'),
    unavailable: t(site, 'checkout.unavailable'),
    error: t(site, 'checkout.error'),
  };

  return (
    <CheckoutButtonClient
      enabled={stripeConfigured()}
      timestamp={issueFormTimestamp()}
      labels={labels}
    />
  );
}

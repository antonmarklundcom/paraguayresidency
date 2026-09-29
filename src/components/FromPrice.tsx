import { facts, factPublished, localized, type Fact as FactEntry, type FactKey } from '@content/shared/facts';
import { t } from '@/i18n';
import type { OfferRoute } from '@/lib/service-routes';
import { getSite, type SiteKey } from '@/sites/registry';
import { Fact } from './Fact';

/** The service-fee fact behind each route (`pricing.*` in content/shared/facts.ts). */
export const FEE_FACT: Record<OfferRoute, FactKey> = {
  temporary: 'pricing.temporary',
  permanent: 'pricing.permanent',
  cedula: 'pricing.cedula',
  tax_residency: 'pricing.tax_residency',
  family: 'pricing.family',
  investor_pass: 'pricing.investor_pass',
};

/**
 * True once the fee fact is published (verified or sourced) AND its text for
 * this brand's language carries an actual figure. The second test keeps the
 * placeholder sentence ("fixed service fee confirmed in writing") from ever
 * being wrapped as "From <sentence> all-in" if the fact is flipped to
 * verified before a figure is typed in.
 */
export function hasFeeFigure(site: SiteKey, route: OfferRoute): boolean {
  const fact = facts[FEE_FACT[route]] as FactEntry;
  return factPublished(fact) && /\d/.test(localized(fact.display, getSite(site).locale));
}

/**
 * "From USD X all-in", from the `pricing.*` fact only. While the fact is
 * hedged this renders the fact's own honest wording ("a fixed service fee
 * quoted in writing …"), never a number and never an empty box.
 */
export function FromPrice({ site, route, className = '' }: { site: SiteKey; route: OfferRoute; className?: string }) {
  const key = FEE_FACT[route];
  if (!hasFeeFigure(site, route)) {
    return (
      <span data-price-state="quote" data-fee-route={route} className={className}>
        <Fact k={key} site={site} />
      </span>
    );
  }
  const [before, after = ''] = t(site, 'price.from', { fee: '{fee}' }).split('{fee}');
  return (
    <span data-price-state="from" data-fee-route={route} className={className}>
      {before}
      <Fact k={key} site={site} />
      {after}
    </span>
  );
}

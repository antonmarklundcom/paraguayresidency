import Link from 'next/link';
import { t } from '@/i18n';
import { PRICING_PATH, serviceRouteFor } from '@/lib/service-routes';
import type { SiteKey } from '@/sites/registry';
import { FromPrice } from './FromPrice';

/**
 * The fee box on a service page: "From USD X all-in" once Anton fills the
 * route's `pricing.*` fact, the honest "fixed fee confirmed in writing"
 * wording until then. The route comes from the page path; a page with no
 * route (citizenship, cost of living) renders nothing.
 */
export function ServiceOffer({ site, path }: { site: SiteKey; path: string }) {
  const route = serviceRouteFor(site, path);
  if (!route) return null;
  return (
    <aside
      data-service-offer
      aria-label={t(site, 'price.fee')}
      className="my-[var(--space-6)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-[var(--space-6)] shadow-[var(--elev-0)]"
    >
      <p className="text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]">{t(site, 'price.fee')}</p>
      <p className="mt-2 font-[family-name:var(--display-font)] text-(length:--step-2) leading-snug text-[var(--fg)] first-letter:uppercase">
        <FromPrice site={site} route={route} />
      </p>
      <p className="mt-3 max-w-[60ch] text-(length:--step--1) leading-relaxed text-[var(--fg-muted)]">{t(site, 'price.fromNote')}</p>
      <Link href={PRICING_PATH[site]} className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-[var(--accent)] underline underline-offset-4">
        {t(site, 'price.seeAll')} <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

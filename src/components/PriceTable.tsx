import Link from 'next/link';
import type { FactKey } from '@content/shared/facts';
import { t } from '@/i18n';
import { whatsappHref } from '@/lib/whatsapp';
import type { SiteKey } from '@/sites/registry';
import { Fact } from './Fact';
import { FromPrice } from './FromPrice';
import { Band, Eyebrow, SectionHeader } from './SectionKit';
import { WhatsAppIcon } from './WhatsAppIcon';

export type PriceRoute = 'temporary' | 'permanent' | 'cedula' | 'investor_pass';

interface RouteSpec {
  /** Route name, from the nav labels every locale already has. */
  label: string;
  /** The state's fee, where the register has one. */
  gov?: FactKey;
  included: string[];
}

const ROUTES: Record<PriceRoute, RouteSpec> = {
  temporary: {
    label: 'nav.temporary',
    gov: 'fees.temporary_residency',
    included: ['price.temporary.1', 'price.temporary.2', 'price.temporary.3'],
  },
  permanent: {
    label: 'nav.permanent',
    gov: 'fees.permanent_residency',
    included: ['price.permanent.1', 'price.permanent.2', 'price.permanent.3'],
  },
  cedula: {
    label: 'nav.cedula',
    gov: 'fees.cedula_first',
    included: ['price.cedula.1', 'price.cedula.2', 'price.cedula.3'],
  },
  investor_pass: {
    label: 'nav.investorPass',
    included: ['price.investor_pass.1', 'price.investor_pass.2', 'price.investor_pass.3'],
  },
};

const EXCLUDED = ['price.exclude.gov', 'price.exclude.docs', 'price.exclude.tax'];

/** The rows each brand shows unless the page passes `routes`. */
export const PRICE_ROUTES: Record<SiteKey, PriceRoute[]> = {
  residency: ['temporary', 'permanent', 'cedula', 'investor_pass'],
  investorpass: ['investor_pass'],
  guide: [],
  frontier: ['temporary', 'permanent', 'cedula', 'investor_pass'],
  residenciaes: ['temporary', 'permanent', 'cedula', 'investor_pass'],
  residenciapt: ['temporary', 'permanent', 'cedula', 'investor_pass'],
  flytta: ['temporary', 'permanent', 'cedula'],
};

/**
 * One row per route (overhaul plan §2): our fee and the government fee, both
 * through `<Fact>` (so a fee stays hedged, "quoted in writing", until Anton
 * verifies it), what is included, and a WhatsApp action per row with the
 * route pre-typed. What is never included is listed once, under the rows.
 */
export function PriceTable({ site, routes = PRICE_ROUTES[site], title, intro, tone = 'default', id = 'pricing' }: {
  site: SiteKey;
  routes?: PriceRoute[];
  title?: string;
  intro?: string;
  tone?: 'default' | 'alt';
  id?: string;
}) {
  if (routes.length === 0) return null;
  return (
    <Band tone={tone} id={id} labelledBy={`${id}-title`} data-price-table>
      <SectionHeader id={`${id}-title`} eyebrow={t(site, 'price.eyebrow')} title={title ?? t(site, 'price.title')} intro={intro ?? t(site, 'price.intro')} />
      <ol className="mt-12 border-b border-[var(--border)] md:mt-16">
        {routes.map((route, index) => {
          const spec = ROUTES[route];
          const label = t(site, spec.label);
          const href = whatsappHref(t(site, 'price.prefill', { route: label }));
          return (
            <li key={route} data-route={route} className="grid gap-x-12 gap-y-6 border-t border-[var(--border)] py-9 md:py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
              <div>
                <p aria-hidden="true" className="font-[family-name:var(--font-mono)] text-(length:--step--2) tracking-[.1em] text-[var(--fg-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-[family-name:var(--display-font)] text-(length:--step-3) leading-tight">{label}</h3>
                <p className="mt-5 text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]">{t(site, 'price.fee')}</p>
                <p className="mt-1.5 max-w-[34ch] text-(length:--step-1) leading-snug text-[var(--fg)] first-letter:uppercase">
                  <FromPrice site={site} route={route} />
                </p>
              </div>
              <div>
                <p className="text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]">{t(site, 'price.included')}</p>
                <ul className="mt-3 space-y-2.5">
                  {spec.included.map((key) => (
                    <li key={key} className="flex gap-3 leading-snug">
                      <span aria-hidden="true" className="mt-[.35em] h-2 w-3 shrink-0 -rotate-45 border-b-2 border-l-2 border-[var(--accent)]" />
                      <span>{t(site, key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-6 lg:items-start">
                {spec.gov && (
                  <div>
                    <p className="text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]">{t(site, 'price.gov')}</p>
                    <p className="mt-1.5 text-(length:--step--1) leading-snug text-[var(--fg-muted)] first-letter:uppercase">
                      <Fact k={spec.gov} site={site} />
                    </p>
                  </div>
                )}
                {href ? (
                  <a
                    href={href}
                    rel="noopener"
                    target="_blank"
                    data-whatsapp
                    data-placement={`price-${route}`}
                    className="inline-flex min-h-11 items-center gap-2.5 self-start rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-(length:--step--1) font-medium text-[var(--fg)] transition-[border-color,box-shadow] duration-[var(--dur-2)] hover:border-[var(--wa)] hover:shadow-[var(--elev-1)]"
                  >
                    <WhatsAppIcon className="size-5 text-[var(--wa)]" />
                    {t(site, 'price.cta')}
                    <span className="sr-only">: {label}</span>
                  </a>
                ) : (
                  <Link href="/contact" className="inline-flex min-h-11 items-center self-start font-medium text-[var(--accent)] underline underline-offset-4">
                    {t(site, 'contact.cta')}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
        <Eyebrow color="text-[var(--fg-muted)]">{t(site, 'price.notIncluded')}</Eyebrow>
        <ul className="flex flex-col gap-2 text-(length:--step--1) text-[var(--fg-muted)] md:flex-row md:flex-wrap md:gap-x-8">
          {EXCLUDED.map((key) => (
            <li key={key} className="flex gap-2.5">
              <span aria-hidden="true">–</span>
              {t(site, key)}
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

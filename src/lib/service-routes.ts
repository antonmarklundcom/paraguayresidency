import type { SiteKey } from '@/sites/registry';

/** The routes we quote a service fee for; each has a `pricing.*` fact. */
export type OfferRoute = 'temporary' | 'permanent' | 'cedula' | 'tax_residency' | 'family' | 'investor_pass';

/** Where each brand keeps its pricing page. */
export const PRICING_PATH: Record<SiteKey, string> = {
  residency: '/pricing',
  investorpass: '/pricing',
  guide: '/pricing',
  frontier: '/pricing',
  residenciaes: '/precios',
  residenciapt: '/precos',
  flytta: '/priser',
};

/**
 * Which route's fee a service page sells, keyed by brand and path. A page not
 * listed here (citizenship, cost of living, for-agents) shows no fee box.
 */
export const SERVICE_ROUTE_BY_PATH: Partial<Record<SiteKey, Record<string, OfferRoute>>> = {
  residency: {
    '/residency/temporary-residency': 'temporary',
    '/residency/permanent-residency': 'permanent',
    '/residency/cedula': 'cedula',
    '/residency/tax-residency': 'tax_residency',
    '/residency/family': 'family',
  },
  investorpass: {
    '/investor-pass/requirements': 'investor_pass',
    '/investor-pass/process': 'investor_pass',
    '/investor-pass/investment-routes': 'investor_pass',
    '/investor-pass/vs-standard-residency': 'investor_pass',
  },
  residenciaes: {
    '/residencia/temporal': 'temporary',
    '/residencia/permanente': 'permanent',
    '/residencia/cedula': 'cedula',
    '/residencia-fiscal': 'tax_residency',
    '/familia': 'family',
  },
  residenciapt: {
    '/residencia/temporaria': 'temporary',
    '/residencia/permanente': 'permanent',
    '/residencia/cedula': 'cedula',
    '/residencia-fiscal': 'tax_residency',
    '/familia': 'family',
  },
  flytta: {
    '/uppehallstillstand': 'temporary',
    '/skatt': 'tax_residency',
    '/familj': 'family',
  },
};

export function serviceRouteFor(site: SiteKey, path: string): OfferRoute | null {
  return SERVICE_ROUTE_BY_PATH[site]?.[path] ?? null;
}

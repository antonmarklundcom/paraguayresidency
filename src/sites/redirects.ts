import type { SiteKey } from './registry';

/**
 * Old-site URLs → their pages in this app, as permanent (301) redirects
 * (O24, item 5). The data is `docs/flytta-redirects.md` (the old
 * `flyttatillparaguay.se` Next app) and `docs/guide-redirects.md` (the old
 * WordPress `paraguayresidencyguide.com`); this is those tables made real.
 *
 * Paths are written without a trailing slash: WordPress URLs end in one, and
 * `legacyRedirect` strips it before the lookup. A row whose target equals its
 * source (after that) is not listed — the page already lives at that path.
 * Deliberately NOT carried over: flytta `/guider` → `/` from the doc — the
 * brand has had its own live `/guider` index since, and a redirect would hide it.
 *
 * `tests/host-cutover.test.ts` fails the build if a target is not a page in
 * that brand's sitemap, if a source shadows a live page, or if two rows chain.
 */

export const LEGACY_REDIRECTS: Partial<Record<SiteKey, Record<string, string>>> = {
  flytta: {
    '/residency': '/uppehallstillstand',
    '/fastigheter': '/guider/kopa-tomt-som-utlanning',
    '/livet-i-paraguay': '/',
    '/plan-b': '/var-historia',
    '/om': '/var-historia',
    '/kontakt': '/contact',
    '/integritetspolicy': '/privacy',
    '/villkor': '/terms',
    '/tack': '/contact',
    '/livet-i-paraguay/asuncion': '/stader/asuncion',
    '/livet-i-paraguay/aregua': '/stader/aregua',
    '/livet-i-paraguay/ciudad-del-este': '/stader/ciudad-del-este',
    '/livet-i-paraguay/encarnacion': '/stader/encarnacion',
    '/livet-i-paraguay/san-bernardino': '/stader/san-bernardino',
  },
  guide: {
    '/paraguay-visa-guide': '/blog/paraguay-visa-guide',
    '/paraguay-visa': '/blog/paraguay-visa-guide',
    '/step-by-step': '/blog/step-by-step',
    '/health-insurance-paraguay': '/blog/health-insurance-paraguay',
    '/requirements-residency-paraguay': '/blog/requirements-residency-paraguay',
    '/is-paraguay-safe': '/blog/is-paraguay-safe',
    '/paraguayan-citizenship': '/blog/paraguayan-citizenship',
    '/banks-paraguay': '/blog/opening-a-bank-account-in-paraguay',
    '/schools-paraguay': '/blog/schools-paraguay',
    '/retire-in-paraguay': '/blog/retire-in-paraguay',
    '/paraguay-sim-card': '/blog/paraguay-sim-card',
    '/5000-deposit': '/blog/5000-deposit',
    '/cedula-power-of-attorney': '/blog/cedula-power-of-attorney',
    '/prices': '/',
    '/faq2': '/',
    '/information-2': '/',
    '/thank-you-contact': '/thank-you',
    '/td': '/blog/requirements-residency-paraguay',
    '/ht': '/blog/requirements-residency-paraguay',
    '/paraguayresidency495': '/blog/requirements-residency-paraguay',
    '/pricing': '/',
    '/residency': '/',
    '/residency/temporary': '/blog/requirements-residency-paraguay',
    '/residency/permanent': '/blog/requirements-residency-paraguay',
    '/residency/investment': '/blog/requirements-residency-paraguay',
    '/apply': '/contact',
    '/checklist': '/blog/step-by-step',
    '/team': '/about',
    '/faq': '/',
    '/guide': '/',
    '/information': '/',
  },
};

/** The new path for an old URL on this brand, or null. Case-insensitive, trailing slash ignored. */
export function legacyRedirect(site: SiteKey, pathname: string): string | null {
  const table = LEGACY_REDIRECTS[site];
  if (!table) return null;
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, '').toLowerCase() : pathname;
  const target = table[key];
  return target && target !== key ? target : null;
}

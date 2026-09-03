import { HUB_SITE, isSiteKey, siteForHost, sites, type SiteKey } from './registry';

/** Internal route prefix the middleware rewrites into. Never a public URL. */
export const SITE_ROUTE_PREFIX = '/sites';

/** Path the middleware rewrites to when a request must 404. */
export const BLOCKED_ROUTE = '/blocked';

export type Resolution =
  | { type: 'rewrite'; site: SiteKey; path: string }
  | { type: 'redirect'; url: string; status: 301 }
  | { type: 'blocked' }
  | { type: 'pass'; site?: SiteKey };

export interface ResolveInput {
  host: string | null | undefined;
  pathname: string;
  search?: string;
  isDev?: boolean;
  /** Value of the `?site=` query param (dev only override). */
  siteOverride?: string | null;
}

/** Paths that are served by shared app routes and never rewritten per-site. */
const PASSTHROUGH_PREFIXES = ['/api/', '/_next/', '/__nextjs'];
const PASSTHROUGH_EXACT = ['/api', '/favicon.ico'];

function isPassthrough(pathname: string): boolean {
  return (
    PASSTHROUGH_EXACT.includes(pathname) ||
    PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

/**
 * Pure host+path → action resolver. The whole multi-domain product rests on
 * this function, so it is unit-tested rather than only exercised through
 * `middleware.ts`.
 */
export function resolveRequest(input: ResolveInput): Resolution {
  const { pathname } = input;
  const isDev = input.isDev ?? false;
  const search = input.search ?? '';

  // 1. The internal rewrite target is never publicly addressable: every page
  //    has exactly one public URL (plan §2).
  if (pathname === SITE_ROUTE_PREFIX || pathname.startsWith(`${SITE_ROUTE_PREFIX}/`)) {
    return { type: 'blocked' };
  }

  // 2. Shared, host-agnostic routes.
  if (isPassthrough(pathname)) return { type: 'pass', site: siteForHost(input.host)?.key };

  // 3. Dev-only kitchen sink and `?site=` override.
  if (pathname === BLOCKED_ROUTE) return { type: 'blocked' };
  if (pathname.startsWith('/dev/')) {
    return isDev ? { type: 'pass' } : { type: 'blocked' };
  }

  let site = siteForHost(input.host);

  if (isDev && isSiteKey(input.siteOverride)) {
    site = sites[input.siteOverride];
  }

  // 4. Unknown host → the hub apex (plan §2).
  if (!site) {
    if (isDev) site = sites[HUB_SITE];
    else return { type: 'redirect', url: `https://${sites[HUB_SITE].canonicalHost}/`, status: 301 };
  }

  // 5. `www.` → apex, preserving path and query.
  const bareHost = (input.host ?? '').toLowerCase().split(':')[0];
  if (bareHost !== site.canonicalHost && bareHost === `www.${site.canonicalHost}`) {
    return {
      type: 'redirect',
      url: `https://${site.canonicalHost}${pathname}${search}`,
      status: 301,
    };
  }

  // 6. /admin exists on the hub host only (plan §2).
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return site.key === HUB_SITE ? { type: 'pass', site: site.key } : { type: 'blocked' };
  }

  // 7. Everything else is a per-brand page.
  const suffix = pathname === '/' ? '' : pathname;
  return { type: 'rewrite', site: site.key, path: `${SITE_ROUTE_PREFIX}/${site.key}${suffix}` };
}

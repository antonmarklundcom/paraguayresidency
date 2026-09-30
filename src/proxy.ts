import { NextResponse, type NextRequest } from 'next/server';
import { BLOCKED_ROUTE, resolveRequest } from '@/sites/resolve';
import { clientIp, RATE_LIMIT_MESSAGE, takeLimit } from '@/lib/rate-limit';
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE_S, landingAttribution, serializeAttribution } from '@/lib/first-touch';
import { ASSIGNMENT_MAX_AGE_S, newAssignments } from '@/lib/experiments';
import type { SiteKey } from '@/sites/registry';

/**
 * Host → brand, plus the two things that must happen before any route runs
 * (plan §14.2.1 and §14.2.4):
 *
 *  1. A client-supplied `x-site` is DELETED. Downstream code reads that header
 *     as "which brand is this request for" (`src/lib/current-site.ts`), so a
 *     request arriving with its own copy could pick its brand — on the
 *     passthrough routes (`/api/*`) most of all, which is where checkout,
 *     subscribe and the magic link live. The header is ours; the wire's copy
 *     never survives this function (`docs/improvement-report.md` §1.10).
 *  2. A coarse per-IP ceiling on `POST /api/*`, under every per-route limit, so
 *     a script that finds an endpoint nobody thought to limit still meets one.
 *  3. The two first-party cookies a page view may need (O24, items 3 and 10):
 *     first-touch attribution and A/B assignment. See `pageCookies`.
 */

/** The header the app trusts to name the brand. Never accepted from a client. */
const SITE_HEADER = 'x-site';

/**
 * Request headers with any client copy of `x-site` removed, ready for the
 * middleware to set its own. Exported for the spoof test.
 */
export function sanitizedHeaders(input: Headers): Headers {
  const headers = new Headers(input);
  headers.delete(SITE_HEADER);
  return headers;
}

function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return new NextResponse(RATE_LIMIT_MESSAGE, {
    status: 429,
    headers: {
      'retry-after': String(retryAfterSeconds),
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export interface CookieWrite {
  name: string;
  value: string;
  maxAge: number;
  /** The A/B assignment is read by the page's client component; attribution only by the server. */
  httpOnly: boolean;
}

/**
 * Cookies a page view should set, if any. Pure over the request's parts so
 * it is unit-tested without a Next request.
 *
 *  - `vc_attr` (first touch, O24 item 3): only when the visitor has none yet
 *    AND this request carries a signal — campaign parameters or an outside
 *    referrer. A direct visit gets nothing; its lead is attributed to the
 *    form's page and the submit's referrer, as before.
 *  - `ab_<experiment>` (O24 item 10): server-side assignment for every
 *    experiment this brand runs that the visitor has no valid variant for.
 */
export function pageCookies(input: {
  site: SiteKey;
  method: string;
  path: string;
  search: string;
  host: string | null;
  referrer: string | null;
  readCookie: (name: string) => string | undefined;
  now?: Date;
  random?: () => number;
}): CookieWrite[] {
  if (input.method !== 'GET') return [];
  const writes: CookieWrite[] = [];
  if (!input.readCookie(ATTRIBUTION_COOKIE)) {
    const first = landingAttribution({
      search: input.search,
      referrer: input.referrer,
      host: input.host,
      path: input.path,
      now: input.now,
    });
    if (first) {
      writes.push({ name: ATTRIBUTION_COOKIE, value: serializeAttribution(first), maxAge: ATTRIBUTION_MAX_AGE_S, httpOnly: true });
    }
  }
  for (const assignment of newAssignments(input.site, input.readCookie, input.random)) {
    writes.push({ name: assignment.cookie, value: assignment.variant, maxAge: ASSIGNMENT_MAX_AGE_S, httpOnly: false });
  }
  return writes;
}

/**
 * Pages are ISR-cached (`s-maxage=600`). A response that sets a per-visitor
 * cookie must never be stored by a shared cache and replayed to someone else,
 * so it goes out `private, no-store`; the visitor's next page view carries the
 * cookie, sets nothing, and is cacheable as usual.
 */
function applyCookies(res: NextResponse, writes: CookieWrite[], secure: boolean): NextResponse {
  if (!writes.length) return res;
  for (const write of writes) {
    res.cookies.set(write.name, write.value, {
      path: '/',
      maxAge: write.maxAge,
      httpOnly: write.httpOnly,
      sameSite: 'lax',
      secure,
    });
  }
  res.headers.set('cache-control', 'private, no-store');
  return res;
}

export function proxy(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const headers = sanitizedHeaders(req.headers);

  // The coarse net. Only POSTs, only `/api/*`: a GET flood is a CDN/host
  // concern, and limiting page views here would punish a shared office NAT.
  if (req.method === 'POST' && req.nextUrl.pathname.startsWith('/api/')) {
    const limit = takeLimit('apiPost', clientIp(req.headers));
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);
  }

  const result = resolveRequest({
    host,
    pathname: req.nextUrl.pathname,
    search: req.nextUrl.search,
    isDev,
    siteOverride: req.nextUrl.searchParams.get('site'),
  });

  switch (result.type) {
    case 'redirect':
      return NextResponse.redirect(result.url, result.status);

    case 'blocked': {
      const url = req.nextUrl.clone();
      url.pathname = BLOCKED_ROUTE;
      url.search = '';
      return NextResponse.rewrite(url, { request: { headers } });
    }

    case 'pass': {
      if (result.site) headers.set(SITE_HEADER, result.site);
      const res = NextResponse.next({ request: { headers } });
      if (result.site) res.headers.set(SITE_HEADER, result.site);
      return res;
    }

    case 'rewrite': {
      const url = req.nextUrl.clone();
      url.pathname = result.path;
      headers.set(SITE_HEADER, result.site);
      const res = NextResponse.rewrite(url, { request: { headers } });
      res.headers.set(SITE_HEADER, result.site);
      const writes = pageCookies({
        site: result.site,
        method: req.method,
        path: req.nextUrl.pathname,
        search: req.nextUrl.search,
        host,
        referrer: req.headers.get('referer'),
        readCookie: (name) => req.cookies.get(name)?.value,
      });
      return applyCookies(res, writes, !isDev);
    }
  }
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets in /public.
    // NOTE: sitemap.xml and robots.txt MUST stay matched — they are per-host.
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|pdf)$).*)',
  ],
};

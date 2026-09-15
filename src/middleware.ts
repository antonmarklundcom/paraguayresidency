import { NextResponse, type NextRequest } from 'next/server';
import { BLOCKED_ROUTE, resolveRequest } from '@/sites/resolve';
import { clientIp, RATE_LIMIT_MESSAGE, takeLimit } from '@/lib/rate-limit';

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

export function middleware(req: NextRequest) {
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
      return res;
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

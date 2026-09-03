import { NextResponse, type NextRequest } from 'next/server';
import { BLOCKED_ROUTE, resolveRequest } from '@/sites/resolve';

export function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');

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
      return NextResponse.rewrite(url);
    }

    case 'pass': {
      const headers = new Headers(req.headers);
      if (result.site) headers.set('x-site', result.site);
      const res = NextResponse.next({ request: { headers } });
      if (result.site) res.headers.set('x-site', result.site);
      return res;
    }

    case 'rewrite': {
      const url = req.nextUrl.clone();
      url.pathname = result.path;
      const headers = new Headers(req.headers);
      headers.set('x-site', result.site);
      const res = NextResponse.rewrite(url, { request: { headers } });
      res.headers.set('x-site', result.site);
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

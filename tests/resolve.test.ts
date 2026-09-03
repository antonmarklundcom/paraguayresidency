import { describe, expect, it } from 'vitest';
import { resolveRequest, SITE_ROUTE_PREFIX } from '@/sites/resolve';
import { siteForHost, siteOrigin, sites, SITE_KEYS, HUB_SITE } from '@/sites/registry';

const prod = { isDev: false as const };

describe('siteForHost', () => {
  it('maps every registered host to its site', () => {
    for (const key of SITE_KEYS) {
      for (const host of sites[key].hosts) {
        expect(siteForHost(host)?.key).toBe(key);
      }
    }
  });

  it('ignores port and case', () => {
    expect(siteForHost('Investorpass.LOCALHOST:3000')?.key).toBe('investorpass');
  });

  it('returns undefined for an unknown host', () => {
    expect(siteForHost('example.com')).toBeUndefined();
    expect(siteForHost(null)).toBeUndefined();
  });

  it('never registers the same host on two sites', () => {
    const all = SITE_KEYS.flatMap((k) => sites[k].hosts);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('resolveRequest — apex hosts', () => {
  it('rewrites the apex home into the site folder', () => {
    expect(resolveRequest({ host: 'paraguayresidency.com', pathname: '/', ...prod })).toEqual({
      type: 'rewrite',
      site: 'residency',
      path: `${SITE_ROUTE_PREFIX}/residency`,
    });
  });

  it('rewrites a sub-path per brand', () => {
    expect(
      resolveRequest({ host: 'paraguayinvestorpass.com.py', pathname: '/investor-pass/requirements', ...prod }),
    ).toEqual({
      type: 'rewrite',
      site: 'investorpass',
      path: `${SITE_ROUTE_PREFIX}/investorpass/investor-pass/requirements`,
    });
  });

  it('routes the guide host to the guide site', () => {
    const r = resolveRequest({ host: 'paraguayinvestorguide.com', pathname: '/blog/x', ...prod });
    expect(r).toMatchObject({ type: 'rewrite', site: 'guide' });
  });
});

describe('resolveRequest — redirects', () => {
  it('301s www to the apex, preserving path and query', () => {
    expect(
      resolveRequest({ host: 'www.paraguayresidency.com', pathname: '/pricing', search: '?a=1', ...prod }),
    ).toEqual({ type: 'redirect', url: 'https://paraguayresidency.com/pricing?a=1', status: 301 });
  });

  it('301s www on the .com.py brand to its own apex, not the hub', () => {
    expect(
      resolveRequest({ host: 'www.paraguayinvestorpass.com.py', pathname: '/', ...prod }),
    ).toMatchObject({ type: 'redirect', url: 'https://paraguayinvestorpass.com.py/' });
  });

  it('301s an unknown host to the hub apex in production', () => {
    expect(resolveRequest({ host: 'random.example.com', pathname: '/anything', ...prod })).toEqual({
      type: 'redirect',
      url: `https://${sites[HUB_SITE].canonicalHost}/`,
      status: 301,
    });
  });

  it('301s a missing host header in production', () => {
    expect(resolveRequest({ host: null, pathname: '/', ...prod })).toMatchObject({ type: 'redirect' });
  });
});

describe('resolveRequest — the internal prefix is never public', () => {
  it.each([`${SITE_ROUTE_PREFIX}/residency`, `${SITE_ROUTE_PREFIX}/guide/blog/x`, SITE_ROUTE_PREFIX])(
    '404s a direct request to %s',
    (pathname) => {
      expect(resolveRequest({ host: 'paraguayresidency.com', pathname, ...prod })).toEqual({
        type: 'blocked',
      });
    },
  );

  it('404s the direct prefix even in dev', () => {
    expect(
      resolveRequest({ host: 'residency.localhost', pathname: `${SITE_ROUTE_PREFIX}/residency`, isDev: true }),
    ).toEqual({ type: 'blocked' });
  });
});

describe('resolveRequest — shared routes', () => {
  it('passes /api through without rewriting, tagged with the site', () => {
    expect(resolveRequest({ host: 'paraguayinvestorguide.com', pathname: '/api/health', ...prod })).toEqual({
      type: 'pass',
      site: 'guide',
    });
  });

  it('serves /admin on the hub host only', () => {
    expect(resolveRequest({ host: 'paraguayresidency.com', pathname: '/admin/leads', ...prod })).toEqual({
      type: 'pass',
      site: HUB_SITE,
    });
    expect(resolveRequest({ host: 'paraguayinvestorpass.com.py', pathname: '/admin', ...prod })).toEqual({
      type: 'blocked',
    });
    expect(resolveRequest({ host: 'paraguayinvestorguide.com', pathname: '/admin/leads', ...prod })).toEqual({
      type: 'blocked',
    });
  });

  it('404s /dev/* in production and allows it in development', () => {
    expect(resolveRequest({ host: 'paraguayresidency.com', pathname: '/dev/kitchen-sink', ...prod })).toEqual({
      type: 'blocked',
    });
    expect(
      resolveRequest({ host: 'residency.localhost', pathname: '/dev/kitchen-sink', isDev: true }),
    ).toEqual({ type: 'pass' });
  });
});

describe('resolveRequest — dev conveniences', () => {
  it('honours ?site= in development only', () => {
    expect(
      resolveRequest({ host: 'localhost', pathname: '/', isDev: true, siteOverride: 'guide' }),
    ).toMatchObject({ type: 'rewrite', site: 'guide' });

    expect(
      resolveRequest({ host: 'paraguayresidency.com', pathname: '/', siteOverride: 'guide', ...prod }),
    ).toMatchObject({ type: 'rewrite', site: 'residency' });
  });

  it('ignores a bogus ?site= value', () => {
    expect(
      resolveRequest({ host: 'residency.localhost', pathname: '/', isDev: true, siteOverride: 'nope' }),
    ).toMatchObject({ type: 'rewrite', site: 'residency' });
  });

  it('falls back to the hub for an unknown host in development instead of redirecting', () => {
    expect(resolveRequest({ host: 'weird.test', pathname: '/', isDev: true })).toMatchObject({
      type: 'rewrite',
      site: HUB_SITE,
    });
  });

  it('resolves *.localhost to the matching brand', () => {
    for (const [host, key] of [
      ['residency.localhost:3000', 'residency'],
      ['investorpass.localhost:3000', 'investorpass'],
      ['guide.localhost:3000', 'guide'],
    ] as const) {
      expect(resolveRequest({ host, pathname: '/', isDev: true })).toMatchObject({ type: 'rewrite', site: key });
    }
  });
});

describe('siteOrigin', () => {
  it('is https on the canonical host of every brand', () => {
    for (const key of SITE_KEYS) {
      expect(siteOrigin(key)).toBe(`https://${sites[key].canonicalHost}`);
    }
  });
});

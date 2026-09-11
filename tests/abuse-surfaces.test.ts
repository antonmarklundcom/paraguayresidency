import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetAllForTests } from '@/lib/rate-limit';
import { middleware, sanitizedHeaders } from '@/middleware';
import nextConfig, { BASELINE, HSTS, PRIVATE_CSP, PUBLIC_CSP } from '../next.config';

/**
 * O18 §14.2.1 and §14.2.4 — the limits and the headers as the wire sees them.
 *
 * These drive the real middleware and the real route handlers in-process, the
 * way `tests/checkout-routing.test.ts` does; `tests/abuse.mjs` does the same
 * thing over HTTP against `next start`, which is where the 429 status line is
 * actually observed.
 */

/* --------------------------------------------------- the newsletter routes */

const subscribeCalls: unknown[] = [];
vi.mock('@/lib/subscribers', () => ({
  subscribe: async (input: unknown) => {
    subscribeCalls.push(input);
    return { ok: true, state: 'pending' };
  },
}));

vi.mock('@/lib/current-site', () => ({ currentSite: async () => 'guide' }));

const { POST: subscribePost } = await import('@/app/api/subscribe/route');

const post = (body: unknown, ip = '203.0.113.10') =>
  subscribePost(
    new Request('https://paraguayresidencyguide.com/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }) as never,
  );

beforeEach(() => {
  __resetAllForTests();
  subscribeCalls.length = 0;
});

afterEach(() => vi.unstubAllEnvs());

describe('POST /api/subscribe', () => {
  it('answers 429 once one address has spent its hour', async () => {
    const body = { email: 'bomb@example.com', site: 'guide' };
    expect((await post(body)).status).toBe(200);
    expect((await post(body)).status).toBe(200);
    expect((await post(body)).status).toBe(200);

    const refused = await post(body);
    expect(refused.status).toBe(429);
    expect(refused.headers.get('retry-after')).toBe('3600');
    expect(await refused.json()).toMatchObject({ ok: false, error: 'rate-limited' });
  });

  it('does not re-mail a pending address — the 2nd call never reaches subscribe()', async () => {
    const body = { email: 'bomb@example.com', site: 'guide' };
    await post(body);
    expect(subscribeCalls).toHaveLength(1);

    const second = await post(body);
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: true, state: 'pending' });
    // The inbox-bombing fix: still a success for the caller, still no mail.
    expect(subscribeCalls).toHaveLength(1);
  });

  it('refuses the 21st address from one IP', async () => {
    for (let i = 0; i < 20; i += 1) {
      expect((await post({ email: `r${i}@example.com`, site: 'guide' })).status).toBe(200);
    }
    expect((await post({ email: 'r20@example.com', site: 'guide' })).status).toBe(429);
  });

  it('keeps separate IPs in separate buckets', async () => {
    for (let i = 0; i < 20; i += 1) await post({ email: `r${i}@example.com`, site: 'guide' });
    expect((await post({ email: 'other@example.com', site: 'guide' }, '198.51.100.9')).status).toBe(200);
  });
});

/* ------------------------------------------------------ the magic-link route */

describe('POST /api/auth/magic', () => {
  it('stays 200 when limited — a 429 would be the account oracle it avoids', async () => {
    const { POST } = await import('@/app/api/auth/magic/route');
    const call = () =>
      POST(
        new Request('https://paraguayresidencyguide.com/api/auth/magic', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.44' },
          body: JSON.stringify({ email: 'member@example.com', site: 'guide' }),
        }) as never,
      );

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 8; i += 1) {
      const response = await call();
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true, sent: true });
    }
    // It is silent, not absent: the limiter logged the refusals.
    expect(console.warn).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

/* ----------------------------------------------------------- the middleware */

const request = (
  url: string,
  init: { method?: string; headers?: Record<string, string> } = {},
) =>
  ({
    method: init.method ?? 'GET',
    headers: new Headers({ host: new URL(url).host, ...(init.headers ?? {}) }),
    nextUrl: Object.assign(new URL(url), { clone: () => new URL(url) }),
  }) as never;

describe('middleware — the coarse net and the x-site strip', () => {
  it('refuses the 121st POST to /api in a minute, from one IP', () => {
    const hit = () =>
      middleware(
        request('https://paraguayresidency.co.uk/api/anything', {
          method: 'POST',
          headers: { 'x-forwarded-for': '198.51.100.200' },
        }),
      );
    for (let i = 0; i < 120; i += 1) expect(hit()?.status).not.toBe(429);

    const refused = hit();
    expect(refused?.status).toBe(429);
    expect(refused?.headers.get('retry-after')).toBeTruthy();
  });

  it('leaves GETs and non-/api POSTs alone', () => {
    for (let i = 0; i < 200; i += 1) {
      const res = middleware(
        request('https://paraguayresidency.co.uk/api/health', {
          headers: { 'x-forwarded-for': '198.51.100.201' },
        }),
      );
      expect(res?.status).not.toBe(429);
    }
    for (let i = 0; i < 200; i += 1) {
      const res = middleware(
        request('https://paraguayresidency.co.uk/contact', {
          method: 'POST',
          headers: { 'x-forwarded-for': '198.51.100.202' },
        }),
      );
      expect(res?.status).not.toBe(429);
    }
  });

  it('deletes a client-supplied x-site before setting its own', () => {
    const headers = sanitizedHeaders(
      new Headers({ 'x-site': 'guide', 'user-agent': 'curl/8', host: 'example.test' }),
    );
    expect(headers.get('x-site')).toBeNull();
    // Nothing else is touched.
    expect(headers.get('user-agent')).toBe('curl/8');
  });

  it('answers the hub brand on an unknown host even when x-site says otherwise', () => {
    // The hole this closes: on a passthrough route the middleware only SET the
    // header when the host resolved to a brand, so an unknown host let the
    // client's own `x-site` reach `currentSite()` untouched.
    const res = middleware(
      request('https://evil.example/api/health', { headers: { 'x-site': 'guide' } }),
    );
    expect(res?.headers.get('x-site')).not.toBe('guide');
  });
});

/* --------------------------------------------------------------- the headers */

async function headersFor(path: string): Promise<Record<string, string>> {
  const rules = await nextConfig.headers!();
  const out: Record<string, string> = {};
  for (const rule of rules) {
    if (!matches(rule.source, path)) continue;
    for (const header of rule.headers) out[header.key.toLowerCase()] = header.value;
  }
  return out;
}

/**
 * The three `source` shapes this config uses, translated. The real matcher is
 * Next's own path-to-regexp; `tests/abuse.mjs` checks the same paths over HTTP
 * against `next start`, so this stays a readability check and not the proof.
 */
function matches(source: string, path: string): boolean {
  if (source === '/:path*') return true;
  if (source.startsWith('/((?!')) return !/^\/(admin|members)(\/|$)/.test(path);
  if (source === '/:path(admin|members)/:rest*') return /^\/(admin|members)\//.test(path);
  if (source === '/:path(admin|members)') return /^\/(admin|members)$/.test(path);
  if (source === '/api/:path*') return path.startsWith('/api/');
  throw new Error(`unhandled source ${source}`);
}

describe('security headers (§14.2.4)', () => {
  it('sets the baseline on every path', async () => {
    for (const path of ['/', '/pricing', '/admin', '/members/lesson-1']) {
      const headers = await headersFor(path);
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
      expect(headers['x-frame-options']).toBe('DENY');
    }
  });

  it('sends HSTS in production and NEVER in development', () => {
    // A browser that sees this on `*.localhost` refuses plain HTTP for two
    // years, which is a very effective way to break a dev machine.
    expect(BASELINE.some((h) => h.key === HSTS.key)).toBe(false);
    expect(HSTS.value).toContain('max-age=63072000');
  });

  it('puts a REPORT-ONLY policy on the public tree, and Plausible is allowed', async () => {
    const headers = await headersFor('/pricing');
    expect(headers['content-security-policy-report-only']).toBe(PUBLIC_CSP);
    expect(headers['content-security-policy']).toBeUndefined();
    expect(PUBLIC_CSP).toContain('https://plausible.io');
  });

  it('puts an ENFORCING frame-ancestors:none policy on /admin and /members', async () => {
    for (const path of ['/admin', '/admin/leads', '/members', '/members/lesson-1']) {
      const headers = await headersFor(path);
      expect(headers['content-security-policy']).toBe(PRIVATE_CSP);
      // Exactly one CSP on the private tree: a report there is a real block.
      expect(headers['content-security-policy-report-only']).toBeUndefined();
    }
    expect(PRIVATE_CSP).toContain("frame-ancestors 'none'");
    expect(PRIVATE_CSP).not.toContain('plausible');
  });
});

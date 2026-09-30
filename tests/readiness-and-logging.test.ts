import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PROOF } from '@content/shared/proof';
import { facts } from '@content/shared/facts';
import { checkHost, envChecks, factCounts, proofGaps } from '@/lib/readiness';
import { formatLine, log, recentErrorCount, scrubText } from '@/lib/log';
import { proxy } from '@/proxy';
import { onRequestError } from '@/instrumentation';

/** O24 item 4 (readiness screen) and item 8 (structured logging, error reporting). */

describe('readiness: credentials', () => {
  const SITES = ['residency', 'guide'];

  it('reports every credential missing on an empty env, and never echoes a value', () => {
    const checks = envChecks({}, SITES);
    const byKey = Object.fromEntries(checks.map((c) => [c.key, c.status]));
    expect(byKey).toMatchObject({
      DATABASE_URL: 'missing',
      SESSION_SECRET: 'missing',
      EMAIL: 'missing',
      VENDERCRM: 'missing',
      NEXT_PUBLIC_WHATSAPP_NUMBER: 'missing',
      LEAD_QUEUE_SECRET: 'missing',
      NEXT_PUBLIC_PLAUSIBLE_ENABLED: 'warn',
      LOG_SINK_URL: 'info',
    });

    const secret = 'super-secret-value-that-must-not-leak-1234567890';
    const full = envChecks(
      {
        DATABASE_URL: `mysql://u:${secret}@h/db`,
        SESSION_SECRET: secret,
        RESEND_API_KEY: secret,
        EMAIL_FROM: 'a@b.c',
        EMAIL_NOTIFY_TO: 'a@b.c',
        VENDERCRM_API_URL: 'https://crm',
        VENDERCRM_API_KEY: secret,
        NEXT_PUBLIC_WHATSAPP_NUMBER: '+595 981 000000',
        NEXT_PUBLIC_PLAUSIBLE_ENABLED: 'true',
        LEAD_QUEUE_SECRET: secret,
        LOG_SINK_URL: 'https://logs',
      },
      SITES,
    );
    expect(full.every((c) => c.status === 'ok')).toBe(true);
    expect(JSON.stringify(full)).not.toContain(secret);
  });

  it('names the brands that have no CRM key', () => {
    const [crm] = envChecks({ VENDERCRM_API_URL: 'https://crm', VENDERCRM_API_KEY_RESIDENCY: 'k' }, SITES).filter((c) => c.key === 'VENDERCRM');
    expect(crm.status).toBe('missing');
    expect(crm.note).toContain('guide');
    expect(crm.note).not.toContain('residency');
  });
});

describe('readiness: content', () => {
  it('lists the empty proof fields (all of them, today)', () => {
    const gaps = proofGaps(PROOF).map((g) => g.key);
    expect(gaps).toEqual(expect.arrayContaining(['stats.googleRating', 'reviews', 'guarantee', 'office.address', 'team.photo']));
  });

  it('counts facts by state, adding up to the total', () => {
    const counts = factCounts(Object.values(facts));
    expect(counts.verified + counts.sourced + counts.hedged).toBe(counts.total);
    expect(counts.total).toBeGreaterThan(50);
  });
});

describe('readiness: domains', () => {
  const answer = (body: unknown, status = 200) => vi.fn(async () => Response.json(body, { status })) as unknown as typeof fetch;

  it('is ok when the host answers as its own brand', async () => {
    expect((await checkHost('guide', 'g.com', answer({ site: 'guide', degraded: false }))).status).toBe('ok');
  });

  it('flags a host answering as another brand, a degraded one, an HTTP error and a dead one', async () => {
    expect((await checkHost('guide', 'g.com', answer({ site: 'residency' }))).status).toBe('wrong-site');
    expect((await checkHost('guide', 'g.com', answer({ site: 'guide', degraded: true }))).status).toBe('degraded');
    expect((await checkHost('guide', 'g.com', answer({}, 502))).status).toBe('unreachable');
    const dead = vi.fn(async () => {
      throw new Error('getaddrinfo ENOTFOUND g.com');
    }) as unknown as typeof fetch;
    expect(await checkHost('guide', 'g.com', dead)).toMatchObject({ status: 'unreachable', note: expect.stringContaining('ENOTFOUND') });
  });
});

describe('structured logging', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.LOG_SINK_URL;
  });

  it('writes one JSON line with context and a serialised error', () => {
    const line = JSON.parse(formatLine('error', 'crm down', { reqId: 'r1', route: '/x', leadId: 7, err: new Error('ECONNREFUSED') }, new Date(0)));
    expect(line).toMatchObject({ time: '1970-01-01T00:00:00.000Z', level: 'error', msg: 'crm down', reqId: 'r1', route: '/x', leadId: 7, err: { name: 'Error', message: 'ECONNREFUSED' } });
  });

  it('never carries lead PII: PII keys are redacted and emails/phones in text are masked', () => {
    const line = formatLine('error', 'failed for ana@example.com', {
      email: 'ana@example.com',
      phone: '+595 981 123 456',
      nested: { name: 'Ana Ruiz', note: 'call +595 981 123 456' },
      err: new Error('rejected ana@example.com +595981123456'),
    });
    expect(line).not.toMatch(/ana@example\.com|981 ?123|Ana Ruiz/);
    expect(line).toContain('[redacted]');
    expect(scrubText('lead 42 at 2026-09-30')).toBe('lead 42 at 2026-09-30');
    // Our own ids are never masked (a UUID has long digit runs).
    const id = '654932d6-4874-4200-9472-5d78d6743142';
    expect(JSON.parse(formatLine('info', 'x', { reqId: id, path: '/guider/1234567890' }))).toMatchObject({ reqId: id, path: '/guider/1234567890' });
  });

  it('counts errors for the readiness screen', () => {
    const before = recentErrorCount();
    log.error('boom');
    log.warn('not an error');
    expect(recentErrorCount()).toBe(before + 1);
  });

  it('ships to LOG_SINK_URL when set, and a dead sink never throws', async () => {
    process.env.LOG_SINK_URL = 'https://logs.example.invalid/ingest';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('sink down'));
    for (let i = 0; i < 20; i += 1) log.info(`line ${i}`);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://logs.example.invalid/ingest');
    expect(JSON.parse(String(init.body))).toHaveLength(20);
    await new Promise((r) => setTimeout(r, 0));
  });
});

describe('request ids and error reporting', () => {
  it('stamps a fresh request id on the request and the response, replacing a client copy', () => {
    const res = proxy(
      new NextRequest('https://paraguayresidency.co.uk/contact', {
        headers: { host: 'paraguayresidency.co.uk', 'x-request-id': 'client-chosen' },
      }),
    );
    const id = res.headers.get('x-request-id');
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.headers.get('x-middleware-request-x-request-id')).toBe(id);
  });

  it('reports an unhandled error once, with request id and route, and without the query string', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await onRequestError(
      new Error('kaboom'),
      { path: '/contact?email=ana@example.com', method: 'POST', headers: { 'x-request-id': 'abc', host: 'paraguayresidency.co.uk' } },
      { routerKind: 'App Router', routePath: '/sites/residency/contact', routeType: 'action', revalidateReason: undefined },
    );
    const line = JSON.parse(String(spy.mock.calls.at(-1)![0]));
    expect(line).toMatchObject({ level: 'error', reqId: 'abc', route: '/sites/residency/contact', routeType: 'action', path: '/contact', err: { message: 'kaboom' } });
    expect(JSON.stringify(line)).not.toContain('ana@example.com');
    spy.mockRestore();
  });
});

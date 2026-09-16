import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nextConfig, { CSP_REPORT_PATH, PUBLIC_CSP, PRIVATE_CSP, REPORTING_ENDPOINTS } from '../next.config';
import { extractReports, summariseCspReport, GET, POST } from '@/app/(en)/api/csp-report/route';

/**
 * O20 — the report-only CSP now has a destination (KNOWN-ISSUES, raised by
 * O18). Two things have to hold: the policy points somewhere, and the somewhere
 * answers 204 for every shape a browser might post rather than 500ing on one.
 */

const post = (body: string | null, contentType = 'application/csp-report') =>
  POST(
    new Request('https://paraguayresidencyguide.com/api/csp-report', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body,
    }) as never,
  );

let logged: unknown[][] = [];

beforeEach(() => {
  logged = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    logged.push(args);
  });
});

afterEach(() => vi.restoreAllMocks());

describe('the policy points at the collector', () => {
  it('carries both report-uri and report-to, relative so all seven hosts work', () => {
    expect(PUBLIC_CSP).toContain(`report-uri ${CSP_REPORT_PATH}`);
    expect(PUBLIC_CSP).toContain('report-to csp-endpoint');
    expect(CSP_REPORT_PATH.startsWith('/')).toBe(true);
    expect(CSP_REPORT_PATH).not.toContain('://');
  });

  it('names the reporting group in a companion header, or report-to is inert', () => {
    expect(REPORTING_ENDPOINTS.key).toBe('Reporting-Endpoints');
    expect(REPORTING_ENDPOINTS.value).toBe(`csp-endpoint="${CSP_REPORT_PATH}"`);
  });

  it('serves that header on the public tree, next to the report-only policy', async () => {
    const rules = await nextConfig.headers!();
    const publicRule = rules.find((rule) =>
      rule.headers.some((header) => header.key === 'Content-Security-Policy-Report-Only'),
    );
    expect(publicRule).toBeDefined();
    const keys = publicRule!.headers.map((header) => header.key);
    expect(keys).toContain('Reporting-Endpoints');
  });

  it('is still REPORT-ONLY: the flip to enforcing is a separate, evidence-gated decision', async () => {
    const rules = await nextConfig.headers!();
    const publicRule = rules.find((rule) =>
      rule.headers.some((header) => header.key === 'Content-Security-Policy-Report-Only'),
    );
    expect(publicRule!.headers.map((h) => h.key)).not.toContain('Content-Security-Policy');
  });

  it('leaves the enforcing private policy alone — a block there is already visible', () => {
    expect(PRIVATE_CSP).not.toContain('report-uri');
    expect(PRIVATE_CSP).not.toContain('report-to');
  });
});

describe('POST /api/csp-report', () => {
  it('accepts the classic report-uri shape and logs the violation', async () => {
    const response = await post(
      JSON.stringify({
        'csp-report': {
          'document-uri': 'https://paraguayresidencyguide.com/',
          'violated-directive': "script-src 'self'",
          'blocked-uri': 'https://evil.example/x.js',
          disposition: 'report',
        },
      }),
    );
    expect(response.status).toBe(204);
    expect(logged).toHaveLength(1);
    const line = String(logged[0][1]);
    expect(line).toContain('https://evil.example/x.js');
    expect(line).toContain("script-src 'self'");
  });

  it('accepts the Reporting API batch shape and logs one line per violation', async () => {
    const response = await post(
      JSON.stringify([
        {
          type: 'csp-violation',
          url: 'https://flyttatillparaguay.se/',
          body: { documentURL: 'https://flyttatillparaguay.se/', effectiveDirective: 'font-src', blockedURL: 'https://fonts.example/a.woff2' },
        },
        {
          type: 'csp-violation',
          url: 'https://flyttatillparaguay.se/',
          body: { documentURL: 'https://flyttatillparaguay.se/', effectiveDirective: 'img-src', blockedURL: 'https://cdn.example/b.png' },
        },
      ]),
      'application/reports+json',
    );
    expect(response.status).toBe(204);
    expect(logged).toHaveLength(2);
    expect(String(logged[0][1])).toContain('font-src');
    expect(String(logged[1][1])).toContain('img-src');
  });

  it('ignores a non-CSP report type sharing the endpoint group', () => {
    expect(extractReports([{ type: 'deprecation', body: { id: 'x' } }])).toEqual([]);
  });

  it('never 500s on a shape it did not expect', async () => {
    for (const body of ['', '   ', 'not json at all', '[]', 'null', '{"unexpected":true}', '[1,2,3]']) {
      expect((await post(body)).status).toBe(204);
    }
  });

  it('truncates a runaway field rather than logging a megabyte', async () => {
    await post(JSON.stringify({ 'csp-report': { 'script-sample': 'x'.repeat(50_000) } }));
    expect(String(logged[0][1]).length).toBeLessThan(1_000);
  });

  it('reads both spellings of every field the two formats disagree about', () => {
    expect(summariseCspReport({ 'blocked-uri': 'a', 'document-uri': 'b' })).toMatchObject({
      blockedUri: 'a',
      documentUri: 'b',
    });
    expect(summariseCspReport({ blockedURL: 'a', documentURL: 'b' })).toMatchObject({
      blockedUri: 'a',
      documentUri: 'b',
    });
  });

  it('omits fields the browser did not send instead of logging undefined', () => {
    expect(summariseCspReport({ 'blocked-uri': 'inline' })).toEqual({ blockedUri: 'inline' });
  });
});

describe('GET /api/csp-report', () => {
  it('answers 405 with an Allow header, so the endpoint is visibly alive', async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });
});

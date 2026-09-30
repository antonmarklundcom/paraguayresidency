import { describe, expect, it } from 'vitest';
import { externalReferrer, landingAttribution, parseAttribution, serializeAttribution } from '@/lib/first-touch';
import { pageCookies } from '@/proxy';
import {
  attributionCsvRow,
  buildAttributionReport,
  experimentReadout,
  leadSource,
  MIN_LEADS_PER_VARIANT,
  type ClickRow,
  type LeadRow,
} from '@/lib/attribution-report';

/**
 * O24 item 3 (first-touch cookie, attribution report) and item 10 (server-side
 * A/B assignment, readout). Pure functions; no request, no database.
 */

const NOW = new Date('2026-09-30T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

describe('the first-touch cookie', () => {
  it('records campaign parameters, the outside referrer and the landing page', () => {
    const first = landingAttribution({
      search: '?utm_source=newsletter&utm_campaign=sept&foo=bar',
      referrer: 'https://www.google.com/search?q=paraguay+residency',
      host: 'paraguayresidency.co.uk',
      path: '/residency/cedula',
      now: NOW,
    });
    expect(first).toEqual({
      utm_source: 'newsletter',
      utm_campaign: 'sept',
      referrer: 'https://www.google.com/search',
      landing_page: '/residency/cedula',
      first_seen: NOW.toISOString(),
    });
    // Round-trips through the cookie reader the lead action uses.
    expect(parseAttribution(serializeAttribution(first!))).toEqual(first);
  });

  it('records nothing for a direct visit or an internal click', () => {
    expect(landingAttribution({ search: '', referrer: null, host: 'x.com', path: '/' })).toBeNull();
    expect(landingAttribution({ search: '', referrer: 'https://www.x.com/a', host: 'x.com', path: '/b' })).toBeNull();
  });

  it('drops the referrer query string and anything that is not http(s)', () => {
    expect(externalReferrer('https://t.co/abc?token=secret', 'x.com')).toBe('https://t.co/abc');
    expect(externalReferrer('android-app://com.google.android.gm/', 'x.com')).toBeNull();
    expect(externalReferrer('garbage', 'x.com')).toBeNull();
  });
});

describe('proxy page cookies', () => {
  const base = {
    method: 'GET',
    path: '/',
    search: '?utm_source=reddit',
    host: 'paraguayresidency.co.uk',
    referrer: null,
    now: NOW,
    random: () => 0.9,
  };

  it('sets first touch (http-only) and the hero test assignment (readable) on a new hub visitor', () => {
    const writes = pageCookies({ ...base, site: 'residency', readCookie: () => undefined });
    expect(writes.map((w) => [w.name, w.httpOnly])).toEqual([
      ['vc_attr', true],
      ['ab_hero_cta', false],
    ]);
    expect(writes[1].value).toBe('two_minutes');
  });

  it('never overwrites first touch or a valid assignment', () => {
    const jar: Record<string, string> = { vc_attr: '%7B%7D', ab_hero_cta: 'find_route' };
    expect(pageCookies({ ...base, site: 'residency', readCookie: (n) => jar[n] })).toEqual([]);
  });

  it('assigns nothing on brands that run no experiment, and nothing on a POST', () => {
    expect(pageCookies({ ...base, site: 'guide', search: '', readCookie: () => undefined })).toEqual([]);
    expect(pageCookies({ ...base, method: 'POST', site: 'residency', readCookie: () => undefined })).toEqual([]);
  });
});

const lead = (over: Partial<LeadRow>): LeadRow => ({
  id: 1,
  site: 'residency',
  kind: 'contact',
  pagePath: '/contact',
  attribution: null,
  utm: null,
  createdAt: daysAgo(1),
  ...over,
});

describe('the attribution report', () => {
  it('labels the source by first touch, then last touch, then referrer host, else direct', () => {
    expect(leadSource(lead({ attribution: { utm_source: 'newsletter' }, utm: { utm_source: 'x' } }))).toBe('newsletter');
    expect(leadSource(lead({ attribution: { gclid: 'abc' } }))).toBe('google-ads');
    expect(leadSource(lead({ utm: { utm_source: 'x' } }))).toBe('x');
    expect(leadSource(lead({ attribution: { referrer: 'https://www.reddit.com/r/x' } }))).toBe('reddit.com');
    expect(leadSource(lead({ attribution: '{"utm_source":"json-string"}' }))).toBe('json-string');
    expect(leadSource(lead({}))).toBe('(direct)');
  });

  it('counts last 7 and last 30 days, ignores older rows, and reports pre-migration WhatsApp as whatsapp', () => {
    const report = buildAttributionReport(
      [
        lead({ id: 1, createdAt: daysAgo(1) }),
        lead({ id: 2, createdAt: daysAgo(10), site: 'flytta' }),
        lead({ id: 3, createdAt: daysAgo(40) }),
        lead({ id: 4, createdAt: daysAgo(2), attribution: { lead_kind: 'whatsapp' } }),
        lead({ id: 5, createdAt: daysAgo(2), kind: 'whatsapp' }),
      ],
      [{ site: 'residency', path: '/', source: null, variant: null, createdAt: daysAgo(3) }],
      NOW,
    );
    expect(report.totals).toEqual({ last7: 3, last30: 4 });
    expect(report.bySite).toEqual([
      { key: 'residency', last7: 3, last30: 3 },
      { key: 'flytta', last7: 0, last30: 1 },
    ]);
    expect(report.byKind.find((b) => b.key === 'whatsapp')).toEqual({ key: 'whatsapp', last7: 2, last30: 2 });
    expect(report.clicks.byPage).toEqual([{ key: 'residency /', last7: 1, last30: 1 }]);
  });

  it('exports attribution without contact details', () => {
    const row = attributionCsvRow(
      lead({ attribution: { utm_source: 'n', landing_page: '/', experiments: { hero_cta: 'two_minutes' } } }),
    );
    expect(row).toMatchObject({ source: 'n', landing_page: '/', experiments: 'hero_cta:two_minutes' });
    expect(Object.keys(row)).not.toContain('email');
    expect(Object.keys(row)).not.toContain('phone');
  });
});

describe('the A/B readout', () => {
  const exposed = (variant: string, n: number) =>
    Array.from({ length: n }, (_, i) => lead({ id: i, attribution: { experiments: { hero_cta: variant } } }));
  const clicks: ClickRow[] = [
    { site: 'residency', path: '/', source: null, variant: 'hero_cta:two_minutes', createdAt: daysAgo(1) },
  ];

  it('says "not enough data" below the floor and names no leader', () => {
    const [readout] = experimentReadout([...exposed('find_route', 5), ...exposed('two_minutes', 9)], clicks, NOW);
    expect(readout).toMatchObject({ id: 'hero_cta', enoughData: false, ahead: null });
    expect(readout.variants).toEqual([
      { variant: 'find_route', leads: 5, clicks: 0 },
      { variant: 'two_minutes', leads: 9, clicks: 1 },
    ]);
  });

  it('names the variant with most leads once every variant has the minimum', () => {
    const [readout] = experimentReadout(
      [...exposed('find_route', MIN_LEADS_PER_VARIANT), ...exposed('two_minutes', MIN_LEADS_PER_VARIANT + 4)],
      [],
      NOW,
    );
    expect(readout).toMatchObject({ enoughData: true, ahead: 'two_minutes' });
  });

  it('ignores leads that were never exposed', () => {
    const [readout] = experimentReadout([lead({})], [], NOW);
    expect(readout.variants.every((v) => v.leads === 0)).toBe(true);
  });
});

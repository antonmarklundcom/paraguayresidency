import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { articleSlugFromPath, parseTrackBody, sourceLabel } from '@/lib/site-events';
import { exposureLabel, EXPERIMENTS, newAssignments, readExposures } from '@/lib/experiments';
import { neutraliseFormula, toCsv } from '@/lib/admin-queries';

/**
 * O24 items 1–2, the surfaces around `createLead`: the WhatsApp click beacon's
 * input handling, the experiment cookies it and the lead action read, the
 * delivery-queue endpoint's lock, and the CSV export's formula guard.
 */

const queue = vi.hoisted(() => vi.fn());
vi.mock('@/lib/leads', () => ({ runLeadDeliveryQueue: queue }));
vi.mock('@/lib/lead-delivery', () => ({
  deliveryHealth: async () => ({ queue: 'none', lastSuccessAt: null, failed24h: 0, dead: 0, oldestUndeliveredAt: null, backlog: false }),
}));

describe('the WhatsApp click beacon body', () => {
  it('accepts a path and a placement, and derives the slug itself', () => {
    expect(parseTrackBody({ type: 'whatsapp_click', path: '/guides/taxes/paraguay-tax?utm_source=x', placement: 'hero' })).toEqual({
      type: 'whatsapp_click',
      path: '/guides/taxes/paraguay-tax',
      placement: 'hero',
      slug: 'paraguay-tax',
    });
  });

  it('refuses anything else: other types, URLs, protocol-relative paths, junk placements', () => {
    expect(parseTrackBody({ type: 'lead', path: '/' })).toBeNull();
    expect(parseTrackBody({ type: 'whatsapp_click', path: 'https://evil.example/' })).toBeNull();
    expect(parseTrackBody({ type: 'whatsapp_click', path: '//evil.example/' })).toBeNull();
    expect(parseTrackBody({ type: 'whatsapp_click', path: '/x'.repeat(300) })).toBeNull();
    expect(parseTrackBody([])).toBeNull();
    expect(parseTrackBody({ type: 'whatsapp_click', path: '/', placement: '<script>' })?.placement).toBeNull();
  });

  it('only calls a page two segments deep an article', () => {
    expect(articleSlugFromPath('/')).toBeNull();
    expect(articleSlugFromPath('/contact')).toBeNull();
    expect(articleSlugFromPath('/guider/cedula-processen')).toBe('cedula-processen');
  });

  it('labels the source by utm_source, else the referrer host, else direct', () => {
    expect(sourceLabel({ utm_source: 'newsletter', referrer: 'https://www.google.com/' })).toBe('newsletter');
    expect(sourceLabel({ referrer: 'https://www.google.com/search?q=x' })).toBe('google.com');
    expect(sourceLabel({ referrer: 'not a url' })).toBeNull();
    expect(sourceLabel({})).toBeNull();
  });
});

describe('experiment cookies', () => {
  const jar = (values: Record<string, string>) => (name: string) => values[name];

  it('assigns every experiment a brand runs, once, and never on other brands', () => {
    expect(newAssignments('residency', jar({}), () => 0.9)).toEqual([
      { id: 'hero_cta', cookie: 'ab_hero_cta', variant: 'two_minutes' },
    ]);
    expect(newAssignments('residency', jar({ ab_hero_cta: 'find_route' }))).toEqual([]);
    expect(newAssignments('guide', jar({}))).toEqual([]);
  });

  it('re-assigns a cookie that holds a value the experiment does not have', () => {
    expect(newAssignments('residency', jar({ ab_hero_cta: 'evil' }), () => 0)[0].variant).toBe('find_route');
  });

  it('reads only valid exposures', () => {
    expect(readExposures(jar({ abx_hero_cta: 'two_minutes', abx_other: 'x' }))).toEqual({ hero_cta: 'two_minutes' });
    expect(readExposures(jar({ abx_hero_cta: 'forged' }))).toEqual({});
    expect(exposureLabel({ hero_cta: 'two_minutes' })).toBe('hero_cta:two_minutes');
    expect(exposureLabel({})).toBeNull();
  });

  it('keeps every experiment id and variant cookie-safe', () => {
    for (const experiment of EXPERIMENTS) {
      expect(experiment.id).toMatch(/^[a-z0-9_]+$/);
      for (const variant of experiment.variants) expect(variant).toMatch(/^[a-z0-9_-]+$/);
    }
  });
});

describe('CSV export', () => {
  it('neutralises spreadsheet formulas typed into a lead but leaves phone numbers alone', () => {
    expect(neutraliseFormula('=HYPERLINK("http://x","y")')).toBe(`'=HYPERLINK("http://x","y")`);
    expect(neutraliseFormula('@SUM(A1)')).toBe("'@SUM(A1)");
    expect(neutraliseFormula('+cmd|x')).toBe("'+cmd|x");
    expect(neutraliseFormula('+595 981 123 456')).toBe('+595 981 123 456');
    expect(neutraliseFormula('-')).toBe('-');
    expect(toCsv([{ name: '=1+1' }], ['name'])).toBe("name\r\n'=1+1");
  });
});

describe('POST /api/leads/deliveries', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    queue.mockReset();
  });

  const call = async (auth?: string, query = '') => {
    const { POST } = await import('@/app/(en)/api/leads/deliveries/route');
    return POST(
      new NextRequest(`https://paraguayresidency.co.uk/api/leads/deliveries${query}`, {
        method: 'POST',
        headers: { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200)}`, ...(auth ? { authorization: auth } : {}) },
      }),
    );
  };

  it('is closed when no secret is configured', async () => {
    delete process.env.LEAD_QUEUE_SECRET;
    expect((await call('Bearer anything')).status).toBe(503);
    expect(queue).not.toHaveBeenCalled();
  });

  it('refuses a wrong or missing bearer', async () => {
    process.env.LEAD_QUEUE_SECRET = 's'.repeat(32);
    expect((await call()).status).toBe(401);
    expect((await call(`Bearer ${'t'.repeat(32)}`)).status).toBe(401);
    expect(queue).not.toHaveBeenCalled();
  });

  it('runs the queue with the right bearer, passing includeSkipped through', async () => {
    process.env.LEAD_QUEUE_SECRET = 's'.repeat(32);
    queue.mockResolvedValue({ mode: 'table', attempted: 1, items: ['1:crm'] });
    const response = await call(`Bearer ${'s'.repeat(32)}`, '?includeSkipped=1');
    expect(response.status).toBe(200);
    expect(queue).toHaveBeenCalledWith(expect.objectContaining({ includeSkipped: true, trigger: 'endpoint' }));
    expect(await response.json()).toMatchObject({ mode: 'table', attempted: 1, health: { queue: 'none' } });
  });
});

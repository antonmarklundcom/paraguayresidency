import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

// next/script renders nothing on the server, so stand in a marker that shows
// which domain the shell handed to <Analytics>. The env gate itself is
// covered by tests/analytics.test.ts.
vi.mock('@/lib/analytics', () => ({
  Analytics: ({ domain }: { domain: string }) => createElement('i', { 'data-analytics': domain }),
  track: () => {},
}));

const { SiteShell } = await import('@/lib/site-shell');
const { getSite, SITE_KEYS } = await import('@/sites/registry');

describe('SiteShell mounts Plausible for every brand', () => {
  it.each(SITE_KEYS)('%s reports under its own domain', (site) => {
    const html = renderToStaticMarkup(createElement(SiteShell, { site, children: 'body' }));
    const expected = getSite(site).analytics?.plausibleDomain ?? getSite(site).canonicalHost;
    expect(html).toContain(`data-analytics="${expected}"`);
  });
});

import { describe, expect, it } from 'vitest';
import { resolveRequest } from '@/sites/resolve';
import { HUB_SITE, SITE_KEYS, sites, siteOrigin } from '@/sites/registry';
import { LEGACY_REDIRECTS, legacyRedirect } from '@/sites/redirects';
import { buildSitemap, robotsText, DISALLOWED, AI_CRAWLERS } from '@/lib/seo-files';
import { llmsText } from '@/lib/llms';
import { HTML_LANG } from '@/i18n/locales';
import { HOSTS, LEGACY_SAMPLES } from '../scripts/smoke-hosts.mjs';

/**
 * O24 item 5 (host cutover: legacy 301s, www → apex, unknown host → hub, the
 * smoke script) and item 6 (per-host sitemap, robots, AI rules and llms.txt).
 * "Every sitemap URL answers 200 in a built app" is not a unit test: CI's
 * `built-app` job runs `scripts/smoke-hosts.mjs --all-sitemap-urls` against
 * `next start` (see `.github/workflows/verify.yml`).
 */

const sitemapPaths = (site: (typeof SITE_KEYS)[number]) =>
  new Set(buildSitemap(site).map((entry) => new URL(entry.url).pathname.replace(/\/$/, '') || '/'));

/** Routes that exist but are deliberately not in a sitemap (per-visitor or noindex). */
const UNLISTED = new Set(['/thank-you']);

describe('legacy redirect tables (item 5)', () => {
  for (const [site, table] of Object.entries(LEGACY_REDIRECTS) as [(typeof SITE_KEYS)[number], Record<string, string>][]) {
    const live = sitemapPaths(site);

    it(`${site}: every target is a live page of that brand`, () => {
      const dead = Object.values(table).filter((target) => !live.has(target) && !UNLISTED.has(target));
      expect(dead).toEqual([]);
    });

    it(`${site}: no source shadows a live page, none redirects to itself, none chains`, () => {
      const sources = Object.keys(table);
      expect(sources.filter((source) => live.has(source))).toEqual([]);
      expect(sources.filter((source) => table[source] === source)).toEqual([]);
      expect(Object.values(table).filter((target) => sources.includes(target))).toEqual([]);
      for (const source of sources) expect(source).toBe(source.toLowerCase().replace(/\/+$/, '') || '/');
    });
  }

  it('matches old WordPress URLs with a trailing slash and any case, and keeps the query', () => {
    expect(legacyRedirect('guide', '/Paraguay-Visa/')).toBe('/blog/paraguay-visa-guide');
    expect(resolveRequest({ host: 'paraguayresidencyguide.com', pathname: '/banks-paraguay/', search: '?utm_source=x' })).toEqual({
      type: 'redirect',
      url: 'https://paraguayresidencyguide.com/blog/opening-a-bank-account-in-paraguay?utm_source=x',
      status: 301,
    });
    expect(resolveRequest({ host: 'flyttatillparaguay.se', pathname: '/kontakt' })).toMatchObject({
      url: 'https://flyttatillparaguay.se/contact',
      status: 301,
    });
  });

  it('sends an old URL on www. to its new page in one hop', () => {
    expect(resolveRequest({ host: 'www.flyttatillparaguay.se', pathname: '/livet-i-paraguay/asuncion' })).toEqual({
      type: 'redirect',
      url: 'https://flyttatillparaguay.se/stader/asuncion',
      status: 301,
    });
  });

  it('only applies a table on its own brand', () => {
    expect(legacyRedirect('residency', '/kontakt')).toBeNull();
    expect(resolveRequest({ host: 'paraguayresidency.co.uk', pathname: '/pricing' })).toMatchObject({ type: 'rewrite' });
  });
});

describe('host cutover (item 5)', () => {
  it('every brand has a www. host that 301s to its apex, path and query kept', () => {
    for (const key of SITE_KEYS) {
      const apex = sites[key].canonicalHost;
      expect(sites[key].hosts).toContain(`www.${apex}`);
      expect(resolveRequest({ host: `www.${apex}`, pathname: '/contact', search: '?a=1' })).toEqual({
        type: 'redirect',
        url: `https://${apex}/contact?a=1`,
        status: 301,
      });
    }
  });

  it('an unknown host 301s to the hub apex in production', () => {
    expect(resolveRequest({ host: 'paraguayresidency.com', pathname: '/x', isDev: false })).toEqual({
      type: 'redirect',
      url: `https://${sites[HUB_SITE].canonicalHost}/`,
      status: 301,
    });
  });

  it('the smoke script knows exactly the registry hosts, languages and hub', () => {
    expect(HOSTS.map((h: { key: string }) => h.key)).toEqual([...SITE_KEYS]);
    for (const entry of HOSTS as { key: (typeof SITE_KEYS)[number]; host: string; lang: string; hub?: boolean }[]) {
      expect(entry.host).toBe(sites[entry.key].canonicalHost);
      expect(entry.lang).toBe(HTML_LANG[sites[entry.key].locale]);
      expect(Boolean(entry.hub)).toBe(entry.key === HUB_SITE);
    }
    for (const [site, samples] of Object.entries(LEGACY_SAMPLES) as [(typeof SITE_KEYS)[number], [string, string][]][]) {
      for (const [from, to] of samples) expect(legacyRedirect(site, from)).toBe(to);
    }
  });
});

describe('per-host sitemap, robots and llms.txt (item 6)', () => {
  const origins = SITE_KEYS.map((key) => siteOrigin(key));

  for (const site of SITE_KEYS) {
    const origin = siteOrigin(site);
    const others = origins.filter((o) => o !== origin);

    it(`${site}: the sitemap lists only its own origin, never admin/api/member URLs`, () => {
      const urls = buildSitemap(site).map((entry) => entry.url);
      expect(urls.length).toBeGreaterThan(5);
      expect(urls.filter((url) => !(url === origin || url.startsWith(`${origin}/`)))).toEqual([]);
      expect(urls.filter((url) => DISALLOWED.some((path) => new URL(url).pathname.startsWith(path.replace(/\/$/, ''))))).toEqual([]);
      expect(new Set(urls).size).toBe(urls.length);
    });

    it(`${site}: robots.txt points at its own sitemap and disallows admin for every crawler`, () => {
      const text = robotsText(site);
      expect(text).toContain(`Sitemap: ${origin}/sitemap.xml`);
      expect(text).toContain(`# LLM-readable site map: ${origin}/llms.txt`);
      for (const other of others) expect(text).not.toContain(other);
      const groups = text.split('\n\n').filter((g) => g.startsWith('User-agent:'));
      expect(groups).toHaveLength(1 + AI_CRAWLERS.length);
      for (const group of groups) expect(group).toContain('Disallow: /admin');
    });

    it(`${site}: llms.txt links its own articles only`, () => {
      const text = llmsText(site);
      const links = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
      const articleLinks = links.filter((url) => !url.endsWith('/llms-full.txt'));
      expect(articleLinks.length).toBeGreaterThan(0);
      // Key pages and articles live on the brand's own origin; a sibling brand
      // may only appear in the header's "part of" line, never as a listed page.
      const foreignArticles = articleLinks.filter((url) => !url.startsWith(`${origin}/`) && url !== origin);
      expect(foreignArticles).toEqual([]);
    });
  }

  it('only the hub serves /admin, on every host and its www. alias', () => {
    for (const key of SITE_KEYS) {
      const result = resolveRequest({ host: sites[key].canonicalHost, pathname: '/admin/readiness', isDev: false });
      if (key === HUB_SITE) expect(result).toEqual({ type: 'pass', site: HUB_SITE });
      else expect(result).toEqual({ type: 'blocked' });
    }
  });
});

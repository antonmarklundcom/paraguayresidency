import { afterEach, expect, it, vi } from 'vitest';
import * as content from '@/content';
import { buildRss } from '@/lib/rss';
import { contentHref } from '@/lib/site-pages';
import { SITE_KEYS, siteOrigin } from '@/sites/registry';

afterEach(() => vi.restoreAllMocks());

it.each(SITE_KEYS)('builds a nonempty RSS 2.0 feed for %s with every public article', (site) => {
  const feed = buildRss(site);
  const pages = content.getPages(site).filter((page) => !page.frontmatter.draft);
  expect(feed).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  expect(feed).toContain('<channel>');
  expect(feed).toMatch(/<\/channel>\n<\/rss>\n$/);
  expect(pages.length).toBeGreaterThan(0);
  expect(feed.match(/<item>/g)).toHaveLength(pages.length);
  for (const page of pages) {
    const link = siteOrigin(site) + contentHref(site, page.slugPath);
    expect(feed).toContain(`<link>${link}</link>`);
    expect(feed).toContain(`<guid isPermaLink="true">${link}</guid>`);
    expect(feed).toContain(`<pubDate>${new Date(page.frontmatter.publishedAt).toUTCString()}</pubDate>`);
  }
  expect(feed).toContain(`href="${siteOrigin(site)}/feed.xml" rel="self" type="application/rss+xml"`);
});

it('escapes XML delimiters while retaining Unicode and removing illegal control characters', () => {
  const page = content.getPages('guide')[0];
  vi.spyOn(content, 'getPages').mockReturnValue([{ ...page, frontmatter: {
    ...page.frontmatter, title: 'A & <B> "C" \'D\' — Städer\u0000', description: 'Costs & banking <tips>\u0001',
  } }]);
  const feed = buildRss('guide');
  expect(feed).toContain('<title>A &amp; &lt;B&gt; &quot;C&quot; &apos;D&apos; — Städer</title>');
  expect(feed).toContain('<description>Costs &amp; banking &lt;tips&gt;</description>');
  expect(feed).not.toMatch(/[\u0000\u0001]/);
});

it('excludes drafts even when the development content reader includes them', () => {
  const page = content.getPages('guide')[0];
  vi.spyOn(content, 'getPages').mockReturnValue([{ ...page, frontmatter: { ...page.frontmatter, draft: true } }]);
  expect(buildRss('guide')).not.toContain('<item>');
});

it('never exposes Guide member lessons or updates', () => {
  const feed = buildRss('guide');
  expect(feed).not.toMatch(/\/(members|updates)\//);
  expect(feed.match(/<link>https:\/\/[^<]+\/blog\//g)?.length).toBeGreaterThan(0);
});

it('uses publication date rather than modification date', () => {
  const page = content.getPages('guide')[0];
  vi.spyOn(content, 'getPages').mockReturnValue([{ ...page, frontmatter: {
    ...page.frontmatter, publishedAt: '2026-01-01', updatedAt: '2026-02-01',
  } }]);
  expect(buildRss('guide')).toContain('<pubDate>Thu, 01 Jan 2026 00:00:00 GMT</pubDate>');
  expect(buildRss('guide')).not.toContain('01 Feb 2026');
});

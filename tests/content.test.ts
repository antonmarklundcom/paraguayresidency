import { describe, expect, it } from 'vitest';
import { getHubs, getPage, getPages } from '@/content';
import { frontmatterSchema } from '@/content/schema';
import { SITE_KEYS, sites } from '@/sites/registry';
import { contentHref } from '@/lib/site-pages';

describe('content pipeline', () => {
  it('parses at least one page per site with valid frontmatter', () => {
    for (const site of SITE_KEYS) {
      const pages = getPages(site);
      expect(pages.length, `no MDX under content/${site}`).toBeGreaterThan(0);
      for (const page of pages) {
        expect(frontmatterSchema.safeParse(page.frontmatter).success).toBe(true);
        expect(page.frontmatter.site).toBe(site);
        expect(page.hub).toBe(page.frontmatter.hub);
      }
    }
  });

  it('resolves a page by its slug path and returns undefined otherwise', () => {
    const [first] = getPages('residency');
    expect(getPage('residency', first.slugPath)?.slugPath).toBe(first.slugPath);
    expect(getPage('residency', 'nope/nope')).toBeUndefined();
  });

  it('rejects traversal in a slug path', () => {
    expect(getPage('residency', '../../package.json')).toBeUndefined();
    expect(getPage('residency', '..%2Fsecret')).toBeUndefined();
  });

  it('groups pages into hubs', () => {
    const hubs = getHubs('residency');
    expect(hubs).toContain('documents');
  });

  it('builds a public href on the right brand shape', () => {
    expect(contentHref('residency', 'documents/x')).toBe('/guides/documents/x');
    expect(contentHref('investorpass', 'insights/x')).toBe('/insights/x');
    expect(contentHref('guide', 'blog/x')).toBe('/blog/x');
  });

  it('keeps titles and descriptions inside SEO limits', () => {
    for (const site of SITE_KEYS) {
      for (const page of getPages(site)) {
        expect(page.frontmatter.title.length).toBeLessThanOrEqual(70);
        expect(page.frontmatter.description.length).toBeLessThanOrEqual(160);
      }
    }
  });

  it('gives every site a distinct canonical host and theme', () => {
    const hosts = SITE_KEYS.map((k) => sites[k].canonicalHost);
    expect(new Set(hosts).size).toBe(SITE_KEYS.length);
    expect(new Set(SITE_KEYS.map((k) => sites[k].theme)).size).toBe(SITE_KEYS.length);
  });
});

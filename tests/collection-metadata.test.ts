import { expect, it } from 'vitest';
import { collectionPageJsonLd, siteMetadata } from '@/lib/metadata';
import { SITE_KEYS, getSite, siteOrigin } from '@/sites/registry';
import { getHubs } from '@/content';
import { buildSitemap } from '@/lib/seo-files';

const input = {
  name: 'Guides', description: 'Explore our articles.', path: '/guides',
  items: [{ name: 'Documents', path: '/guides/documents' }, { name: 'Taxes', path: '/guides/taxes' }],
};

it('builds CollectionPage JSON-LD with an ordered, counted ItemList', () => {
  expect(collectionPageJsonLd('residency', input)).toEqual({
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: input.name, description: input.description, url: siteOrigin('residency') + '/guides', inLanguage: 'en',
    mainEntity: { '@type': 'ItemList', numberOfItems: 2, itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, url: siteOrigin('residency') + item.path,
    })) },
  });
});

it('uses each brand origin and locale for the collection and its items', () => {
  for (const site of SITE_KEYS) {
    const data = collectionPageJsonLd(site, input);
    expect(data.url).toBe(siteOrigin(site) + input.path);
    expect(data.inLanguage).toBe(getSite(site).locale);
    expect(data.mainEntity.itemListElement.every((item) => item.url.startsWith(siteOrigin(site) + '/'))).toBe(true);
  }
});

it('represents an empty collection without invented items', () => {
  expect(collectionPageJsonLd('guide', { ...input, items: [] }).mainEntity).toEqual({
    '@type': 'ItemList', numberOfItems: 0, itemListElement: [],
  });
});

it('adds RSS discovery for every brand while preserving canonicals', () => {
  for (const site of SITE_KEYS) {
    expect(siteMetadata(site, { title: input.name, ...input }).alternates).toEqual({
      canonical: input.path, types: { 'application/rss+xml': siteOrigin(site) + '/feed.xml' },
    });
  }
});

it('includes all current multi-hub index paths in the sitemap', () => {
  for (const site of ['residency', 'residenciaes', 'residenciapt'] as const) {
    const prefix = site === 'residency' ? '/guides' : '/guias';
    const urls = buildSitemap(site).map((entry) => entry.url);
    expect(urls).toContain(siteOrigin(site) + prefix);
    for (const hub of getHubs(site)) expect(urls).toContain(siteOrigin(site) + prefix + '/' + hub);
  }
});

it('includes the single-hub indexes and existing Guide blog in the sitemap', () => {
  for (const [site, paths] of [
    ['investorpass', ['/insights']], ['frontier', ['/stories']],
    ['flytta', ['/guider', '/stader']], ['guide', ['/blog']],
  ] as const) {
    const urls = buildSitemap(site).map((entry) => entry.url);
    for (const path of paths) expect(urls).toContain(siteOrigin(site) + path);
  }
});

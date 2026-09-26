import { expect, it } from 'vitest';
import { siteMetadata, organizationJsonLd, serviceJsonLd, serviceOfferJsonLd, productOfferJsonLd } from '@/lib/metadata';
import { SITE_KEYS, sites, siteOrigin } from '@/sites/registry';
import { OG_LOCALE } from '@/i18n/locales';

const input = { title: 'Residency guide', description: 'Plan your move.', path: '/guides/start' };

it('anchors canonicals to each brand origin', () => {
  for (const site of SITE_KEYS) {
    const meta = siteMetadata(site, input);
    expect(new URL(meta.metadataBase!).href).toBe(`${siteOrigin(site)}/`);
    expect(meta.alternates?.canonical).toBe('/guides/start');
  }
});
it('normalizes missing and repeated leading slashes and preserves root', () => {
  for (const path of ['guides/start', '///guides/start']) {
    expect(siteMetadata('guide', { ...input, path }).alternates?.canonical).toBe('/guides/start');
  }
  expect(siteMetadata('guide', { ...input, path: '/' }).alternates?.canonical).toBe('/');
});
it('provides localized website Open Graph data and image dimensions', () => {
  for (const site of SITE_KEYS) {
    expect(siteMetadata(site, input).openGraph).toEqual({
      type: 'website', url: input.path, title: input.title, description: input.description,
      siteName: sites[site].name, locale: OG_LOCALE[sites[site].locale],
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: sites[site].name }],
    });
  }
});
it('carries article publication and modification times', () => {
  expect(siteMetadata('guide', { ...input, type: 'article', publishedTime: '2026-09-01', modifiedTime: '2026-09-02' }).openGraph)
    .toMatchObject({ type: 'article', publishedTime: '2026-09-01', modifiedTime: '2026-09-02' });
});
it('only opts out of indexing when requested', () => {
  expect(siteMetadata('guide', input).robots).toBeUndefined();
  expect(siteMetadata('guide', { ...input, noindex: true }).robots).toEqual({ index: false, follow: true });
});
it('builds an organization + website graph with sibling brand URLs and the named team', () => {
  for (const site of SITE_KEYS) {
    const graph = organizationJsonLd(site)['@graph'];
    const [org, website] = graph as [Record<string, unknown>, Record<string, unknown>];
    expect(org.name).toBe(sites[site].name);
    expect(org.url).toBe(siteOrigin(site));
    expect(org.sameAs).toEqual(sites[site].siblings.map(siteOrigin));
    expect((org.employee as { name: string }[]).map((p) => p.name)).toEqual([
      'Anton Marklund', 'Yanina Alvarez', 'Diana Davalos',
    ]);
    expect(org.description).toBeTruthy();
    // No street address until one is confirmed: city and country only.
    if (org.address) expect(Object.keys(org.address as object).sort()).toEqual(['@type', 'addressCountry', 'addressLocality']);
    expect(website).toMatchObject({ '@type': 'WebSite', url: siteOrigin(site), inLanguage: sites[site].locale });
  }
});
it('builds service JSON-LD with its provider and area', () => {
  expect(serviceJsonLd('residency', { ...input, name: 'Residency' })).toEqual({
    '@context': 'https://schema.org', '@type': 'Service', name: 'Residency', description: input.description,
    url: `${siteOrigin('residency')}${input.path}`, areaServed: 'Paraguay',
    provider: { '@type': 'Organization', name: sites.residency.name, url: siteOrigin('residency') },
  });
});
it('offers services without asserting an unverified numeric price', () => {
  expect(serviceOfferJsonLd('investorpass', { ...input, name: 'Investor Pass' }).offers).toEqual({
    '@type': 'Offer', availability: 'https://schema.org/InStock',
    url: `${siteOrigin('investorpass')}${input.path}`, areaServed: 'Paraguay',
  });
});
it('formats product cents as a two-decimal offer with currency and SKU', () => {
  const product = productOfferJsonLd('guide', { ...input, name: 'Guide', priceCents: 705, currency: 'USD', sku: 'guide-entry' });
  expect(product).toMatchObject({ '@context': 'https://schema.org', '@type': 'Product', sku: 'guide-entry',
    offers: { '@type': 'Offer', price: '7.05', priceCurrency: 'USD', url: `${siteOrigin('guide')}${input.path}` } });
});

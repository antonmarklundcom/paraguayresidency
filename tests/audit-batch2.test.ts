import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { Disclaimer } from '@/components/Disclaimer';
import { Card } from '@/components/Card';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import GlobalNotFound, { generateMetadata } from '@/app/global-not-found';
import { buildSitemap } from '@/lib/seo-files';
import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { SITE_KEYS, siteOrigin } from '@/sites/registry';
import { t } from '@/i18n';

const request = vi.hoisted(() => ({ site: null as string | null }));
vi.mock('next/headers', () => ({ headers: async () => new Headers(request.site === null ? {} : { 'x-site': request.site }) }));

it('allows MDX paragraphs inside the disclaimer note', () => {
  const html = renderToStaticMarkup(createElement(Disclaimer, null, createElement('p', null, 'Disclaimer')));
  expect(html).toMatch(/^<div role="note"[^>]*><p>Disclaimer<\/p><\/div>$/);
});

it('changes card and timeline heading tags without changing their classes', () => {
  for (const Component of [
    (level: 2 | 3) => createElement(Card, { title: 'Title', headingLevel: level }),
    (level: 2 | 3) => createElement(ProcessTimeline, { site: 'residency', route: 'standard', headingLevel: level }),
  ]) {
    const defaultHtml = renderToStaticMarkup(Component(3));
    const html = renderToStaticMarkup(Component(2));
    expect(html).toBe(defaultHtml.replaceAll('<h3', '<h2').replaceAll('</h3>', '</h2>'));
  }
});

for (const site of SITE_KEYS) {
  it(`${site} sitemap omits static modification dates and preserves content dates`, () => {
    const entries = buildSitemap(site);
    const pages = getPages(site);
    const contentDates = new Map(pages.map(page => [
      `${siteOrigin(site)}${contentHref(site, page.slugPath)}`,
      new Date(page.frontmatter.updatedAt ?? page.frontmatter.publishedAt),
    ]));
    for (const entry of entries) {
      if (contentDates.has(entry.url)) expect(entry.lastModified).toEqual(contentDates.get(entry.url));
      else expect(entry).not.toHaveProperty('lastModified');
    }
  });
}

for (const [header, site, lang] of [
  ['residency', 'residency', 'en'], ['investorpass', 'investorpass', 'en'],
  ['guide', 'guide', 'en'], ['frontier', 'frontier', 'en'],
  ['residenciaes', 'residenciaes', 'es'], ['residenciapt', 'residenciapt', 'pt-BR'],
  ['flytta', 'flytta', 'sv'], [null, 'residency', 'en'], ['', 'residency', 'en'],
  ['invalid', 'residency', 'en'], ['toString', 'residency', 'en'],
] as const) {
  it(`renders branded global 404 for x-site=${header}`, async () => {
    request.site = header;
    const html = renderToStaticMarkup(await GlobalNotFound());
    expect(html).toContain(`<html lang="${lang}">`);
    expect(html).toContain(`data-site="${site}"`);
    expect(html).toContain('<nav');
    expect(html).toContain('<footer');
    expect(await generateMetadata()).toEqual({ title: t(site, 'notFound.title') });
  });
}

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SITE_KEYS, getSite, siteOrigin } from '@/sites/registry';
import { t } from '@/i18n';
import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import Residency from '@/app/(en)/sites/residency/page';
import Investor from '@/app/(en)/sites/investorpass/page';
import Frontier from '@/app/(en)/sites/frontier/page';
import * as residency from '@/app/(en)/sites/residency/guides/page';
import * as residencyHub from '@/app/(en)/sites/residency/guides/[hub]/page';
import * as es from '@/app/(es)/sites/residenciaes/guias/page';
import * as esHub from '@/app/(es)/sites/residenciaes/guias/[hub]/page';
import * as pt from '@/app/(pt)/sites/residenciapt/guias/page';
import * as ptHub from '@/app/(pt)/sites/residenciapt/guias/[hub]/page';
import * as insights from '@/app/(en)/sites/investorpass/insights/page';
import * as stories from '@/app/(en)/sites/frontier/stories/page';
import * as guider from '@/app/(sv)/sites/flytta/guider/page';
import * as stader from '@/app/(sv)/sites/flytta/stader/page';
import type { Metadata } from 'next';

it('renders the hub and guide sibling lists with each destination language', () => {
  expect(getSite('residency').siblings).toEqual(['investorpass', 'guide', 'frontier', 'residenciaes', 'residenciapt', 'flytta']);
  expect(getSite('guide').siblings).toEqual(['residency', 'investorpass', 'frontier']);
  for (const site of ['residency', 'guide'] as const) {
    const html = renderToStaticMarkup(createElement(Footer, { site }));
    for (const sibling of getSite(site).siblings) {
      expect(html).toContain(`href="${siteOrigin(sibling)}" lang="${getSite(sibling).locale}"`);
      expect(html).toContain(getSite(sibling).name);
    }
  }
});

it('renders every navigation item in a native, initially closed disclosure', () => {
  for (const site of SITE_KEYS) {
    const html = renderToStaticMarkup(createElement(Nav, { site }));
    const disclosure = html.match(/<details[^>]*>([\s\S]*?)<\/details>/)![1];
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(disclosure).toContain(t(site, 'nav.menu'));
    for (const item of getSite(site).nav) expect(disclosure).toContain(`href="${item.href}"`);
  }
});

it('links the formerly orphaned hubs from each brand shell', () => {
  for (const [site, paths] of [
    ['residency', ['/guides']], ['investorpass', ['/insights']],
    ['frontier', ['/stories']], ['flytta', ['/guider', '/stader']],
  ] as const) {
    const html = renderToStaticMarkup(createElement(Nav, { site })) + renderToStaticMarkup(createElement(Footer, { site }));
    for (const path of paths) expect(html).toContain(`href="${path}"`);
    expect(getSite(site).nav.length).toBeLessThanOrEqual(6);
  }
});

it('shows the newest published articles above the closing CTA', () => {
  for (const [site, Page, cta] of [
    ['residency', Residency, 'Ready to find your route?'],
    ['investorpass', Investor, 'See if you qualify'],
    ['frontier', Frontier, 'Ready to find your route?'],
  ] as const) {
    const html = renderToStaticMarkup(createElement(Page));
    const block = html.slice(html.indexOf('Latest articles'), html.indexOf(cta, html.indexOf('Latest articles')));
    const expected = getPages(site).filter(p => !p.frontmatter.draft)
      .sort((a, b) => Date.parse(b.frontmatter.publishedAt) - Date.parse(a.frontmatter.publishedAt)).slice(0, 3);
    let previous = -1;
    for (const post of expected) {
      const index = block.indexOf(`href="${contentHref(site, post.slugPath)}"`);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(block.match(/<li>/g)).toHaveLength(3);
  }
});

function checkMetadata(metadata: Metadata) {
  expect(typeof metadata.title).toBe('string');
  expect((metadata.title as string).length).toBeGreaterThanOrEqual(35);
  expect((metadata.title as string).length).toBeLessThanOrEqual(60);
  expect(metadata.description!.length).toBeGreaterThanOrEqual(120);
  expect(metadata.description!.length).toBeLessThanOrEqual(155);
  expect(metadata.description).not.toMatch(/[\d?]/);
  expect(metadata.title).not.toContain('?');
}

it('provides descriptive, figure-free metadata for every public hub', async () => {
  for (const page of [residency, es, pt, insights, stories, guider, stader]) checkMetadata(page.generateMetadata());
  for (const page of [residencyHub, esHub, ptHub]) {
    for (const params of page.generateStaticParams()) checkMetadata(await page.generateMetadata({ params: Promise.resolve(params) }));
  }
});

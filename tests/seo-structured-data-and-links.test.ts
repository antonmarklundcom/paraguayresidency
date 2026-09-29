import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';

// Client hooks the real router provides; a static render has no router mounted.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push() {}, replace() {}, refresh() {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT ${to}`);
  },
  permanentRedirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT ${to}`);
  },
}));

const { SITE_KEYS, getSite, siteOrigin } = await import('@/sites/registry');
const { getPages } = await import('@/content');
const { contentHref } = await import('@/lib/site-pages');
const { organizationJsonLd } = await import('@/lib/metadata');
const { TEAM, TEAM_KEYS, personJsonLd } = await import('@/content/team');
const { PROOF } = await import('@content/shared/proof');
const { SiteShell } = await import('@/lib/site-shell');
const { renderAllPages, jsonLdBlocks, nodesOf, typesOf, internalLinks } = await import('./helpers/render-pages');
type Rendered = Awaited<ReturnType<typeof renderAllPages>>[number];
type SiteKey = (typeof SITE_KEYS)[number];

/**
 * Structured-data and internal-link gates (S24-B items 6 and 7). Every public
 * page of every brand is rendered in-process, then:
 *  - every JSON-LD block is parsed and checked for @type and required fields,
 *    and compared with what the same page shows the visitor;
 *  - the internal link graph is built from the rendered anchors and checked for
 *    orphans and for the links each article must carry.
 * No database, no network. One render pass is shared by every test below.
 */
let pages: Rendered[] = [];
const chrome = new Map<SiteKey, { html: string; links: string[] }>();

async function shellHtml(site: SiteKey): Promise<string> {
  const { prelude } = await prerenderToNodeStream(createElement(SiteShell, { site, children: null } as never));
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

beforeAll(async () => {
  pages = (await renderAllPages()).filter((p) => !p.error?.startsWith('NEXT_REDIRECT'));
  for (const site of SITE_KEYS) {
    const html = await shellHtml(site);
    chrome.set(site, { html, links: internalLinks(html) });
  }
}, 120_000);

const decode = (s: string) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** The visible text of a page, entities decoded, tags and JSON-LD removed. */
const visibleText = (html: string) =>
  decode(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');

const id = (p: Rendered) => `${p.site}${p.route}`;
const isHome = (p: Rendered) => p.route === '/';
const articleRoutes = (site: SiteKey) => new Set(getPages(site).map((page) => contentHref(site, page.slugPath)));
const isArticle = (p: Rendered) => articleRoutes(p.site).has(p.route);

describe('rendering', () => {
  it('renders every public page of every brand without error', () => {
    expect(pages.filter((p) => p.error).map((p) => `${id(p)}: ${p.error}`)).toEqual([]);
    for (const site of SITE_KEYS) expect(pages.filter((p) => p.site === site).length, site).toBeGreaterThan(10);
  });

  it('renders the same number of article pages as there are MDX articles', () => {
    for (const site of SITE_KEYS) {
      expect(pages.filter((p) => p.site === site && isArticle(p)).length, site).toBe(getPages(site).length);
    }
  });
});

describe('structured data: every block parses and is well formed', () => {
  it('every JSON-LD block is valid JSON with @context and @type', () => {
    const bad: string[] = [];
    for (const p of pages) {
      let blocks: Record<string, unknown>[] = [];
      try {
        blocks = jsonLdBlocks(p.html);
      } catch (error) {
        bad.push(`${id(p)}: unparsable JSON-LD (${(error as Error).message})`);
        continue;
      }
      for (const block of blocks) {
        if (block['@context'] !== 'https://schema.org') bad.push(`${id(p)}: block without schema.org @context`);
        if (!block['@type'] && !block['@graph']) bad.push(`${id(p)}: block without @type`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('no page emits the same structured-data type twice (Breadcrumb, FAQ, Article, Service)', () => {
    const bad: string[] = [];
    for (const p of pages) {
      const seen = new Map<string, number>();
      for (const node of nodesOf(p.html)) for (const type of typesOf(node)) seen.set(type, (seen.get(type) ?? 0) + 1);
      for (const type of ['BreadcrumbList', 'FAQPage', 'Article', 'Service', 'Product', 'CollectionPage']) {
        if ((seen.get(type) ?? 0) > 1) bad.push(`${id(p)}: ${type} x${seen.get(type)}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('structured data: Organization, LocalBusiness and Person (site shell)', () => {
  const orgOf = (site: SiteKey) => {
    const nodes = nodesOf(chrome.get(site)!.html);
    return {
      org: nodes.find((n) => typesOf(n).includes('Organization'))!,
      website: nodes.find((n) => typesOf(n).includes('WebSite'))!,
    };
  };

  it('every brand ships an Organization and WebSite on its own host from the shared shell', () => {
    for (const site of SITE_KEYS) {
      const { org, website } = orgOf(site);
      expect(org, site).toBeTruthy();
      expect(org.name, site).toBe(getSite(site).name);
      expect(org.url, site).toBe(siteOrigin(site));
      expect(org['@id'], site).toBe(`${siteOrigin(site)}/#organization`);
      expect(website.url, site).toBe(siteOrigin(site));
      expect(website.inLanguage, site).toBe(getSite(site).locale);
      expect((website.publisher as { '@id': string })['@id'], site).toBe(org['@id']);
    }
  });

  it('service brands are LocalBusiness (ProfessionalService) with a city-level address; the guide is a plain Organization', () => {
    for (const site of SITE_KEYS) {
      const { org } = orgOf(site);
      const types = typesOf(org);
      if (site === 'guide') {
        expect(types, site).toEqual(['Organization']);
        expect(org.address, site).toBeUndefined();
      } else {
        expect(types, site).toEqual(expect.arrayContaining(['Organization', 'LocalBusiness', 'ProfessionalService']));
        expect(org.address, site).toMatchObject({ '@type': 'PostalAddress', addressLocality: 'Asunción', addressCountry: 'PY' });
      }
    }
  });

  it('invents nothing: no street address, map, rating or extra sameAs while the proof file is empty', () => {
    expect(PROOF.office.address).toBeNull();
    expect(PROOF.office.mapsUrl).toBeNull();
    expect(PROOF.stats.googleRating).toBeNull();
    for (const site of SITE_KEYS) {
      const { org } = orgOf(site);
      const address = (org.address ?? {}) as Record<string, unknown>;
      expect(address.streetAddress, site).toBeUndefined();
      expect(org.hasMap, site).toBeUndefined();
      expect(org.aggregateRating, site).toBeUndefined();
      expect(org.sameAs, site).toEqual(getSite(site).siblings.map(siteOrigin));
    }
  });

  it('adds address, map, rating and profile links only when the proof file has them', () => {
    const proof = {
      ...PROOF,
      office: { ...PROOF.office, address: 'Test Street 1', mapsUrl: 'https://maps.example/x' },
      stats: { ...PROOF.stats, googleRating: { rating: 4.8, count: 12, url: 'https://reviews.example/y' } },
    };
    const graph = organizationJsonLd('residency', proof)['@graph'] as unknown as Record<string, unknown>[];
    const org = graph[0];
    expect((org.address as Record<string, unknown>).streetAddress).toBe('Test Street 1');
    expect(org.hasMap).toBe('https://maps.example/x');
    expect(org.aggregateRating).toMatchObject({ '@type': 'AggregateRating', ratingValue: 4.8, reviewCount: 12 });
    expect(org.sameAs).toEqual(expect.arrayContaining(['https://maps.example/x', 'https://reviews.example/y']));
    // The guide never claims a rating or an office it does not show.
    const guideOrg = (organizationJsonLd('guide', proof)['@graph'] as unknown as Record<string, unknown>[])[0];
    expect(guideOrg.aggregateRating).toBeUndefined();
    expect(guideOrg.address).toBeUndefined();
  });

  it('every team member is a Person with a name and a localized job title; sameAs only from team.ts', () => {
    for (const site of SITE_KEYS) {
      const { org } = orgOf(site);
      const employees = org.employee as Record<string, unknown>[];
      expect(employees.map((e) => e.name)).toEqual(TEAM_KEYS.map((key) => TEAM[key].name));
      for (const person of employees) {
        expect(person['@type']).toBe('Person');
        expect(person.jobTitle).toBeTruthy();
      }
    }
    for (const key of TEAM_KEYS) {
      const person = personJsonLd(key, 'en') as Record<string, unknown>;
      expect(person.sameAs !== undefined).toBe(TEAM[key].sameAs.length > 0);
    }
  });
});

describe('structured data: Article and Person byline match the page', () => {
  it('every article has a complete Article node whose facts match what is shown', () => {
    const bad: string[] = [];
    for (const p of pages.filter(isArticle)) {
      const origin = siteOrigin(p.site);
      const article = nodesOf(p.html).find((n) => typesOf(n).includes('Article'));
      if (!article) {
        bad.push(`${id(p)}: no Article`);
        continue;
      }
      const text = visibleText(p.html);
      for (const field of ['headline', 'description', 'datePublished', 'dateModified', 'author', 'publisher', 'image', 'inLanguage', 'url']) {
        if (!article[field]) bad.push(`${id(p)}: Article.${field} missing`);
      }
      const h1 = decode(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(p.html)?.[1].replace(/<[^>]+>/g, '') ?? '');
      if (article.headline !== h1) bad.push(`${id(p)}: headline "${article.headline}" is not the visible H1 "${h1}"`);
      if (article.url !== `${origin}${p.route}` || article.mainEntityOfPage !== article.url) bad.push(`${id(p)}: Article url not the page url`);
      if (article.inLanguage !== getSite(p.site).locale) bad.push(`${id(p)}: Article.inLanguage`);
      const author = article.author as Record<string, unknown> | undefined;
      if (author?.['@type'] !== 'Person' || !author.name) bad.push(`${id(p)}: byline is not a Person with a name`);
      else if (!text.includes(String(author.name))) bad.push(`${id(p)}: author "${author.name}" not shown in the byline`);
      const reviewer = article.reviewedBy as Record<string, unknown> | undefined;
      if (reviewer && !text.includes(String(reviewer.name))) bad.push(`${id(p)}: reviewer "${reviewer.name}" not shown`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(article.datePublished))) bad.push(`${id(p)}: datePublished format`);
      if ((article.publisher as { name?: string })?.name !== getSite(p.site).name) bad.push(`${id(p)}: publisher name`);
    }
    expect(bad).toEqual([]);
  });
});

describe('structured data: FAQPage matches the visible FAQ', () => {
  it('every FAQPage question and answer is on the page, word for word', () => {
    const bad: string[] = [];
    let checked = 0;
    for (const p of pages) {
      const faq = nodesOf(p.html).find((n) => typesOf(n).includes('FAQPage'));
      if (!faq) continue;
      const text = visibleText(p.html);
      const items = faq.mainEntity as { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[];
      if (!items?.length) bad.push(`${id(p)}: FAQPage with no questions`);
      for (const q of items ?? []) {
        checked++;
        if (q['@type'] !== 'Question' || q.acceptedAnswer?.['@type'] !== 'Answer' || !q.acceptedAnswer.text) {
          bad.push(`${id(p)}: malformed Question "${q.name}"`);
        }
        if (!text.includes(q.name.replace(/\s+/g, ' '))) bad.push(`${id(p)}: question not visible: ${q.name}`);
        if (!text.includes(q.acceptedAnswer.text.replace(/\s+/g, ' '))) bad.push(`${id(p)}: answer not visible: ${q.name}`);
      }
    }
    expect(checked).toBeGreaterThan(100);
    expect(bad).toEqual([]);
  });

  it('a visible FAQ (definition list under an FAQ heading) is never left without FAQPage markup', () => {
    // The shared <FAQ> renders markup and JSON-LD together; this catches a page
    // that hand-rolls a `<dl>` of questions instead of using it.
    const bad = pages
      .filter((p) => /<dt[^>]*>[^<]*\?<\/dt>/.test(p.html) && !nodesOf(p.html).some((n) => typesOf(n).includes('FAQPage')))
      .map(id);
    expect(bad).toEqual([]);
  });

  it('every service page that shows an FAQ carries FAQPage', () => {
    for (const p of pages.filter((p) => nodesOf(p.html).some((n) => typesOf(n).includes('Service')))) {
      if (/<dt[^>]*>/.test(p.html)) expect(nodesOf(p.html).some((n) => typesOf(n).includes('FAQPage')), id(p)).toBe(true);
    }
  });
});

describe('structured data: BreadcrumbList on every inner page', () => {
  it('every inner page has exactly one BreadcrumbList, home first, ending on the page itself', () => {
    const bad: string[] = [];
    for (const p of pages.filter((p) => !isHome(p))) {
      const origin = siteOrigin(p.site);
      const crumbs = nodesOf(p.html).filter((n) => typesOf(n).includes('BreadcrumbList'));
      if (crumbs.length !== 1) {
        bad.push(`${id(p)}: ${crumbs.length} BreadcrumbLists`);
        continue;
      }
      const items = crumbs[0].itemListElement as { '@type': string; position: number; name: string; item: string }[];
      if (items.length < 2) bad.push(`${id(p)}: breadcrumb has ${items.length} item(s)`);
      items.forEach((item, i) => {
        if (item['@type'] !== 'ListItem' || item.position !== i + 1 || !item.name) bad.push(`${id(p)}: malformed crumb ${i + 1}`);
        if (!item.item.startsWith(origin)) bad.push(`${id(p)}: crumb ${i + 1} leaves the host (${item.item})`);
      });
      if (items[0]?.item !== origin) bad.push(`${id(p)}: first crumb is not the home page`);
      if (items.at(-1)?.item !== `${origin}${p.route}`) bad.push(`${id(p)}: last crumb ${items.at(-1)?.item} is not this page`);
      const text = visibleText(p.html);
      for (const item of items) if (!text.includes(item.name)) bad.push(`${id(p)}: crumb "${item.name}" not visible`);
    }
    expect(bad).toEqual([]);
  });

  it('article breadcrumbs pass through their guides index and (where the brand has hubs) their hub', () => {
    const bad: string[] = [];
    for (const p of pages.filter(isArticle)) {
      const crumbs = nodesOf(p.html).find((n) => typesOf(n).includes('BreadcrumbList'))!;
      const items = crumbs.itemListElement as { item: string }[];
      const hubDepth = ['residency', 'residenciaes', 'residenciapt'].includes(p.site) ? 4 : p.site === 'flytta' ? 3 : 3;
      if (items.length !== hubDepth) bad.push(`${id(p)}: ${items.length} crumbs, expected ${hubDepth}`);
      // Every ancestor crumb must be a page that exists.
      for (const item of items.slice(1, -1)) {
        const path = item.item.slice(siteOrigin(p.site).length) || '/';
        if (!pages.some((q) => q.site === p.site && q.route === path)) bad.push(`${id(p)}: ancestor crumb ${path} is not a page`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('structured data: Service, Product and CollectionPage', () => {
  it('Service nodes name the provider, the page url and the area', () => {
    const bad: string[] = [];
    for (const p of pages) {
      for (const node of nodesOf(p.html).filter((n) => typesOf(n).includes('Service'))) {
        const provider = node.provider as { name?: string; url?: string } | undefined;
        if (!node.name || !node.description) bad.push(`${id(p)}: Service name/description`);
        if (node.url !== `${siteOrigin(p.site)}${p.route}`) bad.push(`${id(p)}: Service.url ${node.url}`);
        if (provider?.name !== getSite(p.site).name || provider?.url !== siteOrigin(p.site)) bad.push(`${id(p)}: Service.provider`);
        if (!node.areaServed) bad.push(`${id(p)}: Service.areaServed`);
        // Fees stay unpublished until verified: no numeric price in structured data.
        if (JSON.stringify(node).match(/"price"\s*:/)) bad.push(`${id(p)}: Service carries a price`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('every brand except the guide has at least one Service page', () => {
    for (const site of SITE_KEYS.filter((s) => s !== 'guide')) {
      expect(pages.some((p) => p.site === site && nodesOf(p.html).some((n) => typesOf(n).includes('Service'))), site).toBe(true);
    }
  });

  it('CollectionPage item counts match the list and every item is on the brand host', () => {
    for (const p of pages) {
      for (const node of nodesOf(p.html).filter((n) => typesOf(n).includes('CollectionPage'))) {
        const list = node.mainEntity as { numberOfItems: number; itemListElement: { position: number; url: string }[] };
        expect(list.itemListElement.length, id(p)).toBe(list.numberOfItems);
        list.itemListElement.forEach((item, i) => {
          expect(item.position, id(p)).toBe(i + 1);
          expect(item.url.startsWith(siteOrigin(p.site)), id(p)).toBe(true);
        });
      }
    }
  });
});

describe('internal links: every article is wired into the site', () => {
  /** Pages of a brand that describe a service: they carry Service JSON-LD, plus the guide's own offer on `/`. */
  const servicePaths = (site: SiteKey) =>
    new Set([
      ...pages.filter((p) => p.site === site && nodesOf(p.html).some((n) => typesOf(n).includes('Service'))).map((p) => p.route),
      ...(site === 'guide' ? ['/'] : []),
    ]);

  it('links to a service page, the route finder and at least two sibling articles', () => {
    const bad: string[] = [];
    for (const p of pages.filter(isArticle)) {
      const links = new Set(internalLinks(p.html));
      const siblings = [...articleRoutes(p.site)].filter((route) => route !== p.route && links.has(route));
      if (![...servicePaths(p.site)].some((route) => links.has(route))) bad.push(`${id(p)}: no service page link`);
      if (!links.has('/route-finder')) bad.push(`${id(p)}: no route finder link`);
      if (siblings.length < 2) bad.push(`${id(p)}: ${siblings.length} sibling article link(s)`);
      if (!/data-related-guides/.test(p.html)) bad.push(`${id(p)}: no related guides block`);
    }
    expect(bad).toEqual([]);
  });
});

describe('internal links: no orphan pages', () => {
  it('every public page has an inbound link from another page or the nav and footer', () => {
    const orphans: string[] = [];
    for (const site of SITE_KEYS) {
      const inbound = new Map<string, number>();
      for (const link of chrome.get(site)!.links) inbound.set(link, (inbound.get(link) ?? 0) + 1);
      for (const p of pages.filter((p) => p.site === site)) {
        for (const link of new Set(internalLinks(p.html))) if (link !== p.route) inbound.set(link, (inbound.get(link) ?? 0) + 1);
      }
      for (const p of pages.filter((p) => p.site === site && !isHome(p))) {
        if (!inbound.get(p.route)) orphans.push(id(p));
      }
    }
    expect(orphans).toEqual([]);
  });

  it('every article is linked from another content page, not only from the nav', () => {
    const orphans: string[] = [];
    for (const site of SITE_KEYS) {
      const own = pages.filter((p) => p.site === site);
      for (const article of own.filter(isArticle)) {
        const linkedBy = own.filter((p) => p.route !== article.route && internalLinks(p.html).includes(article.route));
        if (!linkedBy.length) orphans.push(id(article));
      }
    }
    expect(orphans).toEqual([]);
  });

  it('every public page is reachable from the home page by following links', () => {
    const unreachable: string[] = [];
    for (const site of SITE_KEYS) {
      const own = pages.filter((p) => p.site === site);
      const byRoute = new Map(own.map((p) => [p.route, p]));
      const seen = new Set<string>(['/']);
      const queue = ['/', ...chrome.get(site)!.links];
      while (queue.length) {
        const route = queue.shift()!;
        if (seen.has(route) && route !== '/') continue;
        seen.add(route);
        const page = byRoute.get(route);
        if (page) for (const link of internalLinks(page.html)) if (!seen.has(link)) queue.push(link);
      }
      for (const p of own) if (!seen.has(p.route)) unreachable.push(id(p));
    }
    expect(unreachable).toEqual([]);
  });

  it('no internal link points at a page that does not exist', () => {
    const NON_PAGE = /^\/(api|_next|opengraph-image|feed\.xml|sitemap\.xml|robots\.txt|llms(-full)?\.txt|downloads?|images|favicon|assets|route-finder\/result|confirm|unsubscribe|thank-you|account|login|members|book)/;
    const broken: string[] = [];
    for (const site of SITE_KEYS) {
      const routes = new Set(pages.filter((p) => p.site === site).map((p) => p.route));
      const sources = [...pages.filter((p) => p.site === site).map((p) => ({ from: p.route, html: p.html })), { from: '(shell)', html: chrome.get(site)!.html }];
      for (const { from, html } of sources) {
        for (const link of internalLinks(html)) {
          if (NON_PAGE.test(link) || /\.[a-z0-9]{2,4}$/.test(link)) continue;
          if (!routes.has(link)) broken.push(`${site}${from} -> ${link}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { SITE_KEYS, getSite, siteOrigin, type SiteKey } from '@/sites/registry';

/**
 * Metadata gate (S24-B item 5). Loads every page.tsx of every brand, resolves
 * its real `metadata` / `generateMetadata` (dynamic routes over their
 * `generateStaticParams`), and asserts what a search engine sees: a unique
 * title and description per host, sane lengths, a self-canonical on the page's
 * own host, an OG image, and the brand's locale. No database, no network.
 */
const APP = join(process.cwd(), 'src/app');
const TITLE_MAX = 60;
const TITLE_MIN = 15;
const DESC_MIN = 70;
const DESC_MAX = 160;

interface PageMeta {
  site: SiteKey;
  route: string;
  title: string;
  description: string;
  canonical: string;
  ogImages: number;
  ogLocale?: string;
  noindex: boolean;
}

function routeFiles(site: SiteKey): { route: string; file: string }[] {
  const locale = getSite(site).locale;
  const root = join(APP, `(${locale})`, 'sites', site);
  const out: { route: string; file: string }[] = [];
  const walk = (dir: string, prefix: string) => {
    if (!existsSync(dir)) return;
    if (existsSync(join(dir, 'page.tsx'))) out.push({ route: prefix || '/', file: join(dir, 'page.tsx') });
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory() && !entry.startsWith('_')) {
        walk(full, entry.startsWith('(') ? prefix : `${prefix}/${entry}`);
      }
    }
  };
  walk(root, '');
  return out;
}

function plainTitle(title: Metadata['title']): string {
  if (!title) return '';
  if (typeof title === 'string') return title;
  if ('absolute' in title && title.absolute) return title.absolute;
  if ('default' in title) return title.default;
  return '';
}

async function collect(): Promise<PageMeta[]> {
  const pages: PageMeta[] = [];
  for (const site of SITE_KEYS) {
    for (const { route, file } of routeFiles(site)) {
      const mod = (await import(/* @vite-ignore */ file)) as {
        metadata?: Metadata;
        generateMetadata?: (props: { params: Promise<Record<string, string>> }) => Metadata | Promise<Metadata>;
        generateStaticParams?: () => Record<string, string>[] | Promise<Record<string, string>[]>;
      };
      const dynamic = route.includes('[');
      const paramSets = dynamic ? (mod.generateStaticParams ? await mod.generateStaticParams() : []) : [{}];
      for (const params of paramSets) {
        const meta = mod.generateMetadata
          ? await mod.generateMetadata({ params: Promise.resolve(params) })
          : mod.metadata;
        let concrete = route;
        for (const [k, v] of Object.entries(params)) concrete = concrete.replace(`[${k}]`, v);
        const canonical = meta?.alternates?.canonical;
        const images = meta?.openGraph?.images;
        pages.push({
          site,
          route: concrete,
          title: plainTitle(meta?.title),
          description: meta?.description ?? '',
          canonical: typeof canonical === 'string' ? canonical : '',
          ogImages: Array.isArray(images) ? images.length : images ? 1 : 0,
          ogLocale: (meta?.openGraph as { locale?: string } | undefined)?.locale,
          noindex:
            !!meta?.robots && typeof meta.robots === 'object' && 'index' in meta.robots && meta.robots.index === false,
        });
      }
    }
  }
  return pages;
}

const pagesPromise = collect();

describe('metadata gate', () => {
  it('finds a realistic number of pages on every brand', async () => {
    const pages = await pagesPromise;
    for (const site of SITE_KEYS) {
      expect(pages.filter((p) => p.site === site).length, site).toBeGreaterThan(10);
    }
  });

  it('every indexable page has a title and description within limits', async () => {
    const bad: string[] = [];
    for (const p of (await pagesPromise).filter((p) => !p.noindex)) {
      const id = `${p.site}${p.route}`;
      if (p.title.length < TITLE_MIN || p.title.length > TITLE_MAX) bad.push(`${id} title ${p.title.length}: ${p.title}`);
      if (p.description.length < DESC_MIN || p.description.length > DESC_MAX)
        bad.push(`${id} description ${p.description.length}: ${p.description}`);
    }
    expect(bad).toEqual([]);
  });

  it('titles and descriptions are unique per host', async () => {
    const seenTitle = new Map<string, string>();
    const seenDesc = new Map<string, string>();
    const dupes: string[] = [];
    for (const p of (await pagesPromise).filter((p) => !p.noindex)) {
      const id = `${p.site}${p.route}`;
      const tk = `${p.site}|${p.title.toLowerCase()}`;
      const dk = `${p.site}|${p.description.toLowerCase()}`;
      if (seenTitle.has(tk)) dupes.push(`title: ${id} = ${seenTitle.get(tk)}`);
      else seenTitle.set(tk, id);
      if (seenDesc.has(dk)) dupes.push(`description: ${id} = ${seenDesc.get(dk)}`);
      else seenDesc.set(dk, id);
    }
    expect(dupes).toEqual([]);
  });

  it('every page canonicalises to its own path on its own host', async () => {
    const bad: string[] = [];
    for (const p of await pagesPromise) {
      const id = `${p.site}${p.route}`;
      if (!p.canonical.startsWith('/')) {
        bad.push(`${id} canonical "${p.canonical}"`);
        continue;
      }
      const url = new URL(p.canonical, siteOrigin(p.site));
      if (url.origin !== new URL(siteOrigin(p.site)).origin) bad.push(`${id} off-host canonical`);
      if (url.search || url.hash) bad.push(`${id} canonical has query or hash`);
      if (url.pathname !== p.route) bad.push(`${id} canonical ${url.pathname} is not its own route`);
    }
    expect(bad).toEqual([]);
  });

  it('every indexable page has an OG image and the brand locale', async () => {
    const bad: string[] = [];
    for (const p of (await pagesPromise).filter((p) => !p.noindex)) {
      const id = `${p.site}${p.route}`;
      if (p.ogImages < 1) bad.push(`${id} no og:image`);
      if (!p.ogLocale) bad.push(`${id} no og:locale`);
    }
    expect(bad).toEqual([]);
  });
});

describe('metadata gate: language and cross-host duplication', () => {
  it('each locale layout declares the html lang its brands are registered with', () => {
    const LANG: Record<string, string> = { en: 'en', es: 'es', pt: 'pt-BR', sv: 'sv' };
    const locales = new Set(SITE_KEYS.map((s) => getSite(s).locale));
    for (const locale of locales) {
      const layout = readFileSync(join(APP, `(${locale})`, 'layout.tsx'), 'utf8');
      expect(layout, locale).toContain(`<html lang="${LANG[locale]}"`);
    }
  });

  it('covers every MDX article as a page', async () => {
    const pages = await pagesPromise;
    const missing: string[] = [];
    for (const site of SITE_KEYS) {
      for (const page of getPages(site)) {
        const route = contentHref(site, page.slugPath);
        if (!pages.some((p) => p.site === site && p.route === route)) missing.push(`${site}${route}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('English brands never share or near-copy a title or description (hub .co.uk vs guide .com)', async () => {
    const words = (s: string) =>
      new Set(s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 2));
    const jaccard = (a: string, b: string) => {
      const x = words(a);
      const y = words(b);
      const inter = [...x].filter((w) => y.has(w)).length;
      return inter / (x.size + y.size - inter || 1);
    };
    // Legal boilerplate is short and templated; each title and description names
    // its brand, so it is compared for exact matches only, never word overlap.
    const legal = /^\/(privacy|terms|refunds|unsubscribe)$/;
    const en = (await pagesPromise).filter((p) => getSite(p.site).locale === 'en' && !p.noindex && !legal.test(p.route));
    const near: string[] = [];
    for (let i = 0; i < en.length; i++) {
      for (let j = i + 1; j < en.length; j++) {
        const a = en[i];
        const b = en[j];
        if (a.site === b.site) continue;
        if (a.title.toLowerCase() === b.title.toLowerCase() || a.description.toLowerCase() === b.description.toLowerCase()) {
          near.push(`exact: ${a.site}${a.route} = ${b.site}${b.route}`);
        } else if (jaccard(a.title, b.title) >= 0.8 || jaccard(a.description, b.description) >= 0.7) {
          near.push(`near: ${a.site}${a.route} ~ ${b.site}${b.route}`);
        }
      }
    }
    expect(near).toEqual([]);
  });
});

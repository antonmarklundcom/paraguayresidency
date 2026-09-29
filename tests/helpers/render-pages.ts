import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { SITE_KEYS, getSite, type SiteKey } from '@/sites/registry';

/**
 * Shared by the SEO gate tests: renders every public page of every brand to
 * static HTML in-process (no server, no database, no network) so structured
 * data and internal links can be read from what a visitor really receives.
 */
const APP = join(process.cwd(), 'src/app');

export interface RenderedPage {
  site: SiteKey;
  /** Concrete public path, e.g. `/guides/documents/apostilles`. */
  route: string;
  html: string;
  /** Set when the page could not be rendered outside Next (with the reason). */
  error?: string;
}

type PageModule = {
  default: (props: { params: Promise<Record<string, string>>; searchParams: Promise<Record<string, string>> }) => unknown;
  generateStaticParams?: () => Record<string, string>[] | Promise<Record<string, string>[]>;
};

function routeFiles(site: SiteKey): { route: string; file: string }[] {
  const root = join(APP, `(${getSite(site).locale})`, 'sites', site);
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

/** Routes never indexed or gated: they carry no SEO obligations. */
export const NON_PUBLIC = /^\/(confirm|unsubscribe|thank-you|account|login|members(\/.*)?|result|route-finder\/result)$/;

/** `prerender` (not `renderToStaticMarkup`) so async server components, like the MDX body, finish. */
async function toHtml(element: ReturnType<typeof createElement>): Promise<string> {
  const { prelude } = await prerenderToNodeStream(element);
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

export async function renderAllPages(): Promise<RenderedPage[]> {
  const pages: RenderedPage[] = [];
  for (const site of SITE_KEYS) {
    for (const { route, file } of routeFiles(site)) {
      if (NON_PUBLIC.test(route)) continue;
      const mod = (await import(/* @vite-ignore */ file)) as PageModule;
      const paramSets = route.includes('[') ? (mod.generateStaticParams ? await mod.generateStaticParams() : []) : [{}];
      for (const params of paramSets) {
        let concrete = route;
        for (const [k, v] of Object.entries(params)) concrete = concrete.replace(`[${k}]`, v);
        try {
          const element = await mod.default({
            params: Promise.resolve(params),
            searchParams: Promise.resolve({}),
          });
          pages.push({ site, route: concrete, html: await toHtml(createElement('div', null, element as never)) });
        } catch (error) {
          pages.push({ site, route: concrete, html: '', error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
  }
  return pages;
}

/** Every parsed `application/ld+json` block in a page, flattened out of `@graph`. */
export function jsonLdBlocks(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    blocks.push(JSON.parse(match[1].replace(/\\u003c/g, '<')) as Record<string, unknown>);
  }
  return blocks;
}

export function nodesOf(html: string): Record<string, unknown>[] {
  return jsonLdBlocks(html).flatMap((block) =>
    Array.isArray(block['@graph']) ? (block['@graph'] as Record<string, unknown>[]) : [block],
  );
}

/** The `@type` values of a node, always as an array. */
export function typesOf(node: Record<string, unknown>): string[] {
  const t = node['@type'];
  return Array.isArray(t) ? (t as string[]) : t ? [String(t)] : [];
}

/** Internal hrefs (path only) found in rendered HTML. */
export function internalLinks(html: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)/g)) out.add(m[1].replace(/(.)\/$/, '$1'));
  return [...out];
}

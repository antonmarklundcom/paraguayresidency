import 'server-only';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { SiteKey } from '@/sites/registry';
import { frontmatterSchema, type Frontmatter } from './schema';

export interface ContentPage {
  /** `documents/apostilles` — hub + slug, the public path suffix. */
  slugPath: string;
  hub: string;
  slug: string;
  frontmatter: Frontmatter;
  body: string;
}

const CONTENT_ROOT = join(process.cwd(), 'content');

function siteDir(site: SiteKey): string {
  return join(CONTENT_ROOT, site);
}

function listMdx(dir: string, prefix = '', out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) listMdx(full, `${prefix}${entry}/`, out);
    else if (entry.endsWith('.mdx')) out.push(`${prefix}${entry.replace(/\.mdx$/, '')}`);
  }
  return out;
}

function parse(site: SiteKey, slugPath: string): ContentPage {
  const file = join(siteDir(site), `${slugPath}.mdx`);
  const raw = readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/${site}/${slugPath}.mdx: ${parsed.error.issues
        .map((i) => `${i.path.join('.')} ${i.message}`)
        .join('; ')}`,
    );
  }
  if (parsed.data.site !== site) {
    throw new Error(
      `content/${site}/${slugPath}.mdx declares site "${parsed.data.site}" but lives under "${site}".`,
    );
  }
  const [hub, ...rest] = slugPath.split('/');
  if (parsed.data.hub !== hub) {
    throw new Error(
      `content/${site}/${slugPath}.mdx declares hub "${parsed.data.hub}" but lives under "${hub}".`,
    );
  }
  return {
    slugPath,
    hub,
    slug: rest.join('/') || hub,
    frontmatter: parsed.data,
    body: content,
  };
}

const includeDrafts = process.env.NODE_ENV !== 'production';

/** Every publishable page for a site, newest first. */
export function getPages(site: SiteKey): ContentPage[] {
  return listMdx(siteDir(site))
    .filter((slugPath) => slugPath.includes('/'))
    .map((slugPath) => parse(site, slugPath))
    .filter((page) => includeDrafts || !page.frontmatter.draft)
    .sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt));
}

export function getPage(site: SiteKey, slugPath: string): ContentPage | undefined {
  const safe = slugPath.replace(/^\/+|\/+$/g, '');
  if (!/^[a-z0-9/-]+$/.test(safe)) return undefined;
  if (!existsSync(join(siteDir(site), `${safe}.mdx`))) return undefined;
  const page = parse(site, safe);
  return includeDrafts || !page.frontmatter.draft ? page : undefined;
}

export function getHub(site: SiteKey, hub: string): ContentPage[] {
  return getPages(site).filter((page) => page.hub === hub);
}

export function getHubs(site: SiteKey): string[] {
  return [...new Set(getPages(site).map((page) => page.hub))].sort();
}

export type { Frontmatter };

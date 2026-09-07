import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_KEYS } from '@/sites/registry';
import { contentHref } from '@/lib/site-pages';

/**
 * Every internal link written in MDX must resolve to something that exists.
 *
 * This is not hypothetical: S3 shipped five articles linking to
 * `/documents/…` instead of `/guides/documents/…`, caught four of them in its
 * own audit, and left one behind. The public path for a content page is
 * `contentHref(site, slugPath)` — NOT the path the file sits at — and that
 * gap is easy to miss when writing prose. The build catches it now.
 */
const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const APP = join(ROOT, 'src/app/sites');

/** `](/some/path)` — markdown links only; bare URLs and anchors are ignored. */
const LINK_RE = /\]\((\/[A-Za-z0-9/_-]*)\)/g;

function mdxFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) mdxFiles(full, out);
    else if (entry.endsWith('.mdx')) out.push(full);
  }
  return out;
}

/** Public paths a brand serves from MDX, e.g. `/guides/taxes/ruc-and-tax-residency`. */
function contentPaths(site: string): Set<string> {
  const dir = join(CONTENT, site);
  const paths = new Set<string>();
  for (const file of mdxFiles(dir)) {
    const slugPath = file.slice(dir.length + 1).replace(/\.mdx$/, '');
    if (!slugPath.includes('/')) continue;
    paths.add(contentHref(site as never, slugPath));
  }
  return paths;
}

/** Public paths a brand serves from a `page.tsx`, including shared O2 routes. */
function routePaths(site: string): Set<string> {
  const dir = join(APP, site);
  const paths = new Set<string>();
  const walk = (current: string, prefix: string) => {
    if (!existsSync(current)) return;
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (!statSync(full).isDirectory()) continue;
      // Route groups, private folders and dynamic segments are not literal paths.
      if (entry.startsWith('_') || entry.startsWith('(') || entry.startsWith('[')) continue;
      const path = `${prefix}/${entry}`;
      if (existsSync(join(full, 'page.tsx'))) paths.add(path);
      walk(full, path);
    }
  };
  if (existsSync(join(dir, 'page.tsx'))) paths.add('/');
  walk(dir, '');
  return paths;
}

describe('every internal MDX link resolves', () => {
  for (const site of SITE_KEYS) {
    const files = mdxFiles(join(CONTENT, site));
    if (files.length === 0) continue;

    it(`${site}: no dead links in ${files.length} article(s)`, () => {
      const known = new Set([...contentPaths(site), ...routePaths(site)]);
      const dead: string[] = [];

      for (const file of files) {
        const src = readFileSync(file, 'utf8');
        LINK_RE.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = LINK_RE.exec(src))) {
          const href = match[1];
          if (!known.has(href)) {
            dead.push(`${file.replace(`${ROOT}/`, '')} → ${href}`);
          }
        }
      }

      expect(dead, `dead internal link(s):\n  ${dead.join('\n  ')}`).toEqual([]);
    });
  }

  it('knows the real public path of a content page, not the file path', () => {
    // The regression itself: the file lives at content/residency/taxes/x.mdx
    // but the URL is /guides/taxes/x — never /residency/taxes/x.
    expect(contentHref('residency', 'taxes/territorial-tax-explained')).toBe(
      '/guides/taxes/territorial-tax-explained',
    );
  });
});

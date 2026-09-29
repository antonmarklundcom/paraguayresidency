import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SiteKey } from '@/sites/registry';
import { arrivalExists } from './arrival-files';
import { hubImage } from './hub-images';

/**
 * Per-article photos. `src/lib/article-images.json` maps
 * `<site>/<hub>/<slug>` to an Arrival image id (files in
 * `public/images/arrival/`, alt text in `docs/imagery-manifest.json`).
 *
 * The map is read from disk, not imported, so a build works while the file
 * does not exist yet: a missing file, a bad file or a missing key all mean
 * "no image of its own" and the article falls back to its hub's image.
 */
let cache: Record<string, string> | undefined;

function load(): Record<string, string> {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  let map: Record<string, string> = {};
  try {
    const file = join(process.cwd(), 'src/lib/article-images.json');
    if (existsSync(file)) {
      const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        map = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).filter(([, value]) => typeof value === 'string'),
        ) as Record<string, string>;
      }
    }
  } catch {
    map = {};
  }
  cache = map;
  return map;
}

/** The article's own image id, or undefined when it has none (or its files are missing). */
export function articleOwnImage(site: SiteKey, slugPath: string): string | undefined {
  const id = load()[`${site}/${slugPath}`];
  return id && arrivalExists(id) ? id : undefined;
}

/** The image to lead an article with: its own, else its hub's, else the brand's. */
export function articleImage(site: SiteKey, slugPath: string): { id: string; own: boolean } {
  const own = articleOwnImage(site, slugPath);
  if (own) return { id: own, own: true };
  return { id: hubImage(site, slugPath.split('/')[0]), own: false };
}

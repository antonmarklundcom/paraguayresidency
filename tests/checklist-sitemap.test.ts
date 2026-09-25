import { describe, expect, it } from 'vitest';
import { buildSitemap } from '@/lib/seo-files';
import { siteOrigin } from '@/sites/registry';

/**
 * The document checklist tool (residency, frontier, residenciaes,
 * residenciapt) is a plain app route, not MDX content, so `buildSitemap`
 * only lists it if it is named in `staticPaths` — nothing discovers it
 * automatically. Regression test for that omission.
 */
describe('document checklist pages are discoverable in their sitemap', () => {
  const cases: [site: 'residency' | 'frontier' | 'residenciaes' | 'residenciapt', path: string][] = [
    ['residency', '/documents/checklist'],
    ['frontier', '/documents/checklist'],
    ['residenciaes', '/documentos/lista'],
    ['residenciapt', '/documentos/lista'],
  ];

  for (const [site, path] of cases) {
    it(`${site} sitemap includes ${path}`, () => {
      const urls = buildSitemap(site).map((entry) => entry.url);
      expect(urls).toContain(`${siteOrigin(site)}${path}`);
    });
  }
});

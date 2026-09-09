import type { MetadataRoute } from 'next';
import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { siteOrigin, type SiteKey } from '@/sites/registry';

/**
 * Per-host robots + sitemap. Each brand lists only its own URLs, on its own
 * origin — the whole point of resolving the site from the registry (plan §2).
 */
export const DISALLOWED = ['/admin', '/api/', '/sites/', '/dev/', '/members', '/login'];

/** Serialised robots.txt for a brand, served by `src/app/robots.txt/route.ts`. */
export function robotsText(site: SiteKey): string {
  const origin = siteOrigin(site);
  return [
    'User-agent: *',
    'Allow: /',
    ...DISALLOWED.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    `Host: ${origin}`,
    '',
  ].join('\n');
}

/** Same policy in Next's metadata shape — kept for tests and future reuse. */
export function buildRobots(site: SiteKey): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED,
      },
    ],
    sitemap: `${siteOrigin(site)}/sitemap.xml`,
    host: siteOrigin(site),
  };
}

/**
 * Static routes that exist for a brand regardless of MDX content. The
 * conversion routes O2 added are listed here; `/route-finder/result`,
 * `/thank-you`, `/confirm` and `/unsubscribe` are deliberately absent — each
 * is per-visitor or single-use and carries `noindex`.
 */
const staticPaths: Record<SiteKey, string[]> = {
  residency: [
    '/',
    '/route-finder',
    '/contact',
    '/book',
    '/privacy',
    '/terms',
    '/residency/temporary-residency',
    '/residency/permanent-residency',
    '/residency/cedula',
    '/residency/tax-residency',
    '/residency/family',
    '/pricing',
    '/process',
    '/about',
    '/guide',
  ],
  investorpass: [
    '/',
    '/route-finder',
    '/contact',
    '/privacy',
    '/terms',
    '/about',
    '/investor-pass/requirements',
    '/investor-pass/investment-routes',
    '/investor-pass/process',
    '/investor-pass/vs-standard-residency',
    '/investor-pass/for-agents',
  ],
  guide: ['/', '/route-finder', '/contact', '/privacy', '/terms', '/about', '/refunds', '/blog'],
  frontier: [
    '/',
    '/route-finder',
    '/contact',
    '/privacy',
    '/terms',
    '/why-paraguay',
    '/routes',
    '/tax',
    '/process',
    '/pricing',
    '/about',
    '/guide',
  ],
  residenciaes: [
    '/',
    '/route-finder',
    '/contact',
    '/privacy',
    '/terms',
    '/residencia/temporal',
    '/residencia/permanente',
    '/residencia/cedula',
    '/residencia-fiscal',
    '/familia',
    '/mercosur',
    '/proceso',
    '/precios',
    '/nosotros',
    // /pase-inversor is a thin, noindex bridge (plan §6.6) — excluded from
    // the sitemap, the same treatment the hub gives its own /investor-pass.
  ],
  residenciapt: ['/', '/route-finder', '/contact', '/privacy', '/terms'],
  flytta: ['/', '/route-finder', '/contact', '/privacy', '/terms'],
};

export function buildSitemap(site: SiteKey): MetadataRoute.Sitemap {
  const origin = siteOrigin(site);
  const now = new Date();

  const staticEntries = staticPaths[site].map((path) => ({
    url: `${origin}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.3,
  }));

  const contentEntries = getPages(site).map((page) => ({
    url: `${origin}${contentHref(site, page.slugPath)}`,
    lastModified: new Date(page.frontmatter.updatedAt ?? page.frontmatter.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...contentEntries];
}

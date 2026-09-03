import type { MetadataRoute } from 'next';
import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { siteOrigin, type SiteKey } from '@/sites/registry';

/**
 * Per-host robots + sitemap. Each brand lists only its own URLs, on its own
 * origin — the whole point of resolving the site from the registry (plan §2).
 */
export function buildRobots(site: SiteKey): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/sites/', '/dev/'],
      },
    ],
    sitemap: `${siteOrigin(site)}/sitemap.xml`,
    host: siteOrigin(site),
  };
}

/** Static routes that exist for a brand regardless of MDX content. */
const staticPaths: Record<SiteKey, string[]> = {
  residency: ['/', '/privacy', '/terms'],
  investorpass: ['/', '/privacy', '/terms'],
  guide: ['/', '/privacy', '/terms'],
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

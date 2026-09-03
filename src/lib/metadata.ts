import type { Metadata } from 'next';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';

export interface SiteMetadataInput {
  title: string;
  description: string;
  /** Public path on this brand's own host, e.g. `/residency/cedula`. */
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Per-request metadata anchored to the SITE REGISTRY, never to one env var
 * (O1 trap). Every brand therefore gets its own metadataBase, canonical and
 * OG URL with no cross-domain duplicates (plan §2).
 */
export function siteMetadata(site: SiteKey, input: SiteMetadataInput): Metadata {
  const config = getSite(site);
  const origin = siteOrigin(site);
  const path = input.path === '/' ? '/' : `/${input.path.replace(/^\/+/, '')}`;

  return {
    metadataBase: new URL(origin),
    title: input.title,
    description: input.description,
    alternates: { canonical: path },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? 'website',
      url: path,
      title: input.title,
      description: input.description,
      siteName: config.name,
      locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: config.name }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
    },
  };
}

/** Organization JSON-LD, one shape for all three brands. */
export function organizationJsonLd(site: SiteKey) {
  const config = getSite(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: siteOrigin(site),
    sameAs: config.siblings.map((key) => siteOrigin(key)),
  };
}

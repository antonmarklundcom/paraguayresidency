import type { Metadata } from 'next';
import { OG_LOCALE } from '@/i18n/locales';
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
      locale: OG_LOCALE[config.locale],
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

/** Service JSON-LD for a service page (plan §6.1 exit: "Service on service pages"). */
export function serviceJsonLd(
  site: SiteKey,
  input: { name: string; description: string; path: string },
) {
  const config = getSite(site);
  const origin = siteOrigin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: `${origin}${input.path}`,
    provider: { '@type': 'Organization', name: config.name, url: origin },
    areaServed: 'Paraguay',
  };
}

/**
 * Service + Offer JSON-LD (plan §6.2 exit: "Product/Service + Offer JSON-LD
 * on /"). Deliberately carries no numeric price — investment thresholds are
 * unverified until the legal partner signs off (§1.10), and structured data
 * is not exempt from that rule just because it is invisible to the reader.
 * `Offer` here marks the engagement as available, not as a fixed-price
 * checkout.
 */
export function serviceOfferJsonLd(
  site: SiteKey,
  input: { name: string; description: string; path: string },
) {
  return {
    ...serviceJsonLd(site, input),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${siteOrigin(site)}${input.path}`,
      areaServed: 'Paraguay',
    },
  };
}

/**
 * Product + Offer JSON-LD for the Guide's real, fixed-price digital product
 * (plan §6.3 exit). Unlike `serviceOfferJsonLd`, this DOES carry a numeric
 * price — the $7 entry price is a locked business decision (plan §1.5), not
 * an unverified legal/financial claim under §1.10, so it is read from the
 * live `products` row (or the same env fallback the checkout button uses)
 * rather than hardcoded here.
 */
export function productOfferJsonLd(
  site: SiteKey,
  input: {
    name: string;
    description: string;
    path: string;
    priceCents: number;
    currency: string;
    sku: string;
  },
) {
  const origin = siteOrigin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    sku: input.sku,
    url: `${origin}${input.path}`,
    offers: {
      '@type': 'Offer',
      url: `${origin}${input.path}`,
      priceCurrency: input.currency,
      price: (input.priceCents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };
}

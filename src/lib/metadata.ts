import type { Metadata } from 'next';
import { OG_LOCALE } from '@/i18n/locales';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';
import { t } from '@/i18n';
import { TEAM_KEYS, TEAM, personJsonLd } from '@/content/team';
import { PROOF, type Proof } from '@content/shared/proof';

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
    alternates: {
      canonical: path,
      types: { 'application/rss+xml': `${origin}/feed.xml` },
    },
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

/** A collection of articles or hubs on the brand's own origin. */
export function collectionPageJsonLd(
  site: SiteKey,
  input: { name: string; description: string; path: string; items: { name: string; path: string }[] },
) {
  const origin = siteOrigin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: origin + input.path,
    inLanguage: getSite(site).locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: origin + item.path,
      })),
    },
  };
}

/** Extra names a brand is known by, for `alternateName` on its Organization. */
const ALTERNATE_NAMES: Partial<Record<SiteKey, string[]>> = {
  residency: ['Paraguay Residency UK', 'paraguayresidency.co.uk'],
};

/**
 * Site-wide JSON-LD graph: the brand as an Organization (a ProfessionalService
 * for the brands that sell the residency service), the WebSite, and the named
 * team. Answer engines resolve "who is behind this and where" from this graph,
 * so it names people and the city, and never an address nobody has confirmed.
 */
export function organizationJsonLd(site: SiteKey, proof: Proof = PROOF) {
  const config = getSite(site);
  const origin = siteOrigin(site);
  const orgId = `${origin}/#organization`;
  // Guide is a publisher (it sells a PDF); every other brand is a front door
  // to the same residency service team.
  const isService = site !== 'guide';
  // Real business data only. Each of these is null until Anton supplies it
  // (content/shared/proof.ts), and nothing is emitted, let alone invented,
  // while it is: no street address, no map, no rating.
  const { office, stats } = proof;
  const rating = stats.googleRating;
  const sameAs = [
    ...config.siblings.map((key) => siteOrigin(key)),
    ...(rating?.url ? [rating.url] : []),
    ...(office.mapsUrl ? [office.mapsUrl] : []),
    ...TEAM_KEYS.flatMap((key) => TEAM[key].sameAs),
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // ProfessionalService is a schema.org LocalBusiness subtype; LocalBusiness
        // is named too so validators that look for the parent type find it.
        '@type': isService ? ['Organization', 'LocalBusiness', 'ProfessionalService'] : 'Organization',
        '@id': orgId,
        name: config.name,
        // Other companies trade under near-identical names (seo-gap §0b.8), so
        // the hub pairs its name with the UK domain it actually runs on.
        ...(ALTERNATE_NAMES[site] ? { alternateName: ALTERNATE_NAMES[site] } : {}),
        url: origin,
        image: `${origin}/opengraph-image`,
        description: t(site, config.tagline),
        parentOrganization: { '@type': 'Organization', name: 'Paraguay Residency Group' },
        areaServed: { '@type': 'Country', name: 'Paraguay' },
        ...(isService
          ? {
              address: {
                '@type': 'PostalAddress',
                ...(office.address ? { streetAddress: office.address } : {}),
                addressLocality: 'Asunción',
                addressCountry: 'PY',
              },
              ...(office.mapsUrl ? { hasMap: office.mapsUrl } : {}),
              ...(rating
                ? {
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: rating.rating,
                      reviewCount: rating.count,
                      bestRating: 5,
                    },
                  }
                : {}),
              serviceType: 'Paraguay residency, cédula and tax residency applications',
            }
          : {}),
        knowsAbout: [
          'Paraguay temporary residency',
          'Paraguay permanent residency',
          'Paraguay Investor Pass',
          'Paraguayan cédula',
          'Paraguay tax residency',
          'Mercosur residency',
        ],
        employee: TEAM_KEYS.map((key) => personJsonLd(key, config.locale)),
        sameAs,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: config.name,
        url: origin,
        inLanguage: config.locale,
        publisher: { '@id': orgId },
      },
    ],
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

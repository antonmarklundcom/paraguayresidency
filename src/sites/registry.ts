import type { Locale } from '@/i18n/locales';

/**
 * The site registry is the single source of truth for "which brand is this
 * request for". Adding a fourth domain = one entry here + one folder under
 * `src/app/sites/<key>/`. Never a second Next.js app (plan §1.1).
 */

export type SiteKey =
  | 'residency'
  | 'investorpass'
  | 'guide' //                                                              O1
  | 'frontier'
  | 'residenciaes'
  | 'residenciapt'
  | 'flytta'; //                                                            O9

/**
 * Order matters in exactly one place: `siteEnum` in `src/db/schema.ts` mirrors
 * this list and a test asserts the two are identical (plan §2). Appending is
 * safe; reordering or removing a key is a migration.
 */
export const SITE_KEYS: readonly SiteKey[] = [
  'residency',
  'investorpass',
  'guide',
  'frontier',
  'residenciaes',
  'residenciapt',
  'flytta',
] as const;

/** The brand that owns shared surfaces: /admin, the canonical fallback host. */
export const HUB_SITE: SiteKey = 'residency';

export interface NavItem {
  /** i18n key resolved through `t(site, key)` — never raw display copy. */
  labelKey: string;
  href: string;
  /** Absolute cross-brand link (renders with rel="noopener"). */
  external?: boolean;
}

export interface FooterColumn {
  titleKey: string;
  items: NavItem[];
}

export interface FooterSpec {
  columns: FooterColumn[];
  legal: NavItem[];
}

export interface SiteConfig {
  key: SiteKey;
  /** Every hostname that must resolve to this site, lowercase, no port. */
  hosts: string[];
  /** Apex host. `www.` variants 301 here; used for metadataBase + sitemaps. */
  canonicalHost: string;
  name: string;
  tagline: string;
  /**
   * Exactly one locale per brand (plan §1.3). Drives `<html lang>`, which
   * `messages/<locale>/` folder is loaded, and every `Intl` format.
   */
  locale: Locale;
  /** Display order for money facts, e.g. `['EUR','PYG']` (plan §2). */
  currencies: string[];
  theme: SiteKey;
  /**
   * Product slugs sold on this brand. A brand with no `products` is lead-gen
   * only: `/login` and `/members` 404 there (plan §5.4.5).
   */
  products?: string[];
  nav: NavItem[];
  footer: FooterSpec;
  analytics?: { plausibleDomain?: string; gtmId?: string };
  /** VenderCRM source tag (plan §1.6). */
  crm: { source: string };
  /** Cross-links rendered in the footer (plan §1.2). */
  siblings: SiteKey[];
}

const legalNav = (): NavItem[] => [
  { labelKey: 'nav.privacy', href: '/privacy' },
  { labelKey: 'nav.terms', href: '/terms' },
];

/**
 * Product slugs. They are constants rather than string literals because the
 * seed, the checkout router and this registry must agree exactly (plan §5.4.3).
 */
export const GUIDE_ENTRY_SLUG = 'guide-entry';
export const GUIDE_INSIDER_SLUG = 'guide-insider';

/** Home, contact and the legal pages — all a new brand has until its phase. */
const minimalNav = (): NavItem[] => [
  { labelKey: 'nav.routeFinder', href: '/route-finder' },
  { labelKey: 'nav.contact', href: '/contact' },
];

const minimalFooter = (): FooterSpec => ({
  columns: [
    {
      titleKey: 'footer.company',
      items: [{ labelKey: 'nav.contact', href: '/contact' }],
    },
  ],
  legal: legalNav(),
});

export const sites: Record<SiteKey, SiteConfig> = {
  residency: {
    key: 'residency',
    hosts: [
      'paraguayresidency.com',
      'www.paraguayresidency.com',
      'residency.localhost',
      'localhost',
    ],
    canonicalHost: 'paraguayresidency.com',
    name: 'Paraguay Residency',
    tagline: 'site.tagline',
    locale: 'en',
    currencies: ['USD'],
    theme: 'residency',
    nav: [
      { labelKey: 'nav.routes', href: '/process' },
      { labelKey: 'nav.pricing', href: '/pricing' },
      { labelKey: 'nav.routeFinder', href: '/route-finder' },
      { labelKey: 'nav.about', href: '/about' },
      { labelKey: 'nav.contact', href: '/contact' },
    ],
    footer: {
      columns: [
        {
          titleKey: 'footer.services',
          items: [
            { labelKey: 'nav.temporary', href: '/residency/temporary-residency' },
            { labelKey: 'nav.permanent', href: '/residency/permanent-residency' },
            { labelKey: 'nav.cedula', href: '/residency/cedula' },
            { labelKey: 'nav.taxResidency', href: '/residency/tax-residency' },
            { labelKey: 'nav.family', href: '/residency/family' },
          ],
        },
        {
          titleKey: 'footer.company',
          items: [
            { labelKey: 'nav.about', href: '/about' },
            { labelKey: 'nav.contact', href: '/contact' },
          ],
        },
      ],
      legal: legalNav(),
    },
    crm: { source: 'paraguayresidency.com' },
    siblings: ['investorpass', 'guide'],
  },

  investorpass: {
    key: 'investorpass',
    hosts: [
      'paraguayinvestorpass.com.py',
      'www.paraguayinvestorpass.com.py',
      'investorpass.localhost',
    ],
    canonicalHost: 'paraguayinvestorpass.com.py',
    name: 'Paraguay Investor Pass',
    tagline: 'site.tagline',
    locale: 'en',
    currencies: ['USD'],
    theme: 'investorpass',
    nav: [
      { labelKey: 'nav.requirements', href: '/investor-pass/requirements' },
      { labelKey: 'nav.investmentRoutes', href: '/investor-pass/investment-routes' },
      { labelKey: 'nav.process', href: '/investor-pass/process' },
      { labelKey: 'nav.routeFinder', href: '/route-finder' },
      { labelKey: 'nav.contact', href: '/contact' },
    ],
    footer: {
      columns: [
        {
          titleKey: 'footer.program',
          items: [
            { labelKey: 'nav.requirements', href: '/investor-pass/requirements' },
            { labelKey: 'nav.investmentRoutes', href: '/investor-pass/investment-routes' },
            { labelKey: 'nav.process', href: '/investor-pass/process' },
            { labelKey: 'nav.vsStandard', href: '/investor-pass/vs-standard-residency' },
          ],
        },
        {
          titleKey: 'footer.company',
          items: [
            { labelKey: 'nav.about', href: '/about' },
            { labelKey: 'nav.contact', href: '/contact' },
            { labelKey: 'nav.forAgents', href: '/investor-pass/for-agents' },
          ],
        },
      ],
      legal: legalNav(),
    },
    crm: { source: 'paraguayinvestorpass.com.py' },
    siblings: ['residency', 'guide'],
  },

  guide: {
    key: 'guide',
    hosts: [
      'paraguayinvestorguide.com',
      'www.paraguayinvestorguide.com',
      'guide.localhost',
    ],
    canonicalHost: 'paraguayinvestorguide.com',
    name: 'Paraguay Investor Guide',
    tagline: 'site.tagline',
    locale: 'en',
    currencies: ['USD'],
    theme: 'guide',
    // The only brand that sells (plan §12.2). `products` is what mounts
    // /login and /members here and 404s them everywhere else.
    products: [GUIDE_ENTRY_SLUG, GUIDE_INSIDER_SLUG],
    nav: [
      { labelKey: 'nav.whatsInside', href: '/#inside' },
      { labelKey: 'nav.blog', href: '/blog' },
      { labelKey: 'nav.about', href: '/about' },
      { labelKey: 'nav.contact', href: '/contact' },
    ],
    footer: {
      columns: [
        {
          titleKey: 'footer.guide',
          items: [
            { labelKey: 'nav.whatsInside', href: '/#inside' },
            { labelKey: 'nav.blog', href: '/blog' },
            { labelKey: 'nav.refunds', href: '/refunds' },
          ],
        },
        {
          titleKey: 'footer.company',
          items: [
            { labelKey: 'nav.about', href: '/about' },
            { labelKey: 'nav.contact', href: '/contact' },
          ],
        },
      ],
      legal: legalNav(),
    },
    crm: { source: 'paraguayinvestorguide.com' },
    siblings: ['residency', 'investorpass'],
  },

  /**
   * The four consolidated brands (plan §1.11, decided F8). Nav and footer are
   * deliberately minimal — the content phases S10–S13 fill them. Everything a
   * later phase must not change (hosts, locale, theme, crm source, siblings)
   * is final here.
   */
  frontier: {
    key: 'frontier',
    hosts: ['paraguayfrontier.com', 'www.paraguayfrontier.com', 'frontier.localhost'],
    canonicalHost: 'paraguayfrontier.com',
    name: 'Paraguay Frontier',
    tagline: 'site.tagline',
    locale: 'en',
    currencies: ['USD'],
    theme: 'frontier',
    nav: minimalNav(),
    footer: minimalFooter(),
    crm: { source: 'paraguayfrontier.com' },
    siblings: ['residency', 'investorpass', 'guide'],
  },

  residenciaes: {
    key: 'residenciaes',
    hosts: ['residenciaparaguay.es', 'www.residenciaparaguay.es', 'residenciaes.localhost'],
    canonicalHost: 'residenciaparaguay.es',
    name: 'Residencia Paraguay',
    tagline: 'site.tagline',
    locale: 'es',
    currencies: ['EUR', 'PYG'],
    theme: 'residenciaes',
    nav: minimalNav(),
    footer: minimalFooter(),
    crm: { source: 'residenciaparaguay.es' },
    // No Guide upsell: the Guide is English-only (plan §1.11).
    siblings: ['residency', 'investorpass'],
  },

  residenciapt: {
    key: 'residenciapt',
    hosts: ['residencianoparaguay.com', 'www.residencianoparaguay.com', 'residenciapt.localhost'],
    canonicalHost: 'residencianoparaguay.com',
    name: 'Residência no Paraguai',
    tagline: 'site.tagline',
    locale: 'pt',
    currencies: ['BRL', 'USD', 'PYG'],
    theme: 'residenciapt',
    nav: minimalNav(),
    footer: minimalFooter(),
    crm: { source: 'residencianoparaguay.com' },
    siblings: ['residency', 'investorpass'],
  },

  flytta: {
    key: 'flytta',
    hosts: ['flyttatillparaguay.se', 'www.flyttatillparaguay.se', 'flytta.localhost'],
    canonicalHost: 'flyttatillparaguay.se',
    name: 'Flytta till Paraguay',
    tagline: 'site.tagline',
    locale: 'sv',
    currencies: ['SEK', 'USD'],
    theme: 'flytta',
    nav: minimalNav(),
    footer: minimalFooter(),
    crm: { source: 'flyttatillparaguay.se' },
    siblings: ['residency', 'guide'],
  },
};

export function isSiteKey(value: string | null | undefined): value is SiteKey {
  return !!value && (SITE_KEYS as readonly string[]).includes(value);
}

export function getSite(key: SiteKey): SiteConfig {
  return sites[key];
}

/**
 * Whether a brand sells anything. `/login` and `/members` exist only on the
 * brands that do; everywhere else the resolver 404s them (plan §5.4.5), so a
 * lead-gen brand never shows a member area it has no products for.
 */
export function siteSellsProducts(key: SiteKey): boolean {
  return (sites[key].products?.length ?? 0) > 0;
}

/** Brands that list a given product slug. */
export function sitesSelling(slug: string): SiteKey[] {
  return SITE_KEYS.filter((k) => sites[k].products?.includes(slug));
}

export const hubSite = (): SiteConfig => sites[HUB_SITE];

/** `https://paraguayresidency.com` — used for metadataBase and sitemaps. */
export function siteOrigin(key: SiteKey): string {
  const host = sites[key].canonicalHost;
  const proto = host.endsWith('.localhost') || host === 'localhost' ? 'http' : 'https';
  const port = process.env.NODE_ENV === 'production' ? '' : devPort();
  return proto === 'http' ? `http://${host}${port}` : `https://${host}`;
}

function devPort(): string {
  const p = process.env.PORT ?? '3000';
  return p === '80' ? '' : `:${p}`;
}

/** Host lookup used by middleware and tests. `host` may include a port. */
export function siteForHost(host: string | null | undefined): SiteConfig | undefined {
  if (!host) return undefined;
  const bare = host.toLowerCase().split(':')[0].trim();
  return Object.values(sites).find((s) => s.hosts.includes(bare));
}

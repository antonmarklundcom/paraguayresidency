/**
 * The site registry is the single source of truth for "which brand is this
 * request for". Adding a fourth domain = one entry here + one folder under
 * `src/app/sites/<key>/`. Never a second Next.js app (plan §1.1).
 */

export type SiteKey = 'residency' | 'investorpass' | 'guide';

export const SITE_KEYS: readonly SiteKey[] = ['residency', 'investorpass', 'guide'] as const;

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
  locale: 'en';
  theme: SiteKey;
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
    theme: 'guide',
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
};

export function isSiteKey(value: string | null | undefined): value is SiteKey {
  return !!value && (SITE_KEYS as readonly string[]).includes(value);
}

export function getSite(key: SiteKey): SiteConfig {
  return sites[key];
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

import type { ReactNode } from 'react';
import { Footer, JsonLd, Nav, WhatsAppFab } from '@/components';
import { t } from '@/i18n';
import { Analytics } from '@/lib/analytics';
import { WhatsAppClickTracker } from '@/components/WhatsAppClickTracker';
import { organizationJsonLd } from '@/lib/metadata';
import { getSite, type SiteKey } from '@/sites/registry';

/**
 * One shell for all three brands: theme attribute + nav + footer + the
 * sitewide Organization JSON-LD. Per-brand design lives in the theme CSS and
 * in the pages S3–S5 write, not in three copies of this file.
 */
export function SiteShell({ site, children }: { site: SiteKey; children: ReactNode }) {
  return (
    <div data-site={site} data-theme={site}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-fg)]"
      >
        {t(site, 'common.skipToContent')}
      </a>
      <Nav site={site} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer site={site} />
      <WhatsAppFab site={site} />
      <WhatsAppClickTracker site={site} />
      <JsonLd data={organizationJsonLd(site)} />
      {/* Env-gated: renders nothing unless NEXT_PUBLIC_PLAUSIBLE_ENABLED=true. track() calls need it mounted. */}
      <Analytics domain={getSite(site).analytics?.plausibleDomain ?? getSite(site).canonicalHost} />
    </div>
  );
}

import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { HTML_LANG } from '@/i18n/locales';
import { getSite, HUB_SITE, isSiteKey, siteForHost } from '@/sites/registry';
import { Analytics } from '@/lib/analytics';
import './globals.css';

/**
 * Root layout only owns <html>/<body>. The visible chrome (theme, nav,
 * footer) belongs to the per-site layouts under src/app/sites/<key>/.
 *
 * `lang` has to be resolved here, because `<html>` exists only in the root
 * layout while a brand's language is a property of the host (plan §1.3).
 * Reading the header makes the whole tree render per request — the documented
 * cost of one root layout serving four languages (`docs/platform.md`).
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const fromMiddleware = h.get('x-site');
  const site = isSiteKey(fromMiddleware)
    ? fromMiddleware
    : (siteForHost(h.get('x-forwarded-host') ?? h.get('host'))?.key ?? HUB_SITE);

  return (
    <html lang={HTML_LANG[getSite(site).locale]}>
      <body>
        <Analytics domain={getSite(site).analytics?.plausibleDomain ?? getSite(site).canonicalHost} />
        {children}
      </body>
    </html>
  );
}

import { headers } from 'next/headers';
import { HUB_SITE, isSiteKey, siteForHost, type SiteKey } from '@/sites/registry';

/**
 * For shared routes (API, /blocked) that are not nested under a per-site
 * folder. Page routes know their site statically and should not call this.
 */
export async function currentSite(): Promise<SiteKey> {
  const h = await headers();
  const fromMiddleware = h.get('x-site');
  if (isSiteKey(fromMiddleware)) return fromMiddleware;
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return siteForHost(host)?.key ?? HUB_SITE;
}

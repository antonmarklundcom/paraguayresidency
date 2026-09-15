import { currentSite } from '@/lib/current-site';
import { robotsText } from '@/lib/seo-files';

/**
 * Next only picks up `robots.ts` at the app root, so this cannot live under
 * `src/app/sites/<key>/` the way `sitemap.ts` does. It is a plain route
 * handler instead, resolving the brand from the request host (plan §2:
 * robots is per-domain).
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const site = await currentSite();
  return new Response(robotsText(site), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

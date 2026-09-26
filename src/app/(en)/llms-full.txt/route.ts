import { currentSite } from '@/lib/current-site';
import { llmsFullText } from '@/lib/llms';

/** Per-host `/llms-full.txt` (llmstxt.org), resolved like robots.txt — see that route. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const site = await currentSite();
  return new Response(llmsFullText(site), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}

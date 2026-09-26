import { currentSite } from '@/lib/current-site';
import { llmsText } from '@/lib/llms';

/** Per-host `/llms.txt` (llmstxt.org), resolved like robots.txt — see that route. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const site = await currentSite();
  return new Response(llmsText(site), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}

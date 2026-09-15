import { buildRss } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildRss('guide'), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

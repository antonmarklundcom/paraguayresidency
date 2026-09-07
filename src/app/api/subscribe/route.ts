import { NextResponse, type NextRequest } from 'next/server';
import { subscribe } from '@/lib/subscribers';
import { currentSite } from '@/lib/current-site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Newsletter signup for callers that are not the server action — an embedded
 * widget, or a form on a page that posts JSON (plan §5.2.5). The action in
 * `src/app/actions/lead.ts` is the path the shipped forms take.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const site = typeof body.site === 'string' ? body.site : await currentSite();

  const result = await subscribe(
    { site, email: body.email, name: body.name, source: body.source },
    { honeypot: body.website, timestamp: body.ts },
  );

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  return NextResponse.json({ ok: true, state: result.state });
}

import { NextResponse, type NextRequest } from 'next/server';
import { subscribe } from '@/lib/subscribers';
import { currentSite } from '@/lib/current-site';
import {
  clientIp,
  LIMITS,
  RATE_LIMIT_MESSAGE,
  subscribeLimit,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Newsletter signup for callers that are not the server action — an embedded
 * widget, or a form on a page that posts JSON (plan §5.2.5). The action in
 * `src/app/actions/lead.ts` is the path the shipped forms take.
 *
 * Both doors share `subscribeLimit`, so they share the buckets:
 * `LIMITS.subscribeEmail` per address and `LIMITS.subscribeIp` per IP answer
 * 429, and a pending address is mailed at most once an hour whichever door it
 * arrives at (plan §14.2.1, `docs/improvement-report.md` §1.7).
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const site = typeof body.site === 'string' ? body.site : await currentSite();
  const email = typeof body.email === 'string' ? body.email : '';

  const gate = subscribeLimit({ ip: clientIp(request.headers), email, site });
  if (gate === 'limited') {
    return NextResponse.json(
      { ok: false, error: 'rate-limited', message: RATE_LIMIT_MESSAGE },
      {
        status: 429,
        headers: { 'retry-after': String(Math.ceil(LIMITS.subscribeEmail.windowMs / 1000)) },
      },
    );
  }
  // Already mailed inside the hour. The address is pending and already has the
  // link; a second identical mail is the inbox-bombing this exists to stop. The
  // answer is the same one a first-time caller gets, because it is just as true.
  if (gate === 'already-sent') {
    return NextResponse.json({ ok: true, state: 'pending' });
  }

  const result = await subscribe(
    { site, email: body.email, name: body.name, source: body.source },
    { honeypot: body.website, timestamp: body.ts },
  );

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  return NextResponse.json({ ok: true, state: result.state });
}

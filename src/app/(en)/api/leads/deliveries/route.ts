import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { runLeadDeliveryQueue } from '@/lib/leads';
import { deliveryHealth } from '@/lib/lead-delivery';
import { clientIp, takeLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The scripted trigger for the lead retry queue (O24, item 1).
 *
 *   curl -X POST https://paraguayresidency.co.uk/api/leads/deliveries \
 *        -H "Authorization: Bearer $LEAD_QUEUE_SECRET"
 *
 * Call it from an hPanel cron job every 5 minutes (`docs/runbook.md`), or run
 * `npm run leads:retry`, which does the same. `?includeSkipped=1` also replays
 * leads that were skipped because the CRM or mail was not configured — run it
 * once right after setting those keys. Any host works; the queue is global.
 *
 * Without `LEAD_QUEUE_SECRET` the endpoint is closed (503): an open trigger
 * would let anyone make the app hammer the CRM.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.LEAD_QUEUE_SECRET ?? '';
  if (secret.length < 24) return false;
  const given = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!takeLimit('deliveryQueue', clientIp(req.headers)).ok) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }
  if ((process.env.LEAD_QUEUE_SECRET ?? '').length < 24) {
    return NextResponse.json({ error: 'LEAD_QUEUE_SECRET is not set (24+ characters)' }, { status: 503 });
  }
  if (!authorised(req)) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const result = await runLeadDeliveryQueue({
    includeSkipped: params.get('includeSkipped') === '1',
    limit: Number(params.get('limit')) || undefined,
    trigger: 'endpoint',
  });
  const health = await deliveryHealth();
  return NextResponse.json({ ...result, health }, { headers: { 'cache-control': 'no-store' } });
}

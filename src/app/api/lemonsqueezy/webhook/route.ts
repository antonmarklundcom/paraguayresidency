import { NextResponse, type NextRequest } from 'next/server';
import {
  lemonSqueezyEventId,
  lemonSqueezyWebhookConfigured,
  verifyLemonSqueezySignature,
  type LsWebhookBody,
} from '@/lib/lemonsqueezy';
import { finishWebhookEvent, recordWebhookEvent } from '@/lib/webhooks';
import { handleLemonSqueezyEvent } from '@/lib/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The Lemon Squeezy webhook (plan §5.4.6) — the sibling of the Stripe one, and
 * deliberately the same shape:
 *
 *  1. Read the RAW body. The signature covers the exact bytes sent.
 *  2. Verify `X-Signature` before parsing anything. A bad signature is 401 and
 *     nothing is stored.
 *  3. Insert `webhook_events` BEFORE doing any work. A duplicate delivery
 *     returns 200 and does nothing.
 *  4. Handle inline, then always answer 200 unless the fault is ours to retry.
 */
export async function POST(request: NextRequest) {
  if (!lemonSqueezyWebhookConfigured()) {
    console.error('[ls-webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set — rejecting');
    return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
  }

  const payload = await request.text();
  const verdict = verifyLemonSqueezySignature({
    payload,
    header: request.headers.get('x-signature'),
    secret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
  });
  if (verdict !== 'ok') {
    console.error('[ls-webhook] signature rejected:', verdict);
    return NextResponse.json({ ok: false, error: verdict }, { status: 401 });
  }

  let body: LsWebhookBody;
  try {
    body = JSON.parse(payload) as LsWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const eventId = lemonSqueezyEventId(body);
  const type = body.meta?.event_name ?? 'unknown';
  if (!eventId) {
    // Nothing to be idempotent on: log it and drop it rather than risk
    // processing the same event twice on a retry.
    console.error('[ls-webhook] delivery has no event name or resource id — ignoring');
    return NextResponse.json({ ok: true, ignored: 'no-event-id' });
  }

  const logged = await recordWebhookEvent({
    provider: 'lemonsqueezy',
    providerEventId: eventId,
    type,
    payload: body,
  });
  // Seen AND finished: a plain retry, so do nothing. Seen but never finished:
  // the previous attempt failed, and this retry is the second chance.
  if (logged.duplicate && logged.processed) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    const result = await handleLemonSqueezyEvent(body);
    await finishWebhookEvent(logged.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // A 500 makes Lemon Squeezy retry — right for a transient database fault,
    // and safe because the event row is already there to stop a double apply
    // only once it has been marked processed.
    console.error('[ls-webhook] handler failed', type, error);
    await finishWebhookEvent(logged.id, error);
    return NextResponse.json({ ok: false, error: 'handler-failed' }, { status: 500 });
  }
}

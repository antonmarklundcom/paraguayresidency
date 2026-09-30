import { NextResponse } from 'next/server';
import { pingDatabase } from '@/db';
import { currentSite } from '@/lib/current-site';
import { secretHealth } from '@/lib/signing';
import { emailMode } from '@/lib/email';
import { crmConfigured } from '@/lib/vendercrm';
import { deliveryHealth, type DeliveryHealth } from '@/lib/lead-delivery';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * `{site, host, db}` per plan §5.1.10, plus `secret` (O17) and `email`/`crm`
 * (O18, plan §14.2.3). This is the one URL that says whether a deploy is
 * actually working, so every degraded mode has to be visible here rather than
 * only in a log nobody reads. `docs/runbook.md` reads each field.
 *
 * `secret: "weak"` means `SESSION_SECRET` is missing or under 32 characters. In
 * production that is not a warning: every session, magic link, unsubscribe and
 * download token refuses to sign, so the member and admin areas are down until
 * it is set. This endpoint deliberately reports it WITHOUT throwing — it is the
 * thing you curl to find out.
 *
 * `email: "console"` in production means NOTHING IS BEING DELIVERED: no
 * confirmation mail, no receipt, no sign-in link, no lead notification. The
 * app keeps serving (plan §4.5 — a missing credential never blocks), which is
 * exactly why it has to be loud here.
 *
 * `crm: "off"` means VenderCRM is not configured for this host's brand. Leads are still stored and
 * still emailed; only the CRM push is skipped, and `leads.crm_status` stays
 * `pending` so a later retry is meaningful (plan §1.6).
 *
 * `leads` (O24, item 1) is the lead-delivery queue: when a delivery last
 * succeeded, how many failed in 24 h, how many gave up (`dead`) and the oldest
 * lead still undelivered. `backlog: true` — something has waited over an hour —
 * also sets `degraded`, because it means a person has not heard about a lead.
 * `queue: "legacy"` means migration 0002 has not run yet and the numbers come
 * from `leads.crm_status` alone. Counts and timestamps only, never a lead.
 */

const UNKNOWN_DELIVERY: DeliveryHealth = {
  queue: 'error',
  lastSuccessAt: null,
  failed24h: 0,
  dead: 0,
  oldestUndeliveredAt: null,
  backlog: false,
};

/**
 * This endpoint is public and unauthenticated, so the four aggregate queries
 * behind `leads` are cached for 15 s per process: a monitor polling every
 * minute sees fresh numbers, a script hammering it costs one query set.
 */
const HEALTH_CACHE_MS = 15_000;
let cachedDelivery: { at: number; value: DeliveryHealth } | null = null;

async function boundedDeliveryHealth(): Promise<DeliveryHealth> {
  if (cachedDelivery && Date.now() - cachedDelivery.at < HEALTH_CACHE_MS) return cachedDelivery.value;
  const timeout = new Promise<DeliveryHealth>((resolve) => setTimeout(() => resolve(UNKNOWN_DELIVERY), 2500));
  const value = await Promise.race([deliveryHealth().catch(() => UNKNOWN_DELIVERY), timeout]);
  cachedDelivery = { at: Date.now(), value };
  return value;
}
export async function GET() {
  const h = await headers();
  const [site, db] = await Promise.all([currentSite(), pingDatabase()]);
  const leads = db === 'ok' ? await boundedDeliveryHealth() : { ...UNKNOWN_DELIVERY, queue: 'none' as const };
  const email = emailMode();
  const production = process.env.NODE_ENV === 'production';
  // For the brand this request is for: its own VENDERCRM_API_KEY_<SITE>, else the shared key.
  const crm = crmConfigured(site) ? 'on' : 'off';

  // One boolean a monitor can alert on without knowing what any field means.
  const degraded =
    db !== 'ok' || secretHealth() !== 'ok' || (production && email === 'console') || leads.backlog;

  return NextResponse.json(
    {
      ok: true,
      degraded,
      site,
      host: h.get('x-forwarded-host') ?? h.get('host') ?? null,
      db,
      secret: secretHealth(),
      email,
      crm,
      leads,
      time: new Date().toISOString(),
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

import { NextResponse } from 'next/server';
import { pingDatabase } from '@/db';
import { currentSite } from '@/lib/current-site';
import { secretHealth } from '@/lib/signing';
import { emailMode } from '@/lib/email';
import { crmConfigured } from '@/lib/vendercrm';
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
 * `crm: "off"` means VenderCRM is not configured. Leads are still stored and
 * still emailed; only the CRM push is skipped, and `leads.crm_status` stays
 * `pending` so a later retry is meaningful (plan §1.6).
 */
export async function GET() {
  const h = await headers();
  const [site, db] = await Promise.all([currentSite(), pingDatabase()]);
  const email = emailMode();
  const production = process.env.NODE_ENV === 'production';
  const crm = crmConfigured() ? 'on' : 'off';

  // One boolean a monitor can alert on without knowing what any field means.
  const degraded = db !== 'ok' || secretHealth() !== 'ok' || (production && email === 'console');

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
      time: new Date().toISOString(),
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

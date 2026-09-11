import { NextResponse } from 'next/server';
import { pingDatabase } from '@/db';
import { currentSite } from '@/lib/current-site';
import { secretHealth } from '@/lib/signing';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * `{site, host, db}` per plan §5.1.10, plus `secret` since O17.
 *
 * `secret: "weak"` means `SESSION_SECRET` is missing or under 32 characters. In
 * production that is not a warning: every session, magic link, unsubscribe and
 * download token refuses to sign, so the member and admin areas are down until
 * it is set. This endpoint deliberately reports it WITHOUT throwing — it is the
 * thing you curl to find out.
 */
export async function GET() {
  const h = await headers();
  const [site, db] = await Promise.all([currentSite(), pingDatabase()]);
  return NextResponse.json(
    {
      ok: true,
      site,
      host: h.get('x-forwarded-host') ?? h.get('host') ?? null,
      db,
      secret: secretHealth(),
      time: new Date().toISOString(),
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

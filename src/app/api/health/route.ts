import { NextResponse } from 'next/server';
import { pingDatabase } from '@/db';
import { currentSite } from '@/lib/current-site';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** `{site, host, db}` per plan §5.1.10. Never fails when the DB is absent. */
export async function GET() {
  const h = await headers();
  const [site, db] = await Promise.all([currentSite(), pingDatabase()]);
  return NextResponse.json(
    {
      ok: true,
      site,
      host: h.get('x-forwarded-host') ?? h.get('host') ?? null,
      db,
      time: new Date().toISOString(),
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

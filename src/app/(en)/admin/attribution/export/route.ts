import { NextResponse } from 'next/server';
import { currentAdmin, requireRole } from '@/lib/auth';
import { attributionData, toCsv } from '@/lib/admin-queries';
import { ATTRIBUTION_CSV_COLUMNS, attributionCsvRow } from '@/lib/attribution-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Attribution CSV (O24, item 3): one row per lead of the last 30 days, with
 * first and last touch, landing page, article and A/B variants — and the lead
 * id to join on the leads export. No names, emails or numbers here. Guarded
 * like `/admin/leads/export`: a route handler is not protected by the layout.
 */
export async function GET() {
  try {
    requireRole(await currentAdmin(), ['admin']);
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const data = await attributionData();
  const csv = toCsv(data.leads.map(attributionCsvRow), ATTRIBUTION_CSV_COLUMNS);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="attribution-${stamp}.csv"`,
      'cache-control': 'no-store, private',
    },
  });
}

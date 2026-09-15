import { NextResponse, type NextRequest } from 'next/server';
import { currentAdmin, requireRole } from '@/lib/auth';
import {
  allLeadsForExport,
  LEAD_CSV_COLUMNS,
  parseLeadFilters,
  toCsv,
} from '@/lib/admin-queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CSV export (plan §5.2.7). Guarded exactly like the page it hangs off —
 * a route handler is not protected by the layout above it.
 */
export async function GET(request: NextRequest) {
  try {
    requireRole(await currentAdmin(), ['admin']);
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const filters = parseLeadFilters(Object.fromEntries(request.nextUrl.searchParams));
  const rows = await allLeadsForExport(filters);
  const csv = toCsv(rows as unknown as Record<string, unknown>[], LEAD_CSV_COLUMNS);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="leads-${stamp}.csv"`,
      'cache-control': 'no-store, private',
    },
  });
}

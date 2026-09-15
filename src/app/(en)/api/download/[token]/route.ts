import { createReadStream, existsSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { basename } from 'node:path';
import { NextResponse, type NextRequest } from 'next/server';
import { and, eq, lt, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { downloadTokens, products, purchases } from '@/db/schema';
import { downloadState, resolvePrivateFile } from '@/lib/download-policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Signed delivery of the paid guide (plan §5.2.4).
 *
 * Two traps this route exists to avoid: the file is read from `private/`, a
 * directory Next never serves, and the download counter is incremented with a
 * conditional UPDATE so two parallel requests cannot both slip past the limit.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!hasDatabase()) {
    return problem(503, 'The download service is not configured.');
  }

  const db = getDb();
  const [row] = await db
    .select({
      id: downloadTokens.id,
      expiresAt: downloadTokens.expiresAt,
      downloads: downloadTokens.downloads,
      maxDownloads: downloadTokens.maxDownloads,
      purchaseStatus: purchases.status,
      fileKey: products.fileKey,
      productName: products.name,
      version: products.version,
    })
    .from(downloadTokens)
    .innerJoin(purchases, eq(purchases.id, downloadTokens.purchaseId))
    .innerJoin(products, eq(products.id, purchases.productId))
    .where(eq(downloadTokens.token, token))
    .limit(1);

  const state = downloadState(row ?? null);
  if (state !== 'ok') {
    const messages: Record<Exclude<typeof state, 'ok'>, string> = {
      'not-found': 'That download link is not valid.',
      unpaid: 'That purchase has not been paid, or has been refunded.',
      expired: 'That download link has expired. Reply to your receipt and we will send a new one.',
      exhausted:
        'That download link has been used the maximum number of times. Reply to your receipt and we will send a new one.',
    };
    return problem(state === 'not-found' ? 404 : 410, messages[state]);
  }

  // Claim one download atomically. If another request got the last one between
  // the read above and this write, `affectedRows` is 0 and we refuse.
  const claim = await db
    .update(downloadTokens)
    .set({ downloads: sql`${downloadTokens.downloads} + 1` })
    .where(
      and(
        eq(downloadTokens.id, row!.id),
        lt(downloadTokens.downloads, downloadTokens.maxDownloads),
      ),
    );
  const affected = (claim as unknown as { affectedRows?: number }[])[0]?.affectedRows ?? 0;
  if (affected === 0) {
    return problem(410, 'That download link has been used the maximum number of times.');
  }

  // An object-store URL wins when one is configured (plan §5.2.4): the file
  // never has to sit on the app server at all.
  const bucketUrl = (process.env.GUIDE_FILE_URL ?? '').trim();
  if (bucketUrl) {
    return NextResponse.redirect(bucketUrl, { status: 302, headers: noStore() });
  }

  const path = resolvePrivateFile(row!.fileKey);
  if (!path || !existsSync(path)) {
    console.error('[download] file missing for key', row!.fileKey);
    return problem(503, 'The file is not available right now. We have been notified.');
  }

  const stat = statSync(path);
  const filename = downloadFilename(row!.productName, row!.version, basename(path));
  const stream = Readable.toWeb(createReadStream(path)) as unknown as ReadableStream<Uint8Array>;

  return new NextResponse(stream, {
    headers: {
      ...noStore(),
      'content-type': contentType(path),
      'content-length': String(stat.size),
      'content-disposition': `attachment; filename="${filename}"`,
      'x-content-type-options': 'nosniff',
    },
  });
}

function noStore(): Record<string, string> {
  return { 'cache-control': 'no-store, private' };
}

function problem(status: number, message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status, headers: noStore() });
}

function contentType(path: string): string {
  if (path.endsWith('.pdf')) return 'application/pdf';
  if (path.endsWith('.epub')) return 'application/epub+zip';
  if (path.endsWith('.zip')) return 'application/zip';
  return 'application/octet-stream';
}

function downloadFilename(productName: string, version: string, fallback: string): string {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const ext = fallback.includes('.') ? fallback.slice(fallback.lastIndexOf('.')) : '';
  return slug ? `${slug}-v${version.replace(/[^\w.-]/g, '')}${ext}` : fallback;
}

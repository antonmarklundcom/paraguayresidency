import { createReadStream, existsSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { NextResponse, type NextRequest } from 'next/server';
import { currentMember } from '@/lib/member-auth';
import { entitlementFor, hasTier } from '@/lib/entitlements';
import { resolvePrivateFile } from '@/lib/download-policy';
import { resourceBySlug } from '@/lib/member-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streams one member resource from `private/` (plan §6.9 `/members/resources`).
 *
 * Not under `src/app/api` — that tree is O9's and off-limits to Sonnet phases
 * (plan §4.7) — but the gate is the same one every member page uses:
 * `currentMember()` + `entitlementFor()` from `entitlements.ts`/`member-auth.ts`
 * (calling them is fine; only editing those two files is off-limits), and the
 * file resolution reuses `download-policy.ts`'s existing, already-audited
 * `resolvePrivateFile` rather than inventing a second path-safety check.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const user = await currentMember();
  if (!user) return problem(401, 'Sign in to download this file.');

  const resource = await resourceBySlug('guide', slug);
  if (!resource) return problem(404, 'That resource does not exist.');

  const entitlement = await entitlementFor(user);
  if (!hasTier(entitlement.tier, resource.minTier)) {
    return problem(403, 'This resource is part of a higher membership tier.');
  }

  const path = resolvePrivateFile(resource.fileKey);
  if (!path || !existsSync(path)) {
    console.error('[members/resources] file missing for key', resource.fileKey);
    return problem(503, 'The file is not available right now. We have been notified.');
  }

  const stat = statSync(path);
  const stream = Readable.toWeb(createReadStream(path)) as unknown as ReadableStream<Uint8Array>;

  return new NextResponse(stream, {
    headers: {
      'cache-control': 'no-store, private',
      'content-type': path.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
      'content-length': String(stat.size),
      'content-disposition': `attachment; filename="${resource.slug}.pdf"`,
      'x-content-type-options': 'nosniff',
    },
  });
}

function problem(status: number, message: string): NextResponse {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: { 'cache-control': 'no-store, private' } },
  );
}

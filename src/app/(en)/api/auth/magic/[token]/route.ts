import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { users } from '@/db/schema';
import { readMagicToken, signInMember } from '@/lib/member-auth';
import { siteOrigin, isSiteKey, siteSellsProducts, HUB_SITE } from '@/sites/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Redeem a sign-in link. On success the member cookie is set and the browser
 * lands on `/members`; on any failure it lands back on `/login` with a reason
 * the page can render, never with a stack trace or a 500.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const verdict = readMagicToken(decodeURIComponent(token ?? ''));

  if (!verdict.ok) {
    return NextResponse.redirect(`${siteOrigin(HUB_SITE)}/login?error=${verdict.reason}`, 303);
  }

  const site = isSiteKey(verdict.site) && siteSellsProducts(verdict.site) ? verdict.site : null;
  if (!site) {
    return NextResponse.redirect(`${siteOrigin(HUB_SITE)}/login?error=invalid`, 303);
  }
  const origin = siteOrigin(site);

  if (!hasDatabase()) {
    console.error('[member-auth] DATABASE_URL is not set — cannot sign anyone in');
    return NextResponse.redirect(`${origin}/login?error=invalid`, 303);
  }

  try {
    const [user] = await getDb()
      .select()
      .from(users)
      .where(eq(users.email, verdict.email))
      .limit(1);
    if (!user) return NextResponse.redirect(`${origin}/login?error=invalid`, 303);

    // Single use: a link issued before the last successful sign-in is spent.
    // Nothing has to be stored for this — `last_login_at` is the watermark.
    if (user.lastLoginAt && user.lastLoginAt.getTime() >= verdict.issuedAt) {
      return NextResponse.redirect(`${origin}/login?error=expired`, 303);
    }

    await signInMember(user.id, user.email, site);
    return NextResponse.redirect(`${origin}/members`, 303);
  } catch (error) {
    console.error('[member-auth] sign-in failed', error);
    return NextResponse.redirect(`${origin}/login?error=invalid`, 303);
  }
}

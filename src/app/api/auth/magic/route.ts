import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { users } from '@/db/schema';
import { issueMagicToken, magicLinkUrl } from '@/lib/member-auth';
import { checkFormGuard, isSilentDrop } from '@/lib/form-guard';
import { currentSite } from '@/lib/current-site';
import { magicLinkEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';
import { isSiteKey, siteSellsProducts } from '@/sites/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Request a sign-in link (plan §5.4.5).
 *
 * ALWAYS answers 200 with the same body, whether or not the address has an
 * account. Anything else turns this endpoint into a "does this person have a
 * membership" oracle.
 */
const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  site: z.string().optional(),
  ts: z.string().max(400).optional(),
  website: z.string().max(200).optional(),
});

/** In-memory fixed window. One Node process (stack skill), so this is correct. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string, now = Date.now()): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (attempts.size > 5000) attempts.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const OK = { ok: true as const, sent: true as const };

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  // Even a malformed body gets the neutral answer; only a missing/invalid
  // email is worth a 422, and that is not an account-existence signal.
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid-email' }, { status: 422 });
  }
  const body = parsed.data;

  const guard = checkFormGuard({ honeypot: body.website, timestamp: body.ts });
  if (isSilentDrop(guard)) return NextResponse.json(OK);

  const site = isSiteKey(body.site) ? body.site : await currentSite();
  if (!siteSellsProducts(site)) {
    return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`e:${body.email}`) || rateLimited(`i:${ip}`)) {
    // Still 200: a 429 tells a prober their guess is being counted.
    console.warn('[member-auth] magic link rate limited', ip);
    return NextResponse.json(OK);
  }

  if (!hasDatabase()) {
    console.error('[member-auth] DATABASE_URL is not set — cannot send a sign-in link');
    return NextResponse.json(OK);
  }

  try {
    const [user] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    // No account: nothing is sent, and the caller cannot tell.
    if (user) {
      const token = issueMagicToken(body.email, site);
      const outcome = await sendEmail({
        to: body.email,
        ...magicLinkEmail({ site, url: magicLinkUrl(token, site) }),
      });
      if (!outcome.ok) console.error('[member-auth] sign-in email failed', outcome.error);
    }
  } catch (error) {
    console.error('[member-auth] magic link request failed', error);
  }

  return NextResponse.json(OK);
}

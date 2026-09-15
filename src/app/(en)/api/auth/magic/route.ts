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
import { clientIp, takeBoth } from '@/lib/rate-limit';

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

/**
 * The limits moved to `src/lib/rate-limit.ts` in O18. The local map this route
 * used to keep had two faults, both from `docs/improvement-report.md` §1.7:
 *
 *  - `if (attempts.size > 5000) attempts.clear()` — spraying 5000 addresses
 *    wiped EVERY limiter in the process, this one included. The shared limiter
 *    evicts per key and lazily, and has no global clear at all.
 *  - `rateLimited(email) || rateLimited(ip)` short-circuited, so once an
 *    address was over its limit the IP stopped being counted. `takeBoth` spends
 *    both, always.
 */
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

  const ip = clientIp(request.headers);
  if (!takeBoth('magicLink', [`e:${body.email}`, `i:${ip}`]).ok) {
    // Still 200, and still `sent: true`: a 429 here tells a prober that this
    // address is the one being counted, which is the same account-existence
    // oracle the neutral answer above exists to close.
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

import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, hasDatabase } from '@/db';
import { subscribers } from '@/db/schema';
import { SITE_KEYS, type SiteKey } from '@/sites/registry';
import { randomToken, unpack } from './signing';
import { confirmUrl, sendEmail, unsubscribeUrl } from './email';
import { subscribeConfirmEmail } from './email-templates';
import { checkFormGuard, isSilentDrop } from './form-guard';

/** Double opt-in newsletter (plan §5.2.5). */

export const subscribeInputSchema = z.object({
  site: z.enum(SITE_KEYS as unknown as [string, ...string[]]),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(255),
  name: z.string().trim().max(160).optional(),
  source: z.string().trim().max(120).optional(),
});

export type SubscribeResult =
  | { ok: true; state: 'pending' | 'already-confirmed' | 'dropped' }
  | { ok: false; error: string };

export async function subscribe(
  raw: unknown,
  options: { honeypot?: unknown; timestamp?: unknown; now?: Date } = {},
): Promise<SubscribeResult> {
  const now = options.now ?? new Date();
  const guard = checkFormGuard(
    { honeypot: options.honeypot, timestamp: options.timestamp },
    now.getTime(),
  );
  if (isSilentDrop(guard)) return { ok: true, state: 'dropped' };
  if (guard !== 'ok') return { ok: false, error: 'This form has expired. Please reload the page.' };

  const parsed = subscribeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }
  const { site, email, name, source } = parsed.data;

  if (!hasDatabase()) {
    console.error('[subscribers] DATABASE_URL is not set — subscription not stored');
    return { ok: false, error: 'Subscriptions are temporarily unavailable. Please try again later.' };
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.email, email), eq(subscribers.site, site as SiteKey)))
    .limit(1);

  // Re-confirming an active subscriber would only invite abuse (anyone could
  // spam a stranger's inbox with confirmation mail), so it is a silent no-op.
  if (existing?.status === 'confirmed') return { ok: true, state: 'already-confirmed' };

  const token = randomToken(24);
  await db
    .insert(subscribers)
    .values({
      site: site as SiteKey,
      email,
      name: name ?? null,
      source: source ?? null,
      status: 'pending',
      confirmToken: token,
    })
    .onDuplicateKeyUpdate({
      set: {
        name: sql`values(name)`,
        source: sql`values(source)`,
        status: sql`'pending'`,
        confirmToken: sql`values(confirm_token)`,
      },
    });

  const outcome = await sendEmail({
    to: email,
    ...subscribeConfirmEmail({
      site: site as SiteKey,
      confirmUrl: confirmUrl(site as SiteKey, token),
      unsubscribeUrl: unsubscribeUrl(site as SiteKey, email),
    }),
  });
  if (!outcome.ok) console.error('[subscribers] confirmation email failed for', email, outcome.error);

  return { ok: true, state: 'pending' };
}

export type ConfirmResult = 'confirmed' | 'already-confirmed' | 'unknown-token';

export async function confirmSubscription(token: string | null | undefined): Promise<ConfirmResult> {
  if (!token || !hasDatabase()) return 'unknown-token';
  const db = getDb();
  const [row] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.confirmToken, token))
    .limit(1);
  if (!row) return 'unknown-token';
  if (row.status === 'confirmed') return 'already-confirmed';

  await db
    .update(subscribers)
    .set({ status: 'confirmed', confirmedAt: new Date() })
    .where(eq(subscribers.id, row.id));
  return 'confirmed';
}

export type UnsubscribeResult = 'unsubscribed' | 'not-found' | 'bad-link';

/**
 * The unsubscribe link carries a signed address rather than a stored token, so
 * it works from any email we have ever sent — including a purchase receipt for
 * an address that never joined the list.
 *
 * It removes the address from EVERY brand's list, not just the one that sent
 * the mail. Someone clicking "unsubscribe" means it; making them do it three
 * times because we run three domains would be a dark pattern. The copy on
 * `/unsubscribe` says so.
 */
export async function unsubscribe(packed: string | null | undefined): Promise<UnsubscribeResult> {
  const email = packed ? unpack(packed, 'unsubscribe') : null;
  if (!email) return 'bad-link';
  if (!hasDatabase()) return 'not-found';

  const result = await getDb()
    .update(subscribers)
    .set({ status: 'unsubscribed' })
    .where(eq(subscribers.email, email));
  const affected = (result as unknown as { affectedRows?: number }[])[0]?.affectedRows ?? 0;
  return affected > 0 ? 'unsubscribed' : 'not-found';
}

export { unsubscribeUrl };

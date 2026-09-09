import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { providerCustomers } from '@/db/schema';
import { lemonSqueezyConfigured } from './lemonsqueezy';

const API = 'https://api.lemonsqueezy.com/v1';

/**
 * The Lemon Squeezy hosted "manage your subscription" URL for one member
 * (plan §6.9 `/account`). Neither `member-admin.ts` nor `lemonsqueezy.ts`
 * built this — LS webhooks never needed it, only the account page does — and
 * `lemonsqueezy.ts` is off-limits to edit (plan §4.7), so this is a small new
 * file rather than an addition to that one. Read-only: one `GET` against LS's
 * customer resource, degrading to `null` exactly like the rest of the
 * platform degrades when a provider is unconfigured (plan §4.5) — the account
 * page simply omits the link.
 */
export async function lemonSqueezyPortalUrl(userId: number): Promise<string | null> {
  if (!hasDatabase() || !lemonSqueezyConfigured()) return null;

  const [row] = await getDb()
    .select({ providerCustomerId: providerCustomers.providerCustomerId })
    .from(providerCustomers)
    .where(and(eq(providerCustomers.userId, userId), eq(providerCustomers.provider, 'lemonsqueezy')))
    .limit(1);
  if (!row) return null;

  try {
    const response = await fetch(`${API}/customers/${encodeURIComponent(row.providerCustomerId)}`, {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const json = (await response.json().catch(() => null)) as {
      data?: { attributes?: { urls?: { customer_portal?: string } } };
    } | null;
    return json?.data?.attributes?.urls?.customer_portal ?? null;
  } catch (error) {
    console.error('[subscription-portal] could not reach Lemon Squeezy', error);
    return null;
  }
}

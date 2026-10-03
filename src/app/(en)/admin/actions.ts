'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { factsVerification } from '@/db/schema';
import { currentAdmin, isKnownAdminDevice, login, logout, rememberAdminDevice, requireRole } from '@/lib/auth';
import { retryLeadDelivery, runLeadDeliveryQueue } from '@/lib/leads';
import { resendDownload } from '@/lib/purchases';
import { grantTierUntil } from '@/lib/member-admin';
import { adminLoginGate, adminLoginSucceeded, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit';
import { factKeys } from '@content/shared/facts';

/**
 * Every admin mutation re-checks the role on the server (stack skill §2).
 * A hidden button is UX; this is the actual guard.
 */
async function requireAdmin() {
  const admin = await currentAdmin();
  requireRole(admin, ['admin']);
  return admin;
}

export interface LoginState {
  error?: string;
}

/**
 * The one password form in the whole app, so the one place bcrypt can be made
 * to burn CPU on demand (`docs/improvement-report.md` §1.7). Limited by
 * `adminLoginGate` (O26 bug 4): 5 per 15 minutes per (email, IP) pair, 20 per
 * IP, and a 30-per-hour per-email backstop that a browser which has signed in
 * to that account before is exempt from — so a stranger spraying the admin's
 * address cannot lock the admin out, and a botnet still cannot buy unlimited
 * guesses at one account.
 *
 * Two details that are deliberate:
 *  - the ~250 ms delay is FIXED, not a backoff. A backoff is a timing oracle:
 *    it tells the caller which guesses were "closer". A constant pause costs a
 *    script 250 ms per try and costs the admin who mistyped their password
 *    a quarter of a second they will not notice.
 *  - a successful login forgets the pair and IP counters, so the person who
 *    mistyped twice this morning is not three attempts from a lockout this
 *    afternoon, and marks this browser as a known device for the account.
 */
const LOGIN_FAILURE_DELAY_MS = 250;

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const ip = clientIp(await headers());

  const limit = adminLoginGate({ ip, email, knownDevice: await isKnownAdminDevice(email) });
  if (!limit.ok) {
    await pause(LOGIN_FAILURE_DELAY_MS);
    return { error: RATE_LIMIT_MESSAGE };
  }

  const result = await login(email, String(form.get('password') ?? ''));
  if (!result.ok) {
    await pause(LOGIN_FAILURE_DELAY_MS);
    return { error: result.error };
  }

  adminLoginSucceeded({ ip, email });
  await rememberAdminDevice(email);
  redirect('/admin/leads');
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect('/admin/login');
}

export interface ActionState {
  message?: string;
  error?: string;
}

export async function retryLeadAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = Number(form.get('leadId'));
    if (!Number.isInteger(id)) return { error: 'Bad lead id' };
    const outcome = await retryLeadDelivery(id);
    revalidatePath('/admin/leads');
    return { message: `CRM push for lead ${id}: ${outcome.status}` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Retry failed' };
  }
}

/**
 * One pass of the lead delivery queue (O24, item 1) — the same pass the cron
 * endpoint runs. `includeSkipped` replays leads that were skipped because the
 * CRM or mail was not configured yet.
 */
export async function runDeliveryQueueAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const result = await runLeadDeliveryQueue({
      includeSkipped: form.get('includeSkipped') === '1',
      trigger: 'admin',
    });
    revalidatePath('/admin/leads');
    return {
      message:
        result.mode === 'none'
          ? 'No database.'
          : `${result.attempted} delivery attempt(s)${result.mode === 'legacy' ? ' (CRM only — migration 0002 not applied yet)' : ''}.`,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Queue run failed' };
  }
}

export async function resendDownloadAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = Number(form.get('purchaseId'));
    if (!Number.isInteger(id)) return { error: 'Bad purchase id' };
    const result = await resendDownload(id);
    revalidatePath('/admin/purchases');
    return result.ok
      ? { message: `A fresh download link was emailed for purchase ${id}.` }
      : { error: result.error ?? 'Could not resend' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Resend failed' };
  }
}

/**
 * Marks a fact verified (plan §5.2.7). This writes the mirror table only —
 * `content/shared/facts.ts` stays the source of the wording, so the hedged
 * copy is replaced by a deliberate edit in a PR, never by a click.
 */
export async function verifyFactAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const key = String(form.get('key') ?? '');
    if (!(factKeys as readonly string[]).includes(key)) return { error: 'Unknown fact key' };
    if (!hasDatabase()) return { error: 'DATABASE_URL is not set' };

    const clearing = String(form.get('clear') ?? '') === '1';
    const note = String(form.get('note') ?? '').trim() || null;

    await getDb()
      .update(factsVerification)
      .set(
        clearing
          ? { verifiedBy: null, verifiedOn: null, note }
          : { verifiedBy: admin.email ?? 'admin', verifiedOn: new Date(), note },
      )
      .where(eq(factsVerification.key, key));

    revalidatePath('/admin/facts');
    return { message: clearing ? `Cleared verification for ${key}.` : `Marked ${key} verified.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update the fact' };
  }
}

/**
 * Support action (plan §5.4.9): grant a member a tier until a date — a refund
 * gone wrong, a processor outage, a goodwill extension.
 *
 * Since O17 (plan §14.1.5) it writes a REAL row — a zero-amount `purchases`
 * row for `entry`, a `subscriptions` row for `insider` — and then refreshes the
 * cache from those rows like any webhook would, so `users.tier` and the
 * entitlement rows still agree afterwards; nothing here overrides the cache by
 * hand. The `admin_grant_` provider id on the row is what marks it as ours, and
 * the `admin.grant_tier` audit entry `grantTierUntil` writes is how a grant is
 * told apart from a purchase later.
 */
export async function grantTierAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const userId = Number(form.get('userId'));
    const tier = String(form.get('tier') ?? '');
    const until = String(form.get('until') ?? '').trim();
    if (!Number.isInteger(userId)) return { error: 'Bad member id' };

    const result = await grantTierUntil({
      userId,
      tier,
      until: until || null,
      byEmail: admin.email ?? 'unknown admin',
    });
    revalidatePath('/admin/members');
    return result.ok ? { message: result.message } : { error: result.error };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Grant failed' };
  }
}

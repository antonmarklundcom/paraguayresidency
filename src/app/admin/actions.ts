'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { factsVerification } from '@/db/schema';
import { currentAdmin, login, logout, requireRole } from '@/lib/auth';
import { retryLeadDelivery } from '@/lib/leads';
import { resendDownload } from '@/lib/orders';
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

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const result = await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''));
  if (!result.ok) return { error: result.error };
  redirect('/admin/leads');
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

export async function resendDownloadAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = Number(form.get('orderId'));
    if (!Number.isInteger(id)) return { error: 'Bad order id' };
    const result = await resendDownload(id);
    revalidatePath('/admin/orders');
    return result.ok
      ? { message: `A fresh download link was emailed for order ${id}.` }
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

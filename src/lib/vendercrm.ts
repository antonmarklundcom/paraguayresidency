import 'server-only';
import type { SiteKey } from '@/sites/registry';
import { idempotencyKey } from './signing';

/**
 * VenderCRM lead push (`vendercrm-lead-capture` skill).
 *
 * The two rules that shape this file:
 *  - The API key is server-side only. `VENDERCRM_API_KEY` has no
 *    `NEXT_PUBLIC_` prefix and this module is `server-only`.
 *  - It never throws and never blocks the visitor. The local `leads` row is
 *    the source of truth (plan §1.6); a CRM outage becomes a `crm_status` of
 *    `failed` and a row the admin can retry, never a failed form.
 */

export interface CrmLead {
  /** Required by the CRM — it is the contact identity. */
  phone: string;
  name?: string | null;
  email?: string | null;
  message?: string | null;
  /** Per-site source tag from the registry (`crm.source`). */
  source?: string | null;
  page_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  /** Anything else worth keeping on the CRM timeline. */
  fields?: Record<string, string | number | boolean | null | undefined>;
  /**
   * One key per submission, stable across retries of that submission (the
   * CRM drops a reused key as a duplicate). `leads.ts` derives it from the
   * lead row; without one, a phone + hour hash is the fallback.
   */
  idempotencyKey?: string;
}

export type CrmOutcome =
  | { status: 'sent'; httpStatus: number; body: unknown }
  | { status: 'failed'; httpStatus: number; error: string }
  | { status: 'skipped'; reason: 'not-configured' | 'no-phone' };

/**
 * VenderCRM issues one key per site, and the key decides which business the
 * lead lands in. `VENDERCRM_API_KEY_<SITE>` (e.g. `VENDERCRM_API_KEY_RESIDENCIAES`)
 * routes one brand to its own business; brands without one share
 * `VENDERCRM_API_KEY`.
 */
export function crmApiKey(site?: SiteKey | string | null): string | undefined {
  const own = site ? process.env[`VENDERCRM_API_KEY_${site.toUpperCase()}`] : undefined;
  return own || process.env.VENDERCRM_API_KEY || undefined;
}

export function crmConfigured(site?: SiteKey | string | null): boolean {
  return Boolean(process.env.VENDERCRM_API_URL && crmApiKey(site));
}

/**
 * Builds the wire payload: empty strings are dropped rather than sent, because
 * the CRM rejects `email: ""` with a 422 (skill, "Before writing code").
 * Never sends pipeline/stage/owner/tag — routing lives on the CRM site record.
 */
export function buildCrmPayload(lead: CrmLead, now = new Date()): Record<string, unknown> {
  const { idempotencyKey: key, ...rest } = lead;
  const base: Record<string, unknown> = {
    ...rest,
    idempotency_key: key || idempotencyKey(lead.phone, now),
  };
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'fields') {
      const fields = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          ([, v]) => v !== undefined && v !== null && v !== '',
        ),
      );
      if (Object.keys(fields).length) out.fields = fields;
      continue;
    }
    out[key] = value;
  }
  return out;
}

export async function sendToVenderCrm(lead: CrmLead, site?: SiteKey | string | null): Promise<CrmOutcome> {
  const apiKey = crmApiKey(site);
  if (!process.env.VENDERCRM_API_URL || !apiKey) return { status: 'skipped', reason: 'not-configured' };
  if (!lead.phone || lead.phone.trim().length < 6) return { status: 'skipped', reason: 'no-phone' };

  const url = `${process.env.VENDERCRM_API_URL!.replace(/\/+$/, '')}/api/v1/leads`;
  const payload = buildCrmPayload({ ...lead, phone: lead.phone.trim() });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    const text = await response.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* keep the raw text — a non-JSON body is itself the diagnostic */
    }

    // 200 is an idempotency replay: that is the retry working, not a failure.
    if (!response.ok) {
      console.error('[vendercrm] lead rejected', response.status, text.slice(0, 500));
      return { status: 'failed', httpStatus: response.status, error: text.slice(0, 500) };
    }
    return { status: 'sent', httpStatus: response.status, body };
  } catch (error) {
    console.error('[vendercrm] unreachable', error);
    return {
      status: 'failed',
      httpStatus: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

import 'server-only';
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
}

export type CrmOutcome =
  | { status: 'sent'; httpStatus: number; body: unknown }
  | { status: 'failed'; httpStatus: number; error: string }
  | { status: 'skipped'; reason: 'not-configured' | 'no-phone' };

export function crmConfigured(): boolean {
  return Boolean(process.env.VENDERCRM_API_URL && process.env.VENDERCRM_API_KEY);
}

/**
 * Builds the wire payload: empty strings are dropped rather than sent, because
 * the CRM rejects `email: ""` with a 422 (skill, "Before writing code").
 * Never sends pipeline/stage/owner/tag — routing lives on the CRM site record.
 */
export function buildCrmPayload(lead: CrmLead, now = new Date()): Record<string, unknown> {
  const base: Record<string, unknown> = {
    ...lead,
    idempotency_key: idempotencyKey(lead.phone, now),
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

export async function sendToVenderCrm(lead: CrmLead): Promise<CrmOutcome> {
  if (!crmConfigured()) return { status: 'skipped', reason: 'not-configured' };
  if (!lead.phone || lead.phone.trim().length < 6) return { status: 'skipped', reason: 'no-phone' };

  const url = `${process.env.VENDERCRM_API_URL!.replace(/\/+$/, '')}/api/v1/leads`;
  const payload = buildCrmPayload({ ...lead, phone: lead.phone.trim() });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.VENDERCRM_API_KEY!,
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

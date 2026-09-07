import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { leadEvents, leads, type Lead } from '@/db/schema';
import { getSite, type SiteKey } from '@/sites/registry';
import { countryName } from './countries';
import { describeQuizAnswers, parseLeadInput, type LeadInput } from './lead-schema';
import { sendToVenderCrm, type CrmOutcome } from './vendercrm';
import { leadAutoReply, leadNotification } from './email-templates';
import { notifyTo, sendEmail, unsubscribeUrl } from './email';
import { checkFormGuard, isSilentDrop, type GuardVerdict } from './form-guard';

/**
 * The single path every form on every brand takes (plan §5.2.1).
 *
 * Order matters and is the whole point: the local row is written first and is
 * the source of truth. The CRM push and the two emails are fire-and-forget —
 * their outcome is recorded on the row and in `lead_events`, and a failure in
 * either is never allowed to fail the visitor's submission (plan §1.6).
 */

export interface CreateLeadOptions {
  /** Attribution cookie value (`vc_attr`) if the request had one. */
  attribution?: Record<string, string>;
  honeypot?: unknown;
  timestamp?: unknown;
  /** Injected in tests; production waits for delivery inside the request. */
  now?: Date;
}

export type CreateLeadResult =
  | { ok: true; leadId: number | null; dropped?: 'honeypot'; stored: boolean }
  | { ok: false; errors: Record<string, string>; guard?: GuardVerdict };

const GUARD_MESSAGES: Record<Exclude<GuardVerdict, 'ok' | 'honeypot'>, string> = {
  'too-fast': 'That was submitted a little too quickly. Please try again.',
  stale: 'This form has been open for a while. Please reload the page and resend.',
  'bad-token': 'This form has expired. Please reload the page and resend.',
};

export async function createLead(
  raw: unknown,
  options: CreateLeadOptions = {},
): Promise<CreateLeadResult> {
  const now = options.now ?? new Date();

  const guard = checkFormGuard(
    { honeypot: options.honeypot, timestamp: options.timestamp },
    now.getTime(),
  );
  // A bot sees the same success state a person sees; nothing is stored or sent.
  if (isSilentDrop(guard)) return { ok: true, leadId: null, dropped: 'honeypot', stored: false };
  if (guard !== 'ok') {
    return { ok: false, errors: { form: GUARD_MESSAGES[guard] }, guard };
  }

  const parsed = parseLeadInput(raw);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  const input = parsed.data;

  if (!hasDatabase()) {
    // No DATABASE_URL (local dev, a preview build): the submission must still
    // reach a human, so the delivery side runs and the failure is loud in the
    // log rather than silent on screen.
    console.error('[leads] DATABASE_URL is not set — lead not stored, delivering anyway');
    await deliverLead(null, input, options.attribution ?? {}, now);
    return { ok: true, leadId: null, stored: false };
  }

  const db = getDb();
  const [result] = await db.insert(leads).values({
    site: input.site as SiteKey,
    kind: input.kind,
    name: input.name ?? null,
    email: input.email,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    country: input.country ?? null,
    nationality: input.nationality ?? null,
    message: buildMessage(input),
    quizAnswers: input.quizAnswers ?? null,
    quizResult: input.quizResult ?? null,
    pagePath: input.pagePath ?? null,
    utm: { ...(input.utm ?? {}), ...(options.attribution ?? {}) },
    crmStatus: 'pending',
  });
  const leadId = Number(result.insertId);

  await recordEvent(leadId, 'created', { kind: input.kind, site: input.site });
  await deliverLead(leadId, input, options.attribution ?? {}, now);

  return { ok: true, leadId, stored: true };
}

/**
 * The investor-inquiry extras (§5.2.2) live on the message rather than in new
 * columns: O1 froze the schema and a Sonnet phase must never need a migration
 * to add a field to a form.
 */
function buildMessage(input: LeadInput): string | null {
  const extras: string[] = [];
  if (input.investmentRange) extras.push(`Investment range: ${input.investmentRange}`);
  if (input.investmentRoute) extras.push(`Preferred route: ${input.investmentRoute}`);
  const answers = describeQuizAnswers(input.quizAnswers);
  if (answers) extras.push(`Route Finder answers: ${answers}`);
  const parts = [input.message, extras.join('\n')].filter(Boolean);
  return parts.length ? parts.join('\n\n') : null;
}

async function recordEvent(
  leadId: number | null,
  type: string,
  payload: unknown,
): Promise<void> {
  if (leadId === null || !hasDatabase()) return;
  try {
    await getDb().insert(leadEvents).values({ leadId, type, payload: payload as object });
  } catch (error) {
    console.error('[leads] could not record event', type, error);
  }
}

/**
 * CRM + email. Both are awaited (a serverless request can be frozen the moment
 * the response is returned, so a detached promise is not reliably delivered),
 * but neither can throw out of here.
 */
async function deliverLead(
  leadId: number | null,
  input: LeadInput,
  attribution: Record<string, string>,
  now: Date,
): Promise<void> {
  await Promise.allSettled([
    pushToCrm(leadId, input, attribution, now),
    notifyLead(leadId, input),
  ]);
}

async function pushToCrm(
  leadId: number | null,
  input: LeadInput,
  attribution: Record<string, string>,
  now: Date,
): Promise<CrmOutcome> {
  const site = getSite(input.site as SiteKey);
  const phone = input.phone ?? input.whatsapp ?? '';

  let outcome: CrmOutcome;
  try {
    outcome = await sendToVenderCrm({
      phone,
      name: input.name,
      email: input.email,
      message: buildMessage(input),
      source: site.crm.source,
      page_url: input.pagePath ? `https://${site.canonicalHost}${input.pagePath}` : undefined,
      referrer: attribution.referrer,
      utm_source: input.utm?.utm_source ?? attribution.utm_source,
      utm_medium: input.utm?.utm_medium ?? attribution.utm_medium,
      utm_campaign: input.utm?.utm_campaign ?? attribution.utm_campaign,
      utm_term: input.utm?.utm_term ?? attribution.utm_term,
      utm_content: input.utm?.utm_content ?? attribution.utm_content,
      gclid: input.utm?.gclid ?? attribution.gclid,
      fbclid: input.utm?.fbclid ?? attribution.fbclid,
      fields: {
        kind: input.kind,
        site: input.site,
        whatsapp: input.whatsapp,
        country: countryName(input.country) ?? input.country,
        nationality: countryName(input.nationality) ?? input.nationality,
        investment_range: input.investmentRange,
        investment_route: input.investmentRoute,
        route_finder_result: input.quizResult,
      },
    });
  } catch (error) {
    // sendToVenderCrm already swallows its own failures; this is belt and braces.
    outcome = {
      status: 'failed',
      httpStatus: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await setCrmStatus(leadId, outcome, now);
  await recordEvent(leadId, `crm.${outcome.status}`, outcome);
  return outcome;
}

async function setCrmStatus(
  leadId: number | null,
  outcome: CrmOutcome,
  now: Date,
): Promise<void> {
  if (leadId === null || !hasDatabase()) return;
  // "skipped" stays `pending`: nothing was wrong with the lead, the CRM simply
  // is not configured yet (or the lead has no phone), so a later retry is
  // meaningful rather than a re-run of a known failure.
  const crmStatus = outcome.status === 'sent' ? 'sent' : outcome.status === 'failed' ? 'failed' : 'pending';
  try {
    await getDb()
      .update(leads)
      .set({ crmStatus, crmResponse: { ...outcome, at: now.toISOString() } })
      .where(eq(leads.id, leadId));
  } catch (error) {
    console.error('[leads] could not record CRM status', error);
  }
}

/** Internal notification + auto-reply. Logged, never fatal. */
async function notifyLead(leadId: number | null, input: LeadInput): Promise<void> {
  const site = input.site as SiteKey;
  const to = notifyTo();

  const results = await Promise.allSettled([
    to
      ? sendEmail({
          to,
          replyTo: input.email,
          ...leadNotification({
            site,
            kind: input.kind,
            leadId: leadId ?? 'unstored',
            name: input.name,
            email: input.email,
            phone: input.phone,
            whatsapp: input.whatsapp,
            country: countryName(input.country) ?? input.country,
            nationality: countryName(input.nationality) ?? input.nationality,
            message: buildMessage(input),
            quizResult: input.quizResult,
            pagePath: input.pagePath,
            unsubscribeUrl: unsubscribeUrl(site, to),
          }),
        })
      : Promise.resolve({ ok: false, mode: 'console' as const, error: 'EMAIL_NOTIFY_TO not set' }),
    sendEmail({
      to: input.email,
      ...leadAutoReply({ site, name: input.name, unsubscribeUrl: unsubscribeUrl(site, input.email) }),
    }),
  ]);

  const summary = results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, error: String(r.reason) }));
  await recordEvent(leadId, 'email.sent', { notification: summary[0], autoReply: summary[1] });
}

/**
 * Admin retry (plan §5.2.1). Re-runs delivery for one stored lead; the CRM's
 * idempotency key means a retry inside the same hour cannot create a duplicate
 * contact.
 */
export async function retryLeadDelivery(leadId: number): Promise<CrmOutcome> {
  if (!hasDatabase()) throw new Error('DATABASE_URL is not set');
  const db = getDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  const input: LeadInput = {
    site: lead.site,
    kind: lead.kind,
    name: lead.name ?? undefined,
    email: lead.email,
    phone: lead.phone ?? undefined,
    whatsapp: lead.whatsapp ?? undefined,
    country: lead.country ?? undefined,
    nationality: lead.nationality ?? undefined,
    message: lead.message ?? undefined,
    quizResult: lead.quizResult ?? undefined,
    quizAnswers: (lead.quizAnswers as Record<string, string>) ?? undefined,
    pagePath: lead.pagePath ?? undefined,
    utm: (lead.utm as Record<string, string>) ?? undefined,
  };

  await recordEvent(leadId, 'crm.retry', { by: 'admin' });
  return pushToCrm(leadId, input, (lead.utm as Record<string, string>) ?? {}, new Date());
}

export type { Lead };

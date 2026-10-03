import 'server-only';
import { and, desc, eq, gte } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import { cronRuns, leadEvents, leads, type Lead } from '@/db/schema';
import { getSite, type SiteKey } from '@/sites/registry';
import { countryName } from './countries';
import { describeQuizAnswers, parseLeadInput, type LeadInput } from './lead-schema';
import { sendToVenderCrm, type CrmOutcome } from './vendercrm';
import { leadIdempotencyKey } from './signing';
import { leadAutoReply, leadNotification } from './email-templates';
import { notifyTo, sendEmail, unsubscribeUrl } from './email';
import { checkFormGuard, isSilentDrop, type GuardVerdict } from './form-guard';
import { dedupeKey, firstTouch, hasAttribution, type Attribution, type StoredAttribution } from './attribution';
import { isDuplicateKey } from './webhooks';
import { dbFeatures } from './db-features';
import {
  crmChannelOutcome,
  dueDeliveries,
  emailChannelOutcome,
  openDeliveries,
  recordDelivery,
  type DeliveryChannel,
} from './lead-delivery';
import { log } from './log';

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
  attribution?: Attribution;
  /** The visitor's `Referer`, for a first touch the cookie did not record. */
  referrer?: string | null;
  honeypot?: unknown;
  timestamp?: unknown;
  /** Injected in tests; production waits for delivery inside the request. */
  now?: Date;
  /**
   * What the lead came from beyond the page path (O24, items 2 and 10): the
   * article slug a WhatsApp capture sat on and the A/B variants the visitor
   * was shown. Stored on `leads.attribution`, sent to the CRM as fields.
   */
  context?: LeadContext;
}

export interface LeadContext {
  articleSlug?: string | null;
  /** `{ experimentId: variant }` — only experiments the visitor was exposed to. */
  experiments?: Record<string, string>;
}

export type CreateLeadResult =
  | {
      ok: true;
      leadId: number | null;
      dropped?: 'honeypot';
      stored: boolean;
      /** The same phone submitted again inside the window (plan §5.4.7). */
      duplicate?: boolean;
    }
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

  // First-touch attribution, ported from flytta (plan §5.4.7). `leads.utm`
  // keeps last touch; this column keeps the session that actually earned the
  // lead, so a branded search on the way to converting cannot claim it.
  const attribution: StoredAttribution = {
    ...firstTouch({
      cookie: options.attribution ?? {},
      landingPath: input.pagePath,
      referrer: options.referrer,
      now,
    }),
    ...contextFields(options.context),
  };

  if (!hasDatabase()) {
    // No DATABASE_URL (local dev, a preview build): the submission must still
    // reach a human, so the delivery side runs and the failure is loud in the
    // log rather than silent on screen.
    log.error('[leads] DATABASE_URL is not set — lead not stored, delivering anyway', { site: input.site, kind: input.kind });
    await deliverLead(null, input, attribution, now);
    return { ok: true, leadId: null, stored: false };
  }

  const db = getDb();
  // A double submit — an impatient second click, a retried request — is one
  // lead, not two. The unique index on `dedupe_key` is what enforces it, so
  // two requests racing cannot both win (plan §5.4.7).
  const key = dedupeKey({ site: input.site, phone: input.phone ?? input.whatsapp, now });

  // `whatsapp` is its own kind from migration 0002 on. Before it runs, the
  // column rejects the value, so the lead is stored as `contact` and the real
  // kind rides on the attribution JSON — the admin reports read it back from
  // there (`effectiveLeadKind`). Never a failed insert because of the enum.
  const storedKind =
    input.kind === 'whatsapp' && !(await dbFeatures()).whatsappKind ? 'contact' : input.kind;
  if (storedKind !== input.kind) attribution.lead_kind = input.kind;

  let leadId: number | null = null;
  try {
    const [result] = await db.insert(leads).values({
      site: input.site as SiteKey,
      kind: storedKind,
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
      utm: input.utm ?? null,
      attribution: hasAttribution(attribution) ? attribution : null,
      dedupeKey: key,
      crmStatus: 'pending',
    });
    leadId = Number(result.insertId);
  } catch (error) {
    if (key && isDuplicateKey(error)) {
      // The first submission is already stored and already delivered. Record
      // the repeat on that lead and answer the visitor with the same success
      // state.
      const existing = await findByDedupeKey(key);
      if (existing) {
        await recordEvent(existing, 'duplicate.suppressed', {
          kind: input.kind,
          site: input.site,
          at: now.toISOString(),
        });
        return { ok: true, leadId: existing, stored: true, duplicate: true };
      }
    }

    // ANY other insert failure — MySQL unreachable, the connection pool
    // exhausted, a column rejected — must not cost us the lead
    // (`docs/improvement-report.md` §1.8, CLAUDE.md "never let an integration
    // failure fail a form"). This used to re-throw, which lost the submission
    // AND showed the visitor a stack trace, while the no-database branch above
    // did the right thing. Now both branches do: the delivery side still runs,
    // the failure is loud in the log, and the visitor sees success.
    log.error('[leads] could not store the lead — delivering anyway', { site: input.site, kind: input.kind, err: error });
    await deliverLead(null, input, attribution, now);
    return { ok: true, leadId: null, stored: false };
  }

  await recordEvent(leadId, 'created', { kind: input.kind, site: input.site });
  await openDeliveries(leadId, deliveryChannels(input), now);
  await deliverLead(leadId, input, attribution, now);

  return { ok: true, leadId, stored: true };
}

/**
 * The id behind a dedupe key, or null if the lookup itself fails. A dead
 * database on the read is the same situation as a dead database on the write:
 * the caller falls through to "deliver it anyway", never to an exception.
 */
async function findByDedupeKey(key: string): Promise<number | null> {
  try {
    const [existing] = await getDb()
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.dedupeKey, key))
      .limit(1);
    return existing?.id ?? null;
  } catch (error) {
    log.error('[leads] could not look up the duplicate lead', { err: error });
    return null;
  }
}

/** Experiment ids and variants are ours, but they arrive via a cookie: allowlist the shape. */
const TOKEN = /^[a-z0-9_-]{1,40}$/i;

export function contextFields(context: LeadContext | undefined): Partial<StoredAttribution> {
  const out: Partial<StoredAttribution> = {};
  const slug = context?.articleSlug?.trim();
  if (slug && /^[a-z0-9][a-z0-9/_-]{0,190}$/i.test(slug)) out.article_slug = slug;
  const experiments = Object.entries(context?.experiments ?? {}).filter(
    ([id, variant]) => TOKEN.test(id) && TOKEN.test(variant),
  );
  if (experiments.length) out.experiments = Object.fromEntries(experiments.slice(0, 5));
  return out;
}

/** The kind a report should show: `contact` rows written before 0002 may really be `whatsapp`. */
export function effectiveLeadKind(row: { kind: string; attribution?: unknown }): string {
  const stored = (row.attribution ?? null) as { lead_kind?: unknown } | null;
  return row.kind === 'contact' && stored?.lead_kind === 'whatsapp' ? 'whatsapp' : row.kind;
}

/** Channels that apply to this lead. No visitor email, no auto-reply. */
function deliveryChannels(input: LeadInput): DeliveryChannel[] {
  return input.email ? ['crm', 'notify', 'autoreply'] : ['crm', 'notify'];
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
    log.error('[leads] could not record event', { leadId, event: type, err: error });
  }
}

/**
 * CRM + email. Both are awaited (a serverless request can be frozen the moment
 * the response is returned, so a detached promise is not reliably delivered),
 * but neither can throw out of here. Each channel's outcome goes onto its
 * `lead_deliveries` row; a failure there is the queue's job from now on.
 */
async function deliverLead(
  leadId: number | null,
  input: LeadInput,
  attribution: StoredAttribution,
  now: Date,
  channels: DeliveryChannel[] = deliveryChannels(input),
): Promise<void> {
  await Promise.allSettled([
    channels.includes('crm') ? pushToCrm(leadId, input, attribution, now) : null,
    channels.includes('notify') || channels.includes('autoreply')
      ? notifyLead(leadId, input, now, channels)
      : null,
  ]);
}

async function pushToCrm(
  leadId: number | null,
  input: LeadInput,
  attribution: StoredAttribution,
  now: Date,
): Promise<CrmOutcome> {
  const site = getSite(input.site as SiteKey);
  const phone = input.phone ?? input.whatsapp ?? '';

  let outcome: CrmOutcome;
  try {
    outcome = await sendToVenderCrm({
      idempotencyKey: leadId === null ? undefined : leadIdempotencyKey(input.site, leadId),
      phone,
      name: input.name,
      email: input.email,
      message: buildMessage(input),
      source: site.crm.source,
      page_url: input.pagePath ? `https://${site.canonicalHost}${input.pagePath}` : undefined,
      referrer: attribution.referrer,
      // First touch wins on the CRM contact too: the campaign that earned the
      // visitor is the one worth crediting, not the last click before the form.
      utm_source: attribution.utm_source ?? input.utm?.utm_source,
      utm_medium: attribution.utm_medium ?? input.utm?.utm_medium,
      utm_campaign: attribution.utm_campaign ?? input.utm?.utm_campaign,
      utm_term: attribution.utm_term ?? input.utm?.utm_term,
      utm_content: attribution.utm_content ?? input.utm?.utm_content,
      gclid: attribution.gclid ?? input.utm?.gclid,
      fbclid: attribution.fbclid ?? input.utm?.fbclid,
      fields: {
        kind: input.kind,
        site: input.site,
        brand: site.name,
        whatsapp: input.whatsapp,
        country: countryName(input.country) ?? input.country,
        nationality: countryName(input.nationality) ?? input.nationality,
        investment_range: input.investmentRange,
        investment_route: input.investmentRoute,
        route_finder_result: input.quizResult,
        landing_page: attribution.landing_page,
        first_seen: attribution.first_seen,
        article_slug: attribution.article_slug,
        // Last touch, for when it differs from the first-touch utm above.
        last_utm_source: input.utm?.utm_source,
        last_utm_campaign: input.utm?.utm_campaign,
        ab_variants: experimentsLabel(attribution.experiments),
      },
    }, input.site);
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
  await recordDelivery(leadId, 'crm', crmChannelOutcome(outcome), now);
  return outcome;
}

/** `{hero_cta: 'two_minutes'}` → `hero_cta:two_minutes`. */
export function experimentsLabel(experiments: Record<string, string> | undefined): string | undefined {
  const pairs = Object.entries(experiments ?? {});
  return pairs.length ? pairs.map(([id, variant]) => `${id}:${variant}`).join(',') : undefined;
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
    log.error('[leads] could not record CRM status', { leadId, err: error });
  }
}

/** Internal notification + auto-reply. Logged, never fatal. */
async function notifyLead(
  leadId: number | null,
  input: LeadInput,
  now: Date,
  channels: DeliveryChannel[],
): Promise<void> {
  const site = input.site as SiteKey;
  const to = notifyTo();
  const wantNotify = channels.includes('notify');
  const wantAutoReply = channels.includes('autoreply') && Boolean(input.email);

  const results = await Promise.allSettled([
    !wantNotify
      ? Promise.resolve({ skipped: 'not-requested' })
      : to
      ? sendEmail({
          to,
          replyTo: input.email || undefined,
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
    wantAutoReply ? sendEmail({
      to: input.email,
      ...leadAutoReply({ site, name: input.name, pagePath: input.pagePath, unsubscribeUrl: unsubscribeUrl(site, input.email) }),
    }) : Promise.resolve({ skipped: 'no-lead-email' }),
  ]);

  const summary = results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, mode: 'unknown', error: String(r.reason) }));
  await recordEvent(leadId, 'email.sent', { notification: summary[0], autoReply: summary[1] });
  if (wantNotify) await recordDelivery(leadId, 'notify', emailChannelOutcome(summary[0] as never), now);
  if (wantAutoReply) await recordDelivery(leadId, 'autoreply', emailChannelOutcome(summary[1] as never), now);
}

/** A stored lead back into the shape the delivery functions take. */
function leadInputFromRow(lead: Lead): LeadInput {
  return {
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
}

/**
 * Admin retry (plan §5.2.1). Re-runs the CRM push for one stored lead; the CRM
 * idempotency key comes from the lead row, so a retry at any time cannot
 * create a duplicate deal.
 */
export async function retryLeadDelivery(leadId: number): Promise<CrmOutcome> {
  if (!hasDatabase()) throw new Error('DATABASE_URL is not set');
  const db = getDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  await recordEvent(leadId, 'crm.retry', { by: 'admin' });
  return pushToCrm(leadId, leadInputFromRow(lead), (lead.attribution as StoredAttribution) ?? {}, new Date());
}

/* ------------------------------------------------------------ the queue */

export interface QueueRunResult {
  mode: 'table' | 'legacy' | 'none';
  attempted: number;
  /** `lead:channel` pairs attempted, for the log and the CLI. */
  items: string[];
}

/**
 * One pass of the retry queue (O24, item 1): every due `failed` row, every
 * `pending` row a crashed request abandoned, and — with `includeSkipped` —
 * every `skipped` row of the last 30 days (run it once after setting the CRM
 * key). Triggered by `POST /api/leads/deliveries` (a cron hits it), by
 * `npm run leads:retry`, and by the button on `/admin/leads`.
 *
 * Before migration 0002 there is no queue table; the pass falls back to
 * re-pushing leads whose `crm_status` is `failed` from the last 7 days, which
 * is exactly what the old per-lead Retry button did, in bulk.
 */
export async function runLeadDeliveryQueue(options: {
  now?: Date;
  limit?: number;
  includeSkipped?: boolean;
  trigger?: string;
} = {}): Promise<QueueRunResult> {
  if (!hasDatabase()) return { mode: 'none', attempted: 0, items: [] };
  const now = options.now ?? new Date();
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 200);
  const db = getDb();
  const runId = await startRun(options.trigger ?? 'manual');

  const due = await dueDeliveries(now, limit, { includeSkipped: options.includeSkipped });
  let result: QueueRunResult;

  if (due === null) {
    const failed = await db
      .select()
      .from(leads)
      .where(and(eq(leads.crmStatus, 'failed'), gte(leads.createdAt, new Date(now.getTime() - 7 * 86_400_000))))
      .orderBy(desc(leads.createdAt))
      .limit(limit);
    for (const lead of failed) {
      await recordEvent(lead.id, 'crm.retry', { by: 'queue' });
      await pushToCrm(lead.id, leadInputFromRow(lead), (lead.attribution as StoredAttribution) ?? {}, now);
    }
    result = { mode: 'legacy', attempted: failed.length, items: failed.map((lead) => `${lead.id}:crm`) };
  } else {
    // Group per lead so one lead's channels share one row read.
    const byLead = new Map<number, DeliveryChannel[]>();
    for (const row of due) byLead.set(row.leadId, [...(byLead.get(row.leadId) ?? []), row.channel]);
    const items: string[] = [];
    for (const [leadId, channels] of byLead) {
      const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      if (!lead) continue;
      await recordEvent(leadId, 'delivery.retry', { channels, by: options.trigger ?? 'manual' });
      await deliverLead(leadId, leadInputFromRow(lead), (lead.attribution as StoredAttribution) ?? {}, now, channels);
      items.push(...channels.map((channel) => `${leadId}:${channel}`));
    }
    result = { mode: 'table', attempted: items.length, items };
  }

  await finishRun(runId, `${result.mode}: ${result.attempted} attempted`);
  return result;
}

/** `cron_runs` makes "the queue never ran" distinguishable from "nothing was due". */
async function startRun(trigger: string): Promise<number | null> {
  try {
    const [row] = await getDb().insert(cronRuns).values({ job: 'lead-deliveries', ok: false, note: trigger.slice(0, 60) });
    return Number(row.insertId);
  } catch (error) {
    log.error('[leads] could not record the queue run', { err: error });
    return null;
  }
}

async function finishRun(runId: number | null, note: string): Promise<void> {
  if (runId === null) return;
  try {
    await getDb().update(cronRuns).set({ ok: true, finishedAt: new Date(), note }).where(eq(cronRuns.id, runId));
  } catch (error) {
    log.error('[leads] could not close the queue run', { err: error });
  }
}

export type { Lead };

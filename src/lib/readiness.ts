import type { Proof } from '@content/shared/proof';
import type { Fact } from '@content/shared/facts';

/**
 * The launch-readiness checks behind `/admin/readiness` (O24, item 4). Pure
 * over their inputs (env, proof, facts, a fetch) so they are unit-tested; the
 * page wires in the live values. Read-only, and no secret is ever returned —
 * only whether it is set and, where it matters, whether it is strong enough.
 */

export type CheckStatus = 'ok' | 'missing' | 'warn' | 'info';

export interface Check {
  key: string;
  label: string;
  status: CheckStatus;
  /** What happens while it is not ok, and what to do. Never the value. */
  note: string;
}

type Env = Record<string, string | undefined>;
const set = (env: Env, key: string) => Boolean(env[key] && env[key]!.trim());

export function envChecks(env: Env, sites: readonly string[]): Check[] {
  const checks: Check[] = [];
  const add = (key: string, label: string, ok: boolean, note: string, notOk: CheckStatus = 'missing') =>
    checks.push({ key, label, status: ok ? 'ok' : notOk, note: ok ? '' : note });

  add('DATABASE_URL', 'Database', set(env, 'DATABASE_URL'), 'Leads are emailed and pushed to the CRM but NOT stored; admin is empty.');
  add(
    'SESSION_SECRET',
    'Session secret (32+ chars)',
    (env.SESSION_SECRET ?? '').length >= 32,
    'Admin login, member sign-in, unsubscribe and download links all refuse to work in production.',
  );
  const smtp = set(env, 'SMTP_HOST') && set(env, 'SMTP_USER') && set(env, 'SMTP_PASSWORD');
  add('EMAIL', 'Email delivery (Resend or SMTP)', set(env, 'RESEND_API_KEY') || smtp, 'Nothing is emailed: no lead notification, no auto-reply, no receipts. Set RESEND_API_KEY or the three SMTP_* vars.');
  add('EMAIL_FROM', 'Sending address', set(env, 'EMAIL_FROM'), 'Falls back to the default hello@ address, which needs its DNS records.', 'warn');
  add('EMAIL_NOTIFY_TO', 'Where lead notifications go', set(env, 'EMAIL_NOTIFY_TO'), 'Notifications go to the sending address mailbox.', 'warn');

  const crmUrl = set(env, 'VENDERCRM_API_URL');
  const sitesWithoutKey = sites.filter((site) => !set(env, `VENDERCRM_API_KEY_${site.toUpperCase()}`) && !set(env, 'VENDERCRM_API_KEY'));
  add(
    'VENDERCRM',
    'VenderCRM (URL + a key for every brand)',
    crmUrl && sitesWithoutKey.length === 0,
    !crmUrl
      ? 'VENDERCRM_API_URL is not set: leads are stored and emailed but never reach the CRM (they wait as "skipped").'
      : `No key for: ${sitesWithoutKey.join(', ')} (set VENDERCRM_API_KEY or VENDERCRM_API_KEY_<SITE>).`,
  );
  add(
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
    'WhatsApp number',
    (env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '').length >= 8,
    'No WhatsApp button anywhere: every WhatsApp action falls back to the contact form.',
  );
  add(
    'NEXT_PUBLIC_PLAUSIBLE_ENABLED',
    'Plausible analytics',
    env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === 'true',
    'No page-view or click analytics (leads and WhatsApp clicks are still counted in /admin/attribution).',
    'warn',
  );
  add(
    'LEAD_QUEUE_SECRET',
    'Lead retry queue secret (24+ chars)',
    (env.LEAD_QUEUE_SECRET ?? '').length >= 24,
    'The cron cannot trigger retries; failed CRM pushes and emails are retried only from /admin/leads.',
  );
  add('LOG_SINK_URL', 'Log shipping (optional)', set(env, 'LOG_SINK_URL'), 'Logs stay in the Hostinger process log only.', 'info');
  return checks;
}

/** Empty trust fields in `content/shared/proof.ts`: each one hides a component. */
export function proofGaps(proof: Proof): Check[] {
  const gaps: Check[] = [];
  const gap = (key: string, label: string, empty: boolean, note: string) => {
    if (empty) gaps.push({ key, label, status: 'warn', note });
  };
  gap('stats.residenciesFiled', 'Residencies filed', proof.stats.residenciesFiled === null, 'Trust bar hides this number.');
  gap('stats.yearsInBusiness', 'Years in business', proof.stats.yearsInBusiness === null, 'Trust bar hides this number.');
  gap('stats.googleRating', 'Google rating', proof.stats.googleRating === null, 'No rating in the trust bar or the Organization JSON-LD.');
  gap('reviews', 'Reviews (with permission)', proof.reviews.length === 0, 'Testimonials are hidden on every brand.');
  gap('cases', 'Case snapshots', proof.cases.length === 0, 'Case snapshots are hidden.');
  gap('office.address', 'Office address', !proof.office.address, 'No street address in LocalBusiness JSON-LD; OfficeStrip hidden.');
  gap('office.mapsUrl', 'Google Maps link', !proof.office.mapsUrl, 'No map link.');
  gap('office.photos', 'Office photos', proof.office.photos.length === 0, 'OfficeStrip shows no photos.');
  gap('guarantee', 'Guarantee wording', proof.guarantee === null, 'Guarantee block hidden.');
  const noPhoto = proof.team.filter((m) => !m.photo).map((m) => m.key);
  gap('team.photo', 'Team photos', noPhoto.length > 0, `Missing for: ${noPhoto.join(', ')}.`);
  const noBio = proof.team.filter((m) => !m.bio.en).map((m) => m.key);
  gap('team.bio', 'Team bios (en)', noBio.length > 0, `Missing for: ${noBio.join(', ')}.`);
  return gaps;
}

export function factCounts(facts: Fact[]): { total: number; verified: number; sourced: number; hedged: number } {
  const verified = facts.filter((f) => f.verified).length;
  const sourced = facts.filter((f) => !f.verified && f.sourced).length;
  return { total: facts.length, verified, sourced, hedged: facts.length - verified - sourced };
}

/* ------------------------------------------------------ host reachability */

export interface HostCheck {
  site: string;
  host: string;
  status: 'ok' | 'degraded' | 'wrong-site' | 'unreachable';
  httpStatus: number | null;
  note: string;
}

/**
 * `GET https://<host>/api/health` for one brand, with a hard timeout. This is
 * the whole DNS + TLS + hPanel-domain-attachment chain in one request: if it
 * answers with the right `site`, the domain is live on this app.
 */
export async function checkHost(
  site: string,
  host: string,
  fetcher: typeof fetch = fetch,
  timeoutMs = 4000,
): Promise<HostCheck> {
  try {
    const response = await fetcher(`https://${host}/api/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'paraguayresidency-readiness/1' },
      redirect: 'manual',
      cache: 'no-store',
    });
    if (response.status !== 200) {
      return { site, host, status: 'unreachable', httpStatus: response.status, note: `HTTP ${response.status}` };
    }
    const body = (await response.json().catch(() => ({}))) as { site?: string; degraded?: boolean };
    if (body.site !== site) {
      return { site, host, status: 'wrong-site', httpStatus: 200, note: `answers as "${body.site ?? '?'}" — host missing from the registry, or DNS points elsewhere` };
    }
    return body.degraded
      ? { site, host, status: 'degraded', httpStatus: 200, note: 'reachable, but /api/health reports degraded' }
      : { site, host, status: 'ok', httpStatus: 200, note: '' };
  } catch (error) {
    const reason = error instanceof Error ? (error.name === 'TimeoutError' ? 'timed out' : error.message) : String(error);
    return { site, host, status: 'unreachable', httpStatus: null, note: reason.slice(0, 200) };
  }
}

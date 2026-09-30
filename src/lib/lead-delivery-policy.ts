/**
 * The retry policy for lead delivery (O24, item 1), pure so it can be tested
 * without a database or a clock.
 *
 * Three channels per lead: the CRM push, the notification to the team and the
 * auto-reply to the visitor. Each attempt's outcome moves the channel's row:
 *
 *   sent     delivered; nothing more to do.
 *   failed   will be retried at `nextAttemptAt` (backoff below).
 *   dead     gave up: out of attempts, or a permanent rejection (a 4xx the
 *            CRM will answer the same way forever). Visible in /admin; an
 *            admin retry still works.
 *   skipped  nothing was wrong with the lead — the CRM or mail is not
 *            configured, or the lead has no phone. Replayed only on request
 *            (`--include-skipped`), e.g. right after the CRM key is set.
 *
 * The visitor's form never waits on any of this: `createLead` makes the
 * first attempt inline (bounded by the CRM's 10 s timeout) and records the
 * outcome; everything after that is the queue's job.
 */

export type DeliveryChannel = 'crm' | 'notify' | 'autoreply';

export type ChannelOutcome =
  | { result: 'sent' }
  | { result: 'failed'; error: string; permanent?: boolean }
  | { result: 'skipped'; reason: string };

/** Minutes to wait after the 1st, 2nd, … failure. ~33 hours end to end. */
export const BACKOFF_MINUTES = [1, 5, 30, 120, 360, 1440] as const;
/** The first attempt plus one per backoff step. */
export const MAX_ATTEMPTS = BACKOFF_MINUTES.length + 1;

export interface DeliveryState {
  status: 'sent' | 'failed' | 'dead' | 'skipped';
  attempts: number;
  nextAttemptAt: Date | null;
  lastAttemptAt: Date;
  deliveredAt: Date | null;
  lastError: string | null;
}

export function nextDeliveryState(previousAttempts: number, outcome: ChannelOutcome, now: Date): DeliveryState {
  if (outcome.result === 'sent') {
    return {
      status: 'sent',
      attempts: previousAttempts + 1,
      nextAttemptAt: null,
      lastAttemptAt: now,
      deliveredAt: now,
      lastError: null,
    };
  }
  if (outcome.result === 'skipped') {
    // Not an attempt: nothing was sent, so it does not use up the budget.
    return {
      status: 'skipped',
      attempts: previousAttempts,
      nextAttemptAt: null,
      lastAttemptAt: now,
      deliveredAt: null,
      lastError: scrubError(outcome.reason),
    };
  }
  const attempts = previousAttempts + 1;
  const exhausted = attempts >= MAX_ATTEMPTS || outcome.permanent === true;
  const waitMinutes = BACKOFF_MINUTES[Math.min(attempts - 1, BACKOFF_MINUTES.length - 1)];
  return {
    status: exhausted ? 'dead' : 'failed',
    attempts,
    nextAttemptAt: exhausted ? null : new Date(now.getTime() + waitMinutes * 60_000),
    lastAttemptAt: now,
    deliveredAt: null,
    lastError: scrubError(outcome.error),
  };
}

/**
 * Error text is stored and shown in /admin, so it must not become a second
 * copy of the lead: provider messages sometimes echo the rejected field. Email
 * addresses and long digit runs (phones) are masked; the text is capped.
 */
export function scrubError(text: string): string {
  return text
    .replace(/[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s().-]{5,}\d/g, '[number]')
    .slice(0, 480);
}

/** CRM outcome → channel outcome. A 4xx other than 408/429 will never succeed on retry. */
export function crmChannelOutcome(outcome:
  | { status: 'sent' }
  | { status: 'failed'; httpStatus: number; error: string }
  | { status: 'skipped'; reason: string }): ChannelOutcome {
  if (outcome.status === 'sent') return { result: 'sent' };
  if (outcome.status === 'skipped') return { result: 'skipped', reason: outcome.reason };
  const code = outcome.httpStatus;
  const permanent = code >= 400 && code < 500 && code !== 408 && code !== 429;
  return { result: 'failed', error: `HTTP ${code || 'unreachable'}: ${outcome.error}`, permanent };
}

/** Email outcome → channel outcome. Console mode is "not configured", not a failure. */
export function emailChannelOutcome(
  outcome: { ok: boolean; mode: string; error?: string } | { skipped: string },
): ChannelOutcome {
  if ('skipped' in outcome) return { result: 'skipped', reason: outcome.skipped };
  if (outcome.mode === 'console') return { result: 'skipped', reason: 'email-not-configured' };
  if (outcome.ok) return { result: 'sent' };
  return { result: 'failed', error: outcome.error ?? 'send failed' };
}

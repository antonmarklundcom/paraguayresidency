import { pack, unpack } from './signing';

/**
 * Two cheap, JS-free spam defences on every public form (CRM skill rule 4):
 *
 * 1. **Honeypot** — a visually hidden `website` field. Bots fill it; people
 *    never see it. A filled honeypot is accepted silently (the submitter sees
 *    the normal success state) and nothing is stored or forwarded.
 * 2. **Timing** — the form ships a signed render timestamp. A submission that
 *    arrives implausibly fast, or from a form left open for days, is rejected.
 *    The timestamp is HMAC-signed so it cannot simply be rewritten.
 */
export const HONEYPOT_FIELD = 'website';
export const TIMESTAMP_FIELD = 'ts';
const PURPOSE = 'form-timestamp';

/** Faster than this and it was not a person typing. */
export const MIN_FILL_MS = 2_500;
/** Older than this and the page has been sitting open (or is being replayed). */
export const MAX_FORM_AGE_MS = 12 * 60 * 60 * 1000;

export function issueFormTimestamp(now = Date.now()): string {
  return pack(String(now), PURPOSE);
}

export type GuardVerdict = 'ok' | 'honeypot' | 'too-fast' | 'stale' | 'bad-token';

export function checkFormGuard(
  input: { honeypot?: unknown; timestamp?: unknown },
  now = Date.now(),
): GuardVerdict {
  if (typeof input.honeypot === 'string' && input.honeypot.trim() !== '') return 'honeypot';

  const raw = typeof input.timestamp === 'string' ? unpack(input.timestamp, PURPOSE) : null;
  if (raw === null) return 'bad-token';

  const issued = Number(raw);
  if (!Number.isFinite(issued)) return 'bad-token';

  const age = now - issued;
  // A clock skew of a few seconds into the future is normal; more is a forgery.
  if (age < -60_000) return 'bad-token';
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > MAX_FORM_AGE_MS) return 'stale';
  return 'ok';
}

/**
 * A honeypot hit is a silent success — telling a bot it was detected only
 * helps it try again. Everything else is a real error the visitor can fix.
 */
export function isSilentDrop(verdict: GuardVerdict): verdict is 'honeypot' {
  return verdict === 'honeypot';
}

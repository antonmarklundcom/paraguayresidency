import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * HMAC helpers shared by the form guard, the newsletter unsubscribe link and
 * the download tokens. Everything here is pure and synchronous so it can be
 * unit-tested without a database, a request or a network call.
 *
 * `SESSION_SECRET` is the one secret. It is optional at build time (plan
 * §4.5): without it we fall back to a clearly-marked development key so
 * `next build` and `npm run verify` pass on a clean checkout. Anything the
 * fallback signs is worthless to an attacker anyway, because the fallback is
 * only ever reached on a machine that has no real secret set.
 */
const DEV_FALLBACK_SECRET = 'dev-insecure-secret-set-SESSION_SECRET-in-env';

export function signingSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (secret && secret.length > 0 && process.env.NODE_ENV !== 'production') return secret;
  return DEV_FALLBACK_SECRET;
}

export function hasStrongSecret(): boolean {
  return (process.env.SESSION_SECRET ?? '').length >= 32;
}

/** `purpose` domain-separates signatures so a form token is not a download token. */
export function sign(value: string, purpose: string, secret = signingSecret()): string {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('base64url');
}

/** Constant-time verification. Never throws on malformed input. */
export function verify(
  value: string,
  signature: string,
  purpose: string,
  secret = signingSecret(),
): boolean {
  const expected = sign(value, purpose, secret);
  if (typeof signature !== 'string' || signature.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** `value.signature` in one opaque string, for URLs and hidden fields. */
export function pack(value: string, purpose: string, secret = signingSecret()): string {
  return `${Buffer.from(value, 'utf8').toString('base64url')}.${sign(value, purpose, secret)}`;
}

export function unpack(packed: string, purpose: string, secret = signingSecret()): string | null {
  if (typeof packed !== 'string') return null;
  const dot = packed.lastIndexOf('.');
  if (dot <= 0) return null;
  let value: string;
  try {
    value = Buffer.from(packed.slice(0, dot), 'base64url').toString('utf8');
  } catch {
    return null;
  }
  return verify(value, packed.slice(dot + 1), purpose, secret) ? value : null;
}

/** URL-safe opaque token for `download_tokens.token` (48 bytes → 64 chars). */
export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * VenderCRM idempotency key (skill rule 2): the same phone within the same
 * hour is the same submission, so a double-click or a retry after a timeout
 * collapses instead of creating a duplicate contact.
 */
export function idempotencyKey(phone: string, now = new Date()): string {
  return createHash('sha256')
    .update(`${phone}|${now.toISOString().slice(0, 13)}`)
    .digest('hex');
}

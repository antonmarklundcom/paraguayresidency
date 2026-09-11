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

export class WeakSecretError extends Error {
  constructor() {
    super(
      'SESSION_SECRET is missing or shorter than 32 characters. ' +
        'In production this key seals the admin session, the member session, ' +
        'magic links, download tokens and unsubscribe links — refusing rather ' +
        'than signing with the public development fallback. Set a 32+ character ' +
        'SESSION_SECRET and restart.',
    );
    this.name = 'WeakSecretError';
  }
}

export function hasStrongSecret(): boolean {
  return (process.env.SESSION_SECRET ?? '').length >= 32;
}

/**
 * The one secret (plan §4.5: a missing env value must not break a build).
 *
 * Before O17 this silently fell back to a PUBLIC literal in any `NODE_ENV`, so
 * a production deploy that forgot `SESSION_SECRET` handed out admin sessions
 * anyone could forge — `login()` refused to mint one, but `currentAdmin()`
 * happily unsealed one made with the published key
 * (`docs/improvement-report.md` §1.2).
 *
 * The refusal is deliberately at **request time**, not import time: `next build`
 * runs with `NODE_ENV=production` and no env at all, and every caller below
 * reads the secret inside a function body, so `npm run verify` and a clean
 * `next build` still pass with an empty `.env`. The first request that would
 * sign or unseal anything is what throws.
 */
export function signingSecret(purpose?: string): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProduction() && !NON_CRITICAL_PURPOSES.has(purpose ?? '')) throw new WeakSecretError();
  if (secret && secret.length > 0) return secret;
  return DEV_FALLBACK_SECRET;
}

/**
 * The one exception to the refusal, and the reason it is an allowlist rather
 * than a flag: `form-timestamp` is anti-bot FRICTION, not a security boundary.
 * A forgeable render timestamp costs a spammer one HMAC they could skip anyway
 * by posting the form directly — while throwing for it would 500 every public
 * page that renders a `<LeadForm>` on a deploy whose only fault is a missing
 * secret, and would break `next build` outright once O19 prerenders those
 * pages (build runs with NODE_ENV=production and an empty .env by design,
 * plan §4.5). Everything that actually grants something — sessions, magic
 * links, unsubscribe tokens — is absent from this set and throws.
 */
const NON_CRITICAL_PURPOSES = new Set(['form-timestamp']);

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** What `/api/health` reports. Never throws — it is the thing you check. */
export function secretHealth(): 'ok' | 'weak' {
  return hasStrongSecret() ? 'ok' : 'weak';
}

/** `purpose` domain-separates signatures so a form token is not a download token. */
export function sign(value: string, purpose: string, secret = signingSecret(purpose)): string {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('base64url');
}

/** Constant-time verification. Never throws on malformed input. */
export function verify(
  value: string,
  signature: string,
  purpose: string,
  secret = signingSecret(purpose),
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
export function pack(value: string, purpose: string, secret = signingSecret(purpose)): string {
  return `${Buffer.from(value, 'utf8').toString('base64url')}.${sign(value, purpose, secret)}`;
}

export function unpack(packed: string, purpose: string, secret = signingSecret(purpose)): string | null {
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

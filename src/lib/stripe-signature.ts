import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stripe webhook signature verification, implemented directly against the
 * documented `Stripe-Signature` scheme.
 *
 * Written here rather than pulled from the SDK for one reason: it is a pure
 * function of (payload, header, secret, now), so the O2 exit criterion
 * "webhook signature handling" is testable with a locally-built fixture and no
 * network, no keys and no SDK in the test environment.
 *
 * Header shape: `t=1614556800,v1=<hex>,v1=<hex>` — several `v1` values appear
 * while a secret is being rotated, so ANY match is a pass.
 */
export type SignatureVerdict = 'ok' | 'missing-header' | 'malformed' | 'no-signature' | 'timestamp-out-of-tolerance';

/** Stripe's own recommended replay window. */
export const DEFAULT_TOLERANCE_SECONDS = 300;

export function signStripePayload(payload: string, secret: string, timestamp: number): string {
  const v1 = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return `t=${timestamp},v1=${v1}`;
}

export function verifyStripeSignature(input: {
  payload: string;
  header: string | null | undefined;
  secret: string;
  nowSeconds?: number;
  toleranceSeconds?: number;
}): SignatureVerdict {
  const { payload, header, secret } = input;
  if (!header) return 'missing-header';

  let timestamp: number | undefined;
  const candidates: string[] = [];
  for (const part of header.split(',')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === 't') timestamp = Number(value);
    else if (key === 'v1') candidates.push(value);
  }

  if (timestamp === undefined || !Number.isFinite(timestamp)) return 'malformed';
  if (candidates.length === 0) return 'no-signature';

  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const matched = candidates.some((candidate) => {
    if (candidate.length !== expected.length) return false;
    try {
      return timingSafeEqual(Buffer.from(candidate, 'utf8'), expectedBuf);
    } catch {
      return false;
    }
  });
  if (!matched) return 'no-signature';

  // The timestamp is only trustworthy once the signature over it has matched,
  // so tolerance is checked last.
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (Math.abs(now - timestamp) > tolerance) return 'timestamp-out-of-tolerance';

  return 'ok';
}

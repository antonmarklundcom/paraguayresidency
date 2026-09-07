import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Lemon Squeezy, over `fetch` (plan §1.13, §5.4.6).
 *
 * No SDK, for the same reason O2 skipped the Stripe one: we need two calls and
 * a signature check, the wire format is stable, and keeping the dependency out
 * means `npm run verify` and the CI build never need a key or a package
 * version. `verifyLemonSqueezySignature` is therefore a pure function that
 * tests against a locally-built fixture.
 */
const API = 'https://api.lemonsqueezy.com/v1';

export function lemonSqueezyConfigured(): boolean {
  return Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID);
}

export function lemonSqueezyWebhookConfigured(): boolean {
  return Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
}

export class LemonSqueezyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'LemonSqueezyError';
  }
}

/* --------------------------------------------------------------- signature */

export type LsSignatureVerdict = 'ok' | 'missing-header' | 'malformed' | 'mismatch';

/** The signature Lemon Squeezy sends: hex HMAC-SHA256 of the RAW body. */
export function signLemonSqueezyPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/**
 * Verifies `X-Signature` against the raw request body. Constant-time, and it
 * never throws on malformed input — a bad header is a verdict, not an
 * exception, so the route can answer 401 without a try/catch.
 */
export function verifyLemonSqueezySignature(input: {
  payload: string;
  header: string | null | undefined;
  secret: string;
}): LsSignatureVerdict {
  const header = input.header?.trim();
  if (!header) return 'missing-header';
  if (!/^[0-9a-f]+$/i.test(header)) return 'malformed';

  const expected = signLemonSqueezyPayload(input.payload, input.secret);
  if (header.length !== expected.length) return 'mismatch';
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(header.toLowerCase(), 'utf8'))
      ? 'ok'
      : 'mismatch';
  } catch {
    return 'mismatch';
  }
}

/* ----------------------------------------------------------------- payload */

/** The slice of a Lemon Squeezy webhook body this app actually reads. */
export interface LsWebhookBody {
  meta?: {
    event_name?: string;
    /** Present on newer deliveries; we fall back to event_name:id when absent. */
    webhook_id?: string;
    custom_data?: Record<string, string>;
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  };
}

/**
 * The idempotency key for `webhook_events`.
 *
 * Lemon Squeezy does not send a delivery id on every event, so the key is
 * `<event_name>:<resource id>`: a retried delivery of the same event is a
 * no-op, while each distinct event for one subscription still gets its own row
 * (this is pararesi's rule, and it was verified there by replaying fixtures).
 */
export function lemonSqueezyEventId(body: LsWebhookBody): string | null {
  const event = body.meta?.event_name;
  const id = body.data?.id;
  if (!event || !id) return null;
  return `${event}:${id}`;
}

/** LS statuses → our `subscriptions.status` enum. */
export function mapSubscriptionStatus(
  status: unknown,
): 'active' | 'past_due' | 'cancelled' | 'expired' | 'paused' {
  switch (String(status)) {
    case 'active':
    case 'on_trial':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'cancelled':
      return 'cancelled';
    case 'paused':
      return 'paused';
    case 'expired':
      return 'expired';
    default:
      // An unknown status must not silently grant access.
      return 'expired';
  }
}

/* ---------------------------------------------------------------- checkout */

export interface LsCheckoutInput {
  variantId: string;
  email?: string;
  /** Round-tripped back to us on every webhook for this checkout. */
  custom: Record<string, string>;
  successUrl?: string;
}

/**
 * Creates a hosted checkout and returns its URL. Throws `LemonSqueezyError`;
 * the route turns that into a graceful "coming soon" rather than a 500.
 */
export async function createLemonSqueezyCheckout(input: LsCheckoutInput): Promise<string> {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!key || !storeId) throw new LemonSqueezyError('Lemon Squeezy is not configured', 0);

  const response = await fetch(`${API}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            ...(input.email ? { email: input.email } : {}),
            custom: input.custom,
          },
          ...(input.successUrl
            ? { product_options: { redirect_url: input.successUrl } }
            : {}),
        },
        relationships: {
          store: { data: { type: 'stores', id: String(storeId) } },
          variant: { data: { type: 'variants', id: String(input.variantId) } },
        },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await response.json().catch(() => ({}))) as {
    data?: { attributes?: { url?: string } };
    errors?: { detail?: string }[];
  };
  if (!response.ok) {
    throw new LemonSqueezyError(
      json.errors?.[0]?.detail ?? `Lemon Squeezy HTTP ${response.status}`,
      response.status,
    );
  }
  const url = json.data?.attributes?.url;
  if (!url) throw new LemonSqueezyError('Lemon Squeezy returned no checkout URL', response.status);
  return url;
}

import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

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
    /**
     * Present on some deliveries. It identifies the webhook ENDPOINT, not the
     * delivery, so it is deliberately NOT part of the idempotency key — see
     * `lemonSqueezyEventId`.
     */
    webhook_id?: string;
    test_mode?: boolean;
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
 * **What the Lemon Squeezy webhook docs actually say (checked 2026-09-11, O17).**
 * `docs.lemonsqueezy.com` is blocked from this container, so this was read from
 * Lemon Squeezy's published webhook documentation via search summaries plus
 * their own `lemonsqueezy.js` types. Two things are documented and one is not:
 *
 *  - **Retries.** A non-200 response is retried up to three more times with
 *    exponential backoff (roughly 5 s, 25 s, 125 s), then the delivery is
 *    abandoned. A retry re-sends the *same signed body* — it has to, because
 *    `X-Signature` is an HMAC over those exact bytes.
 *  - **The body.** `meta` carries `event_name`, `test_mode` and `custom_data`;
 *    `data` carries the resource `type`, `id` and `attributes`.
 *  - **No documented per-delivery id.** Nothing in the documented payload
 *    identifies *this delivery* as opposed to *this resource*. `meta.webhook_id`
 *    appears in some deliveries, but every reference that describes it describes
 *    the **webhook endpoint's** id — the row you create under Settings →
 *    Webhooks — not a delivery id. Using it as the key would collapse EVERY
 *    event from that endpoint into one `webhook_events` row and silently drop
 *    every purchase after the first.
 *
 * So, deviating from the letter of plan §14.1.4 (which suggested preferring
 * `meta.webhook_id` when present) and keeping its intent: the key is
 * `<event_name>:<resource id>:<sha256(raw body)>`, never `webhook_id`.
 *
 * That is correct in both directions, which is the whole requirement:
 *  - a **retry** of one delivery carries byte-identical body ⇒ same hash ⇒ same
 *    key ⇒ the duplicate is recognised;
 *  - two **distinct** `subscription_updated` events for one subscription carry
 *    different attributes (`status`, `renews_at`, `updated_at`) ⇒ different
 *    hashes ⇒ different keys ⇒ both are processed. Before O17 the key was
 *    `<event>:<id>`, so only the first update for a subscription ever ran and
 *    `effectiveTier` drifted from the truth for the life of that membership.
 *
 * The hash is truncated to 32 hex characters: `provider_event_id` is
 * `varchar(191)`, and 128 bits is far past any collision concern here.
 */
export function lemonSqueezyEventId(body: LsWebhookBody, rawBody?: string): string | null {
  const event = body.meta?.event_name;
  const id = body.data?.id;
  if (!event || !id) return null;
  // Falling back to a canonical re-serialisation keeps callers that have only
  // the parsed body (tests, the import script) working; the route always passes
  // the raw bytes, which is what a retry actually repeats.
  const bytes = rawBody ?? JSON.stringify(body);
  const digest = createHash('sha256').update(bytes, 'utf8').digest('hex').slice(0, 32);
  return `${event}:${id}:${digest}`;
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

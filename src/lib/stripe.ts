import 'server-only';

/**
 * Minimal Stripe client over the REST API (`fetch` + form encoding).
 *
 * Deliberately not the `stripe` npm package: O2 needs exactly two calls
 * (create a Checkout Session, retrieve one), the wire format is stable, and
 * keeping the dependency out means `npm run verify` and the CI build never
 * depend on an SDK version or a key being present.
 */
const API = 'https://api.stripe.com/v1';

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export class StripeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

/** Stripe takes `application/x-www-form-urlencoded` with bracketed nesting. */
export function encodeForm(
  value: unknown,
  prefix = '',
  out: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  if (value === undefined || value === null || value === '') return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => encodeForm(item, `${prefix}[${index}]`, out));
    return out;
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      encodeForm(item, prefix ? `${prefix}[${key}]` : key, out);
    }
    return out;
  }
  out.append(prefix, String(value));
  return out;
}

async function stripeRequest<T>(
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown; idempotencyKey?: string },
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError('STRIPE_SECRET_KEY is not set', 0);

  const headers: Record<string, string> = { Authorization: `Bearer ${key}` };
  let body: string | undefined;
  if (init.method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = encodeForm(init.body ?? {}).toString();
  }
  if (init.idempotencyKey) headers['Idempotency-Key'] = init.idempotencyKey;

  const response = await fetch(`${API}${path}`, {
    method: init.method,
    headers,
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!response.ok) {
    throw new StripeError(json.error?.message ?? `Stripe HTTP ${response.status}`, response.status);
  }
  return json as T;
}

export interface CheckoutSession {
  id: string;
  url?: string;
  payment_intent?: string | null;
  payment_status?: string;
  status?: string;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string> | null;
}

export interface CreateCheckoutInput {
  successUrl: string;
  cancelUrl: string;
  email?: string;
  /** Use a Stripe Price when one is configured; otherwise price inline. */
  priceId?: string | null;
  productName: string;
  amountCents: number;
  currency: string;
  metadata: Record<string, string>;
  idempotencyKey?: string;
}

export async function createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession> {
  const lineItem = input.priceId
    ? { price: input.priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountCents,
          product_data: { name: input.productName },
        },
      };

  return stripeRequest<CheckoutSession>('/checkout/sessions', {
    method: 'POST',
    idempotencyKey: input.idempotencyKey,
    body: {
      mode: 'payment',
      line_items: [lineItem],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      ...(input.email ? { customer_email: input.email } : {}),
      metadata: input.metadata,
      payment_intent_data: { metadata: input.metadata },
      allow_promotion_codes: true,
    },
  });
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

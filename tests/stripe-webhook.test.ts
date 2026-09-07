import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TOLERANCE_SECONDS,
  signStripePayload,
  verifyStripeSignature,
} from '@/lib/stripe-signature';
import { encodeForm } from '@/lib/stripe';

/**
 * Plan §5.2 exit criterion: webhook signature handling. The fixture is built
 * here with the documented scheme rather than captured from Stripe, so the
 * test needs no key, no network and no SDK.
 */
const SECRET = 'whsec_test_dGhpcyBpcyBub3QgYSByZWFsIHNlY3JldA';
const NOW = 1_800_000_000;
const PAYLOAD = JSON.stringify({
  id: 'evt_1',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_1', payment_status: 'paid', amount_total: 4900 } },
});

const ok = (header: string | null, nowSeconds = NOW) =>
  verifyStripeSignature({ payload: PAYLOAD, header, secret: SECRET, nowSeconds });

describe('verifyStripeSignature', () => {
  it('accepts a correctly signed payload', () => {
    expect(ok(signStripePayload(PAYLOAD, SECRET, NOW))).toBe('ok');
  });

  it('accepts a rotated secret: any matching v1 passes', () => {
    const mine = signStripePayload(PAYLOAD, SECRET, NOW);
    const other = signStripePayload(PAYLOAD, 'whsec_the_old_one', NOW).split('v1=')[1];
    expect(ok(`${mine},v1=${other}`)).toBe('ok');
  });

  it('rejects a payload edited after signing — the whole point of the check', () => {
    const header = signStripePayload(PAYLOAD, SECRET, NOW);
    const tampered = PAYLOAD.replace('4900', '1');
    expect(
      verifyStripeSignature({ payload: tampered, header, secret: SECRET, nowSeconds: NOW }),
    ).toBe('no-signature');
  });

  it('rejects a signature made with a different secret', () => {
    expect(ok(signStripePayload(PAYLOAD, 'whsec_wrong', NOW))).toBe('no-signature');
  });

  it('rejects a replay from outside the tolerance window', () => {
    const header = signStripePayload(PAYLOAD, SECRET, NOW);
    expect(ok(header, NOW + DEFAULT_TOLERANCE_SECONDS + 1)).toBe('timestamp-out-of-tolerance');
    expect(ok(header, NOW - DEFAULT_TOLERANCE_SECONDS - 1)).toBe('timestamp-out-of-tolerance');
    expect(ok(header, NOW + DEFAULT_TOLERANCE_SECONDS)).toBe('ok');
  });

  it('rejects a moved timestamp: it is covered by the signature', () => {
    const header = signStripePayload(PAYLOAD, SECRET, NOW).replace(`t=${NOW}`, `t=${NOW + 10}`);
    expect(ok(header, NOW + 10)).toBe('no-signature');
  });

  it('rejects missing, empty and malformed headers', () => {
    expect(ok(null)).toBe('missing-header');
    expect(ok('')).toBe('missing-header');
    expect(ok('nonsense')).toBe('malformed');
    expect(ok(`t=${NOW}`)).toBe('no-signature');
    expect(ok('t=not-a-number,v1=abc')).toBe('malformed');
    expect(ok(`t=${NOW},v1=`)).toBe('no-signature');
    expect(ok(`t=${NOW},v0=deadbeef`)).toBe('no-signature');
  });
});

describe('encodeForm', () => {
  it('encodes the nested shape Stripe expects for line items', () => {
    const encoded = encodeForm({
      mode: 'payment',
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: 4900 } }],
      metadata: { site: 'guide' },
    });
    expect(encoded.get('mode')).toBe('payment');
    expect(encoded.get('line_items[0][quantity]')).toBe('1');
    expect(encoded.get('line_items[0][price_data][unit_amount]')).toBe('4900');
    expect(encoded.get('metadata[site]')).toBe('guide');
  });

  it('omits empty values rather than sending them', () => {
    const encoded = encodeForm({ a: '', b: null, c: undefined, d: 0 });
    expect(encoded.has('a')).toBe(false);
    expect(encoded.has('b')).toBe(false);
    expect(encoded.has('c')).toBe(false);
    expect(encoded.get('d')).toBe('0');
  });
});

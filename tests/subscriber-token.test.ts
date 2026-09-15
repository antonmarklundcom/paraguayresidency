import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { randomBytes } from 'node:crypto';
import { unsubscribeUrl } from '@/lib/subscribers';
import { confirmUrl } from '@/lib/email';
import { randomToken, unpack } from '@/lib/signing';
import { SITE_KEYS, siteOrigin } from '@/sites/registry';

beforeEach(() => vi.stubEnv('SESSION_SECRET', randomBytes(32).toString('hex')));
afterEach(() => vi.unstubAllEnvs());
it('creates the 24-byte confirmation identifier used by subscribers', () => {
  const token = randomToken(24);
  expect(token.length === 32 && /^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
  expect(Buffer.from(token, 'base64url').length).toBe(24);
});
it('preserves confirmation identifiers on every brand host', () => {
  const token = randomToken(24);
  for (const site of SITE_KEYS) {
    const url = new URL(confirmUrl(site, token));
    expect(url.origin).toBe(siteOrigin(site));
    expect(url.pathname).toBe('/confirm');
    expect(url.searchParams.get('token') === token).toBe(true);
  }
});
it('encodes confirmation query delimiters', () => {
  const value = 'sample&other=value+#';
  const url = new URL(confirmUrl('guide', value));
  expect(url.searchParams.get('token') === value).toBe(true);
  expect([...url.searchParams.keys()]).toEqual(['token']);
});
it('signs a lowercase address in the unsubscribe link', () => {
  for (const site of SITE_KEYS) {
    const url = new URL(unsubscribeUrl(site, 'READER@EXAMPLE.COM'));
    expect(url.origin).toBe(siteOrigin(site));
    expect(url.pathname).toBe('/unsubscribe');
    const packed = url.searchParams.get('u')!;
    expect(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(packed)).toBe(true);
    expect(unpack(packed, 'unsubscribe') === 'reader@example.com').toBe(true);
  }
});
it('rejects tampered unsubscribe links and cross-purpose use', () => {
  const packed = new URL(unsubscribeUrl('guide', 'reader@example.com')).searchParams.get('u')!;
  expect(unpack(`${packed}x`, 'unsubscribe') === null).toBe(true);
  expect(unpack(packed, 'download') === null).toBe(true);
});

import { expect, it } from 'vitest';
import { downloadUrl } from '@/lib/purchases';
import { randomToken } from '@/lib/signing';
import { siteOrigin } from '@/sites/registry';

// resolveThankYou is database-backed; these are its actual token/link helpers.
it('creates 48-byte URL-safe download identifiers', () => {
  const token = randomToken();
  expect(token.length === 64 && /^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
  expect(Buffer.from(token, 'base64url').length).toBe(48);
});
it('links thank-you downloads to the Guide API', () => {
  const token = randomToken();
  const url = new URL(downloadUrl(token));
  expect(url.origin).toBe(siteOrigin('guide'));
  expect(url.pathname === `/api/download/${token}`).toBe(true);
  expect(url.search).toBe('');
});
it('encodes reserved characters into a single download path segment', () => {
  const value = 'sample/path?query#fragment';
  expect(downloadUrl(value) === `${siteOrigin('guide')}/api/download/${encodeURIComponent(value)}`).toBe(true);
});

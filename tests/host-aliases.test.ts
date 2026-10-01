import { describe, expect, it } from 'vitest';
import { resolveRequest } from '@/sites/resolve';
import { HOST_ALIASES, siteForHost } from '@/sites/registry';

describe('host aliases', () => {
  it('301s an alias to its brand canonical host, keeping path and query', () => {
    const r = resolveRequest({ host: 'www.woneninparaguay.nl', pathname: '/guides', search: '?a=1' });
    expect(r).toEqual({ type: 'redirect', url: 'https://paraguayresidency.co.uk/guides?a=1', status: 301 });
  });
  it('sends the root of a keyword domain to its landing page', () => {
    const r = resolveRequest({ host: 'permanentresidencyparaguay.com', pathname: '/' });
    expect(r).toMatchObject({ type: 'redirect', url: 'https://paraguayresidency.co.uk/residency/permanent-residency' });
  });
  it('serves paraguayresidency.uk as the hub for now', () => {
    expect(siteForHost('paraguayresidency.uk')?.key).toBe('residency');
  });
  it('never lists a brand host as an alias', () => {
    for (const host of Object.keys(HOST_ALIASES)) expect(siteForHost(host)).toBeUndefined();
  });
});

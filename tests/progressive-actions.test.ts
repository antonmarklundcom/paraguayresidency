import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  headers: new Headers({ host: 'residency.localhost:3100', referer: 'http://residency.localhost:3100/contact?utm_source=test' }),
  lead: vi.fn(), subscribe: vi.fn(), magic: vi.fn(), redirect: vi.fn(),
}));
vi.mock('next/headers', () => ({ headers: async () => mocks.headers, cookies: async () => ({ get: () => undefined }) }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { mocks.redirect(url); throw new Error('NEXT_REDIRECT'); } }));
vi.mock('@/lib/leads', () => ({ createLead: mocks.lead }));
vi.mock('@/lib/subscribers', () => ({ subscribe: mocks.subscribe }));
vi.mock('@/app/(en)/api/auth/magic/route', () => ({ POST: mocks.magic }));
vi.mock('@/lib/rate-limit', () => ({ clientIp: () => 'local', takeLimit: () => ({ ok: true }), subscribeLimit: () => 'allowed', SUBSCRIBE_PENDING_MESSAGE: 'Check your inbox.', RATE_LIMIT_MESSAGE: 'Try later.' }));
import { submitLeadAction, submitLeadFormAction, subscribeFormAction, magicLinkFormAction } from '@/app/actions/lead';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.headers.set('referer', 'http://residency.localhost:3100/contact?utm_source=test');
  mocks.lead.mockResolvedValue({ ok: true, stored: true });
  mocks.subscribe.mockResolvedValue({ ok: true, state: 'pending' });
  mocks.magic.mockResolvedValue(Response.json({ ok: true }));
});
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ site: 'residency', kind: 'contact', email: 'visitor@example.invalid', pagePath: '/contact', website: '', ts: 'fixture' })) data.set(key, value);
  return data;
}
it('native LeadForm submits fields and redirects back with lead=ok, preserving attribution', async () => {
  await expect(submitLeadFormAction(form())).rejects.toThrow('NEXT_REDIRECT');
  expect(mocks.lead).toHaveBeenCalledWith(expect.objectContaining({ email: 'visitor@example.invalid', kind: 'contact' }), expect.objectContaining({ honeypot: '', timestamp: 'fixture' }));
  expect(mocks.redirect).toHaveBeenCalledWith('/contact?utm_source=test&lead=ok');
});
it('native LeadForm validation failure redirects with an error indicator', async () => {
  mocks.lead.mockResolvedValue({ ok: false, errors: { email: 'Invalid email' } });
  await expect(submitLeadFormAction(form())).rejects.toThrow('NEXT_REDIRECT');
  expect(mocks.redirect).toHaveBeenCalledWith('/contact?utm_source=test&lead=error');
});
it('enhanced lead submissions retain inline field errors and never redirect', async () => {
  mocks.lead.mockResolvedValue({ ok: false, errors: { email: 'Invalid email' } });
  expect(await submitLeadAction({ status: 'idle' }, form())).toEqual({ status: 'error', errors: { email: 'Invalid email' } });
  expect(mocks.redirect).not.toHaveBeenCalled();
});
it('native newsletter signup redirects after the subscription succeeds', async () => {
  await expect(subscribeFormAction(form())).rejects.toThrow('NEXT_REDIRECT');
  expect(mocks.subscribe).toHaveBeenCalledWith(expect.objectContaining({ email: 'visitor@example.invalid' }), expect.objectContaining({ honeypot: '' }));
  expect(mocks.redirect).toHaveBeenCalledWith('/contact?utm_source=test&newsletter=ok');
});
it('native newsletter failures are not reported as success', async () => {
  mocks.subscribe.mockResolvedValue({ ok: false, error: 'Unavailable' });
  await expect(subscribeFormAction(form())).rejects.toThrow('NEXT_REDIRECT');
  expect(mocks.redirect).toHaveBeenCalledWith('/contact?utm_source=test&newsletter=error');
});
it('native magic-link requests reuse the existing API and redirect with its neutral success', async () => {
  await expect(magicLinkFormAction(form())).rejects.toThrow('NEXT_REDIRECT');
  const request = mocks.magic.mock.calls[0][0] as Request;
  expect(await request.json()).toMatchObject({ email: 'visitor@example.invalid', website: '', site: 'residency' });
  expect(mocks.redirect).toHaveBeenCalledWith('/contact?utm_source=test&magic=ok');
});
it('redirect destinations cannot leave the current origin', async () => {
  mocks.headers.set('referer', 'https://outside.invalid/contact');
  const data = form(); data.set('pagePath', '//outside.invalid');
  await expect(submitLeadFormAction(data)).rejects.toThrow('NEXT_REDIRECT');
  expect(mocks.redirect).toHaveBeenCalledWith('/?lead=ok');
});

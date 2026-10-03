import { afterEach, describe, expect, it, vi } from 'vitest';
import { crmStatusLabel } from '@/lib/crm-status';
import { sendToVenderCrm } from '@/lib/vendercrm';

/**
 * O26 bug 7. VenderCRM's /api/v1/leads requires `phone` (the contact identity,
 * `vendercrm-lead-capture` skill), so an email-only lead cannot be sent. The
 * skip is kept, but it is now visible in /admin/leads instead of a silent
 * "pending". Form fields are unchanged.
 */
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('a lead without a phone', () => {
  it('is not sent to the CRM even when the CRM is configured', async () => {
    vi.stubEnv('VENDERCRM_API_URL', 'https://crm.example.test');
    vi.stubEnv('VENDERCRM_API_KEY', 'k');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const outcome = await sendToVenderCrm({ phone: '', email: 'only@email.test' }, 'residency');
    expect(outcome).toEqual({ status: 'skipped', reason: 'no-phone' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows as "skipped: no phone" in the admin, not a bare "pending"', () => {
    // `setCrmStatus` stores the outcome plus a timestamp on crm_response.
    const stored = { status: 'skipped', reason: 'no-phone', at: '2026-10-03T00:00:00.000Z' };
    expect(crmStatusLabel('pending', stored)).toBe('skipped: no phone');
    expect(crmStatusLabel('pending', { status: 'skipped', reason: 'not-configured' })).toBe('skipped: CRM not configured');
  });

  it('leaves every other state as it was', () => {
    expect(crmStatusLabel('pending', null)).toBe('pending');
    expect(crmStatusLabel('sent', { status: 'sent', httpStatus: 201 })).toBe('sent');
    expect(crmStatusLabel('failed', { status: 'failed', httpStatus: 422 })).toBe('failed');
  });
});

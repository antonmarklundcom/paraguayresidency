import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from '@/lib/analytics';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('track', () => {
  it('silently no-ops in plain Node without window', () => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
    vi.stubGlobal('window', undefined);
    const error = vi.spyOn(console, 'error');
    expect(() => track('lead_submitted')).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });
  it('silently no-ops when the script is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
    vi.stubGlobal('window', {});
    const error = vi.spyOn(console, 'error');
    expect(() => track('lead_submitted')).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });
  it.each([undefined, 'false', 'TRUE'])('requires the exact enabled flag (%s)', (flag) => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', flag);
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    track('lead_submitted');
    expect(plausible).not.toHaveBeenCalled();
  });
  it.each(['lead_submitted', 'newsletter_subscribed', 'checkout_started', 'quiz_completed'])('forwards %s and only supplied context', (name) => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    track(name, { site: 'guide' });
    expect(plausible).toHaveBeenCalledExactlyOnceWith(name, { props: { site: 'guide' } });
  });
  it('supports events without properties', () => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    track('quiz_completed');
    expect(plausible).toHaveBeenCalledExactlyOnceWith('quiz_completed', undefined);
  });
  it.each([{}, () => { throw new Error('script failure'); }])('silently tolerates a broken script', (plausible) => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
    vi.stubGlobal('window', { plausible });
    const error = vi.spyOn(console, 'error');
    expect(() => track('checkout_started')).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });
});

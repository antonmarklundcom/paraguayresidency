import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetAllForTests,
  clientIp,
  peek,
  reset,
  take,
  windowCount,
} from '@/lib/rate-limit';
import { freeAccessIds, freeAccessMode } from '@/app/api/checkout/route';

/**
 * O17 §14.1.6 — `FREE_ACCESS_MODE` and the limiter O18 will reuse everywhere.
 */

beforeEach(() => __resetAllForTests());
afterEach(() => vi.unstubAllEnvs());

describe('take — a fixed window over a Map', () => {
  const HOUR = 60 * 60 * 1000;
  const t0 = 1_800_000_000_000;

  it('allows exactly `max` calls and refuses the next', () => {
    for (let i = 1; i <= 5; i += 1) {
      expect(take('ip:1.2.3.4', 5, HOUR, t0).ok).toBe(true);
    }
    expect(take('ip:1.2.3.4', 5, HOUR, t0).ok).toBe(false);
  });

  it('reports what is left and when the window ends', () => {
    const first = take('ip:5.6.7.8', 3, HOUR, t0);
    expect(first.remaining).toBe(2);
    expect(first.resetAt).toBe(t0 + HOUR);
    expect(first.retryAfterSeconds).toBe(3600);
  });

  it('opens a fresh window once the old one has passed', () => {
    for (let i = 0; i < 5; i += 1) take('ip:9.9.9.9', 5, HOUR, t0);
    expect(take('ip:9.9.9.9', 5, HOUR, t0).ok).toBe(false);
    expect(take('ip:9.9.9.9', 5, HOUR, t0 + HOUR + 1).ok).toBe(true);
  });

  it('keeps different keys in different buckets', () => {
    for (let i = 0; i < 5; i += 1) take('ip:a', 5, HOUR, t0);
    expect(take('ip:a', 5, HOUR, t0).ok).toBe(false);
    expect(take('ip:b', 5, HOUR, t0).ok).toBe(true);
  });

  it('peek reads without spending a call', () => {
    for (let i = 0; i < 4; i += 1) take('ip:peek', 5, HOUR, t0);
    expect(peek('ip:peek', 5, t0)).toBe(true);
    expect(peek('ip:peek', 5, t0)).toBe(true);
    take('ip:peek', 5, HOUR, t0);
    expect(peek('ip:peek', 5, t0)).toBe(false);
  });

  it('reset forgets ONE key — there is no global clear (the §1.7 bug)', () => {
    take('ip:keep', 5, HOUR, t0);
    take('ip:drop', 5, HOUR, t0);
    reset('ip:drop');
    expect(windowCount()).toBe(1);
    expect(peek('ip:keep', 1, t0)).toBe(false);
  });

  it('evicts expired windows lazily rather than growing forever', () => {
    for (let i = 0; i < 300; i += 1) take(`ip:evict-${i}`, 5, HOUR, t0);
    expect(windowCount()).toBeGreaterThan(250);
    // A later call sweeps: every window above has expired by then.
    for (let i = 0; i < 300; i += 1) take('ip:later', 5000, HOUR, t0 + HOUR + 1);
    expect(windowCount()).toBeLessThan(10);
  });
});

describe('clientIp', () => {
  const headers = (map: Record<string, string>) => ({
    get: (name: string) => map[name] ?? null,
  });

  it('takes the first hop of x-forwarded-for — the client behind the proxy', () => {
    expect(clientIp(headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
  });

  it('falls back to x-real-ip, then to a constant bucket', () => {
    expect(clientIp(headers({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
    expect(clientIp(headers({}))).toBe('unknown');
  });
});

describe('freeAccessMode — the temporary Stripe bypass', () => {
  it('is off unless the flag is exactly "true"', () => {
    expect(freeAccessMode({} as NodeJS.ProcessEnv)).toBe(false);
    expect(freeAccessMode({ FREE_ACCESS_MODE: 'yes' } as NodeJS.ProcessEnv)).toBe(false);
    expect(freeAccessMode({ FREE_ACCESS_MODE: 'true' } as NodeJS.ProcessEnv)).toBe(true);
  });

  it('REFUSES to run next to a live Stripe key, whatever the flag says', () => {
    expect(
      freeAccessMode({
        FREE_ACCESS_MODE: 'true',
        STRIPE_SECRET_KEY: 'sk_live_realkey',
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it('ignores an empty STRIPE_SECRET_KEY, which is how .env.example ships', () => {
    expect(
      freeAccessMode({ FREE_ACCESS_MODE: 'true', STRIPE_SECRET_KEY: '  ' } as NodeJS.ProcessEnv),
    ).toBe(true);
  });
});

describe('the second free buyer succeeds (P0 §1.3)', () => {
  it('gives every free purchase a DISTINCT provider_order_id', () => {
    const ids = Array.from({ length: 50 }, () => freeAccessIds().providerOrderId);
    expect(new Set(ids).size).toBe(50);
    // The old value was the constant 'free-access-mode', which collided on
    // `purchases_provider_order_uq` and 500'd every buyer after the first.
    expect(ids).not.toContain('free-access-mode');
  });

  it('uses the checkout id as the order id, so both are unique together', () => {
    const { checkoutId, providerOrderId } = freeAccessIds();
    expect(providerOrderId).toBe(checkoutId);
    expect(checkoutId.startsWith('free_')).toBe(true);
  });
});

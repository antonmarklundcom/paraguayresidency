import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fallbackPriceCents } from '@/lib/purchases';
import { DEFAULT_GUIDE_PRICE_CENTS } from '@/lib/pricing-defaults';

afterEach(() => vi.unstubAllEnvs());

describe('Guide entry price', () => {
  it('defaults to 700 cents when the environment override is unset', () => {
    vi.stubEnv('GUIDE_PRICE_CENTS', undefined);
    expect(fallbackPriceCents()).toBe(700);
    expect(fallbackPriceCents()).toBe(DEFAULT_GUIDE_PRICE_CENTS);
  });

  it.each(['', ' ', 'invalid', '0', '-1'])('uses the default for invalid override %j', (raw) => {
    vi.stubEnv('GUIDE_PRICE_CENTS', raw);
    expect(fallbackPriceCents()).toBe(DEFAULT_GUIDE_PRICE_CENTS);
  });

  it.each([['1200', 1200], ['1200.5', 1200], ['1200cents', 1200]])(
    'preserves integer parsing for override %j', (raw, expected) => {
      vi.stubEnv('GUIDE_PRICE_CENTS', raw);
      expect(fallbackPriceCents()).toBe(expected);
    },
  );

  it('seeds the entry product using the same shared default', () => {
    // Inspect the seed wiring without executing its database writes.
    const seed = readFileSync('scripts/seed.ts', 'utf8');
    expect(seed).toMatch(/import\s*\{\s*DEFAULT_GUIDE_PRICE_CENTS\s*\}\s*from\s*['"]\.\.\/src\/lib\/pricing-defaults['"]/);
    expect(seed).toMatch(/const entryPrice\s*=\s*positiveInt\('GUIDE_PRICE_CENTS',\s*DEFAULT_GUIDE_PRICE_CENTS\)/);
    expect(seed).toMatch(/priceCents:\s*entryPrice/);
  });
});

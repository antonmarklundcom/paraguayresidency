import { describe, expect, it } from 'vitest';
import { siteEnum } from '@/db/schema';
import { SITE_KEYS, sites } from '@/sites/registry';

/**
 * The `site` enum column and the registry are two hand-maintained lists of the
 * same thing (plan §2). Adding a brand to one and forgetting the other means
 * every row for the new brand is rejected by MySQL at insert time — in
 * production, on the first lead. This test is the only thing that stops it.
 */
describe('siteEnum mirrors SITE_KEYS', () => {
  it('is identical, in the same order', () => {
    expect([...siteEnum]).toEqual([...SITE_KEYS]);
  });

  it('covers every registry entry', () => {
    expect(Object.keys(sites).sort()).toEqual([...SITE_KEYS].sort());
  });

  it('has no duplicates', () => {
    expect(new Set(siteEnum).size).toBe(siteEnum.length);
  });
});

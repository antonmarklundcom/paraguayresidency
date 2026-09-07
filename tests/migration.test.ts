import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'drizzle');
const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();
const o9 = readFileSync(join(DIR, '0001_o9_platform.sql'), 'utf8');

/**
 * `orders` → `purchases` carries live paid orders across (plan §5.4.3 trap).
 * drizzle-kit's generator wanted to DROP and re-CREATE, which would have
 * deleted every one of them. These assertions are what stops that being
 * reintroduced by a careless regenerate.
 */
describe('the O9 migration never drops a table that holds money', () => {
  it('renames orders instead of dropping it', () => {
    expect(o9).toMatch(/RENAME TABLE `orders` TO `purchases`/);
    expect(o9).not.toMatch(/DROP TABLE `orders`/);
    expect(o9).not.toMatch(/CREATE TABLE `purchases`/);
  });

  it('changes the money columns in place rather than adding and dropping', () => {
    expect(o9).toMatch(/CHANGE COLUMN `stripe_session_id` `provider_checkout_id`/);
    expect(o9).toMatch(/CHANGE COLUMN `stripe_payment_intent` `provider_order_id`/);
  });

  it('renames download_tokens.order_id so the tokens keep their purchase', () => {
    expect(o9).toMatch(/CHANGE COLUMN `order_id` `purchase_id`/);
    expect(o9).not.toMatch(/ALTER TABLE `download_tokens` DROP COLUMN `order_id`/);
  });

  it('keeps a configured Stripe price id by renaming the column', () => {
    expect(o9).toMatch(/CHANGE COLUMN `stripe_price_id` `provider_price_id`/);
    expect(o9).not.toMatch(/ALTER TABLE `products` DROP COLUMN `stripe_price_id`/);
  });

  it('re-slugs the O2 product in place, so purchases keep their product_id', () => {
    expect(o9).toMatch(/UPDATE `products` SET `slug` = 'guide-entry'/);
    expect(o9).not.toMatch(/DELETE FROM `products`/);
  });

  it('drops no table and no data-bearing column anywhere in the history', () => {
    for (const file of files) {
      const sql = readFileSync(join(DIR, file), 'utf8');
      expect(sql, `${file} drops a table`).not.toMatch(/^\s*DROP TABLE/m);
    }
  });

  it('is applied after the O1 migration, exactly once', () => {
    const journal = JSON.parse(readFileSync(join(DIR, 'meta/_journal.json'), 'utf8')) as {
      entries: { tag: string; idx: number }[];
    };
    const tags = journal.entries.map((e) => e.tag);
    expect(tags).toEqual(['0000_green_lord_hawal', '0001_o9_platform']);
    expect(new Set(tags).size).toBe(tags.length);
  });
});

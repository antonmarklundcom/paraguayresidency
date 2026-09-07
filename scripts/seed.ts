/**
 * `npm run db:seed` — idempotent. Safe to run twice; the second run updates
 * nothing it should not and inserts nothing twice (plan §5.1.3).
 *
 * Seeds: the admin user (from env), the Guide product row, and the
 * `facts_verification` mirror of `content/shared/facts.ts`.
 *
 * Requires DATABASE_URL. Never runs at build time.
 */
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDb, hasDatabase } from '../src/db';
import { factsVerification, products, users } from '../src/db/schema';
import { getFact, factKeys } from '../content/shared/facts';
import { GUIDE_ENTRY_SLUG, GUIDE_INSIDER_SLUG } from '../src/sites/registry';

function positiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return parsed;
}

/**
 * Idempotent by `products.slug`. A second run updates the row in place and
 * inserts nothing, so re-seeding a live database is safe (plan §5.4.3).
 */
async function upsertProduct(row: typeof products.$inferInsert) {
  await getDb()
    .insert(products)
    .values(row)
    .onDuplicateKeyUpdate({
      set: {
        site: sql`values(site)`,
        name: sql`values(name)`,
        tier: sql`values(tier)`,
        kind: sql`values(kind)`,
        provider: sql`values(provider)`,
        // Never blank a live processor id just because the env var is not set
        // in the shell that happens to be re-running the seed.
        providerPriceId: sql`coalesce(values(provider_price_id), provider_price_id)`,
        priceCents: sql`values(price_cents)`,
        currency: sql`values(currency)`,
        interval: sql`values(\`interval\`)`,
        fileKey: sql`coalesce(values(file_key), file_key)`,
        version: sql`values(version)`,
        active: sql`values(active)`,
      },
    });
}

async function main() {
  if (!hasDatabase()) {
    console.error('DATABASE_URL is not set. Set it (see .env.example) and re-run `npm run db:seed`.');
    process.exit(1);
  }
  const db = getDb();

  // 1. Admin user — created once; an existing row keeps its password unless
  //    SEED_FORCE_PASSWORD=1, so re-seeding never silently resets a login.
  const email = (process.env.SEED_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? '';
  if (!email || !password) {
    console.warn('· admin user skipped (set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD)');
  } else {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!existing) {
      await db.insert(users).values({
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'admin',
        name: process.env.SEED_ADMIN_NAME ?? null,
      });
      console.log(`· admin user created: ${email}`);
    } else if (process.env.SEED_FORCE_PASSWORD === '1') {
      await db
        .update(users)
        .set({ passwordHash: await bcrypt.hash(password, 12), role: 'admin' })
        .where(eq(users.email, email));
      console.log(`· admin user password reset: ${email}`);
    } else {
      console.log(`· admin user already present: ${email}`);
    }
  }

  // 2. The two products the platform sells (plan §5.4.3, §12.2).
  //
  //    `guide-entry`   — the $7 one-time Guide, Stripe.
  //    `guide-insider` — the recurring membership, Lemon Squeezy.
  //
  //    Missing Lemon Squeezy keys never block (plan §4.5): the Insider row is
  //    seeded INACTIVE, and the checkout answers "coming soon" until the
  //    variant id is set.
  const entryPrice = positiveInt('GUIDE_PRICE_CENTS', 700);
  const insiderPrice = positiveInt('INSIDER_PRICE_CENTS', 900);
  const insiderVariant = (process.env.LEMONSQUEEZY_INSIDER_VARIANT_ID ?? '').trim() || null;
  const insiderInterval = process.env.INSIDER_INTERVAL === 'year' ? 'year' : 'month';

  await upsertProduct({
    slug: GUIDE_ENTRY_SLUG,
    site: 'guide',
    name: process.env.GUIDE_PRODUCT_NAME ?? 'The Paraguay Residency Guide',
    tier: 'entry',
    kind: 'one_time',
    provider: 'stripe',
    providerPriceId: process.env.STRIPE_GUIDE_PRICE_ID ?? null,
    priceCents: entryPrice,
    currency: process.env.GUIDE_CURRENCY ?? 'USD',
    interval: null,
    fileKey: process.env.GUIDE_FILE_KEY ?? 'guide-placeholder.pdf',
    version: process.env.GUIDE_VERSION ?? '1',
    active: true,
  });
  console.log(`· product "${GUIDE_ENTRY_SLUG}" upserted at ${entryPrice} cents (stripe)`);

  await upsertProduct({
    slug: GUIDE_INSIDER_SLUG,
    site: 'guide',
    name: process.env.INSIDER_PRODUCT_NAME ?? 'Paraguay Residency Insider',
    tier: 'insider',
    kind: 'subscription',
    provider: 'lemonsqueezy',
    providerPriceId: insiderVariant,
    priceCents: insiderPrice,
    currency: process.env.INSIDER_CURRENCY ?? 'USD',
    interval: insiderInterval,
    fileKey: null,
    version: process.env.INSIDER_VERSION ?? '1',
    active: Boolean(insiderVariant),
  });
  console.log(
    `· product "${GUIDE_INSIDER_SLUG}" upserted at ${insiderPrice} cents/${insiderInterval} ` +
      `(lemonsqueezy, ${insiderVariant ? 'active' : 'INACTIVE — LEMONSQUEEZY_INSIDER_VARIANT_ID is not set'})`,
  );

  // 3. Facts mirror. `facts.ts` stays the source of the copy; this table only
  //    carries verification state, so the seed inserts missing keys and leaves
  //    an admin's later verification untouched.
  for (const key of factKeys) {
    const fact = getFact(key);
    await db
      .insert(factsVerification)
      .values({
        key,
        verifiedBy: fact.verifiedBy ?? null,
        verifiedOn: fact.verifiedOn ? new Date(fact.verifiedOn) : null,
        note: fact.note ?? null,
      })
      .onDuplicateKeyUpdate({ set: { key: sql`values(\`key\`)` } });
  }
  console.log(`· ${factKeys.length} facts mirrored`);

  console.log('seed complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('seed failed:', err);
  process.exit(1);
});

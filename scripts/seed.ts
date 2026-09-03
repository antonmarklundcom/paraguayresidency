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

const GUIDE_SLUG = 'paraguay-residency-guide';

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

  // 2. The Guide product (plan §1.5 — price is an env value, default 4900).
  const priceCents = Number.parseInt(process.env.GUIDE_PRICE_CENTS ?? '4900', 10);
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    throw new Error(`GUIDE_PRICE_CENTS must be a positive integer, got "${process.env.GUIDE_PRICE_CENTS}"`);
  }
  await db
    .insert(products)
    .values({
      slug: GUIDE_SLUG,
      name: 'The Paraguay Residency Guide',
      priceCents,
      currency: process.env.GUIDE_CURRENCY ?? 'USD',
      stripePriceId: process.env.STRIPE_GUIDE_PRICE_ID ?? null,
      fileKey: process.env.GUIDE_FILE_KEY ?? 'guide-placeholder.pdf',
      version: process.env.GUIDE_VERSION ?? '1',
      active: true,
    })
    .onDuplicateKeyUpdate({
      set: {
        name: sql`values(name)`,
        priceCents: sql`values(price_cents)`,
        currency: sql`values(currency)`,
        stripePriceId: sql`values(stripe_price_id)`,
        fileKey: sql`values(file_key)`,
        version: sql`values(version)`,
        active: sql`values(active)`,
      },
    });
  console.log(`· product "${GUIDE_SLUG}" upserted at ${priceCents} cents`);

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

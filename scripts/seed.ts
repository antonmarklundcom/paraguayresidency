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
import {
  factsVerification,
  lessons,
  modules,
  products,
  resources,
  updatesPosts,
  users,
} from '../src/db/schema';
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

  // 4. Guide member content (plan §6.9). The pararesi import (plan §5.4.8)
  //    writes real modules/lessons when Anton supplies `PARARESI_DATABASE_URL`;
  //    until then — and S15's dry run found no pararesi database at all — this
  //    is what makes the member area non-empty, from `docs/guide-outline.md`'s
  //    twelve chapters plus one Insider-only module that demonstrates drip.
  //    Idempotent on (site, slug) / (moduleId, slug), same pattern as above.
  await seedGuideMemberContent(db);

  console.log('seed complete.');
  process.exit(0);
}

interface SeedModule {
  slug: string;
  title: string;
  description: string;
  sort: number;
  minTier: 'entry' | 'insider';
  dripDays: number;
  lessons: { slug: string; title: string; sort: number; dripDays: number; contentPath: string }[];
}

/**
 * Plan §6.9's chapter outline as modules/lessons — four entry-tier modules
 * covering the twelve chapters (open the moment someone buys the guide; they
 * paid for the whole book, so nothing here drips), plus two Insider-only
 * modules where the SECOND one carries a real `dripDays` so a fresh Insider
 * fixture user actually sees the "unlocks on date" state, not just "locked"
 * and "open" (plan §6.9 exit: "drip dates honoured").
 */
const GUIDE_MODULES: SeedModule[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    description: 'Why Paraguay, the three routes compared, and documents by nationality.',
    sort: 1,
    minTier: 'entry',
    dripDays: 0,
    lessons: [
      { slug: 'why-paraguay-and-why-not', title: 'Why Paraguay (and why not)', sort: 1, dripDays: 0, contentPath: 'guide/members/getting-started/why-paraguay-and-why-not.mdx' },
      { slug: 'the-routes-compared', title: 'The routes compared', sort: 2, dripDays: 0, contentPath: 'guide/members/getting-started/the-routes-compared.mdx' },
      { slug: 'documents-by-nationality', title: 'Documents, apostilles, translations by nationality', sort: 3, dripDays: 0, contentPath: 'guide/members/getting-started/documents-by-nationality.mdx' },
    ],
  },
  {
    slug: 'costs-and-timeline',
    title: 'Costs & timeline',
    description: 'Real costs, and the week-by-week timeline.',
    sort: 2,
    minTier: 'entry',
    dripDays: 0,
    lessons: [
      { slug: 'real-costs', title: 'Costs, real ones', sort: 1, dripDays: 0, contentPath: 'guide/members/costs-and-timeline/real-costs.mdx' },
      { slug: 'timeline-week-by-week', title: 'Timeline week by week', sort: 2, dripDays: 0, contentPath: 'guide/members/costs-and-timeline/timeline-week-by-week.mdx' },
    ],
  },
  {
    slug: 'after-approval',
    title: 'After approval',
    description: 'Cédula, RUC, banking, taxes and family.',
    sort: 3,
    minTier: 'entry',
    dripDays: 0,
    lessons: [
      { slug: 'cedula-and-ruc', title: 'Cédula and RUC', sort: 1, dripDays: 0, contentPath: 'guide/members/after-approval/cedula-and-ruc.mdx' },
      { slug: 'banking', title: 'Banking', sort: 2, dripDays: 0, contentPath: 'guide/members/after-approval/banking.mdx' },
      { slug: 'taxes-for-residents', title: 'Taxes for residents', sort: 3, dripDays: 0, contentPath: 'guide/members/after-approval/taxes-for-residents.mdx' },
      { slug: 'family', title: 'Family', sort: 4, dripDays: 0, contentPath: 'guide/members/after-approval/family.mdx' },
    ],
  },
  {
    slug: 'next-steps',
    title: 'Next steps & mistakes to avoid',
    description: 'The Investor Pass, common mistakes, and the working checklists.',
    sort: 4,
    minTier: 'entry',
    dripDays: 0,
    lessons: [
      { slug: 'investor-pass-overview', title: 'Investor Pass overview', sort: 1, dripDays: 0, contentPath: 'guide/members/next-steps/investor-pass-overview.mdx' },
      { slug: 'mistakes-we-see-monthly', title: 'Mistakes we see monthly', sort: 2, dripDays: 0, contentPath: 'guide/members/next-steps/mistakes-we-see-monthly.mdx' },
      { slug: 'checklists', title: 'Checklists', sort: 3, dripDays: 0, contentPath: 'guide/members/next-steps/checklists.mdx' },
    ],
  },
  {
    slug: 'insider-extras',
    title: 'Insider extras',
    description: 'What Insider adds on top of the guide.',
    sort: 5,
    minTier: 'insider',
    dripDays: 0,
    lessons: [
      { slug: 'welcome-to-insider', title: 'Welcome to Insider', sort: 1, dripDays: 0, contentPath: 'guide/members/insider-extras/welcome-to-insider.mdx' },
    ],
  },
  {
    slug: 'insider-deep-dives',
    title: 'Insider deep dives',
    description: 'The monthly deep dive — goes further than the guide has room for.',
    sort: 6,
    minTier: 'insider',
    dripDays: 30,
    lessons: [
      { slug: 'this-months-deep-dive', title: "This month's deep dive: reading a processing delay correctly", sort: 1, dripDays: 30, contentPath: 'guide/members/insider-deep-dives/this-months-deep-dive.mdx' },
    ],
  },
];

const GUIDE_RESOURCES = [
  {
    slug: 'document-checklist',
    title: 'Document checklist (all nationalities)',
    description: 'The chapter 12 checklist as a standalone, printable download.',
    fileKey: 'document-checklist-placeholder.pdf',
    minTier: 'entry' as const,
    sort: 1,
  },
  {
    slug: 'insider-case-studies',
    title: 'Insider case studies pack',
    description: 'Anonymised case studies referenced in the Insider deep dives.',
    fileKey: 'insider-case-studies-placeholder.pdf',
    minTier: 'insider' as const,
    sort: 2,
  },
];

const GUIDE_UPDATES = [
  { slug: 'insider-launch', title: 'Insider is live', publishedAt: '2026-09-09', contentPath: 'guide/updates/insider-launch.mdx' },
  { slug: 'document-requirement-note', title: 'A note on police certificate validity windows', publishedAt: '2026-09-05', contentPath: 'guide/updates/document-requirement-note.mdx' },
  { slug: 'whats-next', title: 'What we are working on next', publishedAt: '2026-09-01', contentPath: 'guide/updates/whats-next.mdx' },
];

async function seedGuideMemberContent(db: ReturnType<typeof getDb>): Promise<void> {
  let moduleCount = 0;
  let lessonCount = 0;

  for (const mod of GUIDE_MODULES) {
    await db
      .insert(modules)
      .values({
        site: 'guide',
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        sort: mod.sort,
        minTier: mod.minTier,
        dripDays: mod.dripDays,
        active: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sql`values(title)`,
          description: sql`values(description)`,
          sort: sql`values(sort)`,
          minTier: sql`values(min_tier)`,
          dripDays: sql`values(drip_days)`,
          active: sql`values(active)`,
        },
      });
    moduleCount += 1;

    const [row] = await db
      .select({ id: modules.id })
      .from(modules)
      .where(sql`${modules.site} = 'guide' AND ${modules.slug} = ${mod.slug}`)
      .limit(1);
    if (!row) continue;

    for (const lesson of mod.lessons) {
      await db
        .insert(lessons)
        .values({
          moduleId: row.id,
          slug: lesson.slug,
          title: lesson.title,
          sort: lesson.sort,
          minTier: mod.minTier,
          dripDays: lesson.dripDays,
          contentPath: lesson.contentPath,
          active: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            title: sql`values(title)`,
            sort: sql`values(sort)`,
            minTier: sql`values(min_tier)`,
            dripDays: sql`values(drip_days)`,
            contentPath: sql`values(content_path)`,
            active: sql`values(active)`,
          },
        });
      lessonCount += 1;
    }
  }
  console.log(`· ${moduleCount} guide modules / ${lessonCount} lessons upserted`);

  for (const resource of GUIDE_RESOURCES) {
    await db
      .insert(resources)
      .values({
        site: 'guide',
        slug: resource.slug,
        title: resource.title,
        description: resource.description,
        fileKey: resource.fileKey,
        minTier: resource.minTier,
        sort: resource.sort,
        active: true,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sql`values(title)`,
          description: sql`values(description)`,
          fileKey: sql`values(file_key)`,
          minTier: sql`values(min_tier)`,
          sort: sql`values(sort)`,
          active: sql`values(active)`,
        },
      });
  }
  console.log(`· ${GUIDE_RESOURCES.length} guide resources upserted`);

  for (const update of GUIDE_UPDATES) {
    await db
      .insert(updatesPosts)
      .values({
        site: 'guide',
        slug: update.slug,
        title: update.title,
        minTier: 'insider',
        publishedAt: new Date(`${update.publishedAt}T00:00:00Z`),
        contentPath: update.contentPath,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sql`values(title)`,
          publishedAt: sql`values(published_at)`,
          contentPath: sql`values(content_path)`,
        },
      });
  }
  console.log(`· ${GUIDE_UPDATES.length} guide updates posts upserted`);
}

main().catch((err) => {
  console.error('seed failed:', err);
  process.exit(1);
});

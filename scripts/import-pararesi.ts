/**
 * `npm run import:pararesi -- --dry-run` — pararesi → this app (plan §5.4.8).
 *
 * O9 writes and proves it; S15 runs it for real against the live pararesi
 * database. The mapping itself lives in `src/lib/pararesi-import.ts` as a pure
 * function so `tests/pararesi-import.test.ts` exercises it against a fixture
 * of pararesi's shape rather than against production.
 *
 * Idempotent: every write is an upsert on a natural key (email, provider id,
 * slug), and every MDX file is written by path. Running it twice changes
 * nothing the second time.
 *
 *   PARARESI_DATABASE_URL   read-only credentials for pararesi's MySQL
 *   PARARESI_AMOUNT_UNIT    cents | dollars — how to read `purchases.amountUsd`
 *   --dry-run               print the plan and write nothing
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';
import { eq, and, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '../src/db';
import {
  lessonProgress as lessonProgressTable,
  lessons as lessonsTable,
  modules as modulesTable,
  products,
  providerCustomers,
  purchases as purchasesTable,
  resources as resourcesTable,
  subscribers as subscribersTable,
  subscriptions as subscriptionsTable,
  updatesPosts as updatesTable,
  users as usersTable,
} from '../src/db/schema';
import { refreshUserTier } from '../src/lib/entitlements';
import {
  buildImportPlan,
  summarise,
  type AmountUnit,
  type ImportPlan,
  type PararesiData,
} from '../src/lib/pararesi-import';

const CONTENT_ROOT = join(process.cwd(), 'content');
const dryRun = process.argv.includes('--dry-run');

async function readPararesi(): Promise<PararesiData> {
  const url = process.env.PARARESI_DATABASE_URL;
  if (!url) throw new Error('PARARESI_DATABASE_URL is not set — nothing to import from.');
  const connection = await mysql.createConnection({ uri: url, timezone: 'Z' });
  const q = async <T>(text: string): Promise<T[]> => {
    const [rows] = await connection.query(text);
    return rows as T[];
  };
  try {
    return {
      users: await q(
        'select id, email, name, role, tier, tier_expires_at as tierExpiresAt, ls_customer_id as lsCustomerId, created_at as createdAt from users',
      ),
      purchases: await q(
        'select id, user_id as userId, ls_order_id as lsOrderId, ls_product_id as lsProductId, ls_variant_id as lsVariantId, product_key as productKey, amount_usd as amountUsd, status, created_at as createdAt from purchases',
      ),
      subscriptions: await q(
        'select id, user_id as userId, ls_subscription_id as lsSubscriptionId, status, renews_at as renewsAt, ends_at as endsAt, created_at as createdAt from subscriptions',
      ),
      modules: await q(
        'select id, slug, title, description, sort_order as sortOrder, min_tier as minTier, status from modules',
      ),
      lessons: await q(
        'select id, module_id as moduleId, slug, title, content_md as contentMd, video_url as videoUrl, sort_order as sortOrder, status from lessons',
      ),
      lessonProgress: await q(
        'select user_id as userId, lesson_id as lessonId, completed_at as completedAt from lesson_progress',
      ),
      resources: await q(
        'select id, title, description, file_url as fileUrl, min_tier as minTier, sort_order as sortOrder, status from resources',
      ),
      updatesPosts: await q(
        'select id, title, content_md as contentMd, min_tier as minTier, published_at as publishedAt, status from updates_posts',
      ),
      blogPosts: await q(
        'select id, slug, title, excerpt, content_md as contentMd, meta_title as metaTitle, meta_description as metaDescription, published_at as publishedAt, status from blog_posts',
      ),
      leads: await q(
        'select id, email, source, confirmed_at as confirmedAt, unsubscribed_at as unsubscribedAt, created_at as createdAt from leads',
      ),
    };
  } finally {
    await connection.end();
  }
}

/** Writes only what changed, so a re-run leaves the working tree clean. */
function writeFiles(plan: ImportPlan): { written: number; unchanged: number } {
  let written = 0;
  let unchanged = 0;
  for (const file of plan.files) {
    const full = join(CONTENT_ROOT, file.path);
    if (existsSync(full) && readFileSync(full, 'utf8') === file.contents) {
      unchanged += 1;
      continue;
    }
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, file.contents, 'utf8');
    written += 1;
  }
  return { written, unchanged };
}

async function apply(plan: ImportPlan): Promise<void> {
  const db = getDb();

  // 1. Users, by email. An existing row keeps its role and password: an admin
  //    here must never be demoted by an import from another app.
  const userIdByEmail = new Map<string, number>();
  for (const user of plan.users) {
    await db
      .insert(usersTable)
      .values({
        email: user.email,
        name: user.name,
        role: 'member',
        tier: user.tier,
        tierExpiresAt: user.tierExpiresAt,
        homeSite: 'guide',
        createdAt: user.createdAt,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: sql`coalesce(values(name), name)`,
          homeSite: sql`coalesce(home_site, values(home_site))`,
        },
      });
    const [row] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .limit(1);
    if (row) userIdByEmail.set(user.email, row.id);
  }

  for (const link of plan.providerCustomers) {
    const userId = userIdByEmail.get(link.userEmail);
    if (!userId) continue;
    await db
      .insert(providerCustomers)
      .values({ userId, provider: 'lemonsqueezy', providerCustomerId: link.providerCustomerId })
      .onDuplicateKeyUpdate({ set: { userId: sql`values(user_id)` } });
  }

  // 2. Products have to exist before anything points at them.
  const productIdBySlug = new Map<string, number>();
  for (const slug of new Set([
    ...plan.purchases.map((p) => p.productSlug),
    ...plan.subscriptions.map((s) => s.productSlug),
  ])) {
    const [row] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!row) throw new Error(`No product row for "${slug}" — run \`npm run db:seed\` first.`);
    productIdBySlug.set(slug, row.id);
  }

  for (const purchase of plan.purchases) {
    const userId = userIdByEmail.get(purchase.userEmail);
    await db
      .insert(purchasesTable)
      .values({
        site: 'guide',
        productId: productIdBySlug.get(purchase.productSlug)!,
        userId: userId ?? null,
        email: purchase.userEmail,
        provider: 'lemonsqueezy',
        providerCheckoutId: purchase.providerCheckoutId,
        providerOrderId: purchase.providerOrderId,
        amountCents: purchase.amountCents,
        currency: purchase.currency,
        status: purchase.status,
        createdAt: purchase.createdAt,
        paidAt: purchase.paidAt,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: sql`values(status)`,
          userId: sql`coalesce(values(user_id), user_id)`,
          amountCents: sql`values(amount_cents)`,
          paidAt: sql`values(paid_at)`,
        },
      });
  }

  for (const subscription of plan.subscriptions) {
    const userId = userIdByEmail.get(subscription.userEmail);
    if (!userId) continue;
    await db
      .insert(subscriptionsTable)
      .values({
        site: 'guide',
        productId: productIdBySlug.get(subscription.productSlug) ?? null,
        userId,
        provider: 'lemonsqueezy',
        providerSubscriptionId: subscription.providerSubscriptionId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        endsAt: subscription.endsAt,
        createdAt: subscription.createdAt,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: sql`values(status)`,
          currentPeriodEnd: sql`values(current_period_end)`,
          endsAt: sql`values(ends_at)`,
        },
      });
  }

  // 3. Course content. Bodies are already on disk as MDX (plan §1.14).
  const moduleIdBySlug = new Map<string, number>();
  for (const courseModule of plan.modules) {
    await db
      .insert(modulesTable)
      .values({
        site: 'guide',
        slug: courseModule.slug,
        title: courseModule.title,
        description: courseModule.description,
        sort: courseModule.sort,
        minTier: courseModule.minTier,
        active: courseModule.active,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sql`values(title)`,
          description: sql`values(description)`,
          sort: sql`values(sort)`,
          minTier: sql`values(min_tier)`,
          active: sql`values(active)`,
        },
      });
    const [row] = await db
      .select({ id: modulesTable.id })
      .from(modulesTable)
      .where(and(eq(modulesTable.site, 'guide'), eq(modulesTable.slug, courseModule.slug)))
      .limit(1);
    if (row) moduleIdBySlug.set(courseModule.slug, row.id);
  }

  const lessonIdByPath = new Map<string, number>();
  for (const lesson of plan.lessons) {
    const moduleId = moduleIdBySlug.get(lesson.moduleSlug);
    if (!moduleId) continue;
    await db
      .insert(lessonsTable)
      .values({
        moduleId,
        slug: lesson.slug,
        title: lesson.title,
        sort: lesson.sort,
        minTier: lesson.minTier,
        contentPath: lesson.contentPath,
        active: lesson.active,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sql`values(title)`,
          sort: sql`values(sort)`,
          minTier: sql`values(min_tier)`,
          contentPath: sql`values(content_path)`,
          active: sql`values(active)`,
        },
      });
    const [row] = await db
      .select({ id: lessonsTable.id })
      .from(lessonsTable)
      .where(and(eq(lessonsTable.moduleId, moduleId), eq(lessonsTable.slug, lesson.slug)))
      .limit(1);
    if (row) lessonIdByPath.set(`${lesson.moduleSlug}/${lesson.slug}`, row.id);
  }

  for (const progress of plan.lessonProgress) {
    const userId = userIdByEmail.get(progress.userEmail);
    const lessonId = lessonIdByPath.get(`${progress.moduleSlug}/${progress.lessonSlug}`);
    if (!userId || !lessonId) continue;
    await db
      .insert(lessonProgressTable)
      .values({ userId, lessonId, completedAt: progress.completedAt })
      .onDuplicateKeyUpdate({ set: { completedAt: sql`values(completed_at)` } });
  }

  for (const resource of plan.resources) {
    await db
      .insert(resourcesTable)
      .values({
        site: 'guide',
        slug: resource.slug,
        title: resource.title,
        description: resource.description,
        fileKey: resource.fileKey,
        minTier: resource.minTier,
        sort: resource.sort,
        active: resource.active,
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

  for (const update of plan.updatesPosts) {
    await db
      .insert(updatesTable)
      .values({
        site: 'guide',
        slug: update.slug,
        title: update.title,
        minTier: update.minTier,
        publishedAt: update.publishedAt,
        contentPath: update.contentPath,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: sql`values(title)`,
          minTier: sql`values(min_tier)`,
          publishedAt: sql`values(published_at)`,
          contentPath: sql`values(content_path)`,
        },
      });
  }

  // 4. pararesi's lead-magnet signups are newsletter subscribers here, and
  //    they keep the consent state they gave pararesi (plan §12.3).
  for (const subscriber of plan.subscribers) {
    await db
      .insert(subscribersTable)
      .values({
        site: 'guide',
        email: subscriber.email,
        source: subscriber.source,
        status: subscriber.status,
        createdAt: subscriber.createdAt,
        confirmedAt: subscriber.confirmedAt,
      })
      // Never re-subscribe someone who unsubscribed here after the first run.
      .onDuplicateKeyUpdate({ set: { source: sql`coalesce(source, values(source))` } });
  }

  // 5. The tier cache follows the imported rows, exactly as a webhook would.
  for (const userId of userIdByEmail.values()) {
    await refreshUserTier(userId);
  }
}

async function main() {
  const unit = (process.env.PARARESI_AMOUNT_UNIT as AmountUnit | undefined) ?? 'auto';
  if (!['cents', 'dollars', 'auto'].includes(unit)) {
    throw new Error(`PARARESI_AMOUNT_UNIT must be "cents" or "dollars", got "${unit}"`);
  }

  const source = await readPararesi();
  const plan = buildImportPlan(source, { amountUnit: unit });

  console.log(dryRun ? '— DRY RUN, nothing will be written —' : '— importing —');
  for (const [table, count] of Object.entries(summarise(plan))) {
    console.log(`  ${table.padEnd(20)} ${count}`);
  }
  for (const warning of plan.warnings) console.warn(`  ! ${warning}`);

  if (dryRun) {
    console.log('\nRe-run without --dry-run to apply. Nothing was written.');
    process.exit(0);
  }

  if (!hasDatabase()) throw new Error('DATABASE_URL is not set — nowhere to import to.');
  const files = writeFiles(plan);
  console.log(`  mdx written ${files.written}, unchanged ${files.unchanged}`);
  await apply(plan);
  console.log('import complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('import failed:', err);
  process.exit(1);
});

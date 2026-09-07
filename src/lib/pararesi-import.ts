import { GUIDE_ENTRY_SLUG, GUIDE_INSIDER_SLUG } from '@/sites/registry';
import type { MinTier, Tier } from '@/db/schema';

/**
 * pararesi → this app (plan §5.4.8, §12.3).
 *
 * The whole mapping is a PURE function: `buildImportPlan(source)` turns
 * pararesi's rows into a plan of upserts and MDX files, and
 * `scripts/import-pararesi.ts` either prints it (`--dry-run`) or applies it.
 * That is what makes the fixture test possible — it runs the real mapping
 * against a tiny copy of pararesi's shape, with no database on either side.
 *
 * Idempotency is designed in, not bolted on: every row carries the natural key
 * the target table is unique on, so a second run updates and inserts nothing
 * twice. The purchase checkout id is `ls_order_<id>` — the SAME string the
 * live Lemon Squeezy webhook writes — so an order that arrives by webhook
 * during the cutover and again by import is one row, not two.
 */

/* ------------------------------------------------------- pararesi's shape */

export interface PararesiUser {
  id: number;
  email: string;
  name: string | null;
  role: 'admin' | 'member';
  tier: 'none' | 'guide' | 'insider';
  tierExpiresAt: Date | string | null;
  lsCustomerId: string | null;
  createdAt: Date | string;
}

export interface PararesiPurchase {
  id: number;
  userId: number;
  lsOrderId: string;
  lsProductId: string;
  lsVariantId: string;
  productKey: string;
  amountUsd: number;
  status: string;
  createdAt: Date | string;
}

export interface PararesiSubscription {
  id: number;
  userId: number;
  lsSubscriptionId: string;
  status: string;
  renewsAt: Date | string | null;
  endsAt: Date | string | null;
  createdAt: Date | string;
}

export interface PararesiModule {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  minTier: 'guide' | 'insider';
  status: 'draft' | 'published';
}

export interface PararesiLesson {
  id: number;
  moduleId: number;
  slug: string;
  title: string;
  contentMd: string;
  videoUrl: string | null;
  sortOrder: number;
  status: 'draft' | 'published';
}

export interface PararesiProgress {
  userId: number;
  lessonId: number;
  completedAt: Date | string;
}

export interface PararesiResource {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  minTier: 'guide' | 'insider';
  sortOrder: number;
  status: 'draft' | 'published';
}

export interface PararesiUpdate {
  id: number;
  title: string;
  contentMd: string;
  minTier: 'guide' | 'insider';
  publishedAt: Date | string | null;
  status: 'draft' | 'published';
}

export interface PararesiBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMd: string;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | string | null;
  status: 'draft' | 'published';
}

export interface PararesiLead {
  id: number;
  email: string;
  source: string;
  confirmedAt: Date | string | null;
  unsubscribedAt: Date | string | null;
  createdAt: Date | string;
}

export interface PararesiData {
  users: PararesiUser[];
  purchases: PararesiPurchase[];
  subscriptions: PararesiSubscription[];
  modules: PararesiModule[];
  lessons: PararesiLesson[];
  lessonProgress: PararesiProgress[];
  resources: PararesiResource[];
  updatesPosts: PararesiUpdate[];
  blogPosts: PararesiBlogPost[];
  leads: PararesiLead[];
}

/* -------------------------------------------------------------- our shape */

export interface PlannedUser {
  email: string;
  name: string | null;
  tier: Tier;
  tierExpiresAt: Date | null;
  createdAt: Date;
  /** pararesi's id, used only to wire the rest of the plan together. */
  sourceId: number;
}

export interface PlannedProviderCustomer {
  userEmail: string;
  providerCustomerId: string;
}

export interface PlannedPurchase {
  userEmail: string;
  productSlug: string;
  providerCheckoutId: string;
  providerOrderId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  paidAt: Date | null;
}

export interface PlannedSubscription {
  userEmail: string;
  productSlug: string;
  providerSubscriptionId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'paused';
  currentPeriodEnd: Date | null;
  endsAt: Date | null;
  createdAt: Date;
}

export interface PlannedModule {
  slug: string;
  title: string;
  description: string | null;
  sort: number;
  minTier: MinTier;
  active: boolean;
  sourceId: number;
}

export interface PlannedLesson {
  moduleSlug: string;
  slug: string;
  title: string;
  sort: number;
  minTier: MinTier;
  contentPath: string;
  active: boolean;
  sourceId: number;
}

export interface PlannedProgress {
  userEmail: string;
  moduleSlug: string;
  lessonSlug: string;
  completedAt: Date;
}

export interface PlannedResource {
  slug: string;
  title: string;
  description: string | null;
  fileKey: string;
  minTier: MinTier;
  sort: number;
  active: boolean;
}

export interface PlannedUpdate {
  slug: string;
  title: string;
  minTier: MinTier;
  publishedAt: Date | null;
  contentPath: string;
}

export interface PlannedSubscriber {
  email: string;
  source: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  createdAt: Date;
  confirmedAt: Date | null;
}

export interface PlannedFile {
  /** Repo-relative, under `content/`. */
  path: string;
  contents: string;
}

export interface ImportPlan {
  users: PlannedUser[];
  providerCustomers: PlannedProviderCustomer[];
  purchases: PlannedPurchase[];
  subscriptions: PlannedSubscription[];
  modules: PlannedModule[];
  lessons: PlannedLesson[];
  lessonProgress: PlannedProgress[];
  resources: PlannedResource[];
  updatesPosts: PlannedUpdate[];
  subscribers: PlannedSubscriber[];
  files: PlannedFile[];
  warnings: string[];
}

/* ------------------------------------------------------------- conversion */

export const SUBSCRIBER_SOURCE = 'pararesi-import';

/** pararesi's tier vocabulary → ours (plan §1.12). */
export function mapTier(tier: PararesiUser['tier']): Tier {
  return tier === 'guide' ? 'entry' : tier === 'insider' ? 'insider' : 'none';
}

/** pararesi's `min_tier` → ours. `guide` was its entry tier. */
export function mapMinTier(minTier: 'guide' | 'insider'): MinTier {
  return minTier === 'guide' ? 'entry' : 'insider';
}

/** pararesi's `productKey` → a product slug here. */
export function mapProductSlug(productKey: string): string {
  return productKey === 'insider' ? GUIDE_INSIDER_SLUG : GUIDE_ENTRY_SLUG;
}

export function mapPurchaseStatus(status: string): 'pending' | 'paid' | 'refunded' {
  const value = String(status).toLowerCase();
  if (value === 'refunded') return 'refunded';
  if (value === 'paid' || value === 'active' || value === 'completed') return 'paid';
  return 'pending';
}

export function mapSubscriptionStatus(
  status: string,
): 'active' | 'past_due' | 'cancelled' | 'expired' | 'paused' {
  switch (String(status).toLowerCase()) {
    case 'active':
    case 'on_trial':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'cancelled':
      return 'cancelled';
    case 'paused':
      return 'paused';
    default:
      return 'expired';
  }
}

export type AmountUnit = 'cents' | 'dollars' | 'auto';

/**
 * pararesi's column is `amountUsd int`, and its name does not say whether it
 * holds 7 or 700 for a $7 order. Getting this wrong by 100× in either
 * direction is the worst possible import bug, so it is NOT guessed silently:
 *
 *  - `cents` / `dollars` force the reading (`PARARESI_AMOUNT_UNIT`);
 *  - `auto` treats anything under 100 as dollars, and every conversion the
 *    heuristic makes is reported in the plan's warnings so the dry run shows
 *    exactly what it decided before a real run touches anything.
 */
export function toCents(amount: number, unit: AmountUnit = 'auto'): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  if (unit === 'cents') return Math.round(amount);
  if (unit === 'dollars') return Math.round(amount * 100);
  return amount < 100 ? Math.round(amount * 100) : Math.round(amount);
}

export function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return slug || fallback;
}

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDay(value: Date | string | null | undefined, fallback: Date): string {
  return (asDate(value) ?? fallback).toISOString().slice(0, 10);
}

/** The frontmatter schema wants 20–200 characters; pad or trim to fit. */
function description(text: string | null, title: string): string {
  const raw = (text ?? '').replace(/\s+/g, ' ').trim();
  const body = raw || `${title.trim()} — imported from pararesi.`;
  if (body.length >= 20 && body.length <= 200) return body;
  if (body.length > 200) return `${body.slice(0, 197).trimEnd()}…`;
  return `${body} Imported from pararesi.`.slice(0, 200);
}

/**
 * Single-quoted YAML scalars for strings, bare literals for booleans. Quoting
 * a boolean would make `draft: 'true'` a string, which the frontmatter schema
 * rejects — an easy way to make every imported draft fail to parse.
 */
function yaml(value: string | boolean): string {
  if (typeof value === 'boolean') return String(value);
  return `'${value.replace(/'/g, "''")}'`;
}

export function mdx(frontmatter: Record<string, string | boolean>, body: string): string {
  const lines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${yaml(v)}`);
  return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`;
}

/* ------------------------------------------------------------------- plan */

export function buildImportPlan(
  source: PararesiData,
  options: { now?: Date; amountUnit?: AmountUnit } = {},
): ImportPlan {
  const now = options.now ?? new Date();
  const unit = options.amountUnit ?? 'auto';
  const warnings: string[] = [];

  /* users --------------------------------------------------------------- */
  const usersById = new Map<number, PararesiUser>();
  const users: PlannedUser[] = [];
  const seenEmails = new Set<string>();
  for (const row of source.users) {
    const email = row.email.trim().toLowerCase();
    if (!email) {
      warnings.push(`user ${row.id} has no email — skipped`);
      continue;
    }
    if (seenEmails.has(email)) {
      warnings.push(`user ${row.id} duplicates the email ${email} — skipped`);
      continue;
    }
    seenEmails.add(email);
    usersById.set(row.id, { ...row, email });
    users.push({
      email,
      name: row.name?.trim() || null,
      // The tier is recomputed from the imported rows afterwards anyway; this
      // is the starting value so a member is never locked out mid-import.
      tier: mapTier(row.tier),
      tierExpiresAt: asDate(row.tierExpiresAt),
      createdAt: asDate(row.createdAt) ?? now,
      sourceId: row.id,
    });
    if (row.role === 'admin') {
      // Staff access is granted here, deliberately, by hand — never inherited
      // from another app's user table.
      warnings.push(`user ${email} was an admin in pararesi; imported as a member`);
    }
  }

  const emailFor = (userId: number): string | null => usersById.get(userId)?.email ?? null;

  /* provider customers --------------------------------------------------- */
  const providerCustomers: PlannedProviderCustomer[] = [];
  for (const row of usersById.values()) {
    if (row.lsCustomerId) {
      providerCustomers.push({ userEmail: row.email, providerCustomerId: row.lsCustomerId });
    }
  }

  /* purchases ------------------------------------------------------------ */
  const purchases: PlannedPurchase[] = [];
  let heuristicUsed = 0;
  for (const row of source.purchases) {
    const email = emailFor(row.userId);
    if (!email) {
      warnings.push(`purchase ${row.lsOrderId} has no matching user — skipped`);
      continue;
    }
    if (unit === 'auto' && row.amountUsd > 0 && row.amountUsd < 100) heuristicUsed += 1;
    const status = mapPurchaseStatus(row.status);
    const createdAt = asDate(row.createdAt) ?? now;
    purchases.push({
      userEmail: email,
      productSlug: mapProductSlug(row.productKey),
      // The same id the live webhook writes — see the note at the top.
      providerCheckoutId: `ls_order_${row.lsOrderId}`,
      providerOrderId: row.lsOrderId,
      amountCents: toCents(row.amountUsd, unit),
      currency: 'USD',
      status,
      createdAt,
      paidAt: status === 'paid' ? createdAt : null,
    });
  }
  if (heuristicUsed > 0) {
    warnings.push(
      `${heuristicUsed} purchase amount(s) were under 100 and read as DOLLARS, not cents. ` +
        `Set PARARESI_AMOUNT_UNIT=cents or =dollars to decide this explicitly before the real run.`,
    );
  }

  /* subscriptions -------------------------------------------------------- */
  const subscriptions: PlannedSubscription[] = [];
  for (const row of source.subscriptions) {
    const email = emailFor(row.userId);
    if (!email) {
      warnings.push(`subscription ${row.lsSubscriptionId} has no matching user — skipped`);
      continue;
    }
    subscriptions.push({
      userEmail: email,
      productSlug: GUIDE_INSIDER_SLUG,
      providerSubscriptionId: row.lsSubscriptionId,
      status: mapSubscriptionStatus(row.status),
      currentPeriodEnd: asDate(row.renewsAt),
      endsAt: asDate(row.endsAt),
      createdAt: asDate(row.createdAt) ?? now,
    });
  }

  /* modules and lessons -------------------------------------------------- */
  const files: PlannedFile[] = [];
  const modulesById = new Map<number, PlannedModule>();
  const modules: PlannedModule[] = [];
  for (const row of source.modules) {
    const planned: PlannedModule = {
      slug: slugify(row.slug || row.title, `module-${row.id}`),
      title: row.title,
      description: row.description,
      sort: row.sortOrder,
      minTier: mapMinTier(row.minTier),
      active: row.status === 'published',
      sourceId: row.id,
    };
    modulesById.set(row.id, planned);
    modules.push(planned);
  }

  const lessonsById = new Map<number, PlannedLesson>();
  const lessons: PlannedLesson[] = [];
  for (const row of source.lessons) {
    const parent = modulesById.get(row.moduleId);
    if (!parent) {
      warnings.push(`lesson ${row.id} ("${row.title}") has no module — skipped`);
      continue;
    }
    const slug = slugify(row.slug || row.title, `lesson-${row.id}`);
    const contentPath = `guide/members/${parent.slug}/${slug}.mdx`;
    const planned: PlannedLesson = {
      moduleSlug: parent.slug,
      slug,
      title: row.title,
      sort: row.sortOrder,
      // pararesi gated lessons at the module; a lesson inherits its module.
      minTier: parent.minTier,
      contentPath,
      active: row.status === 'published',
      sourceId: row.id,
    };
    lessonsById.set(row.id, planned);
    lessons.push(planned);

    const body = row.videoUrl
      ? `${row.contentMd.trim()}\n\n[Watch the video](${row.videoUrl})\n`
      : row.contentMd;
    files.push({
      path: contentPath,
      contents: mdx(
        {
          title: row.title,
          description: description(null, row.title),
          site: 'guide',
          hub: 'members',
          publishedAt: isoDay(null, now),
        },
        body,
      ),
    });
  }

  /* progress -------------------------------------------------------------- */
  const lessonProgress: PlannedProgress[] = [];
  for (const row of source.lessonProgress) {
    const email = emailFor(row.userId);
    const lesson = lessonsById.get(row.lessonId);
    if (!email || !lesson) continue;
    lessonProgress.push({
      userEmail: email,
      moduleSlug: lesson.moduleSlug,
      lessonSlug: lesson.slug,
      completedAt: asDate(row.completedAt) ?? now,
    });
  }

  /* resources ------------------------------------------------------------- */
  const resources: PlannedResource[] = source.resources.map((row) => ({
    slug: slugify(row.title, `resource-${row.id}`),
    title: row.title,
    description: row.description,
    fileKey: row.fileUrl,
    minTier: mapMinTier(row.minTier),
    sort: row.sortOrder,
    active: row.status === 'published',
  }));

  /* updates --------------------------------------------------------------- */
  const updatesPosts: PlannedUpdate[] = [];
  for (const row of source.updatesPosts) {
    const slug = slugify(row.title, `update-${row.id}`);
    const contentPath = `guide/updates/${slug}.mdx`;
    updatesPosts.push({
      slug,
      title: row.title,
      minTier: mapMinTier(row.minTier),
      publishedAt: asDate(row.publishedAt),
      contentPath,
    });
    files.push({
      path: contentPath,
      contents: mdx(
        {
          title: row.title,
          description: description(null, row.title),
          site: 'guide',
          hub: 'updates',
          publishedAt: isoDay(row.publishedAt, now),
        },
        row.contentMd,
      ),
    });
  }

  /* blog — MDX only, never a table (plan §1.4) ---------------------------- */
  for (const row of source.blogPosts) {
    const slug = slugify(row.slug || row.title, `post-${row.id}`);
    files.push({
      path: `guide/blog/${slug}.mdx`,
      contents: mdx(
        {
          title: row.metaTitle?.trim() || row.title,
          description: description(row.metaDescription ?? row.excerpt, row.title),
          site: 'guide',
          hub: 'blog',
          publishedAt: isoDay(row.publishedAt, now),
          ...(row.status === 'published' ? {} : { draft: true }),
        },
        row.contentMd,
      ),
    });
  }

  /* leads → subscribers --------------------------------------------------- */
  const subscribers: PlannedSubscriber[] = [];
  const seenSubscribers = new Set<string>();
  for (const row of source.leads) {
    const email = row.email.trim().toLowerCase();
    if (!email || seenSubscribers.has(email)) continue;
    seenSubscribers.add(email);
    subscribers.push({
      email,
      source: SUBSCRIBER_SOURCE,
      status: row.unsubscribedAt ? 'unsubscribed' : row.confirmedAt ? 'confirmed' : 'pending',
      createdAt: asDate(row.createdAt) ?? now,
      confirmedAt: asDate(row.confirmedAt),
    });
  }

  return {
    users,
    providerCustomers,
    purchases,
    subscriptions,
    modules,
    lessons,
    lessonProgress,
    resources,
    updatesPosts,
    subscribers,
    files,
    warnings,
  };
}

/** One line per table, for the `--dry-run` report. */
export function summarise(plan: ImportPlan): Record<string, number> {
  return {
    users: plan.users.length,
    provider_customers: plan.providerCustomers.length,
    purchases: plan.purchases.length,
    subscriptions: plan.subscriptions.length,
    modules: plan.modules.length,
    lessons: plan.lessons.length,
    lesson_progress: plan.lessonProgress.length,
    resources: plan.resources.length,
    updates_posts: plan.updatesPosts.length,
    subscribers: plan.subscribers.length,
    mdx_files: plan.files.length,
  };
}

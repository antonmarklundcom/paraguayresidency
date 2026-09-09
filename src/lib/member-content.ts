import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { and, asc, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import {
  lessonProgress,
  lessons,
  modules,
  resources,
  updatesPosts,
  type Lesson,
  type Module,
  type Resource,
  type Tier,
  type UpdatesPost,
} from '@/db/schema';
import { hasTier, isDripped, isUnlocked } from './entitlements';
import type { SiteKey } from '@/sites/registry';

/**
 * Read-side queries for the member area (plan §6.9).
 *
 * O9 built the tier/drip RULES (`entitlements.ts`) and the tables; nothing in
 * O9 or O2 queried `modules`/`lessons`/`resources`/`updates_posts` yet — S14
 * is the first phase that needs to, so this file exists to do exactly that
 * and nothing more. It never re-implements a rule `entitlements.ts` already
 * owns: every locked/dripped/open decision below calls `hasTier`/`isDripped`/
 * `isUnlocked` rather than repeating their logic.
 */

const CONTENT_ROOT = join(process.cwd(), 'content');

/* --------------------------------------------------------------- modules */

export type ModuleState = 'locked' | 'dripped' | 'open';

export interface LessonCard {
  lesson: Lesson;
  /** Own tier+drip gate, independent of the module's (a lesson can drip later
   * than its module unlocks, e.g. the Insider deep dives). */
  unlocked: boolean;
  completed: boolean;
}

export interface ModuleCard {
  module: Module;
  state: ModuleState;
  /** Only set when `state === 'dripped'`. */
  opensAt: Date | null;
  lessons: LessonCard[];
  lessonCount: number;
  completedCount: number;
}

async function modulesForSite(site: SiteKey): Promise<Module[]> {
  if (!hasDatabase()) return [];
  // `site = null` on these tables means "every brand" (plan §2's table).
  return getDb()
    .select()
    .from(modules)
    .where(and(or(eq(modules.site, site), isNull(modules.site)), eq(modules.active, true)))
    .orderBy(asc(modules.sort), asc(modules.id));
}

async function lessonsForModules(moduleIds: number[]): Promise<Lesson[]> {
  if (!hasDatabase() || moduleIds.length === 0) return [];
  return getDb()
    .select()
    .from(lessons)
    .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.active, true)))
    .orderBy(asc(lessons.sort), asc(lessons.id));
}

async function completedLessonIds(userId: number, lessonIds: number[]): Promise<Set<number>> {
  if (!hasDatabase() || lessonIds.length === 0) return new Set();
  const rows = await getDb()
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)));
  return new Set(rows.map((r) => r.lessonId));
}

function moduleOpensAt(module: Module, firstEntitledAt: Date | null): Date | null {
  if (module.dripDays <= 0 || !firstEntitledAt) return null;
  return new Date(firstEntitledAt.getTime() + module.dripDays * 24 * 60 * 60 * 1000);
}

/** The `/members` dashboard: every module in order, with its rolled-up state. */
export async function memberDashboard(input: {
  site: SiteKey;
  userId: number;
  tier: Tier;
  firstEntitledAt: Date | null;
  now?: Date;
}): Promise<ModuleCard[]> {
  const now = input.now ?? new Date();
  const mods = await modulesForSite(input.site);
  if (!mods.length) return [];

  const allLessons = await lessonsForModules(mods.map((m) => m.id));
  const completed = await completedLessonIds(
    input.userId,
    allLessons.map((l) => l.id),
  );
  const lessonsByModule = new Map<number, Lesson[]>();
  for (const lesson of allLessons) {
    const list = lessonsByModule.get(lesson.moduleId) ?? [];
    list.push(lesson);
    lessonsByModule.set(lesson.moduleId, list);
  }

  return mods.map((module) => {
    const moduleLessons = lessonsByModule.get(module.id) ?? [];
    const state: ModuleState = !hasTier(input.tier, module.minTier)
      ? 'locked'
      : isDripped(module, input.firstEntitledAt, now)
        ? 'open'
        : 'dripped';
    const lessonCards: LessonCard[] = moduleLessons.map((lesson) => ({
      lesson,
      unlocked: state !== 'locked' && isUnlocked(lesson, input.tier, input.firstEntitledAt, now),
      completed: completed.has(lesson.id),
    }));
    return {
      module,
      state,
      opensAt: state === 'dripped' ? moduleOpensAt(module, input.firstEntitledAt) : null,
      lessons: lessonCards,
      lessonCount: moduleLessons.length,
      completedCount: moduleLessons.filter((l) => completed.has(l.id)).length,
    };
  });
}

/** The first not-yet-completed unlocked lesson, for "continue where you left off". */
export function continueLesson(
  cards: ModuleCard[],
): { moduleSlug: string; lessonSlug: string; title: string } | null {
  for (const card of cards) {
    if (card.state !== 'open') continue;
    const next = card.lessons.find((l) => l.unlocked && !l.completed);
    if (next) return { moduleSlug: card.module.slug, lessonSlug: next.lesson.slug, title: next.lesson.title };
  }
  return null;
}

/* ---------------------------------------------------------------- lesson */

export interface LessonView {
  module: Module;
  lesson: Lesson;
  prev: Lesson | null;
  next: Lesson | null;
  unlocked: boolean;
  /** Why it is locked, when it is — the page never leaks the body either way. */
  reason: 'tier' | 'drip' | null;
  opensAt: Date | null;
  completed: boolean;
  body: string | null;
}

/** One lesson, its module, siblings for prev/next, and the gate decision. */
export async function lessonView(input: {
  site: SiteKey;
  moduleSlug: string;
  lessonSlug: string;
  userId: number;
  tier: Tier;
  firstEntitledAt: Date | null;
  now?: Date;
}): Promise<LessonView | null> {
  if (!hasDatabase()) return null;
  const now = input.now ?? new Date();
  const db = getDb();

  const [module] = await db
    .select()
    .from(modules)
    .where(and(or(eq(modules.site, input.site), isNull(modules.site)), eq(modules.slug, input.moduleSlug), eq(modules.active, true)))
    .limit(1);
  if (!module) return null;

  const siblings = await lessonsForModules([module.id]);
  const index = siblings.findIndex((l) => l.slug === input.lessonSlug);
  if (index === -1) return null;
  const lesson = siblings[index];

  const tierOk = hasTier(input.tier, lesson.minTier);
  const dripped = isDripped(lesson, input.firstEntitledAt, now);
  const unlocked = isUnlocked(lesson, input.tier, input.firstEntitledAt, now);
  const opensAt =
    !tierOk || dripped || lesson.dripDays <= 0 || !input.firstEntitledAt
      ? null
      : new Date(input.firstEntitledAt.getTime() + lesson.dripDays * 24 * 60 * 60 * 1000);

  const completedSet = await completedLessonIds(input.userId, [lesson.id]);

  return {
    module,
    lesson,
    prev: siblings[index - 1] ?? null,
    next: siblings[index + 1] ?? null,
    unlocked,
    reason: unlocked ? null : !tierOk ? 'tier' : 'drip',
    opensAt,
    completed: completedSet.has(lesson.id),
    // The body is read from disk ONLY once the gate above says yes — an
    // under-tier or not-yet-dripped request never touches the file (plan
    // §6.9 exit: "check the server response, not just the UI").
    body: unlocked ? readMdxBody(lesson.contentPath) : null,
  };
}

export async function markLessonComplete(userId: number, lessonId: number): Promise<void> {
  if (!hasDatabase()) return;
  await getDb()
    .insert(lessonProgress)
    .values({ userId, lessonId })
    .onDuplicateKeyUpdate({ set: { completedAt: sql`completed_at` } });
}

/* -------------------------------------------------------------- updates */

/** Insider's monthly changelog (plan §11.3 "what changes monthly"). */
export async function updatesForSite(
  site: SiteKey,
  limit?: number,
): Promise<UpdatesPost[]> {
  if (!hasDatabase()) return [];
  const query = getDb()
    .select()
    .from(updatesPosts)
    .where(or(eq(updatesPosts.site, site), isNull(updatesPosts.site)))
    .orderBy(desc(updatesPosts.publishedAt), desc(updatesPosts.id));
  return limit ? query.limit(limit) : query;
}

export async function updateBySlug(site: SiteKey, slug: string): Promise<UpdatesPost | null> {
  if (!hasDatabase()) return null;
  const [row] = await getDb()
    .select()
    .from(updatesPosts)
    .where(and(or(eq(updatesPosts.site, site), isNull(updatesPosts.site)), eq(updatesPosts.slug, slug)))
    .limit(1);
  return row ?? null;
}

export function updateBody(post: UpdatesPost): string | null {
  return readMdxBody(post.contentPath);
}

/* ------------------------------------------------------------- resources */

export async function resourcesForSite(site: SiteKey): Promise<Resource[]> {
  if (!hasDatabase()) return [];
  return getDb()
    .select()
    .from(resources)
    .where(and(or(eq(resources.site, site), isNull(resources.site)), eq(resources.active, true)))
    .orderBy(asc(resources.sort), asc(resources.id));
}

export async function resourceBySlug(site: SiteKey, slug: string): Promise<Resource | null> {
  if (!hasDatabase()) return null;
  const [row] = await getDb()
    .select()
    .from(resources)
    .where(and(or(eq(resources.site, site), isNull(resources.site)), eq(resources.slug, slug), eq(resources.active, true)))
    .limit(1);
  return row ?? null;
}

/* -------------------------------------------------------------------- mdx */

/**
 * Reads member MDX by DB-stored `content_path` (repo-relative to `content/`,
 * e.g. `guide/members/getting-started/why-paraguay.mdx`) — never through
 * `getPage`/`getPages`, which refuse the `members`/`updates` hubs on purpose
 * (plan §1.14, `src/content/index.ts`). Strips frontmatter; the page owns
 * title/description separately from the DB row, matching how the `<Mdx>`
 * component already renders public article bodies.
 */
function readMdxBody(contentPath: string | null): string | null {
  if (!contentPath) return null;
  const safe = contentPath.replace(/^\/+/, '');
  if (safe.includes('..') || !safe.endsWith('.mdx')) return null;
  const file = join(CONTENT_ROOT, safe);
  if (!file.startsWith(CONTENT_ROOT) || !existsSync(file)) return null;
  const raw = readFileSync(file, 'utf8');
  return matter(raw).content;
}

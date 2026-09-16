import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lessonProgress, lessons, modules, resources, updatesPosts } from '@/db/schema';

/**
 * Codex repo-audit finding #14 (2026-09-16): direct lesson access and the
 * dashboard could show a lesson as unlocked while its parent module was
 * still locked or dripped, because both only checked the lesson's own
 * tier/drip gate. This file is the regression coverage for that fix, plus
 * general query/gate coverage `member-content.ts` had none of before.
 *
 * The mock below is deliberately simple: `.where()`/`.orderBy()` are no-ops
 * and each test supplies rows already shaped as if the real query had
 * filtered them — this tests the gating LOGIC in member-content.ts, not
 * drizzle's SQL generation (that is `webhook-live-db.test.ts`'s job
 * elsewhere, against a real database).
 */

const state = {
  hasDb: true,
  modules: [] as (typeof modules.$inferSelect)[],
  lessons: [] as (typeof lessons.$inferSelect)[],
  progress: [] as { lessonId: number }[],
  fail: false,
};

function chain<T>(rows: T[]) {
  const builder: PromiseLike<T[]> & { where: () => typeof builder; orderBy: () => typeof builder; limit: (n: number) => typeof builder } = {
    where: () => builder,
    orderBy: () => builder,
    limit: (n: number) => chain(rows.slice(0, n)) as typeof builder,
    then: (resolve, reject) => {
      if (state.fail) return Promise.reject(new Error('ECONNRESET')).then(resolve, reject);
      return Promise.resolve(rows).then(resolve, reject);
    },
  };
  return builder;
}

vi.mock('@/db', () => ({
  hasDatabase: () => state.hasDb,
  getDb: () => ({
    select: (proj?: Record<string, unknown>) => ({
      from: (table: unknown) => {
        if (table === modules) return chain(state.modules);
        if (table === lessons) return chain(state.lessons);
        if (table === lessonProgress) {
          if (proj) return chain(state.progress);
          return chain([]);
        }
        if (table === updatesPosts) return chain([]);
        if (table === resources) return chain([]);
        return chain([]);
      },
    }),
    insert: () => ({ values: () => ({ onDuplicateKeyUpdate: () => Promise.resolve() }) }),
  }),
}));

const { lessonView, memberDashboard } = await import('@/lib/member-content');

const NOW = new Date('2026-09-16T12:00:00Z');
const ENTITLED = new Date('2026-09-01T12:00:00Z'); // 15 days before NOW

const mod = (over: Partial<typeof modules.$inferSelect> = {}) =>
  ({
    id: 1,
    site: 'guide',
    slug: 'getting-started',
    title: 'Getting started',
    description: null,
    sort: 0,
    minTier: 'entry',
    dripDays: 0,
    active: true,
    createdAt: NOW,
    ...over,
  }) as typeof modules.$inferSelect;

const lesson = (over: Partial<typeof lessons.$inferSelect> = {}) =>
  ({
    id: 10,
    moduleId: 1,
    slug: 'why-paraguay',
    title: 'Why Paraguay',
    sort: 0,
    minTier: 'entry',
    dripDays: 0,
    contentPath: null,
    active: true,
    createdAt: NOW,
    ...over,
  }) as typeof lessons.$inferSelect;

beforeEach(() => {
  state.hasDb = true;
  state.fail = false;
  state.modules = [];
  state.lessons = [];
  state.progress = [];
});

describe('memberDashboard — module/lesson gate (finding #14)', () => {
  it('never marks a lesson unlocked while its module is still dripping, even if the lesson itself has no drip', async () => {
    state.modules = [mod({ dripDays: 30 })]; // opens day 30, we are on day 15 — still dripped
    state.lessons = [lesson({ dripDays: 0 })]; // lesson itself has no drip of its own

    const cards = await memberDashboard({
      site: 'guide',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(cards[0].state).toBe('dripped');
    expect(cards[0].lessons[0].unlocked).toBe(false);
  });

  it('unlocks a lesson once its open module and its own gate both pass', async () => {
    state.modules = [mod({ dripDays: 0 })];
    state.lessons = [lesson({ dripDays: 0 })];

    const cards = await memberDashboard({
      site: 'guide',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(cards[0].state).toBe('open');
    expect(cards[0].lessons[0].unlocked).toBe(true);
  });

  it('locks every lesson in a module the member\'s tier does not reach', async () => {
    state.modules = [mod({ minTier: 'insider' })];
    state.lessons = [lesson({ minTier: 'entry' })]; // lesson alone would be fine for 'entry'

    const cards = await memberDashboard({
      site: 'guide',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(cards[0].state).toBe('locked');
    expect(cards[0].lessons[0].unlocked).toBe(false);
  });
});

describe('lessonView — direct URL access respects the parent module gate (finding #14)', () => {
  it('refuses direct access to a lesson whose module is still dripping', async () => {
    state.modules = [mod({ dripDays: 30 })];
    state.lessons = [lesson({ dripDays: 0 })];

    const view = await lessonView({
      site: 'guide',
      moduleSlug: 'getting-started',
      lessonSlug: 'why-paraguay',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(view).not.toBeNull();
    expect(view?.unlocked).toBe(false);
    expect(view?.reason).toBe('drip');
    expect(view?.body).toBeNull();
  });

  it('refuses direct access to a lesson whose module is above the member\'s tier', async () => {
    state.modules = [mod({ minTier: 'insider' })];
    state.lessons = [lesson({ minTier: 'entry' })];

    const view = await lessonView({
      site: 'guide',
      moduleSlug: 'getting-started',
      lessonSlug: 'why-paraguay',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(view?.unlocked).toBe(false);
    expect(view?.reason).toBe('tier');
  });

  it('allows access once both the module and the lesson are open', async () => {
    state.modules = [mod()];
    state.lessons = [lesson()];

    const view = await lessonView({
      site: 'guide',
      moduleSlug: 'getting-started',
      lessonSlug: 'why-paraguay',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(view?.unlocked).toBe(true);
    expect(view?.reason).toBeNull();
  });

  it('returns null for a lesson slug that does not exist under the module', async () => {
    state.modules = [mod()];
    state.lessons = [lesson()];

    const view = await lessonView({
      site: 'guide',
      moduleSlug: 'getting-started',
      lessonSlug: 'nope',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });

    expect(view).toBeNull();
  });
});

describe('member-content — degrades safely without a database', () => {
  it('memberDashboard returns an empty list when there is no database', async () => {
    state.hasDb = false;
    const cards = await memberDashboard({
      site: 'guide',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });
    expect(cards).toEqual([]);
  });

  it('lessonView returns null when there is no database', async () => {
    state.hasDb = false;
    const view = await lessonView({
      site: 'guide',
      moduleSlug: 'getting-started',
      lessonSlug: 'why-paraguay',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });
    expect(view).toBeNull();
  });

  it('memberDashboard degrades to an empty list when a query throws (safeQuery)', async () => {
    state.fail = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const cards = await memberDashboard({
      site: 'guide',
      userId: 1,
      tier: 'entry',
      firstEntitledAt: ENTITLED,
      now: NOW,
    });
    expect(cards).toEqual([]);
    vi.restoreAllMocks();
  });
});
